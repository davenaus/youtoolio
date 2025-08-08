// src/pages/Tools/components/VideoAnalyzer/VideoAnalyzer.tsx - IMPROVED VERSION
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdSense } from '../../../../components/AdSense/AdSense';
import * as S from './styles';
import moment from 'moment';

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
    } | null;
    recentUploadRate: string;
    subscriberToViewRatio: number;
  };

  performanceScores: {
    seoScore: number;
    engagementScore: number;
    optimizationScore: number;
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
    navigate(`/tools/keyword-analyzer/${encodedTag}`);
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

  const fetchChannelVideos = async (channelId: string, maxResults: number = 20): Promise<ChannelVideo[]> => {
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
        `part=statistics,snippet&id=${videoIds}&key=${API_KEY}`
      );
      
      const videosData = await videosResponse.json();
      
      return videosData.items.map((video: any) => ({
        id: video.id,
        title: video.snippet.title,
        publishedAt: video.snippet.publishedAt,
        viewCount: parseInt(video.statistics.viewCount || '0'),
        likeCount: parseInt(video.statistics.likeCount || '0'),
        commentCount: parseInt(video.statistics.commentCount || '0'),
        thumbnails: video.snippet.thumbnails
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

  const calculateScores = (videoData: any, contentAnalysis: VideoAnalysis['contentAnalysis']) => {
    // SEO Score calculation
    let seoScore = 0;
    if (contentAnalysis.titleLength >= 40 && contentAnalysis.titleLength <= 60) seoScore += 30;
    else if (contentAnalysis.titleLength >= 30 && contentAnalysis.titleLength <= 70) seoScore += 20;
    else seoScore += 10;
    
    if (contentAnalysis.descriptionLength >= 200) seoScore += 25;
    else if (contentAnalysis.descriptionLength >= 100) seoScore += 15;
    else seoScore += 5;
    
    if (contentAnalysis.tagCount >= 10) seoScore += 25;
    else if (contentAnalysis.tagCount >= 5) seoScore += 15;
    else seoScore += 5;
    
    if (contentAnalysis.hashtags.length > 0) seoScore += 10;
    if (contentAnalysis.descriptionHasLinks) seoScore += 10;
    
    // Engagement Score calculation
    const views = parseInt(videoData.statistics.viewCount || '0');
    const likes = parseInt(videoData.statistics.likeCount || '0');
    const comments = parseInt(videoData.statistics.commentCount || '0');
    const engagementRate = views > 0 ? ((likes + comments) / views) * 100 : 0;
    
    let engagementScore = 0;
    if (engagementRate > 5) engagementScore = 100;
    else if (engagementRate > 3) engagementScore = 80;
    else if (engagementRate > 2) engagementScore = 60;
    else if (engagementRate > 1) engagementScore = 40;
    else engagementScore = Math.min(20, engagementRate * 20);
    
    // Optimization Score (combined metric)
    const optimizationScore = Math.round((seoScore + engagementScore) / 2);
    
    return {
      seoScore: Math.min(100, Math.round(seoScore)),
      engagementScore: Math.min(100, Math.round(engagementScore)),
      optimizationScore: Math.min(100, optimizationScore)
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
      strengths.push(`Excellent engagement rate of ${(scores.engagementScore/10).toFixed(1)}% - significantly above YouTube average of 4%`);
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
      strengths.push(`Performing ${Math.round(views / channelMetrics.avgViewsPerVideo * 100 - 100)}% better than channel average`);
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
      const percentBelow = Math.round((1 - views / channelMetrics.avgViewsPerVideo) * 100);
      improvements.push(`Underperforming by ${percentBelow}% compared to channel average`);
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
    const scores = calculateScores(videoData, contentAnalysis);
    
    // Calculate channel metrics first
    const totalVideos = parseInt(channelData.statistics.videoCount);
    const avgViewsPerVideo = channelVideos.length > 0 
      ? channelVideos.reduce((sum, v) => sum + v.viewCount, 0) / channelVideos.length 
      : 0;
    const channelAge = moment().diff(moment(channelData.snippet.publishedAt), 'days');
    const uploadFrequency = totalVideos > 0 && channelAge > 0
      ? `${(totalVideos / Math.max(channelAge / 7, 1)).toFixed(1)} videos/week`
      : 'N/A';
    
    const currentViews = parseInt(videoData.statistics.viewCount);
    const viewsComparison = currentViews > avgViewsPerVideo * 1.2 ? 'above' : 
                           currentViews < avgViewsPerVideo * 0.8 ? 'below' : 'average';
    
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
    
    // Find best performing video
    const bestVideo = channelVideos.length > 0 
      ? channelVideos.reduce((best, video) => video.viewCount > best.viewCount ? video : best, channelVideos[0])
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
        url: `https://youtube.com/watch?v=${bestVideo.id}`
      } : null,
      recentUploadRate,
      subscriberToViewRatio: totalChannelViews / Math.max(parseInt(channelData.statistics.subscriberCount || '1'), 1)
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
        subscribers: parseInt(channelData.statistics.subscriberCount) || 0
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
              Best Performing Recent Video
            </S.DetailTitle>
            <S.BestVideoCard>
              <S.BestVideoTitle>{analysisResults.channelMetrics.bestPerformingVideo.title}</S.BestVideoTitle>
              <S.BestVideoStats>
                <span><i className="bx bx-show"></i> {analysisResults.channelMetrics.bestPerformingVideo.views.toLocaleString()} views</span>
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
          <S.DetailTitle>
            <i className="bx bx-info-circle"></i>
            Channel Insights
          </S.DetailTitle>
          <S.InsightsList>
            {analysisResults.channelMetrics.subscriberToViewRatio > 50 && (
              <S.ChannelInsight type="success">
                <i className="bx bx-check-circle"></i>
                Excellent viewer loyalty - averaging {analysisResults.channelMetrics.subscriberToViewRatio.toFixed(0)}x views per subscriber
              </S.ChannelInsight>
            )}
            {analysisResults.channelMetrics.subscriberToViewRatio < 10 && (
              <S.ChannelInsight type="warning">
                <i className="bx bx-error-circle"></i>
                Low view-to-subscriber ratio ({analysisResults.channelMetrics.subscriberToViewRatio.toFixed(1)}x) suggests inactive subscribers
              </S.ChannelInsight>
            )}
            {analysisResults.channelMetrics.engagementTrend === 'improving' && (
              <S.ChannelInsight type="success">
                <i className="bx bx-trending-up"></i>
                Engagement is trending upward - recent videos performing better than older content
              </S.ChannelInsight>
            )}
            {analysisResults.channelMetrics.engagementTrend === 'declining' && (
              <S.ChannelInsight type="warning">
                <i className="bx bx-trending-down"></i>
                Engagement declining - consider refreshing content strategy or format
              </S.ChannelInsight>
            )}
            {analysisResults.channelMetrics.totalVideos > 100 && (
              <S.ChannelInsight type="info">
                <i className="bx bx-library"></i>
                Established channel with {analysisResults.channelMetrics.totalVideos} videos - focus on optimizing top performers
              </S.ChannelInsight>
            )}
            {parseInt(analysisResults.channelMetrics.uploadFrequency) > 3 && (
              <S.ChannelInsight type="success">
                <i className="bx bx-calendar-check"></i>
                Consistent upload schedule ({analysisResults.channelMetrics.uploadFrequency}) helps algorithm promotion
              </S.ChannelInsight>
            )}
          </S.InsightsList>
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

  return (
    <S.PageWrapper>
      <S.AdSidebar position="left">
        <AdSense 
          slot={process.env.REACT_APP_ADSENSE_SLOT_SIDEBAR || ''}
          format="vertical"
        />
      </S.AdSidebar>

      <S.AdSidebar position="right">
        <AdSense 
          slot={process.env.REACT_APP_ADSENSE_SLOT_SIDEBAR || ''}
          format="vertical"
        />
      </S.AdSidebar>

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

        <S.ResultsContainer className={showResults ? 'visible' : ''}>
          {isLoading ? (
            <S.LoadingContainer>
              <i className='bx bx-loader-alt bx-spin'></i>
              <p>{loadingStage || 'Analyzing video...'}</p>
            </S.LoadingContainer>
          ) : videoData && channelData && analysisResults ? (
            <>
              <S.VideoInfo>
                <S.ThumbnailContainer>
                  <S.Thumbnail
                    src={videoData.snippet.thumbnails.maxres?.url || videoData.snippet.thumbnails.high.url}
                    alt={videoData.snippet.title}
                  />
                  <S.ThumbnailOverlay>
                    <S.DownloadThumbnailButton 
                      onClick={() => downloadThumbnail(
                        videoData.snippet.thumbnails.maxres?.url || videoData.snippet.thumbnails.high.url,
                        `${videoData.snippet.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_thumbnail.jpg`
                      )}
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

              <S.TabNavigation>
                <S.TabButton
                  isActive={activeTab === 'overview'}
                  onClick={() => setActiveTab('overview')}
                >
                  <i className="bx bx-chart"></i>
                  Overview
                </S.TabButton>
                <S.TabButton
                  isActive={activeTab === 'details'}
                  onClick={() => setActiveTab('details')}
                >
                  <i className="bx bx-info-circle"></i>
                  Details
                </S.TabButton>
                <S.TabButton
                  isActive={activeTab === 'channel'}
                  onClick={() => setActiveTab('channel')}
                >
                  <i className="bx bx-user"></i>
                  Channel
                </S.TabButton>
                <S.TabButton
                  isActive={activeTab === 'insights'}
                  onClick={() => setActiveTab('insights')}
                >
                  <i className="bx bx-bulb"></i>
                  Insights
                </S.TabButton>
              </S.TabNavigation>

              {activeTab === 'overview' && renderOverviewTab()}
              {activeTab === 'details' && renderDetailsTab()}
              {activeTab === 'channel' && renderChannelTab()}
              {activeTab === 'insights' && renderInsightsTab()}

              <S.BottomAdContainer>
                <AdSense 
                  slot={process.env.REACT_APP_ADSENSE_SLOT_BOTTOM || ''}
                  format="horizontal"
                />
              </S.BottomAdContainer>
            </>
          ) : null}
        </S.ResultsContainer>
      </S.MainContainer>
    </S.PageWrapper>
  );
};

export default VideoAnalyzer;