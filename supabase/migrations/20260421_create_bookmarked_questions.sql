create table bookmarked_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  question_id uuid references questions(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique(user_id, question_id)
);

create index on bookmarked_questions(user_id);

alter table bookmarked_questions enable row level security;

create policy "Users can manage their own bookmarks"
  on bookmarked_questions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
