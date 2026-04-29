"""
Reddit Monitor -- Hive Lead Finder
Runs daily from GitHub Actions. Finds Reddit threads matching Hive engine
keywords and creates one GitHub issue per match with a pre-drafted reply.
Zero posting automation -- Sonny posts manually. No Reddit auth needed.
"""

import json
import os
import time
import urllib.request
import urllib.parse
import urllib.error

# -- Configuration ------------------------------------------------------------

GITHUB_TOKEN = os.environ["GITHUB_TOKEN"]
GITHUB_REPO  = os.environ.get("GITHUB_REPOSITORY", "saggarsonny-boop/hivebaby")
GITHUB_API   = "https://api.github.com"
REDDIT_UA    = "HiveBot/1.0 (github.com/saggarsonny-boop/hivebaby; ops bot -- read-only)"

# -- Engine map ---------------------------------------------------------------
# Each engine: url, label, subreddits, keywords, why, reply

ENGINES = {
    "HiveMoon": {
        "url":        "https://hivemoon.hive.baby",
        "label":      "HiveMoon",
        "subreddits": ["sleep", "mentalhealth", "selfimprovement", "women", "pcos"],
        "keywords":   ["moon phase", "lunar cycle mood", "full moon sleep", "moon affect"],
        "why":        "HiveMoon tracks moon phases and lets users log mood and energy through the lunar cycle to spot personal patterns over time.",
        "reply":      (
            "There's a free tool called HiveMoon that does exactly this -- "
            "you log your mood and energy each day and it overlays your entries on the current lunar cycle so you can spot your own patterns over time. "
            "No sign-up required: https://hivemoon.hive.baby"
        ),
    },
    "HiveField": {
        "url":        "https://hivefield.hive.baby",
        "label":      "HiveField",
        "subreddits": ["nursing", "medicine", "emergencymedicine", "Residency", "medicalschool"],
        "keywords":   ["clinical scenario", "patient case", "OSCE practice", "clinical reasoning"],
        "why":        "HiveField generates realistic clinical scenarios on demand for healthcare professionals -- useful for OSCE prep, handover practice, and self-directed reasoning training.",
        "reply":      (
            "HiveField generates clinical scenarios on demand -- you tell it your role and it builds a realistic patient case for you to work through, including vitals, history, and follow-up curveballs. "
            "Good for OSCE prep or keeping your reasoning sharp between shifts. "
            "Free at https://hivefield.hive.baby"
        ),
    },
    "HiveClock": {
        "url":        "https://hiveclock.hive.baby",
        "label":      "HiveClock",
        "subreddits": ["productivity", "ADHD", "timemanagement", "GetDisciplined"],
        "keywords":   ["time management tool", "schedule help", "productivity app", "ADHD time"],
        "why":        "HiveClock is a scheduling AI that helps with time management -- particularly useful for people who struggle with estimating task duration or maintaining consistent routines.",
        "reply":      (
            "HiveClock might help here -- it's an AI scheduling tool that takes your tasks and helps you build a realistic time plan, "
            "which can be really useful when time estimation is the hard part. "
            "Worth a try: https://hiveclock.hive.baby"
        ),
    },
    "HiveClarity": {
        "url":        "https://hiveclarity.hive.baby",
        "label":      "HiveClarity",
        "subreddits": ["communication", "writing", "managers", "work", "careerguidance"],
        "keywords":   ["how to word", "how to say", "difficult conversation", "email wording"],
        "why":        "HiveClarity helps users find the right words for difficult or sensitive communications -- emails, conversations, feedback, and more.",
        "reply":      (
            "HiveClarity is built for exactly this -- you describe the situation and what you want to say, "
            "and it helps you find phrasing that's honest without being inflammatory. "
            "Free to use: https://hiveclarity.hive.baby"
        ),
    },
    "HiveStrength": {
        "url":        "https://hivestrength.hive.baby",
        "label":      "HiveStrength",
        "subreddits": ["weightlifting", "Fitness", "powerlifting", "bodybuilding", "gainit"],
        "keywords":   ["squat plateau", "bench plateau", "stuck on weight", "strength plateau", "training plateau"],
        "why":        "HiveStrength diagnoses strength plateaus and gives a specific protocol to break through -- based on training history, not generic advice.",
        "reply":      (
            "HiveStrength is a free tool that specifically addresses plateaus -- you give it your lift, current weight, how long you've been stuck, and your training context, "
            "and it gives you a protocol rather than a generic 'deload and eat more.' "
            "https://hivestrength.hive.baby"
        ),
    },
    "HiveBodyLog": {
        "url":        "https://hivebodylog.hive.baby",
        "label":      "HiveBodyLog",
        "subreddits": ["HealthAnxiety", "chronicillness", "AskDocs", "fatigue", "ibs"],
        "keywords":   ["track symptoms", "symptom diary", "health log", "symptom pattern"],
        "why":        "HiveBodyLog helps users log symptoms and spot patterns over time -- useful for chronic conditions, pre-appointment summaries, and identifying triggers.",
        "reply":      (
            "HiveBodyLog is designed for this -- you describe your symptoms in plain language and it structures them into a log you can actually review and share with a doctor. "
            "Good for spotting patterns across weeks. "
            "Free at https://hivebodylog.hive.baby"
        ),
    },
    "WhoTextedMe": {
        "url":        "https://whotextedme.hive.baby",
        "label":      "WhoTextedMe",
        "subreddits": ["Scams", "personalfinance", "mildlyinfuriating", "NoStupidQuestions"],
        "keywords":   ["unknown number", "who texted me", "random text", "spam text"],
        "why":        "WhoTextedMe helps identify unknown numbers and suspicious texts -- useful for spotting scams or figuring out who messaged you.",
        "reply":      (
            "WhoTextedMe is a free tool for exactly this -- paste the number or the text content and it analyses it for known scam patterns and tries to identify the source. "
            "https://whotextedme.hive.baby"
        ),
    },
    "HivePhoto": {
        "url":        "https://hivephoto.hive.baby",
        "label":      "HivePhoto",
        "subreddits": ["photographie", "editing", "mobilePhotography", "AskPhotography"],
        "keywords":   ["photo enhancement", "improve photo quality", "AI photo"],
        "why":        "HivePhoto uses AI to enhance photo quality -- sharpness, lighting, resolution -- without requiring desktop software.",
        "reply":      (
            "HivePhoto does AI photo enhancement in the browser -- upload the image and it improves sharpness, lighting, and detail without needing Lightroom or Photoshop. "
            "Free tier available: https://hivephoto.hive.baby"
        ),
    },
    "HiveAestheticBestie": {
        "url":        "https://hiveaestheticbestie.hive.baby",
        "label":      "HiveAestheticBestie",
        "subreddits": ["femalefashionadvice", "malefashionadvice", "skincareaddiction", "beauty"],
        "keywords":   ["find my style", "aesthetic advice", "personal style", "wardrobe help"],
        "why":        "HiveAestheticBestie helps users define and develop their personal aesthetic -- style, wardrobe, and visual identity.",
        "reply":      (
            "HiveAestheticBestie might be worth trying -- you describe yourself, your life, what you're drawn to, and it helps you articulate and build a coherent personal aesthetic rather than just suggesting outfit formulas. "
            "Free: https://hiveaestheticbestie.hive.baby"
        ),
    },
    "HiveMicroRitual": {
        "url":        "https://hivemicroritual.hive.baby",
        "label":      "HiveMicroRitual",
        "subreddits": ["selfimprovement", "habitbuilding", "Meditation", "minimalism"],
        "keywords":   ["morning routine", "micro habit", "daily ritual", "tiny habit"],
        "why":        "HiveMicroRitual helps users design tiny, sustainable daily habits and rituals -- focused on consistency over ambition.",
        "reply":      (
            "HiveMicroRitual is built around this idea -- you tell it what you want to change and it helps you design a micro-ritual small enough to actually stick to. "
            "Good for when willpower-based systems have already failed. "
            "Free: https://hivemicroritual.hive.baby"
        ),
    },
    "SovereignArbitrage": {
        "url":        "https://sovereignarbitrage.hive.baby",
        "label":      "SovereignArbitrage",
        "subreddits": ["digitalnomad", "financialindependence", "ExpatFIRE", "legaladvice"],
        "keywords":   ["geographic arbitrage", "tax optimization", "expat finance", "sovereign living"],
        "why":        "SovereignArbitrage helps users think through geographic and financial arbitrage -- residency, tax, and location-independent finance.",
        "reply":      (
            "SovereignArbitrage is a free tool that helps you work through geographic arbitrage scenarios -- cost of living differentials, tax implications by jurisdiction, residency options. "
            "Good starting point before you talk to an actual advisor: https://sovereignarbitrage.hive.baby"
        ),
    },
    "UniversalDocument": {
        "url":        "https://ud.hive.baby",
        "label":      "UniversalDocument",
        "subreddits": ["legaltech", "Notary", "paralegal", "productivity", "opensource", "compsci"],
        "keywords":   ["document format", "PDF alternative", "document standard", "interoperable document"],
        "why":        "The Universal Document suite provides a structured, AI-readable document format with tools for creating, reading, converting, signing, and validating.",
        "reply":      (
            "The Universal Document suite might be relevant here -- it's an open document format designed for interoperability and AI-readability, with tools for creating, reading, converting, signing, and validating. "
            "The format is documented at https://ud.hive.baby if you want to see the spec."
        ),
    },
    "HiveEngineBuilder": {
        "url":        "https://hiveenginebuilder.hive.baby",
        "label":      "HiveEngineBuilder",
        "subreddits": ["SideProject", "startups", "nocode", "MachineLearning", "artificial"],
        "keywords":   ["build AI tool", "AI engine", "no-code AI", "launch AI product"],
        "why":        "HiveEngineBuilder helps people design and launch AI-powered tools without deep ML knowledge -- good for founders and indie builders.",
        "reply":      (
            "HiveEngineBuilder is a free tool for this -- you describe what your AI product should do and it helps you design the engine logic, prompts, and user flow without starting from a blank canvas. "
            "Worth a look: https://hiveenginebuilder.hive.baby"
        ),
    },
}

# -- GitHub helpers -----------------------------------------------------------

def gh_request(method: str, path: str, body: dict | None = None) -> dict:
    url  = f"{GITHUB_API}{path}"
    data = json.dumps(body).encode() if body else None
    req  = urllib.request.Request(
        url, data=data, method=method,
        headers={
            "Authorization":        f"Bearer {GITHUB_TOKEN}",
            "Accept":               "application/vnd.github+json",
            "Content-Type":         "application/json",
            "User-Agent":           "HiveBot/1.0",
            "X-GitHub-Api-Version": "2022-11-28",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        print(f"  GitHub API error {e.code}: {e.read().decode(errors='replace')[:200]}")
        return {}


def get_existing_lead_urls() -> set:
    seen: set = set()
    page = 1
    while True:
        issues = gh_request(
            "GET",
            f"/repos/{GITHUB_REPO}/issues"
            f"?labels=reddit-lead&state=open&per_page=100&page={page}",
        )
        if not issues:
            break
        for issue in issues:
            for word in (issue.get("body") or "").split():
                if "reddit.com/r/" in word:
                    seen.add(word.strip("*[]()>"))
        if len(issues) < 100:
            break
        page += 1
    print(f"  Dedup: {len(seen)} existing Reddit URLs in open issues")
    return seen


def create_issue(title: str, body: str, labels: list) -> str:
    result = gh_request(
        "POST",
        f"/repos/{GITHUB_REPO}/issues",
        {"title": title, "body": body, "labels": labels},
    )
    return result.get("html_url", "(no url returned)")


# -- Reddit helpers -----------------------------------------------------------

def search_reddit(subreddit: str, keyword: str) -> list:
    params = urllib.parse.urlencode({
        "q":           keyword,
        "sort":        "new",
        "t":           "week",
        "limit":       10,
        "restrict_sr": 1,
    })
    url = f"https://www.reddit.com/r/{subreddit}/search.json?{params}"
    req = urllib.request.Request(url, headers={"User-Agent": REDDIT_UA})
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            data  = json.loads(resp.read())
            posts = data.get("data", {}).get("children", [])
            return [p["data"] for p in posts if p.get("kind") == "t3"]
    except Exception as e:
        print(f"  Reddit fetch error ({subreddit}, {keyword!r}): {e}")
        return []


# -- Issue formatting ---------------------------------------------------------

def build_issue(engine_name: str, engine: dict, post: dict) -> tuple:
    thread_title = post.get("title", "")
    subreddit    = post.get("subreddit", "")
    score        = post.get("score", 0)
    num_comments = post.get("num_comments", 0)
    permalink    = "https://www.reddit.com" + post.get("permalink", "")

    truncated   = thread_title if len(thread_title) <= 60 else thread_title[:57] + "..."
    issue_title = f"[Reddit Lead] r/{subreddit} — {truncated}"

    body = f"""## Reddit Thread

**URL:** {permalink}
**Title:** {thread_title}
**Score:** {score} | **Comments:** {num_comments}

---

## Engine Match

**Engine:** [{engine_name}]({engine['url']})
**Why it's relevant:** {engine['why']}

---

## Pre-Written Reply

Copy and paste this as your comment:

> {engine['reply']}

---

*Auto-generated by reddit-monitor.yml. Post manually — do not automate. Close once replied or not relevant.*
"""
    return issue_title, body


# -- Main ---------------------------------------------------------------------

def main() -> None:
    print("Reddit Monitor starting...")
    print(f"Repo: {GITHUB_REPO}")

    seen_urls     = get_existing_lead_urls()
    issues_created = 0
    issues_skipped = 0

    for engine_name, engine in ENGINES.items():
        print(f"\n[{engine_name}]")
        for subreddit in engine["subreddits"]:
            for keyword in engine["keywords"]:
                print(f"  Searching r/{subreddit} for {keyword!r}...")
                posts = search_reddit(subreddit, keyword)
                time.sleep(1)

                for post in posts:
                    permalink = "https://www.reddit.com" + post.get("permalink", "")

                    if permalink in seen_urls:
                        issues_skipped += 1
                        continue

                    if post.get("score", 0) < 2:
                        continue

                    if post.get("locked") or post.get("removed_by_category"):
                        continue

                    issue_title, issue_body = build_issue(engine_name, engine, post)
                    labels = ["reddit-lead", engine["label"]]

                    print(f"  CREATE: {issue_title[:80]}")
                    url = create_issue(issue_title, issue_body, labels)
                    print(f"  Issue:  {url}")

                    seen_urls.add(permalink)
                    issues_created += 1
                    time.sleep(0.5)

    print(f"\nDone. Created: {issues_created} | Skipped (deduplicated): {issues_skipped}")


if __name__ == "__main__":
    main()
