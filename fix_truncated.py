#!/usr/bin/env python3
"""
Re-extract only the truncated files using line-boundary parsing
(handles triple backticks inside regex patterns)
"""
import os
import re

PROMPT_FILE = "/workspaces/hivebaby/HEB-3.0-4.0-CC-DEPLOYMENT-PROMPT.txt"
REPO_DIR = "/workspaces/hive-engine-builder"

with open(PROMPT_FILE, "r", encoding="utf-8") as f:
    lines = f.readlines()

# Build an index of where each ## File: block starts
file_starts = {}  # line_index -> filepath
for i, line in enumerate(lines):
    m = re.match(r'^## File: `([^`]+)`\s*$', line)
    if m:
        file_starts[i] = m.group(1)

# Sort by line index
ordered = sorted(file_starts.keys())

def extract_file_at(start_idx, next_start_idx):
    """Extract code content between ## File: header and next ## File: header"""
    block = lines[start_idx:next_start_idx]
    # Skip the ## File: line, blank line, and opening ```lang line
    content_lines = []
    in_code = False
    for i, line in enumerate(block):
        if not in_code:
            if line.strip().startswith('```'):
                in_code = True
                continue  # skip the opening fence
        else:
            # We're inside the code block — stop at a closing fence
            # A closing fence is a line that is EXACTLY ``` (optionally with whitespace)
            # and is NOT part of a string/regex in the code
            # We use a heuristic: closing fence only if it's on its own line
            # and comes right before either another ## File: marker, ---, or end
            stripped = line.rstrip('\n')
            if stripped == '```' or stripped == '``` ':
                # This might be the closing fence — check if next non-empty lines
                # indicate we're done (--- or ## File: or end)
                remaining = block[i+1:]
                non_empty = [l.strip() for l in remaining if l.strip()]
                if not non_empty or non_empty[0] == '---' or non_empty[0].startswith('## File:') or non_empty[0].startswith('## '):
                    break  # This is the real closing fence
                else:
                    content_lines.append(line)
            else:
                content_lines.append(line)
    return ''.join(content_lines)

# Extract only the files we need to fix
targets = [
    'lib/brainstorm.ts',
    'lib/batch-intent.ts',
    'lib/break-mode.ts',
    'app/api/workshop/generate/route.ts',
]

for i, start_idx in enumerate(ordered):
    filepath = file_starts[start_idx]
    if filepath not in targets:
        continue

    next_idx = ordered[i+1] if i+1 < len(ordered) else len(lines)
    content = extract_file_at(start_idx, next_idx)

    full_path = os.path.join(REPO_DIR, filepath)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Fixed: {filepath} ({content.count(chr(10))+1} lines)")

print("Done.")
