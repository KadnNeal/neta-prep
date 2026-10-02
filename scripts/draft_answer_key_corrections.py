"""Draft fixes for questions whose answer key was flagged, for owner sign-off (Session 43).

Flagged = questions.answer_key_flag is non-null (set by generate_option_explanations.py).
Claude proposes the smallest fix per question; nothing reaches the database until a row
is marked APPROVE in the review sheet.

  python scripts/draft_answer_key_corrections.py submit [--dry-run]   # batch of flagged questions
  python scripts/draft_answer_key_corrections.py status
  python scripts/draft_answer_key_corrections.py collect              # -> scripts/data/answer_key_corrections.csv
  # open the CSV, put APPROVE (or REJECT) in the `decision` column, save as CSV
  python scripts/draft_answer_key_corrections.py apply [--dry-run]    # writes APPROVE rows

Applying a change:
  - change_key / rewrite: updates question/options/correct_answer/explanation, clears
    answer_key_flag and option_explanations so the next
    `generate_option_explanations.py submit --all` regenerates them (and re-checks the key).
  - keep_key: clears answer_key_flag only (the flag was wrong; explanations stay).
"""

import argparse
import csv
import json
import sys
import urllib.parse
from pathlib import Path

import anthropic
from anthropic.types.message_create_params import MessageCreateParamsNonStreaming
from anthropic.types.messages.batch_create_params import Request

sys.path.insert(0, str(Path(__file__).resolve().parent))
from generate_option_explanations import load_env, rest  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "scripts" / "data"
STATE = DATA / "answer_key_corrections_state.json"
RESULTS = DATA / "answer_key_corrections_results.jsonl"
SHEET = DATA / "answer_key_corrections.csv"

MODEL = "claude-opus-5"
KEYS = ("a", "b", "c", "d")

SYSTEM = """You are a senior NETA Level 4 electrical testing engineer fixing multiple-choice questions in an exam-prep bank for NETA ETT technicians. A reviewer flagged this question because its marked answer looks wrong, or more than one choice is defensible.

Propose the smallest fix that leaves exactly one clearly correct answer:
- "change_key": the question and choices are fine; the marked answer is simply wrong. Keep all text, change correct_answer.
- "rewrite": the stem or a choice must change to remove ambiguity or a factual error (for example name the governing standard, specify indoor vs outdoor, fix a wrong value). Change as little text as possible and keep the same topic and difficulty.
- "keep_key": on reflection the marked answer is correct and unambiguous as written; return the question unchanged.

Always return the full final question, all four choices and the correct letter (unchanged text where you didn't edit). Write a 2-3 sentence summary explanation of the correct answer for the final version. In rationale, say what was wrong and what you changed, citing the standard or principle. Set confidence to "low" when the fix depends on a code/standard edition or detail you're unsure of, so the owner checks it closely. Don't invent standard section numbers or values."""

OUTPUT_SCHEMA = {
    "type": "object",
    "properties": {
        "action": {"type": "string", "enum": ["change_key", "rewrite", "keep_key"]},
        "question": {"type": "string"},
        "a": {"type": "string"},
        "b": {"type": "string"},
        "c": {"type": "string"},
        "d": {"type": "string"},
        "correct_answer": {"type": "string", "enum": list(KEYS)},
        "explanation": {"type": "string"},
        "rationale": {"type": "string"},
        "confidence": {"type": "string", "enum": ["high", "medium", "low"]},
    },
    "required": ["action", "question", "a", "b", "c", "d", "correct_answer", "explanation", "rationale", "confidence"],
    "additionalProperties": False,
}


def fetch_flagged(env: dict[str, str]) -> list[dict]:
    cols = "id,level,question_type,domain,subdomain,question,options,correct_answer,explanation,answer_key_flag"
    rows: list[dict] = []
    offset = 0
    while True:
        page = rest(env, "GET", f"questions?select={cols}&answer_key_flag=not.is.null&order=id&limit=1000&offset={offset}")
        assert isinstance(page, list)
        rows += page
        if len(page) < 1000:
            return rows
        offset += 1000


def prompt(q: dict) -> str:
    o = q["options"]
    return "\n".join([
        f"Topic: {q['domain']} / {q['subdomain']} (NETA Level {q['level']})",
        "",
        f"Question: {q['question']}",
        "",
        *(f"{k.upper()}: {o[k]}" for k in KEYS),
        "",
        f"Marked correct answer: {q['correct_answer'].upper()}",
        f"Current summary explanation: {q.get('explanation') or '(none)'}",
        "",
        f"Why it was flagged: {q['answer_key_flag']}",
    ])


def load_state() -> dict:
    return json.loads(STATE.read_text(encoding="utf-8")) if STATE.exists() else {}


def client_for(env: dict[str, str]) -> anthropic.Anthropic:
    return anthropic.Anthropic(api_key=env["ANTHROPIC_API_KEY"])


def cmd_submit(args: argparse.Namespace) -> None:
    state = load_state()
    if state.get("batch") and not state.get("collected"):
        sys.exit(f"Batch {state['batch']} is still open — run `status` / `collect`.")
    env = load_env()
    rows = fetch_flagged(env)
    print(f"{len(rows)} flagged questions")
    if args.dry_run or not rows:
        if rows:
            print("\n--- sample prompt ---\n" + prompt(rows[0]))
        return
    batch = client_for(env).messages.batches.create(requests=[
        Request(custom_id=q["id"], params=MessageCreateParamsNonStreaming(
            model=MODEL,
            max_tokens=32000,
            thinking={"type": "adaptive"},
            system=SYSTEM,
            output_config={"format": {"type": "json_schema", "schema": OUTPUT_SCHEMA}},
            messages=[{"role": "user", "content": prompt(q)}],
        ))
        for q in rows
    ])
    STATE.write_text(json.dumps({"batch": batch.id, "count": len(rows), "collected": False}, indent=2), encoding="utf-8")
    print(f"Submitted {batch.id} ({len(rows)} requests)")


def cmd_status(_: argparse.Namespace) -> None:
    state = load_state()
    if not state.get("batch"):
        sys.exit("No batch submitted.")
    b = client_for(load_env()).messages.batches.retrieve(state["batch"])
    c = b.request_counts
    print(f"{b.id}: {b.processing_status} | processing {c.processing}, succeeded {c.succeeded}, errored {c.errored}")


def cmd_collect(_: argparse.Namespace) -> None:
    state = load_state()
    env = load_env()
    client = client_for(env)
    b = client.messages.batches.retrieve(state["batch"])
    if b.processing_status != "ended":
        sys.exit(f"Batch is still {b.processing_status}.")
    originals = {q["id"]: q for q in fetch_flagged(env)}
    tin = tout = 0
    drafts: list[dict] = []
    with RESULTS.open("w", encoding="utf-8") as out:
        for r in client.messages.batches.results(state["batch"]):
            rec: dict = {"id": r.custom_id}
            if r.result.type == "succeeded":
                msg = r.result.message
                tin += msg.usage.input_tokens
                tout += msg.usage.output_tokens
                text = next((blk.text for blk in msg.content if blk.type == "text"), "")
                if msg.stop_reason == "end_turn":
                    try:
                        rec["data"] = json.loads(text)
                    except json.JSONDecodeError:
                        rec["error"] = "invalid output"
                else:
                    rec["error"] = f"stop_reason={msg.stop_reason}"
            else:
                rec["error"] = r.result.type
            out.write(json.dumps(rec, ensure_ascii=False) + "\n")
            if "data" in rec and rec["id"] in originals:
                drafts.append({"orig": originals[rec["id"]], "new": rec["data"]})

    # Review sheet: one row per question, original next to proposed, decision left blank
    order = {"low": 0, "medium": 1, "high": 2}
    drafts.sort(key=lambda d: (order[d["new"]["confidence"]], d["new"]["action"]))
    with SHEET.open("w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow(["decision", "id", "action", "confidence", "rationale", "flag_reason",
                    "old_question", "new_question", "old_key", "new_key",
                    "old_A", "new_A", "old_B", "new_B", "old_C", "new_C", "old_D", "new_D", "new_explanation"])
        for d in drafts:
            o, n = d["orig"], d["new"]
            w.writerow(["", o["id"], n["action"], n["confidence"], n["rationale"], o["answer_key_flag"],
                        o["question"], n["question"] if n["question"] != o["question"] else "(same)",
                        o["correct_answer"].upper(), n["correct_answer"].upper(),
                        *[x for k in KEYS for x in (o["options"][k], n[k] if n[k] != o["options"][k] else "(same)")],
                        n["explanation"]])
    state["collected"] = True
    STATE.write_text(json.dumps(state, indent=2), encoding="utf-8")
    actions: dict[str, int] = {}
    for d in drafts:
        actions[d["new"]["action"]] = actions.get(d["new"]["action"], 0) + 1
    print(f"{len(drafts)} drafts -> {SHEET.relative_to(ROOT)}  {actions}")
    print(f"Tokens {tin:,} in / {tout:,} out (~${tin / 1e6 * 2.5 + tout / 1e6 * 12.5:.2f} batch)")


def cmd_apply(args: argparse.Namespace) -> None:
    env = load_env()
    drafts = {}
    for line in RESULTS.read_text(encoding="utf-8").splitlines():
        rec = json.loads(line)
        if "data" in rec:
            drafts[rec["id"]] = rec["data"]
    with SHEET.open(encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))
    approved = [r for r in rows if r["decision"].strip().upper() == "APPROVE"]
    print(f"{len(approved)} approved of {len(rows)} rows")
    for r in approved:
        d = drafts[r["id"]]
        if d["action"] == "keep_key":
            body: dict = {"answer_key_flag": None}
        else:
            body = {
                "question": d["question"],
                "options": {k: d[k] for k in KEYS},
                "correct_answer": d["correct_answer"],
                "explanation": d["explanation"],
                "answer_key_flag": None,
                "option_explanations": None,  # regenerated (and the key re-checked) on next submit --all
            }
        print(f"  {r['id']} {d['action']}" + ("  (dry run)" if args.dry_run else ""))
        if not args.dry_run:
            rest(env, "PATCH", f"questions?id=eq.{urllib.parse.quote(r['id'])}", body)
    if not args.dry_run and any(drafts[r["id"]]["action"] != "keep_key" for r in approved):
        print("Next: python scripts/generate_option_explanations.py submit --all  (regenerates edited questions)")


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)
    for name in ("submit", "apply"):
        sub.add_parser(name).add_argument("--dry-run", action="store_true")
    sub.add_parser("status")
    sub.add_parser("collect")
    a = p.parse_args()
    {"submit": cmd_submit, "status": cmd_status, "collect": cmd_collect, "apply": cmd_apply}[a.cmd](a)


if __name__ == "__main__":
    main()
