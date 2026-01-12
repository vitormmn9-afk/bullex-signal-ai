-- Create tables for AI feedback, operation learnings, and external insights

create table if not exists public.ai_feedback (
  id text primary key,
  timestamp timestamptz not null default now(),
  type text not null check (type in ('improvement','suggestion','bug')),
  content text not null,
  related_metrics jsonb,
  status text check (status in ('applied','rejected','queued')),
  ai_response text,
  applied_changes jsonb
);

create table if not exists public.ai_operation_learnings (
  id text primary key,
  timestamp timestamptz not null default now(),
  signal_id text not null,
  asset text not null,
  direction text not null check (direction in ('CALL','PUT')),
  result text not null check (result in ('WIN','LOSS')),
  indicators text[] not null default '{}',
  candle_pattern text,
  learned text not null,
  implemented text[] not null default '{}'
);

create table if not exists public.ai_insights (
  id bigserial primary key,
  source text not null,
  title text not null,
  url text,
  summary text,
  topic text,
  created_at timestamptz not null default now()
);

-- Indexes for faster queries
create index if not exists idx_ai_feedback_timestamp on public.ai_feedback (timestamp);
create index if not exists idx_ai_operation_learnings_timestamp on public.ai_operation_learnings (timestamp);
create index if not exists idx_ai_insights_created_at on public.ai_insights (created_at);
