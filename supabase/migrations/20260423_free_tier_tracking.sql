-- Practice daily tracking for free-tier cap (15 questions/day)
alter table profiles add column if not exists practice_questions_today int default 0;
alter table profiles add column if not exists practice_count_date date;
