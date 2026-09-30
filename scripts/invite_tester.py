"""Create a beta-tester invite link (no email sent — you send the link yourself).

Supabase's built-in mailer only delivers to the project's own team members, so
instead this uses the admin API to generate the invite and prints a link to the
app's /auth/confirm route, which signs the tester in and sends them to
/set-password, then onboarding. Works while public signups are disabled.

Usage:
  python scripts/invite_tester.py tester@example.com [more@example.com ...]
  python scripts/invite_tester.py --base https://staging.passneta.co tester@example.com

Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local.
The link expires per Supabase Auth's "Email OTP expiration" setting; if a tester's
link has expired, run this again for them to get a fresh one.
"""

import argparse
import json
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_BASE = "https://staging.passneta.co"


def load_env() -> dict[str, str]:
    env: dict[str, str] = {}
    for line in (ROOT / ".env.local").read_text(encoding="utf-8-sig").splitlines():
        if "=" in line and not line.lstrip().startswith("#"):
            key, _, value = line.partition("=")
            env[key.strip()] = value.strip().strip('"').lstrip("﻿")
    return env


def generate(env: dict[str, str], email: str, link_type: str) -> dict:
    req = urllib.request.Request(
        f"{env['NEXT_PUBLIC_SUPABASE_URL']}/auth/v1/admin/generate_link",
        data=json.dumps({"type": link_type, "email": email}).encode(),
        headers={
            "apikey": env["SUPABASE_SERVICE_ROLE_KEY"],
            "Authorization": f"Bearer {env['SUPABASE_SERVICE_ROLE_KEY']}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("emails", nargs="+")
    parser.add_argument("--base", default=DEFAULT_BASE, help=f"app URL (default {DEFAULT_BASE})")
    args = parser.parse_args()
    env = load_env()

    for email in args.emails:
        link_type = "invite"
        try:
            data = generate(env, email, link_type)
        except urllib.error.HTTPError as err:
            body = err.read().decode(errors="replace")
            # Already registered (e.g. invited before): send a password-reset style link instead
            if err.code == 422 or "already" in body.lower():
                link_type = "recovery"
                data = generate(env, email, link_type)
            else:
                print(f"{email}: FAILED ({err.code}) {body}")
                continue
        token_hash = (data.get("properties") or data).get("hashed_token")
        if not token_hash:
            print(f"{email}: FAILED, no token in response")
            continue
        query = urllib.parse.urlencode({"token_hash": token_hash, "type": link_type, "next": "/set-password"})
        print(f"{email} ({link_type}):\n  {args.base}/auth/confirm?{query}\n")


if __name__ == "__main__":
    main()
