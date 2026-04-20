#!/usr/bin/env python3
"""
Parse HEB-3.0-4.0-CC-DEPLOYMENT-PROMPT.txt and extract all 66 files
into /workspaces/hive-engine-builder/
"""
import os
import re
import sys

PROMPT_FILE = "/workspaces/hivebaby/HEB-3.0-4.0-CC-DEPLOYMENT-PROMPT.txt"
REPO_DIR = "/workspaces/hive-engine-builder"

with open(PROMPT_FILE, "r", encoding="utf-8") as f:
    content = f.read()

# Pattern: ## File: `path/to/file`\n\n```lang\n...code...\n```
pattern = re.compile(
    r'## File: `([^`]+)`\s*\n+```[^\n]*\n(.*?)```',
    re.DOTALL
)

matches = pattern.findall(content)
print(f"Found {len(matches)} files to extract")

for filepath, code in matches:
    filepath = filepath.strip()
    full_path = os.path.join(REPO_DIR, filepath)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(code)
    print(f"  wrote: {filepath}")

print(f"\nDone. {len(matches)} files written.")
