// @ts-nocheck
const { createClient } = require('@supabase/supabase-js');
const { createHash } = require('crypto');

const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';
const AUTH_HEADER_PREFIX = 'Bearer ';
const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const CHANNEL_ID_PATTERN = /^UC[\w-]{22}$/;
const MAX_CHANNEL_VIDEOS = 50;

const flaggableWords = [
  'ahole', 'anus', 'ass', 'asshole', 'bastard', 'bitch', 'fuck', 'shit'
];

function createHttpError(status: number, message: string) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function getSingleQueryValue(value: any): string {
  const rawValue = Array.isArray(value) ? value[0] : value;
  return String(rawValue || '').trim();
}

function getYouTubeApiKeys(): string[] {
  return [
    process.env.YOUTUBE_API_KEY,
    process.env.REACT_APP_YOUTUBE_API_KEY_9,
    process.env.REACT_APP_YOUTUBE_API_KEY_10,
    process.env.REACT_APP_YOUTUBE_API_KEY_4
  ].filter(Boolean);
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

async function fetchYouTube(path: string, params: Record<string, string | number>, fallbackMessage: string) {
  const apiKeys = getYouTubeApiKeys();

  if (!apiKeys.length) {
    throw createHttpError(500, 'YouTube API key is not configured.');
  }

  let lastErrorMessage = fallbackMessage;

  for (const apiKey of apiKeys) {
    const url = new URL(`${YOUTUBE_API_BASE_URL}${path}`);
    Object.entries({ ...params, key: apiKey }).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });

    const response = await fetch(url.toString());
    const payload = await safeJson(response);

    if (response.ok) {
      return payload;
    }

    const apiMessage = payload?.error?.message || fallbackMessage;
    const isQuota = /quota/i.test(apiMessage) || payload?.error?.errors?.some?.((entry: any) => {
      return /quota|dailyLimit/i.test(entry?.reason || '');
    });

    lastErrorMessage = isQuota ? 'The Channel Analyzer is on cooldown - try again tomorrow.' : apiMessage;

    if (!isQuota) {
      throw createHttpError(response.status, lastErrorMessage);
    }
  }

  throw createHttpError(429, lastErrorMessage);
}

async function resolveChannelId(req: any) {
  const explicitChannelId = getSingleQueryValue(req.query?.channelId);
  const videoId = getSingleQueryValue(req.query?.videoId);
  const input = getSingleQueryValue(req.query?.url || req.query?.handle || req.query?.channel);

  if (CHANNEL_ID_PATTERN.test(explicitChannelId)) {
    return { channelId: explicitChannelId, sourceVideo: null };
  }

  if (VIDEO_ID_PATTERN.test(videoId)) {
    const sourceVideo = await fetchVideoData(videoId);
    return {
      channelId: sourceVideo.snippet?.channelId || '',
      sourceVideo
    };
  }

  const resolvedFromInput = await resolveChannelIdFromInput(input);
  return {
    channelId: resolvedFromInput,
    sourceVideo: null
  };
}

async function resolveChannelIdFromInput(input: string): Promise<string> {
  if (CHANNEL_ID_PATTERN.test(input)) {
    return input;
  }

  if (!input) {
    throw createHttpError(400, 'invalid_channel');
  }

  let handle = '';
  let username = '';
  let searchQuery = '';

  if (/^@?[\w-]+$/.test(input) && !input.includes('youtube.com')) {
    handle = input.replace(/^@/, '');
  } else {
    try {
      const url = new URL(input);
      const channelMatch = url.pathname.match(/\/channel\/(UC[\w-]{22})/);
      const handleMatch = url.pathname.match(/\/@([\w-]+)/);
      const userMatch = url.pathname.match(/\/user\/([\w-]+)/);
      const customMatch = url.pathname.match(/^\/(?:c\/)?([\w-]+)\/?$/);

      if (channelMatch?.[1]) return channelMatch[1];
      if (handleMatch?.[1]) handle = handleMatch[1];
      if (userMatch?.[1]) username = userMatch[1];
      if (!handle && !username && customMatch?.[1]) searchQuery = customMatch[1];
    } catch (error) {
      searchQuery = input.replace(/^@/, '');
    }
  }

  if (handle) {
    const handleData = await fetchYouTube('/channels', { part: 'id', forHandle: handle }, 'Channel not found.');
    if (handleData.items?.[0]?.id) return handleData.items[0].id;
    searchQuery = handle;
  }

  if (username) {
    const userData = await fetchYouTube('/channels', { part: 'id', forUsername: username }, 'Channel not found.');
    if (userData.items?.[0]?.id) return userData.items[0].id;
    searchQuery = username;
  }

  if (searchQuery) {
    const searchData = await fetchYouTube(
      '/search',
      {
        part: 'snippet',
        q: searchQuery,
        type: 'channel',
        maxResults: 1
      },
      'Channel not found.'
    );
    const channelId = searchData.items?.[0]?.id?.channelId;
    if (CHANNEL_ID_PATTERN.test(channelId)) return channelId;
  }

  throw createHttpError(404, 'Channel not found.');
}

async function fetchVideoData(videoId: string) {
  const data = await fetchYouTube(
    '/videos',
    {
      part: 'snippet',
      id: videoId
    },
    'Failed to fetch video data.'
  );

  if (!data.items?.[0]) {
    throw createHttpError(404, 'Video not found.');
  }

  return data.items[0];
}

async function fetchChannelData(channelId: string) {
  const data = await fetchYouTube(
    '/channels',
    {
      part: 'snippet,statistics,brandingSettings,status,topicDetails,contentDetails',
      id: channelId
    },
    'Failed to fetch channel data.'
  );

  if (!data.items?.[0]) {
    throw createHttpError(404, 'Channel not found.');
  }

  return data.items[0];
}

async function fetchPlaylistData(channelId: string) {
  const data = await fetchYouTube(
    '/playlists',
    {
      part: 'id',
      channelId,
      maxResults: 5
    },
    'Failed to fetch channel playlists.'
  );

  return data.items || [];
}

async function fetchChannelVideos(uploadsPlaylistId: string) {
  if (!uploadsPlaylistId) return [];

  const playlistData = await fetchYouTube(
    '/playlistItems',
    {
      part: 'snippet',
      playlistId: uploadsPlaylistId,
      maxResults: MAX_CHANNEL_VIDEOS
    },
    'Failed to fetch channel uploads.'
  );
  const videoIds = (playlistData.items || [])
    .map((item: any) => item?.snippet?.resourceId?.videoId)
    .filter((id: string) => VIDEO_ID_PATTERN.test(String(id || '')))
    .join(',');

  if (!videoIds) return [];

  const videosData = await fetchYouTube(
    '/videos',
    {
      part: 'statistics,snippet,contentDetails',
      id: videoIds
    },
    'Failed to fetch channel video statistics.'
  );

  return (videosData.items || []).map((video: any) => ({
    id: video.id,
    title: decodeHtmlEntities(video.snippet?.title || ''),
    publishedAt: video.snippet?.publishedAt || '',
    viewCount: toInt(video.statistics?.viewCount),
    likeCount: toInt(video.statistics?.likeCount),
    commentCount: toInt(video.statistics?.commentCount),
    duration: parseDuration(video.contentDetails?.duration || ''),
    tags: video.snippet?.tags || [],
    description: decodeHtmlEntities(video.snippet?.description || ''),
    thumbnail: getBestThumbnail(video.snippet?.thumbnails) || `https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`
  }));
}

function analyzeChannelData(channelData: any, playlistData: any[], channelVideos: any[]) {
  const achievements: string[] = [];
  const drawbacks: string[] = [];
  const flaggedWords: string[] = [];
  const channelKeywords = channelData.brandingSettings?.channel?.keywords || '';
  const channelDescription = channelData.snippet?.description || '';
  const latestVideo = channelVideos[0] || null;
  const differenceInWeeks = latestVideo
    ? Math.floor((Date.now() - new Date(latestVideo.publishedAt).getTime()) / (7 * 86400000))
    : 999;
  const topVideos = getTopVideos(channelVideos, 6);
  const recentVideoCount = channelVideos.filter((video) => {
    return new Date(video.publishedAt).getTime() >= Date.now() - 183 * 86400000;
  }).length;
  const channelTitle = channelData.snippet?.title || '';
  const uniqueFlaggedWords = [
    ...checkContentForFlags(channelTitle),
    ...checkContentForFlags(channelKeywords),
    ...checkContentForFlags(channelDescription)
  ].filter((word, index, array) => array.indexOf(word) === index);
  flaggedWords.push(...uniqueFlaggedWords);

  if (flaggedWords.length === 0) {
    achievements.push('Channel content is family-friendly');
  } else {
    drawbacks.push(`Channel contains potentially inappropriate content: ${flaggedWords.join(', ')}`);
  }

  if (channelKeywords) {
    achievements.push(`Channel uses ${parseChannelKeywords(channelKeywords).length} keywords for SEO`);
  } else {
    drawbacks.push('Channel has no keywords set for discoverability');
  }

  if (differenceInWeeks <= 1) {
    achievements.push('Very active: Posted within the last week');
  } else if (differenceInWeeks <= 3) {
    achievements.push('Active: Posted within the last 3 weeks');
  } else if (latestVideo) {
    drawbacks.push(`Inactive: No new content in ${differenceInWeeks} weeks`);
  } else {
    drawbacks.push('No recent uploads found');
  }

  if (channelData.brandingSettings?.image?.bannerExternalUrl) {
    achievements.push('Has custom channel banner for professional appearance');
  } else {
    drawbacks.push('Missing channel banner - hurts professional appearance');
  }

  if (channelData.brandingSettings?.channel?.unsubscribedTrailer) {
    achievements.push('Has channel trailer to engage new visitors');
  } else {
    drawbacks.push('Missing channel trailer - missing conversion opportunity');
  }

  if (playlistData.length >= 5) {
    achievements.push('Has 5+ playlists for content organization');
  } else if (playlistData.length > 0) {
    achievements.push(`Has ${playlistData.length} playlists for content organization`);
  } else {
    drawbacks.push('No playlists - missing content organization');
  }

  if (channelDescription && channelDescription.length > 100) {
    achievements.push('Detailed channel description for better SEO');
  } else if (channelDescription) {
    drawbacks.push('Channel description could be more detailed');
  } else {
    drawbacks.push('Missing channel description - hurts discoverability');
  }

  const viewCount = toInt(channelData.statistics?.viewCount);
  const subCount = toInt(channelData.statistics?.subscriberCount);
  const videoCount = toInt(channelData.statistics?.videoCount);
  const avgViewsPerVideo = viewCount / Math.max(1, videoCount);
  const viewsPerSubscriber = viewCount / Math.max(1, subCount);

  if (viewsPerSubscriber > 100) {
    achievements.push('Strong view-to-subscriber ratio indicates engaged audience');
  }

  if (avgViewsPerVideo > 10000) {
    achievements.push('High average views per video shows quality content');
  }

  const seo = calculateSeoScore(channelDescription, channelKeywords, topVideos, playlistData);
  const engagement = calculateEngagementScore(viewCount, subCount, videoCount, topVideos);
  const consistency = calculateConsistencyScore(videoCount, recentVideoCount, differenceInWeeks);
  const branding = calculateBrandingScore(channelData, channelDescription, playlistData);
  const overallScore = Math.round((seo.score + engagement.score + consistency.score + branding.score) / 4);

  return {
    achievements: achievements.slice(0, 6),
    drawbacks: drawbacks.slice(0, 6),
    flaggedWords,
    seoScore: seo.score,
    engagementScore: engagement.score,
    consistencyScore: consistency.score,
    brandingScore: branding.score,
    overallScore,
    seoBreakdown: seo.breakdown,
    engagementBreakdown: engagement.breakdown,
    consistencyBreakdown: consistency.breakdown,
    brandingBreakdown: branding.breakdown,
    recentVideoCount,
    topVideos
  };
}

function calculateSeoScore(channelDescription: string, channelKeywords: string, topVideos: any[], playlistData: any[]) {
  const breakdown: any[] = [];
  let score = 0;

  if (channelDescription && channelDescription.length > 100) {
    score += 25;
    breakdown.push({ label: 'Description Length', score: 25, max: 25, status: 'good' });
  } else if (channelDescription && channelDescription.length > 50) {
    score += 15;
    breakdown.push({ label: 'Description Length', score: 15, max: 25, status: 'warning' });
  } else if (channelDescription) {
    score += 5;
    breakdown.push({ label: 'Description Length', score: 5, max: 25, status: 'poor' });
  } else {
    breakdown.push({ label: 'Description Length', score: 0, max: 25, status: 'poor' });
  }

  if (channelKeywords) {
    const keywordCount = parseChannelKeywords(channelKeywords).length;
    if (keywordCount >= 10) {
      score += 25;
      breakdown.push({ label: `Keywords (${keywordCount})`, score: 25, max: 25, status: 'good' });
    } else if (keywordCount >= 5) {
      score += 15;
      breakdown.push({ label: `Keywords (${keywordCount})`, score: 15, max: 25, status: 'warning' });
    } else {
      score += 5;
      breakdown.push({ label: `Keywords (${keywordCount})`, score: 5, max: 25, status: 'poor' });
    }
  } else {
    breakdown.push({ label: 'Keywords', score: 0, max: 25, status: 'poor' });
  }

  if (topVideos.length > 0) {
    const avgTags = topVideos.reduce((sum, video) => sum + video.tags.length, 0) / topVideos.length;
    if (avgTags >= 10) {
      score += 25;
      breakdown.push({ label: `Avg Video Tags (${Math.round(avgTags)})`, score: 25, max: 25, status: 'good' });
    } else if (avgTags >= 5) {
      score += 15;
      breakdown.push({ label: `Avg Video Tags (${Math.round(avgTags)})`, score: 15, max: 25, status: 'warning' });
    } else {
      score += 5;
      breakdown.push({ label: `Avg Video Tags (${Math.round(avgTags)})`, score: 5, max: 25, status: 'poor' });
    }
  } else {
    breakdown.push({ label: 'Video Tags', score: 0, max: 25, status: 'poor' });
  }

  if (playlistData.length >= 5) {
    score += 25;
    breakdown.push({ label: 'Playlists (5+)', score: 25, max: 25, status: 'good' });
  } else if (playlistData.length > 0) {
    score += 15;
    breakdown.push({ label: `Playlists (${playlistData.length})`, score: 15, max: 25, status: 'warning' });
  } else {
    breakdown.push({ label: 'Playlists', score: 0, max: 25, status: 'poor' });
  }

  return { score: Math.min(100, score), breakdown };
}

function calculateEngagementScore(viewCount: number, subCount: number, videoCount: number, topVideos: any[]) {
  const breakdown: any[] = [];
  let score = 0;
  const viewsPerSub = viewCount / Math.max(1, subCount);
  const viewsPerSubPerVideo = viewsPerSub / Math.max(1, videoCount);

  if (videoCount < 200) {
    if (viewsPerSubPerVideo > 2 || viewsPerSub < 200) {
      score += 40;
      breakdown.push({ label: `Views/Subscriber (${Math.round(viewsPerSub)})`, score: 40, max: 40, status: 'good' });
    } else if (viewsPerSubPerVideo > 1.5 || viewsPerSub < 400) {
      score += 35;
      breakdown.push({ label: `Views/Subscriber (${Math.round(viewsPerSub)})`, score: 35, max: 40, status: 'good' });
    } else if (viewsPerSub < 600) {
      score += 30;
      breakdown.push({ label: `Views/Subscriber (${Math.round(viewsPerSub)})`, score: 30, max: 40, status: 'good' });
    } else if (viewsPerSub < 800) {
      score += 20;
      breakdown.push({ label: `Views/Subscriber (${Math.round(viewsPerSub)})`, score: 20, max: 40, status: 'warning' });
    } else {
      score += 10;
      breakdown.push({ label: `Views/Subscriber (${Math.round(viewsPerSub)})`, score: 10, max: 40, status: 'poor' });
    }
  } else if (viewsPerSub < 50) {
    score += 40;
    breakdown.push({ label: `Views/Subscriber (${Math.round(viewsPerSub)})`, score: 40, max: 40, status: 'good' });
  } else if (viewsPerSub < 150) {
    score += 35;
    breakdown.push({ label: `Views/Subscriber (${Math.round(viewsPerSub)})`, score: 35, max: 40, status: 'good' });
  } else if (viewsPerSub < 300) {
    score += 30;
    breakdown.push({ label: `Views/Subscriber (${Math.round(viewsPerSub)})`, score: 30, max: 40, status: 'good' });
  } else if (viewsPerSub < 600) {
    score += 20;
    breakdown.push({ label: `Views/Subscriber (${Math.round(viewsPerSub)})`, score: 20, max: 40, status: 'warning' });
  } else {
    score += 10;
    breakdown.push({ label: `Views/Subscriber (${Math.round(viewsPerSub)})`, score: 10, max: 40, status: 'poor' });
  }

  if (topVideos.length > 0) {
    const avgEngagement = topVideos.reduce((sum, video) => {
      return sum + (video.likeCount + video.commentCount) / Math.max(1, video.viewCount);
    }, 0) / topVideos.length;
    const engagementRate = (avgEngagement * 100).toFixed(1);

    if (avgEngagement > 0.05) {
      score += 30;
      breakdown.push({ label: `Engagement Rate (${engagementRate}%)`, score: 30, max: 30, status: 'good' });
    } else if (avgEngagement > 0.03) {
      score += 20;
      breakdown.push({ label: `Engagement Rate (${engagementRate}%)`, score: 20, max: 30, status: 'warning' });
    } else if (avgEngagement > 0.01) {
      score += 10;
      breakdown.push({ label: `Engagement Rate (${engagementRate}%)`, score: 10, max: 30, status: 'warning' });
    } else {
      score += 5;
      breakdown.push({ label: `Engagement Rate (${engagementRate}%)`, score: 5, max: 30, status: 'poor' });
    }
  } else {
    breakdown.push({ label: 'Engagement Rate', score: 0, max: 30, status: 'poor' });
  }

  const avgViewsPerVideo = viewCount / Math.max(1, videoCount);
  const avgViewsFormatted = avgViewsPerVideo >= 1000 ? `${(avgViewsPerVideo / 1000).toFixed(1)}K` : Math.round(avgViewsPerVideo).toString();

  if (avgViewsPerVideo > 100000) {
    score += 30;
    breakdown.push({ label: `Avg Views/Video (${avgViewsFormatted})`, score: 30, max: 30, status: 'good' });
  } else if (avgViewsPerVideo > 10000) {
    score += 20;
    breakdown.push({ label: `Avg Views/Video (${avgViewsFormatted})`, score: 20, max: 30, status: 'good' });
  } else if (avgViewsPerVideo > 1000) {
    score += 10;
    breakdown.push({ label: `Avg Views/Video (${avgViewsFormatted})`, score: 10, max: 30, status: 'warning' });
  } else {
    score += 5;
    breakdown.push({ label: `Avg Views/Video (${avgViewsFormatted})`, score: 5, max: 30, status: 'poor' });
  }

  return { score: Math.min(100, score), breakdown };
}

function calculateConsistencyScore(videoCount: number, recentVideoCount: number, differenceInWeeks: number) {
  const breakdown: any[] = [];
  let score = 0;
  const videosPerWeek = recentVideoCount / 26;

  if (videosPerWeek >= 1) {
    score += 40;
    breakdown.push({ label: `Upload Freq (${videosPerWeek.toFixed(1)}/week)`, score: 40, max: 40, status: 'good' });
  } else if (videosPerWeek >= 0.5) {
    score += 25;
    breakdown.push({ label: `Upload Freq (${videosPerWeek.toFixed(1)}/week)`, score: 25, max: 40, status: 'warning' });
  } else {
    score += 10;
    breakdown.push({ label: `Upload Freq (${videosPerWeek.toFixed(1)}/week)`, score: 10, max: 40, status: 'poor' });
  }

  if (differenceInWeeks <= 1) {
    score += 30;
    breakdown.push({ label: 'Last Upload (This week)', score: 30, max: 30, status: 'good' });
  } else if (differenceInWeeks <= 2) {
    score += 20;
    breakdown.push({ label: `Last Upload (${differenceInWeeks} weeks ago)`, score: 20, max: 30, status: 'warning' });
  } else if (differenceInWeeks <= 4) {
    score += 10;
    breakdown.push({ label: `Last Upload (${differenceInWeeks} weeks ago)`, score: 10, max: 30, status: 'warning' });
  } else {
    score += 5;
    breakdown.push({ label: differenceInWeeks === 999 ? 'Last Upload (none found)' : `Last Upload (${differenceInWeeks} weeks ago)`, score: 5, max: 30, status: 'poor' });
  }

  if (videoCount > 100) {
    score += 30;
    breakdown.push({ label: `Total Videos (${videoCount})`, score: 30, max: 30, status: 'good' });
  } else if (videoCount > 50) {
    score += 20;
    breakdown.push({ label: `Total Videos (${videoCount})`, score: 20, max: 30, status: 'good' });
  } else if (videoCount > 20) {
    score += 10;
    breakdown.push({ label: `Total Videos (${videoCount})`, score: 10, max: 30, status: 'warning' });
  } else {
    score += 5;
    breakdown.push({ label: `Total Videos (${videoCount})`, score: 5, max: 30, status: 'poor' });
  }

  return { score: Math.min(100, score), breakdown };
}

function calculateBrandingScore(channelData: any, channelDescription: string, playlistData: any[]) {
  const breakdown: any[] = [];
  let score = 0;

  if (channelData.brandingSettings?.image?.bannerExternalUrl) {
    score += 30;
    breakdown.push({ label: 'Channel Banner', score: 30, max: 30, status: 'good' });
  } else {
    breakdown.push({ label: 'Channel Banner', score: 0, max: 30, status: 'poor' });
  }

  if (channelData.brandingSettings?.channel?.unsubscribedTrailer) {
    score += 25;
    breakdown.push({ label: 'Channel Trailer', score: 25, max: 25, status: 'good' });
  } else {
    breakdown.push({ label: 'Channel Trailer', score: 0, max: 25, status: 'poor' });
  }

  if (channelData.snippet?.thumbnails?.high) {
    score += 15;
    breakdown.push({ label: 'Profile Picture', score: 15, max: 15, status: 'good' });
  } else {
    breakdown.push({ label: 'Profile Picture', score: 0, max: 15, status: 'poor' });
  }

  if (playlistData.length > 0) {
    score += 15;
    breakdown.push({
      label: `Content Organization (${playlistData.length >= 5 ? '5+' : playlistData.length} playlists)`,
      score: 15,
      max: 15,
      status: 'good'
    });
  } else {
    breakdown.push({ label: 'Content Organization', score: 0, max: 15, status: 'poor' });
  }

  if (channelDescription && channelDescription.length > 100) {
    score += 15;
    breakdown.push({ label: 'About Section', score: 15, max: 15, status: 'good' });
  } else if (channelDescription) {
    score += 8;
    breakdown.push({ label: 'About Section', score: 8, max: 15, status: 'warning' });
  } else {
    breakdown.push({ label: 'About Section', score: 0, max: 15, status: 'poor' });
  }

  return { score: Math.min(100, score), breakdown };
}

function buildPayload(channelData: any, playlistData: any[], channelVideos: any[], analysis: any, sourceVideo: any) {
  const subscriberCount = toInt(channelData.statistics?.subscriberCount);
  const videoCount = toInt(channelData.statistics?.videoCount);
  const viewCount = toInt(channelData.statistics?.viewCount);
  const bannerUrl = channelData.brandingSettings?.image?.bannerExternalUrl || '';

  return {
    generatedAt: new Date().toISOString(),
    sourceVideo: sourceVideo ? {
      id: sourceVideo.id,
      title: decodeHtmlEntities(sourceVideo.snippet?.title || ''),
      url: `https://www.youtube.com/watch?v=${sourceVideo.id}`
    } : null,
    channel: {
      id: channelData.id,
      title: decodeHtmlEntities(channelData.snippet?.title || ''),
      descriptionPreview: String(channelData.snippet?.description || '').slice(0, 280),
      thumbnailUrl: getBestThumbnail(channelData.snippet?.thumbnails),
      bannerUrl,
      url: `https://www.youtube.com/channel/${channelData.id}`,
      createdAt: channelData.snippet?.publishedAt || '',
      country: channelData.snippet?.country || '',
      subscriberCount,
      videoCount,
      viewCount
    },
    metrics: {
      totalViews: viewCount,
      totalVideos: videoCount,
      totalSubscribers: subscriberCount,
      averageViewsPerVideo: viewCount / Math.max(1, videoCount),
      viewsPerSubscriber: viewCount / Math.max(1, subscriberCount),
      channelAge: getChannelAge(channelData.snippet?.publishedAt),
      subscriberBenefitLevel: getSubscriberBenefitLevel(subscriberCount),
      madeForKids: Boolean(channelData.status?.madeForKids),
      topicCategories: channelData.topicDetails?.topicCategories || [],
      playlistCount: playlistData.length
    },
    sampleSize: channelVideos.length,
    analysis
  };
}

function parseChannelKeywords(keywords: string): string[] {
  if (!keywords) return [];
  const result: string[] = [];
  const regex = /"([^"]+)"|(\S+)/g;
  let match;

  while ((match = regex.exec(keywords)) !== null) {
    const keyword = (match[1] || match[2]).trim();
    if (keyword) result.push(keyword);
  }

  return result;
}

function checkContentForFlags(content: string): string[] {
  if (!content) return [];
  return flaggableWords.filter((word) => {
    const regex = new RegExp(`\\b${word.toLowerCase()}\\b`, 'i');
    return regex.test(content);
  });
}

function getTopVideos(channelVideos: any[], count: number) {
  return [...channelVideos]
    .sort((left, right) => right.viewCount - left.viewCount)
    .slice(0, count)
    .map((video) => ({
      id: video.id,
      title: video.title,
      thumbnail: video.thumbnail,
      viewCount: video.viewCount,
      likeCount: video.likeCount,
      commentCount: video.commentCount,
      publishedAt: video.publishedAt,
      duration: video.duration,
      tags: video.tags || [],
      description: video.description || '',
      url: `https://www.youtube.com/watch?v=${video.id}`
    }));
}

function getSubscriberBenefitLevel(subscriberCount: number): string {
  if (subscriberCount >= 10000000) return 'Diamond (10M+)';
  if (subscriberCount >= 1000000) return 'Gold (1M-10M)';
  if (subscriberCount >= 100000) return 'Silver (100K-1M)';
  return 'Bronze (<100K)';
}

function getChannelAge(createdDate: string): string {
  const created = new Date(createdDate);
  if (Number.isNaN(created.getTime())) return 'Unknown';

  const diffDays = Math.ceil(Math.abs(Date.now() - created.getTime()) / 86400000);
  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);

  if (years > 0) {
    return `${years} year${years > 1 ? 's' : ''}, ${months} month${months === 1 ? '' : 's'}`;
  }

  return `${months} month${months === 1 ? '' : 's'}`;
}

function getBestThumbnail(thumbnails: any): string {
  return thumbnails?.maxres?.url ||
    thumbnails?.standard?.url ||
    thumbnails?.high?.url ||
    thumbnails?.medium?.url ||
    thumbnails?.default?.url ||
    '';
}

function parseDuration(duration: string): number {
  const match = String(duration || '').match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  return toInt(match[1]) * 3600 + toInt(match[2]) * 60 + toInt(match[3]);
}

function toInt(value: any): number {
  const numberValue = parseInt(String(value ?? '0'), 10);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function decodeHtmlEntities(text: string): string {
  const namedEntities: Record<string, string> = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    nbsp: ' ',
    quot: '"'
  };

  return String(text || '').replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (_match, entity) => {
    const lower = String(entity).toLowerCase();

    if (lower[0] === '#') {
      const isHex = lower[1] === 'x';
      const codePoint = parseInt(lower.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : _match;
    }

    return namedEntities[lower] || _match;
  });
}

async function safeJson(response: any) {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
}

const handler = async (req: any, res: any) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, x-youtool-client');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });

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

    if (!userId) {
      return res.status(401).json({ error: 'unauthorized' });
    }

    const { channelId, sourceVideo } = await resolveChannelId(req);

    if (!CHANNEL_ID_PATTERN.test(channelId)) {
      return res.status(400).json({ error: 'invalid_channel' });
    }

    const channel = await fetchChannelData(channelId);
    const uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsPlaylistId) {
      throw createHttpError(404, 'Could not find channel uploads playlist.');
    }

    const [playlistData, channelVideos] = await Promise.all([
      fetchPlaylistData(channelId),
      fetchChannelVideos(uploadsPlaylistId)
    ]);

    if (!channelVideos.length) {
      throw createHttpError(404, 'No videos found for this channel.');
    }

    const analysis = analyzeChannelData(channel, playlistData, channelVideos);
    return res.status(200).json(buildPayload(channel, playlistData, channelVideos, analysis, sourceVideo));
  } catch (err: any) {
    const status = Number(err?.status || 500);
    const safeStatus = status >= 400 && status < 600 ? status : 500;
    return res.status(safeStatus).json({
      error: safeStatus >= 500 ? 'channel_analysis_failed' : err?.message || 'channel_analysis_failed',
      message: err?.message || 'Could not analyze this channel.'
    });
  }
};

module.exports = handler;
