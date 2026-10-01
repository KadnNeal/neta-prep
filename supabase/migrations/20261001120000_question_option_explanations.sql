-- Session 43: stored per-choice explanations (replaces live AI explanations in Practice)
--
-- option_explanations: {"a": "...", "b": "...", "c": "...", "d": "..."} — why each choice
--   is right or wrong. Generated once by scripts/generate_option_explanations.py.
-- answer_key_flag: set when the generator believes the stored correct_answer is wrong or
--   the question is ambiguous. The app hides option_explanations while this is non-null;
--   clear it (set null) after reviewing/fixing the question.

alter table public.questions add column if not exists option_explanations jsonb;
alter table public.questions add column if not exists answer_key_flag text;
