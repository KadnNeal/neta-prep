-- Session 36: free-tier practice counter is server-owned
--
-- practice_questions_today / practice_count_date enforce the free-tier 15/day cap.
-- While they were user-writable, a free user could reset their own cap from the
-- browser. /api/practice/questions now writes them with the service role, so
-- remove them from the authenticated UPDATE allowlist set in 20260927120000.

revoke update (practice_questions_today, practice_count_date) on public.profiles from authenticated;
