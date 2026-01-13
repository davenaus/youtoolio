// src/pages/Tools/components/PlaylistAnalyzer/PlaylistAnalyzer.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SEO } from '../../../../components/SEO';
import { GoogleAd } from '../../../../components/GoogleAd';
import { toolsSEO, generateToolSchema } from '../../../../config/toolsSEO';
import * as S from './styles';

interface VideoData {
  id: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  publishedAt: string;
  duration: string;
  categoryId: string;
  tags: string[];
  language: string;
  channelId: string;
  channelTitle: string;
  thumbnailUrl: string;
  description: string;
}

interface ChannelInfo {
  id: string;
  title: string;
  thumbnailUrl: string;
  subscriberCount: number;
  videoCount: number;
  totalViews: number;
  description: string;
  createdAt: string;
}

interface PlaylistAnalysis {
  // Basic Stats
  totalViews: number;
  totalVideos: number;
  totalChannels: number;
  totalDuration: number;
  totalLikes: number;
  totalComments: number;

  // Time Analysis
  oldestVideo: Date;
  newestVideo: Date;
  timeSpan: number; // days
  avgUploadFrequency: number; // videos per month

  // Performance Analysis
  avgViewsPerVideo: number;
  avgLikesPerVideo: number;
  avgCommentsPerVideo: number;
  engagementRate: number;
  performanceScore: number;

  // Content Analysis
  mostViewedVideo: VideoData;
  leastViewedVideo: VideoData;
  mostLikedVideo: VideoData;
  mostCommentedVideo: VideoData;
  longestVideo: VideoData;
  shortestVideo: VideoData;

  // Channel Analysis
  channels: Map<string, ChannelInfo>;
  dominantChannel: ChannelInfo;
  channelDiversity: number;

  // Content Distribution
  topTags: [string, number][];
  categories: [string, number][];
  languages: [string, number][];
  uploadPattern: { [key: string]: number };

  // Quality Metrics
  qualityScore: number;
  consistencyScore: number;
  discoverabilityScore: number;

  // Recommendations
  recommendations: string[];
  insights: string[];
}

interface FilterOptions {
  minViews: number;
  maxVideos: number;
  dateRange: {
    start: string;
    end: string;
  };
  channelFilter: string;
  categoryFilter: string;
  sortBy: 'views' | 'likes' | 'comments' | 'date' | 'duration';
  showOnlyTopPerformers: boolean;
}

const videoCategories: { [key: string]: string } = {
  '1': 'Film & Animation',
  '2': 'Autos & Vehicles',
  '10': 'Music',
  '15': 'Pets & Animals',
  '17': 'Sports',
  '19': 'Travel & Events',
  '20': 'Gaming',
  '22': 'People & Blogs',
  '23': 'Comedy',
  '24': 'Entertainment',
  '25': 'News & Politics',
  '26': 'Howto & Style',
  '27': 'Education',
  '28': 'Science & Technology',
  '29': 'Nonprofits & Activism',
};

export const PlaylistAnalyzer: React.FC = () => {
  const { playlistId } = useParams<{ playlistId: string }>();
  const navigate = useNavigate();
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [analysis, setAnalysis] = useState<PlaylistAnalysis | null>(null);
  const [playlistInfo, setPlaylistInfo] = useState<any>(null);
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showDetailedVideos, setShowDetailedVideos] = useState(false);

  // Tool configuration
  const toolConfig = {
    name: 'Playlist Analyzer',
    description: 'Analyze any YouTube playlist for detailed insights on views, engagement, and channel distribution',
    image: 'https://64.media.tumblr.com/85cd205bebdd16ad2dbd1dec3eace901/0e01452f9f6dd974-52/s2048x3072/6e82ba74aec1cf9c1f02548aaa618d2a7c49fd14.jpg',
    icon: 'bx bx-list-ul',
    features: [
      'Performance analytics',
      'Content insights',
      'Channel distribution'
    ]
  };

  const [filters, setFilters] = useState<FilterOptions>({
    minViews: 0,
    maxVideos: 1000,
    dateRange: { start: '', end: '' },
    channelFilter: '',
    categoryFilter: '',
    sortBy: 'views',
    showOnlyTopPerformers: false
  });

  const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY_4;

  useEffect(() => {
    if (playlistId) {
      setPlaylistUrl(playlistId);
      analyzePlaylist(playlistId);
    }
  }, [playlistId]);

  const extractPlaylistId = (url: string): string | null => {
    try {
      if (url.match(/^[A-Za-z0-9_-]+$/)) {
        return url;
      }

      const urlObj = new URL(url);
      const listParam = urlObj.searchParams.get('list');
      if (listParam) return listParam;

      const videoId = urlObj.searchParams.get('v');
      if (videoId) return videoId;

      return null;
    } catch {
      return url.match(/^[A-Za-z0-9_-]+$/) ? url : null;
    }
  };

  const convertDurationToSeconds = (duration: string): number => {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 0;
    const hours = parseInt(match[1] || '0') || 0;
    const minutes = parseInt(match[2] || '0') || 0;
    const seconds = parseInt(match[3] || '0') || 0;
    return hours * 3600 + minutes * 60 + seconds;
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${remainingSeconds}s`;
  };

  const fetchPlaylistInfo = async (playlistId: string) => {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?` +
      `part=snippet,status&id=${playlistId}&key=${API_KEY}`
    );
    const data = await response.json();
    return data.items?.[0];
  };

  const fetchAllVideos = async (playlistId: string): Promise<VideoData[]> => {
    const videos: VideoData[] = [];
    let nextPageToken = '';

    do {
      const playlistResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?` +
        `part=contentDetails,snippet&playlistId=${playlistId}&` +
        `key=${API_KEY}&maxResults=50&pageToken=${nextPageToken}`
      );
      const playlistData = await playlistResponse.json();
      if (!playlistData.items) break;

      const videoIds = playlistData.items
        .map((item: any) => item.contentDetails.videoId)
        .join(',');

      const videoResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?` +
        `part=statistics,snippet,contentDetails&id=${videoIds}&key=${API_KEY}`
      );
      const videoData = await videoResponse.json();

      for (const video of videoData.items) {
        videos.push({
          id: video.id,
          title: video.snippet.title,
          views: parseInt(video.statistics.viewCount) || 0,
          likes: parseInt(video.statistics.likeCount) || 0,
          comments: parseInt(video.statistics.commentCount) || 0,
          publishedAt: video.snippet.publishedAt,
          duration: video.contentDetails.duration,
          categoryId: video.snippet.categoryId,
          tags: video.snippet.tags || [],
          language: video.snippet.defaultAudioLanguage || 'Unknown',
          channelId: video.snippet.channelId,
          channelTitle: video.snippet.channelTitle,
          thumbnailUrl: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default.url,
          description: video.snippet.description || ''
        });
      }

      nextPageToken = playlistData.nextPageToken;
    } while (nextPageToken);

    return videos;
  };

  const fetchChannelDetails = async (channelIds: string[]): Promise<Map<string, ChannelInfo>> => {
    const channels = new Map<string, ChannelInfo>();
    const uniqueChannelIds = Array.from(new Set(channelIds));

    // Process in batches of 50
    for (let i = 0; i < uniqueChannelIds.length; i += 50) {
      const batch = uniqueChannelIds.slice(i, i + 50);
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?` +
        `part=snippet,statistics&id=${batch.join(',')}&key=${API_KEY}`
      );
      const data = await response.json();

      for (const channel of data.items || []) {
        channels.set(channel.id, {
          id: channel.id,
          title: channel.snippet.title,
          thumbnailUrl: channel.snippet.thumbnails.default.url,
          subscriberCount: parseInt(channel.statistics.subscriberCount) || 0,
          videoCount: parseInt(channel.statistics.videoCount) || 0,
          totalViews: parseInt(channel.statistics.viewCount) || 0,
          description: channel.snippet.description || '',
          createdAt: channel.snippet.publishedAt
        });
      }
    }

    return channels;
  };

  const calculateAnalysis = (videos: VideoData[], channels: Map<string, ChannelInfo>): PlaylistAnalysis => {
    // Apply filters
    let filteredVideos = videos.filter(video => {
      if (video.views < filters.minViews) return false;
      if (filters.channelFilter && !video.channelTitle.toLowerCase().includes(filters.channelFilter.toLowerCase())) return false;
      if (filters.categoryFilter && video.categoryId !== filters.categoryFilter) return false;

      if (filters.dateRange.start || filters.dateRange.end) {
        const videoDate = new Date(video.publishedAt);
        const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
        const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;

        if (startDate && videoDate < startDate) return false;
        if (endDate && videoDate > endDate) return false;
      }

      return true;
    });

    if (filters.showOnlyTopPerformers) {
      const threshold = filteredVideos.reduce((sum, v) => sum + v.views, 0) / filteredVideos.length;
      filteredVideos = filteredVideos.filter(v => v.views >= threshold);
    }

    filteredVideos = filteredVideos.slice(0, filters.maxVideos);

    // Sort videos
    filteredVideos.sort((a, b) => {
      switch (filters.sortBy) {
        case 'likes': return b.likes - a.likes;
        case 'comments': return b.comments - a.comments;
        case 'date': return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        case 'duration': return convertDurationToSeconds(b.duration) - convertDurationToSeconds(a.duration);
        default: return b.views - a.views;
      }
    });

    // Basic calculations
    const totalViews = filteredVideos.reduce((sum, v) => sum + v.views, 0);
    const totalLikes = filteredVideos.reduce((sum, v) => sum + v.likes, 0);
    const totalComments = filteredVideos.reduce((sum, v) => sum + v.comments, 0);
    const totalDuration = filteredVideos.reduce((sum, v) => sum + convertDurationToSeconds(v.duration), 0);

    // Time analysis
    const dates = filteredVideos.map(v => new Date(v.publishedAt));
    const oldestVideo = new Date(Math.min(...dates.map(d => d.getTime())));
    const newestVideo = new Date(Math.max(...dates.map(d => d.getTime())));
    const timeSpan = Math.ceil((newestVideo.getTime() - oldestVideo.getTime()) / (1000 * 60 * 60 * 24));

    // Performance metrics
    const avgViewsPerVideo = totalViews / filteredVideos.length;
    const engagementRate = (totalLikes + totalComments) / Math.max(totalViews, 1);

    // Find extremes
    const mostViewedVideo = filteredVideos.reduce((max, v) => v.views > max.views ? v : max, filteredVideos[0]);
    const leastViewedVideo = filteredVideos.reduce((min, v) => v.views < min.views ? v : min, filteredVideos[0]);
    const mostLikedVideo = filteredVideos.reduce((max, v) => v.likes > max.likes ? v : max, filteredVideos[0]);
    const mostCommentedVideo = filteredVideos.reduce((max, v) => v.comments > max.comments ? v : max, filteredVideos[0]);

    const videosWithDuration = filteredVideos.map(v => ({ ...v, durationSeconds: convertDurationToSeconds(v.duration) }));
    const longestVideo = videosWithDuration.reduce((max, v) => v.durationSeconds > max.durationSeconds ? v : max, videosWithDuration[0]);
    const shortestVideo = videosWithDuration.reduce((min, v) => v.durationSeconds < min.durationSeconds ? v : min, videosWithDuration[0]);

    // Content analysis
    const tagCount: { [key: string]: number } = {};
    const categoryCount: { [key: string]: number } = {};
    const languageCount: { [key: string]: number } = {};
    const uploadPattern: { [key: string]: number } = {};

    filteredVideos.forEach(video => {
      video.tags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });

      categoryCount[video.categoryId] = (categoryCount[video.categoryId] || 0) + 1;
      languageCount[video.language] = (languageCount[video.language] || 0) + 1;

      const month = new Date(video.publishedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      uploadPattern[month] = (uploadPattern[month] || 0) + 1;
    });

    // Channel analysis
    const channelVideoCount: { [key: string]: number } = {};
    filteredVideos.forEach(video => {
      channelVideoCount[video.channelId] = (channelVideoCount[video.channelId] || 0) + 1;
    });

    const dominantChannelId = Object.entries(channelVideoCount)
      .reduce((max, [id, count]) => count > max[1] ? [id, count] : max, ['', 0])[0];
    const dominantChannel = channels.get(dominantChannelId);

    // Quality scores
    const qualityScore = Math.min(100, (avgViewsPerVideo / 10000) * 50 + (engagementRate * 1000) * 50);
    const consistencyScore = Math.min(100, (1 - (Math.abs(avgViewsPerVideo - mostViewedVideo.views) / avgViewsPerVideo)) * 100);
    const discoverabilityScore = Math.min(100, Object.keys(tagCount).length * 2);

    // Generate insights and recommendations
    const insights = generateInsights(filteredVideos, channels, {
      avgViewsPerVideo,
      engagementRate,
      timeSpan,
      channelDiversity: channels.size / filteredVideos.length
    });

    const recommendations = generateRecommendations(filteredVideos, {
      qualityScore,
      consistencyScore,
      discoverabilityScore,
      engagementRate
    });

    return {
      totalViews,
      totalVideos: filteredVideos.length,
      totalChannels: channels.size,
      totalDuration,
      totalLikes,
      totalComments,
      oldestVideo,
      newestVideo,
      timeSpan,
      avgUploadFrequency: (filteredVideos.length / Math.max(timeSpan / 30, 1)),
      avgViewsPerVideo,
      avgLikesPerVideo: totalLikes / filteredVideos.length,
      avgCommentsPerVideo: totalComments / filteredVideos.length,
      engagementRate,
      performanceScore: (qualityScore + consistencyScore + discoverabilityScore) / 3,
      mostViewedVideo,
      leastViewedVideo,
      mostLikedVideo,
      mostCommentedVideo,
      longestVideo,
      shortestVideo,
      channels,
      dominantChannel: dominantChannel!,
      channelDiversity: channels.size / filteredVideos.length,
      topTags: Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 10),
      categories: Object.entries(categoryCount).sort((a, b) => b[1] - a[1]),
      languages: Object.entries(languageCount).sort((a, b) => b[1] - a[1]),
      uploadPattern,
      qualityScore,
      consistencyScore,
      discoverabilityScore,
      recommendations,
      insights
    };
  };

  const generateInsights = (videos: VideoData[], channels: Map<string, ChannelInfo>, metrics: any): string[] => {
    const insights: string[] = [];

    if (metrics.engagementRate > 0.05) {
      insights.push("High engagement rate indicates quality content that resonates with viewers");
    } else if (metrics.engagementRate < 0.01) {
      insights.push("Low engagement rate suggests content may need optimization for audience connection");
    }

    if (metrics.channelDiversity > 0.1) {
      insights.push("Good channel diversity provides varied perspectives and content styles");
    } else {
      insights.push("Content is dominated by few channels - consider diversifying sources");
    }

    if (metrics.timeSpan > 365) {
      insights.push("Long timespan shows historical content evolution and trends");
    }

    const viewVariance = videos.reduce((sum, v) => sum + Math.pow(v.views - metrics.avgViewsPerVideo, 2), 0) / videos.length;
    if (viewVariance < metrics.avgViewsPerVideo * 0.5) {
      insights.push("Consistent view performance across videos indicates stable audience interest");
    } else {
      insights.push("High view variance suggests some viral hits alongside regular content");
    }

    return insights;
  };

  const generateRecommendations = (videos: VideoData[], scores: any): string[] => {
    const recommendations: string[] = [];

    if (scores.qualityScore < 50) {
      recommendations.push("Focus on higher-quality content to improve view performance");
    }

    if (scores.consistencyScore < 60) {
      recommendations.push("Work on maintaining consistent performance across all videos");
    }

    if (scores.discoverabilityScore < 40) {
      recommendations.push("Improve SEO with better tags and descriptions");
    }

    if (scores.engagementRate < 0.02) {
      recommendations.push("Encourage more likes and comments to boost engagement");
    }

    const shortVideos = videos.filter(v => convertDurationToSeconds(v.duration) < 60).length;
    const longVideos = videos.filter(v => convertDurationToSeconds(v.duration) > 600).length;

    if (shortVideos > longVideos * 2) {
      recommendations.push("Consider adding some longer-form content for better watch time");
    } else if (longVideos > shortVideos * 2) {
      recommendations.push("Mix in some shorter videos for better audience retention");
    }

    return recommendations;
  };

  const handleSearch = () => {
    const extractedId = extractPlaylistId(playlistUrl);
    if (extractedId) {
      navigate(`/tools/playlist-analyzer/${extractedId}`);
    } else {
      alert('Invalid playlist URL or ID');
    }
  };

  const analyzePlaylist = async (id?: string) => {
    const currentPlaylistId = id || extractPlaylistId(playlistUrl);
    if (!currentPlaylistId) {
      alert('Invalid playlist URL or ID');
      return;
    }

    setIsLoading(true);
    setShowResults(false);

    try {
      const [playlistInfo, videos] = await Promise.all([
        fetchPlaylistInfo(currentPlaylistId),
        fetchAllVideos(currentPlaylistId)
      ]);

      if (videos.length === 0) {
        throw new Error('No videos found in playlist');
      }

      setPlaylistInfo(playlistInfo);
      setVideos(videos);

      const channelIds = Array.from(new Set(videos.map(v => v.channelId)));
      const channels = await fetchChannelDetails(channelIds);

      const analysisResult = calculateAnalysis(videos, channels);
      setAnalysis(analysisResult);
      setShowResults(true);
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while analyzing the playlist. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const exportAnalysis = () => {
    if (!analysis) return;

    const exportData = {
      playlistInfo,
      summary: {
        totalVideos: analysis.totalVideos,
        totalViews: analysis.totalViews,
        totalDuration: formatDuration(analysis.totalDuration),
        performanceScore: analysis.performanceScore.toFixed(1),
        engagementRate: (analysis.engagementRate * 100).toFixed(2) + '%'
      },
      topPerformers: {
        mostViewed: analysis.mostViewedVideo.title,
        mostLiked: analysis.mostLikedVideo.title,
        mostCommented: analysis.mostCommentedVideo.title
      },
      insights: analysis.insights,
      recommendations: analysis.recommendations,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `playlist_analysis_${playlistId || 'unknown'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderVideoCard = (video: VideoData) => (
    <S.VideoCard key={video.id}>
      <S.VideoThumbnail
        src={video.thumbnailUrl}
        alt={video.title}
        onClick={() => window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank')}
      />
      <S.VideoInfo>
        <S.VideoTitle>{video.title}</S.VideoTitle>
        <S.VideoChannel>{video.channelTitle}</S.VideoChannel>
        <S.VideoStats>
          <span><i className="bx bx-show"></i> {video.views.toLocaleString()}</span>
          <span><i className="bx bx-like"></i> {video.likes.toLocaleString()}</span>
          <span><i className="bx bx-comment"></i> {video.comments.toLocaleString()}</span>
          <span><i className="bx bx-time"></i> {formatDuration(convertDurationToSeconds(video.duration))}</span>
        </S.VideoStats>
      </S.VideoInfo>
    </S.VideoCard>
  );

  const seoConfig = toolsSEO['playlist-analyzer'];
  const schemaData = generateToolSchema('playlist-analyzer', seoConfig);

  return (
    <>
      <SEO
        title={seoConfig.title}
        description={seoConfig.description}
        keywords={seoConfig.keywords}
        canonical="https://youtool.io/tools/playlist-analyzer"
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
      value={playlistUrl}
      onChange={(e) => setPlaylistUrl(e.target.value)}
      placeholder="Enter YouTube playlist URL for analysis"
      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
    />
    <S.HeaderSearchButton onClick={handleSearch} aria-label="Search">
      <i className="bx bx-search" />
    </S.HeaderSearchButton>
  </S.HeaderSearchBar>
</S.HeaderSearchContainer>

              {/* Toggle Buttons in Header */}
              <S.ControlsContainer>
                <S.ToggleButton
                  onClick={() => setShowFilters(!showFilters)}
                  className={showFilters ? 'active' : ''}
                >
                  <i className="bx bx-filter"></i>
                  Advanced Filters
                </S.ToggleButton>
              </S.ControlsContainer>
          </S.HeaderTextContent>
        </S.HeaderContent>
      </S.EnhancedHeader>

      {/* Google Ad Spot */}
      <GoogleAd adSlot="1234567890" />

      <S.SearchContainer>
      </S.SearchContainer>

      {showFilters && (
        <S.FiltersContainer>
          <S.FilterGrid>
            <S.FilterGroup>
              <S.FilterLabel>Minimum Views</S.FilterLabel>
              <S.FilterSelect
                value={filters.minViews}
                onChange={(e) => setFilters({ ...filters, minViews: parseInt(e.target.value) })}
              >
                <option value={0}>Any</option>
                <option value={1000}>1K+</option>
                <option value={10000}>10K+</option>
                <option value={100000}>100K+</option>
                <option value={1000000}>1M+</option>
              </S.FilterSelect>
            </S.FilterGroup>

            <S.FilterGroup>
              <S.FilterLabel>Max Videos</S.FilterLabel>
              <S.FilterSelect
                value={filters.maxVideos}
                onChange={(e) => setFilters({ ...filters, maxVideos: parseInt(e.target.value) })}
              >
                <option value={50}>50 videos</option>
                <option value={100}>100 videos</option>
                <option value={500}>500 videos</option>
                <option value={1000}>1000 videos</option>
              </S.FilterSelect>
            </S.FilterGroup>

            <S.FilterGroup>
              <S.FilterLabel>Sort By</S.FilterLabel>
              <S.FilterSelect
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
              >
                <option value="views">Views</option>
                <option value="likes">Likes</option>
                <option value="comments">Comments</option>
                <option value="date">Upload Date</option>
                <option value="duration">Duration</option>
              </S.FilterSelect>
            </S.FilterGroup>

            <S.FilterGroup>
              <S.FilterLabel>Channel Filter</S.FilterLabel>
              <S.FilterInput
                type="text"
                value={filters.channelFilter}
                onChange={(e) => setFilters({ ...filters, channelFilter: e.target.value })}
                placeholder="Filter by channel name..."
              />
            </S.FilterGroup>
          </S.FilterGrid>

          <S.CheckboxGroup>
            <S.Checkbox
              type="checkbox"
              id="topPerformers"
              checked={filters.showOnlyTopPerformers}
              onChange={(e) => setFilters({ ...filters, showOnlyTopPerformers: e.target.checked })}
            />
            <S.CheckboxLabel htmlFor="topPerformers">
              Show only top-performing videos (above average views)
            </S.CheckboxLabel>
          </S.CheckboxGroup>
        </S.FiltersContainer>
      )}

      {/* Educational Content Section */}
      {!showResults && (
        <S.EducationalSection>
          <S.EducationalContent>
            <S.SectionSubTitle>How to Use the Playlist Analyzer</S.SectionSubTitle>

            <S.EducationalText>
              Our Playlist Analyzer provides comprehensive insights into any YouTube playlist's performance,
              content distribution, and audience engagement patterns. Discover trends, identify top performers,
              and understand what makes playlists successful with detailed analytics and actionable recommendations.
            </S.EducationalText>

            <S.StepByStep>
              <S.StepItem>
                <S.StepNumberCircle>1</S.StepNumberCircle>
                <S.StepContent>
                  <S.PlaylistAnalyzerStepTitle>Enter Playlist URL</S.PlaylistAnalyzerStepTitle>
                  <S.EducationalText>
                    Paste any YouTube playlist URL into the search bar. Our system automatically extracts
                    the playlist ID and begins comprehensive analysis of all videos, channels, and performance
                    metrics within the playlist.
                  </S.EducationalText>
                </S.StepContent>
              </S.StepItem>

              <S.StepItem>
                <S.StepNumberCircle>2</S.StepNumberCircle>
                <S.StepContent>
                  <S.PlaylistAnalyzerStepTitle>Comprehensive Data Analysis</S.PlaylistAnalyzerStepTitle>
                  <S.EducationalText>
                    The analyzer processes video metadata, view counts, engagement metrics, upload patterns,
                    channel information, and content categorization. Advanced filters allow you to customize
                    the analysis by views, date ranges, channels, and performance thresholds.
                  </S.EducationalText>
                </S.StepContent>
              </S.StepItem>

              <S.StepItem>
                <S.StepNumberCircle>3</S.StepNumberCircle>
                <S.StepContent>
                  <S.PlaylistAnalyzerStepTitle>Review Insights & Recommendations</S.PlaylistAnalyzerStepTitle>
                  <S.EducationalText>
                    Examine detailed performance scores, top performers, channel distribution, and content
                    patterns. Use the insights and recommendations to optimize playlist organization,
                    identify content gaps, and improve overall playlist performance.
                  </S.EducationalText>
                </S.StepContent>
              </S.StepItem>
            </S.StepByStep>
          </S.EducationalContent>

          <S.EducationalContent>
            <S.SectionSubTitle>Playlist Analysis Metrics</S.SectionSubTitle>

            <S.FeatureList>
              <S.FeatureListItem>
                <i className="bx bx-check-circle"></i>
                <span><strong>Performance Scoring:</strong> Quality, consistency, and discoverability scores based on comprehensive metrics</span>
              </S.FeatureListItem>
              <S.FeatureListItem>
                <i className="bx bx-check-circle"></i>
                <span><strong>Content Distribution:</strong> Analysis of categories, tags, languages, and upload patterns across videos</span>
              </S.FeatureListItem>
              <S.FeatureListItem>
                <i className="bx bx-check-circle"></i>
                <span><strong>Channel Analysis:</strong> Detailed breakdown of contributing channels and their influence on playlist performance</span>
              </S.FeatureListItem>
              <S.FeatureListItem>
                <i className="bx bx-check-circle"></i>
                <span><strong>Engagement Metrics:</strong> Like-to-view ratios, comment engagement, and audience interaction patterns</span>
              </S.FeatureListItem>
              <S.FeatureListItem>
                <i className="bx bx-check-circle"></i>
                <span><strong>Top Performers:</strong> Identification of most viewed, liked, and commented videos within the playlist</span>
              </S.FeatureListItem>
              <S.FeatureListItem>
                <i className="bx bx-check-circle"></i>
                <span><strong>Temporal Analysis:</strong> Upload frequency patterns and playlist evolution over time</span>
              </S.FeatureListItem>
            </S.FeatureList>

            <S.EducationalText>
              Use this comprehensive analysis to understand playlist dynamics, optimize content curation,
              identify successful patterns, and make data-driven decisions for playlist improvement.
              Perfect for content creators, curators, and marketers analyzing playlist performance and
              audience engagement strategies.
            </S.EducationalText>
          </S.EducationalContent>
        </S.EducationalSection>
      )}

      <S.ResultsContainer className={showResults ? 'visible' : ''}>
        {isLoading ? (
          <S.LoadingContainer>
            <i className='bx bx-loader-alt bx-spin'></i>
            <p>Analyzing playlist and gathering insights...</p>
          </S.LoadingContainer>
        ) : analysis && playlistInfo ? (
          <>
            <S.PlaylistHeader>
              <S.PlaylistInfo>
                <S.PlaylistTitle>{playlistInfo.snippet.title}</S.PlaylistTitle>
                <S.PlaylistMeta>
                  <S.MetaItem>
                    <i className="bx bx-user"></i>
                    {playlistInfo.snippet.channelTitle}
                  </S.MetaItem>
                  <S.MetaItem>
                    <i className="bx bx-calendar"></i>
                    Created {new Date(playlistInfo.snippet.publishedAt).toLocaleDateString()}
                  </S.MetaItem>
                </S.PlaylistMeta>
              </S.PlaylistInfo>
              <S.PlaylistActions>
                <S.ActionButton onClick={exportAnalysis}>
                  <i className="bx bx-download"></i>
                  Export Analysis
                </S.ActionButton>
                <S.ActionButton
                  onClick={() => window.open(`https://www.youtube.com/playlist?list=${playlistId}`, '_blank')}
                >
                  <i className="bx bx-link"></i>
                  View Playlist
                </S.ActionButton>
              </S.PlaylistActions>
            </S.PlaylistHeader>

            <S.ScoreSection>
              <S.ScoreCard>
                <S.ScoreTitle>Quality Score</S.ScoreTitle>
                <S.ScoreValue score={analysis.qualityScore}>{analysis.qualityScore.toFixed(1)}</S.ScoreValue>
                <S.ScoreDescription>Based on views and engagement</S.ScoreDescription>
              </S.ScoreCard>
              <S.ScoreCard>
                <S.ScoreTitle>Consistency Score</S.ScoreTitle>
                <S.ScoreValue score={analysis.consistencyScore}>{analysis.consistencyScore.toFixed(1)}</S.ScoreValue>
                <S.ScoreDescription>Performance stability</S.ScoreDescription>
              </S.ScoreCard>
              <S.ScoreCard>
                <S.ScoreTitle>Discoverability Score</S.ScoreTitle>
                <S.ScoreValue score={analysis.discoverabilityScore}>{analysis.discoverabilityScore.toFixed(1)}</S.ScoreValue>
                <S.ScoreDescription>SEO and tagging quality</S.ScoreDescription>
              </S.ScoreCard>
              <S.ScoreCard>
                <S.ScoreTitle>Overall Score</S.ScoreTitle>
                <S.ScoreValue score={analysis.performanceScore}>{analysis.performanceScore.toFixed(1)}</S.ScoreValue>
                <S.ScoreDescription>Combined performance</S.ScoreDescription>
              </S.ScoreCard>
            </S.ScoreSection>

            <S.StatsGrid>
              <S.StatCard>
                <S.StatIcon className="bx bx-show"></S.StatIcon>
                <S.StatValue>{analysis.totalViews.toLocaleString()}</S.StatValue>
                <S.StatLabel>Total Views</S.StatLabel>
              </S.StatCard>

              <S.StatCard>
                <S.StatIcon className="bx bx-video"></S.StatIcon>
                <S.StatValue>{analysis.totalVideos}</S.StatValue>
                <S.StatLabel>Videos</S.StatLabel>
              </S.StatCard>

              <S.StatCard>
                <S.StatIcon className="bx bx-group"></S.StatIcon>
                <S.StatValue>{analysis.totalChannels}</S.StatValue>
                <S.StatLabel>Channels</S.StatLabel>
              </S.StatCard>

              <S.StatCard>
                <S.StatIcon className="bx bx-time"></S.StatIcon>
                <S.StatValue>{formatDuration(analysis.totalDuration)}</S.StatValue>
                <S.StatLabel>Duration</S.StatLabel>
              </S.StatCard>

              <S.StatCard>
                <S.StatIcon className="bx bx-like"></S.StatIcon>
                <S.StatValue>{analysis.totalLikes.toLocaleString()}</S.StatValue>
                <S.StatLabel>Total Likes</S.StatLabel>
              </S.StatCard>

              <S.StatCard>
                <S.StatIcon className="bx bx-comment"></S.StatIcon>
                <S.StatValue>{analysis.totalComments.toLocaleString()}</S.StatValue>
                <S.StatLabel>Comments</S.StatLabel>
              </S.StatCard>

              <S.StatCard>
                <S.StatIcon className="bx bx-trending-up"></S.StatIcon>
                <S.StatValue>{(analysis.engagementRate * 100).toFixed(2)}%</S.StatValue>
                <S.StatLabel>Engagement</S.StatLabel>
              </S.StatCard>

              <S.StatCard>
                <S.StatIcon className="bx bx-calendar"></S.StatIcon>
                <S.StatValue>{analysis.timeSpan}</S.StatValue>
                <S.StatLabel>Days Span</S.StatLabel>
              </S.StatCard>
            </S.StatsGrid>

            <S.AnalysisGrid>
              <S.AnalysisSection>
                <S.SectionTitle>
                  <i className="bx bx-trophy"></i>
                  Top Performers
                </S.SectionTitle>
                <S.PerformerList>
                  <S.PerformerItem>
                    <S.PerformerLabel>Most Viewed:</S.PerformerLabel>
                    <S.PerformerValue>{analysis.mostViewedVideo.title}</S.PerformerValue>
                    <S.PerformerStat>{analysis.mostViewedVideo.views.toLocaleString()} views</S.PerformerStat>
                  </S.PerformerItem>
                  <S.PerformerItem>
                    <S.PerformerLabel>Most Liked:</S.PerformerLabel>
                    <S.PerformerValue>{analysis.mostLikedVideo.title}</S.PerformerValue>
                    <S.PerformerStat>{analysis.mostLikedVideo.likes.toLocaleString()} likes</S.PerformerStat>
                  </S.PerformerItem>
                  <S.PerformerItem>
                    <S.PerformerLabel>Most Discussed:</S.PerformerLabel>
                    <S.PerformerValue>{analysis.mostCommentedVideo.title}</S.PerformerValue>
                    <S.PerformerStat>{analysis.mostCommentedVideo.comments.toLocaleString()} comments</S.PerformerStat>
                  </S.PerformerItem>
                </S.PerformerList>
              </S.AnalysisSection>

              <S.AnalysisSection>
                <S.SectionTitle>
                  <i className="bx bx-user"></i>
                  All Channels ({analysis.totalChannels})
                </S.SectionTitle>
                <S.ChannelList>
                  {Array.from(analysis.channels.values()).map((channel) => (
                    <S.ChannelItem key={channel.id}>
                      <S.ChannelLogo src={channel.thumbnailUrl} alt={`${channel.title} logo`} />
                      <S.ChannelInfo>
                        <S.ChannelName>{channel.title}</S.ChannelName>
                        <S.ChannelStats>
                          {channel.subscriberCount.toLocaleString()} subscribers
                        </S.ChannelStats>
                      </S.ChannelInfo>
                    </S.ChannelItem>
                  ))}
                </S.ChannelList>
              </S.AnalysisSection>

              <S.AnalysisSection>
                <S.SectionTitle>
                  <i className="bx bx-tag"></i>
                  Popular Tags
                </S.SectionTitle>
                <S.CategoryList>
                  {analysis.topTags.slice(0, 8).map(([tag, count]) => (
                    <S.CategoryItem key={tag}>
                      <S.CategoryName>{tag}</S.CategoryName>
                      <S.CategoryCount>{count} videos</S.CategoryCount>
                    </S.CategoryItem>
                  ))}
                </S.CategoryList>
              </S.AnalysisSection>

              <S.AnalysisSection>
                <S.SectionTitle>
                  <i className="bx bx-category"></i>
                  Content Categories
                </S.SectionTitle>
                <S.CategoryList>
                  {analysis.categories.slice(0, 5).map(([categoryId, count]) => (
                    <S.CategoryItem key={categoryId}>
                      <S.CategoryName>
                        {videoCategories[categoryId] || `Category ${categoryId}`}
                      </S.CategoryName>
                      <S.CategoryCount>{count} videos</S.CategoryCount>
                    </S.CategoryItem>
                  ))}
                </S.CategoryList>
              </S.AnalysisSection>
            </S.AnalysisGrid>

            {analysis.insights.length > 0 && (
              <S.InsightsSection>
                <S.SectionTitle>
                  <i className="bx bx-bulb"></i>
                  Key Insights
                </S.SectionTitle>
                <S.InsightsList>
                  {analysis.insights.map((insight, index) => (
                    <S.InsightItem key={index}>
                      <i className="bx bx-check-circle"></i>
                      {insight}
                    </S.InsightItem>
                  ))}
                </S.InsightsList>
              </S.InsightsSection>
            )}

            {analysis.recommendations.length > 0 && (
              <S.RecommendationsSection>
                <S.SectionTitle>
                  <i className="bx bx-star"></i>
                  Recommendations
                </S.SectionTitle>
                <S.RecommendationsList>
                  {analysis.recommendations.map((recommendation, index) => (
                    <S.RecommendationItem key={index}>
                      <i className="bx bx-right-arrow-alt"></i>
                      {recommendation}
                    </S.RecommendationItem>
                  ))}
                </S.RecommendationsList>
              </S.RecommendationsSection>
            )}

            <S.VideoSection>
              <S.VideoSectionHeader>
                <S.SectionTitle>
                  <i className="bx bx-video-recording"></i>
                  Videos in Playlist ({analysis.totalVideos})
                </S.SectionTitle>
                <S.VideoToggleButton onClick={() => setShowDetailedVideos(!showDetailedVideos)}>
                  {showDetailedVideos ? 'Hide Videos' : 'Show Videos'}
                </S.VideoToggleButton>
              </S.VideoSectionHeader>

              {showDetailedVideos && (
                <S.VideoGrid>
                  {videos.slice(0, 20).map(renderVideoCard)}
                  {videos.length > 20 && (
                    <S.ShowMoreButton onClick={() => setShowDetailedVideos(false)}>
                      Only showing first 20 videos. Click "View Playlist" to see all.
                    </S.ShowMoreButton>
                  )}
                </S.VideoGrid>
              )}
            </S.VideoSection>

          </>
        ) : null}
      </S.ResultsContainer>
    </S.MainContainer>
    </S.PageWrapper >
    </>
  );
};

export default PlaylistAnalyzer;