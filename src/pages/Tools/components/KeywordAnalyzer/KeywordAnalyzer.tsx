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

interface UploadTimeData {
  day: string;
  hour: number;
  count: number;
  avgViews: number;
}

interface KeywordData {
  keyword: string;
  tagScore: number; // Main score like rapidtags.io
  searchVolume: 'Low' | 'Moderate' | 'High' | 'Very High';
  searchVolumeScore: number; // 0-100 numeric value
  competitiveness: 'Low' | 'Moderate' | 'High' | 'Very High';
  competitivenessScore: number; // 0-100 numeric value
  trend: 'Rising' | 'Stable' | 'Declining';
  relatedKeywords: string[];
  topVideos: YouTubeVideo[];
  uploadTimeDistribution: UploadTimeData[];
  insights: {
    averageViews: number;
    averageViewCount: string; // Formatted like "472.3K"
    viewsPerDay: number;
    averageLength: number;
    bestUploadDays: string[];
    bestUploadTimes: { day: string; hour: number }[];
    topChannels: { name: string; count: number }[];
    totalResults: number;
    newVideosLastWeek: number;
    keywordInTitlePercentage: number;
    averageLikes: number;
    engagementRate: number;
    optimalUploadTime: string;
  };
  recommendations: string[];
  performanceDescription: string;
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
      'Tag score analysis like rapidtags.io',
      'Upload time distribution chart',
      'Engagement rate calculation',
      'Optimal posting time recommendations'
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
      // Search for videos with multiple queries to get broader data
      const searchQueries = [
        searchTerm,
        `${searchTerm} tutorial`,
        `${searchTerm} guide`,
        `how to ${searchTerm}`,
        `${searchTerm} tips`
      ];

      let allVideos: YouTubeVideo[] = [];

      for (const query of searchQueries) {
        try {
          const searchResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/search?` +
            `part=snippet&type=video&q=${encodeURIComponent(query)}&` +
            `maxResults=20&order=relevance&key=${API_KEY}&publishedAfter=${new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()}`
          );

          if (!searchResponse.ok) continue;

          const searchData = await searchResponse.json();
          
          if (searchData.items && searchData.items.length > 0) {
            const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
            
            const statsResponse = await fetch(
              `https://www.googleapis.com/youtube/v3/videos?` +
              `part=statistics,contentDetails,snippet&id=${videoIds}&key=${API_KEY}`
            );

            if (!statsResponse.ok) continue;

            const statsData = await statsResponse.json();

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
            }).filter((video: YouTubeVideo) => video.views > 100); // Filter minimum views

            allVideos = [...allVideos, ...videos];
          }
        } catch (queryError) {
          console.warn(`Error with query "${query}":`, queryError);
          continue;
        }
      }

      // Remove duplicates and get top performers
      const uniqueVideos = allVideos.filter((video, index, self) => 
        index === self.findIndex(v => v.id === video.id)
      );

      // Sort by views and take top 100
      return uniqueVideos.sort((a, b) => b.views - a.views).slice(0, 100);

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

  const formatViewCount = (views: number): string => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const analyzeUploadTimes = (videos: YouTubeVideo[]): UploadTimeData[] => {
    const timeData: { [key: string]: { count: number; totalViews: number } } = {};
    
    videos.forEach(video => {
      const date = new Date(video.publishedAt);
      const day = date.toLocaleDateString('en-US', { weekday: 'long' });
      const hour = date.getHours();
      const key = `${day}-${hour}`;
      
      if (!timeData[key]) {
        timeData[key] = { count: 0, totalViews: 0 };
      }
      
      timeData[key].count++;
      timeData[key].totalViews += video.views;
    });

    return Object.entries(timeData).map(([key, data]) => {
      const [day, hourStr] = key.split('-');
      return {
        day,
        hour: parseInt(hourStr),
        count: data.count,
        avgViews: data.totalViews / data.count
      };
    });
  };

  const calculateTagScore = (videos: YouTubeVideo[], keyword: string): number => {
    if (videos.length === 0) return 0;

    // Factors that rapidtags.io likely considers for tag score
    const totalViews = videos.reduce((sum, video) => sum + video.views, 0);
    const totalLikes = videos.reduce((sum, video) => sum + video.likes, 0);
    const averageViews = totalViews / videos.length;
    const averageLikes = totalLikes / videos.length;

    // 1. Content Volume Factor (0-25 points)
    // Based on number of quality videos for the keyword
    const volumeFactor = Math.min(25, (videos.length / 4) * 25);

    // 2. Performance Factor (0-30 points)
    // Based on average views and engagement
    const performanceLog = Math.log10(Math.max(1, averageViews));
    const performanceFactor = Math.min(30, (performanceLog / 7) * 30);

    // 3. Growth Potential Factor (0-25 points)
    // Based on recent videos performance vs older ones
    const recentVideos = videos.filter(v => 
      new Date(v.publishedAt) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    );
    const recentAvgViews = recentVideos.length > 0 ? 
      recentVideos.reduce((sum, v) => sum + v.views, 0) / recentVideos.length : 0;
    const growthRatio = recentAvgViews / Math.max(1, averageViews);
    const growthFactor = Math.min(25, growthRatio * 20);

    // 4. Engagement Quality Factor (0-20 points)
    // Based on likes-to-views ratio
    const engagementRate = averageLikes / Math.max(1, averageViews);
    const engagementFactor = Math.min(20, engagementRate * 2000);

    const tagScore = Math.round(volumeFactor + performanceFactor + growthFactor + engagementFactor);
    return Math.min(100, Math.max(1, tagScore));
  };

  const calculateSearchVolume = (videos: YouTubeVideo[]): { label: 'Low' | 'Moderate' | 'High' | 'Very High'; score: number } => {
    const totalViews = videos.reduce((sum, video) => sum + video.views, 0);
    const averageViews = totalViews / videos.length;
    
    // More balanced scoring algorithm
    // 1. Base score from video count (0-30 points)
    const videoCountScore = Math.min(30, (videos.length / 100) * 30);
    
    // 2. Average views score (0-40 points) - logarithmic scale
    const viewsScore = Math.min(40, (Math.log10(Math.max(1, averageViews)) - 2) * 8);
    
    // 3. Recent activity bonus (0-20 points)
    const recentVideos = videos.filter(video => 
      new Date(video.publishedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    const recentActivityScore = Math.min(20, (recentVideos.length / videos.length) * 20);
    
    // 4. Upload frequency score (0-10 points)
    const uploadFrequencyScore = Math.min(10, (videos.length / 10) * 2);
    
    // Combine scores with realistic distribution
    const rawScore = videoCountScore + viewsScore + recentActivityScore + uploadFrequencyScore;
    const volumeScore = Math.max(1, Math.min(100, rawScore));
    
    let label: 'Low' | 'Moderate' | 'High' | 'Very High';
    if (volumeScore >= 75) label = 'Very High';
    else if (volumeScore >= 55) label = 'High';
    else if (volumeScore >= 35) label = 'Moderate';
    else label = 'Low';
    
    return { label, score: Math.round(volumeScore) };
  };

  const calculateCompetitiveness = (videos: YouTubeVideo[], keyword: string): { label: 'Low' | 'Moderate' | 'High' | 'Very High'; score: number } => {
    // Channel dominance
    const channelCount = videos.reduce((acc, video) => {
      acc[video.channelId] = (acc[video.channelId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const dominantChannels = Object.values(channelCount).filter(count => count > 2).length;
    const dominanceScore = (dominantChannels / videos.length) * 30;
    
    // Keyword optimization
    const optimizedTitles = videos.filter(video => 
      video.title.toLowerCase().includes(keyword.toLowerCase())
    ).length;
    const optimizationScore = (optimizedTitles / videos.length) * 40;
    
    // Recent competition
    const recentUploads = videos.filter(video => 
      new Date(video.publishedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length;
    const recencyScore = Math.min(30, (recentUploads / videos.length) * 100);
    
    const totalScore = Math.round(dominanceScore + optimizationScore + recencyScore);
    
    let label: 'Low' | 'Moderate' | 'High' | 'Very High';
    if (totalScore >= 75) label = 'Very High';
    else if (totalScore >= 55) label = 'High';
    else if (totalScore >= 35) label = 'Moderate';
    else label = 'Low';
    
    return { label, score: totalScore };
  };

  const generatePerformanceDescription = (tagScore: number): string => {
    if (tagScore >= 85) {
      return "This tag is excellent and has strong growth potential with low effort required.";
    } else if (tagScore >= 70) {
      return "This tag is high quality and has potential for growth, but may require some effort to improve its performance.";
    } else if (tagScore >= 50) {
      return "This tag shows moderate potential but will require strategic optimization to compete effectively.";
    } else if (tagScore >= 30) {
      return "This tag has limited potential and faces significant competition. Consider alternative keywords.";
    } else {
      return "This tag is highly competitive with low opportunity. Focus on long-tail variations instead.";
    }
  };

  const analyzeKeywordData = (videos: YouTubeVideo[], keyword: string): KeywordData => {
    if (videos.length === 0) {
      throw new Error('No video data available for analysis');
    }

    // Calculate main metrics using rapidtags.io methodology
    const tagScore = calculateTagScore(videos, keyword);
    const searchVolume = calculateSearchVolume(videos);
    const competitiveness = calculateCompetitiveness(videos, keyword);
    
    // Basic metrics
    const totalViews = videos.reduce((sum, video) => sum + video.views, 0);
    const totalLikes = videos.reduce((sum, video) => sum + video.likes, 0);
    const averageViews = Math.round(totalViews / videos.length);
    const averageLikes = Math.round(totalLikes / videos.length);
    
    const durations = videos.map(video => parseDuration(video.duration));
    const averageLength = Math.round(durations.reduce((sum, duration) => sum + duration, 0) / durations.length);
    
    // Engagement rate calculation
    const engagementRate = Number(((averageLikes / Math.max(1, averageViews)) * 100).toFixed(2));
    
    // Views per day calculation (similar to rapidtags.io)
    const avgDaysOld = videos.reduce((sum, video) => {
      const daysSinceUpload = (Date.now() - new Date(video.publishedAt).getTime()) / (1000 * 60 * 60 * 24);
      return sum + daysSinceUpload;
    }, 0) / videos.length;
    
    const viewsPerDay = Number((averageViews / Math.max(1, avgDaysOld)).toFixed(12));
    
    // Upload time analysis
    const uploadTimeDistribution = analyzeUploadTimes(videos);
    
    // Best upload times
    const bestTimes = uploadTimeDistribution
      .sort((a, b) => b.avgViews - a.avgViews)
      .slice(0, 3);
    
    const bestUploadDays = Array.from(new Set(bestTimes.map(t => t.day))).slice(0, 3);
    const bestUploadTimes = bestTimes.map(t => ({ day: t.day, hour: t.hour }));
    
    // Optimal upload time recommendation
    const optimalTime = bestTimes.length > 0 ? 
      `${bestTimes[0].day} at ${bestTimes[0].hour}:00` : 'Data insufficient';

    // Analyze upload patterns for trend
    const recentVideos = videos.filter(video => 
      new Date(video.publishedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    
    let trend: 'Rising' | 'Stable' | 'Declining' = 'Stable';
    const recentRatio = recentVideos.length / videos.length;
    if (recentRatio > 0.3) trend = 'Rising';
    else if (recentRatio < 0.1) trend = 'Declining';

    // Generate related keywords
    const allTags = videos.flatMap(video => video.tags);
    const allTitles = videos.map(video => video.title).join(' ');
    
    const relatedKeywords = Array.from(new Set([
      ...allTags.filter(tag => 
        tag.toLowerCase() !== keyword.toLowerCase() && 
        tag.length > 2 && 
        tag.length < 20
      ),
      ...allTitles.split(/\s+/).filter(word => 
        word.toLowerCase() !== keyword.toLowerCase() && 
        word.length > 3 && 
        !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can'].includes(word.toLowerCase())
      )
    ])).slice(0, 12);

    // Top channels analysis
    const channelCount = videos.reduce((acc, video) => {
      acc[video.channelId] = (acc[video.channelId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topChannels = Object.entries(channelCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([channelId, count]) => ({ 
        name: videos.find(v => v.channelId === channelId)?.channelTitle || channelId, 
        count 
      }));

    // Calculate keyword in title percentage
    const keywordInTitle = videos.filter(video => 
      video.title.toLowerCase().includes(keyword.toLowerCase())
    ).length;
    const keywordInTitlePercentage = Math.round((keywordInTitle / videos.length) * 100);

    // Enhanced recommendations
    const recommendations = [
      `Tag Score: ${tagScore}/100 - ${generatePerformanceDescription(tagScore)}`,
      `Search Volume: ${searchVolume.label} (${searchVolume.score}/100) - ${searchVolume.score > 60 ? 'High demand market' : 'Niche opportunity'}`,
      `Competition: ${competitiveness.label} (${competitiveness.score}/100) - ${competitiveness.score < 40 ? 'Good opportunity to rank' : 'Requires strong content strategy'}`,
      `Engagement Rate: ${engagementRate}% - ${engagementRate > 3 ? 'Above average engagement' : 'Focus on improving engagement'}`,
      `Optimal Upload Time: ${optimalTime} based on top performers`,
      `Video Length: Target ${Math.floor(averageLength / 60)}:${(averageLength % 60).toString().padStart(2, '0')} for best results`,
      `Title Optimization: ${keywordInTitlePercentage}% include exact keyword - ${keywordInTitlePercentage > 70 ? 'Essential for ranking' : 'Consider keyword variations'}`
    ];

    return {
      keyword,
      tagScore,
      searchVolume: searchVolume.label,
      searchVolumeScore: searchVolume.score,
      competitiveness: competitiveness.label,
      competitivenessScore: competitiveness.score,
      trend,
      relatedKeywords,
      topVideos: videos.slice(0, 10),
      uploadTimeDistribution,
      insights: {
        averageViews,
        averageViewCount: formatViewCount(averageViews),
        viewsPerDay,
        averageLength,
        bestUploadDays,
        bestUploadTimes,
        topChannels,
        totalResults: videos.length,
        newVideosLastWeek: recentVideos.length,
        keywordInTitlePercentage,
        averageLikes,
        engagementRate,
        optimalUploadTime: optimalTime
      },
      recommendations,
      performanceDescription: generatePerformanceDescription(tagScore)
    };
  };

  const analyzeKeywordFromUrl = async (searchTerm: string) => {
    setIsAnalyzing(true);
    setShowResults(false);
    setError(null);

    try {
      const videos = await fetchYouTubeData(searchTerm);
      
      if (videos.length === 0) {
        throw new Error('No videos found for this keyword');
      }
      
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

    const encodedKeyword = encodeURIComponent(keyword.trim());
    navigate(`/tools/keyword-analyzer/${encodedKeyword}`);
  };

  const handleRelatedKeywordClick = (relatedKeyword: string) => {
    const encodedKeyword = encodeURIComponent(relatedKeyword);
    navigate(`/tools/keyword-analyzer/${encodedKeyword}`);
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return '#4caf50';
    if (score >= 50) return '#ff9800';
    if (score >= 30) return '#f44336';
    return '#9c27b0';
  };

  const getVolumeColor = (label: string) => {
    switch (label) {
      case 'Very High': return '#4caf50';
      case 'High': return '#8bc34a';
      case 'Moderate': return '#ff9800';
      case 'Low': return '#f44336';
      default: return '#607d8b';
    }
  };

  const getCompetitionColor = (label: string) => {
    switch (label) {
      case 'Low': return '#4caf50';
      case 'Moderate': return '#ff9800';
      case 'High': return '#f44336';
      case 'Very High': return '#9c27b0';
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

  // Upload Time Distribution Chart Component
  const UploadTimeChart: React.FC<{ data: UploadTimeData[] }> = ({ data }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isIntegrated, setIsIntegrated] = useState(false);
    
    useEffect(() => {
      const handleResize = () => setIsMobile(window.innerWidth <= 768);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    useEffect(() => {
      // Check if this chart is inside an integrated container
      const checkIntegrated = () => {
        const chartElement = document.querySelector('.integrated');
        setIsIntegrated(!!chartElement);
      };
      checkIntegrated();
    }, []);
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    const getHeatmapValue = (day: string, hour: number) => {
      const item = data.find(d => d.day === day && d.hour === hour);
      return item ? item.count : 0;
    };
    
    const maxCount = Math.max(...data.map(d => d.count), 1);
    
    const getHeatColor = (count: number) => {
      if (count === 0) return '#1a1a1a';
      if (count === 1) return '#28a745'; // 1 video = green
      if (count === 2) return '#fac11b'; // 2 videos = yellow
      if (count >= 3) return '#d73527'; // 3+ videos = red
      return '#28a745'; // fallback
    };

    
    // Mobile-friendly summary view
    const getMobileSummary = () => {
      const timeSlots = [
        { label: 'Early Morning', range: '0-5', hours: [0, 1, 2, 3, 4, 5] },
        { label: 'Morning', range: '6-11', hours: [6, 7, 8, 9, 10, 11] },
        { label: 'Afternoon', range: '12-17', hours: [12, 13, 14, 15, 16, 17] },
        { label: 'Evening', range: '18-23', hours: [18, 19, 20, 21, 22, 23] }
      ];
      
      return timeSlots.map(slot => {
        const totalUploads = data.filter(item => slot.hours.includes(item.hour)).reduce((sum, item) => sum + item.count, 0);
        const avgViews = data.filter(item => slot.hours.includes(item.hour)).reduce((sum, item) => sum + item.avgViews, 0) / slot.hours.length;
        
        return {
          ...slot,
          totalUploads,
          avgViews: isNaN(avgViews) ? 0 : avgViews,
          intensity: totalUploads / Math.max(1, Math.max(...timeSlots.map(s => 
            data.filter(item => s.hours.includes(item.hour)).reduce((sum, item) => sum + item.count, 0)
          )))
        };
      });
    };

    return (
      <S.UploadTimeChart>
        {!isIntegrated && (
          <>
            <S.ChartTitle>Upload Time Distribution</S.ChartTitle>
            <S.ChartSubtitle>
              Visual representation of upload timing patterns
            </S.ChartSubtitle>
          </>
        )}
        
        {isIntegrated && (
          <S.ChartSubtitle style={{ fontSize: '0.8rem', marginBottom: '1rem', opacity: 0.8 }}>
            Visual representation of upload timing patterns
          </S.ChartSubtitle>
        )}
        
        {isMobile ? (
          <S.MobileSummaryContainer>
            {getMobileSummary().map(slot => (
              <S.MobileSummaryBar key={slot.label}>
                <S.MobileSummaryLabel>
                  <strong>{slot.label}</strong>
                  <span>{slot.range}:00</span>
                </S.MobileSummaryLabel>
                <S.MobileSummaryProgress>
                  <S.MobileSummaryFill 
                    intensity={slot.intensity}
                    color={getHeatColor(slot.totalUploads)}
                  />
                </S.MobileSummaryProgress>
                <S.MobileSummaryStats>
                  <span>{slot.totalUploads} uploads</span>
                  <span>{formatViewCount(slot.avgViews)} avg views</span>
                </S.MobileSummaryStats>
              </S.MobileSummaryBar>
            ))}
          </S.MobileSummaryContainer>
        ) : (
          <S.HeatmapContainer style={isIntegrated ? { transform: 'scale(1)'} : {}}>
            <S.HourLabels>
              {hours.filter((_, index) => index % 4 === 0).map(hour => {
                // Calculate the position: 60px offset + (hour * cellWidth + gap)
                const cellWidth = 15; // matches HeatmapCell width
                const gap = 2;  
                const leftPosition = 60 + (hour * (cellWidth + gap)) + (cellWidth / 2);
                
                return (
                  <S.HourLabel 
                    key={hour} 
                    style={{ left: `${leftPosition}px` }}
                  >
                    {hour.toString().padStart(2, '0')}:00
                  </S.HourLabel>
                );
              })}
            </S.HourLabels>
            
            <S.HeatmapGrid>
              <S.DayLabels>
                {days.map(day => (
                  <S.DayLabel key={day}>{day.slice(0, 3)}</S.DayLabel>
                ))}
              </S.DayLabels>
              
              <S.HeatmapRows>
                {days.map(day => (
                  <S.HeatmapRow key={day}>
                    {hours.map(hour => {
                      const count = getHeatmapValue(day, hour);
                      return (
                        <S.HeatmapCell
                        key={`${day}-${hour}`}
                        color={getHeatColor(count)}
                        title={`${day} ${hour.toString().padStart(2, '0')}:00 - ${count} uploads`}
                        />
                      );
                    })}
                  </S.HeatmapRow>
                ))}
              </S.HeatmapRows>
            </S.HeatmapGrid>
          </S.HeatmapContainer>
        )}
        
        <S.HeatmapLegend style={isIntegrated ? { marginTop: '0.5rem', fontSize: '0.8rem' } : {}}>
          <span>1 Video</span>
          <S.LegendGradient />
          <span>3+ Videos</span>
        </S.HeatmapLegend>

      </S.UploadTimeChart>
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

        {error && (
          <S.ErrorMessage>
            <i className="bx bx-error"></i>
            {error}
          </S.ErrorMessage>
        )}

        {/* Educational Content Section - SUBSTANTIAL CONTENT FOR ADSENSE APPROVAL */}
        {!showResults && !isAnalyzing && (
          <S.EducationalSection>
            
            <S.EducationalContent>
              <S.SectionSubTitle>How to Use the Keyword Analyzer</S.SectionSubTitle>
              
              <S.EducationalText>
                Our Keyword Analyzer provides comprehensive YouTube keyword research with advanced metrics 
                including search volume, competition analysis, and upload timing insights. Discover high-performing 
                keywords and optimize your content strategy for maximum visibility and engagement.
              </S.EducationalText>

              <S.StepByStep>
                <S.StepItem>
                  <S.StepNumberCircle>1</S.StepNumberCircle>
                  <S.StepContent>
                    <S.StepTitle>Enter Target Keyword</S.StepTitle>
                    <S.EducationalText>
                      Input your main keyword or phrase in the search bar above. Our system analyzes 
                      thousands of YouTube videos to provide comprehensive insights including search volume, 
                      competition levels, and performance opportunities.
                    </S.EducationalText>
                  </S.StepContent>
                </S.StepItem>

                <S.StepItem>
                  <S.StepNumberCircle>2</S.StepNumberCircle>
                  <S.StepContent>
                    <S.StepTitle>Advanced Data Analysis</S.StepTitle>
                    <S.EducationalText>
                      Our algorithm examines video performance, upload patterns, engagement metrics, 
                      and competitive landscape. We calculate tag scores, trending patterns, and optimal 
                      timing recommendations based on real YouTube data.
                    </S.EducationalText>
                  </S.StepContent>
                </S.StepItem>

                <S.StepItem>
                  <S.StepNumberCircle>3</S.StepNumberCircle>
                  <S.StepContent>
                    <S.StepTitle>Optimize Your Strategy</S.StepTitle>
                    <S.EducationalText>
                      Review detailed insights including tag scores, upload timing charts, competition analysis, 
                      and related keyword suggestions. Use these recommendations to optimize your content 
                      strategy and improve search rankings.
                    </S.EducationalText>
                  </S.StepContent>
                </S.StepItem>
              </S.StepByStep>
            </S.EducationalContent>

            <S.EducationalContent>
              <S.SectionSubTitle>Keyword Research Features</S.SectionSubTitle>
              
              <S.FeatureList>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Tag Score Analysis:</strong> Professional scoring system similar to RapidTags with 0-100 scale for keyword quality assessment</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Search Volume Metrics:</strong> Comprehensive analysis of keyword demand with Low, Moderate, High, and Very High classifications</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Competition Analysis:</strong> Detailed competitive landscape assessment including market saturation and ranking difficulty</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Upload Time Distribution:</strong> Visual heatmap showing optimal posting times based on successful videos in your niche</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Engagement Rate Calculation:</strong> Precise engagement metrics including likes-to-views ratios and audience interaction patterns</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Trending Analysis:</strong> Real-time trend detection with Rising, Stable, and Declining keyword performance indicators</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Related Keywords Discovery:</strong> Advanced semantic keyword suggestions for expanding your content strategy</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Top Video Analysis:</strong> Study successful videos using your keywords with performance metrics and optimization insights</span>
                </S.FeatureListItem>
              </S.FeatureList>
            </S.EducationalContent>

          </S.EducationalSection>
        )}



        {isAnalyzing && (
          <S.LoadingContainer>
            <S.LoadingAnimation>
              <i className="bx bx-loader-alt bx-spin"></i>
            </S.LoadingAnimation>
            <S.LoadingText>Analyzing keyword performance...</S.LoadingText>
            <S.LoadingSteps>
              <S.LoadingStep>Fetching comprehensive YouTube data</S.LoadingStep>
              <S.LoadingStep>Analyzing upload time patterns</S.LoadingStep>
              <S.LoadingStep>Generating optimization insights</S.LoadingStep>
            </S.LoadingSteps>
          </S.LoadingContainer>
        )}

        {showResults && results && (
          <S.ResultsContainer>

            {/* Enhanced Premium Overview */}
            <S.PremiumOverviewSection>
              <S.PremiumOverviewHeader>
                <S.SectionTitle>
                  <i className="bx bx-chart-line"></i>
                  Keyword Analysis - {results.keyword}
                </S.SectionTitle>
              </S.PremiumOverviewHeader>
              
              <S.PremiumOverviewContent>
                <S.PremiumOverviewGrid>
                  {/* Tag Score Hero Card */}
                  <S.TagScoreHeroCard>
                    <S.TagScoreContent>
                      <S.TagScoreLabel>Tag Score</S.TagScoreLabel>
                      <S.TagScoreHeroNumber color={getScoreColor(results.tagScore)}>
                        {results.tagScore}
                        <S.TagScoreOutOf>/100</S.TagScoreOutOf>
                      </S.TagScoreHeroNumber>
                      <S.TagScoreQuality score={results.tagScore}>
                        {results.tagScore >= 70 ? 'High Quality' : 
                         results.tagScore >= 50 ? 'Good Quality' : 
                         results.tagScore >= 30 ? 'Fair Quality' : 'Needs Work'}
                      </S.TagScoreQuality>
                      <S.TagScoreDescription>
                      {results.performanceDescription}
                      </S.TagScoreDescription>
                  
                  {/* Integrated Upload Time Chart */}
                  <S.IntegratedChartContainer className="integrated">
                    <S.IntegratedChartTitle>
                      <i className="bx bx-time"></i>
                      Upload Time Distribution
                    </S.IntegratedChartTitle>
                    <UploadTimeChart data={results.uploadTimeDistribution} />
                  </S.IntegratedChartContainer>
                    </S.TagScoreContent>
                    <S.TagScoreIcon>
                      <i className="bx bx-trophy"></i>
                    </S.TagScoreIcon>
                  </S.TagScoreHeroCard>

                  {/* Metrics Cards */}
                  <S.MetricsCardContainer>
                    <S.PremiumMetricCard>
                      <S.MetricCardHeader>
                        <S.MetricCardIcon className="bx bx-bar-chart-alt" />
                        <S.MetricCardTitle>Search Volume</S.MetricCardTitle>
                      </S.MetricCardHeader>
                      <S.MetricProgressContainer>
                        <S.MetricProgressBar>
                          <S.MetricProgressFill 
                            width={results.searchVolumeScore} 
                            color={getVolumeColor(results.searchVolume)}
                            delay="0.2s"
                          />
                        </S.MetricProgressBar>
                        <S.MetricScoreContainer>
                          <S.MetricScore>{results.searchVolumeScore}</S.MetricScore>
                          <S.MetricLabel>{results.searchVolume}</S.MetricLabel>
                        </S.MetricScoreContainer>
                      </S.MetricProgressContainer>
                    </S.PremiumMetricCard>

                    <S.PremiumMetricCard>
                      <S.MetricCardHeader>
                        <S.MetricCardIcon className="bx bx-target-lock" />
                        <S.MetricCardTitle>Competition</S.MetricCardTitle>
                      </S.MetricCardHeader>
                      <S.MetricProgressContainer>
                        <S.MetricProgressBar>
                          <S.MetricProgressFill 
                            width={results.competitivenessScore} 
                            color={getCompetitionColor(results.competitiveness)}
                            delay="0.4s"
                          />
                        </S.MetricProgressBar>
                        <S.MetricScoreContainer>
                          <S.MetricScore>{results.competitivenessScore}</S.MetricScore>
                          <S.MetricLabel>{results.competitiveness}</S.MetricLabel>
                        </S.MetricScoreContainer>
                      </S.MetricProgressContainer>
                    </S.PremiumMetricCard>

                    <S.PremiumMetricCard>
                      <S.MetricCardHeader>
                        <S.MetricCardIcon 
                          className={getTrendIcon(results.trend)}
                          style={{ color: getTrendColor(results.trend) }}
                        />
                        <S.MetricCardTitle>Trend</S.MetricCardTitle>
                      </S.MetricCardHeader>
                      <S.TrendContainer>
                        <S.TrendValue color={getTrendColor(results.trend)}>
                          {results.trend}
                        </S.TrendValue>
                        <S.TrendSubtext>
                          {results.trend === 'Rising' ? 'Growing interest' :
                           results.trend === 'Stable' ? 'Consistent demand' :
                           'Declining interest'}
                        </S.TrendSubtext>
                      </S.TrendContainer>
                    </S.PremiumMetricCard>
                  </S.MetricsCardContainer>
                </S.PremiumOverviewGrid>
              </S.PremiumOverviewContent>
            </S.PremiumOverviewSection>

            {/* Detailed Metrics */}
            <S.DetailedMetricsGrid>
              <S.MetricCard>
                <S.MetricLabel>Average View Count</S.MetricLabel>
                <S.DetailedMetricValue>{results.insights.averageViewCount}</S.DetailedMetricValue>
              </S.MetricCard>

              <S.MetricCard>
                <S.MetricLabel>Views Per Day (avg)</S.MetricLabel>
                <S.DetailedMetricValue>{results.insights.viewsPerDay.toFixed(12)}</S.DetailedMetricValue>
              </S.MetricCard>

              <S.MetricCard>
                <S.MetricLabel>Engagement Rate</S.MetricLabel>
                <S.DetailedMetricValue>{results.insights.engagementRate}%</S.DetailedMetricValue>
              </S.MetricCard>

              <S.MetricCard>
                <S.MetricIcon 
                  className={getTrendIcon(results.trend)}
                  style={{ color: getTrendColor(results.trend) }}
                ></S.MetricIcon>
                <S.MetricLabel>Trend</S.MetricLabel>
                <S.DetailedMetricValue style={{ color: getTrendColor(results.trend) }}>
                  {results.trend}
                </S.DetailedMetricValue>
              </S.MetricCard>
            </S.DetailedMetricsGrid>

            {/* Upload Timing Insights */}
            <S.UploadInsightsSection>
              <S.SectionTitle>
                <i className="bx bx-time"></i>
                Upload Timing Insights
              </S.SectionTitle>
              
              <S.UploadInsightsList>
                <S.InsightCard>
                  <S.InsightTitle>Best Upload Days</S.InsightTitle>
                  <S.DaysList>
                    {results.insights.bestUploadDays.map(day => (
                      <S.DayBadge key={day}>{day}</S.DayBadge>
                    ))}
                  </S.DaysList>
                </S.InsightCard>

                <S.InsightCard>
                  <S.InsightTitle>Optimal Upload Time</S.InsightTitle>
                  <S.OptimalTime>{results.insights.optimalUploadTime}</S.OptimalTime>
                </S.InsightCard>

                <S.InsightCard>
                  <S.InsightTitle>Best Performing Times</S.InsightTitle>
                  <S.TimesList>
                    {results.insights.bestUploadTimes.slice(0, 3).map((time, index) => (
                      <S.TimeItem key={index}>
                        {time.day} at {time.hour.toString().padStart(2, '0')}:00
                      </S.TimeItem>
                    ))}
                  </S.TimesList>
                </S.InsightCard>
              </S.UploadInsightsList>
            </S.UploadInsightsSection>

            {/* Analysis Grid */}
            <S.AnalysisGrid>
              {/* SEO Insights */}
              <S.AnalysisCard>
                <S.CardTitle>
                  <i className="bx bx-brain"></i>
                  SEO Insights
                </S.CardTitle>
                
                <S.InsightItem>
                  <S.InsightLabel>Tag Score:</S.InsightLabel>
                  <S.TagScoreBadge color={getScoreColor(results.tagScore)}>
                    {results.tagScore}/100
                  </S.TagScoreBadge>
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
                  <S.InsightLabel>Keyword in Title:</S.InsightLabel>
                  <S.InsightValue>{results.insights.keywordInTitlePercentage}%</S.InsightValue>
                </S.InsightItem>

                <S.InsightItem>
                  <S.InsightLabel>Engagement Rate:</S.InsightLabel>
                  <S.InsightValue>{results.insights.engagementRate}%</S.InsightValue>
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
          </S.ResultsContainer>
        )}

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