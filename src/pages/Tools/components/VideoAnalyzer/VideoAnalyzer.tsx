// src/pages/Tools/components/VideoAnalyzer/VideoAnalyzer.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdSense } from '../../../../components/AdSense/AdSense';
import { Button } from '../../../../components/Button/Button';
import * as S from './styles';

interface VideoAnalysis {
  views: number;
  likes: number;
  comments: number;
  postedDate: string;
  engagementRate: number;
  subscribers: number;
  estimatedRevenue: {
    min: number;
    max: number;
  };
  tags: string[];
  category: string;
  videoLength: number;
  achievements: string[];
  drawbacks: string[];
  flaggedWords: string[];
}

interface CategoryRates {
  name: string;
  cpm: number;
  icon: string;
  description: string;
  color: string;
}

const categoryRates: { [key: string]: CategoryRates } = {
  gaming: { name: 'Gaming', cpm: 2.0, icon: 'bx-game', description: 'Gaming content and livestreams', color: '#ff6b6b' },
  tech: { name: 'Technology', cpm: 12.0, icon: 'bx-chip', description: 'Tech reviews and tutorials', color: '#4ecdc4' },
  education: { name: 'Education', cpm: 16.5, icon: 'bx-book-open', description: 'Educational and tutorial content', color: '#45b7d1' },
  entertainment: { name: 'Entertainment', cpm: 6.5, icon: 'bx-laugh', description: 'Comedy and entertainment', color: '#f9ca24' },
  lifestyle: { name: 'Lifestyle', cpm: 13.5, icon: 'bx-heart', description: 'Vlogs and lifestyle content', color: '#f0932b' },
  business: { name: 'Business & Finance', cpm: 32.5, icon: 'bx-trending-up', description: 'Business and finance advice', color: '#6c5ce7' },
  health: { name: 'Health & Fitness', cpm: 13.5, icon: 'bx-dumbbell', description: 'Health and fitness content', color: '#00b894' },
  food: { name: 'Food & Cooking', cpm: 6.0, icon: 'bx-restaurant', description: 'Cooking and food reviews', color: '#e17055' },
  travel: { name: 'Travel', cpm: 4.5, icon: 'bx-map', description: 'Travel vlogs and guides', color: '#00cec9' },
  music: { name: 'Music', cpm: 1.4, icon: 'bx-music', description: 'Music videos and covers', color: '#fd79a8' },
  news: { name: 'News & Politics', cpm: 5.5, icon: 'bx-news', description: 'News and political content', color: '#636e72' },
  beauty: { name: 'Beauty & Fashion', cpm: 9.0, icon: 'bx-palette', description: 'Beauty tutorials and fashion', color: '#e84393' }
};

// Mapping YouTube categories to our custom categories
const youtubeCategoryMapping: { [key: string]: string } = {
  'Gaming': 'gaming',
  'Science & Technology': 'tech',
  'Education': 'education',
  'Entertainment': 'entertainment',
  'People & Blogs': 'lifestyle',
  'News & Politics': 'news',
  'Sports': 'entertainment',
  'Music': 'music',
  'Film & Animation': 'entertainment',
  'Comedy': 'entertainment',
  'Howto & Style': 'lifestyle',
  'Travel & Events': 'travel',
  'Pets & Animals': 'lifestyle',
  'Nonprofits & Activism': 'education',
  'Autos & Vehicles': 'tech'
};

export const VideoAnalyzer: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoData, setVideoData] = useState<any>(null);
  const [channelData, setChannelData] = useState<any>(null);
  const [analysisResults, setAnalysisResults] = useState<VideoAnalysis | null>(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (videoId) {
      setVideoUrl(`https://youtube.com/watch?v=${videoId}`);
      handleAnalyze(videoId);
    }
  }, [videoId]);

  // Utility functions
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

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const parseDuration = (duration: string): number => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    return hours * 3600 + minutes * 60 + seconds;
  };

  // Download thumbnail function
  const downloadThumbnail = async () => {
    if (!videoData) return;
    
    try {
      const thumbnailUrl = videoData.snippet.thumbnails.maxres?.url || 
                          videoData.snippet.thumbnails.high?.url || 
                          videoData.snippet.thumbnails.medium?.url;
      
      if (!thumbnailUrl) {
        alert('No high-quality thumbnail available');
        return;
      }

      const response = await fetch(thumbnailUrl);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${videoData.snippet.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_thumbnail.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading thumbnail:', error);
      alert('Failed to download thumbnail');
    }
  };

  // Copy tags function
  const copyAllTags = () => {
    if (!analysisResults?.tags.length) return;
    
    const tagsText = analysisResults.tags.join(', ');
    navigator.clipboard.writeText(tagsText).then(() => {
      // You might want to show a toast notification here
      alert('Tags copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy tags:', err);
      alert('Failed to copy tags');
    });
  };

  // API functions
  const fetchVideoData = async (videoId: string) => {
    const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY_4;
    if (!API_KEY) {
      throw new Error('YouTube API key not configured');
    }
    
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?` +
      `part=snippet,contentDetails,statistics&id=${videoId}&key=${API_KEY}`
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
      `part=snippet,statistics&id=${channelId}&key=${API_KEY}`
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

  // Analysis functions
  const calculateEstimatedRevenue = (videoData: any, category: string) => {
    const views = parseInt(videoData.statistics.viewCount) || 0;
    const duration = parseDuration(videoData.contentDetails.duration) / 60; // Convert to minutes
    
    // Map YouTube category to our custom category
    const mappedCategory = youtubeCategoryMapping[category] || 'entertainment';
    const categoryData = categoryRates[mappedCategory] || categoryRates.entertainment;
    
    // Base CPM from category
    const baseCPM = categoryData.cpm;
    
    // Duration factor - videos under 8 minutes get fewer ads
    let adFactor = 1;
    if (duration < 8) {
      adFactor = 0.6; // Significant reduction for short videos
    } else if (duration > 10) {
      adFactor = 1.2; // Bonus for longer videos that can have more ads
    }

    // Engagement factor (less impact than before)
    const likes = parseInt(videoData.statistics.likeCount) || 0;
    const comments = parseInt(videoData.statistics.commentCount) || 0;
    const engagementRate = (likes + comments) / Math.max(views, 1);
    const engagementFactor = 1 + Math.min(engagementRate * 2, 0.1); // Cap at 10% bonus

    // Calculate revenue (simplified formula)
    // Assume 55% revenue share for creator and ~40-60% ad fill rate
    const creatorShare = 0.55;
    const adFillRate = 0.5; // Conservative estimate
    
    const baseRevenue = (views / 1000) * baseCPM * creatorShare * adFillRate;
    const adjustedRevenue = baseRevenue * adFactor * engagementFactor;

    return {
      min: Math.max(0, adjustedRevenue * 0.7), // 30% lower bound
      max: Math.max(0, adjustedRevenue * 1.3)  // 30% upper bound
    };
  };

  const analyzeVideo = (videoData: any) => {
    const achievements: string[] = [];
    const drawbacks: string[] = [];
    const flaggedWords: string[] = [];

    const title = videoData.snippet.title || '';
    const description = videoData.snippet.description || '';
    const tags = videoData.snippet.tags || [];
    const duration = parseDuration(videoData.contentDetails.duration);

    // Title analysis
    if (title.length >= 20 && title.length <= 60) {
      achievements.push('Title length is optimal (20-60 characters)');
    } else {
      drawbacks.push('Title length is not optimal (should be 20-60 characters)');
    }

    // Description analysis
    if (description.length >= 200 && description.length <= 4000) {
      achievements.push('Description length is optimal (200-4,000 characters)');
    } else {
      drawbacks.push('Description length is not optimal (should be 200-4,000 characters)');
    }

    // Tags analysis
    if (tags.length >= 20) {
      achievements.push('Uses 20 or more tags for better discoverability');
    } else {
      drawbacks.push(`Uses only ${tags.length} tags (recommend 20+ for better SEO)`);
    }

    // Comments check
    if (videoData.statistics.commentCount !== undefined) {
      achievements.push('Comments are enabled for engagement');
    } else {
      drawbacks.push('Comments are disabled - missing engagement opportunity');
    }

    // Video length check
    if (duration > 480) { // 8 minutes
      achievements.push('Video is over 8 minutes (eligible for mid-roll ads)');
    } else {
      drawbacks.push('Video is under 8 minutes (not eligible for mid-roll ads)');
    }

    // Video quality check
    if (videoData.contentDetails.definition === 'hd') {
      achievements.push('Video is in HD quality');
    } else {
      drawbacks.push('Video is not in HD quality');
    }

    // Description links check
    if (description.includes('http') || description.includes('www')) {
      achievements.push('Contains links in description for traffic');
    } else {
      drawbacks.push('No links in description - missing traffic opportunity');
    }

    return { achievements, drawbacks, flaggedWords };
  };

  const performVideoAnalysis = async (videoData: any, channelData: any): Promise<VideoAnalysis> => {
    const category = await fetchCategoryName(videoData.snippet.categoryId);
    const { achievements, drawbacks, flaggedWords } = analyzeVideo(videoData);
    const revenue = calculateEstimatedRevenue(videoData, category);

    return {
      views: parseInt(videoData.statistics.viewCount) || 0,
      likes: parseInt(videoData.statistics.likeCount) || 0,
      comments: parseInt(videoData.statistics.commentCount) || 0,
      postedDate: formatDate(videoData.snippet.publishedAt),
      engagementRate: ((parseInt(videoData.statistics.likeCount) || 0) + 
                      (parseInt(videoData.statistics.commentCount) || 0)) / 
                      Math.max(parseInt(videoData.statistics.viewCount) || 1, 1),
      subscribers: parseInt(channelData.statistics.subscriberCount) || 0,
      estimatedRevenue: revenue,
      tags: videoData.snippet.tags || [],
      category,
      videoLength: parseDuration(videoData.contentDetails.duration),
      achievements,
      drawbacks,
      flaggedWords
    };
  };

  // Event handlers
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

    try {
      const video = await fetchVideoData(targetId);
      const channel = await fetchChannelData(video.snippet.channelId);
      
      setVideoData(video);
      setChannelData(channel);
      
      const analysis = await performVideoAnalysis(video, channel);
      setAnalysisResults(analysis);
      setShowResults(true);
    } catch (error) {
      console.error('Error:', error);
      alert(`An error occurred while analyzing the video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
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
        <S.Header>
          <S.BackButton onClick={() => navigate('/tools')}>
            <i className="bx bx-arrow-back"></i>
            Back to Tools
          </S.BackButton>
          <S.Title>Video Analyzer</S.Title>
          <S.Subtitle>
            Detailed insights into any YouTube video's performance
          </S.Subtitle>
        </S.Header>

        <S.SearchContainer>
          <S.SearchBar>
            <S.SearchInput
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Enter YouTube video URL or video ID"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <S.SearchButton onClick={handleSearch} disabled={isLoading}>
              {isLoading ? (
                <i className='bx bx-loader-alt bx-spin'></i>
              ) : (
                <i className='bx bx-search'></i>
              )}
            </S.SearchButton>
          </S.SearchBar>
        </S.SearchContainer>

        <S.ResultsContainer className={showResults ? 'visible' : ''}>
          {isLoading ? (
            <S.LoadingContainer>
              <i className='bx bx-loader-alt bx-spin'></i>
              <p>Analyzing video data...</p>
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
                    <S.DownloadButton onClick={downloadThumbnail}>
                      <i className="bx bx-download"></i>
                      Download Thumbnail
                    </S.DownloadButton>
                  </S.ThumbnailOverlay>
                  <S.VideoDuration>
                    {formatDuration(analysisResults.videoLength)}
                  </S.VideoDuration>
                </S.ThumbnailContainer>
                
                <S.VideoDetails>
                  <S.VideoHeader>
                    <S.VideoTitle>{videoData.snippet.title}</S.VideoTitle>
                    <S.ViewVideoButton 
                      onClick={() => window.open(`https://youtube.com/watch?v=${videoId || extractVideoId(videoUrl)}`, '_blank')}
                    >
                      <i className="bx bx-play"></i>
                      View Video
                    </S.ViewVideoButton>
                  </S.VideoHeader>
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
                  <S.VideoMeta>
                    <S.MetaItem>
                      <i className="bx bx-calendar"></i>
                      Published: {analysisResults.postedDate}
                    </S.MetaItem>
                    <S.MetaItem>
                      <i className="bx bx-category"></i>
                      Category: {analysisResults.category}
                    </S.MetaItem>
                  </S.VideoMeta>
                </S.VideoDetails>
              </S.VideoInfo>

              <S.MetricsGrid>
                <S.MetricCard>
                  <S.MetricIcon className="bx bx-show"></S.MetricIcon>
                  <S.MetricValue>{analysisResults.views.toLocaleString()}</S.MetricValue>
                  <S.MetricLabel>Views</S.MetricLabel>
                </S.MetricCard>

                <S.MetricCard>
                  <S.MetricIcon className="bx bx-like"></S.MetricIcon>
                  <S.MetricValue>{analysisResults.likes.toLocaleString()}</S.MetricValue>
                  <S.MetricLabel>Likes</S.MetricLabel>
                </S.MetricCard>

                <S.MetricCard>
                  <S.MetricIcon className="bx bx-comment"></S.MetricIcon>
                  <S.MetricValue>{analysisResults.comments.toLocaleString()}</S.MetricValue>
                  <S.MetricLabel>Comments</S.MetricLabel>
                </S.MetricCard>

                <S.MetricCard>
                  <S.MetricIcon className="bx bx-trending-up"></S.MetricIcon>
                  <S.MetricValue>{(analysisResults.engagementRate * 100).toFixed(2)}%</S.MetricValue>
                  <S.MetricLabel>Engagement Rate</S.MetricLabel>
                </S.MetricCard>

                <S.MetricCard>
                  <S.MetricIcon className="bx bx-dollar"></S.MetricIcon>
                  <S.MetricValue>
                    ${analysisResults.estimatedRevenue.min.toFixed(0)} - ${analysisResults.estimatedRevenue.max.toFixed(0)}
                  </S.MetricValue>
                  <S.MetricLabel>Est. Revenue</S.MetricLabel>
                </S.MetricCard>
              </S.MetricsGrid>

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

              {analysisResults.tags.length > 0 && (
                <S.TagsSection>
                  <S.TagsHeader>
                    <S.SectionTitle>
                      <i className="bx bx-tag"></i>
                      Video Tags ({analysisResults.tags.length})
                    </S.SectionTitle>
                    <S.CopyTagsButton onClick={copyAllTags}>
                      <i className="bx bx-copy"></i>
                      Copy All Tags
                    </S.CopyTagsButton>
                  </S.TagsHeader>
                  <S.TagContainer>
                    {analysisResults.tags.map((tag, index) => (
                      <S.Tag 
                        key={index}
                        onClick={() => window.open(`/tools/keyword-analyzer/${encodeURIComponent(tag)}`, '_blank')}
                      >
                        {tag}
                      </S.Tag>
                    ))}
                  </S.TagContainer>
                </S.TagsSection>
              )}

              {/* Bottom Ad for smaller screens */}
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