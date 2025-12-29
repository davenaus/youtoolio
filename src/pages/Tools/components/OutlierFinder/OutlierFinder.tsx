// src/pages/Tools/components/OutlierFinder/OutlierFinder.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SEO } from '../../../../components/SEO';
import { toolsSEO, generateToolSchema } from '../../../../config/toolsSEO';
import * as S from './styles';

interface OutlierResult {
  video: any;
  channel: any;
  ratio: number;
  engagementRate: number;
  viralScore: number;
}

interface FilterOptions {
  minViews: number;
  maxAge: number; // days
  minSubscribers: number;
  maxSubscribers: number;
  sortBy: 'ratio' | 'views' | 'engagement' | 'viral';
  showOnlyRecent: boolean;
}

export const OutlierFinder: React.FC = () => {
  const { searchQuery, type } = useParams<{ searchQuery: string; type: string }>();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isShorts, setIsShorts] = useState(false);
  const [results, setResults] = useState<OutlierResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [resultCount, setResultCount] = useState(10);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Tool configuration
  const toolConfig = {
    name: 'Outlier Finder',
    description: 'Discover high-performing videos that exceed typical view-to-subscriber ratios in any niche',
    image: 'https://64.media.tumblr.com/60109acd631995e9b43834a7f4358e78/0e01452f9f6dd974-f2/s2048x3072/3390c9b19607d957940ac9e1b8b23b6afbdc037f.jpg',
    icon: 'bx bx-trophy',
    features: [
      'Viral content detection',
      'Performance ratios',
      'Trend analysis'
    ]
  };

  const [filters, setFilters] = useState<FilterOptions>({
    minViews: 0,
    maxAge: 365,
    minSubscribers: 0,
    maxSubscribers: 10000000,
    sortBy: 'ratio',
    showOnlyRecent: false
  });

  const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY_3;

  useEffect(() => {
    if (searchQuery) {
      const decodedQuery = decodeURIComponent(searchQuery);
      setQuery(decodedQuery);
      setIsShorts(type === 'shorts');
      handleAnalyze(decodedQuery, type === 'shorts');
    }

    // Load search history from localStorage
    const history = localStorage.getItem('outlier_search_history');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, [searchQuery, type]);

  const saveSearchHistory = (query: string) => {
    const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('outlier_search_history', JSON.stringify(newHistory));
  };

  const handleSearch = () => {
    if (!query.trim()) {
      alert('Please enter a search query');
      return;
    }

    saveSearchHistory(query);
    const encodedQuery = encodeURIComponent(query);
    navigate(`/tools/outlier-finder/${encodedQuery}/${isShorts ? 'shorts' : 'videos'}`);
  };

  const handleAnalyze = async (searchQuery: string, isShorts: boolean) => {
    if (!searchQuery.trim()) {
      alert('Please enter a search query');
      return;
    }

    setIsLoading(true);
    setShowResults(false);

    try {
      const videos = await searchVideos(searchQuery);
      const videoDetails = await getVideoDetails(videos, isShorts);
      const channelDetails = await getChannelDetails(videos);
      const outliers = calculateOutliers(videoDetails, channelDetails);
      setResults(outliers);
      setShowResults(true);
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while fetching results');
    } finally {
      setIsLoading(false);
    }
  };

  const searchVideos = async (searchQuery: string) => {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&q=${encodeURIComponent(searchQuery)}&` +
      `type=video&maxResults=50&key=${API_KEY}&order=relevance`
    );
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.items || [];
  };

  const getVideoDetails = async (videos: any[], isShorts: boolean) => {
    const videoIds = videos.map(video => video.id.videoId).join(',');
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?` +
      `part=snippet,statistics,contentDetails&` +
      `id=${videoIds}&key=${API_KEY}`
    );
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    return data.items.filter((video: any) => {
      const duration = parseDuration(video.contentDetails.duration);
      const views = parseInt(video.statistics.viewCount) || 0;
      const age = getVideoAgeInDays(video.snippet.publishedAt);

      // Apply filters
      if (views < filters.minViews) return false;
      if (age > filters.maxAge) return false;
      if (filters.showOnlyRecent && age > 30) return false;

      // Shorts can now be up to 3 minutes (180 seconds)
      return isShorts ? duration <= 180 : duration > 180;
    });
  };

  const getChannelDetails = async (videos: any[]) => {
    const channelIdsSet = new Set<string>();
    videos.forEach(video => channelIdsSet.add(video.snippet.channelId));
    const channelIds = Array.from(channelIdsSet).join(',');

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?` +
      `part=statistics,snippet&id=${channelIds}&key=${API_KEY}`
    );
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.items || [];
  };

  const calculateViralScore = (video: any, channel: any): number => {
    const views = parseInt(video.statistics.viewCount) || 0;
    const likes = parseInt(video.statistics.likeCount) || 0;
    const comments = parseInt(video.statistics.commentCount) || 0;
    const subscribers = parseInt(channel.statistics.subscriberCount) || 1;
    const age = getVideoAgeInDays(video.snippet.publishedAt);

    // Viral score considers multiple factors
    const viewToSubRatio = views / subscribers;
    const engagementRate = (likes + comments) / Math.max(views, 1);
    const timeDecay = Math.max(0.1, 1 - (age / 365)); // Newer videos get higher score

    return (viewToSubRatio * engagementRate * timeDecay * 100);
  };

  const calculateOutliers = (videos: any[], channels: any[]): OutlierResult[] => {
    const outliers = videos.map(video => {
      const channel = channels.find(c => c.id === video.snippet.channelId);
      if (!channel) return null;

      const views = parseInt(video.statistics.viewCount) || 0;
      const likes = parseInt(video.statistics.likeCount) || 0;
      const comments = parseInt(video.statistics.commentCount) || 0;
      const subscribers = parseInt(channel.statistics.subscriberCount) || 1;

      // Apply subscriber filters
      if (subscribers < filters.minSubscribers || subscribers > filters.maxSubscribers) {
        return null;
      }

      const ratio = views / subscribers;

      // Filter out videos with ratio less than 2x (only show true outliers)
      // This ensures we only show videos that got at least 2x their subscriber count in views
      if (ratio < 2) {
        return null;
      }

      const engagementRate = (likes + comments) / Math.max(views, 1);
      const viralScore = calculateViralScore(video, channel);

      return { video, channel, ratio, engagementRate, viralScore };
    }).filter((item): item is OutlierResult => item !== null);

    // Sort by ratio (best to worst) to prioritize true viral outliers
    outliers.sort((a, b) => {
      // For similar ratios, prefer channels with fewer subscribers (more impressive outliers)
      const ratioDiff = b.ratio - a.ratio;
      if (Math.abs(ratioDiff) < 1) {
        const subA = parseInt(a.channel.statistics.subscriberCount);
        const subB = parseInt(b.channel.statistics.subscriberCount);
        return subA - subB; // Lower subscriber count = higher priority
      }
      return ratioDiff;
    });

    return outliers.slice(0, resultCount);
  };

  const parseDuration = (duration: string): number => {
    const matches = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!matches) return 0;
    const [, hours, minutes, seconds] = matches;
    return (parseInt(hours || '0') * 3600) +
      (parseInt(minutes || '0') * 60) +
      parseInt(seconds || '0');
  };

  const getVideoAgeInDays = (publishedAt: string): number => {
    const publishDate = new Date(publishedAt);
    const now = new Date();
    return Math.floor((now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  const formatDate = (isoString: string): string => {
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  const exportResults = () => {
    const exportData = results.map(result => ({
      title: result.video.snippet.title,
      channel: result.video.snippet.channelTitle,
      views: parseInt(result.video.statistics.viewCount),
      subscribers: parseInt(result.channel.statistics.subscriberCount),
      ratio: result.ratio.toFixed(2),
      engagement_rate: (result.engagementRate * 100).toFixed(2) + '%',
      viral_score: result.viralScore.toFixed(2),
      published_date: result.video.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${result.video.id}`
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `outlier_analysis_${query.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleToggle = (shorts: boolean) => {
    setIsShorts(shorts);
    // Don't auto-search when toggling, user must click search button
  };

  const applyCurrentFilters = () => {
    if (results.length > 0) {
      const filtered = calculateOutliers(
        results.map(r => r.video),
        results.map(r => r.channel)
      );
      setResults(filtered);
    }
  };

  // Trigger filter application when filters change
  useEffect(() => {
    if (showResults && results.length > 0) {
      applyCurrentFilters();
    }
  }, [filters, resultCount]);

  const getRatioColor = (ratio: number): string => {
    if (ratio >= 100) return '#ff4444';
    if (ratio >= 50) return '#ff6666';
    if (ratio >= 20) return '#ff8888';
    if (ratio >= 10) return '#ffaa88';
    return '#cccccc';
  };

  const getViralityLabel = (score: number): string => {
    if (score >= 50) return 'Extremely Viral';
    if (score >= 20) return 'Highly Viral';
    if (score >= 10) return 'Viral';
    if (score >= 5) return 'Trending';
    return 'Normal';
  };

  const seoConfig = toolsSEO['outlier-finder'];
  const schemaData = generateToolSchema('outlier-finder', seoConfig);

  return (
    <>
      <SEO
        title={seoConfig.title}
        description={seoConfig.description}
        keywords={seoConfig.keywords}
        canonical="https://youtool.io/tools/outlier-finder"
        schemaData={schemaData}
      />

      <S.PageWrapper>
      <S.MainContainer>
        <S.BackButton onClick={() => navigate('/tools')}>
          <i className="bx bx-arrow-back"></i>
          Back to Tools
        </S.BackButton>

        {/* Enhanced Header Section */}
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
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter search keywords to find viral outlier videos"
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

              {/* Toggle Buttons in Header */}
              <S.ControlsContainer>
                <S.ToggleContainer>
                  <S.ToggleButton
                    onClick={() => handleToggle(false)}
                    className={!isShorts ? 'active' : ''}
                  >
                    <i className="bx bx-play"></i>
                    Videos
                  </S.ToggleButton>
                  <S.ToggleButton
                    onClick={() => handleToggle(true)}
                    className={isShorts ? 'active' : ''}
                  >
                    <i className="bx bx-mobile"></i>
                    Shorts
                  </S.ToggleButton>
                </S.ToggleContainer>

                <S.FilterToggle onClick={() => setShowFilters(!showFilters)}>
                  <i className="bx bx-filter"></i>
                  Filters
                </S.FilterToggle>
              </S.ControlsContainer>
            </S.HeaderTextContent>
          </S.HeaderContent>
        </S.EnhancedHeader>



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
                <S.FilterLabel>Video Age (days)</S.FilterLabel>
                <S.FilterSelect
                  value={filters.maxAge}
                  onChange={(e) => setFilters({ ...filters, maxAge: parseInt(e.target.value) })}
                >
                  <option value={7}>Last week</option>
                  <option value={30}>Last month</option>
                  <option value={90}>Last 3 months</option>
                  <option value={365}>Last year</option>
                  <option value={9999}>All time</option>
                </S.FilterSelect>
              </S.FilterGroup>

              <S.FilterGroup>
                <S.FilterLabel>Channel Size</S.FilterLabel>
                <S.FilterSelect
                  value={`${filters.minSubscribers}-${filters.maxSubscribers}`}
                  onChange={(e) => {
                    const [min, max] = e.target.value.split('-').map(Number);
                    setFilters({ ...filters, minSubscribers: min, maxSubscribers: max });
                  }}
                >
                  <option value="0-10000000">Any size</option>
                  <option value="0-1000">Micro (0-1K)</option>
                  <option value="1000-10000">Small (1K-10K)</option>
                  <option value="10000-100000">Medium (10K-100K)</option>
                  <option value="100000-1000000">Large (100K-1M)</option>
                  <option value="1000000-10000000">Huge (1M+)</option>
                </S.FilterSelect>
              </S.FilterGroup>

              <S.FilterGroup>
                <S.FilterLabel>Sort By</S.FilterLabel>
                <S.FilterSelect
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                >
                  <option value="ratio">View/Sub Ratio</option>
                  <option value="views">Total Views</option>
                  <option value="engagement">Engagement Rate</option>
                  <option value="viral">Viral Score</option>
                </S.FilterSelect>
              </S.FilterGroup>

              <S.FilterGroup>
                <S.FilterLabel>Results Count</S.FilterLabel>
                <S.FilterSelect
                  value={resultCount}
                  onChange={(e) => setResultCount(parseInt(e.target.value))}
                >
                  <option value={5}>Top 5</option>
                  <option value={10}>Top 10</option>
                  <option value={15}>Top 15</option>
                  <option value={20}>Top 20</option>
                </S.FilterSelect>
              </S.FilterGroup>
            </S.FilterGrid>
          </S.FiltersContainer>
        )}

        {searchHistory.length > 0 && !showResults && (
          <S.SearchHistory>
            <S.HistoryLabel>Recent searches:</S.HistoryLabel>
            <S.HistoryTags>
              {searchHistory.map((term, index) => (
                <S.HistoryTag key={index} onClick={() => setQuery(term)}>
                  {term}
                </S.HistoryTag>
              ))}
            </S.HistoryTags>
          </S.SearchHistory>
        )}

        {/* Educational Content Section */}
        {!showResults && (
          <S.EducationalSection>
            <S.EducationalContent>
              <S.SectionSubTitle>How to Use the Outlier Finder</S.SectionSubTitle>

              <S.EducationalText>
                Our Outlier Finder identifies videos that significantly outperform typical view-to-subscriber ratios
                in any topic or niche. This powerful tool helps you discover viral content patterns, successful
                content strategies, and trending topics by analyzing performance metrics across YouTube.
              </S.EducationalText>

              <S.StepByStep>
                <S.StepItem>
                  <S.StepNumberCircle>1</S.StepNumberCircle>
                  <S.StepContent>
                    <S.OutlierFinderStepTitle>Enter Search Query</S.OutlierFinderStepTitle>
                    <S.EducationalText>
                      Type any keyword, topic, or niche you want to analyze. Choose between regular videos
                      or YouTube Shorts depending on the content format you're interested in studying.
                      Our algorithm searches through thousands of videos to find the top performers.
                    </S.EducationalText>
                  </S.StepContent>
                </S.StepItem>

                <S.StepItem>
                  <S.StepNumberCircle>2</S.StepNumberCircle>
                  <S.StepContent>
                    <S.OutlierFinderStepTitle>Customize Filters</S.OutlierFinderStepTitle>
                    <S.EducationalText>
                      Apply advanced filters to narrow your search by minimum views, video age, channel size,
                      and sorting preferences. Filter by channel subscriber count to find outliers from
                      small creators or established channels. Sort results by view ratio, engagement, or viral score.
                    </S.EducationalText>
                  </S.StepContent>
                </S.StepItem>

                <S.StepItem>
                  <S.StepNumberCircle>3</S.StepNumberCircle>
                  <S.StepContent>
                    <S.OutlierFinderStepTitle>Analyze Performance Data</S.OutlierFinderStepTitle>
                    <S.EducationalText>
                      Review detailed metrics including view-to-subscriber ratios, engagement rates, and viral
                      scores for each outlier video. Use these insights to understand what makes content go viral
                      and apply these patterns to your own content strategy.
                    </S.EducationalText>
                  </S.StepContent>
                </S.StepItem>
              </S.StepByStep>
            </S.EducationalContent>

            <S.EducationalContent>
              <S.SectionSubTitle>Understanding Outlier Metrics</S.SectionSubTitle>

              <S.FeatureList>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>View-to-Subscriber Ratio:</strong> Measures how many views a video gets relative to the creator's subscriber count</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Engagement Rate:</strong> Calculates the percentage of viewers who liked, commented, or interacted with the video</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Viral Score:</strong> Comprehensive metric combining view ratio, engagement, and time factors to identify viral content</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Channel Size Filtering:</strong> Discover outliers from micro-influencers, small creators, or established channels</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Content Format Analysis:</strong> Separate analysis for YouTube Shorts versus traditional long-form videos</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Trend Detection:</strong> Identify emerging trends and viral content patterns before they become mainstream</span>
                </S.FeatureListItem>
              </S.FeatureList>

              <S.EducationalText>
                Use outlier analysis to understand what content resonates with audiences, identify successful
                content strategies, discover trending topics, and find inspiration for your own viral content.
                This tool is invaluable for content creators, marketers, and researchers studying YouTube trends
                and viral content patterns.
              </S.EducationalText>
            </S.EducationalContent>
          </S.EducationalSection>
        )}



        <S.ResultsContainer className={showResults ? 'visible' : ''}>
          {isLoading ? (
            <S.LoadingContainer>
              <i className='bx bx-loader-alt bx-spin'></i>
              <p>Analyzing {isShorts ? 'YouTube Shorts' : 'videos'} for outliers...</p>
            </S.LoadingContainer>
          ) : results.length > 0 ? (
            <>
              <S.ResultsHeader>
                <S.ResultsTitle>
                  Found {results.length} {isShorts ? 'Shorts' : 'video'} outliers for "{query}"
                </S.ResultsTitle>
                <S.ExportButton onClick={exportResults}>
                  <i className="bx bx-download"></i>
                  Export Results
                </S.ExportButton>
              </S.ResultsHeader>

              <S.ResultsList>
                {results.map((result, index) => (
                  <S.ResultCard key={result.video.id}>
                    <S.CardHeader>
                      <S.RatioBadge ratio={result.ratio}>
                        {result.ratio.toFixed(1)}x
                      </S.RatioBadge>
                    </S.CardHeader>

                    <S.ThumbnailContainer>
                      <S.Thumbnail
                        src={result.video.snippet.thumbnails.medium?.url || result.video.snippet.thumbnails.default.url}
                        alt={result.video.snippet.title}
                      />
                      <S.VideoDuration>
                        {formatDuration(parseDuration(result.video.contentDetails.duration))}
                      </S.VideoDuration>
                    </S.ThumbnailContainer>

                    <S.VideoInfo>
                      <S.VideoTitle>{result.video.snippet.title}</S.VideoTitle>

                      <S.ChannelInfo>
                        <S.ChannelName>{result.video.snippet.channelTitle}</S.ChannelName>
                        <S.VideoDate>{formatDate(result.video.snippet.publishedAt)}</S.VideoDate>
                      </S.ChannelInfo>

                      <S.StatsGrid>
                        <S.StatItem>
                          <S.StatIcon className="bx bx-show"></S.StatIcon>
                          <S.StatValue>{parseInt(result.video.statistics.viewCount).toLocaleString()}</S.StatValue>
                          <S.StatLabel>views</S.StatLabel>
                        </S.StatItem>

                        <S.StatItem>
                          <S.StatIcon className="bx bx-group"></S.StatIcon>
                          <S.StatValue>{parseInt(result.channel.statistics.subscriberCount).toLocaleString()}</S.StatValue>
                          <S.StatLabel>subs</S.StatLabel>
                        </S.StatItem>

                        <S.StatItem>
                          <S.StatIcon className="bx bx-like"></S.StatIcon>
                          <S.StatValue>{parseInt(result.video.statistics.likeCount || '0').toLocaleString()}</S.StatValue>
                          <S.StatLabel>likes</S.StatLabel>
                        </S.StatItem>

                        <S.StatItem>
                          <S.StatIcon className="bx bx-comment"></S.StatIcon>
                          <S.StatValue>{parseInt(result.video.statistics.commentCount || '0').toLocaleString()}</S.StatValue>
                          <S.StatLabel>comments</S.StatLabel>
                        </S.StatItem>
                      </S.StatsGrid>

                      <S.MetricsRow>
                        <S.Metric>
                          <S.MetricLabel>Engagement:</S.MetricLabel>
                          <S.MetricValue>{(result.engagementRate * 100).toFixed(2)}%</S.MetricValue>
                        </S.Metric>
                        <S.Metric>
                          <S.MetricLabel>Viral Score:</S.MetricLabel>
                          <S.MetricValue>{getViralityLabel(result.viralScore)}</S.MetricValue>
                        </S.Metric>
                      </S.MetricsRow>

                      <S.ActionButtons>
                        <S.VideoLink
                          href={`https://www.youtube.com/watch?v=${result.video.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <i className="bx bx-play"></i>
                          Watch Video
                        </S.VideoLink>
                        <S.AnalyzeButton
                          onClick={() => navigate(`/tools/video-analyzer/${result.video.id}`)}
                        >
                          <i className="bx bx-line-chart"></i>
                          Analyze
                        </S.AnalyzeButton>
                      </S.ActionButtons>
                    </S.VideoInfo>
                  </S.ResultCard>
                ))}
              </S.ResultsList>
            </>
          ) : showResults && (
            <S.NoResults>
              <i className="bx bx-search-alt"></i>
              <h3>No outliers found</h3>
              <p>Try adjusting your filters or search for a different topic.</p>
            </S.NoResults>
          )}
        </S.ResultsContainer>
      </S.MainContainer>
    </S.PageWrapper>
    </>
  );
};

export default OutlierFinder;