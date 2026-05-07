// @ts-nocheck
const { createClient } = require('@supabase/supabase-js');
const { createHash } = require('crypto');

const AUTH_HEADER_PREFIX = 'Bearer ';
const DAY_MS = 86400000;
const YOUTUBE_ANALYTICS_BASE_URL = 'https://youtubeanalytics.googleapis.com/v2/reports';
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

const BASE_METRICS = [
  'views',
  'engagedViews',
  'estimatedMinutesWatched',
  'averageViewDuration',
  'averageViewPercentage',
  'likes',
  'comments',
  'shares',
  'subscribersGained',
  'subscribersLost'
];

const REACH_METRICS = [
  'videoThumbnailImpressions',
  'videoThumbnailImpressionsClickRate'
];

function formatApiDate(timestamp: number): string {
  return new Date(timestamp).toISOString().split('T')[0];
}

function resolveDateWindows() {
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const endMs = todayStart.getTime() - 2 * DAY_MS;
  const currentStartMs = endMs - 6 * DAY_MS;
  const previousEndMs = currentStartMs - DAY_MS;
  const previousStartMs = previousEndMs - 6 * DAY_MS;
  const fullStartMs = endMs - 27 * DAY_MS;
  const fullPreviousEndMs = fullStartMs - DAY_MS;
  const fullPreviousStartMs = fullPreviousEndMs - 27 * DAY_MS;

  return {
    endDate: formatApiDate(endMs),
    currentStartDate: formatApiDate(currentStartMs),
    previousStartDate: formatApiDate(previousStartMs),
    previousEndDate: formatApiDate(previousEndMs),
    fullStartDate: formatApiDate(fullStartMs),
    fullPreviousStartDate: formatApiDate(fullPreviousStartMs),
    fullPreviousEndDate: formatApiDate(fullPreviousEndMs),
  };
}

async function resolveUserId(supabase: any, token: string): Promise<string | null> {
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const { data: session } = await supabase
    .from('extension_sessions')
    .select('user_id')
    .eq('access_token_hash', tokenHash)
    .is('revoked_at', null)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (session?.user_id) return session.user_id;

  const { data: { user } } = await supabase.auth.getUser(token);
  return user?.id ?? null;
}

async function getValidAccessToken(supabase: any, connection: any): Promise<string | null> {
  if (new Date(connection.token_expires_at) > new Date(Date.now() + 60_000)) {
    return connection.access_token;
  }

  if (!connection.refresh_token) return null;

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

async function safeJson(response: any) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function fetchAnalytics(accessToken: string, options: any, includeReach = true) {
  const metrics = includeReach ? BASE_METRICS.concat(REACH_METRICS) : BASE_METRICS;
  const url = new URL(YOUTUBE_ANALYTICS_BASE_URL);

  url.searchParams.set('ids', 'channel==MINE');
  url.searchParams.set('startDate', options.startDate);
  url.searchParams.set('endDate', options.endDate);
  url.searchParams.set('metrics', metrics.join(','));

  if (options.dimensions) url.searchParams.set('dimensions', options.dimensions);
  if (options.sort) url.searchParams.set('sort', options.sort);
  if (options.maxResults) url.searchParams.set('maxResults', String(options.maxResults));

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const payload = await safeJson(response);

  if (response.ok && !payload?.error) {
    return payload;
  }

  if (includeReach) {
    return fetchAnalytics(accessToken, options, false);
  }

  const error = new Error(payload?.error?.message || 'Could not load YouTube Analytics data.');
  error.status = response.status || 502;
  throw error;
}

function rowsToObjects(payload: any) {
  const headers = (payload?.columnHeaders || []).map((header: any) => header?.name);
  return (payload?.rows || []).map((row: any[]) => {
    return headers.reduce((entry: any, name: string, index: number) => {
      entry[name] = row[index];
      return entry;
    }, {});
  });
}

function toNumber(value: any): number {
  const next = Number(value);
  return Number.isFinite(next) ? next : 0;
}

function aggregateRows(rows: any[]) {
  const total = rows.reduce((sum: any, row: any) => {
    const views = toNumber(row.views);
    const impressions = toNumber(row.videoThumbnailImpressions);

    sum.views += views;
    sum.engagedViews += toNumber(row.engagedViews);
    sum.estimatedMinutesWatched += toNumber(row.estimatedMinutesWatched);
    sum.likes += toNumber(row.likes);
    sum.comments += toNumber(row.comments);
    sum.shares += toNumber(row.shares);
    sum.subscribersGained += toNumber(row.subscribersGained);
    sum.subscribersLost += toNumber(row.subscribersLost);
    sum.videoThumbnailImpressions += impressions;
    sum.weightedAverageViewDuration += toNumber(row.averageViewDuration) * views;
    sum.weightedAverageViewPercentage += toNumber(row.averageViewPercentage) * views;
    sum.weightedThumbnailClickRate += toNumber(row.videoThumbnailImpressionsClickRate) * impressions;
    return sum;
  }, {
    views: 0,
    engagedViews: 0,
    estimatedMinutesWatched: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    subscribersGained: 0,
    subscribersLost: 0,
    videoThumbnailImpressions: 0,
    weightedAverageViewDuration: 0,
    weightedAverageViewPercentage: 0,
    weightedThumbnailClickRate: 0,
  });

  return {
    views: total.views,
    engagedViews: total.engagedViews,
    watchHours: total.estimatedMinutesWatched / 60,
    averageViewDuration: total.views ? total.weightedAverageViewDuration / total.views : 0,
    averageViewPercentage: total.views ? total.weightedAverageViewPercentage / total.views : 0,
    likes: total.likes,
    comments: total.comments,
    shares: total.shares,
    engagementRate: total.views ? ((total.likes + total.comments + total.shares) / total.views) * 100 : 0,
    engagedViewRate: total.views ? (total.engagedViews / total.views) * 100 : 0,
    subscribersGained: total.subscribersGained,
    subscribersLost: total.subscribersLost,
    netSubscribers: total.subscribersGained - total.subscribersLost,
    videoThumbnailImpressions: total.videoThumbnailImpressions,
    thumbnailCtr: total.videoThumbnailImpressions ? total.weightedThumbnailClickRate / total.videoThumbnailImpressions : null,
    subsPerThousandViews: total.views ? ((total.subscribersGained - total.subscribersLost) / total.views) * 1000 : 0,
  };
}

function splitDailyRows(rows: any[], windows: any) {
  const sorted = rows
    .filter((row: any) => /^\d{4}-\d{2}-\d{2}$/.test(String(row.day || '')))
    .sort((left: any, right: any) => String(left.day).localeCompare(String(right.day)));

  return {
    previousRows: sorted.filter((row: any) => row.day >= windows.previousStartDate && row.day <= windows.previousEndDate),
    currentRows: sorted.filter((row: any) => row.day >= windows.currentStartDate && row.day <= windows.endDate),
  };
}

function buildDeltas(current: any, previous: any) {
  const keys = [
    'views',
    'engagedViews',
    'watchHours',
    'averageViewDuration',
    'averageViewPercentage',
    'engagementRate',
    'engagedViewRate',
    'netSubscribers',
    'thumbnailCtr',
    'subsPerThousandViews',
  ];

  return keys.reduce((deltas: any, key: string) => {
    const currentValue = current?.[key];
    const previousValue = previous?.[key];

    if (currentValue === null || currentValue === undefined || previousValue === null || previousValue === undefined) {
      deltas[key] = { absolute: null, percent: null };
      return deltas;
    }

    const absolute = currentValue - previousValue;
    deltas[key] = {
      absolute,
      percent: previousValue ? (absolute / Math.abs(previousValue)) * 100 : null,
    };
    return deltas;
  }, {});
}

async function fetchChannel(accessToken: string) {
  const url = new URL(`${YOUTUBE_API_BASE_URL}/channels`);
  url.searchParams.set('part', 'snippet,statistics,contentDetails,status');
  url.searchParams.set('mine', 'true');

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const payload = await safeJson(response);
  const channel = payload?.items?.[0];

  return {
    id: channel?.id || '',
    title: channel?.snippet?.title || '',
    thumbnailUrl: channel?.snippet?.thumbnails?.default?.url || channel?.snippet?.thumbnails?.medium?.url || null,
    subscriberCount: toNumber(channel?.statistics?.subscriberCount),
    videoCount: toNumber(channel?.statistics?.videoCount),
    viewCount: toNumber(channel?.statistics?.viewCount),
    uploadsPlaylistId: channel?.contentDetails?.relatedPlaylists?.uploads || '',
    madeForKids: channel?.status?.madeForKids ?? null,
  };
}

async function fetchVideoDetails(accessToken: string, videoIds: string[]) {
  if (!videoIds.length) return {};

  const url = new URL(`${YOUTUBE_API_BASE_URL}/videos`);
  url.searchParams.set('part', 'snippet,contentDetails,statistics,status');
  url.searchParams.set('id', videoIds.join(','));

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const payload = await safeJson(response);

  return (payload?.items || []).reduce((map: any, video: any) => {
    map[video.id] = video;
    return map;
  }, {});
}

async function buildSummary(accessToken: string, connection: any, windows: any) {
  const [channel, dailyPayload] = await Promise.all([
    fetchChannel(accessToken),
    fetchAnalytics(accessToken, {
      startDate: windows.previousStartDate,
      endDate: windows.endDate,
      dimensions: 'day',
      sort: 'day',
    }),
  ]);

  const dailyRows = rowsToObjects(dailyPayload);
  const { currentRows, previousRows } = splitDailyRows(dailyRows, windows);
  const current = aggregateRows(currentRows);
  const previous = aggregateRows(previousRows);

  return {
    generatedAt: new Date().toISOString(),
    cacheMaxAgeMs: 24 * 60 * 60 * 1000,
    period: {
      label: 'Last 7 complete days vs previous 7 days',
      currentStartDate: windows.currentStartDate,
      currentEndDate: windows.endDate,
      previousStartDate: windows.previousStartDate,
      previousEndDate: windows.previousEndDate,
    },
    channel: {
      id: channel.id || connection.channel_id,
      title: channel.title || connection.channel_title,
      thumbnailUrl: channel.thumbnailUrl || connection.channel_thumbnail_url,
      subscriberCount: channel.subscriberCount,
      videoCount: channel.videoCount,
      viewCount: channel.viewCount,
    },
    trendDays: currentRows.map((row: any) => ({
      date: row.day,
      views: toNumber(row.views),
      engagedViews: toNumber(row.engagedViews),
      subscribersGained: toNumber(row.subscribersGained),
      subscribersLost: toNumber(row.subscribersLost),
      engagementRate: toNumber(row.views) ? ((toNumber(row.likes) + toNumber(row.comments) + toNumber(row.shares)) / toNumber(row.views)) * 100 : 0,
      thumbnailCtr: row.videoThumbnailImpressions ? toNumber(row.videoThumbnailImpressionsClickRate) : null,
      averageViewDuration: toNumber(row.averageViewDuration),
    })),
    current,
    previous,
    deltas: buildDeltas(current, previous),
  };
}

function buildInsightText(summary: any, topVideos: any[]) {
  const current = summary.current;
  const previous = summary.previous;
  const deltas = summary.deltas;
  const insights = [];
  const opportunities = [];
  const actions = [];

  if ((deltas.views?.percent || 0) >= 10) {
    insights.push(`Views are up ${Math.round(deltas.views.percent)}% versus the previous 7 days.`);
  } else if ((deltas.views?.percent || 0) <= -10) {
    opportunities.push(`Views are down ${Math.abs(Math.round(deltas.views.percent))}% versus the previous 7 days. Review topics, thumbnails, and publish cadence from the last week.`);
  } else {
    insights.push('Views are roughly steady compared to the previous week.');
  }

  if (current.thumbnailCtr !== null) {
    if (current.thumbnailCtr < 4) {
      opportunities.push('Thumbnail CTR is under 4%, so packaging is the clearest improvement area.');
      actions.push('Rewrite titles and test clearer thumbnail contrast on the next 3 uploads.');
    } else if (current.thumbnailCtr >= 7) {
      insights.push('Thumbnail CTR is strong, which suggests your topics and packaging are earning clicks.');
    }
  }

  if (current.engagementRate >= previous.engagementRate && current.engagementRate > 0) {
    insights.push('Engagement rate is holding up, which is a good signal that recent viewers are reacting.');
  } else if (previous.engagementRate > 0) {
    opportunities.push('Engagement rate softened. Add stronger comment prompts and clearer viewer payoff moments.');
  }

  if (current.averageViewDuration < previous.averageViewDuration && previous.averageViewDuration > 0) {
    opportunities.push('Average view duration fell compared with the previous week. Tighten intros and remove slow setup.');
  } else if (current.averageViewDuration > 0) {
    insights.push('Average view duration is stable or improving versus the previous week.');
  }

  if (current.subsPerThousandViews > previous.subsPerThousandViews && current.subsPerThousandViews > 0) {
    insights.push('Subscriber conversion improved, meaning recent viewers are more likely to become subscribers.');
  } else {
    actions.push('Add one clear subscribe reason near the strongest value moment, not only at the end.');
  }

  const topVideo = topVideos[0];
  if (topVideo) {
    insights.push(`Top recent video: "${topVideo.title}" drove ${topVideo.views.toLocaleString('en-US')} views.`);
    actions.push(`Study the hook and packaging from "${topVideo.title}" for the next related upload.`);
  }

  return {
    insights: insights.slice(0, 5),
    opportunities: opportunities.slice(0, 5),
    actions: actions.slice(0, 5),
  };
}

async function buildFullAnalysis(accessToken: string, summary: any, windows: any) {
  const [fullCurrentPayload, fullPreviousPayload, topVideosPayload] = await Promise.all([
    fetchAnalytics(accessToken, {
      startDate: windows.fullStartDate,
      endDate: windows.endDate,
      dimensions: 'day',
      sort: 'day',
    }),
    fetchAnalytics(accessToken, {
      startDate: windows.fullPreviousStartDate,
      endDate: windows.fullPreviousEndDate,
      dimensions: 'day',
      sort: 'day',
    }),
    fetchAnalytics(accessToken, {
      startDate: windows.fullStartDate,
      endDate: windows.endDate,
      dimensions: 'video',
      sort: '-views',
      maxResults: 8,
    }),
  ]);

  const fullCurrent = aggregateRows(rowsToObjects(fullCurrentPayload));
  const fullPrevious = aggregateRows(rowsToObjects(fullPreviousPayload));
  const videoRows = rowsToObjects(topVideosPayload);
  const videoIds = videoRows.map((row: any) => String(row.video || '')).filter(Boolean);
  const videoDetails = await fetchVideoDetails(accessToken, videoIds);

  const topVideos = videoRows.map((row: any) => {
    const details = videoDetails[row.video] || {};
    const thumbnail = details?.snippet?.thumbnails?.medium?.url ||
      details?.snippet?.thumbnails?.default?.url ||
      details?.snippet?.thumbnails?.high?.url ||
      null;

    return {
      id: row.video,
      title: details?.snippet?.title || row.video,
      thumbnailUrl: thumbnail,
      publishedAt: details?.snippet?.publishedAt || null,
      views: toNumber(row.views),
      watchHours: toNumber(row.estimatedMinutesWatched) / 60,
      averageViewDuration: toNumber(row.averageViewDuration),
      averageViewPercentage: toNumber(row.averageViewPercentage),
      engagementRate: toNumber(row.views) ? ((toNumber(row.likes) + toNumber(row.comments) + toNumber(row.shares)) / toNumber(row.views)) * 100 : 0,
      thumbnailCtr: row.videoThumbnailImpressions ? toNumber(row.videoThumbnailImpressionsClickRate) : null,
      netSubscribers: toNumber(row.subscribersGained) - toNumber(row.subscribersLost),
    };
  });

  const text = buildInsightText(summary, topVideos);

  return {
    generatedAt: new Date().toISOString(),
    period: {
      label: 'Last 28 complete days',
      startDate: windows.fullStartDate,
      endDate: windows.endDate,
      previousStartDate: windows.fullPreviousStartDate,
      previousEndDate: windows.fullPreviousEndDate,
    },
    current: fullCurrent,
    previous: fullPrevious,
    deltas: buildDeltas(fullCurrent, fullPrevious),
    topVideos,
    ...text,
  };
}

const handler = async (req: any, res: any) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith(AUTH_HEADER_PREFIX)) {
      return res.status(401).json({ error: 'unauthorized' });
    }

    const supabase = createClient(
      process.env.REACT_APP_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const userId = await resolveUserId(supabase, authHeader.slice(AUTH_HEADER_PREFIX.length));
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

    const windows = resolveDateWindows();
    const summary = await buildSummary(accessToken, connection, windows);

    if (String(req.query?.full || '') === '1') {
      const fullAnalysis = await buildFullAnalysis(accessToken, summary, windows);
      return res.status(200).json({ ...summary, fullAnalysis });
    }

    return res.status(200).json(summary);
  } catch (err: any) {
    const status = Number(err?.status || 500);
    return res.status(status >= 400 && status < 600 ? status : 500).json({
      error: 'account_dashboard_failed',
      message: err?.message || 'Could not load account analytics.',
    });
  }
};

module.exports = handler;
