-- Add question tracking columns to exam_attempts
-- question_ids: the ordered list of question UUIDs for this attempt
-- user_answers: {questionId: "a"|"b"|"c"|"d"} submitted answers

ALTER TABLE exam_attempts
  ADD COLUMN IF NOT EXISTS question_ids uuid[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS user_answers jsonb;
