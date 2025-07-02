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