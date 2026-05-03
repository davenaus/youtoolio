// @ts-nocheck
const { createClient } = require('@supabase/supabase-js');
const { createHash } = require('crypto');

const ALLOWED_DAY_RANGES = new Set([1, 7, 30]);
const DEFAULT_DAY_RANGE = 7;
const DAY_MS = 86400000;

function resolveDayRange(value: any): number | null {
  const rawValue = Array.isArray(value) ? value[0] : value;
  if (rawValue === undefined || rawValue === null || rawValue === '') {
    return DEFAULT_DAY_RANGE;
  }

  const days = Number(rawValue);
  if (!Number.isInteger(days) || !ALLOWED_DAY_RANGES.has(days)) {
    return null;
  }

  return days;
}

function formatApiDate(timestamp: number): string {
  return new Date(timestamp).toISOString().split('T')[0];
}

function resolveAnalyticsDateRange(days: number): { startDate: string; endDate: string } {
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const todayStartMs = todayStart.getTime();

  if (days === 1) {
    const yesterday = formatApiDate(todayStartMs - DAY_MS);
    return {
      startDate: yesterday,
      endDate: yesterday,
    };
  }

  return {
    startDate: formatApiDate(todayStartMs - days * DAY_MS),
    endDate: formatApiDate(todayStartMs),
  };
}

async function resolveUserId(supabase: any, token: string): Promise<string | null> {
  // Try extension session token first
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const { data: session } = await supabase
    .from('extension_sessions')
    .select('user_id')
    .eq('access_token_hash', tokenHash)
    .is('revoked_at', null)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();
  if (session?.user_id) return session.user_id;

  // Fall back to Supabase JWT
  const { data: { user } } = await supabase.auth.getUser(token);
  return user?.id ?? null;
}

async function getValidAccessToken(supabase: any, connection: any): Promise<string | null> {
  // Use current token if it won't expire in the next 60 seconds
  if (new Date(connection.token_expires_at) > new Date(Date.now() + 60_000)) {
    return connection.access_token;
  }

  // Refresh the token
  const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: connection.refresh_token,
      grant_type: 'refresh_token',
    }),
  });

  const data = await refreshRes.json();
  if (data.error || !data.access_token) return null;

  const expiresAt = new Date(Date.now() + (data.expires_in ?? 3600) * 1000).toISOString();
  await supabase
    .from('youtube_connections')
    .update({ access_token: data.access_token, token_expires_at: expiresAt })
    .eq('user_id', connection.user_id);

  return data.access_token;
}

const handler = async (req: any, res: any) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const supabase = createClient(
      process.env.REACT_APP_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'unauthorized' });

    const userId = await resolveUserId(supabase, authHeader.slice(7));
    if (!userId) return res.status(401).json({ error: 'unauthorized' });

    const { data: connection } = await supabase
      .from('youtube_connections')
      .select('*')
      .eq('user_id', userId)
      .is('disconnected_at', null)
      .maybeSingle();

    if (!connection) return res.status(404).json({ error: 'no_youtube_connection' });

    const accessToken = await getValidAccessToken(supabase, connection);
    if (!accessToken) return res.status(401).json({ error: 'youtube_token_expired' });

    const days = resolveDayRange(req.query?.days);
    if (!days) return res.status(400).json({ error: 'invalid_days' });

    // Total subscriber count from YouTube Data API (live)
    const channelRes = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=statistics&mine=true',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const channelData = await channelRes.json();
    const statistics = channelData.items?.[0]?.statistics;

    // Views + subscriber gain/loss from YouTube Analytics API for the selected range.
    const { startDate, endDate } = resolveAnalyticsDateRange(days);
    const analyticsRes = await fetch(
      `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==MINE&startDate=${startDate}&endDate=${endDate}&metrics=views,subscribersGained,subscribersLost`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const analyticsData = await analyticsRes.json();
    // Without dimensions=day, returns a single aggregate row: [views, subscribersGained, subscribersLost]
    const row: [number, number, number] | null = analyticsData.rows?.[0] ?? null;

    return res.status(200).json({
      days,
      startDate,
      endDate,
      subscriberCount: statistics?.subscriberCount ? Number(statistics.subscriberCount) : null,
      periodViews: row ? row[0] : null,
      periodSubsGained: row ? row[1] : null,
      periodSubsLost: row ? row[2] : null,
      weeklyViews: row ? row[0] : null,
      weeklySubsGained: row ? row[1] : null,
      weeklySubsLost: row ? row[2] : null,
      channelTitle: connection.channel_title,
      channelThumbnail: connection.channel_thumbnail_url,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
};

module.exports = handler;
