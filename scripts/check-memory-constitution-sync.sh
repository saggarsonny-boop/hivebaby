#!/usr/bin/env bash
# memory-constitution sync check
#
# Ensures every [TAG_NAME] declared in MEMORY.md (under a
# "Rule ID:" or "### Rule ##" or "### `[TAG]`" heading) also appears
# verbatim somewhere in docs/HIVE_CONSTITUTION.md.
#
# Rationale: claude.ai user memory rules can drift out of sync with the
# constitution. The contract is "every memory rule is reflected in
# governance" — this script makes that contract testable.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MEMORY="$REPO_ROOT/MEMORY.md"
CONSTITUTION="$REPO_ROOT/docs/HIVE_CONSTITUTION.md"

if [ ! -f "$MEMORY" ]; then
  echo "FAIL: $MEMORY does not exist"
  exit 1
fi
if [ ! -f "$CONSTITUTION" ]; then
  echo "FAIL: $CONSTITUTION does not exist"
  exit 1
fi

# Extract every [UPPERCASE_WITH_UNDERSCORES] tag from MEMORY.md.
# Tags are SCREAMING_SNAKE_CASE wrapped in square brackets, length 3+.
# We only care about TAGS that look like rule IDs — so we anchor on the
# form `[A-Z][A-Z0-9_]{2,}`.
TAGS=$(grep -oE '\[[A-Z][A-Z0-9_]{2,}\]' "$MEMORY" | sort -u)

if [ -z "$TAGS" ]; then
  echo "FAIL: no [TAG_NAME] rule IDs found in MEMORY.md — file may be empty or malformed"
  exit 1
fi

MISSING=()
for tag in $TAGS; do
  # Tag must appear verbatim (with brackets) somewhere in the constitution.
  if ! grep -qF "$tag" "$CONSTITUTION"; then
    MISSING+=("$tag")
  fi
done

if [ ${#MISSING[@]} -gt 0 ]; then
  echo "FAIL: the following tags are in MEMORY.md but missing from docs/HIVE_CONSTITUTION.md:"
  for tag in "${MISSING[@]}"; do
    echo "  - $tag"
  done
  echo
  echo "Fix: add a section to the constitution that references each missing tag,"
  echo "or remove the tag from MEMORY.md if it's been retired."
  exit 1
fi

# Inverse direction (informational, doesn't fail): tags in the constitution
# that aren't in MEMORY.md. Drift can also accumulate the other way as the
# constitution grows. We surface this as a notice but don't block — the
# constitution is the upstream document, so it's allowed to have content
# that hasn't yet been condensed into a memory rule.
CONSTITUTION_TAGS=$(grep -oE '\[[A-Z][A-Z0-9_]{2,}\]' "$CONSTITUTION" | sort -u)
ORPHANED=()
for tag in $CONSTITUTION_TAGS; do
  if ! echo "$TAGS" | grep -qF "$tag"; then
    ORPHANED+=("$tag")
  fi
done
if [ ${#ORPHANED[@]} -gt 0 ]; then
  echo "(notice — tags in constitution but not in MEMORY.md, not blocking:)"
  for tag in "${ORPHANED[@]}"; do
    echo "  · $tag"
  done
fi

echo "PASS: all $(echo "$TAGS" | wc -l | tr -d ' ') memory tags are reflected in the constitution"
