// src/pages/Tools/components/KeywordAnalyzer/KeywordAnalyzer.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdSense } from '../../../../components/AdSense/AdSense';
import * as S from './styles';

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  views: number;
  likes: number;
  publishedAt: string;
  channelTitle: string;
  channelId: string;
  duration: string;
  tags: string[];
}

interface KeywordData {
  keyword: string;
  searchVolume: number;
  competitionScore: number;
  overallScore: number;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Very Hard';
  trend: 'Rising' | 'Stable' | 'Declining';
  relatedKeywords: string[];
  topVideos: YouTubeVideo[];
  insights: {
    averageViews: number;
    averageLength: number;
    bestUploadDays: string[];
    topChannels: { name: string; count: number }[];
    totalResults: number;
    newVideosLastWeek: number;
    keywordInTitlePercentage: number;
    averageLikes: number;
  };
  recommendations: string[];
}

export const KeywordAnalyzer: React.FC = () => {
  const navigate = useNavigate();
  const { keyword: urlKeyword } = useParams<{ keyword: string }>();
  const [keyword, setKeyword] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<KeywordData | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tool configuration
  const toolConfig = {
    name: 'Keyword Analyzer',
    description: 'Discover search volume, competition, and optimization opportunities for YouTube keywords with detailed insights',
    image: 'https://64.media.tumblr.com/10c0d99fe1fe964324e1cdb293ee4756/0e01452f9f6dd974-c1/s2048x3072/4307ba680bb19d0d80529c1d1415552dffdd3b9a.jpg',
    icon: 'bx bx-search-alt',
    features: [
      'Search volume analysis',
      'Competition scoring',
      'Trend identification'
    ]
  };

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('keyword_history');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // Handle URL keyword parameter
  useEffect(() => {
    if (urlKeyword) {
      const decodedKeyword = decodeURIComponent(urlKeyword);
      setKeyword(decodedKeyword);
      analyzeKeywordFromUrl(decodedKeyword);
    }
  }, [urlKeyword]);

  const saveToHistory = (searchTerm: string) => {
    const newHistory = [searchTerm, ...searchHistory.filter(h => h !== searchTerm)].slice(0, 8);
    setSearchHistory(newHistory);
    localStorage.setItem('keyword_history', JSON.stringify(newHistory));
  };

  const fetchYouTubeData = async (searchTerm: string): Promise<YouTubeVideo[]> => {
    const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY_2;
    
    if (!API_KEY) {
      throw new Error('YouTube API key not configured.');
    }

    try {
      // Search for videos
      const searchResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet&type=video&q=${encodeURIComponent(searchTerm)}&` +
        `maxResults=50&order=relevance&key=${API_KEY}`
      );

      if (!searchResponse.ok) {
        throw new Error(`YouTube API error: ${searchResponse.status}`);
      }

      const searchData = await searchResponse.json();
      
      if (!searchData.items || searchData.items.length === 0) {
        throw new Error('No videos found for this keyword');
      }

      // Get video IDs for detailed stats
      const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
      
      // Fetch detailed video statistics
      const statsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?` +
        `part=statistics,contentDetails,snippet&id=${videoIds}&key=${API_KEY}`
      );

      if (!statsResponse.ok) {
        throw new Error(`YouTube API error: ${statsResponse.status}`);
      }

      const statsData = await statsResponse.json();

      // Combine search results with detailed stats
      const videos: YouTubeVideo[] = searchData.items.map((searchItem: any) => {
        const statsItem = statsData.items.find((stat: any) => stat.id === searchItem.id.videoId);
        
        return {
          id: searchItem.id.videoId,
          title: searchItem.snippet.title,
          description: searchItem.snippet.description,
          thumbnail: searchItem.snippet.thumbnails.medium?.url || searchItem.snippet.thumbnails.default.url,
          views: parseInt(statsItem?.statistics?.viewCount || '0'),
          likes: parseInt(statsItem?.statistics?.likeCount || '0'),
          publishedAt: searchItem.snippet.publishedAt,
          channelTitle: searchItem.snippet.channelTitle,
          channelId: searchItem.snippet.channelId,
          duration: statsItem?.contentDetails?.duration || 'PT0S',
          tags: statsItem?.snippet?.tags || []
        };
      }).filter((video: YouTubeVideo) => video.views > 0); // Filter out videos with no view data

      return videos;
    } catch (error) {
      console.error('YouTube API Error:', error);
      throw error;
    }
  };

  const parseDuration = (duration: string): number => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    return hours * 3600 + minutes * 60 + seconds;
  };

  const analyzeKeywordData = (videos: YouTubeVideo[], keyword: string): KeywordData => {
    if (videos.length === 0) {
      throw new Error('No video data available for analysis');
    }

    // Calculate basic metrics
    const totalViews = videos.reduce((sum, video) => sum + video.views, 0);
    const averageViews = Math.round(totalViews / videos.length);
    const averageLikes = Math.round(videos.reduce((sum, video) => sum + video.likes, 0) / videos.length);
    
    const durations = videos.map(video => parseDuration(video.duration));
    const averageLength = Math.round(durations.reduce((sum, duration) => sum + duration, 0) / durations.length);

    // Improved Search Volume Calculation
    // Use logarithmic scale to better distribute scores across different popularity levels
    const maxViews = Math.max(...videos.map(v => v.views));
    const medianViews = [...videos].sort((a, b) => a.views - b.views)[Math.floor(videos.length / 2)]?.views || 0;
    
    // Logarithmic scaling with multiple factors
    const viewsFactor = Math.log10(Math.max(1, averageViews)) * 10; // 0-70 range typically
    const peakFactor = Math.log10(Math.max(1, maxViews)) * 8; // Peak performance indicator
    const consistencyFactor = (medianViews / Math.max(1, averageViews)) * 20; // How consistent the performance is
    
    const searchVolume = Math.min(100, Math.max(1, Math.round(
      (viewsFactor * 0.4) + 
      (peakFactor * 0.3) + 
      (consistencyFactor * 0.3)
    )));

    // Improved Competition Score Calculation
    // Lower scores = less competition (better opportunity)
    const viewsStdDev = Math.sqrt(
      videos.reduce((sum, video) => {
        const diff = video.views - averageViews;
        return sum + (diff * diff);
      }, 0) / videos.length
    );
    
    const coefficientOfVariation = viewsStdDev / Math.max(1, averageViews);
    
    // Count videos with keyword in title
    const keywordInTitle = videos.filter(video => 
      video.title.toLowerCase().includes(keyword.toLowerCase())
    ).length;
    const keywordInTitlePercentage = Math.round((keywordInTitle / videos.length) * 100);
    
    // Count recent videos (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentVideos = videos.filter(video => 
      new Date(video.publishedAt) > thirtyDaysAgo
    ).length;
    
    // Count high-performing channels (channels with multiple videos in top results)
    const channelCount = videos.reduce((acc, video) => {
      acc[video.channelId] = (acc[video.channelId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const dominantChannels = Object.values(channelCount).filter(count => count > 1).length;
    
    // Competition factors (each 0-100, lower = less competition)
    const saturationFactor = Math.min(100, (recentVideos / videos.length) * 200); // High recent upload rate = more competition
    const dominanceFactor = Math.min(100, (dominantChannels / videos.length) * 300); // Few channels dominating = harder to break in
    const titleOptimizationFactor = Math.min(100, keywordInTitlePercentage); // High keyword usage = more competition
    const variabilityFactor = Math.min(100, (1 - Math.min(1, coefficientOfVariation)) * 100); // Low variation = established competition
    
    const competitionScore = Math.round(
      (saturationFactor * 0.3) +
      (dominanceFactor * 0.25) +
      (titleOptimizationFactor * 0.25) +
      (variabilityFactor * 0.2)
    );

    // Calculate difficulty based on refined competition score
    let difficulty: 'Easy' | 'Medium' | 'Hard' | 'Very Hard' = 'Easy';
    if (competitionScore > 80) difficulty = 'Very Hard';
    else if (competitionScore > 60) difficulty = 'Hard';
    else if (competitionScore > 35) difficulty = 'Medium';

    // Overall score (opportunity score: high search volume, low competition)
    const overallScore = Math.round(
      (searchVolume * 0.6) + ((100 - competitionScore) * 0.4)
    );

    // Analyze upload patterns
    const uploadDays = videos.map(video => {
      const date = new Date(video.publishedAt);
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    });
    
    const dayCount = uploadDays.reduce((acc, day) => {
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const bestUploadDays = Object.entries(dayCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([day]) => day);

    // Analyze top channels
    const topChannels = Object.entries(channelCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([channelId, count]) => ({ 
        name: videos.find(v => v.channelId === channelId)?.channelTitle || channelId, 
        count 
      }));

    // Count recent videos (last week for trend)
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newVideosLastWeek = videos.filter(video => 
      new Date(video.publishedAt) > oneWeekAgo
    ).length;

    // Generate related keywords from video titles and tags
    const allTags = videos.flatMap(video => video.tags);
    const allTitles = videos.map(video => video.title).join(' ');
    
    const tagKeywords = allTags.filter(tag => 
      tag.toLowerCase() !== keyword.toLowerCase() && 
      tag.length > 2 && 
      tag.length < 20
    );
    
    const titleKeywords = allTitles.split(/\s+/)
      .filter(word => 
        word.toLowerCase() !== keyword.toLowerCase() && 
        word.length > 3 && 
        !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'].includes(word.toLowerCase())
      );
    
    const uniqueKeywords = Array.from(new Set([...tagKeywords, ...titleKeywords]));
    const relatedKeywords = uniqueKeywords.slice(0, 12);

    // Trend analysis
    let trend: 'Rising' | 'Stable' | 'Declining' = 'Stable';
    if (newVideosLastWeek > videos.length * 0.15) trend = 'Rising';
    else if (newVideosLastWeek < videos.length * 0.05) trend = 'Declining';

    // Enhanced recommendations
    const recommendations = [
      `Search Volume: ${searchVolume}/100 - ${searchVolume > 70 ? 'High demand keyword' : searchVolume > 40 ? 'Moderate demand' : 'Niche keyword with specific audience'}`,
      `Competition: ${competitionScore}/100 - ${competitionScore < 35 ? 'Low competition, good opportunity' : competitionScore < 60 ? 'Moderate competition, focus on quality' : 'High competition, need unique angle'}`,
      `${keywordInTitlePercentage}% of top videos include exact keyword - ${keywordInTitlePercentage > 80 ? 'Essential for ranking' : keywordInTitlePercentage > 50 ? 'Highly recommended' : 'Consider keyword variations'}`,
      `Average views: ${averageViews.toLocaleString()} - ${averageViews > 100000 ? 'High-performing niche' : averageViews > 10000 ? 'Good potential' : 'Specialized audience'}`,
      `Upload timing: ${bestUploadDays.join(', ')} show best performance`,
      `Video length: Target ${Math.floor(averageLength / 60)}:${(averageLength % 60).toString().padStart(2, '0')} for optimal engagement`,
      trend === 'Rising' ? 'Trending topic - act quickly for best results' : 
      trend === 'Declining' ? 'Declining interest - consider pivot to related keywords' : 
      'Stable market - consistent long-term opportunity'
    ];

    return {
      keyword,
      searchVolume,
      competitionScore,
      overallScore,
      difficulty,
      trend,
      relatedKeywords,
      topVideos: videos.slice(0, 10), // Top 10 videos
      insights: {
        averageViews,
        averageLength,
        bestUploadDays,
        topChannels,
        totalResults: videos.length,
        newVideosLastWeek,
        keywordInTitlePercentage,
        averageLikes
      },
      recommendations
    };
  };

  const analyzeKeywordFromUrl = async (searchTerm: string) => {
    setIsAnalyzing(true);
    setShowResults(false);
    setError(null);

    try {
      // Fetch real YouTube data
      const videos = await fetchYouTubeData(searchTerm);
      
      // Analyze the data
      const analysis = analyzeKeywordData(videos, searchTerm);
      
      saveToHistory(searchTerm);
      setResults(analysis);
      setShowResults(true);
    } catch (error) {
      console.error('Error analyzing keyword:', error);
      setError(error instanceof Error ? error.message : 'Failed to analyze keyword. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeKeyword = async () => {
    if (!keyword.trim()) {
      setError('Please enter a keyword to analyze');
      return;
    }

    // Update URL to include the keyword
    const encodedKeyword = encodeURIComponent(keyword.trim());
    navigate(`/tools/keyword-analyzer/${encodedKeyword}`);
  };

  const handleRelatedKeywordClick = (relatedKeyword: string) => {
    const encodedKeyword = encodeURIComponent(relatedKeyword);
    navigate(`/tools/keyword-analyzer/${encodedKeyword}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#4caf50';
      case 'Medium': return '#ff9800';
      case 'Hard': return '#f44336';
      case 'Very Hard': return '#9c27b0';
      default: return '#607d8b';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'Rising': return 'bx bx-trending-up';
      case 'Stable': return 'bx bx-minus';
      case 'Declining': return 'bx bx-trending-down';
      default: return 'bx bx-minus';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'Rising': return '#4caf50';
      case 'Stable': return '#ff9800';
      case 'Declining': return '#f44336';
      default: return '#607d8b';
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <S.PageWrapper>
      {/* Left Sidebar Ad */}
      <S.AdSidebar position="left">
        <AdSense 
          slot={process.env.REACT_APP_ADSENSE_SLOT_SIDEBAR || ''}
          format="vertical"
        />
      </S.AdSidebar>

      {/* Right Sidebar Ad */}
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
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Enter keyword or phrase to analyze (e.g., 'gaming tutorial', 'cooking recipes')"
                    onKeyPress={(e) => e.key === 'Enter' && analyzeKeyword()}
                  />
                  <S.HeaderSearchButton onClick={analyzeKeyword} disabled={isAnalyzing || !keyword.trim()}>
                    {isAnalyzing ? (
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

        {/* Error Message */}
        {error && (
          <S.ErrorMessage>
            <i className="bx bx-error"></i>
            {error}
          </S.ErrorMessage>
        )}

        {/* Search History */}
        {searchHistory.length > 0 && (
          <S.HistorySection>
            <S.HistoryLabel>Recent searches:</S.HistoryLabel>
            <S.HistoryList>
              {searchHistory.map((term, index) => (
                <S.HistoryItem key={index} onClick={() => setKeyword(term)}>
                  <i className="bx bx-time"></i>
                  {term}
                </S.HistoryItem>
              ))}
            </S.HistoryList>
          </S.HistorySection>
        )}

        {isAnalyzing && (
          <S.LoadingContainer>
            <S.LoadingAnimation>
              <i className="bx bx-loader-alt bx-spin"></i>
            </S.LoadingAnimation>
            <S.LoadingText>Analyzing keyword performance...</S.LoadingText>
            <S.LoadingSteps>
              <S.LoadingStep>Fetching YouTube search results</S.LoadingStep>
              <S.LoadingStep>Analyzing video performance data</S.LoadingStep>
              <S.LoadingStep>Calculating competition metrics</S.LoadingStep>
              <S.LoadingStep>Generating optimization insights</S.LoadingStep>
            </S.LoadingSteps>
          </S.LoadingContainer>
        )}

        {showResults && results && (
          <S.ResultsContainer>
            <S.ResultsHeader>
              <S.ResultsTitle>Analysis Results for "{results.keyword}"</S.ResultsTitle>
            </S.ResultsHeader>

            {/* Key Metrics */}
            <S.MetricsGrid>
              <S.MetricCard>
                <S.MetricIcon className="bx bx-bar-chart-alt"></S.MetricIcon>
                <S.MetricValue>{results.searchVolume}</S.MetricValue>
                <S.MetricLabel>Search Volume</S.MetricLabel>
                <S.MetricSubtext>Relative search interest</S.MetricSubtext>
              </S.MetricCard>

              <S.MetricCard>
                <S.MetricIcon className="bx bx-trophy"></S.MetricIcon>
                <S.MetricValue>{results.competitionScore}</S.MetricValue>
                <S.MetricLabel>Competition Score</S.MetricLabel>
                <S.MetricSubtext>Lower is better</S.MetricSubtext>
              </S.MetricCard>

              <S.MetricCard>
                <S.MetricIcon className="bx bx-target-lock"></S.MetricIcon>
                <S.MetricValue>{results.overallScore}</S.MetricValue>
                <S.MetricLabel>Overall Score</S.MetricLabel>
                <S.MetricSubtext>Opportunity rating</S.MetricSubtext>
              </S.MetricCard>

              <S.MetricCard>
                <S.MetricIcon 
                  className={getTrendIcon(results.trend)}
                  style={{ color: getTrendColor(results.trend) }}
                ></S.MetricIcon>
                <S.MetricValue style={{ color: getTrendColor(results.trend) }}>
                  {results.trend}
                </S.MetricValue>
                <S.MetricLabel>Trend</S.MetricLabel>
                <S.MetricSubtext>Current direction</S.MetricSubtext>
              </S.MetricCard>
            </S.MetricsGrid>

            {/* Analysis Grid */}
            <S.AnalysisGrid>
              {/* Difficulty & Insights */}
              <S.AnalysisCard>
                <S.CardTitle>
                  <i className="bx bx-brain"></i>
                  SEO Insights
                </S.CardTitle>
                
                <S.InsightItem>
                  <S.InsightLabel>Difficulty Level:</S.InsightLabel>
                  <S.DifficultyBadge color={getDifficultyColor(results.difficulty)}>
                    {results.difficulty}
                  </S.DifficultyBadge>
                </S.InsightItem>

                <S.InsightItem>
                  <S.InsightLabel>Average Views:</S.InsightLabel>
                  <S.InsightValue>{results.insights.averageViews.toLocaleString()}</S.InsightValue>
                </S.InsightItem>

                <S.InsightItem>
                  <S.InsightLabel>Average Video Length:</S.InsightLabel>
                  <S.InsightValue>{formatDuration(results.insights.averageLength)}</S.InsightValue>
                </S.InsightItem>

                <S.InsightItem>
                  <S.InsightLabel>Best Upload Days:</S.InsightLabel>
                  <S.DaysList>
                    {results.insights.bestUploadDays.map(day => (
                      <S.DayBadge key={day}>{day}</S.DayBadge>
                    ))}
                  </S.DaysList>
                </S.InsightItem>

                <S.InsightItem>
                  <S.InsightLabel>Keyword in Title:</S.InsightLabel>
                  <S.InsightValue>{results.insights.keywordInTitlePercentage}%</S.InsightValue>
                </S.InsightItem>
              </S.AnalysisCard>

              {/* Related Keywords */}
              <S.AnalysisCard>
                <S.CardTitle>
                  <i className="bx bx-tag"></i>
                  Related Keywords
                </S.CardTitle>
                
                <S.KeywordsList>
                  {results.relatedKeywords.map((relatedKeyword, index) => (
                    <S.KeywordTag 
                      key={index}
                      onClick={() => handleRelatedKeywordClick(relatedKeyword)}
                    >
                      {relatedKeyword}
                    </S.KeywordTag>
                  ))}
                </S.KeywordsList>

                <S.KeywordNote>
                  Click any keyword to analyze it
                </S.KeywordNote>
              </S.AnalysisCard>
            </S.AnalysisGrid>

            {/* Top Videos */}
            <S.TopVideosSection>
              <S.SectionTitle>
                <i className="bx bx-play-circle"></i>
                Top Performing Videos 
              </S.SectionTitle>
              
              <S.VideosList>
                {results.topVideos.map((video, index) => (
                  <S.VideoCard key={video.id}>
                    <S.VideoRank>#{index + 1}</S.VideoRank>
                    <S.VideoThumbnail 
                      src={video.thumbnail} 
                      alt={video.title}
                    />
                    <S.VideoInfo>
                      <S.VideoTitle>{video.title}</S.VideoTitle>
                      <S.VideoChannel>{video.channelTitle}</S.VideoChannel>
                      <S.VideoMeta>
                        <S.VideoMetaItem>
                          <i className="bx bx-show"></i>
                          {video.views.toLocaleString()} views
                        </S.VideoMetaItem>
                        <S.VideoMetaItem>
                          <i className="bx bx-like"></i>
                          {video.likes.toLocaleString()} likes
                        </S.VideoMetaItem>
                        <S.VideoMetaItem>
                          <i className="bx bx-time"></i>
                          {formatDuration(parseDuration(video.duration))}
                        </S.VideoMetaItem>
                        <S.VideoMetaItem>
                          <i className="bx bx-calendar"></i>
                          {formatDate(video.publishedAt)}
                        </S.VideoMetaItem>
                      </S.VideoMeta>
                    </S.VideoInfo>
                    <S.VideoAction
                      href={`https://youtube.com/watch?v=${video.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="bx bx-play"></i>
                      Watch
                    </S.VideoAction>
                  </S.VideoCard>
                ))}
              </S.VideosList>
            </S.TopVideosSection>

            {/* Recommendations */}
            <S.RecommendationsSection>
              <S.SectionTitle>
                <i className="bx bx-lightbulb"></i>
                Optimization Recommendations
              </S.SectionTitle>
              
              <S.RecommendationsList>
                {results.recommendations.map((recommendation, index) => (
                  <S.Recommendation key={index} type="info">
                    <i className="bx bx-check-circle"></i>
                    <div>
                      {recommendation}
                    </div>
                  </S.Recommendation>
                ))}
              </S.RecommendationsList>
            </S.RecommendationsSection>
          </S.ResultsContainer>
        )}

        {/* Bottom Ad */}
        <S.BottomAdContainer>
          <AdSense 
            slot={process.env.REACT_APP_ADSENSE_SLOT_BOTTOM || ''}
            format="horizontal"
          />
        </S.BottomAdContainer>
      </S.MainContainer>
    </S.PageWrapper>
  );
};

export default KeywordAnalyzer;