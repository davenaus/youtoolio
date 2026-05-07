-- YouTool.io connected-channel analytics foundation
--
-- This schema is intentionally storage-first and product-neutral. It lets us
-- retain per-user/per-channel YouTube Data API and YouTube Analytics API data
-- for future personal dashboards, while keeping future public/research use
-- behind explicit opt-in fields.
--
-- Important compliance notes before applying:
-- 1. Update the public Privacy Policy / Data Usage pages before enabling writes.
-- 2. Verify every 30 days that the channel authorization is still valid.
-- 3. Delete stored Authorized Data when a user disconnects or requests deletion.
-- 4. Keep cross-channel public benchmarks opt-in, anonymized, and policy-reviewed.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists public.youtube_analytics_consent (
  user_id uuid primary key references auth.users(id) on delete cascade,
  channel_id text not null,
  analytics_history_enabled boolean not null default false,
  anonymized_research_opt_in boolean not null default false,
  public_case_study_opt_in boolean not null default false,
  consent_version text,
  consented_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_youtube_analytics_consent_updated_at on public.youtube_analytics_consent;
create trigger set_youtube_analytics_consent_updated_at
before update on public.youtube_analytics_consent
for each row execute function public.set_updated_at();

create table if not exists public.youtube_analytics_sync_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  channel_id text not null,
  sync_type text not null,
  status text not null check (status in ('started', 'success', 'partial', 'failed', 'skipped')),
  period_start date,
  period_end date,
  source_scopes text[] not null default '{}',
  api_units_estimated integer not null default 0,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  error_message text,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists idx_youtube_sync_runs_user_channel_started
on public.youtube_analytics_sync_runs (user_id, channel_id, started_at desc);

create table if not exists public.youtube_channel_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  channel_id text not null,
  snapshot_date date not null default current_date,
  title text,
  description text,
  custom_url text,
  handle text,
  published_at timestamptz,
  country text,
  default_language text,
  localized jsonb not null default '{}'::jsonb,
  thumbnail_url text,
  banner_url text,
  subscriber_count bigint,
  hidden_subscriber_count boolean,
  view_count bigint,
  video_count integer,
  uploads_playlist_id text,
  topic_categories text[] not null default '{}',
  status jsonb not null default '{}'::jsonb,
  branding jsonb not null default '{}'::jsonb,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, channel_id, snapshot_date)
);

drop trigger if exists set_youtube_channel_snapshots_updated_at on public.youtube_channel_snapshots;
create trigger set_youtube_channel_snapshots_updated_at
before update on public.youtube_channel_snapshots
for each row execute function public.set_updated_at();

create index if not exists idx_youtube_channel_snapshots_channel_date
on public.youtube_channel_snapshots (channel_id, snapshot_date desc);

create table if not exists public.youtube_video_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  channel_id text not null,
  video_id text not null,
  snapshot_date date not null default current_date,
  title text,
  description text,
  published_at timestamptz,
  duration_iso text,
  duration_seconds integer,
  category_id text,
  tags text[] not null default '{}',
  default_language text,
  default_audio_language text,
  privacy_status text,
  upload_status text,
  made_for_kids boolean,
  caption boolean,
  definition text,
  dimension text,
  live_broadcast_content text,
  thumbnail_url text,
  view_count bigint,
  like_count bigint,
  comment_count bigint,
  is_short_guess boolean,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, video_id, snapshot_date)
);

drop trigger if exists set_youtube_video_snapshots_updated_at on public.youtube_video_snapshots;
create trigger set_youtube_video_snapshots_updated_at
before update on public.youtube_video_snapshots
for each row execute function public.set_updated_at();

create index if not exists idx_youtube_video_snapshots_channel_date
on public.youtube_video_snapshots (user_id, channel_id, snapshot_date desc);

create index if not exists idx_youtube_video_snapshots_video_date
on public.youtube_video_snapshots (video_id, snapshot_date desc);

create table if not exists public.youtube_channel_analytics_daily (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  channel_id text not null,
  metric_date date not null,
  views bigint,
  engaged_views bigint,
  red_views bigint,
  estimated_minutes_watched numeric,
  estimated_red_minutes_watched numeric,
  average_view_duration_seconds numeric,
  average_view_percentage numeric,
  subscribers_gained bigint,
  subscribers_lost bigint,
  likes bigint,
  dislikes bigint,
  comments bigint,
  shares bigint,
  videos_added_to_playlists bigint,
  videos_removed_from_playlists bigint,
  thumbnail_impressions bigint,
  thumbnail_ctr numeric,
  card_impressions bigint,
  card_clicks bigint,
  card_teaser_impressions bigint,
  card_teaser_clicks bigint,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, channel_id, metric_date)
);

drop trigger if exists set_youtube_channel_analytics_daily_updated_at on public.youtube_channel_analytics_daily;
create trigger set_youtube_channel_analytics_daily_updated_at
before update on public.youtube_channel_analytics_daily
for each row execute function public.set_updated_at();

create index if not exists idx_youtube_channel_analytics_daily_channel_date
on public.youtube_channel_analytics_daily (user_id, channel_id, metric_date desc);

create table if not exists public.youtube_video_analytics_daily (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  channel_id text not null,
  video_id text not null,
  metric_date date not null,
  views bigint,
  engaged_views bigint,
  red_views bigint,
  estimated_minutes_watched numeric,
  estimated_red_minutes_watched numeric,
  average_view_duration_seconds numeric,
  average_view_percentage numeric,
  subscribers_gained bigint,
  subscribers_lost bigint,
  likes bigint,
  dislikes bigint,
  comments bigint,
  shares bigint,
  videos_added_to_playlists bigint,
  videos_removed_from_playlists bigint,
  thumbnail_impressions bigint,
  thumbnail_ctr numeric,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, video_id, metric_date)
);

drop trigger if exists set_youtube_video_analytics_daily_updated_at on public.youtube_video_analytics_daily;
create trigger set_youtube_video_analytics_daily_updated_at
before update on public.youtube_video_analytics_daily
for each row execute function public.set_updated_at();

create index if not exists idx_youtube_video_analytics_daily_channel_date
on public.youtube_video_analytics_daily (user_id, channel_id, metric_date desc);

create index if not exists idx_youtube_video_analytics_daily_video_date
on public.youtube_video_analytics_daily (video_id, metric_date desc);

create table if not exists public.youtube_analytics_breakdowns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  channel_id text not null,
  video_id text,
  period_start date not null,
  period_end date not null,
  dimension_set text not null,
  dimension_key text not null,
  dimension_values jsonb not null default '{}'::jsonb,
  metrics jsonb not null default '{}'::jsonb,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_youtube_analytics_breakdowns_updated_at on public.youtube_analytics_breakdowns;
create trigger set_youtube_analytics_breakdowns_updated_at
before update on public.youtube_analytics_breakdowns
for each row execute function public.set_updated_at();

create index if not exists idx_youtube_analytics_breakdowns_lookup
on public.youtube_analytics_breakdowns (user_id, channel_id, dimension_set, period_end desc);

create unique index if not exists idx_youtube_analytics_breakdowns_unique
on public.youtube_analytics_breakdowns (
  user_id,
  channel_id,
  coalesce(video_id, ''),
  period_start,
  period_end,
  dimension_set,
  dimension_key
);

create table if not exists public.youtube_playlist_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  channel_id text not null,
  playlist_id text not null,
  snapshot_date date not null default current_date,
  title text,
  description text,
  published_at timestamptz,
  thumbnail_url text,
  privacy_status text,
  item_count integer,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, playlist_id, snapshot_date)
);

drop trigger if exists set_youtube_playlist_snapshots_updated_at on public.youtube_playlist_snapshots;
create trigger set_youtube_playlist_snapshots_updated_at
before update on public.youtube_playlist_snapshots
for each row execute function public.set_updated_at();

create table if not exists public.youtube_playlist_item_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  channel_id text not null,
  playlist_id text not null,
  video_id text,
  snapshot_date date not null default current_date,
  position integer,
  title text,
  published_at timestamptz,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_youtube_playlist_item_snapshots_updated_at on public.youtube_playlist_item_snapshots;
create trigger set_youtube_playlist_item_snapshots_updated_at
before update on public.youtube_playlist_item_snapshots
for each row execute function public.set_updated_at();

create unique index if not exists idx_youtube_playlist_item_snapshots_unique
on public.youtube_playlist_item_snapshots (
  user_id,
  playlist_id,
  coalesce(video_id, ''),
  snapshot_date
);

create table if not exists public.youtube_comment_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  channel_id text not null,
  video_id text not null,
  comment_id text not null,
  parent_comment_id text,
  snapshot_date date not null default current_date,
  author_display_name text,
  author_channel_id text,
  like_count bigint,
  published_at timestamptz,
  updated_at_youtube timestamptz,
  text_display text,
  text_original text,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, comment_id, snapshot_date)
);

drop trigger if exists set_youtube_comment_snapshots_updated_at on public.youtube_comment_snapshots;
create trigger set_youtube_comment_snapshots_updated_at
before update on public.youtube_comment_snapshots
for each row execute function public.set_updated_at();

create table if not exists public.youtube_channel_insight_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  channel_id text not null,
  analysis_type text not null,
  period_start date,
  period_end date,
  model_version text,
  input_fingerprint text,
  results jsonb not null default '{}'::jsonb,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_youtube_channel_insight_runs_channel_generated
on public.youtube_channel_insight_runs (user_id, channel_id, generated_at desc);

create table if not exists public.youtube_public_analytics_rollups (
  id uuid primary key default gen_random_uuid(),
  cohort_key text not null,
  cohort_values jsonb not null default '{}'::jsonb,
  period_start date not null,
  period_end date not null,
  channel_count integer not null default 0,
  video_count integer not null default 0,
  metrics jsonb not null default '{}'::jsonb,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cohort_key, period_start, period_end)
);

drop trigger if exists set_youtube_public_analytics_rollups_updated_at on public.youtube_public_analytics_rollups;
create trigger set_youtube_public_analytics_rollups_updated_at
before update on public.youtube_public_analytics_rollups
for each row execute function public.set_updated_at();

create index if not exists idx_youtube_public_analytics_rollups_lookup
on public.youtube_public_analytics_rollups (cohort_key, period_end desc);

alter table public.youtube_analytics_consent enable row level security;
alter table public.youtube_analytics_sync_runs enable row level security;
alter table public.youtube_channel_snapshots enable row level security;
alter table public.youtube_video_snapshots enable row level security;
alter table public.youtube_channel_analytics_daily enable row level security;
alter table public.youtube_video_analytics_daily enable row level security;
alter table public.youtube_analytics_breakdowns enable row level security;
alter table public.youtube_playlist_snapshots enable row level security;
alter table public.youtube_playlist_item_snapshots enable row level security;
alter table public.youtube_comment_snapshots enable row level security;
alter table public.youtube_channel_insight_runs enable row level security;
alter table public.youtube_public_analytics_rollups enable row level security;

drop policy if exists "Users can read own analytics consent" on public.youtube_analytics_consent;
create policy "Users can read own analytics consent"
on public.youtube_analytics_consent for select using (auth.uid() = user_id);
drop policy if exists "Users can read own sync runs" on public.youtube_analytics_sync_runs;
create policy "Users can read own sync runs"
on public.youtube_analytics_sync_runs for select using (auth.uid() = user_id);
drop policy if exists "Users can read own channel snapshots" on public.youtube_channel_snapshots;
create policy "Users can read own channel snapshots"
on public.youtube_channel_snapshots for select using (auth.uid() = user_id);
drop policy if exists "Users can read own video snapshots" on public.youtube_video_snapshots;
create policy "Users can read own video snapshots"
on public.youtube_video_snapshots for select using (auth.uid() = user_id);
drop policy if exists "Users can read own channel analytics" on public.youtube_channel_analytics_daily;
create policy "Users can read own channel analytics"
on public.youtube_channel_analytics_daily for select using (auth.uid() = user_id);
drop policy if exists "Users can read own video analytics" on public.youtube_video_analytics_daily;
create policy "Users can read own video analytics"
on public.youtube_video_analytics_daily for select using (auth.uid() = user_id);
drop policy if exists "Users can read own analytics breakdowns" on public.youtube_analytics_breakdowns;
create policy "Users can read own analytics breakdowns"
on public.youtube_analytics_breakdowns for select using (auth.uid() = user_id);
drop policy if exists "Users can read own playlist snapshots" on public.youtube_playlist_snapshots;
create policy "Users can read own playlist snapshots"
on public.youtube_playlist_snapshots for select using (auth.uid() = user_id);
drop policy if exists "Users can read own playlist item snapshots" on public.youtube_playlist_item_snapshots;
create policy "Users can read own playlist item snapshots"
on public.youtube_playlist_item_snapshots for select using (auth.uid() = user_id);
drop policy if exists "Users can read own comment snapshots" on public.youtube_comment_snapshots;
create policy "Users can read own comment snapshots"
on public.youtube_comment_snapshots for select using (auth.uid() = user_id);
drop policy if exists "Users can read own insight runs" on public.youtube_channel_insight_runs;
create policy "Users can read own insight runs"
on public.youtube_channel_insight_runs for select using (auth.uid() = user_id);
