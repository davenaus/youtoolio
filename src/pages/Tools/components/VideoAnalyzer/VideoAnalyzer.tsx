// src/pages/Tools/components/VideoAnalyzer/VideoAnalyzer.tsx - IMPROVED VERSION
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ToolPageWrapper } from '../../../../components/ToolPageWrapper';
import { SEO } from '../../../../components/SEO';
import { GoogleAd } from '../../../../components/GoogleAd';
import { toolsSEO, generateToolSchema } from '../../../../config/toolsSEO';
import * as S from './styles';
import moment from 'moment';
import { trackToolUsage, trackResultsDisplayed, trackError, trackToolPageView, useTimeTracking } from '../../../../utils/googleAnalytics';

interface VideoAnalysis {
  basicMetrics: {
    views: number;
    likes: number;
    comments: number;
    postedDate: string;
    exactPostTime: string;
    dayOfWeek: string;
    timeOfDay: string;
    engagementRate: number;
    likeToViewRatio: number;
    commentToViewRatio: number;
    subscribers: number;
    isShort: boolean;  // Add flag to identify Shorts
  };

  technicalDetails: {
    videoId: string;
    duration: number;
    durationFormatted: string;
    definition: string;
    caption: boolean;
    categoryId: string;
    categoryName: string;
    defaultLanguage?: string;
  };

  contentAnalysis: {
    titleLength: number;
    titleWordCount: number;
    descriptionLength: number;
    descriptionWordCount: number;
    descriptionHasLinks: boolean;
    descriptionLinkCount: number;
    hashtags: string[];
    tags: string[];
    tagCount: number;
  };

  channelMetrics: {
    channelAge: number;
    totalVideos: number;
    avgViewsPerVideo: number;
    uploadFrequency: string;
    viewsComparison: 'above' | 'below' | 'average';
    totalViews: number;
    avgLikesPerVideo: number;
    avgCommentsPerVideo: number;
    engagementTrend: 'improving' | 'declining' | 'stable';
    bestPerformingVideo: {
      title: string;
      views: number;
      url: string;
      publishedAt: string;
      daysAgo: number;
    } | null;
    recentUploadRate: string;
    subscriberToViewRatio: number;
    bestVideoTimeframe: string;
    currentViewsPerDay: number;
    avgViewsPerDayComparison: number;
    channelMedianViews: number;
    outlierRatio: number;
    isOutlier: boolean;
    isUnderperformer: boolean;
  };

  performanceScores: {
    seoScore: number;
    engagementScore: number;
    optimizationScore: number;
    scoreBreakdown?: {  // Detailed breakdown of scoring
      seo: {
        title: { score: number; max: number; reason: string; };
        description: { score: number; max: number; reason: string; };
        tags: { score: number; max: number; reason: string; };
        hashtags: { score: number; max: number; reason: string; };
        links: { score: number; max: number; reason: string; };
      };
      engagement: {
        rate: { score: number; max: number; reason: string; };
        likeRatio: { score: number; max: number; reason: string; };
        commentRatio: { score: number; max: number; reason: string; };
      };
    };
  };

  insights: {
    strengths: string[];
    improvements: string[];
    recommendations: string[];
  };
}

interface ChannelVideo {
  id: string;
  title: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  thumbnails: any;
  duration?: number;
}

// Helper function to decode HTML entities
const decodeHTMLEntities = (text: string): string => {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
};

const VideoAnalyzer: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<any>(null);
  const [channelData, setChannelData] = useState<any>(null);
  const [channelVideos, setChannelVideos] = useState<ChannelVideo[]>([]);
  const [analysisResults, setAnalysisResults] = useState<VideoAnalysis | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [thumbScores, setThumbScores] = useState<{
    composition: number; compositionReason: string;
    lighting: number; lightingReason: string;
    textReadability: number; textReadabilityReason: string;
    overall: number;
    heatmapUrl: string;
    insights: string[];
  } | null>(null);

  // Analytics tracking
  const timeTracking = useTimeTracking('Video Analyzer', 120);

  // Track page view and start time tracking on mount
  useEffect(() => {
    trackToolPageView('Video Analyzer');
    timeTracking.startTracking();

    return () => {
      timeTracking.stopTracking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toolConfig = {
    name: 'Video Analyzer',
    description: 'Deep-dive YouTube analytics with AI-powered insights and optimization recommendations',
    icon: 'bx bx-chart',
    image: 'https://64.media.tumblr.com/f55e2ae2e5b16799fd5889c64b3fe36b/0e01452f9f6dd974-0e/s2048x3072/09051a8561ff4ab1cc8a5fa3b4b3d81f8a3a720d.jpg',
    features: [
      'Real-time performance metrics',
      'Competition analysis',
      'SEO optimization scoring',
      'Actionable growth strategies'
    ]
  };

  useEffect(() => {
    if (videoId) {
      setVideoUrl(`https://youtube.com/watch?v=${videoId}`);
      handleAnalyze(videoId);
    }
    // Don't default to Ask tab anymore - let user navigate there after analysis
  }, [videoId]);

  const downloadThumbnail = async (url: string, filename?: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'thumbnail.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading thumbnail:', error);
      alert('Failed to download thumbnail');
    }
  };

  const handleTagAnalyze = (tag: string) => {
    const encodedTag = encodeURIComponent(tag.trim());
    const keywordAnalyzerUrl = `/tools/keyword-analyzer/${encodedTag}`;

    // Open in new tab
    window.open(keywordAnalyzerUrl, '_blank', 'noopener,noreferrer');
  };

  const extractVideoId = (url: string): string | null => {
    if (url.match(/^[A-Za-z0-9_-]{11}$/)) {
      return url;
    }

    const regExpVideo = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const regExpShorts = /^.*(youtu.be\/|shorts\/)([^#\&\?]*).*/;

    const matchVideo = url.match(regExpVideo);
    const matchShorts = url.match(regExpShorts);

    if (matchVideo && matchVideo[2].length === 11) {
      return matchVideo[2];
    } else if (matchShorts && matchShorts[2].length === 11) {
      return matchShorts[2];
    }
    return null;
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const parseDuration = (duration: string): number => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    return hours * 3600 + minutes * 60 + seconds;
  };

  const fetchVideoData = async (videoId: string) => {
    const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY_4;
    if (!API_KEY) {
      throw new Error('YouTube API key not configured');
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?` +
      `part=snippet,contentDetails,statistics,status&id=${videoId}&key=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch video data');
    }

    const data = await response.json();
    if (!data.items?.[0]) {
      throw new Error('Video not found');
    }
    return data.items[0];
  };

  const fetchChannelData = async (channelId: string) => {
    const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY_4;
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?` +
      `part=snippet,statistics,contentDetails&id=${channelId}&key=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch channel data');
    }

    const data = await response.json();
    if (!data.items?.[0]) {
      throw new Error('Channel not found');
    }
    return data.items[0];
  };

  const fetchChannelVideos = async (channelId: string, maxResults: number = 50): Promise<ChannelVideo[]> => {
    const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY_4;

    try {
      const channelResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?` +
        `part=contentDetails&id=${channelId}&key=${API_KEY}`
      );

      const channelData = await channelResponse.json();
      const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

      const playlistResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?` +
        `part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${API_KEY}`
      );

      const playlistData = await playlistResponse.json();
      const videoIds = playlistData.items.map((item: any) => item.snippet.resourceId.videoId).join(',');

      const videosResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?` +
        `part=statistics,snippet,contentDetails&id=${videoIds}&key=${API_KEY}`
      );

      const videosData = await videosResponse.json();

      return videosData.items.map((video: any) => ({
        id: video.id,
        title: decodeHTMLEntities(video.snippet.title),
        publishedAt: video.snippet.publishedAt,
        viewCount: parseInt(video.statistics.viewCount || '0'),
        likeCount: parseInt(video.statistics.likeCount || '0'),
        commentCount: parseInt(video.statistics.commentCount || '0'),
        thumbnails: video.snippet.thumbnails,
        duration: parseDuration(video.contentDetails.duration)
      }));
    } catch (error) {
      console.error('Error fetching channel videos:', error);
      return [];
    }
  };

  const fetchCategoryName = async (categoryId: string): Promise<string> => {
    if (!categoryId) return 'Unknown';
    try {
      const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY_4;
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videoCategories?` +
        `part=snippet&id=${categoryId}&key=${API_KEY}`
      );
      const data = await response.json();
      return data.items?.[0]?.snippet?.title || 'Unknown';
    } catch (error) {
      console.error('Error fetching category name:', error);
      return 'Unknown';
    }
  };

  const analyzeContent = (videoData: any): VideoAnalysis['contentAnalysis'] => {
    const description = videoData.snippet.description || '';
    const title = videoData.snippet.title || '';

    return {
      titleLength: title.length,
      titleWordCount: title.split(' ').filter((w: string) => w.length > 0).length,
      descriptionLength: description.length,
      descriptionWordCount: description.split(' ').filter((w: string) => w.length > 0).length,
      descriptionHasLinks: description.includes('http'),
      descriptionLinkCount: (description.match(/http[s]?:\/\/[^\s]+/g) || []).length,
      hashtags: (description.match(/#[\w]+/g) || []),
      tags: videoData.snippet.tags || [],
      tagCount: (videoData.snippet.tags || []).length,
    };
  };

  const calculateScores = (videoData: any, contentAnalysis: VideoAnalysis['contentAnalysis'], isShort: boolean) => {
    // SEO Score calculation (0-100)
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

    // Title optimization (35 points max)
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
      titleReason = `Poor length (${contentAnalysis.titleLength} chars) - too short/too long`;
    }
    seoScore += titleScore;

    // Description optimization (30 points max)
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
      descriptionReason = `Very poor (${contentAnalysis.descriptionLength} chars) - critical issue`;
    }
    seoScore += descriptionScore;

    // Tag optimization (20 points max)
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
      tagsReason = `Minimal (${contentAnalysis.tagCount} tags) - severely limited`;
    } else {
      tagsScore = 0;
      tagsReason = 'No tags - missing discoverability';
    }
    seoScore += tagsScore;

    // Hashtag usage (8 points max)
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

    // External links (7 points max)
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

    // Engagement Score calculation (0-100) - Based on realistic YouTube benchmarks
    const views = parseInt(videoData.statistics.viewCount || '0');
    const likes = parseInt(videoData.statistics.likeCount || '0');
    const comments = parseInt(videoData.statistics.commentCount || '0');
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

    // Overall engagement rate (40 points max)
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

    // Like ratio (30 points max)
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

    // Comment ratio (30 points max)
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

    // Optimization Score calculation (weighted average)
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
  };

  const generateInsights = (
    videoData: any,
    contentAnalysis: VideoAnalysis['contentAnalysis'],
    scores: VideoAnalysis['performanceScores'],
    channelMetrics: VideoAnalysis['channelMetrics']
  ): VideoAnalysis['insights'] => {
    const strengths: string[] = [];
    const improvements: string[] = [];
    const recommendations: string[] = [];

    const views = parseInt(videoData.statistics.viewCount || '0');
    const likes = parseInt(videoData.statistics.likeCount || '0');
    const comments = parseInt(videoData.statistics.commentCount || '0');
    const duration = parseDuration(videoData.contentDetails.duration);

    // Analyze strengths with specific data
    if (scores.engagementScore > 60) {
      strengths.push(`Excellent engagement rate of ${(scores.engagementScore / 10).toFixed(1)}% - significantly above YouTube average of 4%`);
    } else if (scores.engagementScore > 40) {
      strengths.push(`Good engagement rate of ${((likes + comments) / views * 100).toFixed(2)}% - above typical performance`);
    }

    if (contentAnalysis.titleLength >= 35 && contentAnalysis.titleLength <= 65) {
      strengths.push(`Perfect title length (${contentAnalysis.titleLength} chars) maximizes visibility in search and suggested videos`);
    }

    if (contentAnalysis.tagCount >= 15) {
      strengths.push(`Excellent tag optimization with ${contentAnalysis.tagCount} tags covering multiple search variations`);
    } else if (contentAnalysis.tagCount >= 10) {
      strengths.push(`Good tag coverage with ${contentAnalysis.tagCount} tags helping discoverability`);
    }

    if (contentAnalysis.descriptionLength >= 300) {
      strengths.push(`Comprehensive description (${contentAnalysis.descriptionLength} chars) provides strong SEO signals`);
    }

    if (duration >= 600) {
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      const secs = Math.floor(duration % 60);
      const durationFormatted = hours > 0
        ? `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        : `${minutes}:${secs.toString().padStart(2, '0')}`;
      strengths.push(`Video length (${durationFormatted}) optimal for mid-roll ads and watch time metrics`);
    }

    if (channelMetrics.viewsComparison === 'above') {
      const percentBetter = Math.round((channelMetrics.currentViewsPerDay / channelMetrics.avgViewsPerDayComparison) * 100 - 100);
      strengths.push(`Video velocity: ${percentBetter}% faster views/day than similar videos - strong momentum`);
    }

    // Identify specific improvements needed
    const engagementRate = (likes + comments) / views * 100;
    if (engagementRate < 2) {
      improvements.push(`Critical: Engagement rate is only ${engagementRate.toFixed(2)}% (target: 4-6%)`);
      recommendations.push(`Add a clear call-to-action in the first 15 seconds asking viewers to like/comment. Example: "If this helps you, drop a like!"`);
      recommendations.push(`Pin a comment with a question to spark discussion. Questions get 2x more responses than statements`);
    } else if (engagementRate < 4) {
      improvements.push(`Engagement rate of ${engagementRate.toFixed(2)}% is below optimal (target: 4-6%)`);
      recommendations.push(`Test ending screens with specific questions to boost comments by 30-50%`);
    }

    // Title optimization
    if (contentAnalysis.titleLength < 35) {
      improvements.push(`Title too short (${contentAnalysis.titleLength} chars) - missing keyword opportunities`);
      const missingChars = 35 - contentAnalysis.titleLength;
      recommendations.push(`Add ${missingChars} more characters with high-search keywords. Consider adding: numbers, year, or emotional triggers`);
    } else if (contentAnalysis.titleLength > 65) {
      improvements.push(`Title too long (${contentAnalysis.titleLength} chars) - will be truncated in search`);
      recommendations.push(`Shorten title to 35-65 chars. Move less important words to description`);
    }

    // Tag optimization
    if (contentAnalysis.tagCount < 5) {
      improvements.push(`Only ${contentAnalysis.tagCount} tags used - severely limiting discoverability`);
      recommendations.push(`Add ${15 - contentAnalysis.tagCount} more tags. Use variations: singular/plural, abbreviations, common misspellings`);
      recommendations.push(`Include 3-5 broad tags (1-2 words) and 10+ specific long-tail tags (3-5 words)`);
    } else if (contentAnalysis.tagCount < 10) {
      improvements.push(`Limited tags (${contentAnalysis.tagCount}) reducing search visibility`);
      recommendations.push(`Add ${10 - contentAnalysis.tagCount} more specific long-tail keyword tags for niche discovery`);
    }

    // Description optimization
    if (contentAnalysis.descriptionLength < 125) {
      improvements.push(`Very short description (${contentAnalysis.descriptionLength} chars) missing SEO value`);
      recommendations.push(`Expand to 250+ characters. Include: video timestamps, key points, relevant links, 3-5 hashtags`);
      recommendations.push(`First 125 characters are crucial - front-load with keywords and compelling hook`);
    } else if (contentAnalysis.descriptionLength < 200) {
      improvements.push(`Description could be longer (currently ${contentAnalysis.descriptionLength} chars)`);
      recommendations.push(`Add timestamps for better retention and user experience (increases average view duration by 15%)`);
    }

    // Link optimization
    if (!contentAnalysis.descriptionHasLinks) {
      improvements.push('No external links in description - missing traffic opportunities');
      recommendations.push('Add 2-3 relevant links: your website/social media, related videos, or affiliate links');
    } else if (contentAnalysis.descriptionLinkCount > 5) {
      improvements.push(`Too many links (${contentAnalysis.descriptionLinkCount}) may appear spammy`);
      recommendations.push('Limit to 3-5 most important links to maintain credibility');
    }

    // Hashtag optimization
    if (contentAnalysis.hashtags.length === 0) {
      improvements.push('No hashtags in description - missing trending potential');
      recommendations.push('Add 3-5 relevant hashtags above the fold in description. Use 1-2 branded, 2-3 topical');
    } else if (contentAnalysis.hashtags.length > 15) {
      improvements.push(`Too many hashtags (${contentAnalysis.hashtags.length}) - YouTube only uses first 15`);
      recommendations.push('Limit to 10-15 most relevant hashtags for optimal performance');
    }

    // Video length optimization
    if (duration < 120) {
      const durationFormatted = `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`;
      improvements.push(`Very short video (${durationFormatted}) limits monetization and watch time`);
      recommendations.push('Consider creating 8-12 minute videos for optimal ad revenue and algorithm favorability');
    } else if (duration > 1200 && engagementRate < 3) {
      const mins = Math.floor(duration / 60);
      const secs = duration % 60;
      const durationFormatted = `${mins}:${secs.toString().padStart(2, '0')}`;
      improvements.push(`Long video (${durationFormatted}) with low engagement suggests retention issues`);
      recommendations.push('Analyze audience retention graph - if drop-off is high, consider shorter, more focused content');
    }

    // Channel performance insights
    if (channelMetrics.viewsComparison === 'below') {
      const percentBelow = Math.round((1 - channelMetrics.currentViewsPerDay / channelMetrics.avgViewsPerDayComparison) * 100);
      improvements.push(`Lower view velocity: ${percentBelow}% slower views/day than similar videos`);
      recommendations.push('Analyze your top 5 videos for common elements: thumbnail style, title format, topics');
      recommendations.push('Consider refreshing thumbnail after 48 hours if CTR is below 4%');
    }

    // Advanced recommendations based on multiple factors
    if (scores.seoScore < 50 && scores.engagementScore < 50) {
      recommendations.push('Priority: Focus on title and thumbnail optimization first - these drive 90% of clicks');
    }

    if (views > 1000 && likes / views < 0.02) {
      recommendations.push('Like ratio suggests content-expectation mismatch. Ensure title/thumbnail accurately represent content');
    }

    if (contentAnalysis.tagCount > 10 && scores.seoScore < 60) {
      recommendations.push('Tags alone won\'t help - prioritize compelling title and first 125 chars of description');
    }

    return { strengths, improvements, recommendations };
  };

  const performAnalysis = async (videoData: any, channelData: any, channelVideos: ChannelVideo[]): Promise<VideoAnalysis> => {
const postDate = moment(videoData.snippet.publishedAt);
const contentAnalysis = analyzeContent(videoData);

const durationSeconds = parseDuration(videoData.contentDetails.duration);
const isShort = durationSeconds < 60; // YouTube Shorts threshold

const scores = calculateScores(videoData, contentAnalysis, isShort);


    // Calculate channel metrics first
    const totalVideos = parseInt(channelData.statistics.videoCount);
    const avgViewsPerVideo = channelVideos.length > 0
      ? channelVideos.reduce((sum, v) => sum + v.viewCount, 0) / channelVideos.length
      : 0;
    const channelAge = moment().diff(moment(channelData.snippet.publishedAt), 'days');
    const uploadFrequency = totalVideos > 0 && channelAge > 0
      ? `${(totalVideos / Math.max(channelAge / 7, 1)).toFixed(1)} videos/week`
      : 'N/A';

    // Fair performance comparison based on video age
    const currentViews = parseInt(videoData.statistics.viewCount);
    const currentVideoAge = moment().diff(moment(videoData.snippet.publishedAt), 'days');
    const currentVideoAgeDays = Math.max(currentVideoAge, 1); // Minimum 1 day to avoid division by zero
    const currentViewsPerDay = currentViews / currentVideoAgeDays;

    // Calculate average views per day for recent videos (similar age range)
    // Filter videos to those published within similar timeframe (±30 days of current video's age)
    const similarAgeVideos = channelVideos.filter(v => {
      const videoAge = moment().diff(moment(v.publishedAt), 'days');
      return Math.abs(videoAge - currentVideoAgeDays) <= 30 && v.id !== videoData.id;
    });

    // If we have similar age videos, use those for comparison; otherwise use all recent videos
    const comparisonVideos = similarAgeVideos.length >= 3 ? similarAgeVideos : channelVideos.slice(0, 10);

    const avgViewsPerDayComparison = comparisonVideos.length > 0
      ? comparisonVideos.reduce((sum, v) => {
          const videoAge = Math.max(moment().diff(moment(v.publishedAt), 'days'), 1);
          return sum + (v.viewCount / videoAge);
        }, 0) / comparisonVideos.length
      : currentViewsPerDay;

    // Compare based on views per day (velocity), not total views
    let viewsComparison: 'above' | 'below' | 'average';
    if (currentViewsPerDay > avgViewsPerDayComparison * 1.2) {
      viewsComparison = 'above';
    } else if (currentViewsPerDay < avgViewsPerDayComparison * 0.8) {
      viewsComparison = 'below';
    } else {
      viewsComparison = 'average';
    }

    // Calculate additional channel metrics
    const totalChannelViews = parseInt(channelData.statistics.viewCount || '0');
    const avgLikesPerVideo = channelVideos.length > 0
      ? channelVideos.reduce((sum, v) => sum + v.likeCount, 0) / channelVideos.length
      : 0;
    const avgCommentsPerVideo = channelVideos.length > 0
      ? channelVideos.reduce((sum, v) => sum + v.commentCount, 0) / channelVideos.length
      : 0;

    // Analyze engagement trend
    const recentVideos = channelVideos.slice(0, 5);
    const olderVideos = channelVideos.slice(5, 10);
    const recentEngagement = recentVideos.length > 0
      ? recentVideos.reduce((sum, v) => sum + (v.likeCount + v.commentCount) / Math.max(v.viewCount, 1), 0) / recentVideos.length
      : 0;
    const olderEngagement = olderVideos.length > 0
      ? olderVideos.reduce((sum, v) => sum + (v.likeCount + v.commentCount) / Math.max(v.viewCount, 1), 0) / olderVideos.length
      : 0;

    let engagementTrend: 'improving' | 'declining' | 'stable' = 'stable';
    if (recentEngagement > olderEngagement * 1.1) engagementTrend = 'improving';
    else if (recentEngagement < olderEngagement * 0.9) engagementTrend = 'declining';

    // Find best performing video from recent uploads (last 6 months from today)
    const sixMonthsAgo = moment().subtract(6, 'months');
    const recentBestVideos = channelVideos.filter(video =>
      moment(video.publishedAt).isAfter(sixMonthsAgo)
    );

    // If no videos in last 6 months, expand to 12 months
    const videosToConsider = recentBestVideos.length > 0
      ? recentBestVideos
      : channelVideos.filter(video => moment(video.publishedAt).isAfter(moment().subtract(12, 'months')));

    // If still no videos, use the 10 most recent videos
    const finalVideosToConsider = videosToConsider.length > 0
      ? videosToConsider
      : channelVideos.slice(0, 10);

    const bestVideo = finalVideosToConsider.length > 0
      ? finalVideosToConsider.reduce((best, video) => {
        // Consider both view count and engagement rate for "best" video
        const currentEngagement = (video.likeCount + video.commentCount) / Math.max(video.viewCount, 1);
        const bestEngagement = (best.likeCount + best.commentCount) / Math.max(best.viewCount, 1);

        // Prioritize videos with high views and good engagement
        const currentScore = video.viewCount * (1 + currentEngagement * 100);
        const bestScore = best.viewCount * (1 + bestEngagement * 100);

        return currentScore > bestScore ? video : best;
      }, finalVideosToConsider[0])
      : null;

    // Calculate recent upload rate (last 30 days)
    const thirtyDaysAgo = moment().subtract(30, 'days');
    const recentUploads = channelVideos.filter(v => moment(v.publishedAt).isAfter(thirtyDaysAgo)).length;
    const recentUploadRate = `${recentUploads} videos in last 30 days`;

    // Outlier detection: median views of channel's recent videos (excluding this video)
    const otherVideos = channelVideos.filter(v => v.id !== videoData.id);
    const sortedViews = [...otherVideos].map(v => v.viewCount).sort((a, b) => a - b);
    const mid = Math.floor(sortedViews.length / 2);
    const channelMedianViews = sortedViews.length > 0
      ? sortedViews.length % 2 !== 0
        ? sortedViews[mid]
        : (sortedViews[mid - 1] + sortedViews[mid]) / 2
      : 0;
    const outlierRatio = channelMedianViews > 0 ? currentViews / channelMedianViews : 0;
    const isOutlier = outlierRatio >= 2;
    const isUnderperformer = channelMedianViews > 0 && outlierRatio < 0.5;

    const channelMetrics = {
      channelAge,
      totalVideos,
      avgViewsPerVideo,
      uploadFrequency,
      viewsComparison: viewsComparison as 'above' | 'below' | 'average',
      totalViews: totalChannelViews,
      avgLikesPerVideo,
      avgCommentsPerVideo,
      engagementTrend,
      bestPerformingVideo: bestVideo ? {
        title: bestVideo.title,
        views: bestVideo.viewCount,
        url: `https://youtube.com/watch?v=${bestVideo.id}`,
        publishedAt: bestVideo.publishedAt,
        daysAgo: moment().diff(moment(bestVideo.publishedAt), 'days')
      } : null,
      recentUploadRate,
      subscriberToViewRatio: totalChannelViews / Math.max(parseInt(channelData.statistics.subscriberCount || '1'), 1),
      bestVideoTimeframe: recentBestVideos.length > 0 ? 'last 6 months' :
        videosToConsider.length > 0 ? 'last 12 months' :
          'recent uploads',
      currentViewsPerDay,
      avgViewsPerDayComparison,
      channelMedianViews,
      outlierRatio,
      isOutlier,
      isUnderperformer
    };

    const insights = generateInsights(videoData, contentAnalysis, scores, channelMetrics);

    const categoryName = await fetchCategoryName(videoData.snippet.categoryId);

    return {
      basicMetrics: {
        views: parseInt(videoData.statistics.viewCount) || 0,
        likes: parseInt(videoData.statistics.likeCount) || 0,
        comments: parseInt(videoData.statistics.commentCount) || 0,
        postedDate: postDate.format('MMMM Do, YYYY'),
        exactPostTime: postDate.format('YYYY-MM-DD HH:mm:ss UTC'),
        dayOfWeek: postDate.format('dddd'),
        timeOfDay: postDate.format('HH:mm'),
        engagementRate: ((parseInt(videoData.statistics.likeCount) || 0) + (parseInt(videoData.statistics.commentCount) || 0)) / Math.max(parseInt(videoData.statistics.viewCount) || 1, 1),
        likeToViewRatio: (parseInt(videoData.statistics.likeCount) || 0) / Math.max(parseInt(videoData.statistics.viewCount) || 1, 1),
        commentToViewRatio: (parseInt(videoData.statistics.commentCount) || 0) / Math.max(parseInt(videoData.statistics.viewCount) || 1, 1),
        subscribers: parseInt(channelData.statistics.subscriberCount) || 0,
          isShort: isShort // <-- added
      },

      technicalDetails: {
        videoId: videoData.id,
        duration: parseDuration(videoData.contentDetails.duration),
        durationFormatted: formatDuration(parseDuration(videoData.contentDetails.duration)),
        definition: videoData.contentDetails.definition,
        caption: videoData.contentDetails.caption === 'true',
        categoryId: videoData.snippet.categoryId,
        categoryName: categoryName,
        defaultLanguage: videoData.snippet.defaultLanguage
      },

      contentAnalysis,
      channelMetrics,

      performanceScores: scores,
      insights
    };
  };

  const analyzeThumbnail = async (imageUrl: string) => {
    const loadImage = (url: string): Promise<string> => new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext('2d')!.drawImage(img, 0, 0);
        resolve(canvas.toDataURL());
      };
      img.onerror = reject;
      img.src = url;
    });

    const generateHeatmap = (dataUrl: string): Promise<string> => new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 800;
        const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
        const w = Math.floor(img.width * scale), h = Math.floor(img.height * scale);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = w; canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);
        const d = ctx.getImageData(0, 0, w, h).data;
        const gray = new Uint8Array(w * h);
        for (let i = 0; i < d.length; i += 4) gray[i/4] = (d[i]+d[i+1]+d[i+2])/3;
        const sal = new Float32Array(w * h);
        for (let y = 1; y < h-1; y++) for (let x = 1; x < w-1; x++) {
          const idx = y*w+x;
          const gx = -gray[(y-1)*w+(x-1)] + gray[(y-1)*w+(x+1)] - 2*gray[y*w+(x-1)] + 2*gray[y*w+(x+1)] - gray[(y+1)*w+(x-1)] + gray[(y+1)*w+(x+1)];
          const gy = -gray[(y-1)*w+(x-1)] - 2*gray[(y-1)*w+x] - gray[(y-1)*w+(x+1)] + gray[(y+1)*w+(x-1)] + 2*gray[(y+1)*w+x] + gray[(y+1)*w+(x+1)];
          const i4 = idx*4, r=d[i4], g=d[i4+1], b=d[i4+2];
          const mx=Math.max(r,g,b), mn=Math.min(r,g,b), sat=mx===0?0:(mx-mn)/mx;
          const skin = (r>120&&g>80&&b>60&&r>b&&Math.abs(r-g)<50)?60:0;
          sal[idx] = Math.sqrt(gx*gx+gy*gy)*0.6 + sat*100 + (r+g+b)/3*0.4 + skin;
        }
        const cx2=w/2, cy2=h/2;
        for (let y=0;y<h;y++) for (let x=0;x<w;x++) {
          const dx=(x-cx2)/w, dy=(y-cy2)/h;
          sal[y*w+x] += Math.exp(-Math.sqrt(dx*dx+dy*dy)*2.5)*50;
        }
        const blurred = new Float32Array(w * h);
        const ks=12, sigma=6;
        for (let y=0;y<h;y++) for (let x=0;x<w;x++) {
          let sum=0, wt=0;
          for (let ky=-ks;ky<=ks;ky+=2) for (let kx=-ks;kx<=ks;kx+=2) {
            const nx=Math.max(0,Math.min(w-1,x+kx)), ny=Math.max(0,Math.min(h-1,y+ky));
            const ww=Math.exp(-(kx*kx+ky*ky)/(2*sigma*sigma));
            sum+=sal[ny*w+nx]*ww; wt+=ww;
          }
          blurred[y*w+x]=sum/wt;
        }
        let mx2=0, mn2=Infinity;
        for (let i=0;i<blurred.length;i++){if(blurred[i]>mx2)mx2=blurred[i];if(blurred[i]<mn2)mn2=blurred[i];}
        const hc = document.createElement('canvas');
        hc.width=img.width; hc.height=img.height;
        const hctx = hc.getContext('2d')!;
        hctx.drawImage(img,0,0);
        hctx.globalAlpha=0.4; hctx.fillStyle='black'; hctx.fillRect(0,0,img.width,img.height); hctx.globalAlpha=1;
        const tc = document.createElement('canvas');
        tc.width=w; tc.height=h;
        const tctx = tc.getContext('2d')!;
        const hd = tctx.createImageData(w,h);
        for (let i=0;i<blurred.length;i++) {
          let n = (blurred[i]-mn2)/(mx2-mn2);
          n = Math.pow(n, 0.65);
          const intensity = Math.min(255, n*230+40);
          let r2,g2,b2;
          if(n<0.15){r2=0;g2=0;b2=255;}
          else if(n<0.35){const t=(n-0.15)/0.2;r2=0;g2=255*t;b2=255;}
          else if(n<0.55){const t=(n-0.35)/0.2;r2=0;g2=255;b2=255*(1-t);}
          else if(n<0.70){const t=(n-0.55)/0.15;r2=255*t;g2=255;b2=0;}
          else if(n<0.85){const t=(n-0.70)/0.15;r2=255;g2=255*(1-t*0.4);b2=0;}
          else{const t=(n-0.85)/0.15;r2=255;g2=155*(1-t);b2=0;}
          hd.data[i*4]=r2; hd.data[i*4+1]=g2; hd.data[i*4+2]=b2; hd.data[i*4+3]=intensity;
        }
        tctx.putImageData(hd,0,0);
        hctx.drawImage(tc,0,0,img.width,img.height);
        resolve(hc.toDataURL());
      };
      img.src = dataUrl;
    });

    const calcComposition = (dataUrl: string): Promise<{score: number; reason: string}> => new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = img.width; canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        let score = 70; const reasons: string[] = [];
        const cx = canvas.width/2, cy = canvas.height/2, tx = canvas.width/3, ty = canvas.height/3;
        const d = ctx.getImageData(0,0,canvas.width,canvas.height).data;
        let total=0, center=0, cp=0;
        for(let y=0;y<canvas.height;y++) for(let x=0;x<canvas.width;x++){
          const i=(y*canvas.width+x)*4, b=(d[i]+d[i+1]+d[i+2])/3;
          total+=b;
          if(Math.abs(x-cx)<tx && Math.abs(y-cy)<ty){center+=b;cp++;}
        }
        if(center/cp > total/(canvas.width*canvas.height)*1.1){score+=15;reasons.push('Strong center focus draws viewer attention');}
        else reasons.push('Subjects could be better centered for impact');
        const ar=canvas.width/canvas.height;
        if(ar>=1.5&&ar<=1.8){score+=10;reasons.push('Perfect 16:9 aspect ratio for YouTube');}
        else reasons.push('Non-standard aspect ratio may crop on some devices');
        resolve({score:Math.min(100,score), reason:reasons.join('. ')});
      };
      img.src=dataUrl;
    });

    const calcLighting = (dataUrl: string): Promise<{score: number; reason: string}> => new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width=img.width; canvas.height=img.height;
        ctx.drawImage(img,0,0);
        const d=ctx.getImageData(0,0,canvas.width,canvas.height).data;
        let score=70, total=0, bright=0, dark=0;
        const reasons:string[]=[];
        for(let i=0;i<d.length;i+=4){
          const b=(d[i]+d[i+1]+d[i+2])/3;
          total+=b; if(b>200)bright++; if(b<50)dark++;
        }
        const avg=total/(d.length/4), tp=d.length/4;
        if(avg>100&&avg<180){score+=15;reasons.push('Optimal brightness range for visibility');}
        else if(avg<=100)reasons.push('Image appears too dark, may not stand out');
        else reasons.push('Image may be too bright, reducing detail');
        if(bright/tp<0.05&&dark/tp<0.05){score+=10;reasons.push('Good dynamic range without clipping');}
        else if(bright/tp>0.2||dark/tp>0.2){score-=15;reasons.push('Too many overexposed or underexposed areas');}
        let variance=0;
        for(let i=0;i<d.length;i+=4){const b=(d[i]+d[i+1]+d[i+2])/3;variance+=Math.pow(b-avg,2);}
        const std=Math.sqrt(variance/(d.length/4));
        if(std>40&&std<70){score+=10;reasons.push('Excellent contrast for visual pop');}
        else if(std<=40)reasons.push('Low contrast may appear flat');
        else reasons.push('Very high contrast may be harsh');
        resolve({score:Math.min(100,Math.max(0,score)), reason:reasons.join('. ')});
      };
      img.src=dataUrl;
    });

    const detectText = (dataUrl: string): Promise<{score: number; reason: string}> => new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width=img.width; canvas.height=img.height;
        ctx.drawImage(img,0,0);
        const d=ctx.getImageData(0,0,canvas.width,canvas.height).data;
        let sharp=0, horiz=0, vert=0;
        const sr=3;
        for(let y=2;y<canvas.height-2;y+=sr) for(let x=2;x<canvas.width-2;x+=sr){
          const cur=(d[(y*canvas.width+x)*4]+d[(y*canvas.width+x)*4+1]+d[(y*canvas.width+x)*4+2])/3;
          const li=(y*canvas.width+(x-2))*4, ri=(y*canvas.width+(x+2))*4;
          const ti=((y-2)*canvas.width+x)*4, bi=((y+2)*canvas.width+x)*4;
          const hd2=Math.abs((d[li]+d[li+1]+d[li+2])/3-(d[ri]+d[ri+1]+d[ri+2])/3);
          const vd=Math.abs((d[ti]+d[ti+1]+d[ti+2])/3-(d[bi]+d[bi+1]+d[bi+2])/3);
          if(hd2>70){horiz++;sharp++;}
          if(vd>70){vert++;sharp++;}
        }
        const total=((canvas.width/sr)*(canvas.height/sr));
        const er=sharp/total, eb=Math.min(horiz,vert)/Math.max(horiz,vert,1);
        if(er>0.025&&er<0.15&&eb>0.5){
          const rs=Math.min(90,Math.round(eb*80+Math.min(er*500,30)));
          resolve({score:rs, reason:'Text detected — good contrast and readability'});
        } else {
          resolve({score:50, reason:'No clear text overlay detected'});
        }
      };
      img.src=dataUrl;
    });

    try {
      const dataUrl = await loadImage(imageUrl);
      const [heatmapUrl, comp, light, text] = await Promise.all([
        generateHeatmap(dataUrl),
        calcComposition(dataUrl),
        calcLighting(dataUrl),
        detectText(dataUrl),
      ]);
      const overall = Math.round((comp.score + light.score + text.score) / 3);
      const insights: string[] = [];
      if(comp.score > 85) insights.push('Excellent composition — strong visual hierarchy');
      else if(comp.score < 65) insights.push('Composition needs work — center your subject more');
      if(light.score > 85) insights.push('Great lighting with balanced exposure and contrast');
      else if(light.score < 65) insights.push('Lighting needs improvement — check brightness and contrast');
      if(text.score > 70) insights.push('Text overlay detected with good readability');
      if(overall > 80) insights.push('Strong overall thumbnail — should perform well in feeds');

      setThumbScores({
        composition: comp.score, compositionReason: comp.reason,
        lighting: light.score, lightingReason: light.reason,
        textReadability: text.score, textReadabilityReason: text.reason,
        overall, heatmapUrl, insights,
      });
    } catch(e) {
      console.error('Thumbnail analysis failed', e);
    }
  };

  const handleSearch = () => {
    const extractedId = extractVideoId(videoUrl);
    if (extractedId) {
      navigate(`/tools/video-analyzer/${extractedId}`);
    } else {
      alert('Invalid YouTube URL or video ID');
    }
  };

  const handleAnalyze = async (id?: string) => {
    const targetId = id || extractVideoId(videoUrl);
    if (!targetId) {
      alert('Please enter a valid YouTube video URL or ID');
      trackError('Video Analyzer', 'validation_error', 'Invalid video URL or ID');
      return;
    }

    // Track tool usage
    trackToolUsage('Video Analyzer', 'video_url');

    setIsLoading(true);
    setShowResults(false);
    setApiError(null);
    setLoadingStage('Fetching video data...');

    try {
      const video = await fetchVideoData(targetId);
      setLoadingStage('Loading channel information...');
      const channel = await fetchChannelData(video.snippet.channelId);
      setLoadingStage('Analyzing channel videos...');
      const videos = await fetchChannelVideos(video.snippet.channelId);

      setVideoData(video);
      setChannelData(channel);
      setChannelVideos(videos);

      setLoadingStage('Performing analysis...');
      const analysis = await performAnalysis(video, channel, videos);
      setAnalysisResults(analysis);
      setShowResults(true);

      // Trigger thumbnail analysis
      const thumbUrl = video.snippet.thumbnails?.maxres?.url || video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.medium?.url;
      if (thumbUrl) {
        analyzeThumbnail(thumbUrl);
      }

      // Track successful results
      trackResultsDisplayed('Video Analyzer', 1);

    } catch (error) {
      console.error('Error:', error);
      const msg = error instanceof Error ? error.message : 'Unknown error';
      if (msg.toLowerCase().includes('quota')) {
        setApiError('The Video Analyzer is on cooldown — try again tomorrow.');
      } else {
        setApiError(msg || 'An error occurred while analyzing the video. Please try again.');
      }
      trackError('Video Analyzer', 'api_error', msg);
    } finally {
      setIsLoading(false);
      setLoadingStage('');
    }
  };

  const renderOverviewTab = () => {
    if (!analysisResults) return null;

    const { channelMedianViews, outlierRatio, isOutlier, isUnderperformer } = analysisResults.channelMetrics;

    return (
      <S.TabContent>
        {channelMedianViews > 0 && (
          <S.OutlierBanner isOutlier={isOutlier} isUnderperformer={isUnderperformer}>
            <S.OutlierBannerIcon isOutlier={isOutlier} isUnderperformer={isUnderperformer}>
              <i className={isOutlier ? 'bx bx-rocket' : isUnderperformer ? 'bx bx-trending-down' : 'bx bx-bar-chart-alt-2'}></i>
            </S.OutlierBannerIcon>
            <S.OutlierBannerInfo>
              <S.OutlierBannerLabel>Channel Performance</S.OutlierBannerLabel>
              <S.OutlierBannerValue isOutlier={isOutlier} isUnderperformer={isUnderperformer}>
                {isOutlier
                  ? `Outlier — ${outlierRatio.toFixed(1)}× channel median`
                  : isUnderperformer
                  ? `Underperformer — ${outlierRatio.toFixed(1)}× channel median`
                  : `${outlierRatio.toFixed(1)}× channel median`}
              </S.OutlierBannerValue>
              <S.OutlierBannerSub>
                {isOutlier
                  ? `Well above this channel's typical ${channelMedianViews.toLocaleString()} views`
                  : isUnderperformer
                  ? `Well below this channel's typical ${channelMedianViews.toLocaleString()} views`
                  : `Channel recent median: ${channelMedianViews.toLocaleString()} views`}
              </S.OutlierBannerSub>
            </S.OutlierBannerInfo>
          </S.OutlierBanner>
        )}

        <S.StatStrip>
          <S.StatStripItem>
            <S.StatStripValue>{analysisResults.basicMetrics.views.toLocaleString()}</S.StatStripValue>
            <S.StatStripLabel>Views</S.StatStripLabel>
          </S.StatStripItem>
          <S.StatStripDivider />
          <S.StatStripItem>
            <S.StatStripValue>{analysisResults.basicMetrics.likes.toLocaleString()}</S.StatStripValue>
            <S.StatStripLabel>Likes · {(analysisResults.basicMetrics.likeToViewRatio * 100).toFixed(2)}%</S.StatStripLabel>
          </S.StatStripItem>
          <S.StatStripDivider />
          <S.StatStripItem>
            <S.StatStripValue>{analysisResults.basicMetrics.comments.toLocaleString()}</S.StatStripValue>
            <S.StatStripLabel>Comments · {(analysisResults.basicMetrics.commentToViewRatio * 100).toFixed(3)}%</S.StatStripLabel>
          </S.StatStripItem>
          <S.StatStripDivider />
          <S.StatStripItem>
            <S.StatStripValue>{(analysisResults.basicMetrics.engagementRate * 100).toFixed(2)}%</S.StatStripValue>
            <S.StatStripLabel>Engagement Rate</S.StatStripLabel>
          </S.StatStripItem>
        </S.StatStrip>

        <S.ScoreGrid>
          <S.ScoreCard>
            <S.ScoreHeader>
              <S.ScoreIcon className="bx bx-search"></S.ScoreIcon>
              <S.ScoreTitle>SEO Score</S.ScoreTitle>
            </S.ScoreHeader>
            <S.ScoreValue>{analysisResults.performanceScores.seoScore}</S.ScoreValue>
            <S.ScoreMax>/100</S.ScoreMax>
            <S.ScoreBar>
              <S.ScoreBarFill width={analysisResults.performanceScores.seoScore} />
            </S.ScoreBar>

            {analysisResults.performanceScores.scoreBreakdown && (
              <S.ScoreBreakdownList>
                <S.ScoreBreakdownItem percentage={(analysisResults.performanceScores.scoreBreakdown.seo.title.score / analysisResults.performanceScores.scoreBreakdown.seo.title.max) * 100}>
                  <S.ScoreBreakdownLeft>
                    <S.ScoreBreakdownLabel>Title</S.ScoreBreakdownLabel>
                    <S.ScoreBreakdownReason>{analysisResults.performanceScores.scoreBreakdown.seo.title.reason}</S.ScoreBreakdownReason>
                  </S.ScoreBreakdownLeft>
                  <S.ScoreBreakdownRight>
                    <S.ScoreBreakdownValue percentage={(analysisResults.performanceScores.scoreBreakdown.seo.title.score / analysisResults.performanceScores.scoreBreakdown.seo.title.max) * 100}>
                      {analysisResults.performanceScores.scoreBreakdown.seo.title.score}/{analysisResults.performanceScores.scoreBreakdown.seo.title.max}
                    </S.ScoreBreakdownValue>
                    <S.ScoreBreakdownBar>
                      <S.ScoreBreakdownBarFill
                        width={(analysisResults.performanceScores.scoreBreakdown.seo.title.score / analysisResults.performanceScores.scoreBreakdown.seo.title.max) * 100}
                        percentage={(analysisResults.performanceScores.scoreBreakdown.seo.title.score / analysisResults.performanceScores.scoreBreakdown.seo.title.max) * 100}
                      />
                    </S.ScoreBreakdownBar>
                  </S.ScoreBreakdownRight>
                </S.ScoreBreakdownItem>

                <S.ScoreBreakdownItem percentage={(analysisResults.performanceScores.scoreBreakdown.seo.description.score / analysisResults.performanceScores.scoreBreakdown.seo.description.max) * 100}>
                  <S.ScoreBreakdownLeft>
                    <S.ScoreBreakdownLabel>Description</S.ScoreBreakdownLabel>
                    <S.ScoreBreakdownReason>{analysisResults.performanceScores.scoreBreakdown.seo.description.reason}</S.ScoreBreakdownReason>
                  </S.ScoreBreakdownLeft>
                  <S.ScoreBreakdownRight>
                    <S.ScoreBreakdownValue percentage={(analysisResults.performanceScores.scoreBreakdown.seo.description.score / analysisResults.performanceScores.scoreBreakdown.seo.description.max) * 100}>
                      {analysisResults.performanceScores.scoreBreakdown.seo.description.score}/{analysisResults.performanceScores.scoreBreakdown.seo.description.max}
                    </S.ScoreBreakdownValue>
                    <S.ScoreBreakdownBar>
                      <S.ScoreBreakdownBarFill
                        width={(analysisResults.performanceScores.scoreBreakdown.seo.description.score / analysisResults.performanceScores.scoreBreakdown.seo.description.max) * 100}
                        percentage={(analysisResults.performanceScores.scoreBreakdown.seo.description.score / analysisResults.performanceScores.scoreBreakdown.seo.description.max) * 100}
                      />
                    </S.ScoreBreakdownBar>
                  </S.ScoreBreakdownRight>
                </S.ScoreBreakdownItem>

                <S.ScoreBreakdownItem percentage={(analysisResults.performanceScores.scoreBreakdown.seo.tags.score / analysisResults.performanceScores.scoreBreakdown.seo.tags.max) * 100}>
                  <S.ScoreBreakdownLeft>
                    <S.ScoreBreakdownLabel>Tags</S.ScoreBreakdownLabel>
                    <S.ScoreBreakdownReason>{analysisResults.performanceScores.scoreBreakdown.seo.tags.reason}</S.ScoreBreakdownReason>
                  </S.ScoreBreakdownLeft>
                  <S.ScoreBreakdownRight>
                    <S.ScoreBreakdownValue percentage={(analysisResults.performanceScores.scoreBreakdown.seo.tags.score / analysisResults.performanceScores.scoreBreakdown.seo.tags.max) * 100}>
                      {analysisResults.performanceScores.scoreBreakdown.seo.tags.score}/{analysisResults.performanceScores.scoreBreakdown.seo.tags.max}
                    </S.ScoreBreakdownValue>
                    <S.ScoreBreakdownBar>
                      <S.ScoreBreakdownBarFill
                        width={(analysisResults.performanceScores.scoreBreakdown.seo.tags.score / analysisResults.performanceScores.scoreBreakdown.seo.tags.max) * 100}
                        percentage={(analysisResults.performanceScores.scoreBreakdown.seo.tags.score / analysisResults.performanceScores.scoreBreakdown.seo.tags.max) * 100}
                      />
                    </S.ScoreBreakdownBar>
                  </S.ScoreBreakdownRight>
                </S.ScoreBreakdownItem>

                <S.ScoreBreakdownItem percentage={(analysisResults.performanceScores.scoreBreakdown.seo.hashtags.score / analysisResults.performanceScores.scoreBreakdown.seo.hashtags.max) * 100}>
                  <S.ScoreBreakdownLeft>
                    <S.ScoreBreakdownLabel>Hashtags</S.ScoreBreakdownLabel>
                    <S.ScoreBreakdownReason>{analysisResults.performanceScores.scoreBreakdown.seo.hashtags.reason}</S.ScoreBreakdownReason>
                  </S.ScoreBreakdownLeft>
                  <S.ScoreBreakdownRight>
                    <S.ScoreBreakdownValue percentage={(analysisResults.performanceScores.scoreBreakdown.seo.hashtags.score / analysisResults.performanceScores.scoreBreakdown.seo.hashtags.max) * 100}>
                      {analysisResults.performanceScores.scoreBreakdown.seo.hashtags.score}/{analysisResults.performanceScores.scoreBreakdown.seo.hashtags.max}
                    </S.ScoreBreakdownValue>
                    <S.ScoreBreakdownBar>
                      <S.ScoreBreakdownBarFill
                        width={(analysisResults.performanceScores.scoreBreakdown.seo.hashtags.score / analysisResults.performanceScores.scoreBreakdown.seo.hashtags.max) * 100}
                        percentage={(analysisResults.performanceScores.scoreBreakdown.seo.hashtags.score / analysisResults.performanceScores.scoreBreakdown.seo.hashtags.max) * 100}
                      />
                    </S.ScoreBreakdownBar>
                  </S.ScoreBreakdownRight>
                </S.ScoreBreakdownItem>

                <S.ScoreBreakdownItem percentage={(analysisResults.performanceScores.scoreBreakdown.seo.links.score / analysisResults.performanceScores.scoreBreakdown.seo.links.max) * 100}>
                  <S.ScoreBreakdownLeft>
                    <S.ScoreBreakdownLabel>Links</S.ScoreBreakdownLabel>
                    <S.ScoreBreakdownReason>{analysisResults.performanceScores.scoreBreakdown.seo.links.reason}</S.ScoreBreakdownReason>
                  </S.ScoreBreakdownLeft>
                  <S.ScoreBreakdownRight>
                    <S.ScoreBreakdownValue percentage={(analysisResults.performanceScores.scoreBreakdown.seo.links.score / analysisResults.performanceScores.scoreBreakdown.seo.links.max) * 100}>
                      {analysisResults.performanceScores.scoreBreakdown.seo.links.score}/{analysisResults.performanceScores.scoreBreakdown.seo.links.max}
                    </S.ScoreBreakdownValue>
                    <S.ScoreBreakdownBar>
                      <S.ScoreBreakdownBarFill
                        width={(analysisResults.performanceScores.scoreBreakdown.seo.links.score / analysisResults.performanceScores.scoreBreakdown.seo.links.max) * 100}
                        percentage={(analysisResults.performanceScores.scoreBreakdown.seo.links.score / analysisResults.performanceScores.scoreBreakdown.seo.links.max) * 100}
                      />
                    </S.ScoreBreakdownBar>
                  </S.ScoreBreakdownRight>
                </S.ScoreBreakdownItem>
              </S.ScoreBreakdownList>
            )}
          </S.ScoreCard>

          <S.ScoreCard>
            <S.ScoreHeader>
              <S.ScoreIcon className="bx bx-heart"></S.ScoreIcon>
              <S.ScoreTitle>Engagement Score</S.ScoreTitle>
            </S.ScoreHeader>
            <S.ScoreValue>{analysisResults.performanceScores.engagementScore}</S.ScoreValue>
            <S.ScoreMax>/100</S.ScoreMax>
            <S.ScoreBar>
              <S.ScoreBarFill width={analysisResults.performanceScores.engagementScore} />
            </S.ScoreBar>

            {analysisResults.performanceScores.scoreBreakdown && (
              <S.ScoreBreakdownList>
                <S.ScoreBreakdownItem percentage={(analysisResults.performanceScores.scoreBreakdown.engagement.rate.score / analysisResults.performanceScores.scoreBreakdown.engagement.rate.max) * 100}>
                  <S.ScoreBreakdownLeft>
                    <S.ScoreBreakdownLabel>Engagement Rate</S.ScoreBreakdownLabel>
                    <S.ScoreBreakdownReason>{analysisResults.performanceScores.scoreBreakdown.engagement.rate.reason}</S.ScoreBreakdownReason>
                  </S.ScoreBreakdownLeft>
                  <S.ScoreBreakdownRight>
                    <S.ScoreBreakdownValue percentage={(analysisResults.performanceScores.scoreBreakdown.engagement.rate.score / analysisResults.performanceScores.scoreBreakdown.engagement.rate.max) * 100}>
                      {analysisResults.performanceScores.scoreBreakdown.engagement.rate.score}/{analysisResults.performanceScores.scoreBreakdown.engagement.rate.max}
                    </S.ScoreBreakdownValue>
                    <S.ScoreBreakdownBar>
                      <S.ScoreBreakdownBarFill
                        width={(analysisResults.performanceScores.scoreBreakdown.engagement.rate.score / analysisResults.performanceScores.scoreBreakdown.engagement.rate.max) * 100}
                        percentage={(analysisResults.performanceScores.scoreBreakdown.engagement.rate.score / analysisResults.performanceScores.scoreBreakdown.engagement.rate.max) * 100}
                      />
                    </S.ScoreBreakdownBar>
                  </S.ScoreBreakdownRight>
                </S.ScoreBreakdownItem>

                <S.ScoreBreakdownItem percentage={(analysisResults.performanceScores.scoreBreakdown.engagement.likeRatio.score / analysisResults.performanceScores.scoreBreakdown.engagement.likeRatio.max) * 100}>
                  <S.ScoreBreakdownLeft>
                    <S.ScoreBreakdownLabel>Like Ratio</S.ScoreBreakdownLabel>
                    <S.ScoreBreakdownReason>{analysisResults.performanceScores.scoreBreakdown.engagement.likeRatio.reason}</S.ScoreBreakdownReason>
                  </S.ScoreBreakdownLeft>
                  <S.ScoreBreakdownRight>
                    <S.ScoreBreakdownValue percentage={(analysisResults.performanceScores.scoreBreakdown.engagement.likeRatio.score / analysisResults.performanceScores.scoreBreakdown.engagement.likeRatio.max) * 100}>
                      {analysisResults.performanceScores.scoreBreakdown.engagement.likeRatio.score}/{analysisResults.performanceScores.scoreBreakdown.engagement.likeRatio.max}
                    </S.ScoreBreakdownValue>
                    <S.ScoreBreakdownBar>
                      <S.ScoreBreakdownBarFill
                        width={(analysisResults.performanceScores.scoreBreakdown.engagement.likeRatio.score / analysisResults.performanceScores.scoreBreakdown.engagement.likeRatio.max) * 100}
                        percentage={(analysisResults.performanceScores.scoreBreakdown.engagement.likeRatio.score / analysisResults.performanceScores.scoreBreakdown.engagement.likeRatio.max) * 100}
                      />
                    </S.ScoreBreakdownBar>
                  </S.ScoreBreakdownRight>
                </S.ScoreBreakdownItem>

                <S.ScoreBreakdownItem percentage={(analysisResults.performanceScores.scoreBreakdown.engagement.commentRatio.score / analysisResults.performanceScores.scoreBreakdown.engagement.commentRatio.max) * 100}>
                  <S.ScoreBreakdownLeft>
                    <S.ScoreBreakdownLabel>Comment Ratio</S.ScoreBreakdownLabel>
                    <S.ScoreBreakdownReason>{analysisResults.performanceScores.scoreBreakdown.engagement.commentRatio.reason}</S.ScoreBreakdownReason>
                  </S.ScoreBreakdownLeft>
                  <S.ScoreBreakdownRight>
                    <S.ScoreBreakdownValue percentage={(analysisResults.performanceScores.scoreBreakdown.engagement.commentRatio.score / analysisResults.performanceScores.scoreBreakdown.engagement.commentRatio.max) * 100}>
                      {analysisResults.performanceScores.scoreBreakdown.engagement.commentRatio.score}/{analysisResults.performanceScores.scoreBreakdown.engagement.commentRatio.max}
                    </S.ScoreBreakdownValue>
                    <S.ScoreBreakdownBar>
                      <S.ScoreBreakdownBarFill
                        width={(analysisResults.performanceScores.scoreBreakdown.engagement.commentRatio.score / analysisResults.performanceScores.scoreBreakdown.engagement.commentRatio.max) * 100}
                        percentage={(analysisResults.performanceScores.scoreBreakdown.engagement.commentRatio.score / analysisResults.performanceScores.scoreBreakdown.engagement.commentRatio.max) * 100}
                      />
                    </S.ScoreBreakdownBar>
                  </S.ScoreBreakdownRight>
                </S.ScoreBreakdownItem>
              </S.ScoreBreakdownList>
            )}
          </S.ScoreCard>

          <S.ScoreCard>
            <S.ScoreHeader>
              <S.ScoreIcon className="bx bx-rocket"></S.ScoreIcon>
              <S.ScoreTitle>Overall Optimization</S.ScoreTitle>
            </S.ScoreHeader>
            <S.ScoreValue>{analysisResults.performanceScores.optimizationScore}</S.ScoreValue>
            <S.ScoreMax>/100</S.ScoreMax>
            <S.ScoreBar>
              <S.ScoreBarFill width={analysisResults.performanceScores.optimizationScore} />
            </S.ScoreBar>
            <S.ScoreBreakdownList>
              <S.ScoreBreakdownItem percentage={analysisResults.performanceScores.seoScore}>
                <S.ScoreBreakdownLeft>
                  <S.ScoreBreakdownLabel>SEO Impact</S.ScoreBreakdownLabel>
                  <S.ScoreBreakdownReason>Weighted 40% of overall score - drives discoverability</S.ScoreBreakdownReason>
                </S.ScoreBreakdownLeft>
                <S.ScoreBreakdownRight>
                  <S.ScoreBreakdownValue percentage={analysisResults.performanceScores.seoScore}>
                    {analysisResults.performanceScores.seoScore}/100
                  </S.ScoreBreakdownValue>
                  <S.ScoreBreakdownBar>
                    <S.ScoreBreakdownBarFill
                      width={analysisResults.performanceScores.seoScore}
                      percentage={analysisResults.performanceScores.seoScore}
                    />
                  </S.ScoreBreakdownBar>
                </S.ScoreBreakdownRight>
              </S.ScoreBreakdownItem>

              <S.ScoreBreakdownItem percentage={analysisResults.performanceScores.engagementScore}>
                <S.ScoreBreakdownLeft>
                  <S.ScoreBreakdownLabel>Engagement Impact</S.ScoreBreakdownLabel>
                  <S.ScoreBreakdownReason>Weighted 60% of overall score - drives algorithm promotion</S.ScoreBreakdownReason>
                </S.ScoreBreakdownLeft>
                <S.ScoreBreakdownRight>
                  <S.ScoreBreakdownValue percentage={analysisResults.performanceScores.engagementScore}>
                    {analysisResults.performanceScores.engagementScore}/100
                  </S.ScoreBreakdownValue>
                  <S.ScoreBreakdownBar>
                    <S.ScoreBreakdownBarFill
                      width={analysisResults.performanceScores.engagementScore}
                      percentage={analysisResults.performanceScores.engagementScore}
                    />
                  </S.ScoreBreakdownBar>
                </S.ScoreBreakdownRight>
              </S.ScoreBreakdownItem>
            </S.ScoreBreakdownList>
          </S.ScoreCard>
        </S.ScoreGrid>

        {/* Thumbnail Analyzer Section */}
        {thumbScores && videoData && (
          <S.ThumbSection>
            <S.ThumbSectionHeader>
              <S.ThumbSectionTitle>
                <i className="bx bx-image-alt"></i>
                Thumbnail Analysis
              </S.ThumbSectionTitle>
              <S.ThumbOverallBadge score={thumbScores.overall}>
                {Math.round(thumbScores.overall)}/100
              </S.ThumbOverallBadge>
            </S.ThumbSectionHeader>

            <S.ThumbComparison>
              <S.ThumbImageWrapper>
                <img
                  src={videoData.snippet.thumbnails.maxres?.url || videoData.snippet.thumbnails.high.url}
                  alt="Original thumbnail"
                  style={{ width: '100%', display: 'block', borderRadius: '6px' }}
                />
                <S.ThumbImageLabel>Original</S.ThumbImageLabel>
              </S.ThumbImageWrapper>
              <S.ThumbImageWrapper>
                <img
                  src={thumbScores.heatmapUrl}
                  alt="Attention heatmap"
                  style={{ width: '100%', display: 'block', borderRadius: '6px' }}
                />
                <S.ThumbImageLabel>Attention Heatmap</S.ThumbImageLabel>
              </S.ThumbImageWrapper>
            </S.ThumbComparison>

            <S.ThumbScoreList>
              {([
                { label: 'Composition', score: thumbScores.composition, reason: thumbScores.compositionReason },
                { label: 'Lighting & Contrast', score: thumbScores.lighting, reason: thumbScores.lightingReason },
                { label: 'Text Readability', score: thumbScores.textReadability, reason: thumbScores.textReadabilityReason },
              ] as { label: string; score: number; reason: string }[]).map(({ label, score, reason }) => {
                const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
                return (
                  <S.ThumbScoreRow key={label}>
                    <S.ThumbScoreRowTop>
                      <S.ThumbScoreLabel>{label}</S.ThumbScoreLabel>
                      <S.ThumbScoreValue scoreColor={color}>{score}/100</S.ThumbScoreValue>
                    </S.ThumbScoreRowTop>
                    <S.ThumbScoreBar>
                      <S.ThumbScoreBarFill width={score} scoreColor={color} />
                    </S.ThumbScoreBar>
                    <S.ThumbScoreReason>{reason}</S.ThumbScoreReason>
                  </S.ThumbScoreRow>
                );
              })}
            </S.ThumbScoreList>

            {thumbScores.insights.length > 0 && (
              <S.ThumbInsights>
                {thumbScores.insights.map((insight, i) => (
                  <S.ThumbInsightItem key={i}>
                    <i className="bx bx-info-circle"></i>
                    {insight}
                  </S.ThumbInsightItem>
                ))}
              </S.ThumbInsights>
            )}
          </S.ThumbSection>
        )}

        {analysisResults.contentAnalysis.tags.length > 0 && (
          <S.TagsContainer>
            <S.TagsHeader>
              <S.SectionTitle>
                <i className="bx bx-tag"></i>
                Video Tags ({analysisResults.contentAnalysis.tags.length})
              </S.SectionTitle>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <S.CopyTagsButton onClick={() => {
                  navigator.clipboard.writeText(analysisResults.contentAnalysis.tags.join(', '));
                  alert('Tags copied to clipboard!');
                }}>
                  <i className="bx bx-copy"></i>
                  Copy All
                </S.CopyTagsButton>
                <S.AnalyzeAllTagsButton onClick={() => setTagModalOpen(true)}>
                  <i className="bx bx-bar-chart-alt-2"></i>
                  Analyze All
                </S.AnalyzeAllTagsButton>
              </div>
            </S.TagsHeader>
            <S.TagContainer>
              {analysisResults.contentAnalysis.tags.map((tag: string, index: number) => (
                <S.AnalyzableTag key={index} onClick={() => handleTagAnalyze(tag)}>
                  {tag}
                  <S.TagAnalyzeOverlay>
                    <i className="bx bx-search-alt"></i>
                    Analyze
                  </S.TagAnalyzeOverlay>
                </S.AnalyzableTag>
              ))}
            </S.TagContainer>
          </S.TagsContainer>
        )}

        {/* Description Analysis Section */}
        {videoData && (() => {
          const description = videoData.snippet.description || '';
          const { descriptionLength, descriptionLinkCount, hashtags } = analysisResults.contentAnalysis;
          const socialDomains = ['instagram.com','twitter.com','x.com','facebook.com','tiktok.com','twitch.tv','snapchat.com','linkedin.com','discord.gg','discord.com','pinterest.com'];
          const foundSocials = socialDomains.filter(d => description.toLowerCase().includes(d));

          let lengthScore = 0, lengthReason = '';
          if (descriptionLength >= 1000) { lengthScore = 35; lengthReason = `Excellent (${descriptionLength.toLocaleString()} chars) — strong SEO signal`; }
          else if (descriptionLength >= 500) { lengthScore = 28; lengthReason = `Good (${descriptionLength} chars) — consider adding more detail`; }
          else if (descriptionLength >= 250) { lengthScore = 20; lengthReason = `Adequate (${descriptionLength} chars) — expand for better SEO`; }
          else if (descriptionLength >= 100) { lengthScore = 12; lengthReason = `Short (${descriptionLength} chars) — needs more content`; }
          else { lengthScore = 5; lengthReason = `Very short (${descriptionLength} chars) — critical issue`; }

          let linksScore = 0, linksReason = '';
          if (descriptionLinkCount >= 1 && descriptionLinkCount <= 5) { linksScore = 20; linksReason = `Good (${descriptionLinkCount} link${descriptionLinkCount > 1 ? 's' : ''}) — well balanced`; }
          else if (descriptionLinkCount > 5 && descriptionLinkCount <= 10) { linksScore = 12; linksReason = `A few too many (${descriptionLinkCount} links) — consider trimming`; }
          else if (descriptionLinkCount > 10) { linksScore = 5; linksReason = `Too many links (${descriptionLinkCount}) — may appear spammy`; }
          else { linksScore = 8; linksReason = 'No links — add relevant links to drive traffic'; }

          let socialScore = 0, socialReason = '';
          if (foundSocials.length >= 2) { socialScore = 20; socialReason = `${foundSocials.length} social platforms linked — great for audience building`; }
          else if (foundSocials.length === 1) { socialScore = 12; socialReason = '1 social platform linked — add more to grow your following'; }
          else { socialScore = 0; socialReason = 'No social links — add Instagram, Twitter/X, TikTok, etc.'; }

          let hashtagScore = 0, hashtagReason = '';
          const hc = hashtags.length;
          if (hc === 3) { hashtagScore = 25; hashtagReason = 'Perfect (3 hashtags) — optimal for discoverability'; }
          else if (hc === 2 || hc === 4) { hashtagScore = 18; hashtagReason = `Good (${hc} hashtags) — 3 is the sweet spot`; }
          else if (hc === 1) { hashtagScore = 10; hashtagReason = 'Only 1 hashtag — add 2 more for best results'; }
          else if (hc === 5) { hashtagScore = 12; hashtagReason = '5 hashtags — slightly over optimal (3)'; }
          else if (hc > 5) { hashtagScore = 5; hashtagReason = `Too many hashtags (${hc}) — YouTube only shows the first 3 above your title`; }
          else { hashtagScore = 0; hashtagReason = 'No hashtags — add 3 to appear above your title on YouTube'; }

          const totalScore = Math.min(100, lengthScore + linksScore + socialScore + hashtagScore);
          const insights: string[] = [];
          if (hc === 0) insights.push('Add exactly 3 hashtags — they display above the video title on YouTube');
          else if (hc > 5) insights.push('Reduce to 3 hashtags — YouTube only shows the first 3 above the title');
          if (foundSocials.length === 0) insights.push('Add social media links (Instagram, Twitter/X, TikTok) — builds audience beyond YouTube');
          if (descriptionLength < 250) insights.push('Expand your description to 500+ chars — longer descriptions rank better in search');
          if (descriptionLinkCount > 10) insights.push('Too many links signals spam — keep it to 5 or fewer high-value links');

          const descScores = [
            { label: 'Description Length', score: lengthScore, max: 35, reason: lengthReason },
            { label: 'Links', score: linksScore, max: 20, reason: linksReason },
            { label: 'Social Links', score: socialScore, max: 20, reason: socialReason },
            { label: 'Hashtags', score: hashtagScore, max: 25, reason: hashtagReason },
          ];

          return (
            <S.ThumbSection>
              <S.ThumbSectionHeader>
                <S.ThumbSectionTitle>
                  <i className="bx bx-align-left"></i>
                  Description Analysis
                </S.ThumbSectionTitle>
                <S.ThumbOverallBadge score={totalScore}>
                  {totalScore}/100
                </S.ThumbOverallBadge>
              </S.ThumbSectionHeader>
              <S.ThumbScoreList>
                {descScores.map(({ label, score, max, reason }) => {
                  const pct = Math.round((score / max) * 100);
                  const color = pct >= 80 ? '#10b981' : pct >= 55 ? '#f59e0b' : '#ef4444';
                  return (
                    <S.ThumbScoreRow key={label}>
                      <S.ThumbScoreRowTop>
                        <S.ThumbScoreLabel>{label}</S.ThumbScoreLabel>
                        <S.ThumbScoreValue scoreColor={color}>{score}/{max}</S.ThumbScoreValue>
                      </S.ThumbScoreRowTop>
                      <S.ThumbScoreBar>
                        <S.ThumbScoreBarFill width={pct} scoreColor={color} />
                      </S.ThumbScoreBar>
                      <S.ThumbScoreReason>{reason}</S.ThumbScoreReason>
                    </S.ThumbScoreRow>
                  );
                })}
              </S.ThumbScoreList>
              {insights.length > 0 && (
                <S.ThumbInsights>
                  {insights.map((insight, i) => (
                    <S.ThumbInsightItem key={i}>
                      <i className="bx bx-bulb"></i>
                      {insight}
                    </S.ThumbInsightItem>
                  ))}
                </S.ThumbInsights>
              )}
            </S.ThumbSection>
          );
        })()}

        {/* Tag Analysis Modal */}
        {tagModalOpen && (() => {
          const tags = analysisResults.contentAnalysis.tags;
          const STOP = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','from','is','it','its','i','my','how','what','when','why','this','that','was','are','were','be','been','have','has','do','did','can','will','would','should','about','get','just','make','go','use','new','more','all','as','not','so','if','we','you','they','our','your','he','she','his','her','they','them','their']);
          const titleWords = (videoData?.snippet?.title || '').toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter((w: string) => w.length > 2 && !STOP.has(w));

          const analyzed = tags.map((tag: string) => {
            const wc = tag.split(' ').filter(Boolean).length;
            const cc = tag.length;
            const type: 'Broad' | 'Mid-tail' | 'Long-tail' = wc === 1 ? 'Broad' : wc <= 3 ? 'Mid-tail' : 'Long-tail';

            const tagWords = tag.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
            const matchCount = tagWords.filter((w: string) => titleWords.some((tw: string) => tw === w || tw.includes(w) || w.includes(tw))).length;
            const relevance = tagWords.length > 0 ? matchCount / tagWords.length : 0;
            const isRelevant = relevance >= 0.5 || (tagWords.length === 1 && relevance > 0);

            let score = 0;
            if (wc >= 2 && wc <= 3) score += 40;
            else if (wc === 1) score += 15;
            else score += 30;
            if (cc >= 5 && cc <= 30) score += 25;
            else if (cc >= 3 && cc <= 40) score += 12;
            else score += 5;
            if (relevance >= 0.75) score += 35;
            else if (relevance >= 0.5) score += 25;
            else if (relevance > 0) score += 12;

            score = Math.max(0, Math.min(100, score));
            const quality: 'Strong' | 'OK' | 'Weak' = score >= 70 ? 'Strong' : score >= 45 ? 'OK' : 'Weak';
            return { tag, wordCount: wc, charCount: cc, type, score, quality, isRelevant };
          }).sort((a: any, b: any) => b.score - a.score);

          const strong = analyzed.filter((t: any) => t.quality === 'Strong').length;
          const ok = analyzed.filter((t: any) => t.quality === 'OK').length;
          const weak = analyzed.filter((t: any) => t.quality === 'Weak').length;
          const relevant = analyzed.filter((t: any) => t.isRelevant).length;
          const broad = analyzed.filter((t: any) => t.type === 'Broad').length;
          const midTail = analyzed.filter((t: any) => t.type === 'Mid-tail').length;
          const longTail = analyzed.filter((t: any) => t.type === 'Long-tail').length;

          return (
            <S.TagModalOverlay onClick={() => setTagModalOpen(false)}>
              <S.TagModal onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                <S.TagModalHeader>
                  <S.TagModalTitle>Tag Analysis ({tags.length} tags)</S.TagModalTitle>
                  <S.TagModalClose onClick={() => setTagModalOpen(false)}>
                    <i className="bx bx-x"></i>
                  </S.TagModalClose>
                </S.TagModalHeader>
                <S.TagModalSummary>
                  <S.TagModalSummaryStat>
                    <S.TagModalSummaryValue>{tags.length}</S.TagModalSummaryValue>
                    <S.TagModalSummaryLabel>Total</S.TagModalSummaryLabel>
                  </S.TagModalSummaryStat>
                  <S.TagModalSummaryStat>
                    <S.TagModalSummaryValue style={{ color: '#10b981' }}>{strong}</S.TagModalSummaryValue>
                    <S.TagModalSummaryLabel>Strong</S.TagModalSummaryLabel>
                  </S.TagModalSummaryStat>
                  <S.TagModalSummaryStat>
                    <S.TagModalSummaryValue style={{ color: '#f59e0b' }}>{ok}</S.TagModalSummaryValue>
                    <S.TagModalSummaryLabel>OK</S.TagModalSummaryLabel>
                  </S.TagModalSummaryStat>
                  <S.TagModalSummaryStat>
                    <S.TagModalSummaryValue style={{ color: '#ef4444' }}>{weak}</S.TagModalSummaryValue>
                    <S.TagModalSummaryLabel>Weak</S.TagModalSummaryLabel>
                  </S.TagModalSummaryStat>
                  <S.TagModalSummaryStat>
                    <S.TagModalSummaryValue style={{ color: '#a78bfa' }}>{relevant}</S.TagModalSummaryValue>
                    <S.TagModalSummaryLabel>On-Topic</S.TagModalSummaryLabel>
                  </S.TagModalSummaryStat>
                  <S.TagModalSummaryStat>
                    <S.TagModalSummaryValue>{broad}</S.TagModalSummaryValue>
                    <S.TagModalSummaryLabel>Broad</S.TagModalSummaryLabel>
                  </S.TagModalSummaryStat>
                  <S.TagModalSummaryStat>
                    <S.TagModalSummaryValue>{midTail}</S.TagModalSummaryValue>
                    <S.TagModalSummaryLabel>Mid-tail</S.TagModalSummaryLabel>
                  </S.TagModalSummaryStat>
                  <S.TagModalSummaryStat>
                    <S.TagModalSummaryValue>{longTail}</S.TagModalSummaryValue>
                    <S.TagModalSummaryLabel>Long-tail</S.TagModalSummaryLabel>
                  </S.TagModalSummaryStat>
                </S.TagModalSummary>
                <S.TagModalBody>
                  {analyzed.map((item: any, index: number) => (
                    <S.TagRow key={index}>
                      <S.TagRowName title={item.tag}>{item.tag}</S.TagRowName>
                      {item.isRelevant && <S.TagRelevantBadge>On-Topic</S.TagRelevantBadge>}
                      <S.TagTypeBadge tagType={item.type}>{item.type}</S.TagTypeBadge>
                      <div style={{ width: '60px', flexShrink: 0 }}>
                        <S.PerfBar>
                          <S.PerfBarFill
                            width={item.score}
                            color={item.quality === 'Strong' ? '#10b981' : item.quality === 'OK' ? '#f59e0b' : '#ef4444'}
                          />
                        </S.PerfBar>
                      </div>
                      <S.TagQualityLabel quality={item.quality}>{item.quality}</S.TagQualityLabel>
                    </S.TagRow>
                  ))}
                </S.TagModalBody>
              </S.TagModal>
            </S.TagModalOverlay>
          );
        })()}
      </S.TabContent>
    );
  };

  const renderDetailsTab = () => {
    if (!analysisResults) return null;

    return (
      <S.TabContent>
        <S.DetailSection>
          <S.DetailTitle>
            <i className="bx bx-info-circle"></i>
            Video Information
          </S.DetailTitle>
          <S.DetailGrid>
            <S.DetailItem>
              <S.DetailLabel>Video ID</S.DetailLabel>
              <S.DetailValue>{analysisResults.technicalDetails.videoId}</S.DetailValue>
            </S.DetailItem>
            <S.DetailItem>
              <S.DetailLabel>Duration</S.DetailLabel>
              <S.DetailValue>{analysisResults.technicalDetails.durationFormatted}</S.DetailValue>
            </S.DetailItem>
            <S.DetailItem>
              <S.DetailLabel>Quality</S.DetailLabel>
              <S.DetailValue>{analysisResults.technicalDetails.definition.toUpperCase()}</S.DetailValue>
            </S.DetailItem>
            <S.DetailItem>
              <S.DetailLabel>Category</S.DetailLabel>
              <S.DetailValue>{analysisResults.technicalDetails.categoryName}</S.DetailValue>
            </S.DetailItem>
            <S.DetailItem>
              <S.DetailLabel>Captions</S.DetailLabel>
              <S.DetailValue>{analysisResults.technicalDetails.caption ? 'Available' : 'Not Available'}</S.DetailValue>
            </S.DetailItem>
            <S.DetailItem>
              <S.DetailLabel>Language</S.DetailLabel>
              <S.DetailValue>{analysisResults.technicalDetails.defaultLanguage || 'Not specified'}</S.DetailValue>
            </S.DetailItem>
          </S.DetailGrid>
        </S.DetailSection>

        <S.DetailSection>
          <S.DetailTitle>
            <i className="bx bx-time-five"></i>
            Publishing Details
          </S.DetailTitle>
          <S.DetailGrid>
            <S.DetailItem>
              <S.DetailLabel>Published Date</S.DetailLabel>
              <S.DetailValue>{analysisResults.basicMetrics.postedDate}</S.DetailValue>
            </S.DetailItem>
            <S.DetailItem>
              <S.DetailLabel>Exact Time</S.DetailLabel>
              <S.DetailValue>{analysisResults.basicMetrics.exactPostTime}</S.DetailValue>
            </S.DetailItem>
            <S.DetailItem>
              <S.DetailLabel>Day of Week</S.DetailLabel>
              <S.DetailValue>{analysisResults.basicMetrics.dayOfWeek}</S.DetailValue>
            </S.DetailItem>
            <S.DetailItem>
              <S.DetailLabel>Time of Day</S.DetailLabel>
              <S.DetailValue>{analysisResults.basicMetrics.timeOfDay} UTC</S.DetailValue>
            </S.DetailItem>
          </S.DetailGrid>
        </S.DetailSection>

        <S.DetailSection>
          <S.DetailTitle>
            <i className="bx bx-text"></i>
            Content Metrics
          </S.DetailTitle>
          <S.DetailGrid>
            <S.DetailItem>
              <S.DetailLabel>Title Length</S.DetailLabel>
              <S.DetailValue>{analysisResults.contentAnalysis.titleLength} characters</S.DetailValue>
            </S.DetailItem>
            <S.DetailItem>
              <S.DetailLabel>Title Words</S.DetailLabel>
              <S.DetailValue>{analysisResults.contentAnalysis.titleWordCount} words</S.DetailValue>
            </S.DetailItem>
            <S.DetailItem>
              <S.DetailLabel>Description Length</S.DetailLabel>
              <S.DetailValue>{analysisResults.contentAnalysis.descriptionLength} characters</S.DetailValue>
            </S.DetailItem>
            <S.DetailItem>
              <S.DetailLabel>Description Words</S.DetailLabel>
              <S.DetailValue>{analysisResults.contentAnalysis.descriptionWordCount} words</S.DetailValue>
            </S.DetailItem>
            <S.DetailItem>
              <S.DetailLabel>Tags Count</S.DetailLabel>
              <S.DetailValue>{analysisResults.contentAnalysis.tagCount} tags</S.DetailValue>
            </S.DetailItem>
            <S.DetailItem>
              <S.DetailLabel>Links in Description</S.DetailLabel>
              <S.DetailValue>{analysisResults.contentAnalysis.descriptionLinkCount}</S.DetailValue>
            </S.DetailItem>
            <S.DetailItem>
              <S.DetailLabel>Hashtags</S.DetailLabel>
              <S.DetailValue>{analysisResults.contentAnalysis.hashtags.length} hashtags</S.DetailValue>
            </S.DetailItem>
          </S.DetailGrid>
        </S.DetailSection>

        <S.DetailSection>
          <S.DetailTitle>
            <i className="bx bx-analyse"></i>
            Advanced Analytics
          </S.DetailTitle>
          <S.DetailGrid>
            {(() => {
              const daysSincePublished = videoData?.snippet?.publishedAt
                ? Math.floor((Date.now() - new Date(videoData.snippet.publishedAt).getTime()) / (1000 * 60 * 60 * 24))
                : 0;
              const { outlierRatio, isOutlier, isUnderperformer } = analysisResults.channelMetrics;
              return (
                <>
                  <S.DetailItem>
                    <S.DetailLabel>Days Since Published</S.DetailLabel>
                    <S.DetailValue>{daysSincePublished.toLocaleString()} days</S.DetailValue>
                  </S.DetailItem>
                  <S.DetailItem>
                    <S.DetailLabel>Est. Views Per Day</S.DetailLabel>
                    <S.DetailValue>{(analysisResults.basicMetrics.views / Math.max(1, daysSincePublished)).toFixed(0)}</S.DetailValue>
                  </S.DetailItem>
                  <S.DetailItem>
                    <S.DetailLabel>Views Per Subscriber</S.DetailLabel>
                    <S.DetailValue>{(analysisResults.basicMetrics.views / Math.max(1, analysisResults.basicMetrics.subscribers) * 100).toFixed(2)}%</S.DetailValue>
                  </S.DetailItem>
                  <S.DetailItem>
                    <S.DetailLabel>Like/View Ratio</S.DetailLabel>
                    <S.DetailValue>{(analysisResults.basicMetrics.likeToViewRatio * 100).toFixed(3)}%</S.DetailValue>
                  </S.DetailItem>
                  <S.DetailItem>
                    <S.DetailLabel>Comment/View Ratio</S.DetailLabel>
                    <S.DetailValue>{(analysisResults.basicMetrics.commentToViewRatio * 100).toFixed(4)}%</S.DetailValue>
                  </S.DetailItem>
                  <S.DetailItem>
                    <S.DetailLabel>Total Engagement</S.DetailLabel>
                    <S.DetailValue>{(analysisResults.basicMetrics.likes + analysisResults.basicMetrics.comments).toLocaleString()}</S.DetailValue>
                  </S.DetailItem>
                  <S.DetailItem>
                    <S.DetailLabel>Video Type</S.DetailLabel>
                    <S.DetailValue>
                      {analysisResults.basicMetrics.isShort
                        ? 'YouTube Short'
                        : analysisResults.technicalDetails.duration > 600
                        ? 'Long-form (10m+)'
                        : 'Standard'}
                    </S.DetailValue>
                  </S.DetailItem>
                  <S.DetailItem>
                    <S.DetailLabel>Channel Performance</S.DetailLabel>
                    <S.DetailValue>
                      {isOutlier
                        ? `Outlier (${outlierRatio.toFixed(1)}×)`
                        : isUnderperformer
                        ? `Underperformer (${outlierRatio.toFixed(1)}×)`
                        : `On-pace (${outlierRatio.toFixed(1)}×)`}
                    </S.DetailValue>
                  </S.DetailItem>
                </>
              );
            })()}
          </S.DetailGrid>
        </S.DetailSection>
      </S.TabContent>
    );
  };

  const renderChannelTab = () => {
    if (!analysisResults || !channelData) return null;

    const { channelMetrics, basicMetrics } = analysisResults;
    const channelAge = channelMetrics.channelAge;
    const ageText = Math.floor(channelAge / 365) > 0
      ? `${Math.floor(channelAge / 365)}y ${Math.floor((channelAge % 365) / 30)}mo`
      : `${Math.floor(channelAge / 30)} months`;

    const compRows = [
      { label: 'Views', video: basicMetrics.views, avg: Math.round(channelMetrics.avgViewsPerVideo) },
      { label: 'Likes', video: basicMetrics.likes, avg: Math.round(channelMetrics.avgLikesPerVideo) },
      { label: 'Comments', video: basicMetrics.comments, avg: Math.round(channelMetrics.avgCommentsPerVideo) },
    ];

    const trendIcon = channelMetrics.engagementTrend === 'improving' ? 'bx-trending-up'
      : channelMetrics.engagementTrend === 'declining' ? 'bx-trending-down' : 'bx-minus';
    const trendColor = channelMetrics.engagementTrend === 'improving' ? '#10b981'
      : channelMetrics.engagementTrend === 'declining' ? '#ef4444' : '#f59e0b';

    return (
      <S.TabContent>

        {/* Channel Identity Card */}
        <S.ChannelProfileCard>
          <S.ChannelProfileAvatar
            src={channelData.snippet.thumbnails.medium?.url || channelData.snippet.thumbnails.default.url}
            alt={channelData.snippet.title}
          />
          <S.ChannelProfileInfo>
            <S.ChannelProfileName>{channelData.snippet.title}</S.ChannelProfileName>
            {channelData.snippet.customUrl && (
              <S.ChannelProfileHandle>{channelData.snippet.customUrl}</S.ChannelProfileHandle>
            )}
            <S.ChannelProfileMeta>
              <span><i className="bx bx-user"></i>{basicMetrics.subscribers.toLocaleString()} subs</span>
              <span><i className="bx bx-video"></i>{channelMetrics.totalVideos.toLocaleString()} videos</span>
              <span><i className="bx bx-calendar"></i>{ageText} old</span>
            </S.ChannelProfileMeta>
          </S.ChannelProfileInfo>
          <S.ChannelProfileCTA onClick={() => {
            const handle = channelData.snippet.customUrl || `@${channelData.snippet.title.replace(/\s+/g, '')}`;
            window.open(`/tools/channel-analyzer?channel=${encodeURIComponent(handle)}`, '_blank');
          }}>
            <i className="bx bx-line-chart"></i>
            Analyze Channel
          </S.ChannelProfileCTA>
        </S.ChannelProfileCard>

        {/* Stat Tiles */}
        <S.ChannelStatGrid>
          <S.ChannelStatTile>
            <S.ChannelStatValue>{channelMetrics.totalViews.toLocaleString()}</S.ChannelStatValue>
            <S.ChannelStatLabel>Total Views</S.ChannelStatLabel>
          </S.ChannelStatTile>
          <S.ChannelStatTile>
            <S.ChannelStatValue>{Math.round(channelMetrics.avgViewsPerVideo).toLocaleString()}</S.ChannelStatValue>
            <S.ChannelStatLabel>Avg Views / Video</S.ChannelStatLabel>
          </S.ChannelStatTile>
          <S.ChannelStatTile>
            <S.ChannelStatValue>{channelMetrics.channelMedianViews.toLocaleString()}</S.ChannelStatValue>
            <S.ChannelStatLabel>Recent Median Views</S.ChannelStatLabel>
          </S.ChannelStatTile>
          <S.ChannelStatTile>
            <S.ChannelStatValue>{channelMetrics.subscriberToViewRatio.toFixed(1)}×</S.ChannelStatValue>
            <S.ChannelStatLabel>Views per Subscriber</S.ChannelStatLabel>
          </S.ChannelStatTile>
          <S.ChannelStatTile>
            <S.ChannelStatValue style={{ color: trendColor }}>
              <i className={`bx ${trendIcon}`} style={{ fontSize: '1.25rem' }}></i>
            </S.ChannelStatValue>
            <S.ChannelStatLabel>Engagement Trend</S.ChannelStatLabel>
          </S.ChannelStatTile>
          <S.ChannelStatTile>
            <S.ChannelStatValue style={{ fontSize: '1rem' }}>{channelMetrics.recentUploadRate}</S.ChannelStatValue>
            <S.ChannelStatLabel>Upload Rate</S.ChannelStatLabel>
          </S.ChannelStatTile>
        </S.ChannelStatGrid>

        {/* This Video vs Channel Average */}
        <S.ThumbSection>
          <S.ThumbSectionHeader>
            <S.ThumbSectionTitle>
              <i className="bx bx-bar-chart-alt-2"></i>
              This Video vs Channel Average
            </S.ThumbSectionTitle>
            <S.ThumbOverallBadge score={channelMetrics.isOutlier ? 90 : channelMetrics.isUnderperformer ? 15 : 55}>
              {channelMetrics.isOutlier
                ? `Outlier ${channelMetrics.outlierRatio.toFixed(1)}×`
                : channelMetrics.isUnderperformer
                ? `Under ${channelMetrics.outlierRatio.toFixed(1)}×`
                : `On-pace ${channelMetrics.outlierRatio.toFixed(1)}×`}
            </S.ThumbOverallBadge>
          </S.ThumbSectionHeader>

          {compRows.map(({ label, video, avg }) => {
            const max = Math.max(video, avg, 1) * 1.15;
            const videoPct = Math.round((video / max) * 100);
            const avgPct = Math.round((avg / max) * 100);
            const videoColor = video >= avg ? '#10b981' : '#ef4444';
            return (
              <S.ChannelCompareRow key={label}>
                <S.ChannelCompareLabel>{label}</S.ChannelCompareLabel>
                <S.ChannelCompareBars>
                  <S.ChannelCompareBarRow>
                    <S.ChannelCompareBarTag>This video</S.ChannelCompareBarTag>
                    <S.ChannelCompareBarTrack>
                      <S.ChannelCompareBarFill width={videoPct} barColor={videoColor} />
                    </S.ChannelCompareBarTrack>
                    <S.ChannelCompareBarNum>{video.toLocaleString()}</S.ChannelCompareBarNum>
                  </S.ChannelCompareBarRow>
                  <S.ChannelCompareBarRow>
                    <S.ChannelCompareBarTag>Channel avg</S.ChannelCompareBarTag>
                    <S.ChannelCompareBarTrack>
                      <S.ChannelCompareBarFill width={avgPct} barColor="rgba(255,255,255,0.2)" />
                    </S.ChannelCompareBarTrack>
                    <S.ChannelCompareBarNum>{avg.toLocaleString()}</S.ChannelCompareBarNum>
                  </S.ChannelCompareBarRow>
                </S.ChannelCompareBars>
              </S.ChannelCompareRow>
            );
          })}

          <S.ThumbInsights>
            <S.ThumbInsightItem>
              <i className="bx bx-time"></i>
              Upload frequency: {channelMetrics.uploadFrequency}
            </S.ThumbInsightItem>
            <S.ThumbInsightItem>
              <i className={`bx ${trendIcon}`} style={{ color: trendColor }}></i>
              Engagement is {channelMetrics.engagementTrend} based on recent videos
            </S.ThumbInsightItem>
          </S.ThumbInsights>
        </S.ThumbSection>

      </S.TabContent>
    );
  };

  const renderInsightsTab = () => {
    if (!analysisResults) return null;

    return (
      <S.TabContent>
        {analysisResults.insights.strengths.length > 0 && (
          <S.InsightSection>
            <S.InsightTitle success>
              <i className="bx bx-check-circle"></i>
              Strengths
            </S.InsightTitle>
            {analysisResults.insights.strengths.map((strength, index) => (
              <S.InsightItem key={index} type="success">
                <i className="bx bx-check"></i>
                {strength}
              </S.InsightItem>
            ))}
          </S.InsightSection>
        )}

        {analysisResults.insights.improvements.length > 0 && (
          <S.InsightSection>
            <S.InsightTitle>
              <i className="bx bx-error-circle"></i>
              Areas for Improvement
            </S.InsightTitle>
            {analysisResults.insights.improvements.map((improvement, index) => (
              <S.InsightItem key={index} type="warning">
                <i className="bx bx-x"></i>
                {improvement}
              </S.InsightItem>
            ))}
          </S.InsightSection>
        )}

        {analysisResults.insights.recommendations.length > 0 && (
          <S.InsightSection>
            <S.InsightTitle>
              <i className="bx bx-bulb"></i>
              Recommendations
            </S.InsightTitle>
            {analysisResults.insights.recommendations.map((rec, index) => (
              <S.InsightItem key={index} type="info">
                <i className="bx bx-right-arrow-alt"></i>
                {rec}
              </S.InsightItem>
            ))}
          </S.InsightSection>
        )}
      </S.TabContent>
    );
  };

  const seoConfig = toolsSEO['video-analyzer'];
  const schemaData = generateToolSchema('video-analyzer', seoConfig);

  return (
    <>
      <SEO
        title={seoConfig.title}
        description={seoConfig.description}
        keywords={seoConfig.keywords}
        canonical="https://youtool.io/tools/video-analyzer"
        schemaData={schemaData}
      />
      <S.PageWrapper>
      <S.MainContainer>
        <S.BackButton onClick={() => navigate('/tools')}>
          <i className="bx bx-arrow-back"></i>
          Back to Tools
        </S.BackButton>

        <S.EnhancedHeader backgroundImage={toolConfig.image}>
          <S.HeaderContent>
            <S.ToolIconContainer>
              <i className={toolConfig.icon}></i>
            </S.ToolIconContainer>

            <S.HeaderTextContent>
              <S.ToolTitle>{toolConfig.name}</S.ToolTitle>
              <S.ToolDescription>{toolConfig.description}</S.ToolDescription>

              <S.FeaturesList>
                {toolConfig.features.map((feature, index) => (
                  <S.FeatureItem key={index}>
                    <i className="bx bx-check-circle"></i>
                    <span>{feature}</span>
                  </S.FeatureItem>
                ))}
              </S.FeaturesList>

              <S.HeaderSearchContainer>
                <S.HeaderSearchBar>
                  <S.HeaderSearchInput
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="Enter YouTube video URL or video ID"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <S.HeaderSearchButton onClick={handleSearch} disabled={isLoading}>
                    {isLoading ? (
                      <i className="bx bx-loader-alt bx-spin"></i>
                    ) : (
                      <i className="bx bx-search"></i>
                    )}
                  </S.HeaderSearchButton>
                </S.HeaderSearchBar>
              </S.HeaderSearchContainer>
            </S.HeaderTextContent>
          </S.HeaderContent>
        </S.EnhancedHeader>

        {/* Google Ad Spot */}
        <GoogleAd adSlot="1234567890" />

        {apiError && (
          <S.ErrorMessage>
            <i className="bx bx-error"></i>
            {apiError}
          </S.ErrorMessage>
        )}

        {/* Educational Content Section */}
        {!showResults && (
          <S.EducationalSection>

            <S.EducationalContent>
              <S.SectionSubTitle>What This Tool Does</S.SectionSubTitle>
              <S.EducationalText>
                The YouTube Video Analyzer fetches comprehensive metadata for any public YouTube video using the YouTube Data API v3 and calculates a set of performance and quality scores on top of that raw data. In a single analysis you get engagement metrics, an SEO score, technical specifications, upload timing data, and tag analysis — all in one place, without needing access to YouTube Studio.
              </S.EducationalText>
              <S.EducationalText>
                This tool is designed for creators researching competitors, editors evaluating their own videos before and after optimization, and marketers building data-driven content strategies. Because it works on any public video, you can analyze your own content and your competitors' content with the same level of depth.
              </S.EducationalText>
            </S.EducationalContent>

            <S.EducationalContent>
              <S.SectionSubTitle>How to Use the Video Analyzer</S.SectionSubTitle>
              <S.StepByStep>
                <S.StepItem>
                  <S.StepNumberCircle>1</S.StepNumberCircle>
                  <S.StepContent>
                    <S.StepTitle>Paste Any YouTube Video URL</S.StepTitle>
                    <S.EducationalText>
                      Copy the video URL from your browser or YouTube's share button and paste it into the search bar. Supported formats include youtube.com/watch?v=VIDEO_ID, youtu.be/VIDEO_ID, youtube.com/shorts/VIDEO_ID, and bare 11-character video IDs. The tool works with standard uploads, Shorts, and livestream replays.
                    </S.EducationalText>
                  </S.StepContent>
                </S.StepItem>
                <S.StepItem>
                  <S.StepNumberCircle>2</S.StepNumberCircle>
                  <S.StepContent>
                    <S.StepTitle>Review the Overview Tab</S.StepTitle>
                    <S.EducationalText>
                      The Overview tab shows the headline numbers: view count, likes, comments, engagement rate, SEO score, and the upload date. This is where you quickly assess whether a video is performing well or needs attention. The engagement rate and SEO score are calculated metrics — not raw numbers from YouTube — which means they give you a normalized way to compare videos across different channels and sizes.
                    </S.EducationalText>
                  </S.StepContent>
                </S.StepItem>
                <S.StepItem>
                  <S.StepNumberCircle>3</S.StepNumberCircle>
                  <S.StepContent>
                    <S.StepTitle>Explore the Details and Recommendations</S.StepTitle>
                    <S.EducationalText>
                      Navigate through the tabs to see tag analysis, description quality, technical metadata, and channel context. The Recommendations tab summarizes the most actionable findings — things like missing tags, short descriptions, or sub-optimal upload timing that you can act on immediately.
                    </S.EducationalText>
                  </S.StepContent>
                </S.StepItem>
              </S.StepByStep>
            </S.EducationalContent>

            <S.EducationalContent>
              <S.SectionSubTitle>How to Interpret the Results</S.SectionSubTitle>
              <S.FeatureList>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Engagement Rate:</strong> Calculated as (likes + comments) ÷ views × 100. A rate above 4% is strong for most niches. Rates below 1% may indicate the video reached a large non-subscribed audience (common for viral videos) or that the content did not resonate deeply with viewers. Compare this metric against the channel's own average rather than an absolute benchmark.</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>SEO Score:</strong> A composite score based on title length and keyword density, description length and richness, number of tags used, and whether key terms appear consistently across all three fields. Scores above 70 indicate solid optimization. Below 40 usually means the title is too short, the description is sparse, or tags are missing entirely.</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Tag Analysis:</strong> Shows how many tags the video uses and flags whether they appear to be optimized. YouTube allows up to 500 characters of tags. Videos using fewer than 5 tags or over 30 tags often have lower discoverability than those using 10–20 well-chosen tags that match the title and description keywords.</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Upload Timing:</strong> Shows the day of week and time the video was published. While YouTube's algorithm distributes content over time, videos published when your audience is most active tend to accumulate early engagement signals faster, which can boost algorithmic distribution in the first 24–48 hours.</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Channel Context:</strong> Subscriber count, total channel views, and video count give you a baseline to judge the video's performance relative to the channel's overall size. A video with 50,000 views from a 500-subscriber channel is extraordinary; the same number from a 5-million-subscriber channel may indicate underperformance.</span>
                </S.FeatureListItem>
              </S.FeatureList>
            </S.EducationalContent>

            <S.EducationalContent>
              <S.SectionSubTitle>Common Use Cases</S.SectionSubTitle>
              <S.FeatureList>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Competitor Research:</strong> Analyze the top 5–10 videos in your niche to understand what titles, tag strategies, and description structures are earning high engagement. Look for patterns in videos with above-average engagement rates and reverse-engineer their approach.</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Pre-Publish Audit:</strong> Before publishing a new video, analyze a comparable top-performing video in your niche. Use its SEO score, tag count, and description length as a benchmark to ensure your own upload meets the same quality bar before it goes live.</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Optimization of Existing Videos:</strong> Analyze your own older videos that are not getting views. A low SEO score combined with a sparse description often means the video simply was not properly optimized at upload. Updating the title, description, and tags of an existing video can meaningfully improve its search ranking.</span>
                </S.FeatureListItem>
              </S.FeatureList>
            </S.EducationalContent>

            <S.EducationalContent>
              <S.SectionSubTitle>Frequently Asked Questions</S.SectionSubTitle>
              <S.FeatureList>
                <S.FeatureListItem>
                  <i className="bx bx-help-circle"></i>
                  <span><strong>Can I analyze private or unlisted videos?</strong> Private videos cannot be accessed via the YouTube Data API. Unlisted videos can be analyzed if you have the direct video URL, since the API returns data for any video accessible with a valid link.</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-help-circle"></i>
                  <span><strong>Is the SEO score the same as YouTube's internal ranking signal?</strong> No. The SEO score is our own calculated metric based on publicly observable signals — title, description, and tags. YouTube's actual search ranking involves many additional factors including watch time, click-through rate, and viewer satisfaction that are not publicly accessible. The score is a useful proxy, not a definitive measure.</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-help-circle"></i>
                  <span><strong>How current is the data?</strong> Data is fetched live from the YouTube Data API each time you analyze a video. View counts, like counts, and comment counts reflect the current state at the moment of analysis.</span>
                </S.FeatureListItem>
              </S.FeatureList>
            </S.EducationalContent>

            <S.EducationalContent>
              <S.SectionSubTitle>Related Tools</S.SectionSubTitle>
              <S.FeatureList>
                <S.FeatureListItem>
                  <i className="bx bx-link"></i>
                  <span><a href="/tools/channel-analyzer"><strong>Channel Analyzer</strong></a> — Analyze the full channel behind the video for a broader performance picture.</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-link"></i>
                  <span><a href="/tools/tag-generator"><strong>Tag Generator</strong></a> — Generate an optimized tag set for your next video based on your title.</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-link"></i>
                  <span><a href="/tools/outlier-finder"><strong>Outlier Finder</strong></a> — Find videos in any niche that significantly outperformed their channel average.</span>
                </S.FeatureListItem>
              </S.FeatureList>
            </S.EducationalContent>

            <S.EducationalContent>
              <S.SectionSubTitle>Frequently Asked Questions</S.SectionSubTitle>
              <S.FeatureList>
                <S.FeatureListItem>
                  <strong>Q: What data does the Video Analyzer pull?</strong> The tool uses the YouTube Data API v3 to fetch video title, description, tags, view count, like count, comment count, duration, publish date, and thumbnail URLs. No private data is accessed — only publicly available information.
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <strong>Q: Can I analyze competitor videos?</strong> Yes. Paste any public YouTube video URL or video ID. The tool works on any public video regardless of which channel owns it, making it useful for competitive research.
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <strong>Q: Does this tool require a YouTube account?</strong> No. The Video Analyzer works entirely through the public YouTube Data API. You do not need to log in or connect your YouTube account.
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <strong>Q: What does the SEO score measure?</strong> The SEO score evaluates factors like title length, description completeness, tag count and relevance, and thumbnail presence. Higher scores correlate with better discoverability in YouTube search.
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <strong>Q: How often is the data updated?</strong> Data is pulled live from the YouTube API each time you analyze a video. View counts and engagement metrics reflect the current state of the video at the time of analysis.
                </S.FeatureListItem>
              </S.FeatureList>
            </S.EducationalContent>

            <S.EducationalContent>
              <S.SectionSubTitle>Related Tools</S.SectionSubTitle>
              <S.FeatureList>
                <S.FeatureListItem>
                  <strong><a href="/tools/channel-analyzer">Channel Analyzer</a></strong> — Analyze an entire channel's performance, not just a single video.
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <strong><a href="/tools/tag-generator">Tag Generator</a></strong> — Generate optimized tag sets based on your video topic and niche.
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <strong><a href="/tools/outlier-finder">Outlier Finder</a></strong> — Identify which videos in a channel are dramatically outperforming their baseline.
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <strong><a href="/tools/thumbnail-tester">Thumbnail Tester</a></strong> — A/B test your thumbnails to see which performs better before publishing.
                </S.FeatureListItem>
              </S.FeatureList>
            </S.EducationalContent>

          </S.EducationalSection>
        )}

        <S.ResultsContainer className={showResults ? 'visible' : ''}>
          {isLoading ? (
            <S.LoadingContainer>
              <i className='bx bx-loader-alt bx-spin'></i>
              <p>{loadingStage || 'Analyzing video...'}</p>
            </S.LoadingContainer>
          ) : (videoData && channelData && analysisResults) ? (
            <>
              {(videoData && channelData && analysisResults) && (
                <S.VideoInfo>
                  <S.ThumbnailContainer>
                    <S.Thumbnail
                      src={videoData.snippet.thumbnails.maxres?.url || videoData.snippet.thumbnails.high.url}
                      alt={videoData.snippet.title}
                    />
                    <S.VideoDuration>
                      {analysisResults.technicalDetails.durationFormatted}
                    </S.VideoDuration>
                    <S.ThumbnailDownloadButton
                      onClick={() => {
                        // Create a cleaner filename
                        const cleanTitle = videoData.snippet.title
                          .replace(/[^\w\s-]/g, '') // Remove special chars except word chars, spaces, and hyphens
                          .replace(/\s+/g, '_') // Replace spaces with single underscore
                          .replace(/_+/g, '_') // Replace multiple underscores with single
                          .replace(/^_|_$/g, '') // Remove leading/trailing underscores
                          .toLowerCase()
                          .substring(0, 50); // Limit to 50 characters

                        downloadThumbnail(
                          videoData.snippet.thumbnails.maxres?.url || videoData.snippet.thumbnails.high.url,
                          `${cleanTitle || 'youtube_video'}_thumbnail.jpg`
                        );
                      }}
                      title="Download Thumbnail"
                    >
                      <i className="bx bx-image default-icon"></i>
                      <i className="bx bx-download hover-icon"></i>
                    </S.ThumbnailDownloadButton>
                  </S.ThumbnailContainer>

                  <S.VideoDetails>
                    <S.VideoTitle>{videoData.snippet.title}</S.VideoTitle>
                    <S.ChannelInfo>
                      <S.ChannelLogo
                        src={channelData.snippet.thumbnails.default.url}
                        alt={channelData.snippet.title}
                      />
                      <S.ChannelText>
                        <S.ChannelName>{channelData.snippet.title}</S.ChannelName>
                        <S.SubscriberCount>
                          {parseInt(channelData.statistics.subscriberCount).toLocaleString()} subscribers
                        </S.SubscriberCount>
                      </S.ChannelText>
                    </S.ChannelInfo>
                    <S.ViewVideoButton
                      onClick={() => window.open(`https://youtube.com/watch?v=${videoId || extractVideoId(videoUrl)}`, '_blank')}
                    >
                      <i className="bx bx-play"></i>
                      Watch on YouTube
                    </S.ViewVideoButton>
                  </S.VideoDetails>
                </S.VideoInfo>
              )}

              <S.TabNavigation>
                <S.TabButton
                  isActive={activeTab === 'overview'}
                  onClick={() => setActiveTab('overview')}
                  disabled={!videoData || !channelData || !analysisResults}
                >
                  <i className="bx bx-chart"></i>
                  <span>Overview</span>
                </S.TabButton>
                <S.TabButton
                  isActive={activeTab === 'details'}
                  onClick={() => setActiveTab('details')}
                  disabled={!videoData || !channelData || !analysisResults}
                >
                  <i className="bx bx-info-circle"></i>
                  <span>Details</span>
                </S.TabButton>
                <S.TabButton
                  isActive={activeTab === 'channel'}
                  onClick={() => setActiveTab('channel')}
                  disabled={!videoData || !channelData || !analysisResults}
                >
                  <i className="bx bx-user"></i>
                  <span>Channel</span>
                </S.TabButton>
              </S.TabNavigation>

              {activeTab === 'overview' && renderOverviewTab()}
              {activeTab === 'details' && renderDetailsTab()}
              {activeTab === 'channel' && renderChannelTab()}

            </>
          ) : null}
        </S.ResultsContainer>
      </S.MainContainer>
      </S.PageWrapper>
    </>
  );
};

export default VideoAnalyzer;