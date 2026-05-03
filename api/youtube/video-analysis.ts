// @ts-nocheck
const { createClient } = require('@supabase/supabase-js');
const { createHash } = require('crypto');

const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';
const MAX_CHANNEL_VIDEOS = 50;
const AUTH_HEADER_PREFIX = 'Bearer ';

function getSingleQueryValue(value: any): string {
  const rawValue = Array.isArray(value) ? value[0] : value;
  return String(rawValue || '').trim();
}

function resolveVideoId(value: any): string | null {
  const rawValue = getSingleQueryValue(value);

  if (VIDEO_ID_PATTERN.test(rawValue)) {
    return rawValue;
  }

  try {
    const url = new URL(rawValue);
    const watchId = url.searchParams.get('v');
    const pathMatch = url.pathname.match(/\/(?:shorts|embed|live)\/([A-Za-z0-9_-]{11})/);
    const shortMatch = url.hostname === 'youtu.be' ? url.pathname.match(/^\/([A-Za-z0-9_-]{11})/) : null;
    const candidate = watchId || pathMatch?.[1] || shortMatch?.[1] || '';
    return VIDEO_ID_PATTERN.test(candidate) ? candidate : null;
  } catch (error) {
    return null;
  }
}

function getYouTubeApiKey(): string {
  const apiKey = process.env.YOUTUBE_API_KEY || process.env.REACT_APP_YOUTUBE_API_KEY_4;

  if (!apiKey) {
    throw createHttpError(500, 'YouTube API key is not configured.');
  }

  return apiKey;
}

function createHttpError(status: number, message: string) {
  const error = new Error(message);
  error.status = status;
  return error;
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

async function fetchYouTube(path: string, params: Record<string, string | number>, apiKey: string, fallbackMessage: string) {
  const url = new URL(`${YOUTUBE_API_BASE_URL}${path}`);
  Object.entries({ ...params, key: apiKey }).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });

  const response = await fetch(url.toString());
  const payload = await safeJson(response);

  if (!response.ok) {
    const apiMessage = payload?.error?.message || fallbackMessage;
    const isQuota = /quota/i.test(apiMessage) || payload?.error?.errors?.some?.((entry: any) => /quota/i.test(entry?.reason || ''));
    throw createHttpError(isQuota ? 429 : response.status, isQuota ? 'YouTube API quota reached. Try again later.' : apiMessage);
  }

  return payload;
}

async function fetchVideoData(videoId: string, apiKey: string) {
  const data = await fetchYouTube(
    '/videos',
    {
      part: 'snippet,contentDetails,statistics,status',
      id: videoId
    },
    apiKey,
    'Failed to fetch video data.'
  );

  if (!data.items?.[0]) {
    throw createHttpError(404, 'Video not found.');
  }

  return data.items[0];
}

async function fetchChannelData(channelId: string, apiKey: string) {
  const data = await fetchYouTube(
    '/channels',
    {
      part: 'snippet,statistics,contentDetails',
      id: channelId
    },
    apiKey,
    'Failed to fetch channel data.'
  );

  if (!data.items?.[0]) {
    throw createHttpError(404, 'Channel not found.');
  }

  return data.items[0];
}

async function fetchChannelVideos(channelId: string, apiKey: string, maxResults = MAX_CHANNEL_VIDEOS) {
  try {
    const channelData = await fetchYouTube(
      '/channels',
      {
        part: 'contentDetails',
        id: channelId
      },
      apiKey,
      'Failed to fetch channel uploads playlist.'
    );
    const uploadsPlaylistId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsPlaylistId) {
      return [];
    }

    const playlistData = await fetchYouTube(
      '/playlistItems',
      {
        part: 'snippet',
        playlistId: uploadsPlaylistId,
        maxResults
      },
      apiKey,
      'Failed to fetch channel uploads.'
    );
    const videoIds = (playlistData.items || [])
      .map((item: any) => item?.snippet?.resourceId?.videoId)
      .filter((id: string) => VIDEO_ID_PATTERN.test(String(id || '')))
      .join(',');

    if (!videoIds) {
      return [];
    }

    const videosData = await fetchYouTube(
      '/videos',
      {
        part: 'statistics,snippet,contentDetails',
        id: videoIds
      },
      apiKey,
      'Failed to fetch channel video statistics.'
    );

    return (videosData.items || []).map((video: any) => ({
      id: video.id,
      title: decodeHtmlEntities(video.snippet?.title || ''),
      publishedAt: video.snippet?.publishedAt || '',
      viewCount: toInt(video.statistics?.viewCount),
      likeCount: toInt(video.statistics?.likeCount),
      commentCount: toInt(video.statistics?.commentCount),
      thumbnails: video.snippet?.thumbnails || {},
      duration: parseDuration(video.contentDetails?.duration || '')
    }));
  } catch (error) {
    console.warn('YouTool video analysis channel video fetch failed:', error);
    return [];
  }
}

async function fetchCategoryName(categoryId: string, apiKey: string): Promise<string> {
  if (!categoryId) return 'Unknown';

  try {
    const data = await fetchYouTube(
      '/videoCategories',
      {
        part: 'snippet',
        id: categoryId
      },
      apiKey,
      'Failed to fetch category name.'
    );
    return data.items?.[0]?.snippet?.title || 'Unknown';
  } catch (error) {
    return 'Unknown';
  }
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

function parseDuration(duration: string): number {
  const match = String(duration || '').match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  return toInt(match[1]) * 3600 + toInt(match[2]) * 60 + toInt(match[3]);
}

function formatDuration(seconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

function toInt(value: any): number {
  const numberValue = parseInt(String(value ?? '0'), 10);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function diffDaysFromNow(dateValue: string): number {
  const timestamp = new Date(dateValue).getTime();
  if (!Number.isFinite(timestamp)) return 0;
  return Math.floor((Date.now() - timestamp) / 86400000);
}

function formatDate(dateValue: string): string {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

function formatUtcDateTime(dateValue: string): string {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC');
}

function formatDayOfWeek(dateValue: string): string {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
}

function formatTimeOfDay(dateValue: string): string {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toISOString().slice(11, 16);
}

function analyzeContent(videoData: any) {
  const description = videoData.snippet?.description || '';
  const title = videoData.snippet?.title || '';
  const words = (value: string) => String(value || '').trim().split(/\s+/).filter(Boolean);
  const links = description.match(/https?:\/\/[^\s]+/g) || [];

  return {
    titleLength: title.length,
    titleWordCount: words(title).length,
    descriptionLength: description.length,
    descriptionWordCount: words(description).length,
    descriptionHasLinks: links.length > 0,
    descriptionLinkCount: links.length,
    hashtags: description.match(/#[\w]+/g) || [],
    tags: videoData.snippet?.tags || [],
    tagCount: (videoData.snippet?.tags || []).length
  };
}

function calculateScores(videoData: any, contentAnalysis: any) {
  let seoScore = 0;
  let titleScore = 0;
  let titleReason = '';
  let descriptionScore = 0;
  let descriptionReason = '';
  let tagsScore = 0;
  let tagsReason = '';
  let hashtagsScore = 0;
  let hashtagsReason = '';
  let linksScore = 0;
  let linksReason = '';

  if (contentAnalysis.titleLength >= 35 && contentAnalysis.titleLength <= 65) {
    titleScore = 35;
    titleReason = `Perfect length (${contentAnalysis.titleLength} chars) - maximizes visibility`;
  } else if (contentAnalysis.titleLength >= 25 && contentAnalysis.titleLength <= 70) {
    titleScore = 25;
    titleReason = `Good length (${contentAnalysis.titleLength} chars) - could be optimized`;
  } else if (contentAnalysis.titleLength >= 15 && contentAnalysis.titleLength <= 80) {
    titleScore = 15;
    titleReason = `Acceptable length (${contentAnalysis.titleLength} chars) - room for improvement`;
  } else {
    titleScore = 5;
    titleReason = `Poor length (${contentAnalysis.titleLength} chars) - too short or too long`;
  }
  seoScore += titleScore;

  if (contentAnalysis.descriptionLength >= 250) {
    descriptionScore = 30;
    descriptionReason = `Comprehensive (${contentAnalysis.descriptionLength} chars) - excellent SEO`;
  } else if (contentAnalysis.descriptionLength >= 150) {
    descriptionScore = 20;
    descriptionReason = `Good length (${contentAnalysis.descriptionLength} chars) - add more detail`;
  } else if (contentAnalysis.descriptionLength >= 100) {
    descriptionScore = 10;
    descriptionReason = `Minimal (${contentAnalysis.descriptionLength} chars) - needs expansion`;
  } else {
    descriptionScore = 2;
    descriptionReason = `Very short (${contentAnalysis.descriptionLength} chars) - critical issue`;
  }
  seoScore += descriptionScore;

  if (contentAnalysis.tagCount >= 15) {
    tagsScore = 20;
    tagsReason = `Excellent (${contentAnalysis.tagCount} tags) - full coverage`;
  } else if (contentAnalysis.tagCount >= 10) {
    tagsScore = 15;
    tagsReason = `Good (${contentAnalysis.tagCount} tags) - add a few more`;
  } else if (contentAnalysis.tagCount >= 5) {
    tagsScore = 10;
    tagsReason = `Adequate (${contentAnalysis.tagCount} tags) - needs more variety`;
  } else if (contentAnalysis.tagCount >= 1) {
    tagsScore = 5;
    tagsReason = `Minimal (${contentAnalysis.tagCount} tags) - limited discoverability`;
  } else {
    tagsScore = 0;
    tagsReason = 'No tags - missing discoverability';
  }
  seoScore += tagsScore;

  if (contentAnalysis.hashtags.length >= 3 && contentAnalysis.hashtags.length <= 15) {
    hashtagsScore = 8;
    hashtagsReason = `Optimal (${contentAnalysis.hashtags.length} hashtags) - good balance`;
  } else if (contentAnalysis.hashtags.length >= 1) {
    hashtagsScore = 4;
    hashtagsReason = `Some usage (${contentAnalysis.hashtags.length} hashtags) - add more`;
  } else {
    hashtagsScore = 0;
    hashtagsReason = 'No hashtags - missing trending potential';
  }
  seoScore += hashtagsScore;

  if (contentAnalysis.descriptionLinkCount >= 1 && contentAnalysis.descriptionLinkCount <= 5) {
    linksScore = 7;
    linksReason = `Good usage (${contentAnalysis.descriptionLinkCount} links) - well balanced`;
  } else if (contentAnalysis.descriptionLinkCount > 5) {
    linksScore = 3;
    linksReason = `Too many (${contentAnalysis.descriptionLinkCount} links) - may appear spammy`;
  } else {
    linksScore = 0;
    linksReason = 'No links - missing traffic opportunities';
  }
  seoScore += linksScore;

  const views = toInt(videoData.statistics?.viewCount);
  const likes = toInt(videoData.statistics?.likeCount);
  const comments = toInt(videoData.statistics?.commentCount);
  const engagementRate = views > 0 ? ((likes + comments) / views) * 100 : 0;
  const likeRatio = views > 0 ? (likes / views) * 100 : 0;
  const commentRatio = views > 0 ? (comments / views) * 100 : 0;

  let engagementScore = 0;
  let rateScore = 0;
  let rateReason = '';
  let likeRatioScore = 0;
  let likeRatioReason = '';
  let commentRatioScore = 0;
  let commentRatioReason = '';

  if (engagementRate >= 8) {
    rateScore = 40;
    rateReason = `Viral (${engagementRate.toFixed(2)}%) - exceptional performance`;
  } else if (engagementRate >= 6) {
    rateScore = 36;
    rateReason = `Excellent (${engagementRate.toFixed(2)}%) - well above average`;
  } else if (engagementRate >= 4) {
    rateScore = 32;
    rateReason = `Very good (${engagementRate.toFixed(2)}%) - strong engagement`;
  } else if (engagementRate >= 3) {
    rateScore = 28;
    rateReason = `Good (${engagementRate.toFixed(2)}%) - above average`;
  } else if (engagementRate >= 2) {
    rateScore = 24;
    rateReason = `Average (${engagementRate.toFixed(2)}%) - typical performance`;
  } else if (engagementRate >= 1.5) {
    rateScore = 20;
    rateReason = `Below average (${engagementRate.toFixed(2)}%) - needs improvement`;
  } else if (engagementRate >= 1) {
    rateScore = 16;
    rateReason = `Low (${engagementRate.toFixed(2)}%) - action needed`;
  } else if (engagementRate >= 0.5) {
    rateScore = 10;
    rateReason = `Poor (${engagementRate.toFixed(2)}%) - critical issue`;
  } else {
    rateScore = 4;
    rateReason = `Very poor (${engagementRate.toFixed(2)}%) - urgent attention required`;
  }
  engagementScore += rateScore;

  if (likeRatio >= 4) {
    likeRatioScore = 30;
    likeRatioReason = `Exceptional (${likeRatio.toFixed(2)}%) - highly valued content`;
  } else if (likeRatio >= 2) {
    likeRatioScore = 25;
    likeRatioReason = `Excellent (${likeRatio.toFixed(2)}%) - strong approval`;
  } else if (likeRatio >= 1) {
    likeRatioScore = 20;
    likeRatioReason = `Good (${likeRatio.toFixed(2)}%) - positive reception`;
  } else if (likeRatio >= 0.5) {
    likeRatioScore = 15;
    likeRatioReason = `Average (${likeRatio.toFixed(2)}%) - moderate approval`;
  } else if (likeRatio >= 0.2) {
    likeRatioScore = 10;
    likeRatioReason = `Low (${likeRatio.toFixed(2)}%) - needs improvement`;
  } else {
    likeRatioScore = 5;
    likeRatioReason = `Poor (${likeRatio.toFixed(2)}%) - content mismatch likely`;
  }
  engagementScore += likeRatioScore;

  if (commentRatio >= 0.5) {
    commentRatioScore = 30;
    commentRatioReason = `Exceptional (${commentRatio.toFixed(3)}%) - very interactive`;
  } else if (commentRatio >= 0.3) {
    commentRatioScore = 25;
    commentRatioReason = `Excellent (${commentRatio.toFixed(3)}%) - strong discussion`;
  } else if (commentRatio >= 0.15) {
    commentRatioScore = 20;
    commentRatioReason = `Good (${commentRatio.toFixed(3)}%) - healthy interaction`;
  } else if (commentRatio >= 0.08) {
    commentRatioScore = 15;
    commentRatioReason = `Average (${commentRatio.toFixed(3)}%) - moderate discussion`;
  } else if (commentRatio >= 0.03) {
    commentRatioScore = 10;
    commentRatioReason = `Low (${commentRatio.toFixed(3)}%) - encourage more comments`;
  } else {
    commentRatioScore = 5;
    commentRatioReason = `Poor (${commentRatio.toFixed(3)}%) - add CTAs for comments`;
  }
  engagementScore += commentRatioScore;

  const optimizationScore = Math.round((seoScore * 0.4) + (engagementScore * 0.6));

  return {
    seoScore: Math.min(100, Math.round(seoScore)),
    engagementScore: Math.min(100, Math.round(engagementScore)),
    optimizationScore: Math.min(100, optimizationScore),
    scoreBreakdown: {
      seo: {
        title: { score: titleScore, max: 35, reason: titleReason },
        description: { score: descriptionScore, max: 30, reason: descriptionReason },
        tags: { score: tagsScore, max: 20, reason: tagsReason },
        hashtags: { score: hashtagsScore, max: 8, reason: hashtagsReason },
        links: { score: linksScore, max: 7, reason: linksReason }
      },
      engagement: {
        rate: { score: rateScore, max: 40, reason: rateReason },
        likeRatio: { score: likeRatioScore, max: 30, reason: likeRatioReason },
        commentRatio: { score: commentRatioScore, max: 30, reason: commentRatioReason }
      }
    }
  };
}

function generateInsights(videoData: any, contentAnalysis: any, scores: any, channelMetrics: any) {
  const strengths: string[] = [];
  const improvements: string[] = [];
  const recommendations: string[] = [];
  const views = toInt(videoData.statistics?.viewCount);
  const likes = toInt(videoData.statistics?.likeCount);
  const comments = toInt(videoData.statistics?.commentCount);
  const duration = parseDuration(videoData.contentDetails?.duration || '');
  const engagementRate = views > 0 ? ((likes + comments) / views) * 100 : 0;

  if (scores.engagementScore > 60) {
    strengths.push(`Strong engagement at ${engagementRate.toFixed(2)}% - meaningfully above common YouTube benchmarks`);
  } else if (scores.engagementScore > 40) {
    strengths.push(`Healthy engagement at ${engagementRate.toFixed(2)}% - enough signal to build from`);
  }

  if (contentAnalysis.titleLength >= 35 && contentAnalysis.titleLength <= 65) {
    strengths.push(`Title length is dialed in at ${contentAnalysis.titleLength} characters`);
  }

  if (contentAnalysis.tagCount >= 10) {
    strengths.push(`${contentAnalysis.tagCount} tags gives the video solid keyword coverage`);
  }

  if (contentAnalysis.descriptionLength >= 250) {
    strengths.push(`Description depth is strong at ${contentAnalysis.descriptionLength} characters`);
  }

  if (channelMetrics.viewsComparison === 'above') {
    const percentBetter = Math.round((channelMetrics.currentViewsPerDay / Math.max(channelMetrics.avgViewsPerDayComparison, 1)) * 100 - 100);
    strengths.push(`View velocity is ${percentBetter}% faster than comparable recent uploads`);
  }

  if (engagementRate < 2) {
    improvements.push(`Engagement is only ${engagementRate.toFixed(2)}% - likes and comments are not keeping up with views`);
    recommendations.push('Add a specific comment prompt and pin a question that is easy to answer.');
  } else if (engagementRate < 4) {
    improvements.push(`Engagement at ${engagementRate.toFixed(2)}% is below the stronger 4-6% range`);
    recommendations.push('Test a clearer like/comment CTA around the opening hook and the final takeaway.');
  }

  if (contentAnalysis.titleLength < 35) {
    improvements.push(`Title is short at ${contentAnalysis.titleLength} characters`);
    recommendations.push('Add a stronger keyword, outcome, year, or tension point to make the title more searchable.');
  } else if (contentAnalysis.titleLength > 65) {
    improvements.push(`Title is long at ${contentAnalysis.titleLength} characters and may truncate`);
    recommendations.push('Move lower-priority context from the title into the description.');
  }

  if (contentAnalysis.tagCount < 5) {
    improvements.push(`Only ${contentAnalysis.tagCount} tags are used`);
    recommendations.push('Add broad, niche, and long-tail tag variations that mirror the title and description.');
  } else if (contentAnalysis.tagCount < 10) {
    improvements.push(`Tag coverage is light with ${contentAnalysis.tagCount} tags`);
    recommendations.push('Add a few more specific long-tail tags for search discovery.');
  }

  if (contentAnalysis.descriptionLength < 125) {
    improvements.push(`Description is very short at ${contentAnalysis.descriptionLength} characters`);
    recommendations.push('Expand the first 125 characters with the core keyword, promise, and useful context.');
  } else if (contentAnalysis.descriptionLength < 200) {
    improvements.push(`Description could carry more SEO context`);
    recommendations.push('Add timestamps, related links, and a concise recap of the video.');
  }

  if (!contentAnalysis.descriptionHasLinks) {
    improvements.push('No links were found in the description');
    recommendations.push('Add relevant links to related videos, socials, products, or the next viewer action.');
  } else if (contentAnalysis.descriptionLinkCount > 5) {
    improvements.push(`${contentAnalysis.descriptionLinkCount} links may feel cluttered`);
    recommendations.push('Keep the description focused on the 3-5 highest-value links.');
  }

  if (contentAnalysis.hashtags.length === 0) {
    improvements.push('No hashtags were found');
    recommendations.push('Add 3 focused hashtags: one branded and two topical.');
  } else if (contentAnalysis.hashtags.length > 15) {
    improvements.push(`${contentAnalysis.hashtags.length} hashtags is too many`);
    recommendations.push('Trim hashtags to the most relevant 3-10.');
  }

  if (duration < 120) {
    improvements.push(`Video length is ${formatDuration(duration)}, which limits watch-time depth`);
    recommendations.push('Consider a longer companion video if the topic deserves more depth.');
  } else if (duration > 1200 && engagementRate < 3) {
    improvements.push(`Long runtime with low engagement suggests retention friction`);
    recommendations.push('Review the intro and mid-video pacing for drop-off points.');
  }

  if (channelMetrics.viewsComparison === 'below') {
    const percentBelow = Math.round((1 - channelMetrics.currentViewsPerDay / Math.max(channelMetrics.avgViewsPerDayComparison, 1)) * 100);
    improvements.push(`View velocity is ${percentBelow}% slower than comparable uploads`);
    recommendations.push('Compare this thumbnail/title package against the channel top performers.');
  }

  if (scores.seoScore < 50 && scores.engagementScore < 50) {
    recommendations.push('Priority: fix title, thumbnail promise, and first-description keywords before deeper tweaks.');
  }

  return {
    strengths: strengths.slice(0, 4),
    improvements: improvements.slice(0, 5),
    recommendations: recommendations.slice(0, 5)
  };
}

async function performAnalysis(videoData: any, channelData: any, channelVideos: any[], apiKey: string) {
  const contentAnalysis = analyzeContent(videoData);
  const durationSeconds = parseDuration(videoData.contentDetails?.duration || '');
  const isShort = durationSeconds < 60;
  const scores = calculateScores(videoData, contentAnalysis);
  const totalVideos = toInt(channelData.statistics?.videoCount);
  const channelAge = Math.max(diffDaysFromNow(channelData.snippet?.publishedAt), 0);
  const currentViews = toInt(videoData.statistics?.viewCount);
  const currentVideoAgeDays = Math.max(diffDaysFromNow(videoData.snippet?.publishedAt), 1);
  const currentViewsPerDay = currentViews / currentVideoAgeDays;
  const avgViewsPerVideo = channelVideos.length > 0
    ? channelVideos.reduce((sum, video) => sum + video.viewCount, 0) / channelVideos.length
    : 0;
  const similarAgeVideos = channelVideos.filter((video) => {
    const videoAge = Math.max(diffDaysFromNow(video.publishedAt), 1);
    return Math.abs(videoAge - currentVideoAgeDays) <= 30 && video.id !== videoData.id;
  });
  const comparisonVideos = similarAgeVideos.length >= 3 ? similarAgeVideos : channelVideos.slice(0, 10);
  const avgViewsPerDayComparison = comparisonVideos.length > 0
    ? comparisonVideos.reduce((sum, video) => {
        const videoAge = Math.max(diffDaysFromNow(video.publishedAt), 1);
        return sum + video.viewCount / videoAge;
      }, 0) / comparisonVideos.length
    : currentViewsPerDay;
  let viewsComparison = 'average';

  if (currentViewsPerDay > avgViewsPerDayComparison * 1.2) {
    viewsComparison = 'above';
  } else if (currentViewsPerDay < avgViewsPerDayComparison * 0.8) {
    viewsComparison = 'below';
  }

  const totalChannelViews = toInt(channelData.statistics?.viewCount);
  const avgLikesPerVideo = channelVideos.length > 0
    ? channelVideos.reduce((sum, video) => sum + video.likeCount, 0) / channelVideos.length
    : 0;
  const avgCommentsPerVideo = channelVideos.length > 0
    ? channelVideos.reduce((sum, video) => sum + video.commentCount, 0) / channelVideos.length
    : 0;
  const recentVideos = channelVideos.slice(0, 5);
  const olderVideos = channelVideos.slice(5, 10);
  const recentEngagement = averageEngagement(recentVideos);
  const olderEngagement = averageEngagement(olderVideos);
  let engagementTrend = 'stable';

  if (recentEngagement > olderEngagement * 1.1) {
    engagementTrend = 'improving';
  } else if (olderEngagement > 0 && recentEngagement < olderEngagement * 0.9) {
    engagementTrend = 'declining';
  }

  const now = Date.now();
  const sixMonthsAgo = now - 183 * 86400000;
  const twelveMonthsAgo = now - 365 * 86400000;
  const recentBestVideos = channelVideos.filter((video) => new Date(video.publishedAt).getTime() > sixMonthsAgo);
  const videosToConsider = recentBestVideos.length > 0
    ? recentBestVideos
    : channelVideos.filter((video) => new Date(video.publishedAt).getTime() > twelveMonthsAgo);
  const finalVideosToConsider = videosToConsider.length > 0 ? videosToConsider : channelVideos.slice(0, 10);
  const bestVideo = finalVideosToConsider.length > 0
    ? finalVideosToConsider.reduce((best, video) => {
        const currentEngagement = (video.likeCount + video.commentCount) / Math.max(video.viewCount, 1);
        const bestEngagement = (best.likeCount + best.commentCount) / Math.max(best.viewCount, 1);
        const currentScore = video.viewCount * (1 + currentEngagement * 100);
        const bestScore = best.viewCount * (1 + bestEngagement * 100);
        return currentScore > bestScore ? video : best;
      }, finalVideosToConsider[0])
    : null;
  const thirtyDaysAgo = now - 30 * 86400000;
  const recentUploads = channelVideos.filter((video) => new Date(video.publishedAt).getTime() > thirtyDaysAgo).length;
  const otherVideos = channelVideos.filter((video) => video.id !== videoData.id);
  const sortedViews = otherVideos.map((video) => video.viewCount).sort((left, right) => left - right);
  const mid = Math.floor(sortedViews.length / 2);
  const channelMedianViews = sortedViews.length > 0
    ? sortedViews.length % 2 !== 0
      ? sortedViews[mid]
      : (sortedViews[mid - 1] + sortedViews[mid]) / 2
    : 0;
  const outlierRatio = channelMedianViews > 0 ? currentViews / channelMedianViews : 0;
  const channelMetrics = {
    channelAge,
    totalVideos,
    avgViewsPerVideo,
    uploadFrequency: totalVideos > 0 && channelAge > 0
      ? `${(totalVideos / Math.max(channelAge / 7, 1)).toFixed(1)} videos/week`
      : 'N/A',
    viewsComparison,
    totalViews: totalChannelViews,
    avgLikesPerVideo,
    avgCommentsPerVideo,
    engagementTrend,
    bestPerformingVideo: bestVideo ? {
      title: bestVideo.title,
      views: bestVideo.viewCount,
      url: `https://youtube.com/watch?v=${bestVideo.id}`,
      publishedAt: bestVideo.publishedAt,
      daysAgo: diffDaysFromNow(bestVideo.publishedAt)
    } : null,
    recentUploadRate: `${recentUploads} videos in last 30 days`,
    subscriberToViewRatio: totalChannelViews / Math.max(toInt(channelData.statistics?.subscriberCount) || 1, 1),
    bestVideoTimeframe: recentBestVideos.length > 0 ? 'last 6 months' : videosToConsider.length > 0 ? 'last 12 months' : 'recent uploads',
    currentViewsPerDay,
    avgViewsPerDayComparison,
    channelMedianViews,
    outlierRatio,
    isOutlier: outlierRatio >= 2,
    isUnderperformer: channelMedianViews > 0 && outlierRatio < 0.5
  };
  const categoryName = await fetchCategoryName(videoData.snippet?.categoryId || '', apiKey);
  const insights = generateInsights(videoData, contentAnalysis, scores, channelMetrics);

  return {
    basicMetrics: {
      views: currentViews,
      likes: toInt(videoData.statistics?.likeCount),
      comments: toInt(videoData.statistics?.commentCount),
      postedDate: formatDate(videoData.snippet?.publishedAt),
      exactPostTime: formatUtcDateTime(videoData.snippet?.publishedAt),
      dayOfWeek: formatDayOfWeek(videoData.snippet?.publishedAt),
      timeOfDay: formatTimeOfDay(videoData.snippet?.publishedAt),
      engagementRate: (toInt(videoData.statistics?.likeCount) + toInt(videoData.statistics?.commentCount)) / Math.max(currentViews, 1),
      likeToViewRatio: toInt(videoData.statistics?.likeCount) / Math.max(currentViews, 1),
      commentToViewRatio: toInt(videoData.statistics?.commentCount) / Math.max(currentViews, 1),
      subscribers: toInt(channelData.statistics?.subscriberCount),
      isShort
    },
    technicalDetails: {
      videoId: videoData.id,
      duration: durationSeconds,
      durationFormatted: formatDuration(durationSeconds),
      definition: videoData.contentDetails?.definition || '',
      caption: videoData.contentDetails?.caption === 'true',
      categoryId: videoData.snippet?.categoryId || '',
      categoryName,
      defaultLanguage: videoData.snippet?.defaultLanguage || ''
    },
    contentAnalysis,
    channelMetrics,
    performanceScores: scores,
    insights
  };
}

function averageEngagement(videos: any[]): number {
  if (!videos.length) return 0;
  return videos.reduce((sum, video) => {
    return sum + (video.likeCount + video.commentCount) / Math.max(video.viewCount, 1);
  }, 0) / videos.length;
}

function getBestThumbnail(thumbnails: any): string {
  return thumbnails?.maxres?.url ||
    thumbnails?.standard?.url ||
    thumbnails?.high?.url ||
    thumbnails?.medium?.url ||
    thumbnails?.default?.url ||
    '';
}

function buildPayload(videoData: any, channelData: any, channelVideos: any[], analysis: any) {
  return {
    generatedAt: new Date().toISOString(),
    video: {
      id: videoData.id,
      title: decodeHtmlEntities(videoData.snippet?.title || ''),
      descriptionPreview: String(videoData.snippet?.description || '').slice(0, 280),
      thumbnailUrl: getBestThumbnail(videoData.snippet?.thumbnails),
      channelId: videoData.snippet?.channelId || '',
      channelTitle: decodeHtmlEntities(videoData.snippet?.channelTitle || ''),
      publishedAt: videoData.snippet?.publishedAt || '',
      url: `https://www.youtube.com/watch?v=${videoData.id}`
    },
    channel: {
      id: channelData.id,
      title: decodeHtmlEntities(channelData.snippet?.title || ''),
      thumbnailUrl: getBestThumbnail(channelData.snippet?.thumbnails),
      subscriberCount: toInt(channelData.statistics?.subscriberCount),
      videoCount: toInt(channelData.statistics?.videoCount),
      viewCount: toInt(channelData.statistics?.viewCount)
    },
    sampleSize: channelVideos.length,
    analysis
  };
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
    const videoId = resolveVideoId(req.query?.videoId || req.query?.url);
    if (!videoId) return res.status(400).json({ error: 'invalid_video_id' });

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

    const apiKey = getYouTubeApiKey();
    const video = await fetchVideoData(videoId, apiKey);
    const channel = await fetchChannelData(video.snippet?.channelId, apiKey);
    const channelVideos = await fetchChannelVideos(video.snippet?.channelId, apiKey);
    const analysis = await performAnalysis(video, channel, channelVideos, apiKey);

    return res.status(200).json(buildPayload(video, channel, channelVideos, analysis));
  } catch (err: any) {
    const status = Number(err?.status || 500);
    const safeStatus = status >= 400 && status < 600 ? status : 500;
    return res.status(safeStatus).json({
      error: safeStatus >= 500 ? 'analysis_failed' : err?.message || 'analysis_failed',
      message: err?.message || 'Could not analyze this video.'
    });
  }
};

module.exports = handler;
