#!/usr/bin/env python3
"""HIVE alert digest agent.

Reads pending rows from `hive_alerts` and dispatches them via Resend.

Modes:
  tier1  - send each unsent tier-1 row as its own email (real-time)
  tier2  - compile all unsent tier-2 rows from last 24h into one daily digest
  tier3  - compile all unsent tier-3 rows from last 7 days into one weekly digest

Marks rows `sent = true` only after Resend confirms delivery.
"""
from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone

import psycopg2
from psycopg2.extras import RealDictCursor

SENDER = "hive@hive.baby"
RECIPIENT = "saggarsonny@gmail.com"
RESEND_URL = "https://api.resend.com/emails"


def send_email(subject: str, body: str, api_key: str) -> bool:
    payload = json.dumps({
        "from":    SENDER,
        "to":      [RECIPIENT],
        "subject": subject,
        "text":    body,
    }).encode()
    req = urllib.request.Request(
        RESEND_URL,
        data=payload,
        method="POST",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type":  "application/json",
            # api.resend.com sits behind Cloudflare; default Python-urllib UA
            # is on its known-bot list and gets 403/error code 1010.
            "User-Agent":    "hive-digest/1.0 (+https://hive.baby)",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            print(f"  Email sent (HTTP {resp.status}): {subject}")
            return True
    except urllib.error.HTTPError as e:
        print(f"  Email error {e.code}: {e.read().decode(errors='replace')[:300]}")
        return False
    except urllib.error.URLError as e:
        print(f"  Email transport error: {e}")
        return False


def fmt_alert(row: dict) -> str:
    parts = [f"[{row['agent']}] {row['subject']}", "", row['body']]
    if row.get('action_url'):
        parts += ["", f"Action: {row['action_url']}"]
    parts.append(f"At: {row['created_at'].isoformat()}")
    return "\n".join(parts)


def mark_sent(conn, ids: list) -> None:
    if not ids:
        return
    with conn.cursor() as cur:
        cur.execute("UPDATE hive_alerts SET sent = true WHERE id = ANY(%s::uuid[])", (ids,))
    conn.commit()


def run_tier1(conn, api_key: str) -> int:
    """Returns count of email send failures (0 on full success)."""
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            SELECT id, tier, agent, subject, body, action_url, created_at
              FROM hive_alerts
             WHERE sent = false AND tier = 1
             ORDER BY created_at ASC
             LIMIT 100
            """
        )
        rows = cur.fetchall()
    print(f"Tier 1 unsent: {len(rows)}")
    failures = 0
    for row in rows:
        ok = send_email(row["subject"], fmt_alert(row), api_key)
        if ok:
            mark_sent(conn, [row["id"]])
        else:
            failures += 1
    return failures


def run_digest(conn, tier: int, interval: str, label: str, api_key: str) -> int:
    """Returns count of email send failures (0 on full success or empty queue)."""
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            f"""
            SELECT id, tier, agent, subject, body, action_url, created_at
              FROM hive_alerts
             WHERE sent = false
               AND tier = %s
               AND created_at > now() - interval %s
             ORDER BY created_at ASC
            """,
            (tier, interval),
        )
        rows = cur.fetchall()
    print(f"Tier {tier} unsent ({interval}): {len(rows)}")
    if not rows:
        return 0
    today = datetime.now(timezone.utc).date().isoformat()
    subject = f"HIVE {label} — {today}"
    sections = [fmt_alert(r) for r in rows]
    body = (
        f"{len(rows)} alert(s) over the last {interval}.\n\n"
        + ("\n\n---\n\n".join(sections))
    )
    ok = send_email(subject, body, api_key)
    if ok:
        mark_sent(conn, [r["id"] for r in rows])
        return 0
    return 1


def main() -> int:
    mode = (sys.argv[1] if len(sys.argv) > 1 else "tier1").strip()
    db_url = os.environ.get("DATABASE_URL")
    api_key = os.environ.get("RESEND_API_KEY")
    if not db_url:
        print("DATABASE_URL not set", file=sys.stderr)
        return 1
    if not api_key:
        print("RESEND_API_KEY not set", file=sys.stderr)
        return 1

    conn = psycopg2.connect(db_url)
    try:
        if mode == "tier1":
            failures = run_tier1(conn, api_key)
        elif mode == "tier2":
            failures = run_digest(conn, 2, "24 hours", "DAILY", api_key)
        elif mode == "tier3":
            failures = run_digest(conn, 3, "7 days", "WEEKLY", api_key)
        else:
            print(f"Unknown mode: {mode}", file=sys.stderr)
            return 1
    finally:
        conn.close()
    if failures:
        print(f"{failures} email send failure(s) — exiting non-zero so ci-doctor catches it",
              file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
