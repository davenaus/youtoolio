// @ts-nocheck
const { createClient } = require('@supabase/supabase-js');
const { createHash } = require('crypto');
const { storeAccountDashboardAnalytics } = require('../../lib/youtube-analytics-store');
const { analyzeThumbnailUrl } = require('../../lib/thumbnail-visual-features');

const AUTH_HEADER_PREFIX = 'Bearer ';
const DAY_MS = 86400000;
const YOUTUBE_ANALYTICS_BASE_URL = 'https://youtubeanalytics.googleapis.com/v2/reports';
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

const SUMMARY_METRICS = [
  'views',
  'engagedViews',
  'redViews',
  'estimatedMinutesWatched',
  'estimatedRedMinutesWatched',
  'averageViewDuration',
  'averageViewPercentage',
  'likes',
  'dislikes',
  'comments',
  'shares',
  'videosAddedToPlaylists',
  'videosRemovedFromPlaylists',
  'cardImpressions',
  'cardClicks',
  'cardTeaserImpressions',
  'cardTeaserClicks',
  'subscribersGained',
  'subscribersLost'
];

const VIDEO_METRICS = [
  'views',
  'engagedViews',
  'redViews',
  'estimatedMinutesWatched',
  'estimatedRedMinutesWatched',
  'averageViewDuration',
  'averageViewPercentage',
  'likes',
  'dislikes',
  'comments',
  'shares',
  'videosAddedToPlaylists',
  'videosRemovedFromPlaylists',
  'cardImpressions',
  'cardClicks',
  'cardTeaserImpressions',
  'cardTeaserClicks',
  'subscribersGained',
  'subscribersLost'
];

const SEGMENT_METRICS = [
  'views',
  'engagedViews',
  'estimatedMinutesWatched'
];

const REACH_METRICS = [
  'videoThumbnailImpressions',
  'videoThumbnailImpressionsClickRate'
];

const RETENTION_METRICS = [
  'audienceWatchRatio',
  'relativeRetentionPerformance',
  'startedWatching',
  'stoppedWatching',
  'totalSegmentImpressions'
];

const PLAYLIST_ANALYTICS_METRICS = [
  'playlistViews',
  'playlistEstimatedMinutesWatched',
  'playlistStarts',
  'playlistSaves',
  'viewsPerPlaylistStart',
  'averageTimeInPlaylist'
];

const FULL_ANALYSIS_VIDEO_LIMIT = 50;
const RECENT_UPLOAD_VIDEO_LIMIT = 50;
const VIDEO_DAILY_ROW_LIMIT = 500;
const VIDEO_DAILY_VIDEO_CHUNK_SIZE = 10;
const VIDEO_DAILY_FALLBACK_VIDEO_LIMIT = 12;
const RETENTION_VIDEO_LIMIT = 5;
const RETENTION_ROW_LIMIT = 120;
const PLAYLIST_DATA_LIMIT = 25;
const PLAYLIST_ANALYTICS_LIMIT = 10;
const THUMBNAIL_VISUAL_ANALYSIS_LIMIT = 50;
const THUMBNAIL_VISUAL_ANALYSIS_CONCURRENCY = 3;
const FULL_ANALYSIS_MODEL_VERSION = 'account-dashboard-v3';
const FULL_ANALYSIS_SERVER_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const ADMIN_RESEARCH_EMAIL_HASH = '7d44cddbb1d4279022486b6195df17a232ccc8365bf0d89b2a971b8481f08bb8';
const ADMIN_TABLE_PAGE_SIZE = 1000;
const ADMIN_TABLE_MAX_ROWS = 100000;
const EMOTIONAL_TITLE_WORDS = new Set([
  'best', 'worst', 'secret', 'shocking', 'insane', 'crazy', 'brutal', 'honest', 'truth',
  'mistake', 'mistakes', 'failed', 'perfect', 'easy', 'hard', 'love', 'hate', 'stop',
  'never', 'always', 'finally', 'ultimate', 'hidden', 'exposed', 'warning', 'surprising'
]);

function formatApiDate(timestamp: number): string {
  return new Date(timestamp).toISOString().split('T')[0];
}

function isAdminResearchUser(user: any) {
  const email = String(user?.email || '').trim().toLowerCase();
  if (!email) return false;
  return createHash('sha256').update(email).digest('hex') === ADMIN_RESEARCH_EMAIL_HASH;
}

function parseIsoDuration(duration: string): number {
  const match = String(duration || '').match(/^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return 0;
  const [, days, hours, minutes, seconds] = match;
  return (
    toNumber(days) * 86400 +
    toNumber(hours) * 3600 +
    toNumber(minutes) * 60 +
    toNumber(seconds)
  );
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
  const requestUser = await resolveRequestUser(supabase, token);
  return requestUser?.id || null;
}

async function resolveRequestUser(supabase: any, token: string): Promise<{ id: string; email: string | null } | null> {
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const { data: session } = await supabase
    .from('extension_sessions')
    .select('user_id')
    .eq('access_token_hash', tokenHash)
    .is('revoked_at', null)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (session?.user_id) return { id: session.user_id, email: null };

  const { data: { user } } = await supabase.auth.getUser(token);
  return user?.id ? { id: user.id, email: user.email || null } : null;
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

async function fetchAnalytics(accessToken: string, options: any) {
  const baseMetrics = options.metrics || SUMMARY_METRICS;
  const metrics = options.includeReach === false ? baseMetrics : baseMetrics.concat(REACH_METRICS);
  const url = new URL(YOUTUBE_ANALYTICS_BASE_URL);

  url.searchParams.set('ids', 'channel==MINE');
  url.searchParams.set('startDate', options.startDate);
  url.searchParams.set('endDate', options.endDate);
  url.searchParams.set('metrics', metrics.join(','));

  if (options.dimensions) url.searchParams.set('dimensions', options.dimensions);
  if (options.sort) url.searchParams.set('sort', options.sort);
  if (options.maxResults) url.searchParams.set('maxResults', String(options.maxResults));
  if (options.filters) url.searchParams.set('filters', options.filters);

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const payload = await safeJson(response);

  if (response.ok && !payload?.error) {
    return payload;
  }

  if (options.includeReach !== false) {
    return fetchAnalytics(accessToken, { ...options, includeReach: false });
  }

  const error = new Error(payload?.error?.message || 'Could not load YouTube Analytics data.');
  error.status = response.status || 502;
  error.reason = payload?.error?.errors?.[0]?.reason || payload?.error?.status || null;
  error.payload = payload?.error || payload || null;
  error.request = {
    dimensions: options.dimensions || null,
    filters: options.filters || null,
    metrics: baseMetrics,
    includeReach: options.includeReach !== false,
  };
  throw error;
}

function compactDiagnosticOptions(options: any) {
  return {
    label: options.label || options.dimensions || options.filters || 'analytics',
    dimensions: options.dimensions || null,
    filters: options.filters || null,
    metrics: options.metrics || SUMMARY_METRICS,
    includeReach: options.includeReach !== false,
  };
}

function analyticsDiagnostic(status: string, options: any, payload: any = null, error: any = null) {
  return {
    ...compactDiagnosticOptions(options),
    status,
    rows: Array.isArray(payload?.rows) ? payload.rows.length : 0,
    message: error?.message || payload?.error?.message || null,
    reason: error?.reason || payload?.error?.errors?.[0]?.reason || payload?.error?.status || null,
    httpStatus: error?.status || null,
  };
}

async function fetchOptionalAnalytics(accessToken: string, options: any) {
  try {
    const payload = await fetchAnalytics(accessToken, options);
    return {
      ...payload,
      _diagnostic: analyticsDiagnostic('ok', options, payload),
    };
  } catch (error) {
    return {
      columnHeaders: [],
      rows: [],
      _diagnostic: analyticsDiagnostic('error', options, null, error),
    };
  }
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

function ratio(numerator: number, denominator: number): number {
  return denominator ? (numerator / denominator) * 100 : 0;
}

function aggregateRows(rows: any[]) {
  const total = rows.reduce((sum: any, row: any) => {
    const views = toNumber(row.views);
    const impressions = toNumber(row.videoThumbnailImpressions);
    const cardImpressions = toNumber(row.cardImpressions);
    const cardTeaserImpressions = toNumber(row.cardTeaserImpressions);

    sum.views += views;
    sum.engagedViews += toNumber(row.engagedViews);
    sum.redViews += toNumber(row.redViews);
    sum.estimatedMinutesWatched += toNumber(row.estimatedMinutesWatched);
    sum.estimatedRedMinutesWatched += toNumber(row.estimatedRedMinutesWatched);
    sum.likes += toNumber(row.likes);
    sum.dislikes += toNumber(row.dislikes);
    sum.comments += toNumber(row.comments);
    sum.shares += toNumber(row.shares);
    sum.videosAddedToPlaylists += toNumber(row.videosAddedToPlaylists);
    sum.videosRemovedFromPlaylists += toNumber(row.videosRemovedFromPlaylists);
    sum.cardImpressions += cardImpressions;
    sum.cardClicks += toNumber(row.cardClicks);
    sum.cardTeaserImpressions += cardTeaserImpressions;
    sum.cardTeaserClicks += toNumber(row.cardTeaserClicks);
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
    redViews: 0,
    estimatedMinutesWatched: 0,
    estimatedRedMinutesWatched: 0,
    likes: 0,
    dislikes: 0,
    comments: 0,
    shares: 0,
    videosAddedToPlaylists: 0,
    videosRemovedFromPlaylists: 0,
    cardImpressions: 0,
    cardClicks: 0,
    cardTeaserImpressions: 0,
    cardTeaserClicks: 0,
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
    redViews: total.redViews,
    watchHours: total.estimatedMinutesWatched / 60,
    premiumWatchHours: total.estimatedRedMinutesWatched / 60,
    averageViewDuration: total.views ? total.weightedAverageViewDuration / total.views : 0,
    averageViewPercentage: total.views ? total.weightedAverageViewPercentage / total.views : 0,
    likes: total.likes,
    dislikes: total.dislikes,
    comments: total.comments,
    shares: total.shares,
    videosAddedToPlaylists: total.videosAddedToPlaylists,
    videosRemovedFromPlaylists: total.videosRemovedFromPlaylists,
    playlistNetAdds: total.videosAddedToPlaylists - total.videosRemovedFromPlaylists,
    cardImpressions: total.cardImpressions,
    cardClicks: total.cardClicks,
    cardClickRate: ratio(total.cardClicks, total.cardImpressions),
    cardTeaserImpressions: total.cardTeaserImpressions,
    cardTeaserClicks: total.cardTeaserClicks,
    cardTeaserClickRate: ratio(total.cardTeaserClicks, total.cardTeaserImpressions),
    engagementRate: ratio(total.likes + total.comments + total.shares, total.views),
    engagedViewRate: ratio(total.engagedViews, total.views),
    premiumViewRate: ratio(total.redViews, total.views),
    likeRate: ratio(total.likes, total.views),
    commentRate: ratio(total.comments, total.views),
    shareRate: ratio(total.shares, total.views),
    playlistAddRate: ratio(total.videosAddedToPlaylists, total.views),
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
    'redViews',
    'watchHours',
    'premiumWatchHours',
    'averageViewDuration',
    'averageViewPercentage',
    'engagementRate',
    'engagedViewRate',
    'premiumViewRate',
    'netSubscribers',
    'thumbnailCtr',
    'subsPerThousandViews',
    'playlistNetAdds',
    'playlistAddRate',
    'cardClickRate',
    'cardTeaserClickRate',
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

function humanizeSegmentLabel(value: string): string {
  const labels: Record<string, string> = {
    ADVERTISING: 'Ads',
    ANNOTATION: 'Annotations',
    BROWSE: 'Browse',
    CHANNEL: 'Channel pages',
    CORE: 'YouTube',
    DESKTOP: 'Desktop',
    EMBEDDED: 'Embedded',
    END_SCREEN: 'End screens',
    EXT_URL: 'External',
    GAME_CONSOLE: 'Game console',
    GAMING: 'Gaming',
    HASHTAGS: 'Hashtags',
    KIDS: 'YouTube Kids',
    LIVE: 'Live',
    LIVE_STREAM: 'Live streams',
    MOBILE: 'Mobile',
    MUSIC: 'YouTube Music',
    NO_LINK_EMBEDDED: 'Embedded/direct',
    NO_LINK_OTHER: 'Direct/unknown',
    NOTIFICATION: 'Notifications',
    ON_DEMAND: 'On demand',
    PLAYLIST: 'Playlists',
    PRODUCT_PAGE: 'Product pages',
    RELATED_VIDEO: 'Suggested videos',
    SHORTS: 'Shorts',
    STORY: 'Stories',
    SUBSCRIBED: 'Subscribed viewers',
    SUBSCRIBER: 'Subscriber feeds',
    TABLET: 'Tablet',
    TV: 'TV',
    UNKNOWN: 'Unknown',
    UNKNOWN_PLATFORM: 'Unknown',
    UNSPECIFIED: 'Unspecified',
    UNSUBSCRIBED: 'Not subscribed',
    VIDEO_ON_DEMAND: 'Long-form videos',
    WEARABLE: 'Wearable',
    YT_CHANNEL: 'Channel pages',
    YT_OTHER_PAGE: 'Other YouTube',
    YT_SEARCH: 'YouTube search',
  };

  return labels[value] || String(value || 'Unknown').toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatCountryLabel(value: string): string {
  try {
    const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
    return displayNames.of(value) || value;
  } catch {
    return value;
  }
}

function buildSegmentRows(payload: any, dimension: string, totalViews: number, maxRows = 6) {
  return rowsToObjects(payload)
    .map((row: any) => {
      const views = toNumber(row.views);
      const watchHours = toNumber(row.estimatedMinutesWatched) / 60;
      const key = String(row[dimension] || '');
      const label = dimension === 'country'
        ? formatCountryLabel(key)
        : dimension === 'insightTrafficSourceDetail'
          ? key
          : humanizeSegmentLabel(key);
      return {
        key,
        label,
        views,
        engagedViews: toNumber(row.engagedViews),
        watchHours,
        shareOfViews: ratio(views, totalViews),
        engagedViewRate: ratio(toNumber(row.engagedViews), views),
      };
    })
    .filter((row: any) => row.key && (row.views > 0 || row.watchHours > 0))
    .sort((left: any, right: any) => right.views - left.views)
    .slice(0, maxRows);
}

function buildDemographicRows(payload: any, totalPercentage = 100, maxRows = 8) {
  return rowsToObjects(payload)
    .map((row: any) => {
      const ageGroup = String(row.ageGroup || '');
      const gender = String(row.gender || '');
      const viewerPercentage = toNumber(row.viewerPercentage);
      const label = [ageGroup, gender]
        .filter(Boolean)
        .map((value) => humanizeSegmentLabel(value))
        .join(' · ');

      return {
        key: `${ageGroup}:${gender}`,
        label: label || 'Unknown',
        viewerPercentage,
        shareOfKnownAudience: totalPercentage ? (viewerPercentage / totalPercentage) * 100 : viewerPercentage,
      };
    })
    .filter((row: any) => row.viewerPercentage > 0)
    .sort((left: any, right: any) => right.viewerPercentage - left.viewerPercentage)
    .slice(0, maxRows);
}

async function fetchChannel(accessToken: string) {
  const url = new URL(`${YOUTUBE_API_BASE_URL}/channels`);
  url.searchParams.set('part', 'snippet,statistics,contentDetails,status,brandingSettings,topicDetails,localizations');
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
    customUrl: channel?.snippet?.customUrl || null,
    country: channel?.snippet?.country || channel?.brandingSettings?.channel?.country || null,
    defaultLanguage: channel?.snippet?.defaultLanguage || channel?.brandingSettings?.channel?.defaultLanguage || null,
    description: channel?.snippet?.description || '',
    publishedAt: channel?.snippet?.publishedAt || null,
    topicCategories: channel?.topicDetails?.topicCategories || [],
    localized: channel?.snippet?.localized || {},
    branding: channel?.brandingSettings || {},
    status: channel?.status || {},
    raw: channel || {},
  };
}

async function fetchVideoDetails(accessToken: string, videoIds: string[]) {
  const uniqueIds = Array.from(new Set(videoIds.filter(Boolean)));
  if (!uniqueIds.length) return {};

  const chunks = [];
  for (let index = 0; index < uniqueIds.length; index += 50) {
    chunks.push(uniqueIds.slice(index, index + 50));
  }

  const maps = await Promise.all(chunks.map(async (chunk) => {
    const url = new URL(`${YOUTUBE_API_BASE_URL}/videos`);
    url.searchParams.set('part', 'snippet,contentDetails,statistics,status,topicDetails,localizations');
    url.searchParams.set('id', chunk.join(','));

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const payload = await safeJson(response);

    return (payload?.items || []).reduce((map: any, video: any) => {
      map[video.id] = video;
      return map;
    }, {});
  }));

  return maps.reduce((merged: any, map: any) => ({ ...merged, ...map }), {});
}

async function fetchRecentUploadVideoIds(accessToken: string, uploadsPlaylistId: string, maxResults = RECENT_UPLOAD_VIDEO_LIMIT) {
  if (!uploadsPlaylistId) return [];

  const ids: string[] = [];
  let pageToken = '';

  while (ids.length < maxResults) {
    const url = new URL(`${YOUTUBE_API_BASE_URL}/playlistItems`);
    url.searchParams.set('part', 'contentDetails');
    url.searchParams.set('playlistId', uploadsPlaylistId);
    url.searchParams.set('maxResults', String(Math.min(50, maxResults - ids.length)));
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const payload = await safeJson(response);
    if (!response.ok || payload?.error) break;

    (payload?.items || []).forEach((item: any) => {
      const videoId = item?.contentDetails?.videoId;
      if (videoId) ids.push(videoId);
    });

    pageToken = payload?.nextPageToken || '';
    if (!pageToken) break;
  }

  return ids;
}

function resolveBestThumbnail(thumbnails: any) {
  return thumbnails?.maxres?.url ||
    thumbnails?.standard?.url ||
    thumbnails?.high?.url ||
    thumbnails?.medium?.url ||
    thumbnails?.default?.url ||
    null;
}

function normalizeThumbnailUrlForFingerprint(url: string) {
  const value = String(url || '').trim();
  if (!value) return '';

  try {
    const parsed = new URL(value);
    parsed.search = '';
    parsed.hash = '';
    return `${parsed.hostname}${parsed.pathname}`.toLowerCase();
  } catch {
    return value.split('?')[0].split('#')[0].toLowerCase();
  }
}

function thumbnailFingerprintForUrl(url: string) {
  const normalized = normalizeThumbnailUrlForFingerprint(url);
  if (!normalized) return '';
  return createHash('sha256').update(normalized).digest('hex');
}

function buildThumbnailFeatures(video: any) {
  const thumbnails = video?.snippet?.thumbnails || {};
  const entries = Object.values(thumbnails).filter(Boolean) as any[];
  const largest = entries
    .slice()
    .sort((left: any, right: any) => toNumber(right.width) * toNumber(right.height) - toNumber(left.width) * toNumber(left.height))[0];

  return {
    hasDefault: Boolean(thumbnails.default?.url),
    hasHigh: Boolean(thumbnails.high?.url),
    hasStandard: Boolean(thumbnails.standard?.url),
    hasMaxres: Boolean(thumbnails.maxres?.url),
    largestWidth: toNumber(largest?.width),
    largestHeight: toNumber(largest?.height),
    largestAspectRatio: largest?.height ? toNumber(largest.width) / toNumber(largest.height) : null,
  };
}

async function readStoredThumbnailFeatureCache(supabase: any, userId: string, channelId: string) {
  if (!supabase || !userId || !channelId) return new Map();

  const { data, error } = await supabase
    .from('youtube_video_snapshots')
    .select('thumbnail_url,thumbnail_features,updated_at')
    .eq('user_id', userId)
    .eq('channel_id', channelId)
    .not('thumbnail_url', 'is', null)
    .order('updated_at', { ascending: false })
    .limit(2000);

  if (error) {
    console.warn('[account-dashboard] read thumbnail feature cache:', error.message);
    return new Map();
  }

  const cache = new Map();
  (data || []).forEach((row: any) => {
    const features = row?.thumbnail_features || {};
    const fingerprint = features.thumbnailFingerprint || thumbnailFingerprintForUrl(row?.thumbnail_url || '');
    if (!fingerprint || !features.visual || cache.has(fingerprint)) return;

    cache.set(fingerprint, {
      visual: features.visual,
      visualAnalyzedAt: features.visualAnalyzedAt || row.updated_at || null,
    });
  });

  return cache;
}

async function enrichThumbnailVisualFeatures(videos: any[], storedFeatureCache = new Map()) {
  const targets = new Map<string, { fingerprint: string; url: string; videos: any[] }>();

  videos.forEach((video) => {
    const url = String(video?.thumbnailUrl || '').trim();
    if (!url) return;
    const fingerprint = thumbnailFingerprintForUrl(url);
    if (!fingerprint) return;

    video.thumbnailFeatures = {
      ...(video.thumbnailFeatures || {}),
      thumbnailFingerprint: fingerprint,
    };

    const storedFeatures = storedFeatureCache.get(fingerprint);
    if (storedFeatures?.visual) {
      video.thumbnailFeatures = {
        ...(video.thumbnailFeatures || {}),
        thumbnailFingerprint: fingerprint,
        visual: storedFeatures.visual,
        visualAnalyzedAt: storedFeatures.visualAnalyzedAt || null,
        visualSource: 'stored',
      };
      return;
    }

    const current = targets.get(fingerprint) || { fingerprint, url, videos: [] };
    current.videos.push(video);
    targets.set(fingerprint, current);
  });

  const entries = Array.from(targets.values()).slice(0, THUMBNAIL_VISUAL_ANALYSIS_LIMIT);

  for (let index = 0; index < entries.length; index += THUMBNAIL_VISUAL_ANALYSIS_CONCURRENCY) {
    const batch = entries.slice(index, index + THUMBNAIL_VISUAL_ANALYSIS_CONCURRENCY);

    await Promise.all(batch.map(async (entry) => {
      try {
        const visual = await analyzeThumbnailUrl(entry.url);
        if (!visual) return;

        entry.videos.forEach((video) => {
          video.thumbnailFeatures = {
            ...(video.thumbnailFeatures || {}),
            thumbnailFingerprint: entry.fingerprint,
            visual,
            visualAnalyzedAt: new Date().toISOString(),
            visualSource: 'fresh',
          };
        });
      } catch {
        // Thumbnail visual features are useful, but they should never block account analytics.
      }
    }));
  }
}

function normalizeVideoMetadata(video: any, analyticsRow: any = {}) {
  const durationSeconds = parseIsoDuration(video?.contentDetails?.duration || '');
  const title = video?.snippet?.title || analyticsRow.title || video?.id || '';
  const thumbnailUrl = resolveBestThumbnail(video?.snippet?.thumbnails) || analyticsRow.thumbnailUrl || null;
  const thumbnailFeatures = buildThumbnailFeatures(video);
  const thumbnailFingerprint = thumbnailFingerprintForUrl(thumbnailUrl || '');

  return {
    id: video?.id || analyticsRow.video || '',
    title,
    description: video?.snippet?.description || '',
    thumbnailUrl,
    publishedAt: video?.snippet?.publishedAt || analyticsRow.publishedAt || null,
    durationIso: video?.contentDetails?.duration || null,
    durationSeconds,
    categoryId: video?.snippet?.categoryId || null,
    tags: video?.snippet?.tags || [],
    defaultLanguage: video?.snippet?.defaultLanguage || null,
    defaultAudioLanguage: video?.snippet?.defaultAudioLanguage || null,
    privacyStatus: video?.status?.privacyStatus || null,
    uploadStatus: video?.status?.uploadStatus || null,
    madeForKids: video?.status?.madeForKids ?? null,
    caption: video?.contentDetails?.caption === 'true',
    definition: video?.contentDetails?.definition || null,
    dimension: video?.contentDetails?.dimension || null,
    liveBroadcastContent: video?.snippet?.liveBroadcastContent || null,
    topicCategories: video?.topicDetails?.topicCategories || [],
    localized: video?.snippet?.localized || {},
    viewCount: toNumber(video?.statistics?.viewCount),
    likeCount: toNumber(video?.statistics?.likeCount),
    commentCount: toNumber(video?.statistics?.commentCount),
    isShortGuess: durationSeconds > 0 && durationSeconds <= 180,
    thumbnailFeatures: {
      ...thumbnailFeatures,
      ...(thumbnailFingerprint ? { thumbnailFingerprint } : {}),
    },
    raw: video || {},
  };
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
      uploadsPlaylistId: channel.uploadsPlaylistId,
      description: channel.description,
      customUrl: channel.customUrl,
      country: channel.country,
      defaultLanguage: channel.defaultLanguage,
      publishedAt: channel.publishedAt,
      topicCategories: channel.topicCategories,
      localized: channel.localized,
      branding: channel.branding,
      status: channel.status,
    },
    trendDays: currentRows.map((row: any) => ({
      date: row.day,
      views: toNumber(row.views),
      engagedViews: toNumber(row.engagedViews),
      subscribersGained: toNumber(row.subscribersGained),
      subscribersLost: toNumber(row.subscribersLost),
      engagementRate: ratio(toNumber(row.likes) + toNumber(row.comments) + toNumber(row.shares), toNumber(row.views)),
      thumbnailCtr: row.videoThumbnailImpressions ? toNumber(row.videoThumbnailImpressionsClickRate) : null,
      averageViewDuration: toNumber(row.averageViewDuration),
      averageViewPercentage: toNumber(row.averageViewPercentage),
    })),
    current,
    previous,
    deltas: buildDeltas(current, previous),
  };
}

function buildInsightText(summary: any, topVideos: any[], breakdowns: any) {
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

  if (current.engagedViews > 0) {
    insights.push(`${current.engagedViews.toLocaleString('en-US')} engaged views came from viewers who stayed past the opening seconds.`);
  }

  if (current.playlistNetAdds > 0) {
    insights.push(`Videos earned ${current.playlistNetAdds.toLocaleString('en-US')} net playlist saves, a useful signal for repeat discovery.`);
  } else if (current.views > 0) {
    opportunities.push('Playlist saves are flat or negative. Add stronger save-worthy formats like tutorials, checklists, or repeat-reference videos.');
  }

  if (current.cardImpressions > 0 && current.cardClickRate < 1) {
    opportunities.push('Card click rate is under 1%. Use cards only at moments where the next video is truly relevant.');
  }

  const topTrafficSource = breakdowns?.trafficSources?.[0];
  if (topTrafficSource) {
    insights.push(`${topTrafficSource.label} is the top discovery source at ${Math.round(topTrafficSource.shareOfViews)}% of views.`);
    if (['YouTube search', 'Suggested videos', 'Browse', 'Shorts'].includes(topTrafficSource.label)) {
      actions.push(`Make the next upload intentionally serve ${topTrafficSource.label.toLowerCase()} with matching titles, thumbnails, and opening hooks.`);
    }
  }

  const topContentType = breakdowns?.contentTypes?.[0];
  if (topContentType) {
    insights.push(`${topContentType.label} is carrying ${Math.round(topContentType.shareOfViews)}% of views in this period.`);
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

function compact(value: number | null | undefined, digits = 1) {
  const next = Number(value || 0);
  return new Intl.NumberFormat('en-US', {
    notation: Math.abs(next) >= 10000 ? 'compact' : 'standard',
    maximumFractionDigits: Math.abs(next) >= 10000 ? digits : 0,
  }).format(next);
}

function pct(value: number | null | undefined, digits = 1) {
  const next = Number(value);
  if (!Number.isFinite(next)) return 'not enough data';
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: digits }).format(next)}%`;
}

function secondsToLabel(seconds: number | null | undefined) {
  const total = Math.round(Number(seconds || 0));
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  if (minutes >= 60) return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

function item(label: string, answer: string, confidence = 'Live') {
  return { label, answer, confidence };
}

function median(values: number[]) {
  const sorted = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function percentile(values: number[], percent: number) {
  const sorted = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil((percent / 100) * sorted.length) - 1));
  return sorted[index];
}

function pearsonByKey(pairs: any[], leftKey: string, rightKey: string) {
  const points = pairs
    .map((entry) => [Number(entry[leftKey]), Number(entry[rightKey])])
    .filter(([left, right]) => Number.isFinite(left) && Number.isFinite(right));

  if (points.length < 3) return null;

  const leftMean = points.reduce((sum, point) => sum + point[0], 0) / points.length;
  const rightMean = points.reduce((sum, point) => sum + point[1], 0) / points.length;
  let numerator = 0;
  let leftVariance = 0;
  let rightVariance = 0;

  points.forEach(([left, right]) => {
    const leftDelta = left - leftMean;
    const rightDelta = right - rightMean;
    numerator += leftDelta * rightDelta;
    leftVariance += leftDelta ** 2;
    rightVariance += rightDelta ** 2;
  });

  const denominator = Math.sqrt(leftVariance * rightVariance);
  return denominator ? numerator / denominator : null;
}

function correlationLabel(value: number | null) {
  if (value === null) return 'Needs at least 3 matching videos.';
  const strength = Math.abs(value) >= 0.7 ? 'strong' : Math.abs(value) >= 0.4 ? 'moderate' : Math.abs(value) >= 0.2 ? 'light' : 'weak';
  const direction = value > 0 ? 'positive' : value < 0 ? 'negative' : 'flat';
  return `${strength} ${direction} relationship (r=${value.toFixed(2)})`;
}

function groupStats(rows: any[], keyFn: (row: any) => string, valueFn: (row: any) => number) {
  const groups = new Map();
  rows.forEach((row) => {
    const key = keyFn(row);
    const value = valueFn(row);
    if (!key || !Number.isFinite(value)) return;
    const current = groups.get(key) || { key, count: 0, total: 0 };
    current.count += 1;
    current.total += value;
    groups.set(key, current);
  });

  return Array.from(groups.values())
    .map((group) => ({ ...group, average: group.count ? group.total / group.count : 0 }))
    .sort((left, right) => right.average - left.average);
}

function weekdayLabel(dateValue: string | null | undefined) {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
}

function hourLabel(dateValue: string | null | undefined) {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';
  const hour = date.getUTCHours();
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour} ${suffix} UTC`;
}

function durationBucket(seconds: number) {
  if (!seconds) return 'Unknown length';
  if (seconds <= 60) return '0-60 seconds';
  if (seconds <= 180) return '1-3 minutes';
  if (seconds <= 480) return '3-8 minutes';
  if (seconds <= 900) return '8-15 minutes';
  if (seconds <= 1800) return '15-30 minutes';
  return '30+ minutes';
}

function titleFeatures(video: any) {
  const title = String(video.title || '');
  const words = title.toLowerCase().match(/[a-z0-9]+/g) || [];
  const emotionalWords = ['best', 'worst', 'secret', 'shocking', 'easy', 'hard', 'mistake', 'truth', 'insane', 'powerful', 'fast', 'slow'];
  return {
    titleLength: title.length,
    titleWordCount: words.length,
    hasNumber: /\d/.test(title),
    hasQuestion: title.includes('?'),
    emotionalWordCount: words.filter((word) => emotionalWords.includes(word)).length,
    uppercaseShare: title.length ? ((title.match(/[A-Z]/g) || []).length / title.length) * 100 : 0,
  };
}

function enrichVideosForResearch(topVideos: any[]) {
  return topVideos.map((video) => {
    const features = titleFeatures(video);
    const thumbnailVisual = video?.thumbnailFeatures?.visual || {};
    const views = toNumber(video.views);
    const engagementRate = toNumber(video.engagementRate);
    const thumbnailCtr = video.thumbnailCtr === null ? null : toNumber(video.thumbnailCtr);
    const averageViewPercentage = toNumber(video.averageViewPercentage);
    const netSubscribers = toNumber(video.netSubscribers);
    return {
      ...video,
      ...features,
      durationBucket: durationBucket(toNumber(video.durationSeconds)),
      views,
      engagementRate,
      thumbnailCtr,
      averageViewPercentage,
      watchHours: toNumber(video.watchHours),
      netSubscribers,
      subsPerThousandViews: views ? (netSubscribers / views) * 1000 : 0,
      likeRate: ratio(toNumber(video.likes), views),
      commentRate: ratio(toNumber(video.comments), views),
      shareRate: ratio(toNumber(video.shares), views),
      playlistAddRate: ratio(toNumber(video.playlistNetAdds), views),
      thumbnailVisual,
      thumbnailTextPresent: thumbnailVisual.textPresent === undefined ? null : Boolean(thumbnailVisual.textPresent),
      thumbnailComplexity: Number.isFinite(Number(thumbnailVisual.visualComplexity)) ? toNumber(thumbnailVisual.visualComplexity) : null,
      thumbnailOverallScore: Number.isFinite(Number(thumbnailVisual.overallScore)) ? toNumber(thumbnailVisual.overallScore) : null,
      thumbnailStyleSignature: thumbnailVisual.styleSignature || '',
    };
  });
}

function topLabel(rows: any[], empty = 'Not enough data yet') {
  return rows[0]?.key || rows[0]?.label || empty;
}

function buildResearchLab(summary: any, fullAnalysis: any) {
  const videos = enrichVideosForResearch(fullAnalysis.topVideos || []);
  const dailyRows = fullAnalysis.dailyRows || [];
  const videoDailyRows = fullAnalysis.videoDailyRows || [];
  const breakdowns = fullAnalysis.breakdowns || {};
  const views = videos.map((video: any) => video.views);
  const ctrs = videos.map((video: any) => Number(video.thumbnailCtr)).filter(Number.isFinite);
  const retentions = videos.map((video: any) => video.averageViewPercentage);
  const engagements = videos.map((video: any) => video.engagementRate);
  const medianViews = median(views);
  const medianCtr = median(ctrs);
  const medianRetention = median(retentions);
  const medianEngagement = median(engagements);
  const p90Views = percentile(views, 90);
  const p90Ctr = percentile(ctrs, 90);
  const p90Retention = percentile(retentions, 90);
  const p90Engagement = percentile(engagements, 90);
  const topVideo = videos[0];
  const strongestTraffic = breakdowns.trafficSources?.[0];
  const strongestSearch = breakdowns.searchTerms?.[0];
  const strongestExternal = breakdowns.externalSources?.[0];
  const strongestCountry = breakdowns.countries?.[0];
  const strongestDevice = breakdowns.devices?.[0];
  const strongestContentType = breakdowns.contentTypes?.[0];
  const subscribed = breakdowns.subscribedStatus?.find((row: any) => row.key === 'SUBSCRIBED');
  const unsubscribed = breakdowns.subscribedStatus?.find((row: any) => row.key === 'UNSUBSCRIBED');
  const bestPublishDayViews = groupStats(videos, (video) => weekdayLabel(video.publishedAt), (video) => video.views);
  const bestPublishDaySubs = groupStats(videos, (video) => weekdayLabel(video.publishedAt), (video) => video.subsPerThousandViews);
  const bestPublishHourCtr = groupStats(videos.filter((video: any) => video.thumbnailCtr !== null), (video) => hourLabel(video.publishedAt), (video) => video.thumbnailCtr);
  const bestPublishHourWatch = groupStats(videos, (video) => hourLabel(video.publishedAt), (video) => video.watchHours);
  const bestPublishHourEngagement = groupStats(videos, (video) => hourLabel(video.publishedAt), (video) => video.engagementRate);
  const bestDailyViews = groupStats(dailyRows, (row) => weekdayLabel(row.date), (row) => toNumber(row.views));
  const bestDailySubs = groupStats(dailyRows, (row) => weekdayLabel(row.date), (row) => toNumber(row.subscribersGained) - toNumber(row.subscribersLost));
  const bestLengthViews = groupStats(videos, (video) => video.durationBucket, (video) => video.views);
  const bestLengthRetention = groupStats(videos, (video) => video.durationBucket, (video) => video.averageViewPercentage);
  const bestLengthSubs = groupStats(videos, (video) => video.durationBucket, (video) => video.subsPerThousandViews);
  const highCtrWeakRetention = videos.filter((video: any) => video.thumbnailCtr !== null && video.thumbnailCtr >= medianCtr && video.averageViewPercentage < medianRetention).slice(0, 3);
  const lowReachHighEngagement = videos.filter((video: any) => video.views < medianViews && video.engagementRate >= medianEngagement).slice(0, 3);
  const highReachLowEngagement = videos.filter((video: any) => video.views >= medianViews && video.engagementRate < medianEngagement).slice(0, 3);
  const outliers = videos.filter((video: any) => video.views >= p90Views || video.thumbnailCtr >= p90Ctr || video.averageViewPercentage >= p90Retention).slice(0, 5);
  const shorts = videos.filter((video: any) => video.isShortGuess);
  const longForm = videos.filter((video: any) => !video.isShortGuess);
  const avg = (rows: any[], fn: (row: any) => number) => rows.length ? rows.reduce((sum, row) => sum + fn(row), 0) / rows.length : 0;
  const visualVideos = videos.filter((video: any) => Number.isFinite(Number(video.thumbnailOverallScore)));
  const visualVideosWithCtr = visualVideos.filter((video: any) => video.thumbnailCtr !== null);
  const thumbnailTextVideosWithCtr = visualVideosWithCtr.filter((video: any) => video.thumbnailTextPresent !== null);
  const strongestThumbnailStyle = groupStats(visualVideos, (video: any) => video.thumbnailStyleSignature, (video: any) => video.subsPerThousandViews)[0];
  const strongestThumbnailStyleCtr = groupStats(visualVideosWithCtr, (video: any) => video.thumbnailStyleSignature, (video: any) => video.thumbnailCtr)[0];
  const textPresentCtrVideos = thumbnailTextVideosWithCtr.filter((video: any) => video.thumbnailTextPresent);
  const textAbsentCtrVideos = thumbnailTextVideosWithCtr.filter((video: any) => !video.thumbnailTextPresent);
  const thumbnailTextCtrAnswer = textPresentCtrVideos.length && textAbsentCtrVideos.length
    ? `Text-present thumbnails avg ${pct(avg(textPresentCtrVideos, (video) => video.thumbnailCtr))} CTR vs no-text avg ${pct(avg(textAbsentCtrVideos, (video) => video.thumbnailCtr))}.`
    : 'Text-presence proxies are now collected from thumbnail pixels; needs both text and no-text examples with CTR.';
  const peakRows = videoDailyRows.reduce((map: any, row: any) => {
    if (!map[row.videoId] || toNumber(row.views) > toNumber(map[row.videoId].views)) map[row.videoId] = row;
    return map;
  }, {});
  const peakDescriptions = Object.values(peakRows).slice(0, 3).map((row: any) => {
    const video = videos.find((entry: any) => entry.id === row.videoId);
    return `${video?.title || row.videoId}: ${compact(row.views)} views on ${row.date}`;
  });

  return {
    generatedAt: new Date().toISOString(),
    adminOnly: true,
    note: 'Private admin research view. Some answers are live from the current 28-day pull; longitudinal answers improve as stored history accumulates.',
    sections: [
      {
        title: 'Timing, Cadence, And Lifecycle',
        items: [
          item('Best hour of day for highest CTR', `${topLabel(bestPublishHourCtr, 'Needs more videos with CTR')} is the current publish-hour proxy for CTR.`, 'Proxy'),
          item('Best hour of day for highest watch time', `${topLabel(bestPublishHourWatch, 'Needs more videos')} is the current publish-hour proxy for watch time.`, 'Proxy'),
          item('Best hour of day for highest engagement rate', `${topLabel(bestPublishHourEngagement, 'Needs more videos')} is the current publish-hour proxy for engagement.`, 'Proxy'),
          item('Best day of week for video performance', `${topLabel(bestPublishDayViews, topLabel(bestDailyViews))} leads by average views in the current sample.`),
          item('Best day for subscriber conversion', `${topLabel(bestPublishDaySubs, topLabel(bestDailySubs))} currently leads subscriber conversion.`),
          item('Time-to-peak views after publish', peakDescriptions.length ? peakDescriptions.join(' | ') : 'Daily video rows are now being collected; peak timing strengthens after repeated runs.', 'Building history'),
          item('Time-to-peak impressions after publish', 'Daily impression rows are now stored when YouTube returns them; true peak timing needs repeated daily snapshots after publish.', 'Building history'),
          item('Average lifespan of a video’s growth', 'Growth lifespan is now trackable from stored daily video rows; first useful decay curve appears after several weeks of repeated full analyses.', 'Building history'),
          item('CTR, retention, and engagement decay over time', `Current 28-day medians are ${pct(medianCtr)} CTR, ${pct(medianRetention)} average viewed, and ${pct(medianEngagement)} engagement; decay curves improve as daily history accumulates.`, 'Building history'),
        ],
      },
      {
        title: 'Length, Format, And Content Type',
        items: [
          item('Optimal video length by niche', `${topLabel(bestLengthViews)} leads by average views in this channel sample; niche-level benchmark needs more channels.`, 'Channel-level'),
          item('Optimal video length by traffic source', `Current strongest source is ${strongestTraffic?.label || 'not enough data'}; source-by-length becomes stronger as more videos are stored.`, 'Building history'),
          item('Optimal video length for subscriber growth', `${topLabel(bestLengthSubs)} currently leads subscribers per 1K views.`),
          item('Relationship between video length and retention', correlationLabel(pearsonByKey(videos, 'durationSeconds', 'averageViewPercentage'))),
          item('Relationship between video length and CTR', correlationLabel(pearsonByKey(videos.filter((video: any) => video.thumbnailCtr !== null), 'durationSeconds', 'thumbnailCtr'))),
          item('Relationship between video length and watch time', correlationLabel(pearsonByKey(videos, 'durationSeconds', 'watchHours'))),
          item('Shorts vs long-form performance differences', `Shorts avg ${compact(avg(shorts, (video) => video.views))} views vs long-form avg ${compact(avg(longForm, (video) => video.views))} views.`),
          item('Shorts contribution to total channel growth', `${strongestContentType?.label || 'Content type data not returned'} is currently carrying ${pct(strongestContentType?.shareOfViews || 0, 0)} of views.`),
          item('Live vs VOD performance differences', `${breakdowns.liveOrOnDemand?.[0]?.label || 'No live/on-demand split'} leads the current period.`),
        ],
      },
      {
        title: 'Metric Relationships',
        items: [
          item('CTR vs watch time correlation', correlationLabel(pearsonByKey(videos.filter((video: any) => video.thumbnailCtr !== null), 'thumbnailCtr', 'watchHours'))),
          item('CTR vs retention correlation', correlationLabel(pearsonByKey(videos.filter((video: any) => video.thumbnailCtr !== null), 'thumbnailCtr', 'averageViewPercentage'))),
          item('Retention vs subscriber conversion correlation', correlationLabel(pearsonByKey(videos, 'averageViewPercentage', 'subsPerThousandViews'))),
          item('Engagement vs retention correlation', correlationLabel(pearsonByKey(videos, 'engagementRate', 'averageViewPercentage'))),
          item('Engagement vs CTR correlation', correlationLabel(pearsonByKey(videos.filter((video: any) => video.thumbnailCtr !== null), 'engagementRate', 'thumbnailCtr'))),
          item('Views vs subscriber conversion rate', correlationLabel(pearsonByKey(videos, 'views', 'subsPerThousandViews'))),
          item('Views vs engagement rate scaling patterns', correlationLabel(pearsonByKey(videos, 'views', 'engagementRate'))),
          item('Like, comment, share, and playlist add rate vs performance', `Like/views ${correlationLabel(pearsonByKey(videos, 'likeRate', 'views'))}; comment/views ${correlationLabel(pearsonByKey(videos, 'commentRate', 'views'))}; share/views ${correlationLabel(pearsonByKey(videos, 'shareRate', 'views'))}; playlist/views ${correlationLabel(pearsonByKey(videos, 'playlistAddRate', 'views'))}.`),
          item('Impressions vs views efficiency', `Current channel CTR is ${pct(fullAnalysis.current.thumbnailCtr)} with ${compact(fullAnalysis.current.videoThumbnailImpressions)} impressions.`),
          item('Watch time per impression', fullAnalysis.current.videoThumbnailImpressions ? `${secondsToLabel((fullAnalysis.current.watchHours * 3600) / fullAnalysis.current.videoThumbnailImpressions)} watch time per impression.` : 'Needs impression data.'),
          item('Engagement and subscriber conversion per impression', fullAnalysis.current.videoThumbnailImpressions ? `${pct((fullAnalysis.current.likes + fullAnalysis.current.comments + fullAnalysis.current.shares) / fullAnalysis.current.videoThumbnailImpressions * 100)} engagement per impression; ${pct(fullAnalysis.current.netSubscribers / fullAnalysis.current.videoThumbnailImpressions * 100)} net subs per impression.` : 'Needs impression data.'),
        ],
      },
      {
        title: 'Benchmarks, Outliers, And Breakout Signals',
        items: [
          item('Top percentile CTR benchmarks', `Top current sample CTR starts around ${pct(p90Ctr)}.`),
          item('Top percentile retention benchmarks', `Top current sample retention starts around ${pct(p90Retention)} average viewed.`),
          item('Top percentile engagement benchmarks', `Top current sample engagement starts around ${pct(p90Engagement)}.`),
          item('Median vs top performer gaps', `Median views ${compact(medianViews)} vs top sample threshold ${compact(p90Views)}.`),
          item('Performance distribution curves across channels', 'Personal distribution is live; cross-channel curves need more opted-in channels and rollups.', 'Building cohort data'),
          item('Outlier detection for viral videos', outliers.length ? outliers.map((video: any) => video.title).join(' | ') : 'No strong outlier in the current sample.'),
          item('Retention thresholds for scaling', `Current retention threshold proxy: ${pct(p90Retention)} average viewed.`),
          item('CTR thresholds for scaling', `Current CTR threshold proxy: ${pct(p90Ctr)}.`),
          item('Combined CTR + retention thresholds for growth', `Flag videos above ${pct(p90Ctr)} CTR and ${pct(p90Retention)} average viewed as strongest packaging-content fit.`),
          item('Signals that predict breakout videos', `Best current breakout recipe: high CTR, high retention, strong engagement, and traffic diversity. Top candidate: ${topVideo?.title || 'not enough data'}.`),
          item('Minimum viable performance for algorithm pickup', `Use channel medians as baseline: ${pct(medianCtr)} CTR, ${pct(medianRetention)} retention, ${pct(medianEngagement)} engagement.`),
        ],
      },
      {
        title: 'Traffic, Search, And Discovery',
        items: [
          item('Browse vs suggested vs search performance splits', `${(breakdowns.trafficSources || []).map((row: any) => `${row.label}: ${pct(row.shareOfViews, 0)}`).slice(0, 4).join(' | ') || 'No source split returned.'}`),
          item('Traffic source contribution over time', 'Current source mix is live; source transition over time improves as daily breakdown history accumulates.', 'Building history'),
          item('Which sources dominate early vs late lifecycle', 'Now collecting video/day rows; early vs late source detail needs repeated source breakdowns over time.', 'Building history'),
          item('Source-specific retention differences', `${strongestTraffic?.label || 'Top source'} currently averages ${secondsToLabel(strongestTraffic?.views ? strongestTraffic.watchHours * 3600 / strongestTraffic.views : 0)} AVD proxy.`),
          item('Source-specific CTR differences', 'Traffic source reports do not return thumbnail CTR; use source views + watch time + engagement as source quality proxy.', 'Limited by API'),
          item('Search-driven video characteristics', `${strongestSearch?.label || 'No search term'} is the strongest returned search detail.`),
          item('Browse-driven video characteristics', `${breakdowns.trafficSources?.find((row: any) => row.key === 'BROWSE')?.label || 'Browse'} contributes ${pct(breakdowns.trafficSources?.find((row: any) => row.key === 'BROWSE')?.shareOfViews || 0, 0)} of views.`),
          item('Suggested-driven video characteristics', `${breakdowns.trafficSources?.find((row: any) => row.key === 'RELATED_VIDEO')?.label || 'Suggested videos'} contributes ${pct(breakdowns.trafficSources?.find((row: any) => row.key === 'RELATED_VIDEO')?.shareOfViews || 0, 0)} of views.`),
          item('External traffic impact on performance', `${strongestExternal?.label || 'No external source'} is the strongest returned external source.`),
          item('Dependence on single traffic source vs diversified', strongestTraffic ? `${strongestTraffic.label} owns ${pct(strongestTraffic.shareOfViews, 0)} of views; higher than 60% means source dependence risk.` : 'No traffic source data returned.'),
          item('Top performing search terms by niche', `${strongestSearch?.label || 'No search terms returned yet'} is the current top returned term; niche-level requires cohort rollups.`, 'Channel-level'),
          item('Long-tail vs short-tail search effectiveness', breakdowns.searchTerms?.length ? `${breakdowns.searchTerms.length} search details returned this period; classify multi-word terms as long-tail in the research table.` : 'No search details returned.'),
        ],
      },
      {
        title: 'Audience, Geo, Device, And Playback',
        items: [
          item('Subscribed vs non-subscribed viewer behavior', `Subscribed ${pct(subscribed?.shareOfViews || 0, 0)} vs non-subscribed ${pct(unsubscribed?.shareOfViews || 0, 0)} of views.`),
          item('Subscriber retention vs non-subscriber retention', 'Subscribed-status report gives views/watch time; retention proxy is watch time per view by segment.', 'Proxy'),
          item('Subscriber conversion rate by video type', `${strongestContentType?.label || 'Content type split'} is the leading current type; conversion by type gets stronger as video rows accumulate.`),
          item('Videos that attract new vs returning viewers', 'Returning/new viewer split is not available from current scope in this endpoint; subscribed/unsubscribed is the closest live proxy.', 'Limited by API'),
          item('Geographic performance differences', `${strongestCountry?.label || 'No country'} leads with ${pct(strongestCountry?.shareOfViews || 0, 0)} of views.`),
          item('Country-level retention, CTR, and engagement differences', 'Country rows are stored for views/watch time; CTR and engagement by country need additional report combinations if supported.', 'Partial'),
          item('Geographic contribution to growth', `${strongestCountry?.label || 'No country'} is the current strongest geography.`),
          item('Time zone alignment vs performance', 'Publish-hour proxy is UTC today; mapping audience country/time zone becomes stronger with stored geo + publish history.', 'Building history'),
          item('Age and gender performance differences', `${breakdowns.demographics?.[0]?.label || 'No demographic split'} is the strongest known audience segment returned.`),
          item('Demographic retention and CTR differences', 'YouTube demographic rows here return viewer percentage; retention/CTR by demographic is not live in this endpoint.', 'Limited by API'),
          item('Mobile vs desktop vs TV performance', `${strongestDevice?.label || 'No device'} leads device views at ${pct(strongestDevice?.shareOfViews || 0, 0)}.`),
          item('Device-based retention and engagement differences', `Top device AVD proxy is ${secondsToLabel(strongestDevice?.views ? strongestDevice.watchHours * 3600 / strongestDevice.views : 0)}.`),
          item('Playback location impact on performance', `${breakdowns.youtubeProducts?.[0]?.label || 'No YouTube surface'} is the top returned YouTube surface.`),
        ],
      },
      {
        title: 'Subscribers, Engagement, And Conversion',
        items: [
          item('Subscriber gain per 1,000 views', `${fullAnalysis.current.subsPerThousandViews.toFixed(2)} net subscribers per 1K views in the current window.`),
          item('Subscriber loss patterns after uploads', 'Subscribers gained/lost are now stored by video/day where returned; patterns improve after more publish cycles.', 'Building history'),
          item('Net subscriber growth by content type', `${strongestContentType?.label || 'Content type'} leads current views; subscriber-by-type strengthens as video/day rows accumulate.`),
          item('Channels with high views but low subscriber growth', 'Cross-channel detection needs opted-in cohort rollups; personal detection is live via views vs subs/1K.', 'Building cohort data'),
          item('Videos with high engagement but low reach', lowReachHighEngagement.length ? lowReachHighEngagement.map((video: any) => video.title).join(' | ') : 'No obvious low-reach/high-engagement candidate.'),
          item('Videos with high reach but low engagement', highReachLowEngagement.length ? highReachLowEngagement.map((video: any) => video.title).join(' | ') : 'No obvious high-reach/low-engagement candidate.'),
          item('Engagement as leading vs lagging indicator', correlationLabel(pearsonByKey(videos, 'engagementRate', 'views'))),
          item('Best performing content for gaining subscribers', videos.slice().sort((a: any, b: any) => b.netSubscribers - a.netSubscribers)[0]?.title || 'Needs video subscriber rows.'),
          item('Best performing content for generating engagement', videos.slice().sort((a: any, b: any) => b.engagementRate - a.engagementRate)[0]?.title || 'Needs video engagement rows.'),
          item('Best performing content for maximizing watch time', videos.slice().sort((a: any, b: any) => b.watchHours - a.watchHours)[0]?.title || 'Needs video watch-time rows.'),
          item('Videos that convert viewers into subscribers efficiently', videos.slice().sort((a: any, b: any) => b.subsPerThousandViews - a.subsPerThousandViews)[0]?.title || 'Needs subscriber conversion rows.'),
          item('Videos that generate passive, non-converting views', videos.filter((video: any) => video.views >= medianViews).sort((a: any, b: any) => a.subsPerThousandViews - b.subsPerThousandViews)[0]?.title || 'No passive-view candidate yet.'),
        ],
      },
      {
        title: 'Metadata, Packaging, And Thumbnails',
        items: [
          item('Correlation between title length and CTR', correlationLabel(pearsonByKey(videos.filter((video: any) => video.thumbnailCtr !== null), 'titleLength', 'thumbnailCtr'))),
          item('Title length vs retention correlation', correlationLabel(pearsonByKey(videos, 'titleLength', 'averageViewPercentage'))),
          item('Impact of numbers in titles on performance', `Number titles avg ${compact(avg(videos.filter((video: any) => video.hasNumber), (video) => video.views))} views vs non-number avg ${compact(avg(videos.filter((video: any) => !video.hasNumber), (video) => video.views))}.`),
          item('Impact of questions in titles on CTR', `Question titles avg ${pct(avg(videos.filter((video: any) => video.hasQuestion && video.thumbnailCtr !== null), (video) => video.thumbnailCtr))} CTR.`),
          item('Impact of emotional words in titles on engagement', correlationLabel(pearsonByKey(videos, 'emotionalWordCount', 'engagementRate'))),
          item('Title capitalization patterns vs performance', correlationLabel(pearsonByKey(videos, 'uppercaseShare', 'views'))),
          item('Description length vs performance', correlationLabel(pearsonByKey(videos.map((video: any) => ({ ...video, descriptionLength: String(video.description || '').length })), 'descriptionLength', 'views'))),
          item('Links in description vs external traffic share', `${strongestExternal?.label || 'External data'} is now tracked; description link counts are stored in video snapshots for correlation.`, 'Stored for analysis'),
          item('Tags count vs CTR correlation', correlationLabel(pearsonByKey(videos.filter((video: any) => video.thumbnailCtr !== null).map((video: any) => ({ ...video, tagCount: Array.isArray(video.tags) ? video.tags.length : 0 })), 'tagCount', 'thumbnailCtr'))),
          item('Tags usage vs search traffic share', `${strongestSearch?.label || 'Search data'} is tracked while tag counts are stored per video.`, 'Stored for analysis'),
          item('Thumbnail style consistency vs channel growth', strongestThumbnailStyle ? `Top saved visual style for subscriber conversion is ${strongestThumbnailStyle.key} (${compact(strongestThumbnailStyle.average)} subs per 1K views, n=${strongestThumbnailStyle.count}).${strongestThumbnailStyleCtr ? ` Best CTR style is ${strongestThumbnailStyleCtr.key} (${pct(strongestThumbnailStyleCtr.average)}, n=${strongestThumbnailStyleCtr.count}).` : ''}` : 'Thumbnail visual features are collected during full analysis; run again as channels connect to build style benchmarks.', strongestThumbnailStyle ? 'Live' : 'Collecting'),
          item('Thumbnail text presence vs CTR', thumbnailTextCtrAnswer, textPresentCtrVideos.length && textAbsentCtrVideos.length ? 'Live' : 'Collecting'),
          item('Thumbnail complexity vs CTR', visualVideosWithCtr.length ? correlationLabel(pearsonByKey(visualVideosWithCtr, 'thumbnailComplexity', 'thumbnailCtr')) : 'Visual complexity scores are now collected from thumbnail pixels during full analysis.', visualVideosWithCtr.length ? 'Live' : 'Collecting'),
          item('High CTR but low retention patterns', highCtrWeakRetention.length ? highCtrWeakRetention.map((video: any) => video.title).join(' | ') : 'No high-CTR/low-retention candidate in current sample.'),
          item('Low CTR but high retention patterns', videos.filter((video: any) => video.thumbnailCtr !== null && video.thumbnailCtr < medianCtr && video.averageViewPercentage >= medianRetention).slice(0, 3).map((video: any) => video.title).join(' | ') || 'No low-CTR/high-retention candidate in current sample.'),
        ],
      },
      {
        title: 'Topics, Niches, And Channel Strategy',
        items: [
          item('Topic-level and format-level performance trends', `${topVideo?.title || 'Top video'} is the current top-performing topic proxy; title/tag clustering is stored for deeper grouping.`),
          item('Channel niche identification from metadata', `Current channel topics: ${(summary.channel.topicCategories || []).slice(0, 3).join(', ') || 'not returned by YouTube'}.`),
          item('Niche-specific performance baselines', 'Cross-channel niche baselines require more opted-in channels and public rollups; personal baseline is live.', 'Building cohort data'),
          item('Single-topic vs multi-topic channels', `Recent sample has ${new Set(videos.flatMap((video: any) => video.tags || []).slice(0, 100)).size} distinct tag signals.`),
          item('Topic repetition vs performance', 'Titles/tags/descriptions are stored now, so repeated-topic performance can be measured after more uploads.', 'Building history'),
          item('Topic diversification vs growth stability', 'Daily channel and video rows are now stored, enabling stability scoring over time.', 'Building history'),
          item('Series-based content performance', 'Episode/series naming can be inferred from stored titles; needs more stored videos for stronger repeatability signals.', 'Building history'),
          item('Upload clustering and cannibalization', 'Publish dates plus daily video rows are now stored; cannibalization improves after repeated upload cycles.', 'Building history'),
          item('Videos that revive after initial drop', 'Daily video history is now stored; revival detection needs multiple snapshots per video over time.', 'Building history'),
          item('Evergreen vs trending content patterns', 'Slow-burn vs spike behavior is now measurable from stored video/day rows as history accumulates.', 'Building history'),
          item('Cross-channel comparison of similar videos', 'Requires opted-in cohort rollups; personal same-topic comparison is available once enough videos are stored.', 'Building cohort data'),
          item('Channel authority signals', `Current consistency proxy: top video ${compact(topVideo?.views)} views vs median ${compact(medianViews)} views.`),
        ],
      },
      {
        title: 'Community, Comments, And Playlists',
        items: [
          item('Playlist-driven session extension', `${fullAnalysis.current.playlistNetAdds >= 0 ? '+' : ''}${compact(fullAnalysis.current.playlistNetAdds)} net playlist saves this window.`),
          item('Playlist impact on watch time', `Playlist save rate is ${pct(fullAnalysis.current.playlistAddRate)} of views.`),
          item('Videos that perform better inside playlists', 'Playlist adds/removes are now stored by video where returned; stronger ranking needs more video rows.', 'Building history'),
          item('Comment volume vs video performance', correlationLabel(pearsonByKey(videos, 'comments', 'views'))),
          item('Comment rate vs video performance', correlationLabel(pearsonByKey(videos, 'commentRate', 'views'))),
          item('Comment sentiment / replies / pinned comment impact', 'Disabled for now. We keep aggregate comment counts, but no longer request or store comment text/reply snapshots.', 'Not collected'),
          item('Comment timing vs performance', 'Disabled for now because we are not storing individual comment timestamps.', 'Not collected'),
          item('Community intensity per channel', `${compact(fullAnalysis.current.comments)} aggregate comments in the current analysis window.`),
        ],
      },
      {
        title: 'Channel Health, Reliability, And Momentum',
        items: [
          item('Top videos by views, watch time, and subscribers', `Views: ${videos.slice().sort((a: any, b: any) => b.views - a.views)[0]?.title || 'n/a'} | Watch: ${videos.slice().sort((a: any, b: any) => b.watchHours - a.watchHours)[0]?.title || 'n/a'} | Subs: ${videos.slice().sort((a: any, b: any) => b.netSubscribers - a.netSubscribers)[0]?.title || 'n/a'}.`),
          item('Consistency vs volatility of channel performance', `Top/median views ratio is ${medianViews ? (Math.max(...views) / medianViews).toFixed(1) : 'n/a'}x.`),
          item('Frequency of breakout videos per channel', `${outliers.length} videos currently clear a top-percentile threshold.`),
          item('Upload frequency vs performance', 'Upload dates and performance are stored now; cadence scoring improves with more history.', 'Building history'),
          item('Upload gaps vs performance dips', 'Daily channel rows are stored now, enabling gap/dip analysis after more days accumulate.', 'Building history'),
          item('Burnout and audience fatigue signals', `Watch time delta ${pct(fullAnalysis.deltas.watchHours?.percent)}; engagement delta ${pct(fullAnalysis.deltas.engagementRate?.percent)}.`),
          item('False positives and slow burn vs fast viral patterns', 'Stored daily rows will separate strong starts from durable performance over time.', 'Building history'),
          item('Signals of content saturation', `Traffic diversity plus median engagement is the current proxy; top source share is ${pct(strongestTraffic?.shareOfViews || 0, 0)}.`),
          item('Correlation between traffic diversity and stability', 'Traffic breakdown history is now stored by run; stability correlation improves over repeated runs.', 'Building history'),
          item('Growth compounding effects over multiple uploads', 'Video sequencing and momentum stacking require multi-upload history; collection starts now.', 'Building history'),
          item('Relative importance of each metric by outcome', `Current strongest quick read: ${correlationLabel(pearsonByKey(videos, 'watchHours', 'views'))} for watch time vs views, ${correlationLabel(pearsonByKey(videos, 'engagementRate', 'views'))} for engagement vs views.`),
          item('Algorithm testing, scaling, and decline phases', 'Use high impressions + stable retention as scaling proxy; daily impression/retention rows are now stored for phase detection.', 'Building history'),
          item('Videos that maintain performance vs decay quickly', 'Daily video rows are now stored; durable-vs-decay classification improves after repeated daily runs.', 'Building history'),
        ],
      },
    ],
  };
}

function normalizeVideoDailyAnalyticsRow(row: any, forcedVideoId = '') {
  return {
    date: row.day,
    videoId: row.video || forcedVideoId,
    views: toNumber(row.views),
    engagedViews: toNumber(row.engagedViews),
    redViews: toNumber(row.redViews),
    estimatedMinutesWatched: toNumber(row.estimatedMinutesWatched),
    estimatedRedMinutesWatched: toNumber(row.estimatedRedMinutesWatched),
    averageViewDuration: toNumber(row.averageViewDuration),
    averageViewPercentage: toNumber(row.averageViewPercentage),
    likes: toNumber(row.likes),
    dislikes: toNumber(row.dislikes),
    comments: toNumber(row.comments),
    shares: toNumber(row.shares),
    videosAddedToPlaylists: toNumber(row.videosAddedToPlaylists),
    videosRemovedFromPlaylists: toNumber(row.videosRemovedFromPlaylists),
    subscribersGained: toNumber(row.subscribersGained),
    subscribersLost: toNumber(row.subscribersLost),
    videoThumbnailImpressions: toNumber(row.videoThumbnailImpressions),
    thumbnailCtr: row.videoThumbnailImpressions ? toNumber(row.videoThumbnailImpressionsClickRate) : null,
  };
}

async function fetchVideoDailyAnalytics(accessToken: string, videoIds: string[], windows: any) {
  const uniqueIds = Array.from(new Set(videoIds.filter(Boolean))).slice(0, FULL_ANALYSIS_VIDEO_LIMIT);
  const diagnostic: any = {
    status: uniqueIds.length ? 'ok' : 'skipped',
    requestedVideos: uniqueIds.length,
    attempts: [],
    rows: 0,
  };
  const rows: any[] = [];

  for (let index = 0; index < uniqueIds.length; index += VIDEO_DAILY_VIDEO_CHUNK_SIZE) {
    const chunk = uniqueIds.slice(index, index + VIDEO_DAILY_VIDEO_CHUNK_SIZE);
    const payload = await fetchOptionalAnalytics(accessToken, {
      label: `video_daily_chunk_${Math.floor(index / VIDEO_DAILY_VIDEO_CHUNK_SIZE) + 1}`,
      startDate: windows.fullStartDate,
      endDate: windows.endDate,
      dimensions: 'day,video',
      filters: `video==${chunk.join(',')}`,
      metrics: VIDEO_METRICS,
      sort: 'day',
      maxResults: VIDEO_DAILY_ROW_LIMIT,
    });

    diagnostic.attempts.push(payload._diagnostic);
    rows.push(...rowsToObjects(payload).map((row: any) => normalizeVideoDailyAnalyticsRow(row)));
  }

  const chunkHadErrors = diagnostic.attempts.some((attempt: any) => attempt?.status === 'error');
  if (!rows.length && chunkHadErrors) {
    for (const videoId of uniqueIds.slice(0, VIDEO_DAILY_FALLBACK_VIDEO_LIMIT)) {
      const payload = await fetchOptionalAnalytics(accessToken, {
        label: `video_daily_fallback_${videoId}`,
        startDate: windows.fullStartDate,
        endDate: windows.endDate,
        dimensions: 'day',
        filters: `video==${videoId}`,
        metrics: VIDEO_METRICS,
        sort: 'day',
        maxResults: VIDEO_DAILY_ROW_LIMIT,
      });

      diagnostic.attempts.push(payload._diagnostic);
      rows.push(...rowsToObjects(payload).map((row: any) => normalizeVideoDailyAnalyticsRow(row, videoId)));
    }
  }

  const cleanRows = rows.filter((row: any) => row.date && row.videoId);
  diagnostic.rows = cleanRows.length;
  if (uniqueIds.length && !cleanRows.length && diagnostic.attempts.every((attempt: any) => attempt?.status === 'error')) {
    diagnostic.status = 'error';
  } else if (uniqueIds.length && !cleanRows.length) {
    diagnostic.status = 'empty';
  }

  return { rows: cleanRows, diagnostic };
}

function buildRetentionCurveRows(payload: any, video: any) {
  return rowsToObjects(payload)
    .map((row: any) => {
      const elapsed = Number(row.elapsedVideoTimeRatio);
      return {
        key: `${video.id}:${Number.isFinite(elapsed) ? elapsed.toFixed(4) : row.elapsedVideoTimeRatio}`,
        label: `${video.title || video.id} · ${Number.isFinite(elapsed) ? Math.round(elapsed * 100) : '?'}%`,
        videoId: video.id,
        title: video.title || video.id,
        elapsedVideoTimeRatio: Number.isFinite(elapsed) ? elapsed : null,
        audienceWatchRatio: Number.isFinite(Number(row.audienceWatchRatio)) ? toNumber(row.audienceWatchRatio) : null,
        relativeRetentionPerformance: Number.isFinite(Number(row.relativeRetentionPerformance)) ? toNumber(row.relativeRetentionPerformance) : null,
        startedWatching: Number.isFinite(Number(row.startedWatching)) ? toNumber(row.startedWatching) : null,
        stoppedWatching: Number.isFinite(Number(row.stoppedWatching)) ? toNumber(row.stoppedWatching) : null,
        totalSegmentImpressions: Number.isFinite(Number(row.totalSegmentImpressions)) ? toNumber(row.totalSegmentImpressions) : null,
      };
    })
    .filter((row: any) => row.videoId && row.elapsedVideoTimeRatio !== null);
}

async function fetchRetentionCurves(accessToken: string, videos: any[], windows: any) {
  const targets = videos.filter((video: any) => video?.id).slice(0, RETENTION_VIDEO_LIMIT);
  const diagnostic: any = {
    status: targets.length ? 'ok' : 'skipped',
    requestedVideos: targets.length,
    attempts: [],
    rows: 0,
  };
  const rows: any[] = [];

  for (const video of targets) {
    const payload = await fetchOptionalAnalytics(accessToken, {
      label: `retention_${video.id}`,
      startDate: windows.fullStartDate,
      endDate: windows.endDate,
      dimensions: 'elapsedVideoTimeRatio',
      filters: `video==${video.id}`,
      metrics: RETENTION_METRICS,
      includeReach: false,
      sort: 'elapsedVideoTimeRatio',
      maxResults: RETENTION_ROW_LIMIT,
    });

    diagnostic.attempts.push(payload._diagnostic);
    rows.push(...buildRetentionCurveRows(payload, video));
  }

  diagnostic.rows = rows.length;
  if (targets.length && !rows.length && diagnostic.attempts.every((attempt: any) => attempt?.status === 'error')) {
    diagnostic.status = 'error';
  } else if (targets.length && !rows.length) {
    diagnostic.status = 'empty';
  }

  return { rows, diagnostic };
}

async function fetchChannelPlaylists(accessToken: string, maxResults = PLAYLIST_DATA_LIMIT) {
  const playlists: any[] = [];
  const diagnostic: any = {
    status: 'ok',
    rows: 0,
    pages: 0,
  };
  let pageToken = '';

  try {
    while (playlists.length < maxResults) {
      const url = new URL(`${YOUTUBE_API_BASE_URL}/playlists`);
      url.searchParams.set('part', 'snippet,contentDetails,status');
      url.searchParams.set('mine', 'true');
      url.searchParams.set('maxResults', String(Math.min(50, maxResults - playlists.length)));
      if (pageToken) url.searchParams.set('pageToken', pageToken);

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const payload = await safeJson(response);
      diagnostic.pages += 1;

      if (!response.ok || payload?.error) {
        diagnostic.status = 'error';
        diagnostic.httpStatus = response.status;
        diagnostic.message = payload?.error?.message || 'Could not load playlists.';
        diagnostic.reason = payload?.error?.errors?.[0]?.reason || payload?.error?.status || null;
        break;
      }

      (payload?.items || []).forEach((playlist: any) => {
        playlists.push({
          id: playlist.id,
          title: playlist?.snippet?.title || playlist.id,
          description: playlist?.snippet?.description || '',
          publishedAt: playlist?.snippet?.publishedAt || null,
          thumbnailUrl: resolveBestThumbnail(playlist?.snippet?.thumbnails),
          itemCount: toNumber(playlist?.contentDetails?.itemCount),
          privacyStatus: playlist?.status?.privacyStatus || null,
          raw: playlist,
        });
      });

      pageToken = payload?.nextPageToken || '';
      if (!pageToken) break;
    }
  } catch (error) {
    diagnostic.status = 'error';
    diagnostic.message = error?.message || String(error);
  }

  diagnostic.rows = playlists.length;
  if (diagnostic.status === 'ok' && !playlists.length) diagnostic.status = 'empty';
  return { playlists, diagnostic };
}

function buildPlaylistAnalyticsRows(payload: any, playlists: any[], totalViews: number) {
  const playlistMap = new Map(playlists.map((playlist: any) => [playlist.id, playlist]));

  return rowsToObjects(payload)
    .map((row: any) => {
      const playlistId = row.playlist || '';
      const playlist = playlistMap.get(playlistId) || {};
      const playlistViews = toNumber(row.playlistViews);
      const playlistWatchHours = toNumber(row.playlistEstimatedMinutesWatched) / 60;

      return {
        key: playlistId,
        label: playlist.title || playlistId,
        playlistId,
        title: playlist.title || playlistId,
        itemCount: toNumber(playlist.itemCount),
        privacyStatus: playlist.privacyStatus || null,
        views: playlistViews,
        watchHours: playlistWatchHours,
        playlistViews,
        playlistWatchHours,
        playlistStarts: toNumber(row.playlistStarts),
        playlistSaves: toNumber(row.playlistSaves),
        viewsPerPlaylistStart: Number.isFinite(Number(row.viewsPerPlaylistStart)) ? toNumber(row.viewsPerPlaylistStart) : null,
        averageTimeInPlaylist: Number.isFinite(Number(row.averageTimeInPlaylist)) ? toNumber(row.averageTimeInPlaylist) : null,
        shareOfViews: ratio(playlistViews, totalViews),
      };
    })
    .filter((row: any) => row.playlistId && (row.playlistViews > 0 || row.playlistStarts > 0 || row.playlistSaves > 0))
    .sort((left: any, right: any) => right.playlistViews - left.playlistViews)
    .slice(0, PLAYLIST_ANALYTICS_LIMIT);
}

async function fetchPlaylistAnalytics(accessToken: string, playlists: any[], windows: any, totalViews: number) {
  const payload = await fetchOptionalAnalytics(accessToken, {
    label: 'top_playlists',
    startDate: windows.fullStartDate,
    endDate: windows.endDate,
    dimensions: 'playlist',
    metrics: PLAYLIST_ANALYTICS_METRICS,
    includeReach: false,
    sort: '-playlistViews',
    maxResults: PLAYLIST_ANALYTICS_LIMIT,
  });

  return {
    rows: buildPlaylistAnalyticsRows(payload, playlists, totalViews),
    diagnostic: payload._diagnostic,
  };
}

async function buildFullAnalysis(accessToken: string, summary: any, windows: any, options: { includeResearchLab?: boolean; thumbnailFeatureCache?: Map<string, any> } = {}) {
  const [
    fullCurrentPayload,
    fullPreviousPayload,
    topVideosPayload,
    trafficPayload,
    searchTermsPayload,
    externalTrafficPayload,
    devicePayload,
    subscribedPayload,
    contentTypePayload,
    countryPayload,
    productPayload,
    livePayload,
    demographicPayload,
  ] = await Promise.all([
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
      metrics: VIDEO_METRICS,
      sort: '-views',
      maxResults: FULL_ANALYSIS_VIDEO_LIMIT,
    }),
    fetchOptionalAnalytics(accessToken, {
      label: 'traffic_sources',
      startDate: windows.fullStartDate,
      endDate: windows.endDate,
      dimensions: 'insightTrafficSourceType',
      metrics: SEGMENT_METRICS,
      includeReach: false,
      sort: '-views',
      maxResults: 8,
    }),
    fetchOptionalAnalytics(accessToken, {
      label: 'search_terms',
      startDate: windows.fullStartDate,
      endDate: windows.endDate,
      dimensions: 'insightTrafficSourceDetail',
      metrics: SEGMENT_METRICS,
      filters: 'insightTrafficSourceType==YT_SEARCH',
      includeReach: false,
      sort: '-views',
      maxResults: 25,
    }),
    fetchOptionalAnalytics(accessToken, {
      label: 'external_sources',
      startDate: windows.fullStartDate,
      endDate: windows.endDate,
      dimensions: 'insightTrafficSourceDetail',
      metrics: SEGMENT_METRICS,
      filters: 'insightTrafficSourceType==EXT_URL',
      includeReach: false,
      sort: '-views',
      maxResults: 25,
    }),
    fetchOptionalAnalytics(accessToken, {
      label: 'devices',
      startDate: windows.fullStartDate,
      endDate: windows.endDate,
      dimensions: 'deviceType',
      metrics: SEGMENT_METRICS,
      includeReach: false,
      sort: '-views',
      maxResults: 8,
    }),
    fetchOptionalAnalytics(accessToken, {
      label: 'subscribed_status',
      startDate: windows.fullStartDate,
      endDate: windows.endDate,
      dimensions: 'subscribedStatus',
      metrics: SEGMENT_METRICS,
      includeReach: false,
      sort: '-views',
    }),
    fetchOptionalAnalytics(accessToken, {
      label: 'content_types',
      startDate: windows.fullStartDate,
      endDate: windows.endDate,
      dimensions: 'creatorContentType',
      metrics: SEGMENT_METRICS,
      includeReach: false,
      sort: '-views',
    }),
    fetchOptionalAnalytics(accessToken, {
      label: 'countries',
      startDate: windows.fullStartDate,
      endDate: windows.endDate,
      dimensions: 'country',
      metrics: SEGMENT_METRICS,
      includeReach: false,
      sort: '-views',
      maxResults: 8,
    }),
    fetchOptionalAnalytics(accessToken, {
      label: 'youtube_products',
      startDate: windows.fullStartDate,
      endDate: windows.endDate,
      dimensions: 'youtubeProduct',
      metrics: SEGMENT_METRICS,
      includeReach: false,
      sort: '-views',
    }),
    fetchOptionalAnalytics(accessToken, {
      label: 'live_or_on_demand',
      startDate: windows.fullStartDate,
      endDate: windows.endDate,
      dimensions: 'liveOrOnDemand',
      metrics: SEGMENT_METRICS,
      includeReach: false,
      sort: '-views',
    }),
    fetchOptionalAnalytics(accessToken, {
      label: 'demographics',
      startDate: windows.fullStartDate,
      endDate: windows.endDate,
      dimensions: 'ageGroup,gender',
      metrics: ['viewerPercentage'],
      includeReach: false,
      sort: '-viewerPercentage',
      maxResults: 8,
    }),
  ]);

  const fullCurrent = aggregateRows(rowsToObjects(fullCurrentPayload));
  const fullPrevious = aggregateRows(rowsToObjects(fullPreviousPayload));
  const videoRows = rowsToObjects(topVideosPayload);

  const fullDailyRows = rowsToObjects(fullCurrentPayload).concat(rowsToObjects(fullPreviousPayload)).map((row: any) => ({
    date: row.day,
    views: toNumber(row.views),
    engagedViews: toNumber(row.engagedViews),
    redViews: toNumber(row.redViews),
    estimatedMinutesWatched: toNumber(row.estimatedMinutesWatched),
    estimatedRedMinutesWatched: toNumber(row.estimatedRedMinutesWatched),
    averageViewDuration: toNumber(row.averageViewDuration),
    averageViewPercentage: toNumber(row.averageViewPercentage),
    likes: toNumber(row.likes),
    dislikes: toNumber(row.dislikes),
    comments: toNumber(row.comments),
    shares: toNumber(row.shares),
    videosAddedToPlaylists: toNumber(row.videosAddedToPlaylists),
    videosRemovedFromPlaylists: toNumber(row.videosRemovedFromPlaylists),
    cardImpressions: toNumber(row.cardImpressions),
    cardClicks: toNumber(row.cardClicks),
    cardTeaserImpressions: toNumber(row.cardTeaserImpressions),
    cardTeaserClicks: toNumber(row.cardTeaserClicks),
    subscribersGained: toNumber(row.subscribersGained),
    subscribersLost: toNumber(row.subscribersLost),
    videoThumbnailImpressions: toNumber(row.videoThumbnailImpressions),
    thumbnailCtr: row.videoThumbnailImpressions ? toNumber(row.videoThumbnailImpressionsClickRate) : null,
  })).filter((row: any) => row.date);

  const topVideoIds = videoRows.map((row: any) => String(row.video || '')).filter(Boolean);
  const recentVideoIds = await fetchRecentUploadVideoIds(accessToken, summary?.channel?.uploadsPlaylistId, RECENT_UPLOAD_VIDEO_LIMIT);
  const videoIds = Array.from(new Set(topVideoIds.concat(recentVideoIds)));
  const [videoDailyResult, videoDetails, playlistDataResult] = await Promise.all([
    fetchVideoDailyAnalytics(accessToken, topVideoIds, windows),
    fetchVideoDetails(accessToken, videoIds),
    fetchChannelPlaylists(accessToken, PLAYLIST_DATA_LIMIT),
  ]);
  const videoDailyRows = videoDailyResult.rows;
  const playlists = playlistDataResult.playlists;

  const videoMetadata = videoIds
    .map((videoId) => videoDetails[videoId])
    .filter(Boolean)
    .map((video: any) => normalizeVideoMetadata(video));

  const topVideos = videoRows.map((row: any) => {
    const details = videoDetails[row.video] || {};
    const metadata = normalizeVideoMetadata(details, row);

    return {
      id: row.video,
      title: metadata.title || row.video,
      description: metadata.description || '',
      thumbnailUrl: metadata.thumbnailUrl,
      publishedAt: metadata.publishedAt,
      durationIso: metadata.durationIso,
      durationSeconds: metadata.durationSeconds,
      categoryId: metadata.categoryId,
      tags: metadata.tags,
      defaultLanguage: metadata.defaultLanguage,
      defaultAudioLanguage: metadata.defaultAudioLanguage,
      privacyStatus: metadata.privacyStatus,
      uploadStatus: metadata.uploadStatus,
      madeForKids: metadata.madeForKids,
      caption: metadata.caption,
      definition: metadata.definition,
      dimension: metadata.dimension,
      liveBroadcastContent: metadata.liveBroadcastContent,
      isShortGuess: metadata.isShortGuess,
      thumbnailFeatures: metadata.thumbnailFeatures,
      views: toNumber(row.views),
      engagedViews: toNumber(row.engagedViews),
      redViews: toNumber(row.redViews),
      watchHours: toNumber(row.estimatedMinutesWatched) / 60,
      premiumWatchHours: toNumber(row.estimatedRedMinutesWatched) / 60,
      averageViewDuration: toNumber(row.averageViewDuration),
      averageViewPercentage: toNumber(row.averageViewPercentage),
      likes: toNumber(row.likes),
      dislikes: toNumber(row.dislikes),
      comments: toNumber(row.comments),
      shares: toNumber(row.shares),
      playlistNetAdds: toNumber(row.videosAddedToPlaylists) - toNumber(row.videosRemovedFromPlaylists),
      engagementRate: ratio(toNumber(row.likes) + toNumber(row.comments) + toNumber(row.shares), toNumber(row.views)),
      thumbnailCtr: row.videoThumbnailImpressions ? toNumber(row.videoThumbnailImpressionsClickRate) : null,
      netSubscribers: toNumber(row.subscribersGained) - toNumber(row.subscribersLost),
    };
  });

  const thumbnailTargets = videoMetadata.concat(topVideos);
  await enrichThumbnailVisualFeatures(thumbnailTargets, options.thumbnailFeatureCache || new Map());
  const thumbnailVisualDiagnostics = {
    status: 'ok',
    requestedVideos: thumbnailTargets.filter((video: any) => video?.thumbnailUrl).length,
    rows: thumbnailTargets.filter((video: any) => video?.thumbnailFeatures?.visual).length,
    reused: thumbnailTargets.filter((video: any) => video?.thumbnailFeatures?.visualSource === 'stored').length,
    fresh: thumbnailTargets.filter((video: any) => video?.thumbnailFeatures?.visualSource === 'fresh').length,
    limit: THUMBNAIL_VISUAL_ANALYSIS_LIMIT,
  };

  const [retentionResult, playlistAnalyticsResult] = await Promise.all([
    fetchRetentionCurves(accessToken, topVideos, windows),
    fetchPlaylistAnalytics(accessToken, playlists, windows, fullCurrent.views),
  ]);
  const retentionCurves = retentionResult.rows;
  const topPlaylists = playlistAnalyticsResult.rows;

  const breakdowns = {
    trafficSources: buildSegmentRows(trafficPayload, 'insightTrafficSourceType', fullCurrent.views, 8),
    searchTerms: buildSegmentRows(searchTermsPayload, 'insightTrafficSourceDetail', fullCurrent.views, 10),
    externalSources: buildSegmentRows(externalTrafficPayload, 'insightTrafficSourceDetail', fullCurrent.views, 10),
    devices: buildSegmentRows(devicePayload, 'deviceType', fullCurrent.views, 6),
    subscribedStatus: buildSegmentRows(subscribedPayload, 'subscribedStatus', fullCurrent.views, 4),
    contentTypes: buildSegmentRows(contentTypePayload, 'creatorContentType', fullCurrent.views, 5),
    countries: buildSegmentRows(countryPayload, 'country', fullCurrent.views, 8),
    youtubeProducts: buildSegmentRows(productPayload, 'youtubeProduct', fullCurrent.views, 4),
    liveOrOnDemand: buildSegmentRows(livePayload, 'liveOrOnDemand', fullCurrent.views, 4),
    demographics: buildDemographicRows(demographicPayload),
    retentionCurves,
    topPlaylists,
  };
  const collectorDiagnostics = {
    optionalReports: {
      trafficSources: trafficPayload._diagnostic,
      searchTerms: searchTermsPayload._diagnostic,
      externalSources: externalTrafficPayload._diagnostic,
      devices: devicePayload._diagnostic,
      subscribedStatus: subscribedPayload._diagnostic,
      contentTypes: contentTypePayload._diagnostic,
      countries: countryPayload._diagnostic,
      youtubeProducts: productPayload._diagnostic,
      liveOrOnDemand: livePayload._diagnostic,
      demographics: demographicPayload._diagnostic,
    },
    videoDailyRows: videoDailyResult.diagnostic,
    thumbnailVisuals: thumbnailVisualDiagnostics,
    retentionCurves: retentionResult.diagnostic,
    playlists: {
      data: playlistDataResult.diagnostic,
      analytics: playlistAnalyticsResult.diagnostic,
    },
  };

  const text = buildInsightText(summary, topVideos, breakdowns);
  const researchLab = options.includeResearchLab
    ? buildResearchLab(summary, {
        current: fullCurrent,
        previous: fullPrevious,
        deltas: buildDeltas(fullCurrent, fullPrevious),
        breakdowns,
        topVideos,
        dailyRows: fullDailyRows,
        videoDailyRows,
        videoMetadata,
        playlists,
        collectorDiagnostics,
      })
    : null;

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
    breakdowns,
    topVideos,
    dailyRows: fullDailyRows,
    videoDailyRows,
    videoMetadata,
    playlists,
    collectorDiagnostics,
    ...(researchLab ? { researchLab } : {}),
    ...text,
  };
}

function stripFullAnalysisForResponse(fullAnalysis: any, options: { includeResearchLab?: boolean } = {}) {
  const {
    dailyRows,
    videoDailyRows,
    videoMetadata,
    comments,
    playlists,
    collectorDiagnostics,
    researchLab,
    ...publicFullAnalysis
  } = fullAnalysis || {};

  if (options.includeResearchLab && researchLab) {
    publicFullAnalysis.researchLab = researchLab;
    publicFullAnalysis.collectorDiagnostics = collectorDiagnostics;
  }

  publicFullAnalysis.topVideos = (publicFullAnalysis.topVideos || []).map((video: any) => ({
    id: video.id,
    title: video.title,
    thumbnailUrl: video.thumbnailUrl,
    publishedAt: video.publishedAt,
    views: video.views,
    engagedViews: video.engagedViews,
    redViews: video.redViews,
    watchHours: video.watchHours,
    premiumWatchHours: video.premiumWatchHours,
    averageViewDuration: video.averageViewDuration,
    averageViewPercentage: video.averageViewPercentage,
    likes: video.likes,
    dislikes: video.dislikes,
    comments: video.comments,
    shares: video.shares,
    playlistNetAdds: video.playlistNetAdds,
    engagementRate: video.engagementRate,
    thumbnailCtr: video.thumbnailCtr,
    netSubscribers: video.netSubscribers,
  }));

  return publicFullAnalysis;
}

async function readFreshStoredFullAnalysis(supabase: any, params: {
  userId: string;
  channelId: string;
  windows: any;
  force?: boolean;
}) {
  if (params.force) return null;

  const since = new Date(Date.now() - FULL_ANALYSIS_SERVER_CACHE_TTL_MS).toISOString();
  const { data, error } = await supabase
    .from('youtube_channel_insight_runs')
    .select('id,generated_at,model_version,results')
    .eq('user_id', params.userId)
    .eq('channel_id', params.channelId)
    .eq('analysis_type', 'account_dashboard_full_analysis')
    .eq('model_version', FULL_ANALYSIS_MODEL_VERSION)
    .eq('period_start', params.windows.fullStartDate)
    .eq('period_end', params.windows.endDate)
    .gte('generated_at', since)
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn('[account-dashboard] read stored full analysis:', error.message);
    return null;
  }

  if (!data?.results) return null;

  return {
    id: data.id,
    generatedAt: data.generated_at,
    modelVersion: data.model_version,
    fullAnalysis: data.results,
  };
}

function prepareStoredFullAnalysisForResponse(summary: any, storedFullAnalysis: any, options: { includeResearchLab?: boolean } = {}) {
  const fullAnalysis = {
    ...storedFullAnalysis,
    servedFromServerCache: true,
  };

  if (options.includeResearchLab && !fullAnalysis.researchLab) {
    fullAnalysis.researchLab = buildResearchLab(summary, fullAnalysis);
  }

  return stripFullAnalysisForResponse(fullAnalysis, options);
}

async function readAdminTable(supabase: any, table: string, select: string, orderColumn = 'created_at', truncatedTables: string[] = []) {
  const rows: any[] = [];

  for (let from = 0; from < ADMIN_TABLE_MAX_ROWS; from += ADMIN_TABLE_PAGE_SIZE) {
    const to = from + ADMIN_TABLE_PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .order(orderColumn, { ascending: false })
      .range(from, to);

    if (error) {
      console.warn(`[admin-research] ${table}:`, error.message);
      return rows;
    }

    const page = data || [];
    rows.push(...page);

    if (page.length < ADMIN_TABLE_PAGE_SIZE) {
      return rows;
    }
  }

  truncatedTables.push(table);
  return rows;
}

function normalizeAdminMinSubscribers(value: any) {
  const parsed = Math.max(0, Math.floor(toNumber(value)));
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(parsed, 1000000000);
}

function monthStartIso() {
  const date = new Date();
  date.setUTCDate(1);
  date.setUTCHours(0, 0, 0, 0);
  return date.toISOString();
}

function isCurrentMonth(value: any, monthStart: string) {
  if (!value) return false;
  const timestamp = Date.parse(String(value));
  return Number.isFinite(timestamp) && timestamp >= Date.parse(monthStart);
}

async function listAdminAuthUsers(supabase: any) {
  const users: any[] = [];
  const perPage = 1000;

  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const batch = data?.users || [];
    users.push(...batch);

    if (batch.length < perPage) break;
  }

  return users;
}

async function readOptionalExportStats(supabase: any, monthStart: string) {
  const tableCandidates = ['platform_exports', 'tool_exports', 'export_events', 'exports'];

  for (const table of tableCandidates) {
    try {
      const total = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      if (total.error) continue;

      const month = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthStart);

      return {
        tracked: true,
        table,
        total: Number(total.count || 0),
        thisMonth: month.error ? null : Number(month.count || 0),
      };
    } catch {
      // Export tracking is optional and may not exist yet.
    }
  }

  return {
    tracked: false,
    table: null,
    total: null,
    thisMonth: null,
  };
}

function filterRowsByChannels(rows: any[], allowedChannelIds: Set<string>) {
  if (!allowedChannelIds.size) return [];
  return rows.filter((row) => allowedChannelIds.has(String(row?.channel_id || '')));
}

async function buildAdminPlatformStats(supabase: any) {
  const monthStart = monthStartIso();
  const [
    users,
    profiles,
    extensionSessions,
    youtubeConnections,
    syncRuns,
    exportStats,
  ] = await Promise.all([
    listAdminAuthUsers(supabase),
    readAdminTable(supabase, 'profiles', 'user_id,email,display_name,created_at,updated_at', 'created_at'),
    readAdminTable(supabase, 'extension_sessions', 'user_id,created_at,last_used_at,revoked_at', 'created_at'),
    readAdminTable(supabase, 'youtube_connections', 'user_id,channel_id,channel_title,disconnected_at,updated_at', 'updated_at'),
    readAdminTable(supabase, 'youtube_analytics_sync_runs', 'user_id,channel_id,sync_type,status,created_at,completed_at', 'created_at'),
    readOptionalExportStats(supabase, monthStart),
  ]);

  const profileByUserId = new Map(profiles.map((profile: any) => [profile.user_id, profile]));
  const activeUserIds = new Set<string>();

  users.forEach((user: any) => {
    if (isCurrentMonth(user.last_sign_in_at, monthStart)) activeUserIds.add(user.id);
  });

  extensionSessions.forEach((session: any) => {
    if (isCurrentMonth(session.last_used_at || session.created_at, monthStart)) activeUserIds.add(session.user_id);
  });

  syncRuns.forEach((run: any) => {
    if (isCurrentMonth(run.completed_at || run.created_at, monthStart)) activeUserIds.add(run.user_id);
  });

  const userRows = users
    .map((user: any) => {
      const profile = profileByUserId.get(user.id) || {};
      return {
        id: user.id,
        email: user.email || profile.email || '',
        displayName: profile.display_name || user.user_metadata?.full_name || null,
        createdAt: user.created_at || profile.created_at || null,
        lastSignInAt: user.last_sign_in_at || null,
        profileUpdatedAt: profile.updated_at || null,
      };
    })
    .filter((user: any) => user.email)
    .sort((left: any, right: any) => String(right.createdAt || '').localeCompare(String(left.createdAt || '')));

  const connectedUserIds = new Set(youtubeConnections.filter((row: any) => !row.disconnected_at).map((row: any) => row.user_id).filter(Boolean));
  const extensionUserIds = new Set(extensionSessions.filter((row: any) => !row.revoked_at).map((row: any) => row.user_id).filter(Boolean));
  const activeConnectedChannels = new Set(youtubeConnections.filter((row: any) => !row.disconnected_at).map((row: any) => row.channel_id).filter(Boolean));

  return {
    generatedAt: new Date().toISOString(),
    monthStart,
    totals: {
      totalUsers: users.length,
      profileRows: profiles.length,
      newUsersThisMonth: users.filter((user: any) => isCurrentMonth(user.created_at, monthStart)).length,
      activeUsersThisMonth: activeUserIds.size,
      totalExports: exportStats.total,
      exportsThisMonth: exportStats.thisMonth,
      exportTrackingAvailable: exportStats.tracked,
      exportTrackingTable: exportStats.table,
      connectedYouTubeUsers: connectedUserIds.size,
      connectedYouTubeChannels: activeConnectedChannels.size,
      extensionConnectedUsers: extensionUserIds.size,
    },
    users: userRows,
  };
}

function resolveAdminChannelFilter(channelSnapshots: any[], minSubscribers: number) {
  const latestChannels = latestRowsBy(channelSnapshots, 'channel_id', 'snapshot_date');
  const allowedChannelIds = new Set<string>();
  let unknownSubscriberChannels = 0;

  latestChannels.forEach((channel: any) => {
    const channelId = String(channel?.channel_id || '');
    if (!channelId) return;

    const subscriberCount = Number(channel.subscriber_count);
    if (!Number.isFinite(subscriberCount)) {
      unknownSubscriberChannels += 1;
      if (minSubscribers === 0) allowedChannelIds.add(channelId);
      return;
    }

    if (subscriberCount >= minSubscribers) {
      allowedChannelIds.add(channelId);
    }
  });

  return {
    latestChannels,
    allowedChannelIds,
    totalChannels: latestChannels.length,
    includedChannels: allowedChannelIds.size,
    excludedChannels: Math.max(0, latestChannels.length - allowedChannelIds.size),
    unknownSubscriberChannels,
  };
}

function latestRowsBy(rows: any[], keyField: string, dateField: string) {
  const map = new Map();
  rows.forEach((row) => {
    const key = row?.[keyField];
    if (!key) return;
    const current = map.get(key);
    if (!current || String(row?.[dateField] || '') > String(current?.[dateField] || '')) {
      map.set(key, row);
    }
  });
  return Array.from(map.values());
}

function latestBreakdownRows(rows: any[]) {
  const map = new Map();
  rows.forEach((row) => {
    const key = [
      row?.channel_id || '',
      row?.video_id || '',
      row?.dimension_set || '',
      row?.dimension_key || '',
    ].join(':');
    if (!key.replace(/:/g, '')) return;
    const current = map.get(key);
    const rowDate = String(row?.period_end || row?.period_start || '');
    const currentDate = String(current?.period_end || current?.period_start || '');
    if (!current || rowDate >= currentDate) {
      map.set(key, row);
    }
  });
  return Array.from(map.values());
}

function average(values: any[]) {
  const numbers = values.map(toNumber).filter((value) => Number.isFinite(value));
  if (!numbers.length) return null;
  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
}

function sum(values: any[]) {
  return values.map(toNumber).reduce((total, value) => total + value, 0);
}

function safeDivide(numerator: number, denominator: number) {
  return denominator ? numerator / denominator : null;
}

function pearson(pairs: Array<[number | null, number | null]>) {
  const clean = pairs
    .map(([x, y]) => [Number(x), Number(y)] as [number, number])
    .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));

  if (clean.length < 3) return null;

  const meanX = average(clean.map(([x]) => x)) || 0;
  const meanY = average(clean.map(([, y]) => y)) || 0;
  const numerator = clean.reduce((total, [x, y]) => total + (x - meanX) * (y - meanY), 0);
  const denomX = Math.sqrt(clean.reduce((total, [x]) => total + Math.pow(x - meanX, 2), 0));
  const denomY = Math.sqrt(clean.reduce((total, [, y]) => total + Math.pow(y - meanY, 2), 0));
  if (!denomX || !denomY) return null;
  return { value: numerator / (denomX * denomY), sampleSize: clean.length };
}

function describeCorrelation(result: any, xLabel: string, yLabel: string) {
  if (!result) return `Need at least 3 videos with both ${xLabel} and ${yLabel}.`;
  const strength = Math.abs(result.value) >= 0.65
    ? 'strong'
    : Math.abs(result.value) >= 0.35
      ? 'moderate'
      : 'weak';
  const direction = result.value >= 0 ? 'positive' : 'negative';
  return `${strength} ${direction} relationship (r=${result.value.toFixed(2)}, n=${result.sampleSize}).`;
}

function formatNumber(value: any) {
  const next = Number(value);
  if (!Number.isFinite(next)) return '—';
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: next >= 100 ? 0 : 1 }).format(next);
}

function formatPercentMetric(value: any) {
  const next = Number(value);
  if (!Number.isFinite(next)) return '—';
  const normalized = Math.abs(next) <= 1 ? next * 100 : next;
  return `${normalized.toFixed(1)}%`;
}

function formatRatioPercent(value: any) {
  const next = Number(value);
  if (!Number.isFinite(next)) return '—';
  return `${(next * 100).toFixed(1)}%`;
}

function wordTokens(value: string) {
  return String(value || '')
    .toLowerCase()
    .match(/[a-z0-9]+/g) || [];
}

function hasQuestionPattern(title: string) {
  return /[?]/.test(title) || /\b(how|why|what|when|where|should|can|will|does|is|are)\b/i.test(title);
}

function hasEmotionalWords(title: string) {
  return wordTokens(title).some((word) => EMOTIONAL_TITLE_WORDS.has(word));
}

function titleCaseShare(title: string) {
  const words = String(title || '').match(/\b[A-Za-z][A-Za-z0-9']*\b/g) || [];
  if (!words.length) return 0;
  const titleCased = words.filter((word) => /^[A-Z][a-z0-9']+/.test(word)).length;
  return titleCased / words.length;
}

function keywordDensity(text: string) {
  const tokens = wordTokens(text).filter((word) => word.length > 3);
  if (!tokens.length) return 0;
  const counts = tokens.reduce((map: any, token) => {
    map[token] = (map[token] || 0) + 1;
    return map;
  }, {});
  return Math.max(...Object.values(counts).map(Number)) / tokens.length;
}

function groupByAverage<T>(rows: T[], keyFn: (row: T) => string, valueFn: (row: T) => number | null) {
  const groups = new Map<string, number[]>();
  rows.forEach((row) => {
    const key = keyFn(row);
    const value = valueFn(row);
    if (!key || !Number.isFinite(Number(value))) return;
    groups.set(key, (groups.get(key) || []).concat(Number(value)));
  });

  return Array.from(groups.entries())
    .map(([key, values]) => ({ key, average: average(values), count: values.length }))
    .filter((row) => row.average !== null)
    .sort((left, right) => Number(right.average) - Number(left.average));
}

function compareSegments<T>(rows: T[], predicate: (row: T) => boolean, valueFn: (row: T) => number | null, positiveLabel: string, negativeLabel: string, formatter = formatNumber) {
  const positive = rows.filter(predicate).map(valueFn).filter((value) => Number.isFinite(Number(value)));
  const negative = rows.filter((row) => !predicate(row)).map(valueFn).filter((value) => Number.isFinite(Number(value)));

  if (positive.length < 2 || negative.length < 2) {
    return `Need more examples in both groups (${positiveLabel}: ${positive.length}, ${negativeLabel}: ${negative.length}).`;
  }

  return `${positiveLabel}: ${formatter(average(positive))} vs ${negativeLabel}: ${formatter(average(negative))} (${positive.length}/${negative.length} videos).`;
}

function topBreakdown(breakdowns: any[], dimensionSet: string, metric = 'views') {
  const rows = breakdowns
    .filter((row) => row.dimension_set === dimensionSet)
    .map((row) => ({
      label: row.dimension_values?.label || row.dimension_values?.key || row.dimension_key,
      value: toNumber(row.metrics?.[metric]),
      share: toNumber(row.metrics?.shareOfViews),
      periodEnd: row.period_end,
    }))
    .filter((row) => Number.isFinite(row.value));

  if (!rows.length) return null;
  return rows.sort((left, right) => right.value - left.value)[0];
}

function summarizeRetentionCurveBreakdowns(breakdowns: any[]) {
  const rows = breakdowns
    .filter((row) => row.dimension_set === 'retentionCurves')
    .map((row) => ({
      videoId: row.dimension_values?.videoId || row.video_id || '',
      title: row.dimension_values?.title || row.dimension_values?.label || row.dimension_key,
      elapsed: Number(row.dimension_values?.elapsedVideoTimeRatio),
      audienceWatchRatio: Number(row.metrics?.audienceWatchRatio),
      stoppedWatching: Number(row.metrics?.stoppedWatching),
    }))
    .filter((row) => row.videoId && Number.isFinite(row.elapsed) && Number.isFinite(row.audienceWatchRatio));

  if (!rows.length) return null;

  const byVideo = new Map();
  rows.forEach((row) => {
    byVideo.set(row.videoId, (byVideo.get(row.videoId) || []).concat(row));
  });

  const summaries = Array.from(byVideo.entries()).map(([videoId, videoRows]) => {
    const sorted = videoRows.slice().sort((left: any, right: any) => left.elapsed - right.elapsed);
    const earlyRows = sorted.filter((row: any) => row.elapsed <= 0.15);
    const midRows = sorted.filter((row: any) => row.elapsed >= 0.35 && row.elapsed <= 0.65);
    const lateRows = sorted.filter((row: any) => row.elapsed >= 0.75);
    const early = average(earlyRows.map((row: any) => row.audienceWatchRatio));
    const mid = average(midRows.map((row: any) => row.audienceWatchRatio));
    const late = average(lateRows.map((row: any) => row.audienceWatchRatio));
    const biggestStop = sorted.slice().sort((left: any, right: any) => toNumber(right.stoppedWatching) - toNumber(left.stoppedWatching))[0];

    return {
      videoId,
      title: sorted[0]?.title || videoId,
      rows: sorted.length,
      early,
      mid,
      late,
      earlyToMidDrop: early !== null && mid !== null ? early - mid : null,
      biggestStopAt: biggestStop ? biggestStop.elapsed : null,
      biggestStopValue: biggestStop ? biggestStop.stoppedWatching : null,
    };
  });

  const weakestHook = summaries
    .filter((row) => Number.isFinite(Number(row.earlyToMidDrop)))
    .sort((left, right) => Number(right.earlyToMidDrop) - Number(left.earlyToMidDrop))[0];
  const strongestRetention = summaries
    .filter((row) => Number.isFinite(Number(row.late)))
    .sort((left, right) => Number(right.late) - Number(left.late))[0];

  return {
    rows: rows.length,
    videos: summaries.length,
    weakestHook,
    strongestRetention,
  };
}

function buildVideoResearchRecords(videoSnapshots: any[], videoDailyRows: any[]) {
  const latestVideos = latestRowsBy(videoSnapshots, 'video_id', 'snapshot_date');
  const dailyMap = new Map();

  videoDailyRows.forEach((row) => {
    const videoId = row.video_id;
    if (!videoId) return;
    const current = dailyMap.get(videoId) || {
      rows: [],
      views: 0,
      engagedViews: 0,
      watchMinutes: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      netSubscribers: 0,
      impressions: 0,
      playlistNetAdds: 0,
      weightedCtr: 0,
      ctrWeight: 0,
      weightedAvd: 0,
      avdWeight: 0,
      weightedRetention: 0,
      retentionWeight: 0,
    };

    const views = toNumber(row.views);
    const impressions = toNumber(row.thumbnail_impressions);
    current.rows.push(row);
    current.views += views;
    current.engagedViews += toNumber(row.engaged_views);
    current.watchMinutes += toNumber(row.estimated_minutes_watched);
    current.likes += toNumber(row.likes);
    current.comments += toNumber(row.comments);
    current.shares += toNumber(row.shares);
    current.netSubscribers += toNumber(row.subscribers_gained) - toNumber(row.subscribers_lost);
    current.impressions += impressions;
    current.playlistNetAdds += toNumber(row.videos_added_to_playlists) - toNumber(row.videos_removed_from_playlists);

    if (Number.isFinite(Number(row.thumbnail_ctr))) {
      const weight = impressions || 1;
      current.weightedCtr += toNumber(row.thumbnail_ctr) * weight;
      current.ctrWeight += weight;
    }
    if (Number.isFinite(Number(row.average_view_duration_seconds))) {
      const weight = views || 1;
      current.weightedAvd += toNumber(row.average_view_duration_seconds) * weight;
      current.avdWeight += weight;
    }
    if (Number.isFinite(Number(row.average_view_percentage))) {
      const weight = views || 1;
      current.weightedRetention += toNumber(row.average_view_percentage) * weight;
      current.retentionWeight += weight;
    }

    dailyMap.set(videoId, current);
  });

  return latestVideos.map((video) => {
    const perf = dailyMap.get(video.video_id) || {};
    const title = String(video.title || '');
    const description = String(video.description || '');
    const tags = Array.isArray(video.tags) ? video.tags : [];
    const views = toNumber(perf.views || video.view_count);
    const engagement = toNumber(perf.likes) + toNumber(perf.comments) + toNumber(perf.shares);
    const durationSeconds = toNumber(video.duration_seconds);
    const thumbnailFeatures = video.thumbnail_features || {};
    const thumbnailVisual = thumbnailFeatures.visual || {};
    const visualNumber = (value: any) => Number.isFinite(Number(value)) ? toNumber(value) : null;

    return {
      ...video,
      title,
      description,
      tags,
      titleLength: title.length,
      titleWordCount: wordTokens(title).length,
      hasNumberInTitle: /\d/.test(title),
      hasQuestionInTitle: hasQuestionPattern(title),
      hasEmotionalTitle: hasEmotionalWords(title),
      uppercaseShare: title.length ? (title.match(/[A-Z]/g) || []).length / title.length : 0,
      titleCaseShare: titleCaseShare(title),
      descriptionLength: description.length,
      descriptionWordCount: wordTokens(description).length,
      descriptionLinkCount: (description.match(/https?:\/\/|www\./gi) || []).length,
      keywordDensity: keywordDensity(description),
      tagCount: tags.length,
      durationSeconds,
      ageDays: video.published_at ? Math.max(0, Math.round((Date.now() - new Date(video.published_at).getTime()) / DAY_MS)) : null,
      views,
      engagedViews: toNumber(perf.engagedViews),
      watchHours: toNumber(perf.watchMinutes) / 60,
      likes: toNumber(perf.likes),
      comments: toNumber(perf.comments),
      shares: toNumber(perf.shares),
      netSubscribers: toNumber(perf.netSubscribers),
      impressions: toNumber(perf.impressions),
      playlistNetAdds: toNumber(perf.playlistNetAdds),
      thumbnailCtr: perf.ctrWeight ? perf.weightedCtr / perf.ctrWeight : null,
      averageViewDuration: perf.avdWeight ? perf.weightedAvd / perf.avdWeight : null,
      averageViewPercentage: perf.retentionWeight ? perf.weightedRetention / perf.retentionWeight : null,
      engagementRate: safeDivide(engagement, views),
      likeRate: safeDivide(toNumber(perf.likes), views),
      commentRate: safeDivide(toNumber(perf.comments), views),
      shareRate: safeDivide(toNumber(perf.shares), views),
      playlistAddRate: safeDivide(toNumber(perf.playlistNetAdds), views),
      subsPerThousandViews: views ? (toNumber(perf.netSubscribers) / views) * 1000 : null,
      viewsPerSubscriber: null,
      thumbnailFeatures,
      thumbnailVisual,
      thumbnailTextPresent: thumbnailVisual.textPresent === undefined ? null : Boolean(thumbnailVisual.textPresent),
      thumbnailTextReadabilityScore: visualNumber(thumbnailVisual.textReadabilityScore),
      thumbnailComplexity: visualNumber(thumbnailVisual.visualComplexity),
      thumbnailOverallScore: visualNumber(thumbnailVisual.overallScore),
      thumbnailCompositionScore: visualNumber(thumbnailVisual.compositionScore),
      thumbnailLightingScore: visualNumber(thumbnailVisual.lightingScore),
      thumbnailAverageBrightness: visualNumber(thumbnailVisual.averageBrightness),
      thumbnailAverageSaturation: visualNumber(thumbnailVisual.averageSaturation),
      thumbnailContrastStdDev: visualNumber(thumbnailVisual.contrastStdDev),
      thumbnailEdgeDensity: visualNumber(thumbnailVisual.edgeDensity),
      thumbnailCenterFocusRatio: visualNumber(thumbnailVisual.centerFocusRatio),
      thumbnailDominantHueBucket: thumbnailVisual.dominantHueBucket || '',
      thumbnailStyleSignature: thumbnailVisual.styleSignature || '',
      dailyRows: perf.rows || [],
    };
  });
}

function buildOutlierSummary(records: any[], metric: string, label: string, formatter = formatNumber) {
  const values = records.map((record) => toNumber(record[metric])).filter((value) => value > 0);
  const avg = average(values);
  if (!avg || values.length < 3) return `Need more videos with ${label} data.`;
  const outliers = records
    .filter((record) => toNumber(record[metric]) >= avg * 2)
    .sort((left, right) => toNumber(right[metric]) - toNumber(left[metric]))
    .slice(0, 3);
  if (!outliers.length) return `No videos are currently above 2x average ${label} (${formatter(avg)}).`;
  return `${outliers.length} video${outliers.length === 1 ? '' : 's'} above 2x average ${label}; top: “${outliers[0].title || outliers[0].video_id}” at ${formatter(outliers[0][metric])}.`;
}

function buildAdminResearchSections(data: any) {
  const { records, channelDailyRows, breakdowns, channelSnapshots } = data;
  const videosWithCtr = records.filter((record: any) => Number.isFinite(Number(record.thumbnailCtr)));
  const videosWithRetention = records.filter((record: any) => Number.isFinite(Number(record.averageViewPercentage)));
  const videosWithViews = records.filter((record: any) => Number.isFinite(Number(record.views)) && record.views > 0);
  const avgViews = average(videosWithViews.map((record: any) => record.views)) || 0;
  const avgEngagementRate = average(videosWithViews.map((record: any) => record.engagementRate).filter((value: any) => Number.isFinite(Number(value)))) || 0;
  const avgCtr = average(videosWithCtr.map((record: any) => record.thumbnailCtr));
  const avgRetention = average(videosWithRetention.map((record: any) => record.averageViewPercentage));
  const recordsWithVisualThumbs = records.filter((record: any) => Number.isFinite(Number(record.thumbnailOverallScore)));
  const visualThumbsWithCtr = recordsWithVisualThumbs.filter((record: any) => Number.isFinite(Number(record.thumbnailCtr)));
  const textPresentVisualsWithCtr = visualThumbsWithCtr.filter((record: any) => record.thumbnailTextPresent === true);
  const textAbsentVisualsWithCtr = visualThumbsWithCtr.filter((record: any) => record.thumbnailTextPresent === false);
  const strongestThumbnailStyleBySubs = groupByAverage(recordsWithVisualThumbs, (record: any) => record.thumbnailStyleSignature, (record: any) => record.subsPerThousandViews)[0];
  const strongestThumbnailStyleByCtr = groupByAverage(visualThumbsWithCtr, (record: any) => record.thumbnailStyleSignature, (record: any) => record.thumbnailCtr)[0];
  const topTraffic = topBreakdown(breakdowns, 'trafficSources');
  const topSearch = topBreakdown(breakdowns, 'searchTerms');
  const topDevice = topBreakdown(breakdowns, 'devices');
  const topCountry = topBreakdown(breakdowns, 'countries');
  const topProduct = topBreakdown(breakdowns, 'youtubeProducts');
  const topSubscribed = topBreakdown(breakdowns, 'subscribedStatus');
  const topPlaylist = topBreakdown(breakdowns, 'topPlaylists', 'playlistViews');
  const topPlaylistWatch = topBreakdown(breakdowns, 'topPlaylists', 'playlistWatchHours');
  const retentionSummary = summarizeRetentionCurveBreakdowns(breakdowns);
  const bestPublishDay = groupByAverage(records, (record: any) => record.published_at ? new Date(record.published_at).toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' }) : '', (record: any) => record.views)[0];
  const bestPublishHourCtr = groupByAverage(videosWithCtr, (record: any) => record.published_at ? `${new Date(record.published_at).getUTCHours()}:00 UTC` : '', (record: any) => record.thumbnailCtr)[0];
  const bestPublishHourWatch = groupByAverage(records, (record: any) => record.published_at ? `${new Date(record.published_at).getUTCHours()}:00 UTC` : '', (record: any) => record.watchHours)[0];
  const bestLengthWatch = groupByAverage(records, (record: any) => {
    const seconds = toNumber(record.durationSeconds);
    if (!seconds) return '';
    if (seconds <= 180) return 'Shorts / under 3 min';
    if (seconds <= 480) return '3-8 min';
    if (seconds <= 900) return '8-15 min';
    if (seconds <= 1800) return '15-30 min';
    return '30+ min';
  }, (record: any) => record.watchHours)[0];
  const strongestTopic = groupByAverage(records.flatMap((record: any) => {
    const words = wordTokens(record.title).filter((word: string) => word.length > 3 && !['video', 'youtube', 'with', 'from', 'this', 'that'].includes(word));
    return Array.from(new Set(words.slice(0, 8))).map((word) => ({ word, views: record.views }));
  }), (row: any) => row.word, (row: any) => row.views)[0];
  const privatePublic = records.filter((record: any) => record.privacy_status && record.privacy_status !== 'public').length;
  const channelsWithDescriptions = channelSnapshots.filter((channel: any) => String(channel.description || '').trim()).length;
  const channelsWithBranding = channelSnapshots.filter((channel: any) => channel.thumbnail_url || channel.banner_url || Object.keys(channel.branding || {}).length).length;
  const duplicateTitles = records.length - new Set(records.map((record: any) => String(record.title || '').toLowerCase().trim()).filter(Boolean)).size;
  const duplicateThumbs = records.length - new Set(records.map((record: any) => String(record.thumbnail_url || '').trim()).filter(Boolean)).size;
  const thumbnailTextPresenceAnswer = visualThumbsWithCtr.length
    ? compareSegments(visualThumbsWithCtr, (record: any) => record.thumbnailTextPresent === true, (record: any) => record.thumbnailCtr, 'Text-present thumbnails', 'No-text thumbnails', formatPercentMetric)
    : 'Thumbnail text-presence proxies are collected during full channel analysis.';

  const normalizeResearchStatus = (answer: string, status: string) => {
    if (!['Live', 'Proxy', 'Early'].includes(status)) return status;

    const text = String(answer || '').trim().toLowerCase();
    if (
      text.startsWith('need ') ||
      text.startsWith('needs ') ||
      text.startsWith('need at least') ||
      text.startsWith('not enough') ||
      text.includes('needs both') ||
      text.includes('needs more') ||
      text.includes('need more') ||
      text.includes('need ctr') ||
      text.includes('need traffic') ||
      text.includes('need search') ||
      text.includes('need device') ||
      text.includes('need country') ||
      text.includes('need youtube') ||
      text.includes('need subscribed') ||
      text.includes('need external') ||
      text.includes('no low-reach/high-engagement candidates yet') ||
      text.includes('no high-reach/low-engagement candidates yet') ||
      text.includes('no high-ctr/weak-retention candidates yet') ||
      text.includes('no passive-view candidate yet')
    ) {
      return 'Needs data';
    }

    return status;
  };
  const item = (label: string, answer: string, status = 'Live', detail = '') => ({
    label,
    answer,
    status: normalizeResearchStatus(answer, status),
    detail,
  });
  const building = (label: string, answer: string) => item(label, answer, 'Building history');

  return [
    {
      title: 'Packaging And Metadata',
      items: [
        item('Correlation between title length and CTR', describeCorrelation(pearson(videosWithCtr.map((record: any) => [record.titleLength, record.thumbnailCtr])), 'title length', 'CTR'), 'Live'),
        item('Correlation between title wording patterns and CTR', strongestTopic ? `Strongest repeated title term by average views is “${strongestTopic.key}” (${formatNumber(strongestTopic.average)} avg views, n=${strongestTopic.count}).` : 'Need more titles to identify repeated wording patterns.', strongestTopic ? 'Live' : 'Needs data'),
        item('Impact of numbers in titles on performance', compareSegments(videosWithCtr, (record: any) => record.hasNumberInTitle, (record: any) => record.thumbnailCtr, 'Numbered titles', 'Non-numbered titles', formatPercentMetric), 'Live'),
        item('Impact of questions in titles on CTR', compareSegments(videosWithCtr, (record: any) => record.hasQuestionInTitle, (record: any) => record.thumbnailCtr, 'Question-style titles', 'Non-question titles', formatPercentMetric), 'Live'),
        item('Impact of emotional words in titles on engagement', compareSegments(records, (record: any) => record.hasEmotionalTitle, (record: any) => record.engagementRate, 'Emotional-word titles', 'Neutral titles', formatRatioPercent), 'Live'),
        item('Title capitalization patterns vs performance', describeCorrelation(pearson(records.map((record: any) => [record.uppercaseShare, record.engagementRate])), 'uppercase share', 'engagement'), 'Live'),
        item('Title length vs retention correlation', describeCorrelation(pearson(videosWithRetention.map((record: any) => [record.titleLength, record.averageViewPercentage])), 'title length', 'average viewed'), 'Live'),
        item('Description length vs performance', describeCorrelation(pearson(records.map((record: any) => [record.descriptionLength, record.views])), 'description length', 'views'), 'Live'),
        item('Keyword density in description vs search traffic', topSearch ? `Top search term is “${topSearch.label}”; description keyword-density correlation to views is ${describeCorrelation(pearson(records.map((record: any) => [record.keywordDensity, record.views])), 'description keyword density', 'views')}` : 'Need search-term breakdowns from full analysis runs.', topSearch ? 'Live' : 'Needs data'),
        item('Links in description vs external traffic share', compareSegments(records, (record: any) => record.descriptionLinkCount > 0, (record: any) => record.views, 'Descriptions with links', 'No links'), 'Live'),
        item('Description formatting vs engagement', describeCorrelation(pearson(records.map((record: any) => [record.descriptionWordCount, record.engagementRate])), 'description word count', 'engagement'), 'Live'),
        item('Tags count vs CTR correlation', describeCorrelation(pearson(videosWithCtr.map((record: any) => [record.tagCount, record.thumbnailCtr])), 'tag count', 'CTR'), 'Live'),
        item('Tags usage vs search traffic share', compareSegments(records, (record: any) => record.tagCount > 0, (record: any) => record.views, 'Tagged videos', 'Untagged videos'), 'Live'),
        item('Tag consistency vs channel growth', describeCorrelation(pearson(records.map((record: any) => [record.tagCount, record.subsPerThousandViews])), 'tag count', 'subscriber conversion'), 'Live'),
        item('Tag overlap across videos vs performance consistency', building('Tag overlap across videos vs performance consistency', 'We store tags now; this gets stronger once the same channels have more saved videos over time.').answer, 'Building history'),
        item('Thumbnail style consistency vs channel growth', strongestThumbnailStyleBySubs ? `Top saved visual style for subscriber conversion is ${strongestThumbnailStyleBySubs.key} (${formatNumber(strongestThumbnailStyleBySubs.average)} subs per 1K views, n=${strongestThumbnailStyleBySubs.count}).${strongestThumbnailStyleByCtr ? ` Best CTR style is ${strongestThumbnailStyleByCtr.key} (${formatPercentMetric(strongestThumbnailStyleByCtr.average)}, n=${strongestThumbnailStyleByCtr.count}).` : ''}` : 'Thumbnail visual features are now collected during full channel analysis.', strongestThumbnailStyleBySubs ? 'Live' : 'Collecting'),
        item('Thumbnail text presence vs CTR', thumbnailTextPresenceAnswer, textPresentVisualsWithCtr.length && textAbsentVisualsWithCtr.length ? 'Live' : 'Collecting'),
        item('Thumbnail complexity vs CTR', visualThumbsWithCtr.length ? describeCorrelation(pearson(visualThumbsWithCtr.map((record: any) => [record.thumbnailComplexity, record.thumbnailCtr])), 'thumbnail complexity', 'CTR') : 'Thumbnail visual complexity is now collected during full channel analysis.', visualThumbsWithCtr.length >= 3 ? 'Live' : 'Collecting'),
        item('Thumbnail reuse vs performance', duplicateThumbs > 0 ? `${duplicateThumbs} possible thumbnail URL reuse cases found.` : 'No repeated thumbnail URLs found in current snapshots.', 'Proxy'),
      ],
    },
    {
      title: 'Publishing, Format, And Lifecycle',
      items: [
        item('Publish time vs performance', bestPublishHourWatch ? `Best stored publish hour by watch time is ${bestPublishHourWatch.key} (${formatNumber(bestPublishHourWatch.average)} avg watch hours, n=${bestPublishHourWatch.count}).` : 'Need published-at metadata plus analytics rows.', bestPublishHourWatch ? 'Live' : 'Needs data'),
        item('Best performing upload day per channel', bestPublishDay ? `${bestPublishDay.key} leads by average views (${formatNumber(bestPublishDay.average)}, n=${bestPublishDay.count}).` : 'Need more published videos.', bestPublishDay ? 'Live' : 'Needs data'),
        item('Best hour of day for highest CTR', bestPublishHourCtr ? `${bestPublishHourCtr.key} leads by CTR (${formatPercentMetric(bestPublishHourCtr.average)}, n=${bestPublishHourCtr.count}).` : 'Need more videos with CTR and publish time.', bestPublishHourCtr ? 'Live' : 'Needs data'),
        item('Best hour of day for highest watch time', bestPublishHourWatch ? `${bestPublishHourWatch.key} leads by watch time (${formatNumber(bestPublishHourWatch.average)} avg hours).` : 'Need more watch-time rows.', bestPublishHourWatch ? 'Live' : 'Needs data'),
        item('Best hour of day for highest engagement rate', (() => {
          const best = groupByAverage(records, (record: any) => record.published_at ? `${new Date(record.published_at).getUTCHours()}:00 UTC` : '', (record: any) => record.engagementRate)[0];
          return best ? `${best.key} leads by engagement (${formatRatioPercent(best.average)}, n=${best.count}).` : 'Need more engagement rows with publish time.';
        })(), 'Live'),
        item('Upload frequency vs subscriber growth', describeCorrelation(pearson(channelDailyRows.map((row: any) => [toNumber(row.views), toNumber(row.subscribers_gained) - toNumber(row.subscribers_lost)])), 'daily views', 'net subscribers'), 'Live'),
        building('Consistency of upload schedule vs performance stability', 'Stored publish dates and daily rows are enough; signal improves after several weeks of collection per channel.'),
        building('Gaps in uploads vs performance drops', 'Possible from publish dates + daily channel analytics once each channel has enough history.'),
        item('Video age vs cumulative views', describeCorrelation(pearson(records.map((record: any) => [record.ageDays, record.views])), 'video age', 'views'), 'Live'),
        building('Evergreen content identification', buildOutlierSummary(records.filter((record: any) => toNumber(record.ageDays) > 30), 'views', 'older-video views'), 'Building history'),
        building('Decay rate / lifespan / time-to-peak', 'Needs repeated daily snapshots across longer periods. Daily rows are being stored, so this will mature over time.'),
        building('CTR, retention, and engagement decay over time', 'Daily CTR/retention/engagement rows are stored; decay gets reliable after weeks of repeated collection.'),
        item('Optimal video length by niche / traffic source / subscriber growth', bestLengthWatch ? `${bestLengthWatch.key} leads by watch time (${formatNumber(bestLengthWatch.average)} avg watch hours, n=${bestLengthWatch.count}).` : 'Need more duration + analytics rows.', bestLengthWatch ? 'Live' : 'Needs data'),
        item('Relationship between video length and retention', describeCorrelation(pearson(videosWithRetention.map((record: any) => [record.durationSeconds, record.averageViewPercentage])), 'duration', 'average viewed'), 'Live'),
        item('Relationship between video length and CTR', describeCorrelation(pearson(videosWithCtr.map((record: any) => [record.durationSeconds, record.thumbnailCtr])), 'duration', 'CTR'), 'Live'),
        item('Relationship between video length and watch time', describeCorrelation(pearson(records.map((record: any) => [record.durationSeconds, record.watchHours])), 'duration', 'watch time'), 'Live'),
        item('Shorts vs long-form performance differences', compareSegments(records, (record: any) => Boolean(record.is_short_guess), (record: any) => record.views, 'Shorts-ish', 'Long-form'), 'Live'),
        item('Live vs VOD performance differences', compareSegments(records, (record: any) => record.live_broadcast_content === 'live' || record.live_broadcast_content === 'upcoming', (record: any) => record.views, 'Live/upcoming', 'VOD'), 'Live'),
        item('Private/unlisted vs public publishing patterns', privatePublic ? `${privatePublic} non-public video snapshots are present.` : 'No non-public video snapshots in current stored sample.', 'Live'),
      ],
    },
    {
      title: 'Performance Relationships And Outliers',
      items: [
        item('CTR vs watch time correlation', describeCorrelation(pearson(videosWithCtr.map((record: any) => [record.thumbnailCtr, record.watchHours])), 'CTR', 'watch time'), 'Live'),
        item('CTR vs retention correlation', describeCorrelation(pearson(videosWithCtr.map((record: any) => [record.thumbnailCtr, record.averageViewPercentage])), 'CTR', 'retention'), 'Live'),
        item('Retention vs subscriber conversion correlation', describeCorrelation(pearson(records.map((record: any) => [record.averageViewPercentage, record.subsPerThousandViews])), 'retention', 'subscriber conversion'), 'Live'),
        item('Engagement vs retention correlation', describeCorrelation(pearson(records.map((record: any) => [record.engagementRate, record.averageViewPercentage])), 'engagement', 'retention'), 'Live'),
        item('Engagement vs CTR correlation', describeCorrelation(pearson(videosWithCtr.map((record: any) => [record.engagementRate, record.thumbnailCtr])), 'engagement', 'CTR'), 'Live'),
        item('Views vs subscriber conversion rate', describeCorrelation(pearson(records.map((record: any) => [record.views, record.subsPerThousandViews])), 'views', 'subs per 1K views'), 'Live'),
        item('Views vs engagement rate scaling patterns', describeCorrelation(pearson(records.map((record: any) => [record.views, record.engagementRate])), 'views', 'engagement rate'), 'Live'),
        item('Top percentile CTR benchmarks', avgCtr !== null ? `Average stored CTR is ${formatPercentMetric(avgCtr)}; top quartile starts near ${formatPercentMetric(videosWithCtr.map((record: any) => record.thumbnailCtr).sort((a: any, b: any) => a - b)[Math.floor(videosWithCtr.length * 0.75)])}.` : 'Need CTR rows.', avgCtr !== null ? 'Live' : 'Needs data'),
        item('Top percentile retention benchmarks', avgRetention !== null ? `Average stored retention is ${formatPercentMetric(avgRetention)}; top quartile starts near ${formatPercentMetric(videosWithRetention.map((record: any) => record.averageViewPercentage).sort((a: any, b: any) => a - b)[Math.floor(videosWithRetention.length * 0.75)])}.` : 'Need retention rows.', avgRetention !== null ? 'Live' : 'Needs data'),
        item('Outlier detection for viral videos', buildOutlierSummary(records, 'views', 'views'), 'Live'),
        item('Videos with high CTR but weak retention', (() => {
          if (avgCtr === null || avgRetention === null) return 'Need CTR and retention rows.';
          const found = records.filter((record: any) => toNumber(record.thumbnailCtr) > avgCtr && toNumber(record.averageViewPercentage) < avgRetention).slice(0, 3);
          return found.length ? `${found.length} candidates; top: “${found[0].title}”.` : 'No high-CTR/weak-retention candidates yet.';
        })(), 'Live'),
        item('Videos with low reach but high engagement', (() => {
          const found = records.filter((record: any) => record.views < avgViews && record.engagementRate > avgEngagementRate).sort((a: any, b: any) => b.engagementRate - a.engagementRate);
          return found.length ? `${found.length} candidates; top: “${found[0].title}” at ${formatRatioPercent(found[0].engagementRate)} engagement.` : 'No low-reach/high-engagement candidates yet.';
        })(), 'Live'),
        item('Videos with high views but low engagement', (() => {
          const found = records.filter((record: any) => record.views > avgViews && record.engagementRate < avgEngagementRate).sort((a: any, b: any) => b.views - a.views);
          return found.length ? `${found.length} candidates; top: “${found[0].title}”.` : 'No high-reach/low-engagement candidates yet.';
        })(), 'Live'),
        item('Videos that convert subscribers best', (() => {
          const best = records.filter((record: any) => Number.isFinite(Number(record.subsPerThousandViews))).sort((a: any, b: any) => b.subsPerThousandViews - a.subsPerThousandViews)[0];
          return best ? `Best converter: “${best.title}” at ${formatNumber(best.subsPerThousandViews)} subs per 1K views.` : 'Need subscriber gain/loss video rows.';
        })(), 'Live'),
        building('Early performance vs long-term outcome / false positives / slow burn', 'Daily rows are being stored; needs repeated collection across publish lifecycles.'),
        building('Signals that indicate algorithm testing, scaling, or decline phase', 'Possible once impressions + CTR + retention trends accumulate for many videos.'),
      ],
    },
    {
      title: 'Discovery, Audience, And Channel Strategy',
      items: [
        item('Browse vs suggested vs search performance splits', topTraffic ? `${topTraffic.label} is the strongest stored traffic source (${formatNumber(topTraffic.value)} views).` : 'Need traffic source breakdowns from full analysis.', topTraffic ? 'Live' : 'Needs data'),
        item('Search-driven / browse-driven / suggested-driven characteristics', topSearch ? `Top search term currently returned: “${topSearch.label}” (${formatNumber(topSearch.value)} views).` : 'Need search-term breakdowns.', topSearch ? 'Live' : 'Needs data'),
        item('Top performing search terms by niche', topSearch ? `Top search term: “${topSearch.label}”. Niche grouping improves as more channels opt in.` : 'Need search-term rows plus more channels.', topSearch ? 'Live' : 'Needs data'),
        item('External traffic impact on performance', (() => {
          const external = topBreakdown(breakdowns, 'externalSources');
          return external ? `Top external source: ${external.label} (${formatNumber(external.value)} views).` : 'Need external-source rows.';
        })(), 'Live'),
        item('Dependence on single traffic source vs diversified', topTraffic ? `Largest traffic source share is ${formatPercentMetric(topTraffic.share)} for ${topTraffic.label}.` : 'Need traffic-source rows.', topTraffic ? 'Live' : 'Needs data'),
        item('Subscribed vs non-subscribed viewer behavior', topSubscribed ? `${topSubscribed.label} viewers currently lead (${formatNumber(topSubscribed.value)} views).` : 'Need subscribedStatus breakdown.', topSubscribed ? 'Live' : 'Needs data'),
        item('Device-based performance differences', topDevice ? `${topDevice.label} is the leading stored device type (${formatNumber(topDevice.value)} views).` : 'Need device breakdowns.', topDevice ? 'Live' : 'Needs data'),
        item('Geographic performance differences', topCountry ? `${topCountry.label} is the leading stored geography (${formatNumber(topCountry.value)} views).` : 'Need country breakdowns.', topCountry ? 'Live' : 'Needs data'),
        item('Playback location / YouTube product impact', topProduct ? `${topProduct.label} is the strongest stored YouTube surface (${formatNumber(topProduct.value)} views).` : 'Need youtubeProduct breakdown.', topProduct ? 'Live' : 'Needs data'),
        item('Channel branding completeness vs growth', `${channelsWithDescriptions}/${channelSnapshots.length} channel snapshots have descriptions; ${channelsWithBranding}/${channelSnapshots.length} have visible branding/profile fields.`, 'Live'),
        item('Channel niche identification from metadata', strongestTopic ? `Current strongest stored topic token is “${strongestTopic.key}”.` : 'Need more stored titles/descriptions.', strongestTopic ? 'Proxy' : 'Needs data'),
        item('Single-topic vs multi-topic channels', building('Single-topic vs multi-topic channels', 'We store titles, descriptions, tags, categories, and topic categories. Needs more videos per channel for stable topic clustering.').answer, 'Building history'),
        item('Cross-channel/niche benchmarks', records.length >= 100 ? `${records.length} stored video records are available for early benchmark tests.` : `Only ${records.length} stored video records so far; benchmarks will be fragile until more opt-in channels accumulate.`, records.length >= 100 ? 'Early' : 'Building cohort'),
      ],
    },
    {
      title: 'Strategy, Benchmarks, And Longitudinal Signals',
      items: [
        item('Category-level performance differences', (() => {
          const best = groupByAverage(records, (record: any) => record.category_id || '', (record: any) => record.views)[0];
          return best ? `Best stored category by average views is ${best.key} (${formatNumber(best.average)}, n=${best.count}).` : 'Need category metadata and video analytics rows.';
        })(), 'Live'),
        item('Category vs CTR / retention / subscriber conversion benchmarks', 'Category IDs are stored now; benchmarks will become useful once there are more videos per category.', 'Building cohort'),
        item('Metadata completeness vs performance', compareSegments(records, (record: any) => record.tagCount > 0 && record.descriptionLength > 120 && Boolean(record.thumbnail_url), (record: any) => record.views, 'Complete metadata', 'Sparse metadata'), 'Live'),
        item('Videos with tags vs without tags performance', compareSegments(records, (record: any) => record.tagCount > 0, (record: any) => record.views, 'Tagged videos', 'No-tag videos'), 'Live'),
        item('Videos with full descriptions vs minimal descriptions', compareSegments(records, (record: any) => record.descriptionLength >= 300, (record: any) => record.views, 'Full descriptions', 'Minimal descriptions'), 'Live'),
        item('Re-uploaded or similar-title content performance', duplicateTitles > 0 ? `${duplicateTitles} repeated or duplicate title patterns found in the stored sample.` : 'No exact duplicate titles in current stored sample.', duplicateTitles > 0 ? 'Proxy' : 'Live'),
        item('Title reuse vs performance degradation', duplicateTitles > 0 ? 'Duplicate titles are detectable; degradation needs repeated performance snapshots over time.' : 'No repeated titles yet, so no degradation signal.', duplicateTitles > 0 ? 'Building history' : 'Needs data'),
        item('Upload-to-upload performance variance', (() => {
          const views = records.map((record: any) => record.views).filter((value: any) => Number.isFinite(Number(value)) && value > 0);
          const avg = average(views);
          if (!avg || views.length < 3) return 'Need more stored videos.';
          const variance = average(views.map((value: any) => Math.pow(value - avg, 2))) || 0;
          return `Stored video view volatility is ${formatNumber(Math.sqrt(variance))} views around an average of ${formatNumber(avg)}.`;
        })(), 'Live'),
        item('Performance consistency / volatility / reliability scores', 'The dashboard has enough per-video data to start rough volatility scoring; reliability improves with more uploads per channel.', 'Building history'),
        item('Channel growth phases and maturity curves', `${channelDailyRows.length} channel/day rows stored. Phase detection needs longer history per channel.`, 'Building history'),
        item('Channel age vs performance / upload frequency / stability', describeCorrelation(pearson(records.map((record: any) => [record.ageDays, record.views])), 'video age', 'views'), 'Proxy'),
        item('Subscriber count vs average views, engagement, CTR, retention', 'Channel snapshots store subscriber count; this becomes useful as more channels and videos accumulate.', 'Building cohort'),
        item('View-to-subscriber ratio and channel efficiency', (() => {
          const latestChannels = latestRowsBy(channelSnapshots, 'channel_id', 'snapshot_date');
          const scored = latestChannels
            .map((channel: any) => ({
              title: channel.title || channel.channel_id,
              ratio: safeDivide(toNumber(channel.view_count), toNumber(channel.subscriber_count)),
            }))
            .filter((channel: any) => Number.isFinite(Number(channel.ratio)))
            .sort((a: any, b: any) => b.ratio - a.ratio)[0];
          return scored ? `${scored.title} has the strongest stored view/subscriber ratio (${formatNumber(scored.ratio)} views per subscriber).` : 'Need channel subscriber and view counts.';
        })(), 'Live'),
        item('Series-based content performance', 'Titles/descriptions are stored, so series naming can be inferred later from repeated naming patterns.', 'Building history'),
        item('Episode-based naming vs CTR', 'Possible from stored titles + CTR once enough episode-style titles exist.', 'Building history'),
        item('Sequential content vs standalone performance', 'Needs series detection from titles/descriptions before this becomes reliable.', 'Building history'),
        item('Localization impact and multi-language reach', 'Default language/audio language/country fields are stored; needs enough localized videos and country breakdowns.', 'Building cohort'),
        item('Upload clustering / cannibalization / spacing between uploads', 'Published dates are stored; cannibalization needs longer channel histories and neighboring upload comparisons.', 'Building history'),
        item('Cross-channel comparison of similar videos', strongestTopic ? `Topic token “${strongestTopic.key}” can be used for early same-topic grouping.` : 'Need more shared topic clusters across channels.', strongestTopic ? 'Proxy' : 'Building cohort'),
        item('Same topic performance across different channels', 'Possible once multiple opted-in channels have overlapping title/tag/description clusters.', 'Building cohort'),
        item('Video structure inferred from duration + retention proxies', describeCorrelation(pearson(videosWithRetention.map((record: any) => [record.durationSeconds, record.averageViewPercentage])), 'duration', 'retention'), 'Proxy'),
        item('Hook effectiveness / unusual retention drop-offs', retentionSummary?.weakestHook ? `Largest early-to-mid retention drop is “${retentionSummary.weakestHook.title}” (${formatPercentMetric(retentionSummary.weakestHook.earlyToMidDrop)} drop across ${retentionSummary.weakestHook.rows} curve points).` : 'Need retention-curve rows from full analysis.', retentionSummary?.weakestHook ? 'Live' : 'Needs data'),
        item('Content backlog performance and videos resurfacing', 'Daily rows make this possible over time; needs longer repeated snapshots.', 'Building history'),
        item('Relevance cycles and seasonality trends', 'Date-based daily rows are stored; seasonality needs months of collection.', 'Building history'),
        item('Growth efficiency per upload / average impact per video', (() => {
          const avgSubs = average(records.map((record: any) => record.netSubscribers).filter((value: any) => Number.isFinite(Number(value))));
          return avgSubs !== null ? `Average stored net subscriber impact per video is ${formatNumber(avgSubs)}.` : 'Need video-level subscriber rows.';
        })(), 'Live'),
        item('Momentum stacking from consecutive uploads', 'Possible from publish dates + channel daily rows once there are enough consecutive uploads per channel.', 'Building history'),
        item('Channel authority signals in a niche', 'Possible after topic clustering plus repeated performance consistency scoring.', 'Building cohort'),
        item('Impressions vs views efficiency / WPI / engagement per impression', describeCorrelation(pearson(records.map((record: any) => [record.impressions, record.views])), 'impressions', 'views'), 'Live'),
        item('Traffic diversity vs stability', topTraffic ? `Largest source share is ${formatPercentMetric(topTraffic.share)}; stability needs repeated source snapshots.` : 'Need traffic breakdowns.', topTraffic ? 'Building history' : 'Needs data'),
        item('Relative importance of each metric by outcome', 'The stored rows can support this once sample size grows; current panel shows pairwise correlations first.', 'Building cohort'),
        item('Videos that maintain performance vs decay quickly', 'Daily per-video rows are stored; decay classification needs longer lifecycles.', 'Building history'),
      ],
    },
    {
      title: 'Comments, Playlists, And Community',
      items: [
        item('Comment volume vs video performance', describeCorrelation(pearson(records.map((record: any) => [record.comments, record.views])), 'comment count', 'views'), 'Live'),
        item('Comment rate vs video performance', describeCorrelation(pearson(records.map((record: any) => [record.commentRate, record.views])), 'comment rate', 'views'), 'Live'),
        item('Comment text, sentiment, replies, and pinned comments', 'Disabled for now. We keep aggregate comment counts from YouTube Analytics, but no longer request or store comment text/reply snapshots.', 'Not collected'),
        item('Like-to-view ratio benchmarks', avgEngagementRate ? `Average engagement rate across stored videos is ${formatRatioPercent(avgEngagementRate)}; like-rate relationship to views is ${describeCorrelation(pearson(records.map((record: any) => [record.likeRate, record.views])), 'like rate', 'views')}` : 'Need engagement rows.', avgEngagementRate ? 'Live' : 'Needs data'),
        item('Share behavior vs traffic source expansion', describeCorrelation(pearson(records.map((record: any) => [record.shareRate, record.views])), 'share rate', 'views'), 'Live'),
        item('Playlist add rate vs video performance', describeCorrelation(pearson(records.map((record: any) => [record.playlistAddRate, record.watchHours])), 'playlist add rate', 'watch time'), 'Live'),
        item('Playlist performance by playlist', topPlaylist ? `Top playlist by playlist-context views is “${topPlaylist.label}” (${formatNumber(topPlaylist.value)} playlist views).` : 'Need playlist analytics rows from full analysis.', topPlaylist ? 'Live' : 'Needs data'),
        item('Playlist watch-time contribution', topPlaylistWatch ? `Top playlist by watch time is “${topPlaylistWatch.label}” (${formatNumber(topPlaylistWatch.value)} hours).` : 'Need playlist watch-time rows.', topPlaylistWatch ? 'Live' : 'Needs data'),
        item('Playlist structure/order/session continuation', topPlaylist ? 'Playlist analytics are now stored as cohort breakdown rows. Exact playlist ordering still needs a playlist-item snapshot table if we want order-level analysis later.' : 'Need playlist analytics rows.', topPlaylist ? 'Partial' : 'Needs data'),
      ],
    },
  ];
}

async function buildAdminResearchDashboard(supabase: any, options: { minSubscribers?: number } = {}) {
  const minSubscribers = normalizeAdminMinSubscribers(options.minSubscribers);
  const truncatedTables: string[] = [];
  const [
    allChannelSnapshots,
    allVideoSnapshots,
    allChannelDailyRows,
    allVideoDailyRows,
    allBreakdowns,
    allConnections,
    allSyncRuns,
  ] = await Promise.all([
    readAdminTable(supabase, 'youtube_channel_snapshots', 'user_id,channel_id,snapshot_date,title,description,published_at,country,default_language,subscriber_count,view_count,video_count,topic_categories,branding,thumbnail_url,banner_url', 'snapshot_date', truncatedTables),
    readAdminTable(supabase, 'youtube_video_snapshots', 'user_id,channel_id,video_id,snapshot_date,title,description,published_at,duration_seconds,category_id,tags,privacy_status,upload_status,caption,definition,dimension,live_broadcast_content,thumbnail_url,view_count,like_count,comment_count,metadata_features,thumbnail_features,is_short_guess', 'snapshot_date', truncatedTables),
    readAdminTable(supabase, 'youtube_channel_analytics_daily', 'user_id,channel_id,metric_date,views,engaged_views,estimated_minutes_watched,average_view_duration_seconds,average_view_percentage,subscribers_gained,subscribers_lost,likes,comments,shares,videos_added_to_playlists,videos_removed_from_playlists,thumbnail_impressions,thumbnail_ctr', 'metric_date', truncatedTables),
    readAdminTable(supabase, 'youtube_video_analytics_daily', 'user_id,channel_id,video_id,metric_date,views,engaged_views,estimated_minutes_watched,average_view_duration_seconds,average_view_percentage,subscribers_gained,subscribers_lost,likes,comments,shares,videos_added_to_playlists,videos_removed_from_playlists,thumbnail_impressions,thumbnail_ctr', 'metric_date', truncatedTables),
    readAdminTable(supabase, 'youtube_analytics_breakdowns', 'user_id,channel_id,video_id,period_start,period_end,dimension_set,dimension_key,dimension_values,metrics', 'period_end', truncatedTables),
    readAdminTable(supabase, 'youtube_connections', 'user_id,channel_id,channel_title,disconnected_at,updated_at', 'updated_at', truncatedTables),
    readAdminTable(supabase, 'youtube_analytics_sync_runs', 'user_id,channel_id,sync_type,status,period_start,period_end,completed_at,started_at', 'started_at', truncatedTables),
  ]);

  const channelFilter = resolveAdminChannelFilter(allChannelSnapshots, minSubscribers);
  const channelSnapshots = filterRowsByChannels(allChannelSnapshots, channelFilter.allowedChannelIds);
  const videoSnapshots = filterRowsByChannels(allVideoSnapshots, channelFilter.allowedChannelIds);
  const channelDailyRows = filterRowsByChannels(allChannelDailyRows, channelFilter.allowedChannelIds);
  const videoDailyRows = filterRowsByChannels(allVideoDailyRows, channelFilter.allowedChannelIds);
  const breakdowns = latestBreakdownRows(filterRowsByChannels(allBreakdowns, channelFilter.allowedChannelIds));
  const connections = filterRowsByChannels(allConnections, channelFilter.allowedChannelIds);
  const syncRuns = filterRowsByChannels(allSyncRuns, channelFilter.allowedChannelIds);
  const records = buildVideoResearchRecords(videoSnapshots, videoDailyRows);
  const activeChannels = new Set(connections.filter((row: any) => !row.disconnected_at).map((row: any) => row.channel_id).filter(Boolean));
  const storedChannels = new Set(channelSnapshots.map((row: any) => row.channel_id).filter(Boolean));
  const allStoredChannels = new Set(allChannelSnapshots.map((row: any) => row.channel_id).filter(Boolean));
  const storedUsers = new Set([
    ...channelSnapshots.map((row: any) => row.user_id),
    ...videoSnapshots.map((row: any) => row.user_id),
    ...connections.map((row: any) => row.user_id),
  ].filter(Boolean));
  const latestSync = syncRuns[0]?.completed_at || syncRuns[0]?.started_at || null;
  const sections = buildAdminResearchSections({ records, channelDailyRows, breakdowns, channelSnapshots });
  const items = sections.flatMap((section: any) => section.items);
  const liveCount = items.filter((item: any) => ['Live', 'Proxy', 'Early'].includes(item.status)).length;
  const buildingCount = items.filter((item: any) => String(item.status).includes('Building')).length;
  const collectorCount = items.filter((item: any) => item.status === 'Needs collector').length;

  return {
    generatedAt: new Date().toISOString(),
    note: 'Private owner dashboard. Uses stored connected-channel analytics history only; no new YouTube API calls are made by this admin view.',
    filter: {
      minSubscribers,
      includedChannels: channelFilter.includedChannels,
      excludedChannels: channelFilter.excludedChannels,
      totalChannels: channelFilter.totalChannels,
      unknownSubscriberChannels: channelFilter.unknownSubscriberChannels,
      truncatedTables,
    },
    totals: {
      activeConnectedChannels: activeChannels.size,
      storedChannels: storedChannels.size,
      allStoredChannels: allStoredChannels.size,
      storedUsers: storedUsers.size,
      channelSnapshotRows: channelSnapshots.length,
      videoSnapshotRows: videoSnapshots.length,
      channelDailyRows: channelDailyRows.length,
      videoDailyRows: videoDailyRows.length,
      breakdownRows: breakdowns.length,
      latestSync,
    },
    coverage: {
      live: liveCount,
      building: buildingCount,
      needsCollector: collectorCount,
      total: items.length,
    },
    sections,
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

    const requestUser = await resolveRequestUser(supabase, authHeader.slice(AUTH_HEADER_PREFIX.length));
    if (!requestUser?.id) return res.status(401).json({ error: 'unauthorized' });

    const isAdminResearch = isAdminResearchUser(requestUser);
    const adminView = String(req.query?.admin || '');
    if (adminView === 'status') {
      return res.status(200).json({ isAdmin: isAdminResearch });
    }

    if (adminView === 'research' || adminView === 'platform') {
      if (!isAdminResearch) {
        return res.status(403).json({ error: 'forbidden' });
      }

      if (adminView === 'platform') {
        const platformStats = await buildAdminPlatformStats(supabase);
        return res.status(200).json(platformStats);
      }

      const adminDashboard = await buildAdminResearchDashboard(supabase, {
        minSubscribers: req.query?.minSubscribers,
      });
      return res.status(200).json(adminDashboard);
    }

    const userId = requestUser.id;
    const connectionView = String(req.query?.connection || '');
    if (connectionView === 'status') {
      const { data: connection, error: connectionError } = await supabase
        .from('youtube_connections')
        .select('channel_title, channel_thumbnail_url')
        .eq('user_id', userId)
        .is('disconnected_at', null)
        .maybeSingle();

      if (connectionError) {
        return res.status(500).json({ error: 'connection_status_failed' });
      }

      return res.status(200).json({
        connected: Boolean(connection),
        channelTitle: connection?.channel_title || null,
        channelThumbnail: connection?.channel_thumbnail_url || null,
      });
    }

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
      const forceFullAnalysis = isAdminResearch && ['1', 'true'].includes(String(req.query?.force || '').toLowerCase());
      const storedFullAnalysis = await readFreshStoredFullAnalysis(supabase, {
        userId,
        channelId: summary.channel.id || connection.channel_id,
        windows,
        force: forceFullAnalysis,
      });

      if (storedFullAnalysis?.fullAnalysis) {
        return res.status(200).json({
          ...summary,
          fullAnalysis: prepareStoredFullAnalysisForResponse(summary, storedFullAnalysis.fullAnalysis, { includeResearchLab: isAdminResearch }),
          fullAnalysisCache: {
            hit: true,
            generatedAt: storedFullAnalysis.generatedAt,
            modelVersion: storedFullAnalysis.modelVersion,
            ttlMs: FULL_ANALYSIS_SERVER_CACHE_TTL_MS,
          },
        });
      }

      const thumbnailFeatureCache = await readStoredThumbnailFeatureCache(
        supabase,
        userId,
        summary.channel.id || connection.channel_id
      );
      const fullAnalysis = await buildFullAnalysis(accessToken, summary, windows, {
        includeResearchLab: isAdminResearch,
        thumbnailFeatureCache,
      });
      await storeAccountDashboardAnalytics(supabase, { userId, connection, summary, fullAnalysis });
      return res.status(200).json({
        ...summary,
        fullAnalysis: stripFullAnalysisForResponse(fullAnalysis, { includeResearchLab: isAdminResearch }),
        fullAnalysisCache: {
          hit: false,
          ttlMs: FULL_ANALYSIS_SERVER_CACHE_TTL_MS,
        },
      });
    }

    await storeAccountDashboardAnalytics(supabase, { userId, connection, summary });
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
