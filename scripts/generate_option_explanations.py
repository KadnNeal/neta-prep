"""Generate stored per-choice explanations for questions (Session 43).

For each question without `option_explanations`, asks Claude (Message Batches API,
50% price) why each choice A-D is right or wrong, and whether the stored answer key
looks correct. Results are written to questions.option_explanations / answer_key_flag.

Steps (state is kept in scripts/data/option_explanations_state.json):
  python scripts/generate_option_explanations.py submit --pilot 25   # stratified sample
  python scripts/generate_option_explanations.py submit --pilot 25 --now   # same, via the regular API (no batch wait)
  python scripts/generate_option_explanations.py submit --all        # everything still missing
  python scripts/generate_option_explanations.py status              # poll the open batch
  python scripts/generate_option_explanations.py cancel              # cancel the open batch
  python scripts/generate_option_explanations.py collect             # download results -> jsonl
  python scripts/generate_option_explanations.py apply               # write results to the DB
  python scripts/generate_option_explanations.py report              # flagged answer keys -> CSV

Reads ANTHROPIC_API_KEY, NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local.
"""

import argparse
import csv
import json
import random
import sys
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import anthropic
from anthropic.types.message_create_params import MessageCreateParamsNonStreaming
from anthropic.types.messages.batch_create_params import Request

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "scripts" / "data"
STATE = DATA / "option_explanations_state.json"
RESULTS = DATA / "option_explanations_results.jsonl"
REPORT = DATA / "option_explanations_flagged.csv"

MODEL = "claude-opus-5"

SYSTEM = """You are a senior NETA Level 4 electrical testing engineer who writes exam-prep explanations for NETA ETT technicians studying for their certification exam.

For the multiple-choice question you're given, explain every choice:
- For the correct choice: why it is right — the principle, value, or standard behind it.
- For each wrong choice: why it is wrong, and what misconception or confusion makes it tempting.

Each explanation is 1-3 sentences, technically precise, written for a working technician. Don't restate the choice text word for word, and don't start with "This is correct/incorrect" — the app already shows which choice is right. You may bold a standard or key term with **double asterisks** (for example **NFPA 70E**, **ANSI/NETA ATS**). Plain text otherwise: no headings, lists or line breaks.

Write the explanations consistent with the marked correct answer. Separately, check the answer key: if you believe the marked answer is wrong, that more than one choice is defensible, or the question is too ambiguous to answer, set agrees_with_key to false and say why in key_note. Otherwise set agrees_with_key to true and key_note to an empty string."""

OUTPUT_SCHEMA = {
    "type": "object",
    "properties": {
        "a": {"type": "string"},
        "b": {"type": "string"},
        "c": {"type": "string"},
        "d": {"type": "string"},
        "agrees_with_key": {"type": "boolean"},
        "key_note": {"type": "string"},
    },
    "required": ["a", "b", "c", "d", "agrees_with_key", "key_note"],
    "additionalProperties": False,
}


# ── env / Supabase REST ───────────────────────────────────────────────────────

def load_env() -> dict[str, str]:
    env: dict[str, str] = {}
    for line in (ROOT / ".env.local").read_text(encoding="utf-8-sig").splitlines():
        if "=" in line and not line.lstrip().startswith("#"):
            key, _, value = line.partition("=")
            env[key.strip()] = value.strip().strip('"').lstrip("﻿")
    return env


def rest(env: dict[str, str], method: str, path: str, body: object | None = None) -> object:
    key = env["SUPABASE_SERVICE_ROLE_KEY"]
    req = urllib.request.Request(
        f"{env['NEXT_PUBLIC_SUPABASE_URL']}/rest/v1/{path}",
        data=json.dumps(body).encode() if body is not None else None,
        headers={
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
        },
        method=method,
    )
    with urllib.request.urlopen(req) as resp:
        raw = resp.read()
        return json.loads(raw) if raw else None


def fetch_missing(env: dict[str, str]) -> list[dict]:
    cols = "id,level,question_type,domain,subdomain,question,options,correct_answer,explanation"
    rows: list[dict] = []
    offset = 0
    while True:
        page = rest(env, "GET", f"questions?select={cols}&option_explanations=is.null"
                                f"&options=not.is.null&order=id&limit=1000&offset={offset}")
        assert isinstance(page, list)
        rows += page
        if len(page) < 1000:
            return rows
        offset += 1000


# ── state ─────────────────────────────────────────────────────────────────────

def load_state() -> dict:
    return json.loads(STATE.read_text(encoding="utf-8")) if STATE.exists() else {"batches": []}


def save_state(state: dict) -> None:
    STATE.write_text(json.dumps(state, indent=2), encoding="utf-8")


def open_batch(state: dict) -> dict | None:
    return next((b for b in state["batches"] if not b.get("collected")), None)


# ── commands ──────────────────────────────────────────────────────────────────

def user_prompt(q: dict) -> str:
    opts = q["options"]
    lines = [
        f"Topic: {q['domain']} / {q['subdomain']} (NETA Level {q['level']})",
        "",
        f"Question: {q['question']}",
        "",
        *(f"{k.upper()}: {opts[k]}" for k in ("a", "b", "c", "d")),
        "",
        f"Marked correct answer: {q['correct_answer'].upper()}",
    ]
    if q.get("explanation"):
        lines += ["", f"Existing summary explanation (for context): {q['explanation']}"]
    return "\n".join(lines)


def is_valid_question(q: dict) -> bool:
    opts = q.get("options") or {}
    return set(opts) >= {"a", "b", "c", "d"} and q.get("correct_answer") in ("a", "b", "c", "d")


def pilot_sample(rows: list[dict], n: int) -> list[dict]:
    """Stratified across level/question_type so the pilot sees every set."""
    random.seed(43)
    groups: dict[tuple, list[dict]] = {}
    for r in rows:
        groups.setdefault((r["level"], r["question_type"]), []).append(r)
    per = max(1, n // len(groups))
    picked = [q for g in groups.values() for q in random.sample(g, min(per, len(g)))]
    return picked[:n]


def cmd_submit(args: argparse.Namespace) -> None:
    state = load_state()
    if open_batch(state):
        sys.exit("A batch is still open — run `status` / `collect` first.")
    env = load_env()
    rows = [q for q in fetch_missing(env) if is_valid_question(q)]
    if args.pilot:
        rows = pilot_sample(rows, args.pilot)
    print(f"{len(rows)} questions to submit")
    if args.dry_run:
        print("\n--- sample prompt ---\n" + user_prompt(rows[0]))
        return
    if not rows:
        return

    client = anthropic.Anthropic(api_key=env["ANTHROPIC_API_KEY"])
    if args.now:
        run_now(client, rows)
        return
    requests = [
        Request(custom_id=q["id"], params=MessageCreateParamsNonStreaming(**request_params(q)))
        for q in rows
    ]
    batch = client.messages.batches.create(requests=requests)
    state["batches"].append({"id": batch.id, "count": len(rows), "pilot": bool(args.pilot), "collected": False})
    save_state(state)
    print(f"Submitted batch {batch.id} ({len(rows)} requests). Run `status` to check progress.")


def request_params(q: dict) -> dict:
    return {
        "model": MODEL,
        "max_tokens": 16000,
        "thinking": {"type": "adaptive"},
        "system": SYSTEM,
        "output_config": {"format": {"type": "json_schema", "schema": OUTPUT_SCHEMA}},
        "messages": [{"role": "user", "content": user_prompt(q)}],
    }


def to_record(qid: str, msg: anthropic.types.Message, source: str) -> dict:
    record: dict = {"id": qid, "batch": source,
                    "usage": {"input": msg.usage.input_tokens, "output": msg.usage.output_tokens}}
    text = next((blk.text for blk in msg.content if blk.type == "text"), "")
    if msg.stop_reason != "end_turn":
        record["error"] = f"stop_reason={msg.stop_reason}"
        return record
    try:
        data = json.loads(text)
        assert all(isinstance(data.get(k), str) and data[k].strip() for k in "abcd")
        record["data"] = data
    except (json.JSONDecodeError, AssertionError):
        record["error"] = "invalid output"
    return record


def run_now(client: anthropic.Anthropic, rows: list[dict]) -> None:
    """Regular Messages API (full price) — for small pilots when the batch queue is slow."""
    def one(q: dict) -> dict:
        try:
            return to_record(q["id"], client.messages.create(**request_params(q)), "direct")
        except anthropic.APIError as err:
            return {"id": q["id"], "batch": "direct", "error": f"{type(err).__name__}: {err}"}

    with ThreadPoolExecutor(max_workers=6) as pool:
        records = list(pool.map(one, rows))
    with RESULTS.open("a", encoding="utf-8") as out:
        for r in records:
            out.write(json.dumps(r, ensure_ascii=False) + "\n")
    tin = sum(r.get("usage", {}).get("input", 0) for r in records)
    tout = sum(r.get("usage", {}).get("output", 0) for r in records)
    ok = sum("data" in r for r in records)
    print(f"{ok} ok, {len(records) - ok} failed -> {RESULTS.relative_to(ROOT)}")
    print(f"Tokens: {tin:,} in / {tout:,} out (~${tin / 1e6 * 5 + tout / 1e6 * 25:.2f} at full price; "
          f"batch would be ~${tin / 1e6 * 2.5 + tout / 1e6 * 12.5:.2f})")
    for r in records:
        if "error" in r:
            print("  failed:", r["id"], r["error"])


def cmd_status(_: argparse.Namespace) -> None:
    state = load_state()
    b = open_batch(state)
    if not b:
        sys.exit("No open batch.")
    env = load_env()
    client = anthropic.Anthropic(api_key=env["ANTHROPIC_API_KEY"])
    batch = client.messages.batches.retrieve(b["id"])
    c = batch.request_counts
    print(f"{batch.id}: {batch.processing_status} | processing {c.processing}, succeeded {c.succeeded}, "
          f"errored {c.errored}, canceled {c.canceled}, expired {c.expired}")


def cmd_cancel(_: argparse.Namespace) -> None:
    state = load_state()
    b = open_batch(state)
    if not b:
        sys.exit("No open batch.")
    env = load_env()
    client = anthropic.Anthropic(api_key=env["ANTHROPIC_API_KEY"])
    batch = client.messages.batches.cancel(b["id"])
    b["collected"] = True
    b["canceled"] = True
    save_state(state)
    print(f"{batch.id}: {batch.processing_status} (unprocessed requests aren't billed)")


def cmd_collect(_: argparse.Namespace) -> None:
    state = load_state()
    b = open_batch(state)
    if not b:
        sys.exit("No open batch.")
    env = load_env()
    client = anthropic.Anthropic(api_key=env["ANTHROPIC_API_KEY"])
    batch = client.messages.batches.retrieve(b["id"])
    if batch.processing_status != "ended":
        sys.exit(f"Batch is still {batch.processing_status}.")

    ok = failed = 0
    usage = {"input": 0, "output": 0}
    with RESULTS.open("a", encoding="utf-8") as out:
        for result in client.messages.batches.results(b["id"]):
            if result.result.type == "succeeded":
                msg = result.result.message
                usage["input"] += msg.usage.input_tokens
                usage["output"] += msg.usage.output_tokens
                record = to_record(result.custom_id, msg, b["id"])
            else:
                record = {"id": result.custom_id, "batch": b["id"], "error": result.result.type}
            ok += "data" in record
            failed += "error" in record
            out.write(json.dumps(record, ensure_ascii=False) + "\n")

    b["collected"] = True
    b["usage"] = usage
    save_state(state)
    # Batch price = half of Opus 5's $5 / $25 per MTok
    cost = usage["input"] / 1e6 * 2.5 + usage["output"] / 1e6 * 12.5
    print(f"Collected {ok} ok, {failed} failed -> {RESULTS.relative_to(ROOT)}")
    print(f"Tokens: {usage['input']:,} in / {usage['output']:,} out (~${cost:.2f} at batch pricing)")
    if failed:
        print("Failed questions stay without explanations; the next `submit --all` retries them.")


def latest_results() -> dict[str, dict]:
    latest: dict[str, dict] = {}
    if RESULTS.exists():
        for line in RESULTS.read_text(encoding="utf-8").splitlines():
            rec = json.loads(line)
            if "data" in rec:
                latest[rec["id"]] = rec["data"]
    return latest


def cmd_apply(_: argparse.Namespace) -> None:
    env = load_env()
    results = latest_results()
    pending = {qid for qid in results}
    # Only fill questions that are still empty — never overwrite reviewed/edited rows
    missing_ids = {q["id"] for q in fetch_missing(env)}
    todo = [(qid, results[qid]) for qid in pending if qid in missing_ids]
    print(f"Writing {len(todo)} questions ({len(pending) - len(todo)} already filled, skipped)")

    def write(item: tuple[str, dict]) -> str | None:
        qid, d = item
        flag = None if d["agrees_with_key"] else (d["key_note"].strip() or "Generator disagreed with the answer key")
        try:
            rest(env, "PATCH", f"questions?id=eq.{urllib.parse.quote(qid)}", {
                "option_explanations": {k: d[k].strip() for k in "abcd"},
                "answer_key_flag": flag,
            })
            return None
        except Exception as err:  # noqa: BLE001 — report and continue
            return f"{qid}: {err}"

    with ThreadPoolExecutor(max_workers=8) as pool:
        errors = [e for e in pool.map(write, todo) if e]
    print(f"Done. {len(todo) - len(errors)} written, {len(errors)} failed")
    for e in errors[:10]:
        print("  ", e)


def cmd_report(_: argparse.Namespace) -> None:
    env = load_env()
    rows: list[dict] = []
    offset = 0
    cols = "id,level,question_type,question,options,correct_answer,answer_key_flag"
    while True:
        page = rest(env, "GET", f"questions?select={cols}&answer_key_flag=not.is.null&order=id&limit=1000&offset={offset}")
        assert isinstance(page, list)
        rows += page
        if len(page) < 1000:
            break
        offset += 1000
    with REPORT.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["id", "level", "type", "question", "A", "B", "C", "D", "marked", "why flagged"])
        for r in rows:
            o = r["options"]
            w.writerow([r["id"], r["level"], r["question_type"], r["question"], o.get("a"), o.get("b"),
                        o.get("c"), o.get("d"), r["correct_answer"].upper(), r["answer_key_flag"]])
    print(f"{len(rows)} flagged questions -> {REPORT.relative_to(ROOT)}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("submit")
    g = s.add_mutually_exclusive_group(required=True)
    g.add_argument("--pilot", type=int, help="stratified sample size")
    g.add_argument("--all", action="store_true")
    s.add_argument("--dry-run", action="store_true", help="print counts and a sample prompt; submit nothing")
    s.add_argument("--now", action="store_true", help="use the regular API instead of a batch (small pilots)")
    for name in ("status", "cancel", "collect", "apply", "report"):
        sub.add_parser(name)
    args = parser.parse_args()
    {"submit": cmd_submit, "status": cmd_status, "cancel": cmd_cancel, "collect": cmd_collect,
     "apply": cmd_apply, "report": cmd_report}[args.cmd](args)


if __name__ == "__main__":
    main()
