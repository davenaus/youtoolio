-- Clean up unused YouTube analytics foundation tables.
-- These tables were created as future placeholders but are not currently filled
-- by the app. Playlist add/remove metrics remain stored in the daily analytics
-- tables, so dropping these does not remove active collection paths.

drop table if exists public.youtube_playlist_item_snapshots;
drop table if exists public.youtube_playlist_snapshots;
drop table if exists public.youtube_public_analytics_rollups;
