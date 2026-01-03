// src/pages/Tools/components/ChannelAnalyzer/ChannelAnalyzer.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { Button } from '../../../../components/Button/Button';
import { SEO } from '../../../../components/SEO';
import { GoogleAd } from '../../../../components/GoogleAd';
import { toolsSEO, generateToolSchema } from '../../../../config/toolsSEO';
import * as S from './styles';

interface VideoData {
  id: string;
  title: string;
  thumbnail: string;
  views: number;
  likes: number;
  comments: number;
  publishedAt: string;
  duration: string;
  tags: string[];
  description: string;
}

interface ScoreBreakdown {
  label: string;
  score: number;
  max: number;
  status: 'good' | 'warning' | 'poor';
}

interface ChannelAnalysis {
  achievements: string[];
  drawbacks: string[];
  flaggedWords: string[];
  seoScore: number;
  engagementScore: number;
  consistencyScore: number;
  brandingScore: number;
  seoBreakdown: ScoreBreakdown[];
  engagementBreakdown: ScoreBreakdown[];
  consistencyBreakdown: ScoreBreakdown[];
  brandingBreakdown: ScoreBreakdown[];
}

interface ChannelMetrics {
  totalViews: number;
  totalVideos: number;
  totalSubscribers: number;
  averageViewsPerVideo: number;
  viewsPerSubscriber: number;
  creationDate: Date;
  country: string;
  channelId: string;
  subscriberBenefitLevel: string;
  madeForKids: boolean;
  topicCategories: string[];
}

const flaggableWords = [
  "ahole", "anus", "ass", "asshole", "bastard", "bitch", "fuck", "shit",
  // ... add more as needed from your list
];

// Helper function to decode HTML entities
const decodeHTMLEntities = (text: string): string => {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
};

export const ChannelAnalyzer: React.FC = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const navigate = useNavigate();
  const [channelUrl, setChannelUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [channelData, setChannelData] = useState<any>(null);
  const [playlistData, setPlaylistData] = useState<any>(null);
  const [latestVideoData, setLatestVideoData] = useState<any>(null);
  const [topVideos, setTopVideos] = useState<VideoData[]>([]);
  const [recentVideoCount, setRecentVideoCount] = useState<number>(0);
  const [analysisResults, setAnalysisResults] = useState<ChannelAnalysis | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Tool configuration
  const toolConfig = {
    name: 'Channel Analyzer',
    description: 'Comprehensive channel analytics with growth tracking, competitor analysis, and optimization recommendations',
    image: 'https://64.media.tumblr.com/ac9ad9e3a75b264881169b38018b6be8/0e01452f9f6dd974-e5/s2048x3072/8c12986bb347fdcb8bb1f003ca88748e35b437d8.jpg',
    icon: 'bx bx-line-chart',
    features: [
      'Growth tracking',
      'Competitor analysis',
      'Optimization recommendations'
    ]
  };

  useEffect(() => {
    // Check for URL search params first
    const urlParams = new URLSearchParams(window.location.search);
    const channelParam = urlParams.get('channel');

    if (channelParam) {
      // Just prefill the input field, don't auto-analyze
      setChannelUrl(channelParam);
    } else if (channelId) {
      setChannelUrl(`https://youtube.com/channel/${channelId}`);
      handleAnalyze(channelId);
    }
  }, [channelId]);

  const getChannelId = async (input: string): Promise<string> => {
    // First check if it's a direct channel ID
    if (/^UC[\w-]{22}$/.test(input)) {
      return input;
    }

    // Check if it's just a handle (with or without @)
    if (/^@?[\w-]+$/.test(input) && !input.includes('youtube.com')) {
      const handle = input.startsWith('@') ? input.substring(1) : input;
      const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY_10;

      // First try forHandle
      let response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${handle}&key=${API_KEY}`
      );
      let data = await response.json();
      if (data.items?.[0]) {
        return data.items[0].id;
      }

      // If not found, try search
      response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(handle)}&type=channel&maxResults=1&key=${API_KEY}`
      );
      data = await response.json();
      if (data.items?.[0]) {
        return data.items[0].id.channelId;
      }

      throw new Error(`Channel not found for handle: ${input}`);
    }

    const urlPatterns = {
      channel: /youtube\.com\/channel\/(UC[\w-]{22})/,
      user: /youtube\.com\/user\/(\w+)/,
      handle: /youtube\.com\/@([\w-]+)/,
      handleWithoutAt: /youtube\.com\/([^/?]+)$/,  // Matches youtube.com/moneyguyshow
      customUrl: /youtube\.com\/(c\/)?(\w+)/
    };

    for (const [type, pattern] of Object.entries(urlPatterns)) {
      const match = input.match(pattern);
      if (match) {
        if (type === 'channel') {
          return match[1];
        } else if (type === 'handleWithoutAt') {
          // Try to fetch by handle (without @)
          const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY_10;
          const handle = match[1];

          // First try forHandle
          let response = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${handle}&key=${API_KEY}`
          );
          let data = await response.json();
          if (data.items?.[0]) {
            return data.items[0].id;
          }

          // If not found, try search
          response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(handle)}&type=channel&maxResults=1&key=${API_KEY}`
          );
          data = await response.json();
          if (data.items?.[0]) {
            return data.items[0].id.channelId;
          }
        } else {
          const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY_10;
          const response = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=id&${type === 'user' ? 'forUsername' : 'forHandle'}=${match[1]}&key=${API_KEY}`
          );
          const data = await response.json();
          if (data.items?.[0]) {
            return data.items[0].id;
          }
        }
      }
    }

    throw new Error('Invalid channel URL or ID');
  };

  const handleSearch = async () => {
    try {
      const extractedId = await getChannelId(channelUrl);
      if (extractedId) {
        navigate(`/tools/channel-analyzer/${extractedId}`);
      } else {
        alert('Invalid channel URL or ID');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Invalid channel URL or ID');
    }
  };

  const handleAnalyze = async (id?: string) => {
    if (!id && !channelUrl.trim()) {
      alert('Please enter a YouTube channel URL');
      return;
    }

    setIsLoading(true);
    setShowResults(false);

    try {
      const channelId = id || await getChannelId(channelUrl);
      const channel = await fetchChannelData(channelId);
      const playlists = await fetchPlaylistData(channelId);
      const latestVideo = await fetchLatestVideoData(channelId);
      const videos = await fetchTopVideos(channelId);
      const recentVideos = await fetchRecentVideos(channelId);

      setChannelData(channel);
      setPlaylistData(playlists);
      setLatestVideoData(latestVideo);
      setTopVideos(videos);
      setRecentVideoCount(recentVideos);

      const analysis = analyzeChannelData(latestVideo, channel, playlists, videos, recentVideos);
      setAnalysisResults(analysis);
      setShowResults(true);
    } catch (error) {
      console.error('Error:', error);
      alert(`An error occurred while analyzing the channel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getFullSizeBannerUrl = (bannerUrl: string): string => {
    if (!bannerUrl) return '';
    
    // Check if the URL already has parameters
    if (bannerUrl.includes('=w')) {
      // Replace existing parameters with full size ones
      return bannerUrl.replace(/=w\d+-.+/, '=w2120-fcrop64=1,00000000ffffffff-k-c0xffffffff-no-nd-rj');
    }
    
    // Add parameters for full size if none exist
    return `${bannerUrl}=w2120-fcrop64=1,00000000ffffffff-k-c0xffffffff-no-nd-rj`;
  };

  const fetchChannelData = async (channelId: string) => {
    const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY_10;
    if (!API_KEY) {
      throw new Error('YouTube API key not configured');
    }
    
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?` +
      `part=snippet,statistics,brandingSettings,status,topicDetails,contentDetails&` +
      `id=${channelId}&key=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch channel data');
    }
    
    const data = await response.json();
    if (!data.items?.[0]) {
      throw new Error('Channel not found');
    }
    
    // Debug logging - check console to see what topicDetails contains
    console.log('Topic Details from API:', data.items[0].topicDetails);
    
    return data.items[0];
  };

  const fetchPlaylistData = async (channelId: string) => {
    const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY_10;
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?` +
      `part=id&channelId=${channelId}&maxResults=5&key=${API_KEY}`
    );
    const data = await response.json();
    return data.items || [];
  };

  const fetchLatestVideoData = async (channelId: string) => {
    const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY_10;
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&channelId=${channelId}&order=date&type=video&` +
      `maxResults=1&key=${API_KEY}`
    );
    const data = await response.json();
    if (!data.items?.[0]) throw new Error('No videos found');
    return data.items[0];
  };

  const fetchRecentVideos = async (channelId: string): Promise<number> => {
    const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY_10;

    // Calculate date 6 months ago
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const publishedAfter = sixMonthsAgo.toISOString();

    // Get videos from last 6 months
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&channelId=${channelId}&order=date&type=video&` +
      `maxResults=50&publishedAfter=${publishedAfter}&key=${API_KEY}`
    );
    const searchData = await searchResponse.json();

    return searchData.items?.length || 0;
  };

  const fetchTopVideos = async (channelId: string): Promise<VideoData[]> => {
    const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY_10;

    // Get top 6 videos by view count
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&channelId=${channelId}&order=viewCount&type=video&` +
      `maxResults=6&key=${API_KEY}`
    );
    const searchData = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) {
      return [];
    }

    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

    // Get detailed stats for videos
    const statsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?` +
      `part=statistics,contentDetails,snippet&id=${videoIds}&key=${API_KEY}`
    );
    const statsData = await statsResponse.json();

    return searchData.items.map((searchItem: any, index: number) => {
      const statsItem = statsData.items.find((stat: any) => stat.id === searchItem.id.videoId);
      return {
        id: searchItem.id.videoId,
        title: decodeHTMLEntities(searchItem.snippet.title),
        thumbnail: searchItem.snippet.thumbnails.medium?.url || searchItem.snippet.thumbnails.default.url,
        views: parseInt(statsItem?.statistics?.viewCount || '0'),
        likes: parseInt(statsItem?.statistics?.likeCount || '0'),
        comments: parseInt(statsItem?.statistics?.commentCount || '0'),
        publishedAt: searchItem.snippet.publishedAt,
        duration: statsItem?.contentDetails?.duration || 'PT0S',
        tags: statsItem?.snippet?.tags || [],
        description: decodeHTMLEntities(statsItem?.snippet?.description || '')
      };
    });
  };

  const analyzeChannelData = (
    latestVideoData: any,
    channelData: any,
    playlistData: any,
    topVideos: VideoData[],
    recentVideoCount: number
  ): ChannelAnalysis => {
    const achievements: string[] = [];
    const drawbacks: string[] = [];
    const flaggedWords: string[] = [];

    // Calculate scores
    let seoScore = 0;
    let engagementScore = 0;
    let consistencyScore = 0;
    let brandingScore = 0;

    const channelKeywords = channelData.brandingSettings?.channel?.keywords || '';
    const channelDescription = channelData.snippet.description;
    const lastVideoPostedDate = new Date(latestVideoData.snippet.publishedAt);
    const today = new Date();
    const differenceInWeeks = Math.floor((today.getTime() - lastVideoPostedDate.getTime()) / (7 * 24 * 60 * 60 * 1000));

    // Check for flaggable words (whole word matches only)
    const checkContentForFlags = (content: string) => {
      if (!content) return [];
      return flaggableWords.filter(word => {
        // Use word boundaries to match whole words only, not substrings
        const regex = new RegExp(`\\b${word.toLowerCase()}\\b`, 'i');
        return regex.test(content);
      });
    };

    flaggedWords.push(
      ...checkContentForFlags(channelData.snippet.title),
      ...checkContentForFlags(channelKeywords),
      ...checkContentForFlags(channelDescription)
    );

    // Content moderation check
    if (flaggedWords.length === 0) {
      achievements.push("Channel content is family-friendly");
    } else {
      const uniqueFlaggedWords = flaggedWords.filter((word, index) => flaggedWords.indexOf(word) === index);
      drawbacks.push(`Channel contains potentially inappropriate content: ${uniqueFlaggedWords.join(', ')}`);
    }

    // Keywords check
    if (channelKeywords) {
      const keywordCount = channelKeywords.split(',').length;
      achievements.push(`Channel uses ${keywordCount} keywords for SEO`);
    } else {
      drawbacks.push("Channel has no keywords set for discoverability");
    }

    // Upload frequency check
    if (differenceInWeeks <= 1) {
      achievements.push("Very active: Posted within the last week");
    } else if (differenceInWeeks <= 3) {
      achievements.push("Active: Posted within the last 3 weeks");
    } else {
      drawbacks.push(`Inactive: No new content in ${differenceInWeeks} weeks`);
    }

    // Branding checks
    if (channelData.brandingSettings?.image?.bannerExternalUrl) {
      achievements.push("Has custom channel banner for professional appearance");
    } else {
      drawbacks.push("Missing channel banner - hurts professional appearance");
    }

    if (channelData.brandingSettings?.channel?.unsubscribedTrailer) {
      achievements.push("Has channel trailer to engage new visitors");
    } else {
      drawbacks.push("Missing channel trailer - missing conversion opportunity");
    }

    // Playlists check
    if (playlistData.length >= 5) {
      achievements.push(`Has 5+ playlists for content organization`);
    } else if (playlistData.length > 0) {
      achievements.push(`Has ${playlistData.length} playlists for content organization`);
    } else {
      drawbacks.push("No playlists - missing content organization");
    }

    // Description check
    if (channelDescription && channelDescription.length > 100) {
      achievements.push("Detailed channel description for better SEO");
    } else if (channelDescription) {
      drawbacks.push("Channel description could be more detailed");
    } else {
      drawbacks.push("Missing channel description - hurts discoverability");
    }

    // Engagement metrics
    const viewCount = parseInt(channelData.statistics.viewCount);
    const subCount = parseInt(channelData.statistics.subscriberCount);
    const videoCount = parseInt(channelData.statistics.videoCount);

    if (viewCount / subCount > 100) {
      achievements.push("Strong view-to-subscriber ratio indicates engaged audience");
    }

    if (viewCount / videoCount > 10000) {
      achievements.push("High average views per video shows quality content");
    }

    // Calculate SEO Score (0-100) with breakdown
    const seoBreakdown: ScoreBreakdown[] = [];

    let descScore = 0;
    if (channelDescription && channelDescription.length > 100) {
      descScore = 25;
      seoBreakdown.push({ label: 'Description Length', score: 25, max: 25, status: 'good' });
    } else if (channelDescription && channelDescription.length > 50) {
      descScore = 15;
      seoBreakdown.push({ label: 'Description Length', score: 15, max: 25, status: 'warning' });
    } else if (channelDescription) {
      descScore = 5;
      seoBreakdown.push({ label: 'Description Length', score: 5, max: 25, status: 'poor' });
    } else {
      seoBreakdown.push({ label: 'Description Length', score: 0, max: 25, status: 'poor' });
    }
    seoScore += descScore;

    let keywordsScore = 0;
    if (channelKeywords) {
      const keywordCount = channelKeywords.split(',').length;
      if (keywordCount >= 10) {
        keywordsScore = 25;
        seoBreakdown.push({ label: `Keywords (${keywordCount})`, score: 25, max: 25, status: 'good' });
      } else if (keywordCount >= 5) {
        keywordsScore = 15;
        seoBreakdown.push({ label: `Keywords (${keywordCount})`, score: 15, max: 25, status: 'warning' });
      } else {
        keywordsScore = 5;
        seoBreakdown.push({ label: `Keywords (${keywordCount})`, score: 5, max: 25, status: 'poor' });
      }
    } else {
      seoBreakdown.push({ label: 'Keywords', score: 0, max: 25, status: 'poor' });
    }
    seoScore += keywordsScore;

    let tagsScore = 0;
    if (topVideos.length > 0) {
      const avgTags = topVideos.reduce((sum, v) => sum + v.tags.length, 0) / topVideos.length;
      if (avgTags >= 10) {
        tagsScore = 25;
        seoBreakdown.push({ label: `Avg Video Tags (${Math.round(avgTags)})`, score: 25, max: 25, status: 'good' });
      } else if (avgTags >= 5) {
        tagsScore = 15;
        seoBreakdown.push({ label: `Avg Video Tags (${Math.round(avgTags)})`, score: 15, max: 25, status: 'warning' });
      } else {
        tagsScore = 5;
        seoBreakdown.push({ label: `Avg Video Tags (${Math.round(avgTags)})`, score: 5, max: 25, status: 'poor' });
      }
    } else {
      seoBreakdown.push({ label: 'Video Tags', score: 0, max: 25, status: 'poor' });
    }
    seoScore += tagsScore;

    let playlistScore = 0;
    if (playlistData.length >= 5) {
      playlistScore = 25;
      seoBreakdown.push({ label: `Playlists (5+)`, score: 25, max: 25, status: 'good' });
    } else if (playlistData.length > 0) {
      playlistScore = 15;
      seoBreakdown.push({ label: `Playlists (${playlistData.length})`, score: 15, max: 25, status: 'warning' });
    } else {
      seoBreakdown.push({ label: 'Playlists', score: 0, max: 25, status: 'poor' });
    }
    seoScore += playlistScore;

    // Calculate Engagement Score (0-100) with breakdown
    const engagementBreakdown: ScoreBreakdown[] = [];

    // Views per Subscriber - adjusted to account for channel size and video count
    // For channels with fewer videos, views per subscriber should be evaluated differently
    // A channel with 120 videos and 387 views/sub is excellent
    const viewsPerSub = viewCount / Math.max(1, subCount);

    // Calculate quality score based on efficiency (views per sub per video)
    // This rewards channels that get high engagement with fewer videos
    const viewsPerSubPerVideo = viewsPerSub / Math.max(1, videoCount);

    // Score based on views per subscriber, with adjustments for video count
    if (videoCount < 200) {
      // For smaller channels (under 200 videos), be more generous
      // 387 views/sub with 120 videos = 3.23 views/sub/video (excellent!)
      if (viewsPerSubPerVideo > 2 || viewsPerSub < 200) {
        // Excellent efficiency - getting lots of views with fewer videos
        engagementScore += 40;
        engagementBreakdown.push({ label: `Views/Subscriber (${Math.round(viewsPerSub)})`, score: 40, max: 40, status: 'good' });
      } else if (viewsPerSubPerVideo > 1.5 || viewsPerSub < 400) {
        // Good efficiency
        engagementScore += 35;
        engagementBreakdown.push({ label: `Views/Subscriber (${Math.round(viewsPerSub)})`, score: 35, max: 40, status: 'good' });
      } else if (viewsPerSub < 600) {
        // Decent engagement
        engagementScore += 30;
        engagementBreakdown.push({ label: `Views/Subscriber (${Math.round(viewsPerSub)})`, score: 30, max: 40, status: 'good' });
      } else if (viewsPerSub < 800) {
        // Moderate engagement
        engagementScore += 20;
        engagementBreakdown.push({ label: `Views/Subscriber (${Math.round(viewsPerSub)})`, score: 20, max: 40, status: 'warning' });
      } else {
        // Lower engagement
        engagementScore += 10;
        engagementBreakdown.push({ label: `Views/Subscriber (${Math.round(viewsPerSub)})`, score: 10, max: 40, status: 'poor' });
      }
    } else {
      // For larger channels (200+ videos), use stricter standards
      if (viewsPerSub < 50) {
        // Extremely engaged audience - very rare
        engagementScore += 40;
        engagementBreakdown.push({ label: `Views/Subscriber (${Math.round(viewsPerSub)})`, score: 40, max: 40, status: 'good' });
      } else if (viewsPerSub < 150) {
        // Strong engagement
        engagementScore += 35;
        engagementBreakdown.push({ label: `Views/Subscriber (${Math.round(viewsPerSub)})`, score: 35, max: 40, status: 'good' });
      } else if (viewsPerSub < 300) {
        // Good engagement
        engagementScore += 30;
        engagementBreakdown.push({ label: `Views/Subscriber (${Math.round(viewsPerSub)})`, score: 30, max: 40, status: 'good' });
      } else if (viewsPerSub < 600) {
        // Moderate engagement
        engagementScore += 20;
        engagementBreakdown.push({ label: `Views/Subscriber (${Math.round(viewsPerSub)})`, score: 20, max: 40, status: 'warning' });
      } else {
        // Lower engagement
        engagementScore += 10;
        engagementBreakdown.push({ label: `Views/Subscriber (${Math.round(viewsPerSub)})`, score: 10, max: 40, status: 'poor' });
      }
    }

    if (topVideos.length > 0) {
      const avgEngagement = topVideos.reduce((sum, v) => sum + ((v.likes + v.comments) / Math.max(1, v.views)), 0) / topVideos.length;
      const engRate = (avgEngagement * 100).toFixed(1);
      if (avgEngagement > 0.05) {
        engagementScore += 30;
        engagementBreakdown.push({ label: `Engagement Rate (${engRate}%)`, score: 30, max: 30, status: 'good' });
      } else if (avgEngagement > 0.03) {
        engagementScore += 20;
        engagementBreakdown.push({ label: `Engagement Rate (${engRate}%)`, score: 20, max: 30, status: 'warning' });
      } else if (avgEngagement > 0.01) {
        engagementScore += 10;
        engagementBreakdown.push({ label: `Engagement Rate (${engRate}%)`, score: 10, max: 30, status: 'warning' });
      } else {
        engagementScore += 5;
        engagementBreakdown.push({ label: `Engagement Rate (${engRate}%)`, score: 5, max: 30, status: 'poor' });
      }
    } else {
      engagementBreakdown.push({ label: 'Engagement Rate', score: 0, max: 30, status: 'poor' });
    }

    const avgViewsPerVideo = viewCount / Math.max(1, videoCount);
    const avgViewsFormatted = avgViewsPerVideo >= 1000 ? `${(avgViewsPerVideo / 1000).toFixed(1)}K` : Math.round(avgViewsPerVideo).toString();
    if (avgViewsPerVideo > 100000) {
      engagementScore += 30;
      engagementBreakdown.push({ label: `Avg Views/Video (${avgViewsFormatted})`, score: 30, max: 30, status: 'good' });
    } else if (avgViewsPerVideo > 10000) {
      engagementScore += 20;
      engagementBreakdown.push({ label: `Avg Views/Video (${avgViewsFormatted})`, score: 20, max: 30, status: 'good' });
    } else if (avgViewsPerVideo > 1000) {
      engagementScore += 10;
      engagementBreakdown.push({ label: `Avg Views/Video (${avgViewsFormatted})`, score: 10, max: 30, status: 'warning' });
    } else {
      engagementScore += 5;
      engagementBreakdown.push({ label: `Avg Views/Video (${avgViewsFormatted})`, score: 5, max: 30, status: 'poor' });
    }

    // Calculate Consistency Score (0-100) with breakdown
    const consistencyBreakdown: ScoreBreakdown[] = [];

    // Use recent 6-month upload frequency (more relevant than lifetime average)
    const weeksInSixMonths = 26;
    const videosPerWeek = recentVideoCount / weeksInSixMonths;

    if (videosPerWeek >= 1) {
      // At least once a week gets full points (100%)
      consistencyScore += 40;
      consistencyBreakdown.push({ label: `Upload Freq (${videosPerWeek.toFixed(1)}/week)`, score: 40, max: 40, status: 'good' });
    } else if (videosPerWeek >= 0.5) {
      consistencyScore += 25;
      consistencyBreakdown.push({ label: `Upload Freq (${videosPerWeek.toFixed(1)}/week)`, score: 25, max: 40, status: 'warning' });
    } else {
      consistencyScore += 10;
      consistencyBreakdown.push({ label: `Upload Freq (${videosPerWeek.toFixed(1)}/week)`, score: 10, max: 40, status: 'poor' });
    }

    if (differenceInWeeks <= 1) {
      consistencyScore += 30;
      consistencyBreakdown.push({ label: 'Last Upload (This week)', score: 30, max: 30, status: 'good' });
    } else if (differenceInWeeks <= 2) {
      consistencyScore += 20;
      consistencyBreakdown.push({ label: `Last Upload (${differenceInWeeks} weeks ago)`, score: 20, max: 30, status: 'warning' });
    } else if (differenceInWeeks <= 4) {
      consistencyScore += 10;
      consistencyBreakdown.push({ label: `Last Upload (${differenceInWeeks} weeks ago)`, score: 10, max: 30, status: 'warning' });
    } else {
      consistencyScore += 5;
      consistencyBreakdown.push({ label: `Last Upload (${differenceInWeeks} weeks ago)`, score: 5, max: 30, status: 'poor' });
    }

    if (videoCount > 100) {
      consistencyScore += 30;
      consistencyBreakdown.push({ label: `Total Videos (${videoCount})`, score: 30, max: 30, status: 'good' });
    } else if (videoCount > 50) {
      consistencyScore += 20;
      consistencyBreakdown.push({ label: `Total Videos (${videoCount})`, score: 20, max: 30, status: 'good' });
    } else if (videoCount > 20) {
      consistencyScore += 10;
      consistencyBreakdown.push({ label: `Total Videos (${videoCount})`, score: 10, max: 30, status: 'warning' });
    } else {
      consistencyScore += 5;
      consistencyBreakdown.push({ label: `Total Videos (${videoCount})`, score: 5, max: 30, status: 'poor' });
    }

    // Calculate Branding Score (0-100) with breakdown
    const brandingBreakdown: ScoreBreakdown[] = [];

    if (channelData.brandingSettings?.image?.bannerExternalUrl) {
      brandingScore += 30;
      brandingBreakdown.push({ label: 'Channel Banner', score: 30, max: 30, status: 'good' });
    } else {
      brandingBreakdown.push({ label: 'Channel Banner', score: 0, max: 30, status: 'poor' });
    }

    if (channelData.brandingSettings?.channel?.unsubscribedTrailer) {
      brandingScore += 25;
      brandingBreakdown.push({ label: 'Channel Trailer', score: 25, max: 25, status: 'good' });
    } else {
      brandingBreakdown.push({ label: 'Channel Trailer', score: 0, max: 25, status: 'poor' });
    }

    if (channelData.snippet.thumbnails.high) {
      brandingScore += 15;
      brandingBreakdown.push({ label: 'Profile Picture', score: 15, max: 15, status: 'good' });
    } else {
      brandingBreakdown.push({ label: 'Profile Picture', score: 0, max: 15, status: 'poor' });
    }

    if (playlistData.length > 0) {
      brandingScore += 15;
      const playlistLabel = playlistData.length >= 5 ? '5+' : playlistData.length.toString();
      brandingBreakdown.push({ label: `Content Organization (${playlistLabel} playlists)`, score: 15, max: 15, status: 'good' });
    } else {
      brandingBreakdown.push({ label: 'Content Organization', score: 0, max: 15, status: 'poor' });
    }

    if (channelDescription && channelDescription.length > 100) {
      brandingScore += 15;
      brandingBreakdown.push({ label: 'About Section', score: 15, max: 15, status: 'good' });
    } else if (channelDescription) {
      brandingScore += 8;
      brandingBreakdown.push({ label: 'About Section', score: 8, max: 15, status: 'warning' });
    } else {
      brandingBreakdown.push({ label: 'About Section', score: 0, max: 15, status: 'poor' });
    }

    return {
      achievements,
      drawbacks,
      flaggedWords: flaggedWords.filter((word, index) => flaggedWords.indexOf(word) === index),
      seoScore: Math.min(100, seoScore),
      engagementScore: Math.min(100, engagementScore),
      consistencyScore: Math.min(100, consistencyScore),
      brandingScore: Math.min(100, brandingScore),
      seoBreakdown,
      engagementBreakdown,
      consistencyBreakdown,
      brandingBreakdown
    };
  };

  const getSubscriberBenefitLevel = (subscriberCount: number): string => {
    if (subscriberCount >= 10000000) return 'Diamond (10M+)';
    if (subscriberCount >= 1000000) return 'Gold (1M-10M)';
    if (subscriberCount >= 100000) return 'Silver (100K-1M)';
    return 'Bronze (<100K)';
  };

  const calculateOverallScore = (analysis: ChannelAnalysis): number => {
    const totalPoints = analysis.achievements.length + analysis.drawbacks.length;
    if (totalPoints === 0) return 3;
    return Math.round((analysis.achievements.length / totalPoints) * 5);
  };

  const formatFullDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getChannelAge = (createdDate: string): string => {
    const created = new Date(createdDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''}, ${months} month${months > 1 ? 's' : ''}`;
    }
    return `${months} month${months > 1 ? 's' : ''}`;
  };

  const formatChannelKeywords = (keywords: string): string[] => {
    if (!keywords) return [];
    return keywords.split(',').map(keyword => keyword.trim()).filter(keyword => keyword.length > 0);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
  };

  const analyzeVideoPerformance = (video: VideoData): { score: number; label: string; color: string; insights: string[] } => {
    const insights: string[] = [];
    let score = 0;

    // Engagement rate
    const engagementRate = ((video.likes + video.comments) / Math.max(1, video.views)) * 100;
    if (engagementRate > 5) {
      score += 35;
      insights.push('Exceptional engagement rate');
    } else if (engagementRate > 3) {
      score += 25;
      insights.push('Strong engagement');
    } else if (engagementRate > 1) {
      score += 15;
      insights.push('Moderate engagement');
    } else {
      score += 5;
      insights.push('Low engagement - needs improvement');
    }

    // View count
    if (video.views > 1000000) {
      score += 35;
      insights.push('Viral success');
    } else if (video.views > 100000) {
      score += 25;
      insights.push('High views');
    } else if (video.views > 10000) {
      score += 15;
      insights.push('Good reach');
    } else {
      score += 5;
      insights.push('Limited reach');
    }

    // Tags SEO
    if (video.tags.length >= 10) {
      score += 15;
      insights.push('Well optimized tags');
    } else if (video.tags.length >= 5) {
      score += 10;
      insights.push('Decent SEO');
    } else {
      score += 5;
      insights.push('Needs more tags');
    }

    // Description length
    if (video.description.length > 500) {
      score += 15;
      insights.push('Detailed description');
    } else if (video.description.length > 200) {
      score += 10;
      insights.push('Good description');
    } else {
      score += 5;
      insights.push('Short description');
    }

    const color = getScoreColor(score);
    const label = getScoreLabel(score);

    return { score, label, color, insights };
  };

  const parseDuration = (duration: string): string => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '0:00';

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string): string => {
    return moment(dateString).fromNow();
  };

  const getTopicCategory = (topicDetails: any, channelData: any): string => {
    // Debug logging - remove this after fixing
    console.log('Topic Details:', topicDetails);
    console.log('Channel Title:', channelData?.snippet?.title);
    
    // Enhanced category mapping with more comprehensive IDs
    const categoryMap: { [key: string]: string } = {
      // Main categories
      '/m/04rlf': 'Music',
      '/m/02jjt': 'Entertainment', 
      '/m/09s1f': 'Comedy',
      '/m/0kt51': 'Health & Fitness',
      '/m/019_rr': 'Lifestyle',
      '/m/032tl': 'Fashion',
      '/m/027x7n': 'Automotive',
      '/m/0bzvm2': 'Gaming',
      '/m/06ntj': 'Sports',
      '/m/0f2f9': 'News & Politics',
      '/m/01k8wb': 'Knowledge',
      '/m/098wr': 'Science & Technology',
      '/m/07c1v': 'Technology',
      '/m/02vx4': 'Film & Animation',
      '/m/01sjng': 'Pets & Animals',
      '/m/068hy': 'Travel & Events',
      '/m/05fw6t': 'Travel',
      '/m/02vxn': 'Food',
      '/m/05qt0': 'Education',
      '/m/07yv9': 'Vehicles',
      
      // Additional specific categories
      '/m/025zzc': 'Attractions',
      '/m/02w3_vh': 'Beauty',
      '/m/09xp_': 'Business',
      '/m/02p0szs': 'Children',
      '/m/02ntfj': 'Consumer Electronics',
      '/m/0jbk': 'Cooking',
      '/m/013_1c': 'Crafts'
    };

    // Check if topicDetails exists and has categories
    if (topicDetails?.topicCategories && Array.isArray(topicDetails.topicCategories) && topicDetails.topicCategories.length > 0) {
      const categories = topicDetails.topicCategories.map((cat: string) => {
        return categoryMap[cat] || null;
      }).filter((cat: string | null) => cat !== null);
      
      if (categories.length > 0) {
        return categories.join(', ');
      }
    }
    
    // Fallback 1: Try to infer from channel title
    const channelTitle = channelData?.snippet?.title?.toLowerCase() || '';
    const titleKeywords = {
      'music': 'Music',
      'gaming': 'Gaming', 
      'game': 'Gaming',
      'tech': 'Technology',
      'food': 'Food',
      'cooking': 'Food',
      'travel': 'Travel',
      'sport': 'Sports',
      'news': 'News',
      'comedy': 'Comedy',
      'education': 'Education',
      'fitness': 'Health & Fitness',
      'beauty': 'Beauty',
      'fashion': 'Fashion',
      'business': 'Business',
      'review': 'Reviews',
      'tutorial': 'Education'
    };
    
    for (const [keyword, category] of Object.entries(titleKeywords)) {
      if (channelTitle.includes(keyword)) {
        return category;
      }
    }
    
    // Fallback 2: Try to infer from channel description
    const channelDescription = channelData?.snippet?.description?.toLowerCase() || '';
    for (const [keyword, category] of Object.entries(titleKeywords)) {
      if (channelDescription.includes(keyword)) {
        return category;
      }
    }
    
    // Fallback 3: Try to infer from channel keywords
    const channelKeywords = channelData?.brandingSettings?.channel?.keywords?.toLowerCase() || '';
    for (const [keyword, category] of Object.entries(titleKeywords)) {
      if (channelKeywords.includes(keyword)) {
        return category;
      }
    }
    
    return 'General Content';
  };

  const seoConfig = toolsSEO['channel-analyzer'];
  const schemaData = generateToolSchema('channel-analyzer', seoConfig);

  return (
    <>
      <SEO
        title={seoConfig.title}
        description={seoConfig.description}
        keywords={seoConfig.keywords}
        canonical="https://youtool.io/tools/channel-analyzer"
        schemaData={schemaData}
      />
      <S.PageWrapper>
      <S.MainContainer>
        <S.BackButton onClick={() => navigate('/tools')}>
          <i className="bx bx-arrow-back"></i>
          Back to Tools
        </S.BackButton>

        {/* Enhanced Header Section with Integrated Search */}
        <S.EnhancedHeader backgroundImage={toolConfig.image}>
          <S.HeaderOverlay />
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

              {/* Integrated Search Bar */}
              <S.HeaderSearchContainer>
                <S.HeaderSearchBar>
                  <S.HeaderSearchInput
                    type="text"
                    value={channelUrl}
                    onChange={(e) => setChannelUrl(e.target.value)}
                    placeholder="Enter YouTube @ handle or channel ID"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <S.HeaderSearchButton onClick={handleSearch} disabled={isLoading}>
                    {isLoading ? (
                      <i className='bx bx-loader-alt bx-spin'></i>
                    ) : (
                      <i className='bx bx-search'></i>
                    )}
                  </S.HeaderSearchButton>
                </S.HeaderSearchBar>
              </S.HeaderSearchContainer>
            </S.HeaderTextContent>
          </S.HeaderContent>
        </S.EnhancedHeader>

        {/* Google Ad Spot */}
        <GoogleAd adSlot="1234567890" />

        {/* Educational Content Section */}
        {!showResults && (
          <S.EducationalSection>
            
            <S.EducationalContent>
              <S.SectionSubTitle>How to Use the Channel Analyzer</S.SectionSubTitle>
              
              <S.ContentText>
                Our Channel Analyzer works with any public YouTube channel, providing insights that help you 
                understand performance patterns, identify optimization opportunities, and develop strategic 
                improvements. Here's how to get the most comprehensive analysis from our tool.
              </S.ContentText>

              <S.StepByStep>
                <S.StepItem>
                  <S.StepNumber>1</S.StepNumber>
                  <S.StepContent>
                    <S.StepTitle>Enter Channel Information</S.StepTitle>
                    <S.ContentText>
                      Input any YouTube channel URL, handle, or channel ID. Our system accepts various formats 
                      including youtube.com/channel/UC..., youtube.com/@channelname, youtube.com/c/channelname, 
                      or direct channel IDs. The analyzer automatically processes the input and locates the channel.
                    </S.ContentText>
                  </S.StepContent>
                </S.StepItem>

                <S.StepItem>
                  <S.StepNumber>2</S.StepNumber>
                  <S.StepContent>
                    <S.StepTitle>Comprehensive Data Collection</S.StepTitle>
                    <S.ContentText>
                      The analyzer fetches channel metadata, subscriber statistics, video performance data, 
                      upload patterns, and engagement metrics. This process takes 15-30 seconds as we collect 
                      data from multiple sources and calculate advanced metrics for comprehensive analysis.
                    </S.ContentText>
                  </S.StepContent>
                </S.StepItem>

                <S.StepItem>
                  <S.StepNumber>3</S.StepNumber>
                  <S.StepContent>
                    <S.StepTitle>Advanced Analytics Processing</S.StepTitle>
                    <S.ContentText>
                      Our system calculates growth rates, engagement patterns, content consistency scores, 
                      and optimization opportunities. We analyze historical performance, identify trending 
                      content patterns, and benchmark against similar channels for contextual insights.
                    </S.ContentText>
                  </S.StepContent>
                </S.StepItem>

                <S.StepItem>
                  <S.StepNumber>4</S.StepNumber>
                  <S.StepContent>
                    <S.StepTitle>Strategic Recommendations</S.StepTitle>
                    <S.ContentText>
                      Review detailed analysis results including growth opportunities, content optimization 
                      suggestions, and strategic recommendations. Use these insights to improve channel 
                      performance, optimize content strategy, and accelerate subscriber growth.
                    </S.ContentText>
                  </S.StepContent>
                </S.StepItem>
              </S.StepByStep>
            </S.EducationalContent>

            <S.EducationalContent>
              <S.SectionSubTitle>What Insights Are Provided?</S.SectionSubTitle>
              
              <S.FeatureList>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span>Complete subscriber growth analysis with trend identification and growth rate calculations</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span>Content performance patterns across different video types, lengths, and topics</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span>Upload consistency analysis and optimal posting schedule recommendations</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span>Channel SEO optimization score including title, description, and keyword analysis</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span>Audience engagement metrics with like-to-view and comment-to-view ratio analysis</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span>Content gaps analysis revealing untapped topics and optimization opportunities</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span>Channel branding assessment including thumbnail consistency and visual identity</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span>Competitive benchmarking against similar channels in your niche and subscriber range</span>
                </S.FeatureListItem>
              </S.FeatureList>
            </S.EducationalContent>

          </S.EducationalSection>
        )}

        <S.ResultsContainer className={showResults ? 'visible' : ''}>
          {isLoading ? (
            <S.LoadingContainer>
              <i className='bx bx-loader-alt bx-spin'></i>
              <p>Analyzing channel data...</p>
            </S.LoadingContainer>
          ) : channelData && analysisResults ? (
            <>
              <S.ChannelInfo>
                <S.ChannelLogoContainer>
                  <S.ChannelLogo
                    src={channelData.snippet.thumbnails.high?.url || channelData.snippet.thumbnails.default.url}
                    alt={channelData.snippet.title}
                  />
                </S.ChannelLogoContainer>
                
                <S.ChannelDetails>
                  <S.ChannelName>{decodeHTMLEntities(channelData.snippet.title)}</S.ChannelName>
                  <S.ChannelMeta>
                    <S.MetaItem>
                      <i className="bx bx-user"></i>
                      {parseInt(channelData.statistics.subscriberCount).toLocaleString()} subscribers
                    </S.MetaItem>
                    <S.MetaItem>
                      <i className="bx bx-calendar"></i>
                      Created: {formatFullDate(channelData.snippet.publishedAt)}
                    </S.MetaItem>
                    <S.MetaItem>
                      <i className="bx bx-award"></i>
                      {getSubscriberBenefitLevel(parseInt(channelData.statistics.subscriberCount))}
                    </S.MetaItem>
                  </S.ChannelMeta>
                  <S.VisitButton 
                    href={`https://www.youtube.com/channel/${channelData.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="bx bx-external-link"></i>
                    Visit Channel
                  </S.VisitButton>
                </S.ChannelDetails>
              </S.ChannelInfo>

              <S.MetricsGrid>
                <S.MetricCard>
                  <S.MetricIcon className="bx bx-show"></S.MetricIcon>
                  <S.MetricValue>{parseInt(channelData.statistics.viewCount).toLocaleString()}</S.MetricValue>
                  <S.MetricLabel>Total Views</S.MetricLabel>
                </S.MetricCard>

                <S.MetricCard>
                  <S.MetricIcon className="bx bx-video"></S.MetricIcon>
                  <S.MetricValue>{parseInt(channelData.statistics.videoCount).toLocaleString()}</S.MetricValue>
                  <S.MetricLabel>Videos</S.MetricLabel>
                </S.MetricCard>

                <S.MetricCard>
                  <S.MetricIcon className="bx bx-trending-up"></S.MetricIcon>
                  <S.MetricValue>
                    {Math.round(parseInt(channelData.statistics.viewCount) / parseInt(channelData.statistics.videoCount)).toLocaleString()}
                  </S.MetricValue>
                  <S.MetricLabel>Avg Views/Video</S.MetricLabel>
                </S.MetricCard>

                <S.MetricCard>
                  <S.MetricIcon className="bx bx-star"></S.MetricIcon>
                  <S.MetricValue>
                    {'★'.repeat(calculateOverallScore(analysisResults))}{'☆'.repeat(5 - calculateOverallScore(analysisResults))}
                  </S.MetricValue>
                  <S.MetricLabel>Overall Score</S.MetricLabel>
                </S.MetricCard>
              </S.MetricsGrid>

              {/* Performance Score Cards */}
              <S.ScoreCardsSection>
                <S.SectionTitle>
                  <i className="bx bx-award"></i>
                  Channel Performance Scores
                </S.SectionTitle>
                <S.ScoreCardsGrid>
                  <S.ScoreCard>
                    <S.ScoreCardHeader>
                      <S.ScoreCardIcon className="bx bx-search-alt" />
                      <S.ScoreCardTitle>SEO Score</S.ScoreCardTitle>
                    </S.ScoreCardHeader>
                    <S.ScoreValue color={getScoreColor(analysisResults.seoScore)}>
                      {analysisResults.seoScore}
                    </S.ScoreValue>
                    <S.ScoreLabel>{getScoreLabel(analysisResults.seoScore)}</S.ScoreLabel>
                    <S.ScoreProgressBar>
                      <S.ScoreProgressFill
                        width={analysisResults.seoScore}
                        color={getScoreColor(analysisResults.seoScore)}
                      />
                    </S.ScoreProgressBar>
                    <S.ScoreBreakdownList>
                      {analysisResults.seoBreakdown.map((item, index) => (
                        <S.ScoreBreakdownItem key={index} status={item.status}>
                          <S.BreakdownLabel>{item.label}</S.BreakdownLabel>
                          <S.BreakdownScore>{item.score}/{item.max}</S.BreakdownScore>
                        </S.ScoreBreakdownItem>
                      ))}
                    </S.ScoreBreakdownList>
                  </S.ScoreCard>

                  <S.ScoreCard>
                    <S.ScoreCardHeader>
                      <S.ScoreCardIcon className="bx bx-heart" />
                      <S.ScoreCardTitle>Engagement</S.ScoreCardTitle>
                    </S.ScoreCardHeader>
                    <S.ScoreValue color={getScoreColor(analysisResults.engagementScore)}>
                      {analysisResults.engagementScore}
                    </S.ScoreValue>
                    <S.ScoreLabel>{getScoreLabel(analysisResults.engagementScore)}</S.ScoreLabel>
                    <S.ScoreProgressBar>
                      <S.ScoreProgressFill
                        width={analysisResults.engagementScore}
                        color={getScoreColor(analysisResults.engagementScore)}
                      />
                    </S.ScoreProgressBar>
                    <S.ScoreBreakdownList>
                      {analysisResults.engagementBreakdown.map((item, index) => (
                        <S.ScoreBreakdownItem key={index} status={item.status}>
                          <S.BreakdownLabel>{item.label}</S.BreakdownLabel>
                          <S.BreakdownScore>{item.score}/{item.max}</S.BreakdownScore>
                        </S.ScoreBreakdownItem>
                      ))}
                    </S.ScoreBreakdownList>
                  </S.ScoreCard>

                  <S.ScoreCard>
                    <S.ScoreCardHeader>
                      <S.ScoreCardIcon className="bx bx-calendar-check" />
                      <S.ScoreCardTitle>Consistency</S.ScoreCardTitle>
                    </S.ScoreCardHeader>
                    <S.ScoreValue color={getScoreColor(analysisResults.consistencyScore)}>
                      {analysisResults.consistencyScore}
                    </S.ScoreValue>
                    <S.ScoreLabel>{getScoreLabel(analysisResults.consistencyScore)}</S.ScoreLabel>
                    <S.ScoreProgressBar>
                      <S.ScoreProgressFill
                        width={analysisResults.consistencyScore}
                        color={getScoreColor(analysisResults.consistencyScore)}
                      />
                    </S.ScoreProgressBar>
                    <S.ScoreBreakdownList>
                      {analysisResults.consistencyBreakdown.map((item, index) => (
                        <S.ScoreBreakdownItem key={index} status={item.status}>
                          <S.BreakdownLabel>{item.label}</S.BreakdownLabel>
                          <S.BreakdownScore>{item.score}/{item.max}</S.BreakdownScore>
                        </S.ScoreBreakdownItem>
                      ))}
                    </S.ScoreBreakdownList>
                  </S.ScoreCard>

                  <S.ScoreCard>
                    <S.ScoreCardHeader>
                      <S.ScoreCardIcon className="bx bx-palette" />
                      <S.ScoreCardTitle>Branding</S.ScoreCardTitle>
                    </S.ScoreCardHeader>
                    <S.ScoreValue color={getScoreColor(analysisResults.brandingScore)}>
                      {analysisResults.brandingScore}
                    </S.ScoreValue>
                    <S.ScoreLabel>{getScoreLabel(analysisResults.brandingScore)}</S.ScoreLabel>
                    <S.ScoreProgressBar>
                      <S.ScoreProgressFill
                        width={analysisResults.brandingScore}
                        color={getScoreColor(analysisResults.brandingScore)}
                      />
                    </S.ScoreProgressBar>
                    <S.ScoreBreakdownList>
                      {analysisResults.brandingBreakdown.map((item, index) => (
                        <S.ScoreBreakdownItem key={index} status={item.status}>
                          <S.BreakdownLabel>{item.label}</S.BreakdownLabel>
                          <S.BreakdownScore>{item.score}/{item.max}</S.BreakdownScore>
                        </S.ScoreBreakdownItem>
                      ))}
                    </S.ScoreBreakdownList>
                  </S.ScoreCard>
                </S.ScoreCardsGrid>
              </S.ScoreCardsSection>

              {channelData.brandingSettings?.image?.bannerExternalUrl && (
                <S.BrandingSection>
                  <S.SectionTitle>
                    <i className="bx bx-image"></i>
                    Channel Branding
                  </S.SectionTitle>
                  <S.BrandingGrid>
                    <S.BrandingItem>
                      <S.BrandingPreview>
                        <S.BrandingImage
                          src={channelData.snippet.thumbnails.medium?.url || channelData.snippet.thumbnails.default.url}
                          alt="Profile Picture"
                        />
                      </S.BrandingPreview>
                      <S.BrandingLabel>Profile Picture</S.BrandingLabel>
                      <S.ViewButton
                        href={channelData.snippet.thumbnails.high?.url || channelData.snippet.thumbnails.default.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Full Size
                      </S.ViewButton>
                    </S.BrandingItem>
                    
                    <S.BrandingItem>
                      <S.BrandingPreview>
                        <S.BrandingImage
                          src={getFullSizeBannerUrl(channelData.brandingSettings.image.bannerExternalUrl)}
                          alt="Banner Image"
                        />
                      </S.BrandingPreview>
                      <S.BrandingLabel>Channel Banner</S.BrandingLabel>
                      <S.ViewButton
                        href={getFullSizeBannerUrl(channelData.brandingSettings.image.bannerExternalUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Full Size
                      </S.ViewButton>
                    </S.BrandingItem>
                  </S.BrandingGrid>
                </S.BrandingSection>
              )}

              <S.AnalysisGrid>
                <S.AnalysisSection>
                  <S.SectionTitle>
                    <i className="bx bx-trophy"></i>
                    Achievements
                  </S.SectionTitle>
                  {analysisResults.achievements.map((achievement, index) => (
                    <S.Achievement key={index}>
                      <i className="bx bx-check-circle"></i>
                      {achievement}
                    </S.Achievement>
                  ))}
                </S.AnalysisSection>

                <S.AnalysisSection>
                  <S.SectionTitle>
                    <i className="bx bx-error-circle"></i>
                    Areas for Improvement
                  </S.SectionTitle>
                  {analysisResults.drawbacks.map((drawback, index) => (
                    <S.Drawback key={index}>
                      <i className="bx bx-x-circle"></i>
                      {drawback}
                    </S.Drawback>
                  ))}
                </S.AnalysisSection>
              </S.AnalysisGrid>

              {/* New Detailed Analysis Sections */}
              <S.DetailedAnalysisGrid>
                {/* Channel Description */}
                <S.DetailedSection>
                  <S.SectionTitle>
                    <i className="bx bx-text"></i>
                    Channel Description
                  </S.SectionTitle>
                  <S.DescriptionContainer>
                    {channelData.snippet.description ? (
                      <>
                        <S.DescriptionText>
                          {decodeHTMLEntities(channelData.snippet.description)}
                        </S.DescriptionText>
                        <S.DescriptionStats>
                          <S.StatItem>
                            <i className="bx bx-text"></i>
                            {channelData.snippet.description.length} characters
                          </S.StatItem>
                          <S.StatItem>
                            <i className="bx bx-file-blank"></i>
                            {channelData.snippet.description.split(' ').length} words
                          </S.StatItem>
                        </S.DescriptionStats>
                      </>
                    ) : (
                      <S.EmptyState>
                        <i className="bx bx-info-circle"></i>
                        No channel description provided
                      </S.EmptyState>
                    )}
                  </S.DescriptionContainer>
                </S.DetailedSection>

                {/* Channel Tags/Keywords */}
                <S.DetailedSection>
                  <S.SectionTitle>
                    <i className="bx bx-purchase-tag"></i>
                    Channel Keywords
                  </S.SectionTitle>
                  <S.KeywordContainer>
                    {channelData.brandingSettings?.channel?.keywords ? (
                      <>
                        <S.KeywordList>
                          {formatChannelKeywords(channelData.brandingSettings.channel.keywords).map((keyword, index) => (
                            <S.KeywordTag key={index}>
                              {keyword}
                            </S.KeywordTag>
                          ))}
                        </S.KeywordList>
                      </>
                    ) : (
                      <S.EmptyState>
                        <i className="bx bx-info-circle"></i>
                        No channel keywords set
                      </S.EmptyState>
                    )}
                  </S.KeywordContainer>
                </S.DetailedSection>

                {/* Channel Category & Topics */}
                <S.DetailedSection>
                  <S.SectionTitle>
                    <i className="bx bx-category"></i>
                    Channel Category
                  </S.SectionTitle>
                  <S.CategoryContainer>
                    <S.CategoryItem>
                      <S.CategoryLabel>Primary Category:</S.CategoryLabel>
                      <S.CategoryValue>
                        {getTopicCategory(channelData.topicDetails, channelData)}
                      </S.CategoryValue>
                    </S.CategoryItem>
                    <S.CategoryItem>
                      <S.CategoryLabel>Content Type:</S.CategoryLabel>
                      <S.CategoryValue>
                        {(() => {
                          // Check multiple sources for content type determination
                          if (channelData.status?.madeForKids === true) return 'Made for Kids';
                          if (channelData.status?.madeForKids === false) return 'General Audience';
                          
                          // Fallback: analyze topic categories for content type hints
                          const topics = channelData.topicDetails?.topicCategories || [];
                          const kidsTopics = ['/m/0kt51', '/m/01sjng']; // Health/fitness, pets - often family friendly
                          const matureTopics = ['/m/0f2f9', '/m/04rlf']; // News/politics, music - often general audience
                          
                          if (topics.some((topic: string) => kidsTopics.includes(topic))) {
                            return 'Family-Friendly Content';
                          }
                          if (topics.some((topic: string) => matureTopics.includes(topic))) {
                            return 'General Audience';
                          }
                          
                          return 'Content Type Not Specified';
                        })()}
                      </S.CategoryValue>
                    </S.CategoryItem>
                    {channelData.snippet.country && (
                      <S.CategoryItem>
                        <S.CategoryLabel>Country:</S.CategoryLabel>
                        <S.CategoryValue>{channelData.snippet.country}</S.CategoryValue>
                      </S.CategoryItem>
                    )}
                  </S.CategoryContainer>
                </S.DetailedSection>

                {/* Top Videos Section */}
                {topVideos.length > 0 && (
                  <S.DetailedSection style={{ gridColumn: '1 / -1' }}>
                    <S.SectionTitle>
                      <i className="bx bx-trending-up"></i>
                      Top Performing Videos
                    </S.SectionTitle>
                    <S.TopVideosGrid>
                      {topVideos.map((video, index) => {
                        const analysis = analyzeVideoPerformance(video);
                        return (
                          <S.VideoCard key={video.id}>
                            <S.VideoRank>#{index + 1}</S.VideoRank>
                            <S.VideoThumbnailContainer
                              href={`https://youtube.com/watch?v=${video.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <S.VideoThumbnail src={video.thumbnail} alt={video.title} />
                              <S.VideoDuration>{parseDuration(video.duration)}</S.VideoDuration>
                            </S.VideoThumbnailContainer>
                            <S.VideoContent>
                              <S.VideoTitle>{video.title}</S.VideoTitle>
                              <S.VideoStats>
                                <S.VideoStatItem>
                                  <i className="bx bx-show"></i>
                                  {video.views.toLocaleString()}
                                </S.VideoStatItem>
                                <S.VideoStatItem>
                                  <i className="bx bx-like"></i>
                                  {video.likes.toLocaleString()}
                                </S.VideoStatItem>
                                <S.VideoStatItem>
                                  <i className="bx bx-comment"></i>
                                  {video.comments.toLocaleString()}
                                </S.VideoStatItem>
                                <S.VideoStatItem>
                                  <i className="bx bx-time"></i>
                                  {formatDate(video.publishedAt)}
                                </S.VideoStatItem>
                              </S.VideoStats>
                              <S.VideoAnalysis>
                                <S.VideoScoreBadge color={analysis.color}>
                                  {analysis.score}/100 - {analysis.label}
                                </S.VideoScoreBadge>
                                <S.VideoInsights>
                                  {analysis.insights.slice(0, 2).map((insight, i) => (
                                    <S.VideoInsight key={i}>
                                      <i className="bx bx-info-circle"></i>
                                      {insight}
                                    </S.VideoInsight>
                                  ))}
                                </S.VideoInsights>
                              </S.VideoAnalysis>
                            </S.VideoContent>
                          </S.VideoCard>
                        );
                      })}
                    </S.TopVideosGrid>
                  </S.DetailedSection>
                )}

                {/* Channel Performance Metrics */}
                <S.DetailedSection>
                  <S.SectionTitle>
                    <i className="bx bx-line-chart"></i>
                    Performance Analysis
                  </S.SectionTitle>
                  <S.PerformanceContainer>
                    <S.PerformanceMetric>
                      <S.MetricTitle>Channel Age</S.MetricTitle>
                      <S.MetricDescription>
                        {getChannelAge(channelData.snippet.publishedAt)} old
                      </S.MetricDescription>
                    </S.PerformanceMetric>
                    <S.PerformanceMetric>
                      <S.MetricTitle>Views per Subscriber</S.MetricTitle>
                      <S.MetricDescription>
                        {Math.round(parseInt(channelData.statistics.viewCount) / parseInt(channelData.statistics.subscriberCount))} views per subscriber
                      </S.MetricDescription>
                    </S.PerformanceMetric>
                    <S.PerformanceMetric>
                      <S.MetricTitle>Upload Frequency</S.MetricTitle>
                      <S.MetricDescription>
                        {Math.round(parseInt(channelData.statistics.videoCount) / (Date.now() - new Date(channelData.snippet.publishedAt).getTime()) * (1000 * 60 * 60 * 24 * 30))} videos per month average
                      </S.MetricDescription>
                    </S.PerformanceMetric>
                    <S.PerformanceMetric>
                      <S.MetricTitle>Latest Activity</S.MetricTitle>
                      <S.MetricDescription>
                        Last video: {formatDate(latestVideoData.snippet.publishedAt)}
                      </S.MetricDescription>
                    </S.PerformanceMetric>
                  </S.PerformanceContainer>
                </S.DetailedSection>

                {/* Content Strategy Analysis */}
                <S.DetailedSection>
                  <S.SectionTitle>
                    <i className="bx bx-brain"></i>
                    Content Strategy Analysis
                  </S.SectionTitle>
                  <S.ContentStrategyContainer>
                    <S.StrategyMetric>
                      <S.MetricTitle>Content Consistency</S.MetricTitle>
                      <S.MetricDescription>
                        {(() => {
                          const daysSinceCreation = Math.floor((Date.now() - new Date(channelData.snippet.publishedAt).getTime()) / (1000 * 60 * 60 * 24));
                          const videosPerDay = parseInt(channelData.statistics.videoCount) / daysSinceCreation;
                          if (videosPerDay > 0.5) return "Highly consistent (Daily content)";
                          if (videosPerDay > 0.14) return "Moderately consistent (Weekly content)";
                          if (videosPerDay > 0.03) return "Irregular (Monthly content)";
                          return "Inconsistent (Sporadic uploads)";
                        })()}
                      </S.MetricDescription>
                    </S.StrategyMetric>
                    
                    <S.StrategyMetric>
                      <S.MetricTitle>Channel Growth Stage</S.MetricTitle>
                      <S.MetricDescription>
                        {(() => {
                          const subs = parseInt(channelData.statistics.subscriberCount);
                          
                          if (subs < 1000) return "Discovery Phase (Building foundation)";
                          if (subs < 10000) return "Growth Phase (Building audience)";
                          if (subs < 100000) return "Expansion Phase (Scaling content)";
                          if (subs < 1000000) return "Established Phase (Strong presence)";
                          return "Authority Phase (Industry leader)";
                        })()}
                      </S.MetricDescription>
                    </S.StrategyMetric>

                    <S.StrategyMetric>
                      <S.MetricTitle>Content Volume Strategy</S.MetricTitle>
                      <S.MetricDescription>
                        {(() => {
                          const videosCount = parseInt(channelData.statistics.videoCount);
                          if (videosCount > 1000) return "High Volume Creator (1000+ videos)";
                          if (videosCount > 500) return "Regular Publisher (500+ videos)";
                          if (videosCount > 100) return "Active Creator (100+ videos)";
                          if (videosCount > 20) return "Emerging Creator (20+ videos)";
                          return "New Creator (Starting journey)";
                        })()}
                      </S.MetricDescription>
                    </S.StrategyMetric>

                    <S.StrategyMetric>
                      <S.MetricTitle>Optimization Score</S.MetricTitle>
                      <S.MetricDescription>
                        {(() => {
                          let score = 0;
                          if (channelData.snippet.description) score += 20;
                          if (channelData.brandingSettings?.channel?.keywords) score += 20;
                          if (channelData.brandingSettings?.image?.bannerExternalUrl) score += 20;
                          if (channelData.brandingSettings?.channel?.unsubscribedTrailer) score += 20;
                          if (playlistData.length > 0) score += 20;
                          
                          const getScoreLevel = (s: number) => {
                            if (s >= 80) return "Excellent";
                            if (s >= 60) return "Good";
                            if (s >= 40) return "Fair";
                            return "Needs Improvement";
                          };
                          
                          return `${getScoreLevel(score)} - ${score}/100 optimization score`;
                        })()}
                      </S.MetricDescription>
                    </S.StrategyMetric>
                  </S.ContentStrategyContainer>
                </S.DetailedSection>

                {/* Audience Engagement Insights */}
                <S.DetailedSection>
                  <S.SectionTitle>
                    <i className="bx bx-group"></i>
                    Audience Engagement Insights
                  </S.SectionTitle>
                  <S.EngagementContainer>
                    <S.EngagementMetric>
                      <S.MetricTitle>Subscriber Attraction Rate</S.MetricTitle>
                      <S.MetricDescription>
                        {(() => {
                          const viewToSubRatio = parseInt(channelData.statistics.viewCount) / parseInt(channelData.statistics.subscriberCount);
                          if (viewToSubRatio < 50) return "Excellent (High conversion rate)";
                          if (viewToSubRatio < 100) return "Good (Solid conversion)";
                          if (viewToSubRatio < 200) return "Average (Room for improvement)";
                          if (viewToSubRatio < 500) return "Below Average (Focus on retention)";
                          return "Low (Needs engagement strategy)";
                        })()}
                      </S.MetricDescription>
                      <S.EngagementDetail>
                        {Math.round(parseInt(channelData.statistics.viewCount) / parseInt(channelData.statistics.subscriberCount))} views needed per subscriber
                      </S.EngagementDetail>
                    </S.EngagementMetric>

                    <S.EngagementMetric>
                      <S.MetricTitle>Content Discovery Potential</S.MetricTitle>
                      <S.MetricDescription>
                        {(() => {
                          const avgViews = parseInt(channelData.statistics.viewCount) / parseInt(channelData.statistics.videoCount);
                          const subscribers = parseInt(channelData.statistics.subscriberCount);
                          const discoverabilityRatio = avgViews / subscribers;
                          
                          if (discoverabilityRatio > 2) return "Viral Potential (High organic reach)";
                          if (discoverabilityRatio > 1.5) return "Strong Discovery (Good algorithm favor)";
                          if (discoverabilityRatio > 1) return "Moderate Reach (Steady growth)";
                          if (discoverabilityRatio > 0.5) return "Subscriber-Focused (Loyal audience)";
                          return "Limited Reach (Needs SEO work)";
                        })()}
                      </S.MetricDescription>
                      <S.EngagementDetail>
                        {(parseInt(channelData.statistics.viewCount) / parseInt(channelData.statistics.videoCount) / parseInt(channelData.statistics.subscriberCount) * 100).toFixed(1)}% average reach beyond subscribers
                      </S.EngagementDetail>
                    </S.EngagementMetric>

                    <S.EngagementMetric>
                      <S.MetricTitle>Channel Authority Level</S.MetricTitle>
                      <S.MetricDescription>
                        {(() => {
                          const subs = parseInt(channelData.statistics.subscriberCount);
                          const views = parseInt(channelData.statistics.viewCount);
                          const videos = parseInt(channelData.statistics.videoCount);
                          const authorityScore = (subs * 0.4) + (views * 0.0001) + (videos * 10);
                          
                          if (authorityScore > 50000) return "Industry Authority (Highly influential)";
                          if (authorityScore > 20000) return "Established Expert (Strong influence)";
                          if (authorityScore > 8000) return "Rising Authority (Growing influence)";
                          if (authorityScore > 2000) return "Emerging Voice (Building credibility)";
                          return "New Contributor (Starting journey)";
                        })()}
                      </S.MetricDescription>
                      <S.EngagementDetail>
                        Based on subscriber count, total views, and content volume
                      </S.EngagementDetail>
                    </S.EngagementMetric>

                    <S.EngagementMetric>
                      <S.MetricTitle>Growth Momentum</S.MetricTitle>
                      <S.MetricDescription>
                        {(() => {
                          const daysSinceLastVideo = Math.floor((Date.now() - new Date(latestVideoData.snippet.publishedAt).getTime()) / (1000 * 60 * 60 * 24));
                          
                          if (daysSinceLastVideo > 30) return "Dormant (Inactive for 30+ days)";
                          if (daysSinceLastVideo > 14) return "Slowing (2+ weeks since upload)";
                          if (daysSinceLastVideo > 7) return "Regular (Weekly schedule)";
                          if (daysSinceLastVideo > 3) return "Active (Multiple uploads/week)";
                          return "Highly Active (Daily content)";
                        })()}
                      </S.MetricDescription>
                      <S.EngagementDetail>
                        Last upload: {Math.floor((Date.now() - new Date(latestVideoData.snippet.publishedAt).getTime()) / (1000 * 60 * 60 * 24))} days ago
                      </S.EngagementDetail>
                    </S.EngagementMetric>
                  </S.EngagementContainer>
                </S.DetailedSection>
              </S.DetailedAnalysisGrid>

            </>
          ) : null}
        </S.ResultsContainer>
      </S.MainContainer>
    </S.PageWrapper>
    </>
  );
};

export default ChannelAnalyzer;