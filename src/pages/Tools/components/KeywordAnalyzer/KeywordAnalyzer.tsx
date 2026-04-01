// src/pages/Tools/components/KeywordAnalyzer/KeywordAnalyzer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SEO } from '../../../../components/SEO';import { toolsSEO, generateToolSchema } from '../../../../config/toolsSEO';
import * as S from './styles';

const KW_API_KEYS = [
  process.env.REACT_APP_YOUTUBE_API_KEY_6,  // primary — KeywordAnalyzer dedicated
  process.env.REACT_APP_YOUTUBE_API_KEY,    // fallback 1
  process.env.REACT_APP_YOUTUBE_API_KEY_11, // fallback 2
].filter(Boolean) as string[];

const isKwQuotaError = (status: number, data: any): boolean => {
  if (status === 403 || status === 429) {
    const reason = data?.error?.errors?.[0]?.reason || '';
    return ['quotaExceeded', 'dailyLimitExceeded', 'rateLimitExceeded'].includes(reason);
  }
  return false;
};

const decodeHtml = (html: string): string => {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
};

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
  relevanceScore?: number;
}

interface UploadTimeData {
  day: string;
  hour: number;
  count: number;
  avgViews: number;
}

interface Recommendation {
  metric: string;
  value: string;
  rating: 'excellent' | 'good' | 'fair' | 'poor' | 'info';
  action: string;
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
  recommendations: Recommendation[];
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
  const kwKeyIndexRef = useRef(0);

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

  const calculateRelevanceScore = (video: YouTubeVideo, keyword: string): number => {
    let score = 0;
    const keywordLower = keyword.toLowerCase();
    const titleLower = video.title.toLowerCase();
    const descriptionLower = video.description.toLowerCase();
    const tagsLower = video.tags.map(tag => tag.toLowerCase());

    // Exact keyword match in title (highest weight)
    if (titleLower.includes(keywordLower)) {
      score += 45;
      // Bonus for keyword at the beginning of title
      if (titleLower.startsWith(keywordLower)) {
        score += 15;
      }
    }

    // Partial keyword matches in title (only words not already matched by exact)
    const keywordWords = keywordLower.split(' ').filter(w => w.length > 2);
    if (!titleLower.includes(keywordLower)) {
      keywordWords.forEach(word => {
        if (titleLower.includes(word)) score += 8;
      });
    }

    // Keyword in description
    if (descriptionLower.includes(keywordLower)) {
      score += 15;
    }

    // Keyword in tags — cap tag contribution to prevent accumulation
    let tagScore = 0;
    tagsLower.forEach(tag => {
      if (tag.includes(keywordLower)) {
        tagScore += 15;
      } else {
        keywordWords.forEach(word => {
          if (tag.includes(word)) tagScore += 4;
        });
      }
    });
    score += Math.min(25, tagScore); // cap at 25 regardless of tag count

    return Math.min(100, score);
  };

  const fetchYouTubeData = async (searchTerm: string, apiKey: string): Promise<YouTubeVideo[]> => {
    // Helper: fetch a URL and throw a special error if quota is exceeded
    const quotaFetch = async (url: string) => {
      const res = await fetch(url);
      const data = await res.json();
      if (isKwQuotaError(res.status, data)) {
        throw new Error('__QUOTA_EXHAUSTED__');
      }
      if (!res.ok) {
        throw new Error(data?.error?.message || `API Error (${res.status})`);
      }
      return data;
    };

    try {
      // Page 1 search — no date filter so all-time results are included
      const buildSearchUrl = (pageToken?: string) =>
        `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet&type=video&q=${encodeURIComponent(searchTerm)}&` +
        `maxResults=50&order=relevance&key=${apiKey}` +
        (pageToken ? `&pageToken=${pageToken}` : '');

      const page1Data = await quotaFetch(buildSearchUrl());

      if (!page1Data.items || page1Data.items.length === 0) {
        throw new Error('No videos found for this keyword');
      }

      // Page 2 search in parallel with page 1 stats fetch
      const page2Promise = page1Data.nextPageToken
        ? quotaFetch(buildSearchUrl(page1Data.nextPageToken)).catch(() => ({ items: [] }))
        : Promise.resolve({ items: [] });

      const page1Ids = page1Data.items.map((item: any) => item.id.videoId).join(',');
      const stats1Promise = quotaFetch(
        `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails,snippet&id=${page1Ids}&key=${apiKey}`
      );

      const [page2Data, stats1Data] = await Promise.all([page2Promise, stats1Promise]);

      // Page 2 stats (if we got a second page)
      let stats2Data = { items: [] as any[] };
      if (page2Data.items?.length > 0) {
        const page2Ids = page2Data.items.map((item: any) => item.id.videoId).join(',');
        stats2Data = await quotaFetch(
          `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails,snippet&id=${page2Ids}&key=${apiKey}`
        );
      }

      // Combine all search items and stats
      const allSearchItems = [
        ...(page1Data.items || []),
        ...(page2Data.items || [])
      ];
      const allStatsItems = [
        ...(stats1Data.items || []),
        ...(stats2Data.items || [])
      ];

      const seenIds = new Set<string>();
      const allVideos: YouTubeVideo[] = allSearchItems
        .filter((searchItem: any) => {
          if (seenIds.has(searchItem.id.videoId)) return false;
          seenIds.add(searchItem.id.videoId);
          return true;
        })
        .map((searchItem: any) => {
          const statsItem = allStatsItems.find((stat: any) => stat.id === searchItem.id.videoId);

          const video: YouTubeVideo = {
            id: searchItem.id.videoId,
            title: decodeHtml(searchItem.snippet.title),
            description: searchItem.snippet.description || '',
            thumbnail: searchItem.snippet.thumbnails.medium?.url || searchItem.snippet.thumbnails.default.url,
            views: parseInt(statsItem?.statistics?.viewCount || '0'),
            likes: parseInt(statsItem?.statistics?.likeCount || '0'),
            publishedAt: searchItem.snippet.publishedAt,
            channelTitle: searchItem.snippet.channelTitle,
            channelId: searchItem.snippet.channelId,
            duration: statsItem?.contentDetails?.duration || 'PT0S',
            tags: statsItem?.snippet?.tags || []
          };

          video.relevanceScore = calculateRelevanceScore(video, searchTerm);
          return video;
        })
        .filter((video: YouTubeVideo) => {
          const duration = parseDuration(video.duration);
          return video.views >= 1000 &&
            video.relevanceScore! >= 20 &&
            video.title.length > 10 &&
            duration >= 60 &&
            !video.title.toLowerCase().includes('live stream') &&
            !video.title.toLowerCase().includes('compilation');
        });

      // Sort by combined relevance + performance
      return allVideos.sort((a, b) => {
        const scoreA = (a.relevanceScore || 0) * 0.6 + Math.log10(a.views + 1) * 0.4;
        const scoreB = (b.relevanceScore || 0) * 0.6 + Math.log10(b.views + 1) * 0.4;
        return scoreB - scoreA;
      });

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
    const timeData: { [key: string]: { count: number; totalViews: number; totalDaysOld: number } } = {};

    videos.forEach(video => {
      const date = new Date(video.publishedAt);
      const day = date.toLocaleDateString('en-US', { weekday: 'long' });
      const hour = date.getHours();
      const key = `${day}-${hour}`;
      // Age in days — used to normalize views so old viral videos don't skew slot rankings
      const daysOld = Math.max(1, (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));

      if (!timeData[key]) {
        timeData[key] = { count: 0, totalViews: 0, totalDaysOld: 0 };
      }

      timeData[key].count++;
      timeData[key].totalViews += video.views;
      timeData[key].totalDaysOld += daysOld;
    });

    return Object.entries(timeData).map(([key, data]) => {
      const [day, hourStr] = key.split('-');
      // avgViews = age-normalized views/day so older videos don't dominate rankings
      const avgViewsPerDay = data.totalViews / Math.max(1, data.totalDaysOld);
      return {
        day,
        hour: parseInt(hourStr),
        count: data.count,
        avgViews: Math.round(avgViewsPerDay)
      };
    });
  };

  const calculateTagScore = (videos: YouTubeVideo[], keyword: string): number => {
    if (videos.length === 0) return 0;

    const totalLikes = videos.reduce((sum, video) => sum + video.likes, 0);
    // Use median views to resist outlier skew (one viral video shouldn't inflate demand)
    const sortedViews = [...videos].map(v => v.views).sort((a, b) => a - b);
    const mid = Math.floor(sortedViews.length / 2);
    const medianViews = sortedViews.length % 2 !== 0
      ? sortedViews[mid]
      : (sortedViews[mid - 1] + sortedViews[mid]) / 2;
    const averageLikes = totalLikes / videos.length;
    const averageViews = medianViews; // alias for downstream thresholds
    const averageRelevance = videos.reduce((sum, video) => sum + (video.relevanceScore || 0), 0) / videos.length;

    // 1. Demand Signal (0-30 pts)
    // Are people consuming this content? Median views proxies search interest.
    // Capped at 500K — beyond that extra views signal competition more than opportunity.
    let demandFactor = 0;
    if (averageViews >= 500000) demandFactor = 30;
    else if (averageViews >= 200000) demandFactor = 26;
    else if (averageViews >= 100000) demandFactor = 22;
    else if (averageViews >= 50000) demandFactor = 17;
    else if (averageViews >= 20000) demandFactor = 12;
    else if (averageViews >= 10000) demandFactor = 8;
    else if (averageViews >= 5000) demandFactor = 4;
    else demandFactor = 1;

    // Recency bonus: active recent uploads confirm demand is current
    const recentVideos = videos.filter(v =>
      new Date(v.publishedAt) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    );
    if (recentVideos.length / videos.length > 0.4) demandFactor = Math.min(30, demandFactor + 4);

    // 2. Opportunity / Rankability (0-30 pts) — most important for a creator
    // Two components:
    //   a) Channel diversity: results spread across many channels = easier to break in (0-15)
    //   b) Title gap: keyword not yet in most titles = underutilized, easier to stand out (0-15)
    const channelCounts: Record<string, number> = {};
    videos.forEach(v => { channelCounts[v.channelId] = (channelCounts[v.channelId] || 0) + 1; });
    const uniqueChannels = Object.keys(channelCounts).length;
    const channelDiversityRatio = uniqueChannels / videos.length; // 1.0 = all different channels
    const diversityScore = Math.round(channelDiversityRatio * 15);

    const keywordInTitleCount = videos.filter(v =>
      v.title.toLowerCase().includes(keyword.toLowerCase())
    ).length;
    const titleSaturationRatio = keywordInTitleCount / videos.length;
    const titleGapScore = Math.round((1 - titleSaturationRatio) * 15); // low saturation = more room

    const opportunityFactor = diversityScore + titleGapScore;

    // 3. Engagement Quality (0-25 pts)
    // High engagement signals YouTube's algorithm will reward this content
    const engagementRate = averageLikes / Math.max(1, averageViews);
    let engagementFactor = 0;
    if (engagementRate >= 0.05) engagementFactor = 25;       // 5%+ exceptional
    else if (engagementRate >= 0.03) engagementFactor = 20;  // 3%+ very good
    else if (engagementRate >= 0.02) engagementFactor = 15;  // 2%+ good
    else if (engagementRate >= 0.01) engagementFactor = 10;  // 1%+ average
    else if (engagementRate >= 0.005) engagementFactor = 5;  // 0.5%+ below average
    else engagementFactor = 1;

    // 4. Content Relevance (0-15 pts)
    // Are the top results actually about this keyword?
    // Lower weight because filtering already removed low-relevance videos.
    let relevanceFactor = 0;
    if (averageRelevance >= 70) relevanceFactor = 15;
    else if (averageRelevance >= 55) relevanceFactor = 12;
    else if (averageRelevance >= 40) relevanceFactor = 8;
    else if (averageRelevance >= 25) relevanceFactor = 4;
    else relevanceFactor = 0;

    const tagScore = Math.round(demandFactor + opportunityFactor + engagementFactor + relevanceFactor);
    return Math.min(100, Math.max(0, tagScore));
  };

  const calculateSearchVolume = (videos: YouTubeVideo[]): { label: 'Low' | 'Moderate' | 'High' | 'Very High'; score: number } => {
    // Use median views (consistent with tagScore demand signal)
    const sortedViews = [...videos].map(v => v.views).sort((a, b) => a - b);
    const mid = Math.floor(sortedViews.length / 2);
    const medianViews = sortedViews.length % 2 !== 0
      ? sortedViews[mid]
      : (sortedViews[mid - 1] + sortedViews[mid]) / 2;
    const averageRelevance = videos.reduce((sum, video) => sum + (video.relevanceScore || 0), 0) / videos.length;

    // videoCountScore removed — we always fetch 80-100 videos so it was always near max
    const viewsScore = Math.min(50, (Math.log10(Math.max(1, medianViews)) - 3) * 12);
    const relevanceScore = Math.min(30, (averageRelevance / 100) * 30);

    const recentVideos = videos.filter(video =>
      new Date(video.publishedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    const recentActivityScore = Math.min(20, (recentVideos.length / videos.length) * 20);

    const rawScore = viewsScore + relevanceScore + recentActivityScore;
    const volumeScore = Math.max(1, Math.min(100, rawScore));

    let label: 'Low' | 'Moderate' | 'High' | 'Very High';
    if (volumeScore >= 75) label = 'Very High';
    else if (volumeScore >= 55) label = 'High';
    else if (volumeScore >= 35) label = 'Moderate';
    else label = 'Low';

    return { label, score: Math.round(volumeScore) };
  };

  const calculateCompetitiveness = (videos: YouTubeVideo[], keyword: string): { label: 'Low' | 'Moderate' | 'High' | 'Very High'; score: number } => {
    // 1. Channel concentration (0-40 pts)
    // What share of results do the top 3 channels hold?
    const channelCount = videos.reduce((acc, video) => {
      acc[video.channelId] = (acc[video.channelId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sortedChannelCounts = Object.values(channelCount).sort((a, b) => b - a);
    const top3Share = sortedChannelCounts.slice(0, 3).reduce((s, n) => s + n, 0) / videos.length;
    const concentrationScore = Math.round(top3Share * 40); // 100% from 3 channels = 40

    // 2. Keyword optimization saturation (0-35 pts)
    // How many creators have already optimized for this exact keyword in their title?
    const keywordInTitle = videos.filter(v =>
      v.title.toLowerCase().includes(keyword.toLowerCase())
    ).length;
    const optimizationScore = Math.round((keywordInTitle / videos.length) * 35);

    // 3. Recent upload velocity (0-25 pts)
    // Active creators uploading right now = you'd be entering a hot competition
    const recentUploads = videos.filter(video =>
      new Date(video.publishedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length;
    const recencyScore = Math.min(25, Math.round((recentUploads / videos.length) * 100));

    const totalScore = Math.min(100, concentrationScore + optimizationScore + recencyScore);

    let label: 'Low' | 'Moderate' | 'High' | 'Very High';
    if (totalScore >= 75) label = 'Very High';
    else if (totalScore >= 55) label = 'High';
    else if (totalScore >= 35) label = 'Moderate';
    else label = 'Low';

    return { label, score: totalScore };
  };

  const generatePerformanceDescription = (tagScore: number): string => {
    if (tagScore >= 85) {
      return "Strong demand with real ranking opportunity — an ideal keyword for most creators to target.";
    } else if (tagScore >= 70) {
      return "Good balance of demand and opportunity. Worth targeting with well-optimized content.";
    } else if (tagScore >= 50) {
      return "Decent potential but either competition is stiff or demand is limited. Use long-tail variations to find a better angle.";
    } else if (tagScore >= 30) {
      return "Either too competitive to rank or too niche to drive meaningful traffic. Consider related keywords with better scores.";
    } else {
      return "Low opportunity — dominated by established channels or very low demand. Focus on long-tail variations instead.";
    }
  };

  const analyzeKeywordData = (videos: YouTubeVideo[], keyword: string): KeywordData => {
    if (videos.length === 0) {
      throw new Error('No video data available for analysis');
    }

    // Calculate main metrics using enhanced algorithm
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

    // Views per day calculation - FIXED to whole number
    const avgDaysOld = videos.reduce((sum, video) => {
      const daysSinceUpload = (Date.now() - new Date(video.publishedAt).getTime()) / (1000 * 60 * 60 * 24);
      return sum + daysSinceUpload;
    }, 0) / videos.length;

    const viewsPerDay = Math.round(averageViews / Math.max(1, avgDaysOld)); // FIXED: Round to whole number

    // Upload time analysis
    const uploadTimeDistribution = analyzeUploadTimes(videos);

    // Best upload times — prefer slots with 2+ videos to avoid single-video flukes
    const reliableSlots = uploadTimeDistribution.filter(t => t.count >= 2);
    const sortedSlots = (reliableSlots.length >= 3 ? reliableSlots : uploadTimeDistribution)
      .sort((a, b) => b.avgViews - a.avgViews);
    const bestTimes = sortedSlots.slice(0, 3);

    const bestUploadDays = Array.from(new Set(bestTimes.map(t => t.day))).slice(0, 3);
    const bestUploadTimes = bestTimes.map(t => ({ day: t.day, hour: t.hour }));

    // Optimal upload time recommendation
    const optimalTime = bestTimes.length > 0 ?
      `${bestTimes[0].day} at ${bestTimes[0].hour}:00` : 'Data insufficient';

    // Analyze upload patterns for trend
    const recentVideos = videos.filter(video =>
      new Date(video.publishedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    const lastWeekVideos = videos.filter(video =>
      new Date(video.publishedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );

    let trend: 'Rising' | 'Stable' | 'Declining' = 'Stable';
    const recentRatio = recentVideos.length / videos.length;
    if (recentRatio > 0.3) trend = 'Rising';
    else if (recentRatio < 0.1) trend = 'Declining';

    // Generate related keywords — use only actual tag phrases, not individual title words
    // Single words from titles are too noisy and not useful as keyword suggestions
    const allTags = videos.flatMap(video => video.tags);
    const keywordLowerForRelated = keyword.toLowerCase();

    const relatedKeywords = Array.from(new Set(
      allTags
        .map(tag => tag.trim())
        .filter(tag => {
          const tl = tag.toLowerCase();
          return (
            tl !== keywordLowerForRelated &&          // not the searched keyword itself
            tag.length > 4 &&                         // skip very short tags
            tag.length < 50 &&                        // skip overly long tags
            tl.split(' ').length >= 2 &&              // phrase-level only (2+ words)
            !tl.includes(keywordLowerForRelated)      // exclude tags that are just the keyword + noise
          );
        })
    )).slice(0, 12);

    // Top channels analysis
    const channelCount = videos.reduce((acc, video) => {
      acc[video.channelId] = (acc[video.channelId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topChannels = Object.entries(channelCount)
      .sort(([, a], [, b]) => b - a)
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

    // Enhanced recommendations with color-coded ratings
    const recommendations: Recommendation[] = [
      {
        metric: 'Tag Quality Score',
        value: `${tagScore}/100`,
        rating: (tagScore >= 70 ? 'excellent' : tagScore >= 50 ? 'good' : tagScore >= 30 ? 'fair' : 'poor') as 'excellent' | 'good' | 'fair' | 'poor',
        action: generatePerformanceDescription(tagScore)
      },
      {
        metric: 'Search Volume',
        value: `${searchVolume.label} (${searchVolume.score}/100)`,
        rating: (searchVolume.score >= 70 ? 'excellent' : searchVolume.score >= 50 ? 'good' : searchVolume.score >= 30 ? 'fair' : 'poor') as 'excellent' | 'good' | 'fair' | 'poor',
        action: searchVolume.score > 60 ? 'High demand market - capitalize on search traffic' : 'Niche opportunity - less competition'
      },
      {
        metric: 'Competition Level',
        value: `${competitiveness.label} (${competitiveness.score}/100)`,
        rating: (competitiveness.score < 40 ? 'excellent' : competitiveness.score < 60 ? 'good' : competitiveness.score < 75 ? 'fair' : 'poor') as 'excellent' | 'good' | 'fair' | 'poor',
        action: competitiveness.score < 40 ? 'Good opportunity to rank - lower competition' : 'Requires strong content strategy and optimization'
      },
      {
        metric: 'Engagement Rate',
        value: `${engagementRate}%`,
        rating: (engagementRate > 3 ? 'excellent' : engagementRate > 2 ? 'good' : engagementRate > 1 ? 'fair' : 'poor') as 'excellent' | 'good' | 'fair' | 'poor',
        action: engagementRate > 3 ? 'Above average engagement - create compelling content' : 'Focus on improving thumbnails and titles for better engagement'
      },
      {
        metric: 'Title Optimization',
        value: `${keywordInTitlePercentage}% use exact keyword`,
        // Low saturation = fewer competitors have optimized for this exact phrase = more opportunity
        rating: (keywordInTitlePercentage < 30 ? 'excellent' : keywordInTitlePercentage < 55 ? 'good' : keywordInTitlePercentage < 75 ? 'fair' : 'poor') as 'excellent' | 'good' | 'fair' | 'poor',
        action: keywordInTitlePercentage < 30
          ? 'Hidden gem — few competitors use this exact phrase. Include it in your title for a ranking edge.'
          : keywordInTitlePercentage < 75
          ? 'Moderately competitive title space. Use the exact keyword phrase + a strong hook.'
          : 'Highly saturated — most competitors already use this phrase. Differentiate with a unique angle or long-tail variation.'
      },
      {
        metric: 'Optimal Upload Time',
        value: optimalTime,
        rating: 'info' as const,
        action: 'Schedule uploads during this time for maximum visibility'
      },
      {
        metric: 'Target Video Length',
        value: `${Math.floor(averageLength / 60)}:${(averageLength % 60).toString().padStart(2, '0')}`,
        rating: 'info' as const,
        action: 'Match this length for better performance in search results'
      }
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
      topVideos: videos.slice(0, 10), // Show top 10 most relevant videos
      uploadTimeDistribution,
      insights: {
        averageViews,
        averageViewCount: formatViewCount(averageViews),
        viewsPerDay, // Now a whole number
        averageLength,
        bestUploadDays,
        bestUploadTimes,
        topChannels,
        totalResults: videos.length,
        newVideosLastWeek: lastWeekVideos.length,
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

    if (KW_API_KEYS.length === 0) {
      setError('No API keys configured for the Keyword Analyzer.');
      setIsAnalyzing(false);
      return;
    }

    let lastError: string = '';

    for (let attempt = 0; attempt < KW_API_KEYS.length; attempt++) {
      const idx = (kwKeyIndexRef.current + attempt) % KW_API_KEYS.length;
      const key = KW_API_KEYS[idx];

      try {
        const videos = await fetchYouTubeData(searchTerm, key);

        if (videos.length === 0) {
          throw new Error('No videos found for this keyword');
        }

        const analysis = analyzeKeywordData(videos, searchTerm);
        kwKeyIndexRef.current = idx; // remember the working key
        saveToHistory(searchTerm);
        setResults(analysis);
        setShowResults(true);
        setIsAnalyzing(false);
        return;
      } catch (err) {
        const msg = err instanceof Error ? err.message : '';
        if (msg === '__QUOTA_EXHAUSTED__') {
          // rotate to the next key and retry
          kwKeyIndexRef.current = (idx + 1) % KW_API_KEYS.length;
          lastError = 'quota';
          continue;
        }
        // non-quota error — surface immediately
        console.error('Error analyzing keyword:', err);
        setError(msg || 'Failed to analyze keyword. Please try again.');
        setIsAnalyzing(false);
        return;
      }
    }

    // All keys exhausted
    setError('The Keyword Analyzer is on cooldown — all API keys are exhausted. Try again tomorrow.');
    setIsAnalyzing(false);
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
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1700);
    const [isIntegrated, setIsIntegrated] = useState(false);

    useEffect(() => {
      const handleResize = () => setIsMobile(window.innerWidth <= 1700);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
      // Check if this chart is inside an integrated container
      const chartElement = document.querySelector('.integrated');
      setIsIntegrated(!!chartElement);
    }, []);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const hours = Array.from({ length: 24 }, (_, i) => i);

    const getHeatmapItem = (day: string, hour: number) => {
      return data.find(d => d.day === day && d.hour === hour) || null;
    };

    // Relative performance scale: color intensity based on views/day vs dataset max
    const maxAvgViews = Math.max(...data.map(d => d.avgViews), 1);

    const getHeatColor = (item: ReturnType<typeof getHeatmapItem>) => {
      if (!item || item.count === 0) return '#1a1a1a'; // empty
      const ratio = item.avgViews / maxAvgViews;
      if (ratio >= 0.66) return '#d73527'; // top third — most active/performing
      if (ratio >= 0.33) return '#fac11b'; // middle third
      return '#28a745';                    // bottom third — least active
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
        const slotsWithData = data.filter(item => slot.hours.includes(item.hour));
        const totalUploads = slotsWithData.reduce((sum, item) => sum + item.count, 0);
        // Divide only by slots that have data, not total hours in the window
        const avgViews = slotsWithData.length > 0
          ? slotsWithData.reduce((sum, item) => sum + item.avgViews, 0) / slotsWithData.length
          : 0;

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
              Upload frequency by day & hour — hover cells for views/day detail
            </S.ChartSubtitle>
          </>
        )}

        {isIntegrated && (
          <S.ChartSubtitle style={{ fontSize: '0.8rem', marginBottom: '1rem', opacity: 0.8 }}>
            Upload frequency by day & hour — hover cells for views/day detail
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
                    color={
                      slot.totalUploads === 0 ? '#1a1a1a' :
                      slot.intensity >= 0.66 ? '#d73527' :
                      slot.intensity >= 0.33 ? '#fac11b' : '#28a745'
                    }
                  />
                </S.MobileSummaryProgress>
                <S.MobileSummaryStats>
                  <span>{slot.totalUploads} uploads</span>
                  <span>{formatViewCount(slot.avgViews)} views/day avg</span>
                </S.MobileSummaryStats>
              </S.MobileSummaryBar>
            ))}
          </S.MobileSummaryContainer>
        ) : (
          <S.HeatmapContainer style={isIntegrated ? { transform: 'scale(1)' } : {}}>
            <S.HourLabels>
              {hours.filter((_, index) => index % 4 === 0).map(hour => {
                // Calculate the position: 60px offset + (hour * cellWidth + gap)
                const cellWidth = 15; // matches HeatmapCell width
                const gap = 2; // matches grid gap
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
                      const item = getHeatmapItem(day, hour);
                      const label = item
                        ? `${day} ${hour.toString().padStart(2, '0')}:00 — ${item.count} video${item.count !== 1 ? 's' : ''}, ${formatViewCount(item.avgViews)} views/day avg`
                        : `${day} ${hour.toString().padStart(2, '0')}:00 — no uploads`;
                      return (
                        <S.HeatmapCell
                          key={`${day}-${hour}`}
                          color={getHeatColor(item)}
                          data-tooltip={label}
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
          <span>Lower activity</span>
          <S.LegendGradient />
          <span>Higher activity</span>
        </S.HeatmapLegend>

      </S.UploadTimeChart>
    );
  };

  const seoConfig = toolsSEO['keyword-analyzer'];
  const schemaData = generateToolSchema('keyword-analyzer', seoConfig);


  return (
    <>
      <SEO
        title={seoConfig.title}
        description={seoConfig.description}
        keywords={seoConfig.keywords}
        canonical="https://youtool.io/tools/keyword-analyzer"
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

        {/* Educational Content Section */}
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
                <S.DetailedMetricValue>{results.insights.viewsPerDay.toLocaleString()}</S.DetailedMetricValue>
              </S.MetricCard>

              <S.MetricCard>
                <S.MetricLabel>Engagement Rate</S.MetricLabel>
                <S.DetailedMetricValue>{results.insights.engagementRate}%</S.DetailedMetricValue>
              </S.MetricCard>

              <S.MetricCard>
                <S.MetricLabel>Videos Analyzed</S.MetricLabel>
                <S.DetailedMetricValue>{results.insights.totalResults}</S.DetailedMetricValue>
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
                  <S.RecommendationCard key={index} rating={recommendation.rating}>
                    <S.RecommendationHeader>
                      <S.RecommendationMetric>{recommendation.metric}</S.RecommendationMetric>
                      <S.RecommendationRating rating={recommendation.rating}>
                        {recommendation.rating === 'excellent' ? '🟢 Excellent' :
                         recommendation.rating === 'good' ? '🟡 Good' :
                         recommendation.rating === 'fair' ? '🟠 Fair' :
                         recommendation.rating === 'poor' ? '🔴 Poor' : 'ℹ️ Info'}
                      </S.RecommendationRating>
                    </S.RecommendationHeader>
                    <S.RecommendationValue>{recommendation.value}</S.RecommendationValue>
                    <S.RecommendationAction>{recommendation.action}</S.RecommendationAction>
                  </S.RecommendationCard>
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
                      title="Watch on YouTube"
                    >
                      <i className="bx bx-play"></i>
                    </S.VideoAction>
                  </S.VideoCard>
                ))}
              </S.VideosList>
            </S.TopVideosSection>
          </S.ResultsContainer>
        )}
      </S.MainContainer>
    </S.PageWrapper>
    </>
  );
};

export default KeywordAnalyzer;