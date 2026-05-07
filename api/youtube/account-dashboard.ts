// @ts-nocheck
const { createClient } = require('@supabase/supabase-js');
const { createHash } = require('crypto');
const { storeAccountDashboardAnalytics } = require('../../lib/youtube-analytics-store');

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

const FULL_ANALYSIS_VIDEO_LIMIT = 50;
const RECENT_UPLOAD_VIDEO_LIMIT = 50;
const VIDEO_DAILY_ROW_LIMIT = 500;
const COMMENT_VIDEO_LIMIT = 8;
const COMMENT_LIMIT_PER_VIDEO = 20;

function formatApiDate(timestamp: number): string {
  return new Date(timestamp).toISOString().split('T')[0];
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
  throw error;
}

async function fetchOptionalAnalytics(accessToken: string, options: any) {
  try {
    return await fetchAnalytics(accessToken, options);
  } catch {
    return { columnHeaders: [], rows: [] };
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

function normalizeVideoMetadata(video: any, analyticsRow: any = {}) {
  const durationSeconds = parseIsoDuration(video?.contentDetails?.duration || '');
  const title = video?.snippet?.title || analyticsRow.title || video?.id || '';

  return {
    id: video?.id || analyticsRow.video || '',
    title,
    description: video?.snippet?.description || '',
    thumbnailUrl: resolveBestThumbnail(video?.snippet?.thumbnails) || analyticsRow.thumbnailUrl || null,
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
    thumbnailFeatures: buildThumbnailFeatures(video),
    raw: video || {},
  };
}

async function fetchRecentComments(accessToken: string, videoIds: string[]) {
  const commentLists = await Promise.all(videoIds.slice(0, COMMENT_VIDEO_LIMIT).map(async (videoId) => {
    try {
      const url = new URL(`${YOUTUBE_API_BASE_URL}/commentThreads`);
      url.searchParams.set('part', 'snippet,replies');
      url.searchParams.set('videoId', videoId);
      url.searchParams.set('order', 'time');
      url.searchParams.set('textFormat', 'plainText');
      url.searchParams.set('maxResults', String(COMMENT_LIMIT_PER_VIDEO));

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const payload = await safeJson(response);
      if (!response.ok || payload?.error) return [];

      return (payload?.items || []).flatMap((thread: any) => {
        const topComment = thread?.snippet?.topLevelComment;
        const replies = thread?.replies?.comments || [];
        return [topComment, ...replies].filter(Boolean).map((comment: any) => ({
          id: comment.id,
          videoId,
          parentCommentId: comment?.snippet?.parentId || null,
          authorDisplayName: comment?.snippet?.authorDisplayName || null,
          authorChannelId: comment?.snippet?.authorChannelId?.value || null,
          likeCount: toNumber(comment?.snippet?.likeCount),
          publishedAt: comment?.snippet?.publishedAt || null,
          updatedAt: comment?.snippet?.updatedAt || null,
          textDisplay: comment?.snippet?.textDisplay || '',
          textOriginal: comment?.snippet?.textOriginal || '',
          raw: comment,
        }));
      });
    } catch {
      return [];
    }
  }));
  return commentLists.flat();
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

function pearson(pairs: any[], leftKey: string, rightKey: string) {
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
  const comments = fullAnalysis.comments || [];
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
  const commentVelocityVideo = videos
    .map((video: any) => ({
      key: video.title,
      average: comments.filter((comment: any) => comment.videoId === video.id).length,
    }))
    .sort((left: any, right: any) => right.average - left.average);
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
    note: 'Private admin research view. Some answers are live from the current 28-day pull; hourly/longitudinal answers improve as stored history accumulates.',
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
          item('View velocity in first 1 hour', 'YouTube Analytics does not provide hourly rows here; this needs scheduled snapshots around publish time.', 'Needs hourly snapshots'),
          item('View velocity in first 24 hours', 'Publish-day daily video rows are now stored as the 24-hour proxy.', 'Proxy'),
          item('Impression velocity in first 24 hours', 'Publish-day thumbnail impressions are now stored when returned by YouTube Analytics.', 'Proxy'),
          item('CTR, retention, and engagement decay over time', `Current 28-day medians are ${pct(medianCtr)} CTR, ${pct(medianRetention)} average viewed, and ${pct(medianEngagement)} engagement; decay curves improve as daily history accumulates.`, 'Building history'),
        ],
      },
      {
        title: 'Length, Format, And Content Type',
        items: [
          item('Optimal video length by niche', `${topLabel(bestLengthViews)} leads by average views in this channel sample; niche-level benchmark needs more channels.`, 'Channel-level'),
          item('Optimal video length by traffic source', `Current strongest source is ${strongestTraffic?.label || 'not enough data'}; source-by-length becomes stronger as more videos are stored.`, 'Building history'),
          item('Optimal video length for subscriber growth', `${topLabel(bestLengthSubs)} currently leads subscribers per 1K views.`),
          item('Relationship between video length and retention', correlationLabel(pearson(videos, 'durationSeconds', 'averageViewPercentage'))),
          item('Relationship between video length and CTR', correlationLabel(pearson(videos.filter((video: any) => video.thumbnailCtr !== null), 'durationSeconds', 'thumbnailCtr'))),
          item('Relationship between video length and watch time', correlationLabel(pearson(videos, 'durationSeconds', 'watchHours'))),
          item('Shorts vs long-form performance differences', `Shorts avg ${compact(avg(shorts, (video) => video.views))} views vs long-form avg ${compact(avg(longForm, (video) => video.views))} views.`),
          item('Shorts contribution to total channel growth', `${strongestContentType?.label || 'Content type data not returned'} is currently carrying ${pct(strongestContentType?.shareOfViews || 0, 0)} of views.`),
          item('Live vs VOD performance differences', `${breakdowns.liveOrOnDemand?.[0]?.label || 'No live/on-demand split'} leads the current period.`),
        ],
      },
      {
        title: 'Metric Relationships',
        items: [
          item('CTR vs watch time correlation', correlationLabel(pearson(videos.filter((video: any) => video.thumbnailCtr !== null), 'thumbnailCtr', 'watchHours'))),
          item('CTR vs retention correlation', correlationLabel(pearson(videos.filter((video: any) => video.thumbnailCtr !== null), 'thumbnailCtr', 'averageViewPercentage'))),
          item('Retention vs subscriber conversion correlation', correlationLabel(pearson(videos, 'averageViewPercentage', 'subsPerThousandViews'))),
          item('Engagement vs retention correlation', correlationLabel(pearson(videos, 'engagementRate', 'averageViewPercentage'))),
          item('Engagement vs CTR correlation', correlationLabel(pearson(videos.filter((video: any) => video.thumbnailCtr !== null), 'engagementRate', 'thumbnailCtr'))),
          item('Views vs subscriber conversion rate', correlationLabel(pearson(videos, 'views', 'subsPerThousandViews'))),
          item('Views vs engagement rate scaling patterns', correlationLabel(pearson(videos, 'views', 'engagementRate'))),
          item('Like, comment, share, and playlist add rate vs performance', `Like/views ${correlationLabel(pearson(videos, 'likeRate', 'views'))}; comment/views ${correlationLabel(pearson(videos, 'commentRate', 'views'))}; share/views ${correlationLabel(pearson(videos, 'shareRate', 'views'))}; playlist/views ${correlationLabel(pearson(videos, 'playlistAddRate', 'views'))}.`),
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
          item('Engagement as leading vs lagging indicator', correlationLabel(pearson(videos, 'engagementRate', 'views'))),
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
          item('Correlation between title length and CTR', correlationLabel(pearson(videos.filter((video: any) => video.thumbnailCtr !== null), 'titleLength', 'thumbnailCtr'))),
          item('Title length vs retention correlation', correlationLabel(pearson(videos, 'titleLength', 'averageViewPercentage'))),
          item('Impact of numbers in titles on performance', `Number titles avg ${compact(avg(videos.filter((video: any) => video.hasNumber), (video) => video.views))} views vs non-number avg ${compact(avg(videos.filter((video: any) => !video.hasNumber), (video) => video.views))}.`),
          item('Impact of questions in titles on CTR', `Question titles avg ${pct(avg(videos.filter((video: any) => video.hasQuestion && video.thumbnailCtr !== null), (video) => video.thumbnailCtr))} CTR.`),
          item('Impact of emotional words in titles on engagement', correlationLabel(pearson(videos, 'emotionalWordCount', 'engagementRate'))),
          item('Title capitalization patterns vs performance', correlationLabel(pearson(videos, 'uppercaseShare', 'views'))),
          item('Description length vs performance', correlationLabel(pearson(videos.map((video: any) => ({ ...video, descriptionLength: String(video.description || '').length })), 'descriptionLength', 'views'))),
          item('Links in description vs external traffic share', `${strongestExternal?.label || 'External data'} is now tracked; description link counts are stored in video snapshots for correlation.`, 'Stored for analysis'),
          item('Tags count vs CTR correlation', correlationLabel(pearson(videos.filter((video: any) => video.thumbnailCtr !== null).map((video: any) => ({ ...video, tagCount: Array.isArray(video.tags) ? video.tags.length : 0 })), 'tagCount', 'thumbnailCtr'))),
          item('Tags usage vs search traffic share', `${strongestSearch?.label || 'Search data'} is tracked while tag counts are stored per video.`, 'Stored for analysis'),
          item('Thumbnail style consistency vs channel growth', 'Thumbnail resolution/aspect metadata is stored now; true visual style/text detection needs image processing.', 'Needs image processing'),
          item('Thumbnail text presence vs CTR', 'Thumbnail image URLs are stored; text detection needs OCR/image analysis in a later pass.', 'Needs image processing'),
          item('Thumbnail complexity vs CTR', 'Thumbnail proxy features are stored; visual complexity requires image analysis.', 'Needs image processing'),
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
          item('Comment volume vs video performance', correlationLabel(pearson(videos, 'comments', 'views'))),
          item('Comment velocity after publish', `${topLabel(commentVelocityVideo, 'No comments synced')} has the most recent synced comments among top videos.`),
          item('Comment sentiment vs engagement', 'Recent public comments are stored; sentiment requires a processing pass before scoring.', 'Needs text processing'),
          item('Creator reply rate vs engagement growth', 'Replies are stored when returned, but creator-reply classification needs author matching.', 'Needs processing'),
          item('Pinned comments impact on engagement', 'Pinned comment status is not returned in the current comment API payload.', 'Limited by API'),
          item('Comment timing vs performance', 'Comment timestamps are stored now; early-vs-late comment analysis improves as publish cycles accumulate.', 'Building history'),
          item('Community intensity per channel', `${comments.length} recent comments/replies synced from top videos in this full-analysis run.`),
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
          item('Relative importance of each metric by outcome', `Current strongest quick read: ${correlationLabel(pearson(videos, 'watchHours', 'views'))} for watch time vs views, ${correlationLabel(pearson(videos, 'engagementRate', 'views'))} for engagement vs views.`),
          item('Algorithm testing, scaling, and decline phases', 'Use high impressions + stable retention as scaling proxy; daily impression/retention rows are now stored for phase detection.', 'Building history'),
          item('Videos that maintain performance vs decay quickly', 'Daily video rows are now stored; durable-vs-decay classification improves after repeated daily runs.', 'Building history'),
        ],
      },
    ],
  };
}

async function buildFullAnalysis(accessToken: string, summary: any, windows: any) {
  const [
    fullCurrentPayload,
    fullPreviousPayload,
    topVideosPayload,
    videoDayPayload,
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
      startDate: windows.fullStartDate,
      endDate: windows.endDate,
      dimensions: 'day,video',
      metrics: VIDEO_METRICS,
      sort: 'day',
      maxResults: VIDEO_DAILY_ROW_LIMIT,
    }),
    fetchOptionalAnalytics(accessToken, {
      startDate: windows.fullStartDate,
      endDate: windows.endDate,
      dimensions: 'insightTrafficSourceType',
      metrics: SEGMENT_METRICS,
      includeReach: false,
      sort: '-views',
      maxResults: 8,
    }),
    fetchOptionalAnalytics(accessToken, {
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
      startDate: windows.fullStartDate,
      endDate: windows.endDate,
      dimensions: 'deviceType',
      metrics: SEGMENT_METRICS,
      includeReach: false,
      sort: '-views',
      maxResults: 8,
    }),
    fetchOptionalAnalytics(accessToken, {
      startDate: windows.fullStartDate,
      endDate: windows.endDate,
      dimensions: 'subscribedStatus',
      metrics: SEGMENT_METRICS,
      includeReach: false,
      sort: '-views',
    }),
    fetchOptionalAnalytics(accessToken, {
      startDate: windows.fullStartDate,
      endDate: windows.endDate,
      dimensions: 'creatorContentType',
      metrics: SEGMENT_METRICS,
      includeReach: false,
      sort: '-views',
    }),
    fetchOptionalAnalytics(accessToken, {
      startDate: windows.fullStartDate,
      endDate: windows.endDate,
      dimensions: 'country',
      metrics: SEGMENT_METRICS,
      includeReach: false,
      sort: '-views',
      maxResults: 8,
    }),
    fetchOptionalAnalytics(accessToken, {
      startDate: windows.fullStartDate,
      endDate: windows.endDate,
      dimensions: 'youtubeProduct',
      metrics: SEGMENT_METRICS,
      includeReach: false,
      sort: '-views',
    }),
    fetchOptionalAnalytics(accessToken, {
      startDate: windows.fullStartDate,
      endDate: windows.endDate,
      dimensions: 'liveOrOnDemand',
      metrics: SEGMENT_METRICS,
      includeReach: false,
      sort: '-views',
    }),
    fetchOptionalAnalytics(accessToken, {
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
  const videoDailyRows = rowsToObjects(videoDayPayload).map((row: any) => ({
    date: row.day,
    videoId: row.video,
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
  })).filter((row: any) => row.date && row.videoId);

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
  const [videoDetails, comments] = await Promise.all([
    fetchVideoDetails(accessToken, videoIds),
    fetchRecentComments(accessToken, topVideoIds),
  ]);

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
  };

  const text = buildInsightText(summary, topVideos, breakdowns);
  const researchSource = {
    current: fullCurrent,
    previous: fullPrevious,
    deltas: buildDeltas(fullCurrent, fullPrevious),
    breakdowns,
    topVideos,
    dailyRows: fullDailyRows,
    videoDailyRows,
    videoMetadata,
    comments,
  };
  const researchLab = buildResearchLab(summary, researchSource);

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
    comments,
    researchLab,
    ...text,
  };
}

function stripFullAnalysisForResponse(fullAnalysis: any) {
  const {
    dailyRows,
    videoDailyRows,
    videoMetadata,
    comments,
    ...publicFullAnalysis
  } = fullAnalysis || {};

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
      await storeAccountDashboardAnalytics(supabase, { userId, connection, summary, fullAnalysis });
      return res.status(200).json({ ...summary, fullAnalysis: stripFullAnalysisForResponse(fullAnalysis) });
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
