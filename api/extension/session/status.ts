// @ts-nocheck
const { createClient } = require('@supabase/supabase-js');
const { createHash } = require('crypto');
const {
  checkExtensionToolAccess,
  consumeExtensionToolUse,
  getExtensionEntitlement,
  getWeeklyExtensionUsage,
  normalizeToolKey,
} = require('../../../lib/extension-entitlements');

const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';
const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const COMMENT_MAX_RESULTS = 100;
const COMMENT_DEFAULT_LIMIT = 100;
const COMMENT_LIMIT_MAX = 500;

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

async function readExtensionSession(supabase: any, userId: string) {
  const { data: session } = await supabase
    .from('extension_sessions')
    .select('last_used_at')
    .eq('user_id', userId)
    .is('revoked_at', null)
    .order('last_used_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return session || null;
}

async function readYouTubeConnection(supabase: any, userId: string) {
  const { data: connection } = await supabase
    .from('youtube_connections')
    .select('channel_id, channel_title, channel_thumbnail_url, connected_at')
    .eq('user_id', userId)
    .is('disconnected_at', null)
    .maybeSingle();

  return connection || null;
}

function createHttpError(status: number, message: string) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function getYouTubeApiKey(): string {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    throw createHttpError(500, 'YouTube API key is not configured.');
  }

  return apiKey;
}

function normalizeCommentOptions(body: any) {
  const rawLimit = Number(body?.maxComments || body?.limit || COMMENT_DEFAULT_LIMIT);
  const maxComments = Math.min(COMMENT_LIMIT_MAX, Math.max(1, Number.isFinite(rawLimit) ? Math.floor(rawLimit) : COMMENT_DEFAULT_LIMIT));
  const sortBy = String(body?.sortBy || 'relevance') === 'time' ? 'time' : 'relevance';

  return {
    includeReplies: body?.includeReplies !== false,
    maxComments,
    sortBy,
  };
}

async function fetchYouTube(path: string, params: Record<string, string | number | undefined>) {
  const url = new URL(`${YOUTUBE_API_BASE_URL}${path}`);
  Object.entries({ ...params, key: getYouTubeApiKey() }).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url.toString());
  const payload = await safeJson(response);

  if (!response.ok) {
    const message = payload?.error?.message || `YouTube request failed with ${response.status}.`;
    const reason = String(payload?.error?.errors?.[0]?.reason || '');
    const isQuota = /quota|dailyLimit|rateLimit/i.test(reason) || /quota|daily limit|rate limit/i.test(message);
    throw createHttpError(isQuota ? 429 : response.status, isQuota ? 'Comment Downloader is on cooldown. Try again later.' : message);
  }

  return payload || {};
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

  return String(text || '')
    .replace(/<a[^>]*>(.*?)<\/a>/gi, '$1')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (_match, entity) => {
      const lower = String(entity).toLowerCase();

      if (lower[0] === '#') {
        const isHex = lower[1] === 'x';
        const codePoint = parseInt(lower.slice(isHex ? 2 : 1), isHex ? 16 : 10);
        return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : _match;
      }

      return namedEntities[lower] || _match;
    })
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .trim();
}

async function fetchVideoSummary(videoId: string) {
  const data = await fetchYouTube('/videos', {
    part: 'snippet,statistics',
    id: videoId,
  });
  const video = data.items?.[0];

  if (!video) {
    throw createHttpError(404, 'Video not found.');
  }

  return {
    id: video.id,
    title: decodeHtmlEntities(video.snippet?.title || 'YouTube video'),
    channelTitle: decodeHtmlEntities(video.snippet?.channelTitle || ''),
    channelId: video.snippet?.channelId || '',
    publishedAt: video.snippet?.publishedAt || '',
    commentCount: Number(video.statistics?.commentCount || 0),
    url: `https://www.youtube.com/watch?v=${video.id}`,
    thumbnailUrl:
      video.snippet?.thumbnails?.maxres?.url ||
      video.snippet?.thumbnails?.standard?.url ||
      video.snippet?.thumbnails?.high?.url ||
      video.snippet?.thumbnails?.medium?.url ||
      video.snippet?.thumbnails?.default?.url ||
      '',
  };
}

function normalizeReply(reply: any) {
  const snippet = reply?.snippet || {};
  return {
    id: reply?.id || '',
    text: decodeHtmlEntities(snippet.textDisplay || snippet.textOriginal || ''),
    author: decodeHtmlEntities(snippet.authorDisplayName || ''),
    publishedAt: snippet.publishedAt || '',
    likeCount: Number(snippet.likeCount || 0),
  };
}

function normalizeCommentThread(item: any, includeReplies: boolean) {
  const topLevel = item?.snippet?.topLevelComment;
  const topSnippet = topLevel?.snippet || {};
  const replies = includeReplies && Array.isArray(item?.replies?.comments)
    ? item.replies.comments.map(normalizeReply).filter((reply: any) => reply.id && reply.text)
    : [];

  return {
    id: item?.id || topLevel?.id || '',
    text: decodeHtmlEntities(topSnippet.textDisplay || topSnippet.textOriginal || ''),
    author: decodeHtmlEntities(topSnippet.authorDisplayName || ''),
    publishedAt: topSnippet.publishedAt || '',
    likeCount: Number(topSnippet.likeCount || 0),
    replyCount: Number(item?.snippet?.totalReplyCount || replies.length || 0),
    replies,
  };
}

async function fetchVideoComments(videoId: string, options: any) {
  const comments = [];
  let pageToken = '';
  const maxPages = Math.ceil(options.maxComments / COMMENT_MAX_RESULTS);

  for (let page = 0; page < maxPages; page += 1) {
    const data = await fetchYouTube('/commentThreads', {
      part: 'snippet,replies',
      videoId,
      maxResults: COMMENT_MAX_RESULTS,
      pageToken,
      order: options.sortBy,
      textFormat: 'html',
    });

    (data.items || []).forEach((item: any) => {
      if (comments.length >= options.maxComments) return;
      const comment = normalizeCommentThread(item, options.includeReplies);
      if (comment.id && comment.text) comments.push(comment);
    });

    if (!data.nextPageToken || comments.length >= options.maxComments) {
      break;
    }

    pageToken = data.nextPageToken;
  }

  return comments;
}

function buildCommentSummary(comments: any[]) {
  const replies = comments.reduce((sum, comment) => sum + Number(comment.replies?.length || 0), 0);
  const likes = comments.reduce((sum, comment) => sum + Number(comment.likeCount || 0), 0);
  const topComment = [...comments].sort((left, right) => Number(right.likeCount || 0) - Number(left.likeCount || 0))[0] || null;

  return {
    totalComments: comments.length,
    totalReplies: replies,
    totalLikes: likes,
    topComment: topComment
      ? {
          author: topComment.author,
          text: topComment.text,
          likeCount: topComment.likeCount,
        }
      : null,
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, x-youtool-client');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end();

  try {
    const supabase = createClient(
      process.env.REACT_APP_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const authHeader: string | undefined = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'unauthorized' });
    }

    const accessToken = authHeader.slice(7);
    const userId = await resolveUserId(supabase, accessToken);
    if (!userId) return res.status(401).json({ error: 'unauthorized' });

    if (req.method === 'POST') {
      const action = String(req.body?.action || 'consume_tool_use');

      if (action === 'download_comments') {
        const videoId = String(req.body?.videoId || '').trim();
        if (!VIDEO_ID_PATTERN.test(videoId)) {
          return res.status(400).json({ error: 'invalid_video_id' });
        }

        const access = await checkExtensionToolAccess(supabase, userId);
        if (!access.allowed) {
          return res.status(access.status || 402).json(access);
        }

        const options = normalizeCommentOptions(req.body);
        const [video, comments] = await Promise.all([
          fetchVideoSummary(videoId),
          fetchVideoComments(videoId, options),
        ]);
        const usageResult = await consumeExtensionToolUse(supabase, {
          userId,
          toolKey: 'comment_download',
          metadata: {
            videoId,
            commentCount: comments.length,
            maxComments: options.maxComments,
          },
        });

        return res.status(200).json({
          allowed: true,
          video,
          comments,
          summary: buildCommentSummary(comments),
          options,
          entitlement: usageResult.entitlement,
          usage: usageResult.usage,
        });
      }

      const toolKey = normalizeToolKey(req.body?.toolKey);

      if (action !== 'consume_tool_use') {
        return res.status(400).json({ error: 'invalid_action' });
      }

      if (!toolKey) {
        return res.status(400).json({ error: 'invalid_tool_key' });
      }

      const result = await consumeExtensionToolUse(supabase, {
        userId,
        toolKey,
        metadata: req.body?.metadata || {},
      });

      return res.status(result.allowed ? 200 : result.status || 402).json(result);
    }

    const [session, youtubeConnection, entitlement] = await Promise.all([
      readExtensionSession(supabase, userId),
      readYouTubeConnection(supabase, userId),
      getExtensionEntitlement(supabase, userId),
    ]);
    const usage = await getWeeklyExtensionUsage(supabase, userId, entitlement);

    return res.status(200).json({
      connected: !!session,
      extensionConnected: !!session,
      youtubeConnected: !!youtubeConnection,
      last_used_at: session?.last_used_at ?? null,
      youtubeConnection: youtubeConnection
        ? {
            channelId: youtubeConnection.channel_id,
            channelTitle: youtubeConnection.channel_title,
            channelThumbnail: youtubeConnection.channel_thumbnail_url,
            connectedAt: youtubeConnection.connected_at,
          }
        : null,
      entitlement,
      usage,
    });
  } catch (err: any) {
    return res.status(500).json({ error: `Unexpected error: ${err?.message ?? String(err)}` });
  }
};

module.exports = handler;
