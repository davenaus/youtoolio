const ACCOUNT_URL = 'https://www.youtool.io/account';
const DAY_MS = 24 * 60 * 60 * 1000;

async function buildViewerComparison(supabase, options = {}) {
  const userId = options.userId;
  const kind = options.kind === 'channel' ? 'channel' : 'video';

  if (!supabase || !userId) return null;

  const targetChannel = normalizeChannel(options.targetChannel);
  const targetVideo = options.targetVideo ? normalizeVideo(options.targetVideo) : null;
  const targetVideos = normalizeVideos(options.targetVideos);
  const connection = await readActiveConnection(supabase, userId);

  if (!connection?.channel_id) {
    return buildConnectComparison(kind, targetChannel, targetVideo);
  }

  const isOwnChannel = Boolean(targetChannel.id && targetChannel.id === connection.channel_id);
  const isOwnVideo = Boolean(kind === 'video' && targetVideo?.channelId && targetVideo.channelId === connection.channel_id);
  const [channelSnapshot, storedVideos, channelDailyRows, ownVideoDailyRows] = await Promise.all([
    readLatestChannelSnapshot(supabase, userId, connection.channel_id),
    readStoredVideoSnapshots(supabase, userId, connection.channel_id),
    readChannelDailyRows(supabase, userId, connection.channel_id),
    isOwnVideo && targetVideo?.id
      ? readVideoDailyRows(supabase, userId, connection.channel_id, targetVideo.id)
      : Promise.resolve([]),
  ]);

  const owner = buildOwnerBaseline({
    connection,
    channelSnapshot,
    storedVideos,
    channelDailyRows,
  });

  if (kind === 'channel') {
    return buildChannelComparison({
      owner,
      targetChannel,
      targetVideos,
      isOwnChannel,
    });
  }

  return buildVideoComparison({
    owner,
    targetVideo,
    targetChannel,
    targetVideos,
    ownVideoDailyRows,
    isOwnVideo,
  });
}

async function readActiveConnection(supabase, userId) {
  return readMaybe('youtube connection', async () => {
    const { data, error } = await supabase
      .from('youtube_connections')
      .select('channel_id,channel_title,channel_thumbnail_url,updated_at')
      .eq('user_id', userId)
      .is('disconnected_at', null)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  }, null);
}

async function readLatestChannelSnapshot(supabase, userId, channelId) {
  return readMaybe('channel snapshot', async () => {
    const { data, error } = await supabase
      .from('youtube_channel_snapshots')
      .select('channel_id,snapshot_date,title,thumbnail_url,subscriber_count,view_count,video_count,topic_categories,uploads_playlist_id')
      .eq('user_id', userId)
      .eq('channel_id', channelId)
      .order('snapshot_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  }, null);
}

async function readStoredVideoSnapshots(supabase, userId, channelId) {
  const rows = await readMaybe('video snapshots', async () => {
    const { data, error } = await supabase
      .from('youtube_video_snapshots')
      .select('video_id,title,description,published_at,duration_seconds,category_id,tags,thumbnail_url,view_count,like_count,comment_count,metadata_features,thumbnail_features,is_short_guess,snapshot_date')
      .eq('user_id', userId)
      .eq('channel_id', channelId)
      .order('snapshot_date', { ascending: false })
      .limit(160);

    if (error) throw error;
    return data || [];
  }, []);

  const byVideo = new Map();
  rows.forEach((row) => {
    if (row?.video_id && !byVideo.has(row.video_id)) {
      byVideo.set(row.video_id, normalizeStoredVideo(row));
    }
  });

  return Array.from(byVideo.values());
}

async function readChannelDailyRows(supabase, userId, channelId) {
  return readMaybe('channel daily analytics', async () => {
    const { data, error } = await supabase
      .from('youtube_channel_analytics_daily')
      .select('metric_date,views,engaged_views,estimated_minutes_watched,average_view_duration_seconds,average_view_percentage,subscribers_gained,subscribers_lost,likes,comments,shares,thumbnail_impressions,thumbnail_ctr')
      .eq('user_id', userId)
      .eq('channel_id', channelId)
      .order('metric_date', { ascending: false })
      .limit(90);

    if (error) throw error;
    return data || [];
  }, []);
}

async function readVideoDailyRows(supabase, userId, channelId, videoId) {
  return readMaybe('video daily analytics', async () => {
    const { data, error } = await supabase
      .from('youtube_video_analytics_daily')
      .select('metric_date,views,estimated_minutes_watched,average_view_duration_seconds,average_view_percentage,subscribers_gained,subscribers_lost,likes,comments,shares,thumbnail_impressions,thumbnail_ctr')
      .eq('user_id', userId)
      .eq('channel_id', channelId)
      .eq('video_id', videoId)
      .order('metric_date', { ascending: false })
      .limit(60);

    if (error) throw error;
    return data || [];
  }, []);
}

async function readMaybe(label, operation, fallback) {
  try {
    return await operation();
  } catch (error) {
    const message = String(error?.message || '');
    const unavailable =
      error?.code === '42P01' ||
      error?.code === 'PGRST205' ||
      message.includes('does not exist') ||
      message.includes('schema cache');

    if (!unavailable) {
      console.warn(`[youtube-owner-comparison] ${label}:`, error?.message || error);
    }

    return fallback;
  }
}

function buildConnectComparison(kind, targetChannel, targetVideo) {
  const noun = kind === 'channel' ? 'channel' : 'video';
  const targetName = kind === 'channel'
    ? targetChannel.title || 'this channel'
    : targetVideo?.title || 'this video';

  return {
    status: 'not_connected',
    mode: 'connect',
    title: 'Compare against your channel',
    eyebrow: 'Channel benchmarks',
    subtitle: `Connect YouTube to compare ${targetName} with your own saved channel data.`,
    metrics: [
      metric('Data unlocked', 'Your baseline', 'Views, engagement, topics, formats, and owner-only analytics when available.'),
      metric('Use case', 'Research fit', `See whether this ${noun} is worth studying for your channel, not just in general.`),
    ],
    observations: [
      'The public analysis above still works. Connecting adds your own channel as the comparison baseline.',
      'After you connect, YouTool can flag when the current video or channel is yours and switch into a deeper owner-analysis view.',
    ],
    nudges: [
      'Best for deciding whether an idea, format, or competitor is actually relevant to your channel.',
    ],
    actions: [
      { label: 'Connect YouTube', href: ACCOUNT_URL, kind: 'primary' },
    ],
  };
}

function buildVideoComparison({ owner, targetVideo, targetChannel, targetVideos, ownVideoDailyRows, isOwnVideo }) {
  if (!targetVideo) return null;

  const fallbackBaseline = buildVideoBaseline(targetVideos.filter((video) => video.id !== targetVideo.id));
  const ownerBaseline = owner.videoSampleSize >= 3 ? owner.videoBaseline : fallbackBaseline;
  const baselineSource = owner.videoSampleSize >= 3 ? 'saved channel history' : 'this channel public sample';
  const viewRatio = ratio(targetVideo.views, ownerBaseline.medianViews);
  const engagementRatio = ratio(targetVideo.engagementRate, ownerBaseline.medianEngagement);
  const topicOverlap = scoreTopicOverlap(targetVideo.terms, owner.topTerms);
  const latestVideoAnalytics = summarizeVideoDailyRows(ownVideoDailyRows);
  const hasOwnerBaseline = owner.videoSampleSize >= 3 || fallbackBaseline.sampleSize >= 3;

  if (isOwnVideo) {
    const observations = [
      hasOwnerBaseline
        ? `This video is at ${formatRatio(viewRatio)} your ${baselineSource} median views (${formatCount(targetVideo.views)} vs ${formatCount(ownerBaseline.medianViews)}).`
        : 'There are not enough comparable uploads yet for a stable view baseline.',
      hasOwnerBaseline
        ? `Engagement is ${formatRatio(engagementRatio)} baseline (${formatPercent(targetVideo.engagementRate)} vs ${formatPercent(ownerBaseline.medianEngagement)}).`
        : '',
      latestVideoAnalytics.ctr !== null
        ? `Stored owner analytics show ${formatPercent(latestVideoAnalytics.ctr)} thumbnail CTR across the saved daily rows for this video.`
        : '',
      latestVideoAnalytics.retention !== null
        ? `Average percentage viewed is ${formatPercent(latestVideoAnalytics.retention)} in the saved rows.`
        : '',
    ].filter(Boolean);

    return {
      status: 'connected',
      mode: 'own_video',
      eyebrow: 'Your video',
      title: 'This is your video',
      subtitle: `Compared with ${owner.title}'s ${baselineSource}.`,
      connectedChannel: ownerCard(owner),
      dataUpdatedAt: owner.updatedAt,
      metrics: [
        metric('Views vs baseline', formatRatio(viewRatio), `${formatCount(targetVideo.views)} vs ${formatCount(ownerBaseline.medianViews)} median`, toneFromRatio(viewRatio)),
        metric('Engagement', formatRatio(engagementRatio), `${formatPercent(targetVideo.engagementRate)} vs ${formatPercent(ownerBaseline.medianEngagement)}`, toneFromRatio(engagementRatio)),
        metric('Format', targetVideo.isShort ? 'Shorts' : 'Long-form', `${formatDuration(targetVideo.durationSeconds)} runtime`),
        metric('Stored CTR', latestVideoAnalytics.ctr !== null ? formatPercent(latestVideoAnalytics.ctr) : 'No saved rows', 'Refresh benchmarks to pull the latest owner analytics.'),
        metric('Retention', latestVideoAnalytics.retention !== null ? formatPercent(latestVideoAnalytics.retention) : 'No saved rows', 'Average percentage viewed when YouTube Analytics has it.'),
      ],
      observations,
      nudges: buildOwnerVideoNudges({ viewRatio, engagementRatio, latestVideoAnalytics }),
      actions: comparisonActions(true),
    };
  }

  if (!owner.hasAnyBaseline) {
    return buildConnectedNeedsRefresh(owner, 'video');
  }

  const audienceRatio = ratio(targetChannel.subscriberCount, owner.subscriberCount);

  return {
    status: 'connected',
    mode: 'compare_video',
    eyebrow: 'Compared to your channel',
    title: 'Fit against your baseline',
    subtitle: `${targetChannel.title || 'This channel'} compared with ${owner.title}.`,
    connectedChannel: ownerCard(owner),
    dataUpdatedAt: owner.updatedAt,
    metrics: [
      metric('Video views', hasOwnerBaseline ? formatRatio(viewRatio) : 'Needs sample', `${formatCount(targetVideo.views)} vs your ${formatCount(ownerBaseline.medianViews)} median`, toneFromRatio(viewRatio)),
      metric('Engagement', hasOwnerBaseline ? formatRatio(engagementRatio) : 'Needs sample', `${formatPercent(targetVideo.engagementRate)} vs your ${formatPercent(ownerBaseline.medianEngagement)}`, toneFromRatio(engagementRatio)),
      metric('Audience size', formatRatio(audienceRatio), `${formatCount(targetChannel.subscriberCount)} vs your ${formatCount(owner.subscriberCount)} subs`),
      metric('Topic overlap', topicOverlap.label, topicOverlap.detail, topicOverlap.tone),
      metric('Format', targetVideo.isShort ? 'Shorts' : 'Long-form', owner.videoSampleSize ? `${owner.dominantFormat} is your dominant saved format` : 'Connect history for format baseline.'),
    ],
    observations: [
      hasOwnerBaseline
        ? `This video has ${formatRatio(viewRatio)} your saved median upload views.`
        : 'Your connected channel is active, but saved upload benchmarks are still thin.',
      topicOverlap.detail,
      targetVideo.isShort === owner.dominantIsShort
        ? 'The format matches your strongest saved format signal.'
        : 'The format differs from your dominant saved format, so treat the result as less directly transferable.',
    ],
    nudges: buildCompetitorVideoNudges({ topicOverlap, viewRatio, engagementRatio, targetVideo, owner }),
    actions: comparisonActions(true),
  };
}

function buildChannelComparison({ owner, targetChannel, targetVideos, isOwnChannel }) {
  const targetBaseline = buildVideoBaseline(targetVideos);
  const audienceRatio = ratio(targetChannel.subscriberCount, owner.subscriberCount);
  const viewsRatio = ratio(targetBaseline.medianViews, owner.videoBaseline.medianViews);
  const engagementRatio = ratio(targetBaseline.medianEngagement, owner.videoBaseline.medianEngagement);
  const topicOverlap = scoreTopicOverlap(targetBaseline.topTerms, owner.topTerms);
  const channelAnalytics = summarizeChannelDailyRows(owner.channelDailyRows);

  if (isOwnChannel) {
    return {
      status: 'connected',
      mode: 'own_channel',
      eyebrow: 'Your channel',
      title: 'This is your channel',
      subtitle: `Public channel sample plus saved analytics for ${owner.title}.`,
      connectedChannel: ownerCard(owner),
      dataUpdatedAt: owner.updatedAt,
      metrics: [
        metric('Saved uploads', String(owner.videoSampleSize), 'Unique videos in your stored benchmark sample.'),
        metric('Median views', formatCount(targetBaseline.medianViews || owner.videoBaseline.medianViews), `${targetBaseline.sampleSize || owner.videoSampleSize} uploads sampled.`),
        metric('Channel CTR', channelAnalytics.ctr !== null ? formatPercent(channelAnalytics.ctr) : 'No saved rows', 'From saved YouTube Analytics daily rows.'),
        metric('Retention', channelAnalytics.retention !== null ? formatPercent(channelAnalytics.retention) : 'No saved rows', 'Average percentage viewed from saved rows.'),
        metric('Dominant format', owner.dominantFormat, `${formatPercent(owner.shortShare)} Shorts in saved sample.`),
      ],
      observations: [
        owner.videoSampleSize >= 3
          ? `Your stored benchmark median is ${formatCount(owner.videoBaseline.medianViews)} views per sampled upload.`
          : 'Run a full account analysis to build a stronger stored upload baseline.',
        channelAnalytics.ctr !== null || channelAnalytics.retention !== null
          ? 'Owner-only analytics are available in the saved comparison layer.'
          : 'CTR and retention will appear here after YouTube Analytics rows are cached.',
      ],
      nudges: [
        'Use this view as the baseline before studying other channels, especially when comparing topic fit and format mix.',
      ],
      actions: comparisonActions(true),
    };
  }

  if (!owner.hasAnyBaseline) {
    return buildConnectedNeedsRefresh(owner, 'channel');
  }

  return {
    status: 'connected',
    mode: 'compare_channel',
    eyebrow: 'Compared to your channel',
    title: 'Channel fit against your baseline',
    subtitle: `${targetChannel.title || 'This channel'} compared with ${owner.title}.`,
    connectedChannel: ownerCard(owner),
    dataUpdatedAt: owner.updatedAt,
    metrics: [
      metric('Audience size', formatRatio(audienceRatio), `${formatCount(targetChannel.subscriberCount)} vs your ${formatCount(owner.subscriberCount)} subs`),
      metric('Median upload views', formatRatio(viewsRatio), `${formatCount(targetBaseline.medianViews)} vs your ${formatCount(owner.videoBaseline.medianViews)}`, toneFromRatio(viewsRatio)),
      metric('Engagement', formatRatio(engagementRatio), `${formatPercent(targetBaseline.medianEngagement)} vs your ${formatPercent(owner.videoBaseline.medianEngagement)}`, toneFromRatio(engagementRatio)),
      metric('Topic overlap', topicOverlap.label, topicOverlap.detail, topicOverlap.tone),
      metric('Format mix', `${formatPercent(targetBaseline.shortShare)} Shorts`, `Your saved sample is ${formatPercent(owner.shortShare)} Shorts.`),
    ],
    observations: [
      `The sampled channel median is ${formatRatio(viewsRatio)} your saved median upload views.`,
      topicOverlap.detail,
      targetBaseline.shortShare > owner.shortShare + 0.25
        ? 'This channel leans more heavily into Shorts than your saved sample.'
        : targetBaseline.shortShare + 0.25 < owner.shortShare
          ? 'This channel leans more long-form than your saved sample.'
          : 'The format mix is fairly close to your saved sample.',
    ],
    nudges: buildCompetitorChannelNudges({ topicOverlap, viewsRatio, engagementRatio }),
    actions: comparisonActions(true),
  };
}

function buildConnectedNeedsRefresh(owner, noun) {
  return {
    status: 'connected',
    mode: 'needs_benchmark',
    eyebrow: 'Connected',
    title: `${owner.title} is connected`,
    subtitle: `Refresh your channel benchmarks to compare this ${noun} with your own saved data.`,
    connectedChannel: ownerCard(owner),
    dataUpdatedAt: owner.updatedAt,
    metrics: [
      metric('Connected channel', owner.title, `${formatCount(owner.subscriberCount)} subscribers`),
      metric('Saved upload sample', String(owner.videoSampleSize), 'Run full analysis to build views, engagement, topic, CTR, and retention baselines.'),
    ],
    observations: [
      'Your YouTube connection is active, but there is not enough saved benchmark data for a useful comparison yet.',
      'Refreshing from your account page will cache recent upload and analytics rows for deeper extension comparisons.',
    ],
    nudges: [
      'Once the baseline exists, YouTool can tell when you are studying your own content versus a competitor or idea source.',
    ],
    actions: comparisonActions(true),
  };
}

function comparisonActions(includeRefresh) {
  return includeRefresh
    ? [
        { label: 'Refresh comparison', kind: 'refresh' },
        { label: 'Open account', href: ACCOUNT_URL, kind: 'secondary' },
      ]
    : [{ label: 'Open account', href: ACCOUNT_URL, kind: 'secondary' }];
}

function buildOwnerBaseline({ connection, channelSnapshot, storedVideos, channelDailyRows }) {
  const videoBaseline = buildVideoBaseline(storedVideos);
  const channelAnalytics = summarizeChannelDailyRows(channelDailyRows);
  const updatedAt = latestDate([
    connection?.updated_at,
    channelSnapshot?.snapshot_date,
    ...storedVideos.map((video) => video.snapshotDate),
    ...channelDailyRows.map((row) => row.metric_date),
  ]);

  return {
    channelId: connection.channel_id,
    title: channelSnapshot?.title || connection.channel_title || 'Your channel',
    thumbnailUrl: channelSnapshot?.thumbnail_url || connection.channel_thumbnail_url || '',
    subscriberCount: toNumber(channelSnapshot?.subscriber_count),
    viewCount: toNumber(channelSnapshot?.view_count),
    videoCount: toNumber(channelSnapshot?.video_count),
    topicCategories: Array.isArray(channelSnapshot?.topic_categories) ? channelSnapshot.topic_categories : [],
    videoSampleSize: videoBaseline.sampleSize,
    videoBaseline,
    channelDailyRows,
    updatedAt,
    hasAnyBaseline: Boolean(channelSnapshot || videoBaseline.sampleSize >= 3 || channelDailyRows.length),
    topTerms: videoBaseline.topTerms,
    shortShare: videoBaseline.shortShare,
    dominantIsShort: videoBaseline.shortShare >= 0.5,
    dominantFormat: videoBaseline.shortShare >= 0.5 ? 'Shorts' : 'Long-form',
    channelAnalytics,
  };
}

function buildVideoBaseline(videos) {
  const sample = normalizeVideos(videos).filter((video) => video.views > 0);
  const engagementRates = sample.map((video) => video.engagementRate).filter((value) => value !== null);
  const shorts = sample.filter((video) => video.isShort).length;
  const topTerms = topTermsFromVideos(sample, 12);

  return {
    sampleSize: sample.length,
    medianViews: median(sample.map((video) => video.views)),
    averageViews: average(sample.map((video) => video.views)),
    medianEngagement: median(engagementRates),
    averageEngagement: average(engagementRates),
    shortShare: sample.length ? shorts / sample.length : 0,
    topTerms,
  };
}

function summarizeChannelDailyRows(rows) {
  const sorted = Array.isArray(rows) ? [...rows].reverse() : [];
  const ctrValues = sorted.map((row) => percentValue(row.thumbnail_ctr)).filter((value) => value !== null);
  const retentionValues = sorted.map((row) => percentValue(row.average_view_percentage)).filter((value) => value !== null);
  const watchValues = sorted.map((row) => toNumber(row.estimated_minutes_watched)).filter((value) => value > 0);

  return {
    ctr: averageOrNull(ctrValues),
    retention: averageOrNull(retentionValues),
    watchMinutes: averageOrNull(watchValues),
    rows: sorted.length,
  };
}

function summarizeVideoDailyRows(rows) {
  const sorted = Array.isArray(rows) ? [...rows].reverse() : [];
  const ctrValues = sorted.map((row) => percentValue(row.thumbnail_ctr)).filter((value) => value !== null);
  const retentionValues = sorted.map((row) => percentValue(row.average_view_percentage)).filter((value) => value !== null);
  const latest = sorted[sorted.length - 1] || {};

  return {
    ctr: averageOrNull(ctrValues),
    retention: averageOrNull(retentionValues),
    latestViews: toNumber(latest.views),
    rows: sorted.length,
  };
}

function normalizeChannel(channel) {
  const snippet = channel?.snippet || {};
  const statistics = channel?.statistics || {};
  return {
    id: channel?.id || channel?.channelId || '',
    title: decodeHtml(snippet.title || channel?.title || channel?.channelTitle || ''),
    subscriberCount: toNumber(statistics.subscriberCount ?? channel?.subscriberCount),
    viewCount: toNumber(statistics.viewCount ?? channel?.viewCount),
    videoCount: toNumber(statistics.videoCount ?? channel?.videoCount),
    thumbnailUrl: getBestThumbnail(snippet.thumbnails) || channel?.thumbnailUrl || '',
  };
}

function normalizeVideo(video) {
  const snippet = video?.snippet || {};
  const statistics = video?.statistics || {};
  const durationSeconds = video?.durationSeconds ?? video?.duration ?? parseDuration(video?.contentDetails?.duration || '');
  const views = toNumber(statistics.viewCount ?? video?.viewCount ?? video?.views);
  const likes = toNumber(statistics.likeCount ?? video?.likeCount ?? video?.likes);
  const comments = toNumber(statistics.commentCount ?? video?.commentCount ?? video?.comments);
  const tags = Array.isArray(snippet.tags) ? snippet.tags : Array.isArray(video?.tags) ? video.tags : [];
  const title = decodeHtml(snippet.title || video?.title || '');
  const description = decodeHtml(snippet.description || video?.description || '');

  return {
    id: video?.id || video?.videoId || '',
    title,
    description,
    channelId: snippet.channelId || video?.channelId || '',
    channelTitle: decodeHtml(snippet.channelTitle || video?.channelTitle || ''),
    publishedAt: snippet.publishedAt || video?.publishedAt || '',
    views,
    likes,
    comments,
    durationSeconds,
    isShort: Boolean(video?.isShortGuess ?? durationSeconds < 60),
    engagementRate: (likes + comments) / Math.max(views, 1),
    terms: extractTerms([title, description, ...tags].join(' '), 16),
    snapshotDate: video?.snapshotDate || video?.snapshot_date || '',
  };
}

function normalizeStoredVideo(row) {
  return normalizeVideo({
    videoId: row.video_id,
    title: row.title,
    description: row.description,
    publishedAt: row.published_at,
    durationSeconds: row.duration_seconds,
    tags: row.tags,
    viewCount: row.view_count,
    likeCount: row.like_count,
    commentCount: row.comment_count,
    isShortGuess: row.is_short_guess,
    snapshotDate: row.snapshot_date,
  });
}

function normalizeVideos(videos) {
  return Array.isArray(videos) ? videos.map(normalizeVideo).filter((video) => video.id || video.title) : [];
}

function ownerCard(owner) {
  return {
    channelId: owner.channelId,
    title: owner.title,
    thumbnailUrl: owner.thumbnailUrl,
    subscriberCount: owner.subscriberCount,
    sampleSize: owner.videoSampleSize,
  };
}

function buildOwnerVideoNudges({ viewRatio, engagementRatio, latestVideoAnalytics }) {
  return [
    viewRatio >= 1.5
      ? 'The useful question is what made this package travel beyond your baseline: title promise, thumbnail contrast, topic timing, or format.'
      : viewRatio > 0 && viewRatio < 0.75
        ? 'The data points more toward packaging or distribution friction than a guaranteed topic problem.'
        : 'Treat this as baseline context first; the directional signal gets stronger as more analytics rows are cached.',
    engagementRatio >= 1.25
      ? 'Engagement is pulling above baseline, so comments and like rate are worth reading before changing the idea.'
      : '',
    latestVideoAnalytics.ctr !== null && latestVideoAnalytics.retention !== null
      ? 'CTR and retention together are more useful than either metric alone; high CTR with weaker retention usually means the package over-promised.'
      : '',
  ].filter(Boolean);
}

function buildCompetitorVideoNudges({ topicOverlap, viewRatio, engagementRatio }) {
  return [
    topicOverlap.score >= 0.35 && viewRatio >= 1.5
      ? 'This is a good study candidate because both performance and topic overlap point in the same direction.'
      : '',
    topicOverlap.score < 0.2
      ? 'Use this more as packaging research than topic validation; the topic overlap with your channel is thin.'
      : '',
    engagementRatio >= 1.25
      ? 'The engagement gap suggests the idea may be creating stronger viewer response, not just getting wider distribution.'
      : '',
  ].filter(Boolean);
}

function buildCompetitorChannelNudges({ topicOverlap, viewsRatio, engagementRatio }) {
  return [
    topicOverlap.score >= 0.35 && viewsRatio >= 1.25
      ? 'The overlap is high enough that this channel is worth tracking as a real benchmark, not just inspiration.'
      : '',
    viewsRatio >= 2 && engagementRatio < 0.85
      ? 'Reach is stronger than engagement; study packaging and traffic sources before copying content style.'
      : '',
    topicOverlap.score < 0.2
      ? 'Low overlap means the channel can still teach format or thumbnail patterns, but topic conclusions may not transfer.'
      : '',
  ].filter(Boolean);
}

function scoreTopicOverlap(targetTerms, ownerTerms) {
  const target = new Set((Array.isArray(targetTerms) ? targetTerms : []).map(normalizeTerm).filter(Boolean));
  const owner = new Set((Array.isArray(ownerTerms) ? ownerTerms : []).map(normalizeTerm).filter(Boolean));

  if (!target.size || !owner.size) {
    return {
      score: 0,
      label: 'Needs data',
      tone: 'neutral',
      detail: 'Not enough saved topic terms yet for overlap scoring.',
    };
  }

  const matches = Array.from(target).filter((term) => owner.has(term));
  const score = matches.length / Math.max(Math.min(target.size, owner.size), 1);

  if (score >= 0.45) {
    return {
      score,
      label: 'High',
      tone: 'good',
      detail: `High topic overlap through ${matches.slice(0, 5).join(', ')}.`,
    };
  }

  if (score >= 0.2) {
    return {
      score,
      label: 'Medium',
      tone: 'mid',
      detail: `Some topic overlap through ${matches.slice(0, 4).join(', ') || 'adjacent terms'}.`,
    };
  }

  return {
    score,
    label: 'Low',
    tone: 'low',
    detail: 'Low topic overlap with your saved channel terms.',
  };
}

function topTermsFromVideos(videos, limit) {
  const counts = new Map();
  normalizeVideos(videos).forEach((video) => {
    extractTerms([video.title, video.description].join(' '), 18).forEach((term) => {
      counts.set(term, (counts.get(term) || 0) + 1);
    });
  });

  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([term]) => term);
}

const STOP_WORDS = new Set([
  'about', 'after', 'again', 'against', 'also', 'because', 'before', 'being', 'channel', 'could', 'every',
  'from', 'have', 'into', 'just', 'like', 'more', 'most', 'only', 'over', 'part', 'that', 'their', 'there',
  'these', 'they', 'this', 'through', 'video', 'what', 'when', 'where', 'which', 'while', 'with', 'would',
  'your', 'youre', 'youtube',
]);

function extractTerms(text, limit) {
  const counts = new Map();
  String(text || '')
    .toLowerCase()
    .replace(/&amp;/g, ' ')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .map(normalizeTerm)
    .filter((term) => term.length >= 3 && !STOP_WORDS.has(term) && !/^\d+$/.test(term))
    .forEach((term) => counts.set(term, (counts.get(term) || 0) + 1));

  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, limit)
    .map(([term]) => term);
}

function normalizeTerm(term) {
  return String(term || '').toLowerCase().replace(/^-+|-+$/g, '').trim();
}

function metric(label, value, detail, tone = 'neutral') {
  return {
    label,
    value: value === undefined || value === null || value === '' ? 'No data' : String(value),
    detail: detail ? String(detail) : '',
    tone,
  };
}

function ratio(value, baseline) {
  const left = Number(value);
  const right = Number(baseline);
  if (!Number.isFinite(left) || !Number.isFinite(right) || right <= 0) return null;
  return left / right;
}

function toneFromRatio(value) {
  if (value === null || value === undefined) return 'neutral';
  if (value >= 1.25) return 'good';
  if (value < 0.75) return 'low';
  return 'mid';
}

function formatRatio(value) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return 'Needs data';
  return `${Number(value).toFixed(Number(value) >= 10 ? 0 : 1)}x`;
}

function formatCount(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return '0';
  if (number >= 1_000_000_000) return `${trimDecimal(number / 1_000_000_000)}B`;
  if (number >= 1_000_000) return `${trimDecimal(number / 1_000_000)}M`;
  if (number >= 1_000) return `${trimDecimal(number / 1_000)}K`;
  return String(Math.round(number));
}

function trimDecimal(value) {
  return value >= 10 ? value.toFixed(0) : value.toFixed(1).replace(/\.0$/, '');
}

function formatPercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 'No data';
  const normalized = Math.abs(number) > 1 ? number / 100 : number;
  return `${(normalized * 100).toFixed(normalized >= 0.1 ? 1 : 2).replace(/\.0$/, '')}%`;
}

function formatDuration(seconds) {
  const total = Math.max(0, Math.round(Number(seconds) || 0));
  const minutes = Math.floor(total / 60);
  const remaining = total % 60;
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }
  return `${minutes}:${String(remaining).padStart(2, '0')}`;
}

function median(values) {
  const sorted = values.map(Number).filter((value) => Number.isFinite(value) && value >= 0).sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function average(values) {
  const cleaned = values.map(Number).filter((value) => Number.isFinite(value));
  if (!cleaned.length) return 0;
  return cleaned.reduce((sum, value) => sum + value, 0) / cleaned.length;
}

function averageOrNull(values) {
  const cleaned = values.map(Number).filter((value) => Number.isFinite(value));
  if (!cleaned.length) return null;
  return cleaned.reduce((sum, value) => sum + value, 0) / cleaned.length;
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function percentValue(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.abs(number) > 1 ? number / 100 : number;
}

function latestDate(values) {
  const dates = values
    .filter(Boolean)
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => b.getTime() - a.getTime());

  return dates[0]?.toISOString() || '';
}

function parseDuration(duration) {
  if (!duration) return 0;
  const match = String(duration).match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  return (parseInt(match[1] || '0', 10) * 3600) +
    (parseInt(match[2] || '0', 10) * 60) +
    parseInt(match[3] || '0', 10);
}

function getBestThumbnail(thumbnails) {
  return thumbnails?.maxres?.url ||
    thumbnails?.standard?.url ||
    thumbnails?.high?.url ||
    thumbnails?.medium?.url ||
    thumbnails?.default?.url ||
    '';
}

function decodeHtml(value) {
  return String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

module.exports = {
  buildViewerComparison,
};
