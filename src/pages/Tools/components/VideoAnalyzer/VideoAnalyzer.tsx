// src/pages/Tools/components/VideoAnalyzer/VideoAnalyzer.tsx - IMPROVED VERSION
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ToolPageWrapper } from '../../../../components/ToolPageWrapper';
import { SEO } from '../../../../components/SEO';
import { toolsSEO, generateToolSchema } from '../../../../config/toolsSEO';
import * as S from './styles';
import moment from 'moment';
import { ANALYTICS_QUESTIONS, AnalyticsQuestion } from './analyticsQuestions';
import { AnalyticsCalculator, AnalyticsResult } from './analyticsCalculator';

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

const VideoAnalyzer: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [videoData, setVideoData] = useState<any>(null);
  const [channelData, setChannelData] = useState<any>(null);
  const [channelVideos, setChannelVideos] = useState<ChannelVideo[]>([]);
  const [analysisResults, setAnalysisResults] = useState<VideoAnalysis | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // AI Chatbot Interface States
  const [chatQuery, setChatQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedDropdownIndex, setSelectedDropdownIndex] = useState(-1);
  const [askVideoType, setAskVideoType] = useState<'long-form' | 'shorts'>('long-form');
  const [analyticsResults, setAnalyticsResults] = useState<{ [key: string]: AnalyticsResult }>({});
  const [calculatingQuestion, setCalculatingQuestion] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<AnalyticsResult | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{
    type: 'user' | 'assistant';
    content: string;
    result?: AnalyticsResult;
    timestamp: Date;
  }>>([]);

  // Enhanced search function with fuzzy matching
  const searchQuestions = useMemo(() => {
    if (!chatQuery.trim()) return [];

    const query = chatQuery.toLowerCase();
    const words = query.split(' ').filter(word => word.length > 0);

    const scoredQuestions = ANALYTICS_QUESTIONS
      .filter(question => {
        // Filter by video type
        return question.videoType === 'both' || question.videoType === askVideoType;
      })
      .map(question => {
        let score = 0;
        const searchableText = [
          question.question,
          question.category,
          question.description,
          ...question.tags
        ].join(' ').toLowerCase();

        // Exact phrase match gets highest score
        if (searchableText.includes(query)) {
          score += 100;
        }

        // All words present gets high score
        const allWordsPresent = words.every(word => searchableText.includes(word));
        if (allWordsPresent) {
          score += 50;
        }

        // Individual word matches
        words.forEach(word => {
          if (searchableText.includes(word)) {
            score += 10;
          }
        });

        // Question text matches get bonus
        if (question.question.toLowerCase().includes(query)) {
          score += 30;
        }

        // Category matches get bonus
        if (question.category.toLowerCase().includes(query)) {
          score += 20;
        }

        // Tag matches get bonus
        question.tags.forEach(tag => {
          if (tag.toLowerCase().includes(query)) {
            score += 15;
          }
        });

        return { question, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8) // Limit to 8 suggestions
      .map(({ question }) => question);

    return scoredQuestions;
  }, [chatQuery, askVideoType]);

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

  // Switch to overview tab when analysis results become available
  useEffect(() => {
    if (analysisResults && videoData && channelData) {
      // Only switch to overview if we're not already on a valid tab
      if (activeTab === 'ask' && !analysisResults) {
        setActiveTab('overview');
      }
    }
  }, [analysisResults, videoData, channelData]);

  // Handle keyboard navigation for dropdown
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showDropdown || searchQuestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedDropdownIndex(prev =>
            prev < searchQuestions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedDropdownIndex(prev =>
            prev > 0 ? prev - 1 : searchQuestions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedDropdownIndex >= 0 && selectedDropdownIndex < searchQuestions.length) {
            handleQuestionSelect(searchQuestions[selectedDropdownIndex]);
          } else if (searchQuestions.length > 0) {
            handleQuestionSelect(searchQuestions[0]);
          }
          break;
        case 'Escape':
          setShowDropdown(false);
          setSelectedDropdownIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showDropdown, searchQuestions, selectedDropdownIndex]);

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
        title: video.snippet.title,
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
    if (contentAnalysis.titleLength >= 50 && contentAnalysis.titleLength <= 60) {
      titleScore = 35;
      titleReason = `Perfect length (${contentAnalysis.titleLength} chars) - maximizes visibility`;
    } else if (contentAnalysis.titleLength >= 40 && contentAnalysis.titleLength <= 70) {
      titleScore = 25;
      titleReason = `Good length (${contentAnalysis.titleLength} chars) - could be optimized`;
    } else if (contentAnalysis.titleLength >= 30 && contentAnalysis.titleLength <= 80) {
      titleScore = 15;
      titleReason = `Acceptable length (${contentAnalysis.titleLength} chars) - room for improvement`;
    } else {
      titleScore = 5;
      titleReason = `Poor length (${contentAnalysis.titleLength} chars) - ${contentAnalysis.titleLength < 30 ? 'too short' : 'too long'}`;
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

    if (contentAnalysis.titleLength >= 40 && contentAnalysis.titleLength <= 60) {
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
    if (contentAnalysis.titleLength < 40) {
      improvements.push(`Title too short (${contentAnalysis.titleLength} chars) - missing keyword opportunities`);
      const missingChars = 50 - contentAnalysis.titleLength;
      recommendations.push(`Add ${missingChars} more characters with high-search keywords. Consider adding: numbers, year, or emotional triggers`);
    } else if (contentAnalysis.titleLength > 60) {
      improvements.push(`Title too long (${contentAnalysis.titleLength} chars) - will be truncated in search`);
      recommendations.push(`Shorten title to 50-60 chars. Move less important words to description`);
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

  const handleQuestionSelect = async (question: AnalyticsQuestion) => {
    // Check if we have the necessary data
    if (!videoData || !channelData || channelVideos.length === 0) {
      // Add error message to conversation
      const errorMessage = {
        type: 'assistant' as const,
        content: 'Please analyze a video first to get analytics results! Go to the Overview tab and enter a YouTube URL.',
        timestamp: new Date()
      };
      setConversationHistory(prev => [...prev, errorMessage]);
      setChatQuery('');
      setShowDropdown(false);
      return;
    }

    // Add user question to conversation
    const userMessage = {
      type: 'user' as const,
      content: question.question,
      timestamp: new Date()
    };
    setConversationHistory(prev => [...prev, userMessage]);

    setCalculatingQuestion(question.id);
    setChatQuery('');
    setShowDropdown(false);

    try {
      // Add a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));

      const calculator = new AnalyticsCalculator(videoData, channelData, channelVideos);
      const result = calculator.calculateAnswer(question);

      setAnalyticsResults(prev => ({
        ...prev,
        [question.id]: result
      }));

      // Add assistant response to conversation
      const assistantMessage = {
        type: 'assistant' as const,
        content: result.answer,
        result: result,
        timestamp: new Date()
      };
      setConversationHistory(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error calculating analytics:', error);
      const errorMessage = {
        type: 'assistant' as const,
        content: 'Sorry, there was an error calculating this analytics question. Please try again.',
        timestamp: new Date()
      };
      setConversationHistory(prev => [...prev, errorMessage]);
    } finally {
      setCalculatingQuestion(null);
    }
  };

  const handleChatSubmit = () => {
    if (!chatQuery.trim()) return;

    if (searchQuestions.length > 0) {
      handleQuestionSelect(searchQuestions[0]);
    } else {
      // Add user message and no results found
      const userMessage = {
        type: 'user' as const,
        content: chatQuery,
        timestamp: new Date()
      };
      const assistantMessage = {
        type: 'assistant' as const,
        content: `I couldn't find any analytics questions matching "${chatQuery}". Try asking about video performance, engagement metrics, or upload patterns.`,
        timestamp: new Date()
      };
      setConversationHistory(prev => [...prev, userMessage, assistantMessage]);
      setChatQuery('');
      setShowDropdown(false);
    }
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
      avgViewsPerDayComparison
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
      return;
    }

    setIsLoading(true);
    setShowResults(false);
    setLoadingStage('Fetching video data...');

    // Clear conversation history when analyzing new video
    setConversationHistory([]);

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

      // Add welcome message to conversation
      const welcomeMessage = {
        type: 'assistant' as const,
        content: `Hi! I've analyzed "${video.snippet.title}" and I'm ready to answer your analytics questions. What would you like to know about this video's performance?`,
        timestamp: new Date()
      };
      setConversationHistory([welcomeMessage]);

    } catch (error) {
      console.error('Error:', error);
      alert(`An error occurred while analyzing the video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      setLoadingStage('');
    }
  };

  const renderOverviewTab = () => {
    if (!analysisResults) return null;

    return (
      <S.TabContent>
        <S.MetricsGrid>
          <S.MetricCard>
            <S.MetricIcon className="bx bx-show"></S.MetricIcon>
            <S.MetricValue>{analysisResults.basicMetrics.views.toLocaleString()}</S.MetricValue>
            <S.MetricLabel>Views</S.MetricLabel>
            <S.MetricSubtext>
              {analysisResults.channelMetrics.viewsComparison} channel average
            </S.MetricSubtext>
          </S.MetricCard>

          <S.MetricCard>
            <S.MetricIcon className="bx bx-like"></S.MetricIcon>
            <S.MetricValue>{analysisResults.basicMetrics.likes.toLocaleString()}</S.MetricValue>
            <S.MetricLabel>Likes</S.MetricLabel>
            <S.MetricSubtext>
              {(analysisResults.basicMetrics.likeToViewRatio * 100).toFixed(2)}% of views
            </S.MetricSubtext>
          </S.MetricCard>

          <S.MetricCard>
            <S.MetricIcon className="bx bx-comment"></S.MetricIcon>
            <S.MetricValue>{analysisResults.basicMetrics.comments.toLocaleString()}</S.MetricValue>
            <S.MetricLabel>Comments</S.MetricLabel>
            <S.MetricSubtext>
              {(analysisResults.basicMetrics.commentToViewRatio * 100).toFixed(3)}% of views
            </S.MetricSubtext>
          </S.MetricCard>

          <S.MetricCard>
            <S.MetricIcon className="bx bx-trending-up"></S.MetricIcon>
            <S.MetricValue>{(analysisResults.basicMetrics.engagementRate * 100).toFixed(2)}%</S.MetricValue>
            <S.MetricLabel>Engagement Rate</S.MetricLabel>
            <S.MetricSubtext>
              Likes + Comments / Views
            </S.MetricSubtext>
          </S.MetricCard>
        </S.MetricsGrid>

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

        {analysisResults.contentAnalysis.tags.length > 0 && (
          <S.TagsContainer>
            <S.TagsHeader>
              <S.SectionTitle>
                <i className="bx bx-tag"></i>
                Video Tags ({analysisResults.contentAnalysis.tags.length})
              </S.SectionTitle>
              <S.CopyTagsButton onClick={() => {
                navigator.clipboard.writeText(analysisResults.contentAnalysis.tags.join(', '));
                alert('Tags copied to clipboard!');
              }}>
                <i className="bx bx-copy"></i>
                Copy All
              </S.CopyTagsButton>
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

        {/* Key Insights Section - Dynamic based on performance */}
        <S.InsightsGrid>
          {/* Top strengths - show max 2 */}
          {analysisResults.insights.strengths.slice(0, 2).map((strength, index) => (
            <S.InsightCard key={`strength-${index}`} type="success">
              <S.InsightCardIcon>
                <i className="bx bx-check-circle"></i>
              </S.InsightCardIcon>
              <S.InsightCardContent>
                <S.InsightCardTitle>Strength</S.InsightCardTitle>
                <S.InsightCardText>{strength}</S.InsightCardText>
              </S.InsightCardContent>
            </S.InsightCard>
          ))}

          {/* Critical improvements - show max 2 */}
          {analysisResults.insights.improvements.slice(0, 2).map((improvement, index) => (
            <S.InsightCard key={`improvement-${index}`} type="warning">
              <S.InsightCardIcon>
                <i className="bx bx-error-circle"></i>
              </S.InsightCardIcon>
              <S.InsightCardContent>
                <S.InsightCardTitle>Needs Attention</S.InsightCardTitle>
                <S.InsightCardText>{improvement}</S.InsightCardText>
              </S.InsightCardContent>
            </S.InsightCard>
          ))}

          {/* Top recommendations - show max 2 */}
          {analysisResults.insights.recommendations.slice(0, 2).map((rec, index) => (
            <S.InsightCard key={`rec-${index}`} type="info">
              <S.InsightCardIcon>
                <i className="bx bx-bulb"></i>
              </S.InsightCardIcon>
              <S.InsightCardContent>
                <S.InsightCardTitle>Quick Win</S.InsightCardTitle>
                <S.InsightCardText>{rec}</S.InsightCardText>
              </S.InsightCardContent>
            </S.InsightCard>
          ))}
        </S.InsightsGrid>
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
      </S.TabContent>
    );
  };

  const renderChannelTab = () => {
    if (!analysisResults || !channelData) return null;

    return (
      <S.TabContent>
        <S.DetailSection>
          <S.DetailTitle>
            <i className="bx bx-user-circle"></i>
            Channel Overview
          </S.DetailTitle>
          <S.DetailGrid>
            <S.DetailItem>
              <S.DetailLabel>Subscribers</S.DetailLabel>
              <S.DetailValue>{analysisResults.basicMetrics.subscribers.toLocaleString()}</S.DetailValue>
            </S.DetailItem>
            <S.DetailItem>
              <S.DetailLabel>Total Videos</S.DetailLabel>
              <S.DetailValue>{analysisResults.channelMetrics.totalVideos.toLocaleString()}</S.DetailValue>
            </S.DetailItem>
            <S.DetailItem>
              <S.DetailLabel>Total Channel Views</S.DetailLabel>
              <S.DetailValue>{analysisResults.channelMetrics.totalViews.toLocaleString()}</S.DetailValue>
            </S.DetailItem>
            <S.DetailItem>
              <S.DetailLabel>Channel Age</S.DetailLabel>
              <S.DetailValue>
                {Math.floor(analysisResults.channelMetrics.channelAge / 365) > 0
                  ? `${Math.floor(analysisResults.channelMetrics.channelAge / 365)} years, ${Math.floor((analysisResults.channelMetrics.channelAge % 365) / 30)} months`
                  : `${Math.floor(analysisResults.channelMetrics.channelAge / 30)} months`}
              </S.DetailValue>
            </S.DetailItem>
            <S.DetailItem>
              <S.DetailLabel>Views Per Subscriber</S.DetailLabel>
              <S.DetailValue>{analysisResults.channelMetrics.subscriberToViewRatio.toFixed(1)}x</S.DetailValue>
            </S.DetailItem>
            <S.DetailItem>
              <S.DetailLabel>Upload Consistency</S.DetailLabel>
              <S.DetailValue>{analysisResults.channelMetrics.uploadFrequency}</S.DetailValue>
            </S.DetailItem>
          </S.DetailGrid>
        </S.DetailSection>

        <S.DetailSection>
          <S.DetailTitle>
            <i className="bx bx-trending-up"></i>
            Performance Metrics
          </S.DetailTitle>
          <S.DetailGrid>
            <S.DetailItem>
              <S.DetailLabel>Avg Views/Video</S.DetailLabel>
              <S.DetailValue>{Math.round(analysisResults.channelMetrics.avgViewsPerVideo).toLocaleString()}</S.DetailValue>
            </S.DetailItem>
            <S.DetailItem>
              <S.DetailLabel>Avg Likes/Video</S.DetailLabel>
              <S.DetailValue>{Math.round(analysisResults.channelMetrics.avgLikesPerVideo).toLocaleString()}</S.DetailValue>
            </S.DetailItem>
            <S.DetailItem>
              <S.DetailLabel>Avg Comments/Video</S.DetailLabel>
              <S.DetailValue>{Math.round(analysisResults.channelMetrics.avgCommentsPerVideo).toLocaleString()}</S.DetailValue>
            </S.DetailItem>
            <S.DetailItem>
              <S.DetailLabel>Current Video Performance</S.DetailLabel>
              <S.DetailValue>
                <S.PerformanceIndicator type={analysisResults.channelMetrics.viewsComparison}>
                  {analysisResults.channelMetrics.viewsComparison === 'above' && <i className="bx bx-up-arrow-alt"></i>}
                  {analysisResults.channelMetrics.viewsComparison === 'below' && <i className="bx bx-down-arrow-alt"></i>}
                  {analysisResults.channelMetrics.viewsComparison === 'average' && <i className="bx bx-minus"></i>}
                  {analysisResults.channelMetrics.viewsComparison} average
                </S.PerformanceIndicator>
              </S.DetailValue>
            </S.DetailItem>
            <S.DetailItem>
              <S.DetailLabel>Engagement Trend</S.DetailLabel>
              <S.DetailValue>
                <S.TrendIndicator trend={analysisResults.channelMetrics.engagementTrend}>
                  {analysisResults.channelMetrics.engagementTrend === 'improving' && <i className="bx bx-trending-up"></i>}
                  {analysisResults.channelMetrics.engagementTrend === 'declining' && <i className="bx bx-trending-down"></i>}
                  {analysisResults.channelMetrics.engagementTrend === 'stable' && <i className="bx bx-minus"></i>}
                  {analysisResults.channelMetrics.engagementTrend}
                </S.TrendIndicator>
              </S.DetailValue>
            </S.DetailItem>
            <S.DetailItem>
              <S.DetailLabel>Recent Activity</S.DetailLabel>
              <S.DetailValue>{analysisResults.channelMetrics.recentUploadRate}</S.DetailValue>
            </S.DetailItem>
          </S.DetailGrid>
        </S.DetailSection>

        {analysisResults.channelMetrics.bestPerformingVideo && (
          <S.DetailSection>
            <S.DetailTitle>
              <i className="bx bx-trophy"></i>
              Best Performing Video ({analysisResults.channelMetrics.bestVideoTimeframe})
            </S.DetailTitle>
            <S.BestVideoCard>
              <S.BestVideoTitle>{analysisResults.channelMetrics.bestPerformingVideo.title}</S.BestVideoTitle>
              <S.BestVideoStats>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span>
                    <i className="bx bx-show"></i>
                    {analysisResults.channelMetrics.bestPerformingVideo.views.toLocaleString()} views
                  </span>
                  <span style={{
                    fontSize: '0.85rem',
                    color: 'rgba(255,255,255,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <i className="bx bx-calendar"></i>
                    {analysisResults.channelMetrics.bestPerformingVideo.daysAgo} days ago
                  </span>
                </div>
                <S.WatchButton
                  onClick={() => window.open(analysisResults.channelMetrics.bestPerformingVideo?.url, '_blank')}
                >
                  <i className="bx bx-play"></i>
                  Watch Video
                </S.WatchButton>
              </S.BestVideoStats>
            </S.BestVideoCard>
          </S.DetailSection>
        )}

        <S.DetailSection>
          <S.ChannelAnalyzerCTA onClick={() => {
            const channelHandle = channelData.snippet.customUrl || `@${channelData.snippet.title.replace(/\s+/g, '')}`;
            window.open(`/tools/channel-analyzer?channel=${encodeURIComponent(channelHandle)}`, '_blank');
          }}>
            <S.CTAIcon>
              <i className="bx bx-line-chart"></i>
            </S.CTAIcon>
            <S.CTATitle>Want Deeper Channel Insights?</S.CTATitle>
            <S.CTADescription>
              Get a comprehensive analysis of {channelData.snippet.title} including growth metrics,
              content strategy analysis, audience engagement patterns, and actionable recommendations
              for channel optimization.
            </S.CTADescription>
            <S.CTAButton>
              <i className="bx bx-line-chart"></i>
              Analyze This Channel
            </S.CTAButton>
          </S.ChannelAnalyzerCTA>
        </S.DetailSection>
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

  const renderAskTab = () => {
    return (
      <S.TabContent>
        <S.AskSection>
          <S.ChatbotContainer>
            <S.ChatbotHeader>
              <S.ChatbotAvatar>
                <i className="bx bx-diamond"></i>
              </S.ChatbotAvatar>
              <S.ChatbotHeaderText>
                <S.ChatbotTitle>Video Analytics Assistant</S.ChatbotTitle>
                <S.ChatbotSubtitle>
                  Ask me anything about this video's performance, channel metrics, or optimization opportunities
                </S.ChatbotSubtitle>
              </S.ChatbotHeaderText>
              <S.VideoTypeToggle>
                <S.VideoTypeOption
                  isActive={askVideoType === 'long-form'}
                  onClick={() => setAskVideoType('long-form')}
                >
                  <i className="bx bx-video"></i>
                  Long-form
                </S.VideoTypeOption>
                <S.VideoTypeOption
                  isActive={askVideoType === 'shorts'}
                  onClick={() => setAskVideoType('shorts')}
                >
                  <i className="bx bx-mobile"></i>
                  Shorts
                </S.VideoTypeOption>
              </S.VideoTypeToggle>
            </S.ChatbotHeader>

            <S.ConversationArea>
              {conversationHistory.length === 0 ? (
                <S.WelcomeMessage>
                  <S.WelcomeIcon>
                    <i className="bx bx-chat"></i>
                  </S.WelcomeIcon>
                  <S.WelcomeText>
                    {videoData ? (
                      <>
                        <S.WelcomeTitle>Ready to analyze!</S.WelcomeTitle>
                        <S.WelcomeDescription>
                          I have all the data for "{videoData.snippet?.title}". Ask me anything about its performance,
                          engagement, SEO, or optimization opportunities.
                        </S.WelcomeDescription>
                      </>
                    ) : (
                      <>
                        <S.WelcomeTitle>Welcome to Analytics Assistant!</S.WelcomeTitle>
                        <S.WelcomeDescription>
                          First, analyze a video using the search bar above. Then come back here to ask detailed
                          questions about performance, engagement metrics, and optimization strategies.
                        </S.WelcomeDescription>
                      </>
                    )}
                  </S.WelcomeText>
                  {videoData && (
                    <S.SuggestedQuestions>
                      <S.SuggestedTitle>Try asking about:</S.SuggestedTitle>
                      <S.SuggestedList>
                        <S.SuggestedItem onClick={() => setChatQuery("average engagement rate")}>
                          <i className="bx bx-heart"></i>
                          Average engagement rate
                        </S.SuggestedItem>
                        <S.SuggestedItem onClick={() => setChatQuery("upload frequency")}>
                          <i className="bx bx-calendar"></i>
                          Upload frequency patterns
                        </S.SuggestedItem>
                        <S.SuggestedItem onClick={() => setChatQuery("video length performance")}>
                          <i className="bx bx-time"></i>
                          Video length analysis
                        </S.SuggestedItem>
                        <S.SuggestedItem onClick={() => setChatQuery("view milestones")}>
                          <i className="bx bx-trophy"></i>
                          View milestone performance
                        </S.SuggestedItem>
                      </S.SuggestedList>
                    </S.SuggestedQuestions>
                  )}
                </S.WelcomeMessage>
              ) : (
                <S.MessagesContainer>
                  {conversationHistory.map((message, index) => (
                    <S.MessageGroup key={index} isUser={message.type === 'user'}>
                      <S.MessageAvatar isUser={message.type === 'user'}>
                        {message.type === 'user' ? (
                          <i className="bx bx-user"></i>
                        ) : (
                          <i className="bx bx-diamond"></i>
                        )}
                      </S.MessageAvatar>
                      <S.MessageBubble isUser={message.type === 'user'}>
                        <S.MessageContent>{message.content}</S.MessageContent>
                        {message.result && (
                          <S.ResultPreview onClick={() => setSelectedResult(message.result!)}>
                            <S.ResultPreviewIcon>
                              <i className="bx bx-chart"></i>
                            </S.ResultPreviewIcon>
                            <S.ResultPreviewText>
                              <S.ResultPreviewTitle>View detailed results</S.ResultPreviewTitle>
                              <S.ResultPreviewSubtitle>
                                {message.result.details.length} data points • {message.result.insights.length} insights
                              </S.ResultPreviewSubtitle>
                            </S.ResultPreviewText>
                            <S.ResultPreviewArrow>
                              <i className="bx bx-chevron-right"></i>
                            </S.ResultPreviewArrow>
                          </S.ResultPreview>
                        )}
                        <S.MessageTimestamp>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </S.MessageTimestamp>
                      </S.MessageBubble>
                    </S.MessageGroup>
                  ))}
                  {calculatingQuestion && (
                    <S.MessageGroup isUser={false}>
                      <S.MessageAvatar isUser={false}>
                        <i className="bx bx-diamond"></i>
                      </S.MessageAvatar>
                      <S.MessageBubble isUser={false}>
                        <S.TypingIndicator>
                          <S.TypingDot style={{ animationDelay: '0ms' }} />
                          <S.TypingDot style={{ animationDelay: '200ms' }} />
                          <S.TypingDot style={{ animationDelay: '400ms' }} />
                          Analyzing data...
                        </S.TypingIndicator>
                      </S.MessageBubble>
                    </S.MessageGroup>
                  )}
                </S.MessagesContainer>
              )}
            </S.ConversationArea>

            <S.ChatInputContainer>
              <S.ChatInputWrapper>
                <S.ChatInput
                  type="text"
                  value={chatQuery}
                  onChange={(e) => {
                    setChatQuery(e.target.value);
                    setShowDropdown(e.target.value.length > 0);
                    setSelectedDropdownIndex(-1);
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleChatSubmit();
                    }
                  }}
                  placeholder="Ask about video performance, engagement, optimization..."
                  disabled={calculatingQuestion !== null}
                />
                <S.ChatSendButton
                  onClick={handleChatSubmit}
                  disabled={!chatQuery.trim() || calculatingQuestion !== null}
                >
                  {calculatingQuestion ? (
                    <i className="bx bx-loader-alt bx-spin"></i>
                  ) : (
                    <i className="bx bx-send"></i>
                  )}
                </S.ChatSendButton>
              </S.ChatInputWrapper>

              {showDropdown && searchQuestions.length > 0 && (
                <S.SuggestionsDropdown>
                  <S.DropdownHeader>
                    <i className="bx bx-lightbulb"></i>
                    Suggested questions:
                  </S.DropdownHeader>
                  {searchQuestions.map((question, index) => (
                    <S.DropdownItem
                      key={question.id}
                      isSelected={index === selectedDropdownIndex}
                      onClick={() => handleQuestionSelect(question)}
                    >
                      <S.DropdownItemContent>
                        <S.DropdownItemTitle>{question.question}</S.DropdownItemTitle>
                        <S.DropdownItemMeta>
                          <S.DropdownItemCategory>{question.category}</S.DropdownItemCategory>
                          <S.DropdownItemComplexity complexity={question.complexity}>
                            {question.complexity}
                          </S.DropdownItemComplexity>
                        </S.DropdownItemMeta>
                      </S.DropdownItemContent>
                      <S.DropdownItemIcon>
                        <i className="bx bx-chevron-right"></i>
                      </S.DropdownItemIcon>
                    </S.DropdownItem>
                  ))}
                </S.SuggestionsDropdown>
              )}
            </S.ChatInputContainer>
          </S.ChatbotContainer>

          {selectedResult && (
            <S.ResultsModal>
              <S.ResultsModalBackdrop onClick={() => setSelectedResult(null)} />
              <S.ResultsModalContent>
                <S.ResultsHeader>
                  <S.ResultsTitle>
                    <i className="bx bx-chart"></i>
                    Analytics Result
                  </S.ResultsTitle>
                  <S.ResultsCloseButton onClick={() => setSelectedResult(null)}>
                    <i className="bx bx-x"></i>
                  </S.ResultsCloseButton>
                </S.ResultsHeader>

                <S.ResultsBody>
                  <S.QuestionDisplay>
                    <S.QuestionLabel>Question</S.QuestionLabel>
                    <S.QuestionText>{selectedResult.question}</S.QuestionText>
                  </S.QuestionDisplay>

                  <S.AnswerDisplay>
                    <S.AnswerLabel>Answer</S.AnswerLabel>
                    <S.AnswerValue>{selectedResult.answer}</S.AnswerValue>
                  </S.AnswerDisplay>

                  {selectedResult.details.length > 0 && (
                    <S.DetailsSection>
                      <S.DetailsTitle>
                        <i className="bx bx-info-circle"></i>
                        Details
                      </S.DetailsTitle>
                      <S.DetailsList>
                        {selectedResult.details.map((detail, index) => (
                          <S.DetailItem key={index}>
                            <i className="bx bx-dot-circle"></i>
                            {detail}
                          </S.DetailItem>
                        ))}
                      </S.DetailsList>
                    </S.DetailsSection>
                  )}

                  {selectedResult.insights.length > 0 && (
                    <S.InsightsSection>
                      <S.InsightsTitle>
                        <i className="bx bx-bulb"></i>
                        Insights & Recommendations
                      </S.InsightsTitle>
                      <S.InsightsList>
                        {selectedResult.insights.map((insight, index) => (
                          <S.ResultsInsightItem key={index}>
                            <i className="bx bx-right-arrow-alt"></i>
                            {insight}
                          </S.ResultsInsightItem>
                        ))}
                      </S.InsightsList>
                    </S.InsightsSection>
                  )}

                  {selectedResult.charts && (
                    <S.ChartsSection>
                      <S.ChartsTitle>
                        <i className="bx bx-bar-chart-alt-2"></i>
                        Visual Data
                      </S.ChartsTitle>
                      <S.SimpleChart>
                        {selectedResult.charts.labels.map((label, index) => (
                          <S.ChartItem key={index}>
                            <S.ChartLabel>{label}</S.ChartLabel>
                            <S.ChartBar>
                              <S.ChartBarFill
                                width={selectedResult.charts ? (selectedResult.charts.data[index] / Math.max(...selectedResult.charts.data)) * 100 : 0}
                              />
                            </S.ChartBar>
                            <S.ChartValue>{selectedResult.charts?.data[index] || 0}</S.ChartValue>
                          </S.ChartItem>
                        ))}
                      </S.SimpleChart>
                    </S.ChartsSection>
                  )}
                </S.ResultsBody>

                <S.ResultsFooter>
                  <S.ResultsNote>
                    <i className="bx bx-info-circle"></i>
                    Results calculated from {channelVideos.length} most recent videos using YouTube API data
                  </S.ResultsNote>
                </S.ResultsFooter>
              </S.ResultsModalContent>
            </S.ResultsModal>
          )}
        </S.AskSection>
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

        {/* Educational Content Section */}
        {!showResults && (
          <S.EducationalSection>

            <S.EducationalContent>
              <S.SectionSubTitle>How to Use the Video Analyzer</S.SectionSubTitle>

              <S.EducationalText>
                Our Video Analyzer provides comprehensive insights into YouTube video performance,
                helping content creators, marketers, and researchers understand what makes videos successful.
                From engagement metrics to SEO optimization scores, get detailed analytics that drive results.
              </S.EducationalText>

              <S.StepByStep>
                <S.StepItem>
                  <S.StepNumberCircle>1</S.StepNumberCircle>
                  <S.StepContent>
                    <S.StepTitle>Enter Video URL</S.StepTitle>
                    <S.EducationalText>
                      Input any YouTube video URL into the search bar above. Our system accepts various formats
                      including youtube.com/watch?v=, youtu.be/, youtube.com/embed/, youtube.com/shorts/,
                      or direct video IDs. The analyzer works with any public YouTube video.
                    </S.EducationalText>
                  </S.StepContent>
                </S.StepItem>

                <S.StepItem>
                  <S.StepNumberCircle>2</S.StepNumberCircle>
                  <S.StepContent>
                    <S.StepTitle>Comprehensive Data Analysis</S.StepTitle>
                    <S.EducationalText>
                      Our system fetches detailed video metadata, engagement statistics, channel information,
                      and technical specifications. We analyze performance patterns, content optimization,
                      upload timing, and audience engagement metrics for complete insights.
                    </S.EducationalText>
                  </S.StepContent>
                </S.StepItem>

                <S.StepItem>
                  <S.StepNumberCircle>3</S.StepNumberCircle>
                  <S.StepContent>
                    <S.StepTitle>Review Detailed Insights</S.StepTitle>
                    <S.EducationalText>
                      Navigate through organized tabs to explore video overview, technical details,
                      channel analytics, and strategic recommendations. Use these insights to optimize
                      your content strategy and improve video performance.
                    </S.EducationalText>
                  </S.StepContent>
                </S.StepItem>
              </S.StepByStep>
            </S.EducationalContent>

            <S.EducationalContent>
              <S.SectionSubTitle>What Analytics Are Provided?</S.SectionSubTitle>

              <S.FeatureList>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Engagement Analysis:</strong> Like-to-view ratio, comment engagement rate, audience retention patterns, and social sharing metrics</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>SEO Optimization Score:</strong> Title effectiveness, description quality, tag usage, and keyword optimization recommendations</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Technical Specifications:</strong> Video resolution, duration analysis, upload quality, captions availability, and format details</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Content Performance:</strong> View velocity, subscriber conversion rate, watch time estimates, and trending potential analysis</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Channel Context:</strong> Publisher information, subscriber count, upload frequency, and channel authority metrics</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Upload Timing Analysis:</strong> Publication date strategy, optimal posting times, and schedule consistency evaluation</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Competitive Insights:</strong> Performance benchmarking, niche analysis, and content gap identification for strategic planning</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Strategic Recommendations:</strong> Actionable insights for content optimization, audience growth, and engagement improvement</span>
                </S.FeatureListItem>
              </S.FeatureList>
            </S.EducationalContent>

          </S.EducationalSection>
        )}

        <S.ResultsContainer className={showResults || activeTab === 'ask' ? 'visible' : ''}>
          {isLoading ? (
            <S.LoadingContainer>
              <i className='bx bx-loader-alt bx-spin'></i>
              <p>{loadingStage || 'Analyzing video...'}</p>
            </S.LoadingContainer>
          ) : (activeTab === 'ask' || (videoData && channelData && analysisResults)) ? (
            <>
              {(videoData && channelData && analysisResults) && (
                <S.VideoInfo>
                  <S.ThumbnailContainer>
                    <S.Thumbnail
                      src={videoData.snippet.thumbnails.maxres?.url || videoData.snippet.thumbnails.high.url}
                      alt={videoData.snippet.title}
                    />
                    <S.ThumbnailOverlay>
                      <S.DownloadThumbnailButton
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
                      >
                        <i className="bx bx-download"></i>
                        Download Thumbnail
                      </S.DownloadThumbnailButton>
                    </S.ThumbnailOverlay>
                    <S.VideoDuration>
                      {analysisResults.technicalDetails.durationFormatted}
                    </S.VideoDuration>
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
                {/* Only show Ask tab after video analysis */}
                {(videoData && channelData && analysisResults) && (
                  <S.TabButton
                    isActive={activeTab === 'ask'}
                    onClick={() => setActiveTab('ask')}
                  >
                    <i className="bx bx-diamond"></i>
                    <span>Ask</span>
                  </S.TabButton>
                )}
              </S.TabNavigation>

              {activeTab === 'overview' && renderOverviewTab()}
              {activeTab === 'details' && renderDetailsTab()}
              {activeTab === 'channel' && renderChannelTab()}
              {activeTab === 'ask' && renderAskTab()}

            </>
          ) : null}
        </S.ResultsContainer>
      </S.MainContainer>
      </S.PageWrapper>
    </>
  );
};

export default VideoAnalyzer;