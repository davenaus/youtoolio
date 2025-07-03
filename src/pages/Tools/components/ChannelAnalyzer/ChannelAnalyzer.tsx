// src/pages/Tools/components/ChannelAnalyzer/ChannelAnalyzer.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { AdSense } from '../../../../components/AdSense/AdSense';
import { Button } from '../../../../components/Button/Button';
import * as S from './styles';

interface ChannelAnalysis {
  achievements: string[];
  drawbacks: string[];
  flaggedWords: string[];
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

export const ChannelAnalyzer: React.FC = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const navigate = useNavigate();
  const [channelUrl, setChannelUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [channelData, setChannelData] = useState<any>(null);
  const [playlistData, setPlaylistData] = useState<any>(null);
  const [latestVideoData, setLatestVideoData] = useState<any>(null);
  const [analysisResults, setAnalysisResults] = useState<ChannelAnalysis | null>(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (channelId) {
      setChannelUrl(`https://youtube.com/channel/${channelId}`);
      handleAnalyze(channelId);
    }
  }, [channelId]);

  const getChannelId = async (input: string): Promise<string> => {
    // First check if it's a direct channel ID
    if (/^UC[\w-]{22}$/.test(input)) {
      return input;
    }

    const urlPatterns = {
      channel: /youtube\.com\/channel\/(UC[\w-]{22})/,
      user: /youtube\.com\/user\/(\w+)/,
      handle: /youtube\.com\/@([\w-]+)/,
      customUrl: /youtube\.com\/(c\/)?(\w+)/
    };

    for (const [type, pattern] of Object.entries(urlPatterns)) {
      const match = input.match(pattern);
      if (match) {
        if (type === 'channel') {
          return match[1];
        } else {
          const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
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

      setChannelData(channel);
      setPlaylistData(playlists);
      setLatestVideoData(latestVideo);

      const analysis = analyzeChannelData(latestVideo, channel, playlists);
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
    const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
    if (!API_KEY) {
      throw new Error('YouTube API key not configured');
    }
    
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?` +
      `part=snippet,statistics,brandingSettings,status,topicDetails&` +
      `id=${channelId}&key=${API_KEY}`
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

  const fetchPlaylistData = async (channelId: string) => {
    const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?` +
      `part=id&channelId=${channelId}&maxResults=2&key=${API_KEY}`
    );
    const data = await response.json();
    return data.items || [];
  };

  const fetchLatestVideoData = async (channelId: string) => {
    const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&channelId=${channelId}&order=date&type=video&` +
      `maxResults=1&key=${API_KEY}`
    );
    const data = await response.json();
    if (!data.items?.[0]) throw new Error('No videos found');
    return data.items[0];
  };

  const analyzeChannelData = (
    latestVideoData: any, 
    channelData: any, 
    playlistData: any
  ): ChannelAnalysis => {
    const achievements: string[] = [];
    const drawbacks: string[] = [];
    const flaggedWords: string[] = [];

    const channelKeywords = channelData.brandingSettings?.channel?.keywords || '';
    const channelDescription = channelData.snippet.description;
    const lastVideoPostedDate = new Date(latestVideoData.snippet.publishedAt);
    const today = new Date();
    const differenceInWeeks = Math.floor((today.getTime() - lastVideoPostedDate.getTime()) / (7 * 24 * 60 * 60 * 1000));

    // Check for flaggable words
    const checkContentForFlags = (content: string) => {
      return flaggableWords.filter(word => 
        content.toLowerCase().includes(word.toLowerCase())
      );
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
    if (playlistData.length > 0) {
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

    return { 
      achievements, 
      drawbacks, 
      flaggedWords: flaggedWords.filter((word, index) => flaggedWords.indexOf(word) === index)
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

  const formatDate = (dateString: string): string => {
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

  const getTopicCategory = (topicDetails: any): string => {
    if (!topicDetails?.topicCategories) return 'Not specified';
    
    const categoryMap: { [key: string]: string } = {
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
      '/m/098wr': 'Science & Technology'
    };

    const categories = topicDetails.topicCategories.map((cat: string) => 
      categoryMap[cat] || 'Other'
    );
    
    return categories.join(', ');
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
          <S.Title>Channel Analyzer</S.Title>
          <S.Subtitle>
            Comprehensive analysis of YouTube channel performance
          </S.Subtitle>
        </S.Header>

        <S.SearchContainer>
          <S.SearchBar>
            <S.SearchInput
              type="text"
              value={channelUrl}
              onChange={(e) => setChannelUrl(e.target.value)}
              placeholder="Enter YouTube @ handle or channel ID"
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
                  <S.ChannelName>{channelData.snippet.title}</S.ChannelName>
                  <S.ChannelMeta>
                    <S.MetaItem>
                      <i className="bx bx-user"></i>
                      {parseInt(channelData.statistics.subscriberCount).toLocaleString()} subscribers
                    </S.MetaItem>
                    <S.MetaItem>
                      <i className="bx bx-calendar"></i>
                      Created: {formatDate(channelData.snippet.publishedAt)}
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
                    {'⭐'.repeat(calculateOverallScore(analysisResults))}{'☆'.repeat(5 - calculateOverallScore(analysisResults))}
                  </S.MetricValue>
                  <S.MetricLabel>Overall Score</S.MetricLabel>
                </S.MetricCard>
              </S.MetricsGrid>

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
                          {channelData.snippet.description}
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
                        {getTopicCategory(channelData.topicDetails)}
                      </S.CategoryValue>
                    </S.CategoryItem>
                    <S.CategoryItem>
                      <S.CategoryLabel>Content Type:</S.CategoryLabel>
                      <S.CategoryValue>
                        {channelData.status?.madeForKids ? 'Made for Kids' : 'General Audience'}
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
                          if (videosPerDay > 0.5) return "🟢 Highly consistent (Daily content)";
                          if (videosPerDay > 0.14) return "🟡 Moderately consistent (Weekly content)";
                          if (videosPerDay > 0.03) return "🟠 Irregular (Monthly content)";
                          return "🔴 Inconsistent (Sporadic uploads)";
                        })()}
                      </S.MetricDescription>
                    </S.StrategyMetric>
                    
                    <S.StrategyMetric>
                      <S.MetricTitle>Channel Growth Stage</S.MetricTitle>
                      <S.MetricDescription>
                        {(() => {
                          const subs = parseInt(channelData.statistics.subscriberCount);
                          const monthsOld = Math.floor((Date.now() - new Date(channelData.snippet.publishedAt).getTime()) / (1000 * 60 * 60 * 24 * 30));
                          const subsPerMonth = subs / monthsOld;
                          
                          if (subs < 1000) return "🌱 Discovery Phase (Building foundation)";
                          if (subs < 10000) return "📈 Growth Phase (Building audience)";
                          if (subs < 100000) return "🚀 Expansion Phase (Scaling content)";
                          if (subs < 1000000) return "⭐ Established Phase (Strong presence)";
                          return "👑 Authority Phase (Industry leader)";
                        })()}
                      </S.MetricDescription>
                    </S.StrategyMetric>

                    <S.StrategyMetric>
                      <S.MetricTitle>Content Volume Strategy</S.MetricTitle>
                      <S.MetricDescription>
                        {(() => {
                          const videosCount = parseInt(channelData.statistics.videoCount);
                          if (videosCount > 1000) return "📚 High Volume Creator (1000+ videos)";
                          if (videosCount > 500) return "📖 Regular Publisher (500+ videos)";
                          if (videosCount > 100) return "📝 Active Creator (100+ videos)";
                          if (videosCount > 20) return "✏️ Emerging Creator (20+ videos)";
                          return "🆕 New Creator (Starting journey)";
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
                          
                          const getScoreColor = (s: number) => {
                            if (s >= 80) return "🟢";
                            if (s >= 60) return "🟡";
                            if (s >= 40) return "🟠";
                            return "🔴";
                          };
                          
                          return `${getScoreColor(score)} ${score}/100 - Channel optimization score`;
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
                          if (viewToSubRatio < 50) return "🔥 Excellent (High conversion rate)";
                          if (viewToSubRatio < 100) return "✅ Good (Solid conversion)";
                          if (viewToSubRatio < 200) return "⚡ Average (Room for improvement)";
                          if (viewToSubRatio < 500) return "📊 Below Average (Focus on retention)";
                          return "⚠️ Low (Needs engagement strategy)";
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
                          
                          if (discoverabilityRatio > 2) return "🌟 Viral Potential (High organic reach)";
                          if (discoverabilityRatio > 1.5) return "🚀 Strong Discovery (Good algorithm favor)";
                          if (discoverabilityRatio > 1) return "📈 Moderate Reach (Steady growth)";
                          if (discoverabilityRatio > 0.5) return "🎯 Subscriber-Focused (Loyal audience)";
                          return "💤 Limited Reach (Needs SEO work)";
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
                          
                          if (authorityScore > 50000) return "👑 Industry Authority (Highly influential)";
                          if (authorityScore > 20000) return "🏆 Established Expert (Strong influence)";
                          if (authorityScore > 8000) return "⭐ Rising Authority (Growing influence)";
                          if (authorityScore > 2000) return "📢 Emerging Voice (Building credibility)";
                          return "🌱 New Contributor (Starting journey)";
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
                          const channelAgeMonths = Math.floor((Date.now() - new Date(channelData.snippet.publishedAt).getTime()) / (1000 * 60 * 60 * 24 * 30));
                          const subsPerMonth = parseInt(channelData.statistics.subscriberCount) / channelAgeMonths;
                          
                          if (daysSinceLastVideo > 30) return "😴 Dormant (Inactive for 30+ days)";
                          if (daysSinceLastVideo > 14) return "⏳ Slowing (2+ weeks since upload)";
                          if (daysSinceLastVideo > 7) return "📅 Regular (Weekly schedule)";
                          if (daysSinceLastVideo > 3) return "🔥 Active (Multiple uploads/week)";
                          return "⚡ Highly Active (Daily content)";
                        })()}
                      </S.MetricDescription>
                      <S.EngagementDetail>
                        Last upload: {Math.floor((Date.now() - new Date(latestVideoData.snippet.publishedAt).getTime()) / (1000 * 60 * 60 * 24))} days ago
                      </S.EngagementDetail>
                    </S.EngagementMetric>
                  </S.EngagementContainer>
                </S.DetailedSection>
              </S.DetailedAnalysisGrid>

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

export default ChannelAnalyzer;