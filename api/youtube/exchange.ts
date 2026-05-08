// @ts-nocheck
const { createClient } = require('@supabase/supabase-js');
const { ensureYouTubeAnalyticsConsentRecord } = require('../../lib/youtube-analytics-store');

const REDIRECT_URI = 'https://youtool.io/account/extension-youtube-connect/callback';

function integerOrNull(value) {
  if (value === null || value === undefined || value === '') return null;
  const next = Number(value);
  return Number.isFinite(next) ? Math.round(next) : null;
}

function resolveBestThumbnail(thumbnails) {
  return thumbnails?.maxres?.url ||
    thumbnails?.standard?.url ||
    thumbnails?.high?.url ||
    thumbnails?.medium?.url ||
    thumbnails?.default?.url ||
    null;
}

async function storeInitialChannelSnapshot(supabase, userId, channel) {
  if (!supabase || !userId || !channel?.id) return;

  const today = new Date().toISOString().split('T')[0];
  const { error } = await supabase
    .from('youtube_channel_snapshots')
    .upsert({
      user_id: userId,
      channel_id: channel.id,
      snapshot_date: today,
      title: channel?.snippet?.title || null,
      description: channel?.snippet?.description || null,
      custom_url: channel?.snippet?.customUrl || null,
      published_at: channel?.snippet?.publishedAt || null,
      country: channel?.snippet?.country || null,
      default_language: channel?.snippet?.defaultLanguage || null,
      localized: channel?.snippet?.localized || {},
      thumbnail_url: resolveBestThumbnail(channel?.snippet?.thumbnails),
      banner_url: channel?.brandingSettings?.image?.bannerExternalUrl || null,
      subscriber_count: integerOrNull(channel?.statistics?.subscriberCount),
      hidden_subscriber_count: channel?.statistics?.hiddenSubscriberCount ?? null,
      view_count: integerOrNull(channel?.statistics?.viewCount),
      video_count: integerOrNull(channel?.statistics?.videoCount),
      uploads_playlist_id: channel?.contentDetails?.relatedPlaylists?.uploads || null,
      topic_categories: Array.isArray(channel?.topicDetails?.topicCategories) ? channel.topicDetails.topicCategories : [],
      status: channel?.status || {},
      branding: channel?.brandingSettings || {},
      raw: channel,
    }, { onConflict: 'user_id,channel_id,snapshot_date' });

  if (error) {
    console.warn('[youtube-exchange] initial channel snapshot:', error.message);
  }
}

const handler = async (req: any, res: any) => {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const supabase = createClient(
      process.env.REACT_APP_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'unauthorized' });

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.slice(7));
    if (authError || !user) return res.status(401).json({ error: 'unauthorized' });

    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'missing code' });

    // Exchange auth code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenRes.json();
    if (tokens.error) {
      return res.status(400).json({ error: tokens.error_description || tokens.error });
    }

    const { access_token, refresh_token, expires_in, scope, id_token } = tokens;

    // Extract Google subject ID from id_token
    let googleSub = '';
    if (id_token) {
      try {
        const payload = JSON.parse(Buffer.from(id_token.split('.')[1], 'base64').toString());
        googleSub = payload.sub ?? '';
      } catch {}
    }

    const expiresAt = new Date(Date.now() + (expires_in ?? 3600) * 1000).toISOString();

    // Fetch channel info from YouTube Data API
    const channelRes = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails,brandingSettings,status,topicDetails&mine=true',
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const channelData = await channelRes.json();
    const channel = channelData.items?.[0];

    const { error: upsertError } = await supabase.from('youtube_connections').upsert({
      user_id: user.id,
      google_sub: googleSub,
      channel_id: channel?.id ?? null,
      channel_title: channel?.snippet?.title ?? null,
      channel_thumbnail_url: channel?.snippet?.thumbnails?.default?.url ?? null,
      scope: scope ? scope.split(' ') : [],
      access_token,
      refresh_token: refresh_token ?? null,
      token_expires_at: expiresAt,
      disconnected_at: null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    if (upsertError) return res.status(500).json({ error: upsertError.message });

    await ensureYouTubeAnalyticsConsentRecord(supabase, {
      userId: user.id,
      channelId: channel?.id ?? null,
    });
    await storeInitialChannelSnapshot(supabase, user.id, channel);

    return res.status(200).json({
      ok: true,
      channelTitle: channel?.snippet?.title ?? null,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
};

module.exports = handler;
