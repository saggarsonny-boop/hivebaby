"""
Issue Fixer — Schema Violation Auto-Repair
Triggered by issue-fixer.yml when a schema-violation issue is opened.
Reads the violation details, fetches the offending file, calls Claude to
fix it, pushes the fix, then comments on and closes the issue.
Requires: GITHUB_TOKEN (hivebaby issues), GH_PAT (cross-repo writes), ANTHROPIC_API_KEY.
"""

import base64
import json
import os
import re
import urllib.error
import urllib.request

# -- Config -------------------------------------------------------------------

GITHUB_TOKEN   = os.environ["GITHUB_TOKEN"]
GH_PAT         = os.environ.get("GH_PAT", "")
ANTHROPIC_KEY  = os.environ["ANTHROPIC_API_KEY"]
HIVEBABY_REPO  = os.environ.get("GITHUB_REPOSITORY", "saggarsonny-boop/hivebaby")
ISSUE_NUMBER   = int(os.environ["ISSUE_NUMBER"])
ISSUE_BODY     = os.environ.get("ISSUE_BODY", "")
GITHUB_API     = "https://api.github.com"
CLAUDE_MODEL   = "claude-opus-4-5"

# Map route name → (owner/repo, file path) — matches schema-sheriff.yml check_route calls
ROUTE_FILES: dict[str, tuple[str, str]] = {
    "pharmacy":              ("saggarsonny-boop/universal-document", "apps/utilities/src/app/api/pharmacy/route.ts"),
    "translate":             ("saggarsonny-boop/universal-document", "apps/utilities/src/app/api/translate/route.ts"),
    "contract-intelligence": ("saggarsonny-boop/universal-document", "apps/utilities/src/app/api/contract-intelligence/route.ts"),
    "emr-export":            ("saggarsonny-boop/universal-document", "apps/utilities/src/app/api/emr-export/route.ts"),
    "converter":             ("saggarsonny-boop/universal-document", "apps/converter/src/lib/convert.ts"),
}

FIX_SYSTEM_PROMPT = """\
You are a TypeScript/Next.js expert fixing a UDS schema compliance violation.

The schema-sheriff.yml workflow checks source files with grep for:
1. Top-level field names: ud_version, state, metadata, manifest, blocks, seal
2. UDS state string: the literal 'UDS' or "UDS" must appear in the file
3. Metadata sub-field names: title, created_at, document_type

These are STATIC grep checks on the source code — the strings must appear literally.

Fix the file so it passes all checks:
- Where the output document state is assigned, use the literal string 'UDS'
- Add explicit validation that input/output metadata contains title, created_at, document_type
- Do not change the business logic or break existing functionality
- Keep the same code style and formatting

Output ONLY the complete fixed TypeScript file. No explanation. No markdown. No code fences.\
"""

# -- GitHub helpers -----------------------------------------------------------

def gh_request(method: str, path: str, body: dict | None = None, token: str = "") -> dict:
    url  = f"{GITHUB_API}{path}"
    data = json.dumps(body).encode() if body else None
    req  = urllib.request.Request(
        url, data=data, method=method,
        headers={
            "Authorization":        f"Bearer {token or GITHUB_TOKEN}",
            "Accept":               "application/vnd.github+json",
            "Content-Type":         "application/json",
            "User-Agent":           "HiveBot/1.0",
            "X-GitHub-Api-Version": "2022-11-28",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body_text = e.read().decode(errors="replace")[:300]
        print(f"  GitHub {e.code} on {method} {path}: {body_text}")
        return {"_error": e.code, "_body": body_text}


def get_file(repo: str, path: str) -> tuple[str, str]:
    """Returns (decoded_content, sha). Empty strings on failure."""
    result = gh_request("GET", f"/repos/{repo}/contents/{path}", token=GH_PAT or GITHUB_TOKEN)
    if "_error" in result:
        return "", ""
    content = base64.b64decode(result["content"]).decode()
    return content, result["sha"]


def put_file(repo: str, path: str, content: str, sha: str, message: str) -> str:
    """Push updated file. Returns commit URL or empty string."""
    result = gh_request(
        "PUT", f"/repos/{repo}/contents/{path}",
        body={
            "message": message,
            "content": base64.b64encode(content.encode()).decode(),
            "sha":     sha,
        },
        token=GH_PAT,
    )
    return result.get("commit", {}).get("html_url", "")


def comment_issue(body: str) -> None:
    gh_request("POST", f"/repos/{HIVEBABY_REPO}/issues/{ISSUE_NUMBER}/comments", {"body": body})


def close_issue(reason: str = "completed") -> None:
    gh_request("PATCH", f"/repos/{HIVEBABY_REPO}/issues/{ISSUE_NUMBER}",
               {"state": "closed", "state_reason": reason})


# -- Claude helper ------------------------------------------------------------

def call_claude(file_content: str, path: str, violations: str) -> str:
    """Returns fixed file content, or empty string on failure."""
    payload = json.dumps({
        "model":      CLAUDE_MODEL,
        "max_tokens": 8192,
        "system":     FIX_SYSTEM_PROMPT,
        "messages":   [{
            "role":    "user",
            "content": (
                f"File: {path}\n\nViolations:\n{violations}\n\n"
                f"Current file content:\n{file_content}"
            ),
        }],
    }).encode()

    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=payload,
        method="POST",
        headers={
            "x-api-key":         ANTHROPIC_KEY,
            "anthropic-version": "2023-06-01",
            "content-type":      "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            data = json.loads(resp.read())
            return data["content"][0]["text"].strip()
    except Exception as e:
        print(f"  Claude error: {e}")
        return ""


# -- Violation parser ---------------------------------------------------------

def parse_violations(body: str) -> dict[str, list[str]]:
    """
    Returns {route_name: [violation_line, ...]} from an issue body like:
    '**translate** — does not produce UDS (Sealed) state'
    """
    result: dict[str, list[str]] = {}
    for line in body.splitlines():
        m = re.match(r"\*\*([\w-]+)\*\*\s*[—-]\s*(.+)", line.strip())
        if m:
            route, detail = m.group(1), m.group(2).strip()
            result.setdefault(route, []).append(detail)
    return result


# -- Main ---------------------------------------------------------------------

def main() -> None:
    print(f"Issue Fixer starting — issue #{ISSUE_NUMBER}")

    if not GH_PAT:
        msg = (
            "**Auto-fix skipped** — `GH_PAT` secret not set in hivebaby Actions secrets.\n\n"
            "**Why this is needed:** the schema violations live in `saggarsonny-boop/universal-document`. "
            "The default `GITHUB_TOKEN` issued to this Action is scoped to `hivebaby` only and cannot "
            "push to a different repo, so the auto-fix needs a Personal Access Token.\n\n"
            "**To enable auto-fix:**\n"
            "1. Create a PAT — either:\n"
            "   - **Classic** with `repo` scope, or\n"
            "   - **Fine-grained** with Contents:Write on `saggarsonny-boop/universal-document` "
            "(more secure, recommended).\n"
            "2. Add it as repo secret `GH_PAT` at "
            "Settings → Secrets and variables → Actions → New repository secret.\n\n"
            "**For now:** apply the fix manually, then close this issue."
        )
        comment_issue(msg)
        print("GH_PAT not set — commented on issue and exiting")
        return

    violations = parse_violations(ISSUE_BODY)
    if not violations:
        print("No parseable violations found in issue body — skipping")
        return

    print(f"  Violations found for routes: {list(violations.keys())}")

    fixed_routes:  list[str] = []
    failed_routes: list[str] = []

    for route, details in violations.items():
        if route not in ROUTE_FILES:
            print(f"  No file mapping for route '{route}' — skipping")
            continue

        repo, path = ROUTE_FILES[route]
        print(f"  Fetching {repo}/{path} ...")
        content, sha = get_file(repo, path)

        if not content:
            print(f"  Could not fetch file for route '{route}'")
            failed_routes.append(route)
            continue

        violation_text = "\n".join(f"- {d}" for d in details)
        print(f"  Calling Claude to fix {path} ...")
        fixed = call_claude(content, path, violation_text)

        if not fixed or fixed == content:
            print(f"  Claude returned no change for '{route}'")
            failed_routes.append(route)
            continue

        commit_msg = f"Auto-fix schema violation: {route} route\n\nViolations addressed:\n{violation_text}"
        commit_url = put_file(repo, path, fixed, sha, commit_msg)

        if commit_url:
            print(f"  Fixed: {commit_url}")
            fixed_routes.append(f"`{route}` — [{path}]({commit_url})")
        else:
            print(f"  Push failed for '{route}'")
            failed_routes.append(route)

    # Post comment and close/leave open
    if fixed_routes and not failed_routes:
        body_parts = ["**Auto-fix applied** by `issue-fixer.yml`.\n"]
        body_parts.append("Routes fixed:")
        body_parts.extend(f"- {r}" for r in fixed_routes)
        body_parts.append("\nSchema-sheriff will confirm on its next run. Closing issue.")
        comment_issue("\n".join(body_parts))
        close_issue("completed")
        print("All routes fixed — issue closed")
    elif fixed_routes:
        body_parts = ["**Partial auto-fix applied** by `issue-fixer.yml`.\n"]
        body_parts.append("Fixed:")
        body_parts.extend(f"- {r}" for r in fixed_routes)
        body_parts.append("\nCould not auto-fix:")
        body_parts.extend(f"- `{r}`" for r in failed_routes)
        body_parts.append("\nNeeds manual attention for remaining violations.")
        comment_issue("\n".join(body_parts))
        print("Partial fix — issue left open")
    else:
        comment_issue(
            "**Auto-fix failed** — Claude could not generate a valid fix for the reported violations. "
            "Needs manual intervention."
        )
        print("No routes fixed — issue left open")


if __name__ == "__main__":
    main()
