// src/pages/Tools/components/ChannelComparer/ChannelComparer.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { AdSense } from '../../../../components/AdSense/AdSense';
import * as S from './styles';

interface ChannelData {
  id: string;
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
    country?: string;
  };
  statistics: {
    viewCount: string;
    subscriberCount: string;
    videoCount: string;
  };
  brandingSettings?: {
    channel?: {
      keywords?: string;
    };
    image?: {
      bannerExternalUrl?: string;
    };
  };
  topicDetails?: {
    topicCategories?: string[];
  };
}

interface ComparisonMetrics {
  subscribers: number;
  views: number;
  videos: number;
  avgViews: number;
  viewsPerSub: number;
  subscribersPerVideo: number;
  engagementPotential: number;
  contentConsistency: number;
  channelAge: number;
  growthRate: number;
  keywordCount: number;
  hasDescription: boolean;
  hasBanner: boolean;
  hasCountry: boolean;
  topicCategoriesCount: number;
}

interface ComparisonAnalysis {
  winner: 'channel1' | 'channel2' | 'tie';
  winnerPoints: number;
  metrics: {
    [key: string]: {
      channel1: number | boolean;
      channel2: number | boolean;
      winner: 'channel1' | 'channel2' | 'tie';
      difference?: number;
    };
  };
  overallInsights: string[];
}

export const ChannelComparer: React.FC = () => {
  const navigate = useNavigate();
  const [channelUrl1, setChannelUrl1] = useState('');
  const [channelUrl2, setChannelUrl2] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [channelData1, setChannelData1] = useState<ChannelData | null>(null);
  const [channelData2, setChannelData2] = useState<ChannelData | null>(null);
  const [comparisonAnalysis, setComparisonAnalysis] = useState<ComparisonAnalysis | null>(null);

  const getChannelId = async (url: string): Promise<string> => {
    // Check if it's a direct channel ID
    if (/^UC[\w-]{22}$/.test(url)) {
      return url;
    }

    const patterns = {
      channel: /youtube\.com\/channel\/(UC[\w-]{22})/,
      user: /youtube\.com\/user\/(\w+)/,
      handle: /youtube\.com\/@([\w-]+)/,
      customUrl: /youtube\.com\/(c\/)?(\w+)/
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      const match = url.match(pattern);
      if (match) {
        if (type === 'channel') {
          return match[1];
        } else {
          const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY_2;
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
    throw new Error('Invalid YouTube channel URL');
  };

  const fetchChannelData = async (channelId: string): Promise<ChannelData> => {
    const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY_2;
    if (!API_KEY) {
      throw new Error('YouTube API key not configured');
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?` +
      `part=snippet,statistics,brandingSettings,topicDetails&` +
      `id=${channelId}&key=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch channel data');
    }

    const data = await response.json();
    if (!data.items?.[0]) throw new Error('Channel not found');
    return data.items[0];
  };

  const calculateMetrics = (channelData: ChannelData): ComparisonMetrics => {
    const subscribers = parseInt(channelData.statistics.subscriberCount);
    const views = parseInt(channelData.statistics.viewCount);
    const videos = parseInt(channelData.statistics.videoCount);
    const channelAge = moment().diff(moment(channelData.snippet.publishedAt), 'years', true);
    const keywords = channelData.brandingSettings?.channel?.keywords?.split(',') || [];

    return {
      subscribers,
      views,
      videos,
      avgViews: Math.round(views / videos),
      viewsPerSub: parseFloat((views / subscribers).toFixed(2)),
      subscribersPerVideo: Math.round(subscribers / videos),
      engagementPotential: parseFloat(((subscribers / 1000) * (views / videos / 1000)).toFixed(2)),
      contentConsistency: parseFloat((videos / channelAge).toFixed(1)),
      channelAge: parseFloat(channelAge.toFixed(1)),
      growthRate: Math.round(subscribers / channelAge),
      keywordCount: keywords.length,
      hasDescription: !!(channelData.snippet.description && channelData.snippet.description.length > 50),
      hasBanner: !!channelData.brandingSettings?.image?.bannerExternalUrl,
      hasCountry: !!channelData.snippet.country,
      topicCategoriesCount: channelData.topicDetails?.topicCategories?.length || 0
    };
  };

  const performDetailedComparison = (metrics1: ComparisonMetrics, metrics2: ComparisonMetrics): ComparisonAnalysis => {
    const metrics: ComparisonAnalysis['metrics'] = {};
    let channel1Points = 0;
    let channel2Points = 0;

    // Define comparison logic for each metric
    const comparisons = [
      { key: 'subscribers', label: 'Subscribers', higherIsBetter: true },
      { key: 'views', label: 'Total Views', higherIsBetter: true },
      { key: 'videos', label: 'Video Count', higherIsBetter: true },
      { key: 'avgViews', label: 'Avg Views/Video', higherIsBetter: true },
      { key: 'viewsPerSub', label: 'Views per Subscriber', higherIsBetter: true },
      { key: 'subscribersPerVideo', label: 'Subscribers/Video', higherIsBetter: true },
      { key: 'engagementPotential', label: 'Engagement Potential', higherIsBetter: true },
      { key: 'contentConsistency', label: 'Upload Frequency', higherIsBetter: true },
      { key: 'channelAge', label: 'Channel Experience', higherIsBetter: true },
      { key: 'growthRate', label: 'Growth Rate (subs/year)', higherIsBetter: true },
      { key: 'keywordCount', label: 'SEO Keywords', higherIsBetter: true },
      { key: 'topicCategoriesCount', label: 'Topic Categories', higherIsBetter: true },
    ];

    // Boolean comparisons
    const booleanComparisons = [
      { key: 'hasDescription', label: 'Has Description' },
      { key: 'hasBanner', label: 'Has Banner' },
      { key: 'hasCountry', label: 'Country Listed' },
    ];

    // Process numeric comparisons
    comparisons.forEach(({ key, higherIsBetter }) => {
      const val1 = metrics1[key as keyof ComparisonMetrics] as number;
      const val2 = metrics2[key as keyof ComparisonMetrics] as number;
      
      let winner: 'channel1' | 'channel2' | 'tie' = 'tie';
      if (val1 > val2) {
        winner = higherIsBetter ? 'channel1' : 'channel2';
      } else if (val2 > val1) {
        winner = higherIsBetter ? 'channel2' : 'channel1';
      }

      if (winner === 'channel1') channel1Points++;
      if (winner === 'channel2') channel2Points++;

      metrics[key] = {
        channel1: val1,
        channel2: val2,
        winner,
        difference: Math.abs(((val1 - val2) / Math.max(val1, val2)) * 100)
      };
    });

    // Process boolean comparisons
    booleanComparisons.forEach(({ key }) => {
      const val1 = metrics1[key as keyof ComparisonMetrics] as boolean;
      const val2 = metrics2[key as keyof ComparisonMetrics] as boolean;
      
      let winner: 'channel1' | 'channel2' | 'tie' = 'tie';
      if (val1 && !val2) {
        winner = 'channel1';
        channel1Points++;
      } else if (val2 && !val1) {
        winner = 'channel2';
        channel2Points++;
      }

      metrics[key] = {
        channel1: val1,
        channel2: val2,
        winner
      };
    });

    // Generate insights
    const overallInsights = generateInsights(metrics1, metrics2, metrics);

    return {
      winner: channel1Points > channel2Points ? 'channel1' : channel2Points > channel1Points ? 'channel2' : 'tie',
      winnerPoints: Math.max(channel1Points, channel2Points),
      metrics,
      overallInsights
    };
  };

  const generateInsights = (metrics1: ComparisonMetrics, metrics2: ComparisonMetrics, comparison: any): string[] => {
    const insights: string[] = [];

    // Growth analysis
    if (metrics1.growthRate > metrics2.growthRate * 2) {
      insights.push("Channel 1 shows significantly faster growth rate");
    } else if (metrics2.growthRate > metrics1.growthRate * 2) {
      insights.push("Channel 2 shows significantly faster growth rate");
    }

    // Engagement analysis
    if (metrics1.viewsPerSub > 50 && metrics2.viewsPerSub < 20) {
      insights.push("Channel 1 has much higher audience engagement");
    } else if (metrics2.viewsPerSub > 50 && metrics1.viewsPerSub < 20) {
      insights.push("Channel 2 has much higher audience engagement");
    }

    // Content strategy analysis
    if (metrics1.contentConsistency > metrics2.contentConsistency * 1.5) {
      insights.push("Channel 1 uploads more consistently");
    } else if (metrics2.contentConsistency > metrics1.contentConsistency * 1.5) {
      insights.push("Channel 2 uploads more consistently");
    }

    // SEO analysis
    if (metrics1.keywordCount > 10 && metrics2.keywordCount < 5) {
      insights.push("Channel 1 has better SEO optimization");
    } else if (metrics2.keywordCount > 10 && metrics1.keywordCount < 5) {
      insights.push("Channel 2 has better SEO optimization");
    }

    // Overall performance
    if (metrics1.avgViews > metrics2.avgViews * 3) {
      insights.push("Channel 1 videos perform significantly better on average");
    } else if (metrics2.avgViews > metrics1.avgViews * 3) {
      insights.push("Channel 2 videos perform significantly better on average");
    }

    return insights;
  };

  const getComparison = (value1: number | boolean, value2: number | boolean): 'higher' | 'lower' | 'equal' => {
    if (typeof value1 === 'boolean' && typeof value2 === 'boolean') {
      if (value1 && !value2) return 'higher';
      if (!value1 && value2) return 'lower';
      return 'equal';
    }
    if (typeof value1 === 'number' && typeof value2 === 'number') {
      if (value1 > value2) return 'higher';
      if (value1 < value2) return 'lower';
      return 'equal';
    }
    return 'equal';
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const formatDate = (date: string): string => {
    return moment(date).format('MMM D, YYYY');
  };

  const getSubscriberBenefitLevel = (subscriberCount: number): string => {
    if (subscriberCount >= 10000000) return 'Diamond (10M+)';
    if (subscriberCount >= 1000000) return 'Gold (1M-10M)';
    if (subscriberCount >= 100000) return 'Silver (100K-1M)';
    return 'Bronze (<100K)';
  };

  const handleCompare = async () => {
    if (!channelUrl1 || !channelUrl2) {
      alert('Please enter both YouTube channel URLs or handles');
      return;
    }

    setIsLoading(true);
    setShowResults(false);

    try {
      const [channelId1, channelId2] = await Promise.all([
        getChannelId(channelUrl1),
        getChannelId(channelUrl2)
      ]);

      const [channel1, channel2] = await Promise.all([
        fetchChannelData(channelId1),
        fetchChannelData(channelId2)
      ]);

      setChannelData1(channel1);
      setChannelData2(channel2);

      const metrics1 = calculateMetrics(channel1);
      const metrics2 = calculateMetrics(channel2);
      const analysis = performDetailedComparison(metrics1, metrics2);
      setComparisonAnalysis(analysis);

      setShowResults(true);
    } catch (error) {
      console.error('Error:', error);
      alert(`Error comparing channels: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderChannelCard = (channelData: ChannelData, metrics: ComparisonMetrics, isWinner: boolean) => (
    <S.ChannelCard isWinner={isWinner}>
      {isWinner && <S.WinnerBadge><i className="bx bx-crown"></i> Winner</S.WinnerBadge>}
      
      <S.ChannelHeader>
        <S.ChannelLogo 
          src={channelData.snippet.thumbnails.high?.url || channelData.snippet.thumbnails.default.url} 
          alt="Channel Logo" 
        />
        <S.ChannelInfo>
          <S.ChannelName>{channelData.snippet.title}</S.ChannelName>
          <S.ChannelMeta>
            <S.MetaItem>
              <i className="bx bx-user"></i>
              {formatNumber(metrics.subscribers)} subscribers
            </S.MetaItem>
            <S.MetaItem>
              <i className="bx bx-calendar"></i>
              Created {formatDate(channelData.snippet.publishedAt)}
            </S.MetaItem>
            <S.MetaItem>
              <i className="bx bx-award"></i>
              {getSubscriberBenefitLevel(metrics.subscribers)}
            </S.MetaItem>
          </S.ChannelMeta>
        </S.ChannelInfo>
      </S.ChannelHeader>

      <S.StatsGrid>
        <S.StatItem>
          <S.StatValue>{formatNumber(metrics.views)}</S.StatValue>
          <S.StatLabel>Total Views</S.StatLabel>
        </S.StatItem>
        <S.StatItem>
          <S.StatValue>{formatNumber(metrics.videos)}</S.StatValue>
          <S.StatLabel>Videos</S.StatLabel>
        </S.StatItem>
        <S.StatItem>
          <S.StatValue>{formatNumber(metrics.avgViews)}</S.StatValue>
          <S.StatLabel>Avg Views</S.StatLabel>
        </S.StatItem>
        <S.StatItem>
          <S.StatValue>{metrics.viewsPerSub}</S.StatValue>
          <S.StatLabel>Views/Sub</S.StatLabel>
        </S.StatItem>
      </S.StatsGrid>

      <S.VisitChannelButton 
        href={`https://www.youtube.com/channel/${channelData.id}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <i className="bx bx-external-link"></i>
        Visit Channel
      </S.VisitChannelButton>
    </S.ChannelCard>
  );

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
          <S.Title>Channel Comparer</S.Title>
          <S.Subtitle>
            Comprehensive side-by-side analysis of YouTube channels with detailed metrics
          </S.Subtitle>
        </S.Header>

        <S.InputContainer>
          <S.InputGroup>
            <S.InputLabel>Channel 1</S.InputLabel>
            <S.SearchInput
              type="text"
              value={channelUrl1}
              onChange={(e) => setChannelUrl1(e.target.value)}
              placeholder="Enter YouTube channel URL, @handle, or ID"
              onKeyPress={(e) => e.key === 'Enter' && handleCompare()}
            />
          </S.InputGroup>
          
          <S.VsIndicator>VS</S.VsIndicator>
          
          <S.InputGroup>
            <S.InputLabel>Channel 2</S.InputLabel>
            <S.SearchInput
              type="text"
              value={channelUrl2}
              onChange={(e) => setChannelUrl2(e.target.value)}
              placeholder="Enter YouTube channel URL, @handle, or ID"
              onKeyPress={(e) => e.key === 'Enter' && handleCompare()}
            />
          </S.InputGroup>
        </S.InputContainer>

        <S.CompareButton onClick={handleCompare} disabled={isLoading}>
          {isLoading ? (
            <i className='bx bx-loader-alt bx-spin'></i>
          ) : (
            <i className='bx bx-analyse'></i>
          )}
          {isLoading ? 'Analyzing...' : 'Compare Channels'}
        </S.CompareButton>

        <S.ResultsContainer className={showResults ? 'visible' : ''}>
          {isLoading ? (
            <S.LoadingContainer>
              <i className='bx bx-loader-alt bx-spin'></i>
              <p>Comparing channels and analyzing metrics...</p>
            </S.LoadingContainer>
          ) : channelData1 && channelData2 && comparisonAnalysis ? (
            <>
              <S.ComparisonHeader>
                <S.OverallWinner>
                  <S.WinnerTitle>
                    {comparisonAnalysis.winner === 'tie' ? 'It\'s a Tie!' : 
                     comparisonAnalysis.winner === 'channel1' ? `${channelData1.snippet.title} Wins!` :
                     `${channelData2.snippet.title} Wins!`}
                  </S.WinnerTitle>
                  <S.WinnerSubtitle>
                    {comparisonAnalysis.winner === 'tie' ? 'Both channels are equally matched' :
                     `Winning in ${comparisonAnalysis.winnerPoints} out of ${Object.keys(comparisonAnalysis.metrics).length} categories`}
                  </S.WinnerSubtitle>
                </S.OverallWinner>
              </S.ComparisonHeader>

              <S.ChannelGrid>
                {renderChannelCard(
                  channelData1, 
                  calculateMetrics(channelData1), 
                  comparisonAnalysis.winner === 'channel1'
                )}
                {renderChannelCard(
                  channelData2, 
                  calculateMetrics(channelData2), 
                  comparisonAnalysis.winner === 'channel2'
                )}
              </S.ChannelGrid>

              <S.DetailedComparison>
                <S.SectionTitle>
                  <i className="bx bx-bar-chart-alt-2"></i>
                  Detailed Metrics Comparison
                </S.SectionTitle>
                
                <S.MetricsTable>
                  {Object.entries(comparisonAnalysis.metrics).map(([key, data]) => (
                    <S.MetricRow key={key}>
                      <S.MetricName>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</S.MetricName>
                      <S.MetricValue winner={data.winner === 'channel1' || data.winner === 'tie'}>
                        {typeof data.channel1 === 'boolean' ? (data.channel1 ? '✅' : '❌') : 
                         typeof data.channel1 === 'number' ? formatNumber(data.channel1) : data.channel1}
                      </S.MetricValue>
                      <S.MetricValue winner={data.winner === 'channel2' || data.winner === 'tie'}>
                        {typeof data.channel2 === 'boolean' ? (data.channel2 ? '✅' : '❌') : 
                         typeof data.channel2 === 'number' ? formatNumber(data.channel2) : data.channel2}
                      </S.MetricValue>
                    </S.MetricRow>
                  ))}
                </S.MetricsTable>
              </S.DetailedComparison>

              {comparisonAnalysis.overallInsights.length > 0 && (
                <S.InsightsSection>
                  <S.SectionTitle>
                    <i className="bx bx-bulb"></i>
                    Key Insights
                  </S.SectionTitle>
                  {comparisonAnalysis.overallInsights.map((insight, index) => (
                    <S.Insight key={index}>
                      <i className="bx bx-check-circle"></i>
                      {insight}
                    </S.Insight>
                  ))}
                </S.InsightsSection>
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

export default ChannelComparer;