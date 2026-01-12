-- Create table for AI evolution metrics

create table if not exists public.ai_evolution_metrics (
  id bigserial primary key,
  timestamp timestamptz not null default now(),
  win_rate numeric not null,
  total_signals integer not null,
  phase text not null,
  top_indicators jsonb,
  accuracy numeric not null
);

create index if not exists idx_ai_evolution_metrics_timestamp on public.ai_evolution_metrics (timestamp);
