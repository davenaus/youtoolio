create table if not exists public.extension_tool_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tool_key text not null check (
    tool_key in (
      'video_analysis',
      'channel_analysis',
      'thumbnail_download',
      'comment_download'
    )
  ),
  week_start date not null,
  source text not null default 'extension',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists extension_tool_usage_user_week_idx
  on public.extension_tool_usage (user_id, week_start, created_at desc);

create index if not exists extension_tool_usage_user_tool_week_idx
  on public.extension_tool_usage (user_id, tool_key, week_start);

alter table public.extension_tool_usage enable row level security;

drop policy if exists extension_tool_usage_select_own on public.extension_tool_usage;
create policy extension_tool_usage_select_own
  on public.extension_tool_usage
  for select
  to authenticated
  using (auth.uid() = user_id);
