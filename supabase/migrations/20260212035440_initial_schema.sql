-- NETA Prep: Initial Schema Migration
-- Tables: profiles, questions, user_question_stats, exam_attempts, interview_sessions
-- Plus: indexes, triggers, RLS policies

-- =============================================================================
-- TABLES
-- =============================================================================

-- profiles: created automatically by trigger on auth.users insert
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  neta_target_level int check (neta_target_level in (1, 2, 3, 4)),
  exam_date date,
  created_at timestamptz not null default now()
);

-- questions: the question bank (managed via service_role, not user-facing writes)
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  domain text not null,
  subdomain text not null,
  level int not null check (level in (2, 3, 4)),
  concept_type text not null check (concept_type in (
    'calculation', 'conceptual', 'table-lookup', 'schematic', 'safety-standards'
  )),
  difficulty int not null check (difficulty between 1 and 5),
  frequency_tier int not null check (frequency_tier in (1, 2, 3)),
  question text not null,
  options jsonb,
  correct_answer text not null,
  explanation text not null,
  trap_pattern text,
  prerequisites uuid[] default '{}',
  source text not null check (source in ('recalled', 'official', 'generated')),
  created_at timestamptz not null default now()
);

-- user_question_stats: SM-2 spaced repetition state per user per question
create table public.user_question_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete cascade,
  ease_factor float not null default 2.5,
  interval_days int not null default 1,
  repetitions int not null default 0,
  next_review_date date not null default current_date,
  last_score int check (last_score between 0 and 5),
  time_spent_ms int,
  updated_at timestamptz not null default now(),
  unique (user_id, question_id)
);

-- exam_attempts: timed exam simulation results
create table public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  level int not null check (level in (2, 3, 4)),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  score_percent float check (score_percent between 0 and 100),
  domain_scores jsonb,
  subdomain_scores jsonb,
  passed boolean,
  check (completed_at is null or completed_at >= started_at)
);

-- interview_sessions: AI interview prep with Claude evaluation
create table public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  question text not null,
  user_answer text not null,
  ai_feedback text,
  score int check (score between 1 and 10),
  domain text not null,
  subdomain text not null,
  created_at timestamptz not null default now()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Drill queue: most critical index (user's due cards ordered by date)
create index idx_uqs_user_next_review
  on public.user_question_stats (user_id, next_review_date);

-- Join support: stats → questions
create index idx_uqs_question_id
  on public.user_question_stats (question_id);

-- Exam simulation assembly by domain + level
create index idx_questions_domain_level
  on public.questions (domain, level);

-- Drill queue ordering by frequency tier
create index idx_questions_frequency_tier
  on public.questions (frequency_tier);

-- Domain deep-dive mode
create index idx_questions_subdomain
  on public.questions (subdomain, level);

-- User exam history
create index idx_exam_attempts_user
  on public.exam_attempts (user_id, started_at desc);

-- User interview history
create index idx_interview_sessions_user
  on public.interview_sessions (user_id, created_at desc);

-- =============================================================================
-- TRIGGER FUNCTIONS
-- =============================================================================

-- Auto-update updated_at on row modification
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_user_question_stats_updated
  before update on public.user_question_stats
  for each row
  execute function public.handle_updated_at();

-- Auto-create profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, created_at)
  values (new.id, now());
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

alter table public.profiles enable row level security;
alter table public.questions enable row level security;
alter table public.user_question_stats enable row level security;
alter table public.exam_attempts enable row level security;
alter table public.interview_sessions enable row level security;

-- profiles: users can read and update only their own row
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- questions: all authenticated users can read, only service_role can write
create policy "Authenticated users can read questions"
  on public.questions for select
  using (true);

-- user_question_stats: full CRUD on own rows only
create policy "Users can read own stats"
  on public.user_question_stats for select
  using (auth.uid() = user_id);

create policy "Users can insert own stats"
  on public.user_question_stats for insert
  with check (auth.uid() = user_id);

create policy "Users can update own stats"
  on public.user_question_stats for update
  using (auth.uid() = user_id);

create policy "Users can delete own stats"
  on public.user_question_stats for delete
  using (auth.uid() = user_id);

-- exam_attempts: users can read, insert, and update (complete) their own
create policy "Users can read own exam attempts"
  on public.exam_attempts for select
  using (auth.uid() = user_id);

create policy "Users can insert own exam attempts"
  on public.exam_attempts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own exam attempts"
  on public.exam_attempts for update
  using (auth.uid() = user_id);

-- interview_sessions: users can read and insert; ai_feedback set via service_role
create policy "Users can read own interview sessions"
  on public.interview_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own interview sessions"
  on public.interview_sessions for insert
  with check (auth.uid() = user_id);
