const { createHash } = require('crypto');

const SOURCE_SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/yt-analytics.readonly',
];

const PRIVATE_ANALYTICS_TABLES = [
  'youtube_channel_insight_runs',
  'youtube_comment_snapshots',
  'youtube_analytics_breakdowns',
  'youtube_video_analytics_daily',
  'youtube_channel_analytics_daily',
  'youtube_video_snapshots',
  'youtube_channel_snapshots',
  'youtube_analytics_sync_runs',
];

function isStorageUnavailable(error) {
  const message = String(error?.message || '');
  return (
    error?.code === '42P01' ||
    error?.code === 'PGRST205' ||
    message.includes('does not exist') ||
    message.includes('schema cache')
  );
}

function logOptionalStorageError(label, error) {
  if (isStorageUnavailable(error)) return;
  console.warn(`[youtube-analytics-store] ${label}:`, error?.message || error);
}

async function runOptional(label, operation) {
  try {
    const result = await operation();
    if (result?.error) throw result.error;
    return result?.data ?? null;
  } catch (error) {
    logOptionalStorageError(label, error);
    return undefined;
  }
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === '') return null;
  const next = Number(value);
  return Number.isFinite(next) ? next : null;
}

function integerOrNull(value) {
  const next = numberOrNull(value);
  return next === null ? null : Math.round(next);
}

function dateOnly(value) {
  if (!value) return new Date().toISOString().split('T')[0];
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toISOString().split('T')[0];
}

function stableHash(value) {
  return createHash('sha256')
    .update(JSON.stringify(value))
    .digest('hex');
}

async function ensureYouTubeAnalyticsConsentRecord(supabase, params) {
  const userId = params?.userId;
  const channelId = params?.channelId;
  if (!supabase || !userId || !channelId) return null;

  const existing = await runOptional('read analytics consent', () => supabase
    .from('youtube_analytics_consent')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle());

  if (existing === undefined) return null;

  if (existing?.user_id) {
    return runOptional('update analytics consent channel', () => supabase
      .from('youtube_analytics_consent')
      .update({
        channel_id: channelId,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId));
  }

  return runOptional('create analytics consent row', () => supabase
    .from('youtube_analytics_consent')
    .insert({
      user_id: userId,
      channel_id: channelId,
      analytics_history_enabled: true,
      anonymized_research_opt_in: false,
      public_case_study_opt_in: false,
      consent_version: 'connected-channel-analytics-history-v1',
      consented_at: new Date().toISOString(),
    }));
}

async function getAnalyticsConsent(supabase, userId, channelId) {
  const consent = await runOptional('read analytics consent gate', () => supabase
    .from('youtube_analytics_consent')
    .select('channel_id,analytics_history_enabled,anonymized_research_opt_in,public_case_study_opt_in,revoked_at')
    .eq('user_id', userId)
    .maybeSingle());

  if (!consent) return null;
  if (channelId && consent.channel_id && consent.channel_id !== channelId) return null;
  return consent;
}

function canStorePrivateAnalytics(consent) {
  return Boolean(consent?.analytics_history_enabled && !consent?.revoked_at);
}

async function createSyncRun(supabase, params) {
  const inserted = await runOptional('create analytics sync run', () => supabase
    .from('youtube_analytics_sync_runs')
    .insert({
      user_id: params.userId,
      channel_id: params.channelId,
      sync_type: params.syncType,
      status: 'started',
      period_start: params.periodStart || null,
      period_end: params.periodEnd || null,
      source_scopes: SOURCE_SCOPES,
      metadata: params.metadata || {},
    })
    .select('id')
    .maybeSingle());

  return inserted?.id || null;
}

async function finishSyncRun(supabase, syncRunId, status, errorMessage) {
  if (!syncRunId) return null;

  return runOptional('finish analytics sync run', () => supabase
    .from('youtube_analytics_sync_runs')
    .update({
      status,
      completed_at: new Date().toISOString(),
      error_message: errorMessage || null,
    })
    .eq('id', syncRunId));
}

async function storeChannelSnapshot(supabase, params) {
  const channel = params.summary?.channel || {};
  const channelId = params.channelId;
  if (!channelId) return null;

  return runOptional('store channel snapshot', () => supabase
    .from('youtube_channel_snapshots')
    .upsert({
      user_id: params.userId,
      channel_id: channelId,
      snapshot_date: dateOnly(params.summary?.generatedAt),
      title: channel.title || params.connection?.channel_title || null,
      description: channel.description || null,
      custom_url: channel.customUrl || null,
      published_at: channel.publishedAt || null,
      country: channel.country || null,
      default_language: channel.defaultLanguage || null,
      localized: channel.localized || {},
      thumbnail_url: channel.thumbnailUrl || params.connection?.channel_thumbnail_url || null,
      subscriber_count: integerOrNull(channel.subscriberCount),
      view_count: integerOrNull(channel.viewCount),
      video_count: integerOrNull(channel.videoCount),
      uploads_playlist_id: channel.uploadsPlaylistId || params.connection?.uploads_playlist_id || null,
      topic_categories: Array.isArray(channel.topicCategories) ? channel.topicCategories : [],
      status: channel.status || {},
      branding: channel.branding || {},
      raw: channel,
    }, { onConflict: 'user_id,channel_id,snapshot_date' }));
}

async function storeChannelTrendDays(supabase, params) {
  const summaryRows = Array.isArray(params.summary?.trendDays) ? params.summary.trendDays : [];
  const fullRows = Array.isArray(params.fullAnalysis?.dailyRows) ? params.fullAnalysis.dailyRows : [];
  const rowsByDate = new Map();

  summaryRows.forEach((row) => {
    if (row?.date) rowsByDate.set(row.date, row);
  });

  fullRows.forEach((row) => {
    if (row?.date) rowsByDate.set(row.date, { ...(rowsByDate.get(row.date) || {}), ...row });
  });

  const rows = Array.from(rowsByDate.values());
  if (!rows.length) return null;

  const mappedRows = rows
    .filter((row) => row?.date)
    .map((row) => ({
      user_id: params.userId,
      channel_id: params.channelId,
      metric_date: row.date,
      views: integerOrNull(row.views),
      engaged_views: integerOrNull(row.engagedViews),
      red_views: integerOrNull(row.redViews),
      estimated_minutes_watched: numberOrNull(row.estimatedMinutesWatched),
      estimated_red_minutes_watched: numberOrNull(row.estimatedRedMinutesWatched),
      subscribers_gained: integerOrNull(row.subscribersGained),
      subscribers_lost: integerOrNull(row.subscribersLost),
      likes: integerOrNull(row.likes),
      dislikes: integerOrNull(row.dislikes),
      comments: integerOrNull(row.comments),
      shares: integerOrNull(row.shares),
      videos_added_to_playlists: integerOrNull(row.videosAddedToPlaylists),
      videos_removed_from_playlists: integerOrNull(row.videosRemovedFromPlaylists),
      average_view_duration_seconds: numberOrNull(row.averageViewDuration),
      average_view_percentage: numberOrNull(row.averageViewPercentage),
      thumbnail_impressions: integerOrNull(row.videoThumbnailImpressions),
      thumbnail_ctr: numberOrNull(row.thumbnailCtr),
      card_impressions: integerOrNull(row.cardImpressions),
      card_clicks: integerOrNull(row.cardClicks),
      card_teaser_impressions: integerOrNull(row.cardTeaserImpressions),
      card_teaser_clicks: integerOrNull(row.cardTeaserClicks),
      raw: row,
    }));

  if (!mappedRows.length) return null;

  return runOptional('store channel daily trend', () => supabase
    .from('youtube_channel_analytics_daily')
    .upsert(mappedRows, { onConflict: 'user_id,channel_id,metric_date' }));
}

async function storeVideoDailyRows(supabase, params) {
  const rows = Array.isArray(params.fullAnalysis?.videoDailyRows) ? params.fullAnalysis.videoDailyRows : [];
  if (!rows.length) return null;

  const mappedRows = rows
    .filter((row) => row?.date && row?.videoId)
    .map((row) => ({
      user_id: params.userId,
      channel_id: params.channelId,
      video_id: row.videoId,
      metric_date: row.date,
      views: integerOrNull(row.views),
      engaged_views: integerOrNull(row.engagedViews),
      red_views: integerOrNull(row.redViews),
      estimated_minutes_watched: numberOrNull(row.estimatedMinutesWatched),
      estimated_red_minutes_watched: numberOrNull(row.estimatedRedMinutesWatched),
      average_view_duration_seconds: numberOrNull(row.averageViewDuration),
      average_view_percentage: numberOrNull(row.averageViewPercentage),
      subscribers_gained: integerOrNull(row.subscribersGained),
      subscribers_lost: integerOrNull(row.subscribersLost),
      likes: integerOrNull(row.likes),
      dislikes: integerOrNull(row.dislikes),
      comments: integerOrNull(row.comments),
      shares: integerOrNull(row.shares),
      videos_added_to_playlists: integerOrNull(row.videosAddedToPlaylists),
      videos_removed_from_playlists: integerOrNull(row.videosRemovedFromPlaylists),
      thumbnail_impressions: integerOrNull(row.videoThumbnailImpressions),
      thumbnail_ctr: numberOrNull(row.thumbnailCtr),
      raw: row,
    }));

  if (!mappedRows.length) return null;

  return runOptional('store video daily analytics', () => supabase
    .from('youtube_video_analytics_daily')
    .upsert(mappedRows, { onConflict: 'user_id,video_id,metric_date' }));
}

function buildBreakdownRows(params) {
  const fullAnalysis = params.fullAnalysis || {};
  const breakdowns = fullAnalysis.breakdowns || {};
  const periodStart = fullAnalysis.period?.startDate || params.summary?.period?.currentStartDate || null;
  const periodEnd = fullAnalysis.period?.endDate || params.summary?.period?.currentEndDate || null;
  const rows = [];

  Object.entries(breakdowns).forEach(([dimensionSet, entries]) => {
    if (!Array.isArray(entries)) return;

    entries.forEach((entry) => {
      const dimensionKey = String(entry?.key || entry?.label || '').trim();
      if (!dimensionKey || !periodStart || !periodEnd) return;

      rows.push({
        user_id: params.userId,
        channel_id: params.channelId,
        period_start: periodStart,
        period_end: periodEnd,
        dimension_set: dimensionSet,
        dimension_key: dimensionKey,
        dimension_values: {
          key: entry.key || null,
          label: entry.label || null,
        },
        metrics: {
          views: numberOrNull(entry.views),
          engagedViews: numberOrNull(entry.engagedViews),
          watchHours: numberOrNull(entry.watchHours),
          shareOfViews: numberOrNull(entry.shareOfViews),
          engagedViewRate: numberOrNull(entry.engagedViewRate),
          viewerPercentage: numberOrNull(entry.viewerPercentage),
          shareOfKnownAudience: numberOrNull(entry.shareOfKnownAudience),
        },
        raw: entry,
      });
    });
  });

  const topVideos = Array.isArray(fullAnalysis.topVideos) ? fullAnalysis.topVideos : [];
  topVideos.forEach((video) => {
    if (!video?.id || !periodStart || !periodEnd) return;

    rows.push({
      user_id: params.userId,
      channel_id: params.channelId,
      video_id: video.id,
      period_start: periodStart,
      period_end: periodEnd,
      dimension_set: 'topVideos',
      dimension_key: video.id,
      dimension_values: {
        videoId: video.id,
        title: video.title || null,
      },
      metrics: {
        views: numberOrNull(video.views),
        engagedViews: numberOrNull(video.engagedViews),
        watchHours: numberOrNull(video.watchHours),
        averageViewDuration: numberOrNull(video.averageViewDuration),
        averageViewPercentage: numberOrNull(video.averageViewPercentage),
        engagementRate: numberOrNull(video.engagementRate),
        thumbnailCtr: numberOrNull(video.thumbnailCtr),
        netSubscribers: numberOrNull(video.netSubscribers),
      },
      raw: video,
    });
  });

  return rows;
}

async function storeBreakdowns(supabase, params) {
  const rows = buildBreakdownRows(params);
  if (!rows.length) return null;

  await runOptional('clear analytics breakdowns for period', () => supabase
    .from('youtube_analytics_breakdowns')
    .delete()
    .eq('user_id', params.userId)
    .eq('channel_id', params.channelId)
    .eq('period_start', rows[0].period_start)
    .eq('period_end', rows[0].period_end));

  return runOptional('store analytics breakdowns', () => supabase
    .from('youtube_analytics_breakdowns')
    .insert(rows));
}

function buildMetadataFeatures(video) {
  const title = String(video?.title || '');
  const description = String(video?.description || '');
  const tags = Array.isArray(video?.tags) ? video.tags : [];
  const words = title.toLowerCase().match(/[a-z0-9]+/g) || [];

  return {
    titleLength: title.length,
    titleWordCount: words.length,
    hasNumberInTitle: /\d/.test(title),
    hasQuestionInTitle: title.includes('?'),
    uppercaseCharacterCount: (title.match(/[A-Z]/g) || []).length,
    uppercaseShare: title.length ? (title.match(/[A-Z]/g) || []).length / title.length : 0,
    descriptionLength: description.length,
    descriptionWordCount: (description.match(/\b[\w'-]+\b/g) || []).length,
    descriptionLinkCount: (description.match(/https?:\/\/|www\./gi) || []).length,
    tagCount: tags.length,
    hasTags: tags.length > 0,
    durationSeconds: integerOrNull(video?.durationSeconds),
    isShortGuess: Boolean(video?.isShortGuess),
  };
}

async function storeVideoSnapshots(supabase, params) {
  const videoMap = new Map();
  const topVideos = Array.isArray(params.fullAnalysis?.topVideos) ? params.fullAnalysis.topVideos : [];
  const metadataVideos = Array.isArray(params.fullAnalysis?.videoMetadata) ? params.fullAnalysis.videoMetadata : [];

  metadataVideos.forEach((video) => {
    if (video?.id) videoMap.set(video.id, video);
  });

  topVideos.forEach((video) => {
    if (!video?.id) return;
    videoMap.set(video.id, { ...(videoMap.get(video.id) || {}), ...video });
  });

  if (!videoMap.size) return null;

  const snapshotDate = dateOnly(params.fullAnalysis?.period?.endDate || params.summary?.generatedAt);
  const rows = Array.from(videoMap.values())
    .map((video) => ({
      user_id: params.userId,
      channel_id: params.channelId,
      video_id: video.id,
      snapshot_date: snapshotDate,
      title: video.title || null,
      description: video.description || null,
      published_at: video.publishedAt || null,
      duration_iso: video.durationIso || null,
      duration_seconds: integerOrNull(video.durationSeconds),
      category_id: video.categoryId || null,
      tags: Array.isArray(video.tags) ? video.tags : [],
      default_language: video.defaultLanguage || null,
      default_audio_language: video.defaultAudioLanguage || null,
      privacy_status: video.privacyStatus || null,
      upload_status: video.uploadStatus || null,
      made_for_kids: video.madeForKids ?? null,
      caption: video.caption ?? null,
      definition: video.definition || null,
      dimension: video.dimension || null,
      live_broadcast_content: video.liveBroadcastContent || null,
      thumbnail_url: video.thumbnailUrl || null,
      view_count: integerOrNull(video.views),
      like_count: integerOrNull(video.likes),
      comment_count: integerOrNull(video.comments),
      metadata_features: buildMetadataFeatures(video),
      thumbnail_features: video.thumbnailFeatures || {},
      is_short_guess: Boolean(video.isShortGuess),
      raw: video,
    }));

  if (!rows.length) return null;

  return runOptional('store video snapshots', () => supabase
    .from('youtube_video_snapshots')
    .upsert(rows, { onConflict: 'user_id,video_id,snapshot_date' }));
}

async function storeCommentSnapshots(supabase, params) {
  const comments = Array.isArray(params.fullAnalysis?.comments) ? params.fullAnalysis.comments : [];
  if (!comments.length) return null;

  const snapshotDate = dateOnly(params.fullAnalysis?.period?.endDate || params.summary?.generatedAt);
  const rows = comments
    .filter((comment) => comment?.id && comment?.videoId)
    .map((comment) => ({
      user_id: params.userId,
      channel_id: params.channelId,
      video_id: comment.videoId,
      comment_id: comment.id,
      parent_comment_id: comment.parentCommentId || null,
      snapshot_date: snapshotDate,
      author_display_name: comment.authorDisplayName || null,
      author_channel_id: comment.authorChannelId || null,
      like_count: integerOrNull(comment.likeCount),
      published_at: comment.publishedAt || null,
      updated_at_youtube: comment.updatedAt || null,
      text_display: comment.textDisplay || null,
      text_original: comment.textOriginal || null,
      raw: comment,
    }));

  if (!rows.length) return null;

  return runOptional('store comment snapshots', () => supabase
    .from('youtube_comment_snapshots')
    .upsert(rows, { onConflict: 'user_id,comment_id,snapshot_date' }));
}

async function storeInsightRun(supabase, params) {
  const fullAnalysis = params.fullAnalysis;
  if (!fullAnalysis) return null;

  const period = fullAnalysis.period || {};
  const fingerprint = stableHash({
    channelId: params.channelId,
    periodStart: period.startDate,
    periodEnd: period.endDate,
    topVideos: (fullAnalysis.topVideos || []).map((video) => video.id),
    current: fullAnalysis.current,
    breakdowns: fullAnalysis.breakdowns,
  });

  return runOptional('store channel insight run', () => supabase
    .from('youtube_channel_insight_runs')
    .insert({
      user_id: params.userId,
      channel_id: params.channelId,
      analysis_type: 'account_dashboard_full_analysis',
      period_start: period.startDate || null,
      period_end: period.endDate || null,
      model_version: 'account-dashboard-v1',
      input_fingerprint: fingerprint,
      results: fullAnalysis,
    }));
}

async function storeAccountDashboardAnalytics(supabase, params) {
  const userId = params?.userId;
  const summary = params?.summary;
  const channelId = summary?.channel?.id || params?.connection?.channel_id;

  if (!supabase || !userId || !summary || !channelId) {
    return { stored: false, reason: 'missing_context' };
  }

  await ensureYouTubeAnalyticsConsentRecord(supabase, { userId, channelId });
  const consent = await getAnalyticsConsent(supabase, userId, channelId);

  if (!canStorePrivateAnalytics(consent)) {
    return { stored: false, reason: 'analytics_history_disabled' };
  }

  const syncRunId = await createSyncRun(supabase, {
    userId,
    channelId,
    syncType: params.fullAnalysis ? 'account_dashboard_full_analysis' : 'account_dashboard_summary',
    periodStart: params.fullAnalysis?.period?.startDate || summary.period?.currentStartDate || null,
    periodEnd: params.fullAnalysis?.period?.endDate || summary.period?.currentEndDate || null,
    metadata: {
      hasFullAnalysis: Boolean(params.fullAnalysis),
      generatedAt: summary.generatedAt || null,
    },
  });

  try {
    await storeChannelSnapshot(supabase, { ...params, userId, channelId });
    await storeChannelTrendDays(supabase, { ...params, userId, channelId });

    if (params.fullAnalysis) {
      await storeVideoSnapshots(supabase, { ...params, userId, channelId });
      await storeVideoDailyRows(supabase, { ...params, userId, channelId });
      await storeCommentSnapshots(supabase, { ...params, userId, channelId });
      await storeBreakdowns(supabase, { ...params, userId, channelId });
      await storeInsightRun(supabase, { ...params, userId, channelId });
    }

    await finishSyncRun(supabase, syncRunId, 'success');
    return { stored: true };
  } catch (error) {
    await finishSyncRun(supabase, syncRunId, 'failed', error?.message || String(error));
    logOptionalStorageError('store account dashboard analytics', error);
    return { stored: false, reason: 'store_failed' };
  }
}

async function revokeYouTubeAnalyticsStorage(supabase, params) {
  const userId = params?.userId;
  if (!supabase || !userId) return null;

  await runOptional('revoke analytics consent', () => supabase
    .from('youtube_analytics_consent')
    .update({
      analytics_history_enabled: false,
      anonymized_research_opt_in: false,
      public_case_study_opt_in: false,
      revoked_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId));

  await Promise.all(PRIVATE_ANALYTICS_TABLES.map((table) => runOptional(`delete ${table}`, () => supabase
    .from(table)
    .delete()
    .eq('user_id', userId))));

  return { ok: true };
}

module.exports = {
  ensureYouTubeAnalyticsConsentRecord,
  storeAccountDashboardAnalytics,
  revokeYouTubeAnalyticsStorage,
};
