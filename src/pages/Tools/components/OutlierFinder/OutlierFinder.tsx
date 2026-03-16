// src/pages/Tools/components/OutlierFinder/OutlierFinder.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SEO } from '../../../../components/SEO';
import { GoogleAd } from '../../../../components/GoogleAd';
import { toolsSEO, generateToolSchema } from '../../../../config/toolsSEO';
import * as S from './styles';

const decodeHtml = (html: string): string => {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
};

interface OutlierResult {
  video: any;
  channel: any;
  ratio: number;           // views / channel avg views (primary outlier signal)
  viewsToSubRatio: number; // views / subscribers (secondary display metric)
  engagementRate: number;
  viralScore: number;
  viewsPerDay: number;
  channelAvgViews: number;
  outlierExplanation: string;
}

interface FilterOptions {
  minViews: number;
  maxAge: number;
  minSubscribers: number;
  maxSubscribers: number;
  sortBy: 'ratio' | 'views' | 'engagement' | 'viral';
  showOnlyRecent: boolean;
}

// Rate limit: max 5 queries per 2-minute window
const RATE_LIMIT_KEY = 'outlier-finder-rl';
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 2 * 60 * 1000;

function getRateLimitTimestamps(): number[] {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function checkAndRecordQuery(): { allowed: boolean; retryInMs: number } {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const timestamps = getRateLimitTimestamps().filter(ts => ts > windowStart);

  if (timestamps.length >= RATE_LIMIT_MAX) {
    const retryInMs = timestamps[0] + RATE_LIMIT_WINDOW_MS - now;
    return { allowed: false, retryInMs: Math.max(retryInMs, 0) };
  }

  timestamps.push(now);
  try {
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(timestamps));
  } catch {
    // ignore
  }
  return { allowed: true, retryInMs: 0 };
}

export const OutlierFinder: React.FC = () => {
  const { searchQuery, type } = useParams<{ searchQuery: string; type: string }>();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isShorts, setIsShorts] = useState(false);
  const [results, setResults] = useState<OutlierResult[]>([]);
  const [rawVideos, setRawVideos] = useState<any[]>([]);
  const [rawChannels, setRawChannels] = useState<any[]>([]);
  const [rawRecentAvgMap, setRawRecentAvgMap] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [resultCount, setResultCount] = useState(25);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const toolConfig = {
    name: 'Outlier Finder',
    description: 'Discover high-performing videos that exceed typical view-to-subscriber ratios in any niche',
    image: 'https://64.media.tumblr.com/60109acd631995e9b43834a7f4358e78/0e01452f9f6dd974-f2/s2048x3072/3390c9b19607d957940ac9e1b8b23b6afbdc037f.jpg',
    icon: 'bx bx-trophy',
    features: [
      'Channel avg comparison',
      'Views-per-day velocity',
      'Multi-search precision'
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
    const history = localStorage.getItem('outlier_search_history');
    if (history) setSearchHistory(JSON.parse(history));
  }, [searchQuery, type]);

  const saveSearchHistory = (q: string) => {
    const newHistory = [q, ...searchHistory.filter(h => h !== q)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('outlier_search_history', JSON.stringify(newHistory));
  };

  const handleSearch = () => {
    if (!query.trim()) { alert('Please enter a search query'); return; }
    saveSearchHistory(query);
    navigate(`/tools/outlier-finder/${encodeURIComponent(query)}/${isShorts ? 'shorts' : 'videos'}`);
  };

  // ─── API helpers ─────────────────────────────────────────────────────────────

  // Run 3 parallel searches (relevance, viewCount, date) and deduplicate
  const searchVideos = async (q: string): Promise<any[]> => {
    const orders = ['relevance', 'viewCount', 'date'];
    const settled = await Promise.allSettled(
      orders.map(order =>
        fetch(
          `https://www.googleapis.com/youtube/v3/search?` +
          `part=snippet&q=${encodeURIComponent(q)}&type=video&maxResults=50&key=${API_KEY}&order=${order}`
        ).then(r => r.json())
      )
    );

    const seen = new Set<string>();
    const items: any[] = [];
    for (const result of settled) {
      if (result.status === 'fulfilled' && !result.value.error) {
        for (const item of result.value.items || []) {
          if (!seen.has(item.id.videoId)) {
            seen.add(item.id.videoId);
            items.push(item);
          }
        }
      }
    }
    return items;
  };

  // Batched video details — only filters by duration (shorts vs regular)
  const getVideoDetails = async (videos: any[], isShorts: boolean): Promise<any[]> => {
    const allDetails: any[] = [];
    for (let i = 0; i < videos.length; i += 50) {
      const batch = videos.slice(i, i + 50);
      const ids = batch.map((v: any) => v.id.videoId).join(',');
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?` +
        `part=snippet,statistics,contentDetails&id=${ids}&key=${API_KEY}`
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      allDetails.push(...(data.items || []));
    }

    return allDetails.filter((video: any) => {
      const duration = parseDuration(video.contentDetails.duration);
      return isShorts ? duration <= 180 : duration > 180;
    });
  };

  // Batched channel details — includes contentDetails for uploads playlist ID
  const getChannelDetails = async (videos: any[]): Promise<any[]> => {
    const channelIdsSet = new Set<string>();
    videos.forEach(v => channelIdsSet.add(v.snippet.channelId));
    const channelIds = Array.from(channelIdsSet);

    const allChannels: any[] = [];
    for (let i = 0; i < channelIds.length; i += 50) {
      const batch = channelIds.slice(i, i + 50);
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?` +
        `part=statistics,snippet,contentDetails&id=${batch.join(',')}&key=${API_KEY}`
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      allChannels.push(...(data.items || []));
    }
    return allChannels;
  };

  // Fetch each channel's last 20 videos and compute median views as the baseline.
  // This is far more accurate than all-time total / videoCount because one viral video
  // from 3 years ago can't inflate the average and hide real outliers.
  const getChannelRecentAvg = async (channels: any[]): Promise<Record<string, number>> => {
    const recentAvgMap: Record<string, number> = {};

    // Process in batches of 10 to avoid hammering the API
    for (let i = 0; i < channels.length; i += 10) {
      const batch = channels.slice(i, i + 10);
      await Promise.allSettled(batch.map(async (channel) => {
        const uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads;
        if (!uploadsPlaylistId) return;

        try {
          // Step 1: get last 20 video IDs from uploads playlist
          const playlistRes = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?` +
            `part=contentDetails&playlistId=${uploadsPlaylistId}&maxResults=20&key=${API_KEY}`
          );
          const playlistData = await playlistRes.json();
          if (playlistData.error || !playlistData.items?.length) return;

          const videoIds = playlistData.items
            .map((item: any) => item.contentDetails.videoId)
            .join(',');

          // Step 2: get view counts for those videos
          const statsRes = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?` +
            `part=statistics&id=${videoIds}&key=${API_KEY}`
          );
          const statsData = await statsRes.json();
          if (statsData.error || !statsData.items?.length) return;

          // Step 3: compute median (not mean) — immune to a single mega-viral outlier
          const viewCounts = statsData.items
            .map((v: any) => parseInt(v.statistics.viewCount) || 0)
            .sort((a: number, b: number) => a - b);

          const mid = Math.floor(viewCounts.length / 2);
          const median = viewCounts.length % 2 !== 0
            ? viewCounts[mid]
            : (viewCounts[mid - 1] + viewCounts[mid]) / 2;

          recentAvgMap[channel.id] = Math.max(median, 1);
        } catch {
          // fall back to all-time average (handled in calculateOutliers)
        }
      }));
    }

    return recentAvgMap;
  };

  // ─── Scoring ─────────────────────────────────────────────────────────────────

  const calculateOutliers = useCallback((
    videos: any[],
    channels: any[],
    recentAvgMap: Record<string, number> = {}
  ): OutlierResult[] => {
    const outliers = videos.map(video => {
      const channel = channels.find(c => c.id === video.snippet.channelId);
      if (!channel) return null;

      const views = parseInt(video.statistics.viewCount) || 0;
      const likes = parseInt(video.statistics.likeCount) || 0;
      const comments = parseInt(video.statistics.commentCount) || 0;
      const subscribers = parseInt(channel.statistics.subscriberCount) || 1;
      const videoCount = parseInt(channel.statistics.videoCount) || 1;
      const totalChannelViews = parseInt(channel.statistics.viewCount) || 1;
      const age = getVideoAgeInDays(video.snippet.publishedAt);

      // Apply all user filters
      if (views < filters.minViews) return null;
      if (age > filters.maxAge) return null;
      if (filters.showOnlyRecent && age > 30) return null;
      if (subscribers < filters.minSubscribers || subscribers > filters.maxSubscribers) return null;

      // Use recent median views if available, fall back to all-time average
      const channelAvgViews = recentAvgMap[channel.id] ?? (totalChannelViews / videoCount);

      // Primary outlier ratio: how far above the channel's own recent baseline is this video?
      const ratio = views / Math.max(channelAvgViews, 1);

      // Only show genuine outliers — require at least 2× the channel's recent average
      if (ratio < 2) return null;

      const viewsToSubRatio = views / subscribers;
      const engagementRate = (likes + comments) / Math.max(views, 1);
      const viewsPerDay = Math.round(views / Math.max(age, 1));

      // Viral score: outlier magnitude weighted by engagement (no time decay)
      const viralScore = ratio * (1 + engagementRate * 10);

      const outlierExplanation = `${ratio.toFixed(1)}× this channel's recent avg`;

      return {
        video, channel, ratio, viewsToSubRatio,
        engagementRate, viralScore, viewsPerDay,
        channelAvgViews, outlierExplanation
      };
    }).filter((item): item is OutlierResult => item !== null);

    // Apply sort
    outliers.sort((a, b) => {
      switch (filters.sortBy) {
        case 'views':      return parseInt(b.video.statistics.viewCount) - parseInt(a.video.statistics.viewCount);
        case 'engagement': return b.engagementRate - a.engagementRate;
        case 'viral':      return b.viralScore - a.viralScore;
        default:           return b.ratio - a.ratio;
      }
    });

    // Diversity cap: max 2 results per channel so one channel doesn't dominate
    const channelCount: Record<string, number> = {};
    const diverse = outliers.filter(r => {
      const id = r.channel.id;
      channelCount[id] = (channelCount[id] || 0) + 1;
      return channelCount[id] <= 2;
    });

    return diverse.slice(0, resultCount);
  }, [filters, resultCount]);

  // Re-filter from raw data whenever filters/count change (no new API calls)
  useEffect(() => {
    if (showResults && rawVideos.length > 0) {
      setResults(calculateOutliers(rawVideos, rawChannels, rawRecentAvgMap));
    }
  }, [filters, resultCount, calculateOutliers, rawRecentAvgMap]);

  // ─── Main search ─────────────────────────────────────────────────────────────

  const handleAnalyze = async (searchQuery: string, isShorts: boolean) => {
    if (!searchQuery.trim()) { alert('Please enter a search query'); return; }

    const { allowed, retryInMs } = checkAndRecordQuery();
    if (!allowed) {
      const seconds = Math.ceil(retryInMs / 1000);
      setRateLimitError(`You've made several searches in quick succession. Please wait ${seconds}s before trying again.`);
      setTimeout(() => setRateLimitError(null), retryInMs);
      return;
    }

    setRateLimitError(null);
    setApiError(null);
    setIsLoading(true);
    setShowResults(false);

    try {
      const videos = await searchVideos(searchQuery);
      const videoDetails = await getVideoDetails(videos, isShorts);
      const channelDetails = await getChannelDetails(videoDetails);
      const recentAvgMap = await getChannelRecentAvg(channelDetails);

      // Store raw data so filter changes can recompute without re-fetching
      setRawVideos(videoDetails);
      setRawChannels(channelDetails);
      setRawRecentAvgMap(recentAvgMap);

      const outliers = calculateOutliers(videoDetails, channelDetails, recentAvgMap);
      setResults(outliers);
      setShowResults(true);
    } catch (error) {
      console.error('Error:', error);
      const msg = error instanceof Error ? error.message : '';
      if (msg.toLowerCase().includes('quota')) {
        setApiError('The Outlier Finder is on cooldown — YouTube API quota exceeded. Try again tomorrow.');
      } else {
        setApiError(msg || 'An error occurred while fetching results. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Utilities ───────────────────────────────────────────────────────────────

  const parseDuration = (duration: string): number => {
    const matches = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!matches) return 0;
    const [, hours, minutes, seconds] = matches;
    return (parseInt(hours || '0') * 3600) + (parseInt(minutes || '0') * 60) + parseInt(seconds || '0');
  };

  const getVideoAgeInDays = (publishedAt: string): number => {
    return Math.floor((Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60 * 24));
  };

  const formatDate = (isoString: string): string =>
    new Date(isoString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return h > 0
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatCompact = (n: number): string => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toLocaleString();
  };

  const getViralityLabel = (score: number): string => {
    if (score >= 50) return 'Extremely Viral';
    if (score >= 20) return 'Highly Viral';
    if (score >= 10) return 'Viral';
    if (score >= 5)  return 'Trending';
    return 'Normal';
  };

  // ─── Exports ─────────────────────────────────────────────────────────────────

  const exportJSON = () => {
    const data = results.map(r => ({
      title: decodeHtml(r.video.snippet.title),
      channel: decodeHtml(r.video.snippet.channelTitle),
      views: parseInt(r.video.statistics.viewCount),
      subscribers: parseInt(r.channel.statistics.subscriberCount),
      channel_avg_views: Math.round(r.channelAvgViews),
      outlier_ratio: parseFloat(r.ratio.toFixed(2)),
      views_to_sub_ratio: parseFloat(r.viewsToSubRatio.toFixed(2)),
      views_per_day: r.viewsPerDay,
      engagement_rate: (r.engagementRate * 100).toFixed(2) + '%',
      viral_score: r.viralScore.toFixed(2),
      published_date: r.video.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${r.video.id}`
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `outliers_${query.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const headers = [
      'Title', 'Channel', 'Views', 'Subscribers', 'Channel Avg Views',
      'Outlier Ratio', 'Views/Sub Ratio', 'Views Per Day',
      'Engagement Rate', 'Viral Score', 'Published Date', 'URL'
    ];
    const rows = results.map(r => [
      `"${decodeHtml(r.video.snippet.title).replace(/"/g, '""')}"`,
      `"${decodeHtml(r.video.snippet.channelTitle).replace(/"/g, '""')}"`,
      parseInt(r.video.statistics.viewCount),
      parseInt(r.channel.statistics.subscriberCount),
      Math.round(r.channelAvgViews),
      r.ratio.toFixed(2),
      r.viewsToSubRatio.toFixed(2),
      r.viewsPerDay,
      (r.engagementRate * 100).toFixed(2) + '%',
      r.viralScore.toFixed(2),
      r.video.snippet.publishedAt,
      `https://www.youtube.com/watch?v=${r.video.id}`
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `outliers_${query.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleToggle = (shorts: boolean) => setIsShorts(shorts);

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

              {rateLimitError && (
                <div style={{
                  marginTop: '0.75rem', padding: '0.6rem 1rem',
                  background: 'rgba(185, 28, 28, 0.15)', border: '1px solid rgba(185, 28, 28, 0.4)',
                  borderRadius: '8px', color: '#fca5a5', fontSize: '0.875rem',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                }}>
                  <i className="bx bx-time-five" style={{ flexShrink: 0 }}></i>
                  {rateLimitError}
                </div>
              )}

              {apiError && (
                <S.ErrorMessage>
                  <i className="bx bx-error"></i>
                  {apiError}
                </S.ErrorMessage>
              )}

              <S.ControlsContainer>
                <S.ToggleContainer>
                  <S.ToggleButton onClick={() => handleToggle(false)} className={!isShorts ? 'active' : ''}>
                    <i className="bx bx-play"></i>Videos
                  </S.ToggleButton>
                  <S.ToggleButton onClick={() => handleToggle(true)} className={isShorts ? 'active' : ''}>
                    <i className="bx bx-mobile"></i>Shorts
                  </S.ToggleButton>
                </S.ToggleContainer>
                <S.FilterToggle onClick={() => setShowFilters(!showFilters)}>
                  <i className="bx bx-filter"></i>Filters
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
                <S.FilterLabel>Video Age</S.FilterLabel>
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
                  <option value="0-1000">Micro (0–1K)</option>
                  <option value="1000-10000">Small (1K–10K)</option>
                  <option value="10000-100000">Medium (10K–100K)</option>
                  <option value="100000-1000000">Large (100K–1M)</option>
                  <option value="1000000-10000000">Huge (1M+)</option>
                </S.FilterSelect>
              </S.FilterGroup>

              <S.FilterGroup>
                <S.FilterLabel>Sort By</S.FilterLabel>
                <S.FilterSelect
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                >
                  <option value="ratio">Channel Avg Ratio</option>
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
                  <option value={10}>Top 10</option>
                  <option value={25}>Top 25</option>
                  <option value={50}>Top 50</option>
                  <option value={100}>Top 100</option>
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
                <S.HistoryTag key={index} onClick={() => setQuery(term)}>{term}</S.HistoryTag>
              ))}
            </S.HistoryTags>
          </S.SearchHistory>
        )}

        <GoogleAd adSlot="1234567890" />

        {!showResults && (
          <S.EducationalSection>
            <S.EducationalContent>
              <S.SectionSubTitle>How the Outlier Finder Works</S.SectionSubTitle>
              <S.EducationalText>
                Unlike basic tools that just rank by view count, this finder compares each video to its own channel's average performance. A video with 2M views from MrBeast isn't an outlier. A video with 2M views from a channel that normally gets 40K is a massive outlier — and that's exactly what this tool surfaces.
              </S.EducationalText>
              <S.StepByStep>
                <S.StepItem>
                  <S.StepNumberCircle>1</S.StepNumberCircle>
                  <S.StepContent>
                    <S.OutlierFinderStepTitle>Multi-Source Search</S.OutlierFinderStepTitle>
                    <S.EducationalText>Runs three parallel searches (by relevance, view count, and upload date) and deduplicates the results for a much larger, more diverse pool of candidates.</S.EducationalText>
                  </S.StepContent>
                </S.StepItem>
                <S.StepItem>
                  <S.StepNumberCircle>2</S.StepNumberCircle>
                  <S.StepContent>
                    <S.OutlierFinderStepTitle>Channel Average Comparison</S.OutlierFinderStepTitle>
                    <S.EducationalText>Fetches each channel's last 20 videos and computes the <strong>median</strong> views as the baseline — not a skewed all-time average. A viral video from 3 years ago won't hide today's real outliers.</S.EducationalText>
                  </S.StepContent>
                </S.StepItem>
                <S.StepItem>
                  <S.StepNumberCircle>3</S.StepNumberCircle>
                  <S.StepContent>
                    <S.OutlierFinderStepTitle>Velocity + Engagement Scoring</S.OutlierFinderStepTitle>
                    <S.EducationalText>Combines outlier ratio, views per day, and engagement rate into a viral score. No arbitrary time decay — a genuinely viral video from two years ago still ranks highly.</S.EducationalText>
                  </S.StepContent>
                </S.StepItem>
              </S.StepByStep>
            </S.EducationalContent>
          </S.EducationalSection>
        )}

        <S.ResultsContainer className={showResults ? 'visible' : ''}>
          {isLoading ? (
            <S.LoadingContainer>
              <i className='bx bx-loader-alt bx-spin'></i>
              <p>Analyzing {isShorts ? 'YouTube Shorts' : 'videos'} — fetching channel baselines...</p>
            </S.LoadingContainer>
          ) : results.length > 0 ? (
            <>
              <S.ResultsHeader>
                <S.ResultsTitle>
                  {results.length} outlier{results.length !== 1 ? 's' : ''} found for "{query}"
                </S.ResultsTitle>
                <S.ExportButtonsGroup>
                  <S.ExportButton onClick={exportCSV}>
                    <i className="bx bx-table"></i>
                    Export CSV
                  </S.ExportButton>
                  <S.ExportButton onClick={exportJSON}>
                    <i className="bx bx-download"></i>
                    Export JSON
                  </S.ExportButton>
                </S.ExportButtonsGroup>
              </S.ResultsHeader>

              <S.ResultsList>
                {results.map((result) => (
                  <S.ResultCard key={result.video.id}>
                    <S.ThumbnailContainer>
                      <S.Thumbnail
                        src={result.video.snippet.thumbnails.medium?.url || result.video.snippet.thumbnails.default.url}
                        alt={decodeHtml(result.video.snippet.title)}
                      />
                      <S.VideoDuration>
                        {formatDuration(parseDuration(result.video.contentDetails.duration))}
                      </S.VideoDuration>
                      <S.RatioBadge ratio={result.ratio}>
                        {result.ratio.toFixed(1)}×
                      </S.RatioBadge>
                    </S.ThumbnailContainer>

                    <S.VideoInfo>
                      <S.VideoTitle>{decodeHtml(result.video.snippet.title)}</S.VideoTitle>

                      <S.ChannelInfo>
                        <S.ChannelNameGroup>
                          {result.channel.snippet?.thumbnails?.default?.url && (
                            <S.ChannelAvatar
                              src={result.channel.snippet.thumbnails.default.url}
                              alt={decodeHtml(result.video.snippet.channelTitle)}
                            />
                          )}
                          <S.ChannelLink
                            href={`https://youtube.com/channel/${result.channel.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {decodeHtml(result.video.snippet.channelTitle)}
                          </S.ChannelLink>
                        </S.ChannelNameGroup>
                        <S.VideoDate>{formatDate(result.video.snippet.publishedAt)}</S.VideoDate>
                      </S.ChannelInfo>

                      <S.OutlierBadge>
                        <i className="bx bx-trending-up"></i>
                        {result.outlierExplanation}
                      </S.OutlierBadge>

                      <S.StatsRow>
                        <S.StatPill>
                          <S.StatPillValue>{formatCompact(parseInt(result.video.statistics.viewCount))}</S.StatPillValue>
                          <S.StatPillLabel>views</S.StatPillLabel>
                        </S.StatPill>
                        <S.StatPill>
                          <S.StatPillValue>{formatCompact(parseInt(result.channel.statistics.subscriberCount))}</S.StatPillValue>
                          <S.StatPillLabel>subs</S.StatPillLabel>
                        </S.StatPill>
                        <S.StatPill>
                          <S.StatPillValue>{formatCompact(result.viewsPerDay)}</S.StatPillValue>
                          <S.StatPillLabel>views/day</S.StatPillLabel>
                        </S.StatPill>
                        <S.StatPill>
                          <S.StatPillValue>{(result.engagementRate * 100).toFixed(1)}%</S.StatPillValue>
                          <S.StatPillLabel>engagement</S.StatPillLabel>
                        </S.StatPill>
                      </S.StatsRow>

                      <S.ActionButtons>
                        <S.VideoLink
                          href={`https://www.youtube.com/watch?v=${result.video.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <i className="bx bx-play"></i>
                          Watch
                        </S.VideoLink>
                        <S.AnalyzeButton onClick={() => navigate(`/tools/video-analyzer/${result.video.id}`)}>
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
