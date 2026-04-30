// src/pages/Tools/components/TagGenerator/TagGenerator.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SEO } from '../../../../components/SEO';import { toolsSEO, generateToolSchema } from '../../../../config/toolsSEO';
import * as S from './styles';

interface VideoDetails {
  snippet: {
    title: string;
    description: string;
    tags?: string[];
    channelTitle: string;
    publishedAt: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
  };
  statistics: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
}

interface TagAnalysis {
  tag: string;
  score: number;
  frequency: number;
  category: string;
  relevanceScore: number;
}

interface GeneratedTags {
  highPerformance: string[];
  trending: string[];
  niche: string[];
  longtail: string[];
  suggested: string[];
}

interface TagStats {
  totalTags: number;
  avgPerformanceScore: number;
  topCategories: string[];
  estimatedReach: number;
}

const decodeHtml = (html: string): string => {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
};

// Expanded blocklist — prevents generic noise from polluting every category
const GENERIC_TAGS = new Set([
  'video', 'youtube', 'new', 'best', 'top', 'like', 'subscribe', 'comment', 'share',
  'watch', 'channel', 'official', 'vlog', 'viral', 'trending', 'shorts',
  'funny', 'lol', 'omg', 'wow', 'amazing', 'awesome', 'great', 'good', 'cool',
  'free', 'online', 'live', 'stream', 'streaming', 'today', 'part', 'full',
  '2023', '2024', '2025', '2026', 'ft', 'feat', 'vs', 'ep'
]);

// Rate limit: max 5 queries per 2-minute window, stored per browser in localStorage
const RATE_LIMIT_KEY = 'tag-generator-rl';
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 2 * 60 * 1000; // 2 minutes

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
    // Oldest timestamp in the window — user can retry once it falls out
    const retryInMs = timestamps[0] + RATE_LIMIT_WINDOW_MS - now;
    return { allowed: false, retryInMs: Math.max(retryInMs, 0) };
  }

  timestamps.push(now);
  try {
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(timestamps));
  } catch {
    // localStorage full or unavailable — allow the query anyway
  }
  return { allowed: true, retryInMs: 0 };
}

export const TagGenerator: React.FC = () => {
  const { searchTitle } = useParams<{ searchTitle: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedTags, setGeneratedTags] = useState<GeneratedTags | null>(null);
  const [tagStats, setTagStats] = useState<TagStats | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  const [analysisMode, setAnalysisMode] = useState<'basic' | 'advanced'>('advanced');
  const [targetAudience, setTargetAudience] = useState<'general' | 'gaming' | 'education' | 'entertainment' | 'tech'>('general');
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Tool configuration
  const toolConfig = {
    name: 'Tag Generator',
    description: 'Generate high-performing YouTube tags with advanced AI analysis to boost your video discoverability',
    image: 'https://64.media.tumblr.com/276a73213e38fa7b326758ee7f115ed6/0e01452f9f6dd974-35/s2048x3072/a99f9ebfb857f86f0b720517850972aff27712c1.jpg',
    icon: 'bx bx-purchase-tag-alt',
    features: [
      'AI-powered tag suggestions',
      'Performance analytics',
      'Trending keyword detection'
    ]
  };

  useEffect(() => {
    if (searchTitle) {
      const decodedTitle = decodeURIComponent(searchTitle);
      setSearchTerm(decodedTitle);
      handleAnalyze(decodedTitle);
    }
  }, [searchTitle]);

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      alert('Please enter a video title or topic');
      return;
    }

    const encodedTitle = encodeURIComponent(searchTerm);
    navigate(`/tools/tag-generator/${encodedTitle}`);
  };

  const handleAnalyze = async (title: string) => {
    if (!title.trim()) {
      alert('Please enter a video title or topic');
      return;
    }

    // Client-side rate limit check
    const { allowed, retryInMs } = checkAndRecordQuery();
    if (!allowed) {
      const seconds = Math.ceil(retryInMs / 1000);
      setRateLimitError(
        `You've made several searches in quick succession. Please wait ${seconds}s before trying again.`
      );
      // Auto-clear the message once the window expires
      setTimeout(() => setRateLimitError(null), retryInMs);
      return;
    }

    setRateLimitError(null);
    setApiError(null);
    setIsLoading(true);
    setShowResults(false);

    try {
      const results = await generateAdvancedTags(title);
      setGeneratedTags(results.tags);
      setTagStats(results.stats);
      setShowResults(true);
    } catch (error) {
      console.error('Error generating tags:', error);
      const msg = error instanceof Error ? error.message : '';
      if (msg.toLowerCase().includes('quota')) {
        setApiError('The Tag Generator is on cooldown — YouTube API quota exceeded. Try again tomorrow.');
      } else {
        setApiError(msg || 'Failed to generate tags. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const generateAdvancedTags = async (searchTerm: string) => {
    const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
    if (!API_KEY) throw new Error('YouTube API key not configured');

    // 3 parallel searches: relevance gives broad coverage, viewCount gives tags from
    // best-performing videos, date gives fresh/trending content. All 50 results each.
    const orders = ['relevance', 'viewCount', 'date'];
    const settled = await Promise.allSettled(
      orders.map(order =>
        fetch(
          `https://www.googleapis.com/youtube/v3/search?` +
          `key=${API_KEY}&` +
          `q=${encodeURIComponent(searchTerm)}&` +
          `part=snippet&type=video&maxResults=50&order=${order}`
        ).then(r => r.json())
      )
    );

    // Deduplicate by videoId — same video can appear in multiple orderings
    const seen = new Set<string>();
    const allSearchItems: any[] = [];
    for (const result of settled) {
      if (result.status === 'fulfilled' && !result.value.error) {
        for (const item of result.value.items || []) {
          if (!seen.has(item.id.videoId)) {
            seen.add(item.id.videoId);
            allSearchItems.push(item);
          }
        }
      }
    }

    if (!allSearchItems.length) throw new Error('No videos found for this topic');

    // Batch-fetch video details (50 IDs per request)
    const allVideoDetails: VideoDetails[] = [];
    for (let i = 0; i < allSearchItems.length; i += 50) {
      const batch = allSearchItems.slice(i, i + 50);
      const ids = batch.map((v: any) => v.id.videoId).join(',');
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&part=snippet,statistics&id=${ids}`
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      allVideoDetails.push(...(data.items || []));
    }

    // Analyze tags from all unique videos — decode HTML entities in tags
    const allTagAnalysis: TagAnalysis[] = [];
    allVideoDetails.forEach(video => {
      const videoTags = (video.snippet.tags || []).map(decodeHtml);
      videoTags.forEach(tag => {
        const analysis = analyzeTag(tag, video, searchTerm);
        if (analysis.score > 0) allTagAnalysis.push(analysis);
      });
    });

    return categorizeAndRankTags(allTagAnalysis, allVideoDetails, searchTerm);
  };

  const analyzeTag = (tag: string, video: VideoDetails, searchTerm: string): TagAnalysis => {
    const lowercaseTag = tag.toLowerCase();
    const lowercaseTitle = video.snippet.title.toLowerCase();
    const lowercaseDescription = video.snippet.description.toLowerCase();
    const lowercaseSearchTerm = searchTerm.toLowerCase();
    const searchWords = lowercaseSearchTerm.split(' ').filter(w => w.length > 2);

    let score = 0;
    let relevanceScore = 0;

    // Filter out generic/irrelevant tags using expanded blocklist
    if (GENERIC_TAGS.has(lowercaseTag)) {
      return { tag, score: 0, frequency: 1, category: 'general', relevanceScore: 0 };
    }

    // Exact search term match (HIGHEST priority)
    if (lowercaseTag === lowercaseSearchTerm) {
      score += 20;
      relevanceScore += 10;
    }

    // Search term contained in tag
    if (lowercaseTag.includes(lowercaseSearchTerm)) {
      score += 15;
      relevanceScore += 8;
    }

    // Tag contains search term
    if (lowercaseSearchTerm.includes(lowercaseTag) && lowercaseTag.length > 3) {
      score += 12;
      relevanceScore += 6;
    }

    // Partial word matching from search term
    let wordMatches = 0;
    searchWords.forEach(word => {
      if (lowercaseTag.includes(word)) {
        wordMatches++;
        score += 3;
        relevanceScore += 1;
      }
    });

    // Bonus for multiple word matches
    if (wordMatches >= 2) {
      score += 5;
      relevanceScore += 3;
    }

    // Title relevance
    if (lowercaseTitle.includes(lowercaseTag)) {
      score += 8;
      relevanceScore += 4;
    }

    // Description relevance (lower weight)
    if (lowercaseDescription.includes(lowercaseTag)) {
      score += 3;
      relevanceScore += 1;
    }

    // Tag length optimization (prefer 2-4 word phrases)
    const wordCount = tag.split(' ').length;
    if (wordCount >= 2 && wordCount <= 4) {
      score += 4;
    } else if (wordCount === 1 && tag.length >= 4) {
      score += 2;
    } else if (wordCount > 4) {
      score -= 1; // Penalize overly long tags
    }

    // Performance metrics
    const viewCount = parseInt(video.statistics.viewCount || '0');
    const likeCount = parseInt(video.statistics.likeCount || '0');
    const commentCount = parseInt(video.statistics.commentCount || '0');

    if (viewCount > 0) {
      score += Math.min(Math.log10(viewCount), 5);
    }

    const engagementRate = (likeCount + commentCount) / Math.max(viewCount, 1);
    if (engagementRate > 0.03) {
      score += 3;
    } else if (engagementRate > 0.02) {
      score += 2;
    }

    // Recency bonus (higher bonus for very recent videos)
    const publishDate = new Date(video.snippet.publishedAt);
    const daysSincePublish = (Date.now() - publishDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSincePublish < 7) {
      score += 3;
    } else if (daysSincePublish < 30) {
      score += 2;
    } else if (daysSincePublish < 90) {
      score += 1;
    }

    const category = categorizeTag(tag);

    return {
      tag,
      score,
      frequency: 1,
      category,
      relevanceScore
    };
  };

  const categorizeTag = (tag: string): string => {
    const lowercaseTag = tag.toLowerCase();

    if (lowercaseTag.includes('tutorial') || lowercaseTag.includes('how to') || lowercaseTag.includes('guide')) {
      return 'educational';
    }
    if (lowercaseTag.includes('funny') || lowercaseTag.includes('comedy') || lowercaseTag.includes('meme')) {
      return 'entertainment';
    }
    if (lowercaseTag.includes('game') || lowercaseTag.includes('gaming') || lowercaseTag.includes('play')) {
      return 'gaming';
    }
    if (lowercaseTag.includes('tech') || lowercaseTag.includes('review') || lowercaseTag.includes('unbox')) {
      return 'technology';
    }
    if (lowercaseTag.includes('music') || lowercaseTag.includes('song') || lowercaseTag.includes('cover')) {
      return 'music';
    }

    return 'general';
  };

  const categorizeAndRankTags = (tagAnalysis: TagAnalysis[], videos: VideoDetails[], searchTerm: string) => {
    // Consolidate duplicate tags
    const tagMap = new Map<string, TagAnalysis>();

    tagAnalysis.forEach(analysis => {
      const existing = tagMap.get(analysis.tag.toLowerCase());
      if (existing) {
        existing.score += analysis.score;
        existing.frequency += 1;
        existing.relevanceScore += analysis.relevanceScore;
      } else {
        tagMap.set(analysis.tag.toLowerCase(), { ...analysis });
      }
    });

    const consolidatedTags = Array.from(tagMap.values())
      .filter(tag => tag.tag.length > 2 && tag.tag.length < 50)
      .sort((a, b) => b.score - a.score);

    // Categorize tags — thresholds scaled for ~150-video pool
    const highPerformance = consolidatedTags
      .filter(tag => tag.score >= 20 && tag.frequency >= 3)
      .slice(0, 10)
      .map(tag => tag.tag);

    const trending = consolidatedTags
      .filter(tag => tag.relevanceScore >= 10 && tag.frequency >= 4)
      .slice(0, 15)
      .map(tag => tag.tag);

    const niche = consolidatedTags
      .filter(tag => tag.frequency <= 3 && tag.score >= 10)
      .slice(0, 20)
      .map(tag => tag.tag);

    const longtail = consolidatedTags
      .filter(tag => tag.tag.split(' ').length >= 3)
      .slice(0, 15)
      .map(tag => tag.tag);

    // Generate additional suggested tags
    const suggested = generateSuggestedTags(searchTerm, consolidatedTags);

    // Remove duplicates across categories
    const allUsedTags = new Set([...highPerformance, ...trending, ...niche, ...longtail]);
    const uniqueSuggested = suggested.filter(tag => !allUsedTags.has(tag)).slice(0, 10);

    const stats: TagStats = {
      totalTags: consolidatedTags.length,
      avgPerformanceScore: consolidatedTags.reduce((sum, tag) => sum + tag.score, 0) / consolidatedTags.length,
      topCategories: getTopCategories(consolidatedTags),
      estimatedReach: calculateEstimatedReach(videos)
    };

    return {
      tags: {
        highPerformance,
        trending,
        niche,
        longtail,
        suggested: uniqueSuggested
      },
      stats
    };
  };

  const generateSuggestedTags = (searchTerm: string, existingTags: TagAnalysis[]): string[] => {
    const termWords = new Set(searchTerm.toLowerCase().split(' ').filter(w => w.length > 2));
    const existingSet = new Set(existingTags.map(t => t.tag.toLowerCase()));

    // Extract modifier words that actually appear in top-performing tags for this niche.
    // This gives data-driven suggestions instead of hardcoded templates.
    const modifierFreq = new Map<string, number>();
    existingTags.slice(0, 40).forEach(({ tag }) => {
      tag.toLowerCase().split(' ').forEach(word => {
        if (word.length > 3 && !termWords.has(word) && !GENERIC_TAGS.has(word)) {
          modifierFreq.set(word, (modifierFreq.get(word) || 0) + 1);
        }
      });
    });

    const topModifiers = Array.from(modifierFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);

    const suggestions: string[] = [];
    topModifiers.forEach(mod => {
      const fwd = `${searchTerm} ${mod}`;
      const rev = `${mod} ${searchTerm}`;
      if (!existingSet.has(fwd.toLowerCase())) suggestions.push(fwd);
      if (mod.length > 4 && !existingSet.has(rev.toLowerCase())) suggestions.push(rev);
    });

    // Audience-specific suggestions (still useful when set)
    if (targetAudience !== 'general') {
      const audFwd = `${searchTerm} for ${targetAudience}`;
      const audRev = `${targetAudience} ${searchTerm}`;
      if (!existingSet.has(audFwd.toLowerCase())) suggestions.push(audFwd);
      if (!existingSet.has(audRev.toLowerCase())) suggestions.push(audRev);
    }

    return suggestions;
  };

  const getTopCategories = (tags: TagAnalysis[]): string[] => {
    const categoryCount = new Map<string, number>();

    tags.forEach(tag => {
      const count = categoryCount.get(tag.category) || 0;
      categoryCount.set(tag.category, count + 1);
    });

    return Array.from(categoryCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0]);
  };

  const calculateEstimatedReach = (videos: VideoDetails[]): number => {
    const totalViews = videos.reduce((sum, video) =>
      sum + parseInt(video.statistics.viewCount || '0'), 0
    );
    return Math.floor(totalViews / videos.length);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const selectAllFromCategory = (categoryTags: string[]) => {
    setSelectedTags(prev => {
      const newTags = [...prev];
      categoryTags.forEach(tag => {
        if (!newTags.includes(tag)) {
          newTags.push(tag);
        }
      });
      return newTags;
    });
  };

  const handleCopyTags = (format: 'comma' | 'line' | 'quote' | 'hashtag' = 'comma') => {
    if (selectedTags.length === 0) {
      alert('Please select some tags first');
      return;
    }

    let formattedTags = '';
    switch (format) {
      case 'comma':
        formattedTags = selectedTags.join(', ');
        break;
      case 'line':
        formattedTags = selectedTags.join('\n');
        break;
      case 'quote':
        formattedTags = selectedTags.map(tag => `"${tag}"`).join(', ');
        break;
      case 'hashtag':
        formattedTags = selectedTags.map(tag => `#${tag.replace(/\s+/g, '')}`).join(' ');
        break;
    }

    navigator.clipboard.writeText(formattedTags).then(() => {
      setCopySuccess(format);
      setTimeout(() => setCopySuccess(''), 2000);
    });
  };

  const handleClear = () => {
    setSelectedTags([]);
    setGeneratedTags(null);
    setTagStats(null);
    setSearchTerm('');
    setShowResults(false);
    navigate('/tools/tag-generator');
  };

  const seoConfig = toolsSEO['tag-generator'];
  const schemaData = generateToolSchema('tag-generator', seoConfig);

  return (
    <>
      <SEO
        title={seoConfig.title}
        description={seoConfig.description}
        keywords={seoConfig.keywords}
        canonical="https://youtool.io/tools/tag-generator"
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
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Enter your video title or main topic..."
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

              {/* Rate limit warning */}
              {rateLimitError && (
                <div style={{
                  marginTop: '0.75rem',
                  padding: '0.6rem 1rem',
                  background: 'rgba(185, 28, 28, 0.15)',
                  border: '1px solid rgba(185, 28, 28, 0.4)',
                  borderRadius: '8px',
                  color: '#fca5a5',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
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

              {/* Toggle Buttons in Header */}
              <S.ControlsContainer>
                <S.ToggleButton
                  onClick={() => setShowFilters(!showFilters)}
                  className={showFilters ? 'active' : ''}
                >
                  <i className="bx bx-cog"></i>
                  Advanced Settings
                </S.ToggleButton>
              </S.ControlsContainer>
            </S.HeaderTextContent>
          </S.HeaderContent>
        </S.EnhancedHeader>
        {showFilters && (
          <S.FiltersContainer>
            <S.FilterGrid>
              <S.FilterGroup>
                <S.FilterLabel>Analysis Mode</S.FilterLabel>
                <S.FilterSelect
                  value={analysisMode}
                  onChange={(e) => setAnalysisMode(e.target.value as 'basic' | 'advanced')}
                >
                  <option value="basic">Basic Analysis</option>
                  <option value="advanced">Advanced Analysis</option>
                </S.FilterSelect>
              </S.FilterGroup>

              <S.FilterGroup>
                <S.FilterLabel>Target Audience</S.FilterLabel>
                <S.FilterSelect
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as any)}
                >
                  <option value="general">General</option>
                  <option value="gaming">Gaming</option>
                  <option value="education">Education</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="tech">Technology</option>
                </S.FilterSelect>
              </S.FilterGroup>

              <S.FilterGroup>
                <S.FilterLabel>Search Depth</S.FilterLabel>
                <S.FilterSelect
                  value={analysisMode === 'advanced' ? 'deep' : 'standard'}
                  onChange={(e) => setAnalysisMode(e.target.value === 'deep' ? 'advanced' : 'basic')}
                >
                  <option value="standard">Standard (Faster)</option>
                  <option value="deep">Deep Analysis (More Tags)</option>
                </S.FilterSelect>
              </S.FilterGroup>

              <S.FilterGroup>
                <S.FilterLabel>Tag Quality</S.FilterLabel>
                <S.FilterSelect defaultValue="balanced">
                  <option value="high">High Quality Only</option>
                  <option value="balanced">Balanced Mix</option>
                  <option value="volume">Maximum Volume</option>
                </S.FilterSelect>
              </S.FilterGroup>
            </S.FilterGrid>
          </S.FiltersContainer>
        )}

        {/* Educational Content Section */}
        {!showResults && (
          <S.EducationalSection>

            <S.EducationalContent>
              <S.SectionSubTitle>What This Tool Does</S.SectionSubTitle>
              <S.EducationalText>
                The YouTube Tag Generator takes your video title or topic and produces an optimized set of tags designed to improve discoverability in YouTube search. It analyzes your input phrase, expands it into related keyword variations, broad category terms, and long-tail phrases, then balances them by relevance and estimated search value. The output is a ready-to-use tag set you can paste directly into YouTube Studio.
              </S.EducationalText>
              <S.EducationalText>
                YouTube allows up to 500 characters of tags per video. This tool generates a balanced mix of broad tags (high volume, high competition), mid-tail tags (moderate volume and competition), and long-tail tags (lower volume, higher relevance) — the combination that typically produces the best discoverability outcomes.
              </S.EducationalText>
            </S.EducationalContent>

            <S.EducationalContent>
              <S.SectionSubTitle>How to Use the Tag Generator</S.SectionSubTitle>
              <S.StepByStep>
                <S.StepItem>
                  <S.StepNumberCircle>1</S.StepNumberCircle>
                  <S.StepContent>
                    <S.StepTitle>Enter Your Video Title or Topic</S.StepTitle>
                    <S.EducationalText>
                      Type or paste your planned video title or main topic. The more specific, the better — "beginner guitar lessons" produces more targeted results than just "guitar". You can also paste an existing title to generate tags for a video you've already uploaded.
                    </S.EducationalText>
                  </S.StepContent>
                </S.StepItem>
                <S.StepItem>
                  <S.StepNumberCircle>2</S.StepNumberCircle>
                  <S.StepContent>
                    <S.StepTitle>Review and Select Your Tags</S.StepTitle>
                    <S.EducationalText>
                      The generator returns tags organized by type. Remove any that aren't relevant to your specific video — irrelevant tags can confuse YouTube's classification and push your video to the wrong audience. Keep only tags a viewer would reasonably search.
                    </S.EducationalText>
                  </S.StepContent>
                </S.StepItem>
                <S.StepItem>
                  <S.StepNumberCircle>3</S.StepNumberCircle>
                  <S.StepContent>
                    <S.StepTitle>Copy and Paste into YouTube Studio</S.StepTitle>
                    <S.EducationalText>
                      Click "Copy All Tags" to copy the complete set to your clipboard, then paste into the Tags field in YouTube Studio. Tags are comma-separated — no quotes needed around multi-word tags.
                    </S.EducationalText>
                  </S.StepContent>
                </S.StepItem>
              </S.StepByStep>
            </S.EducationalContent>

            <S.EducationalContent>
              <S.SectionSubTitle>Tag Best Practices</S.SectionSubTitle>
              <S.MetricCardsGrid>
                <S.MetricInfoCard>
                  <S.MetricInfoHeader>
                    <i className="bx bx-first-page"></i>
                    <S.MetricInfoTitle>Lead with Your Best Keyword</S.MetricInfoTitle>
                  </S.MetricInfoHeader>
                  <S.MetricInfoText>
                    YouTube weights the first tag more heavily than the rest. Always lead with your primary target keyword — the exact phrase a viewer would type to find your video.
                  </S.MetricInfoText>
                </S.MetricInfoCard>
                <S.MetricInfoCard>
                  <S.MetricInfoHeader>
                    <i className="bx bx-slider-alt"></i>
                    <S.MetricInfoTitle>Use 10–20 Tags</S.MetricInfoTitle>
                  </S.MetricInfoHeader>
                  <S.MetricInfoText>
                    Quality beats volume. Videos with 10–20 well-chosen tags typically outperform those with 30+ loosely related ones. There's no benefit to padding with irrelevant terms.
                  </S.MetricInfoText>
                </S.MetricInfoCard>
                <S.MetricInfoCard>
                  <S.MetricInfoHeader>
                    <i className="bx bx-link-alt"></i>
                    <S.MetricInfoTitle>Mirror Your Title and Description</S.MetricInfoTitle>
                  </S.MetricInfoHeader>
                  <S.MetricInfoText>
                    Tags that repeat keywords from your title and description reinforce those signals. Tags for topics not mentioned elsewhere in your metadata are weaker discovery signals.
                  </S.MetricInfoText>
                </S.MetricInfoCard>
                <S.MetricInfoCard>
                  <S.MetricInfoHeader>
                    <i className="bx bx-user-check"></i>
                    <S.MetricInfoTitle>Include Your Channel Name</S.MetricInfoTitle>
                  </S.MetricInfoHeader>
                  <S.MetricInfoText>
                    Adding your channel name as a tag helps your other videos surface as recommendations when viewers are watching any of your content.
                  </S.MetricInfoText>
                </S.MetricInfoCard>
              </S.MetricCardsGrid>
            </S.EducationalContent>

            <S.EducationalContent>
              <S.SectionSubTitle>Common Use Cases</S.SectionSubTitle>
              <S.UseCaseGrid>
                <S.UseCaseCard>
                  <S.UseCaseTitle>New Video Upload</S.UseCaseTitle>
                  <S.UseCaseText>
                    Generate a full tag set before publishing. Input your planned title to get broad, mid-tail, and long-tail tags you can paste directly into YouTube Studio without any additional research.
                  </S.UseCaseText>
                </S.UseCaseCard>
                <S.UseCaseCard>
                  <S.UseCaseTitle>Re-optimize Old Videos</S.UseCaseTitle>
                  <S.UseCaseText>
                    Paste the title of an underperforming video to generate a fresh, optimized tag set. Updating tags on existing videos can still improve search ranking and recommendation targeting.
                  </S.UseCaseText>
                </S.UseCaseCard>
                <S.UseCaseCard>
                  <S.UseCaseTitle>Competitor Tag Research</S.UseCaseTitle>
                  <S.UseCaseText>
                    Enter a competitor's video title to see what tag angles they might be targeting. Use the Video Analyzer alongside this tool to compare your tag coverage against theirs.
                  </S.UseCaseText>
                </S.UseCaseCard>
              </S.UseCaseGrid>
            </S.EducationalContent>

            <S.EducationalContent>
              <S.SectionSubTitle>Frequently Asked Questions</S.SectionSubTitle>
              <S.FAQList>
                <S.FAQItem>
                  <S.FAQQuestion>Do YouTube tags still matter in 2025?</S.FAQQuestion>
                  <S.FAQAnswer>Yes, though their role has evolved. Tags help YouTube confirm what your video is about and improve recommendation targeting. They're less important than title and description for search ranking, but the first tag carries meaningful weight and the full set is worth optimizing.</S.FAQAnswer>
                </S.FAQItem>
                <S.FAQItem>
                  <S.FAQQuestion>Should I use broad or specific tags?</S.FAQQuestion>
                  <S.FAQAnswer>Both. A balanced set includes 2–3 broad terms (e.g. "guitar"), 5–8 mid-tail terms (e.g. "guitar lessons for beginners"), and 5–8 long-tail terms (e.g. "how to play guitar for complete beginners at home"). This covers both broad discovery and specific search queries.</S.FAQAnswer>
                </S.FAQItem>
                <S.FAQItem>
                  <S.FAQQuestion>Can I use the same tags on every video?</S.FAQQuestion>
                  <S.FAQAnswer>Only for tags that genuinely apply to every video — like your channel name or core niche category. Using identical tags across all uploads doesn't help individual videos rank for their specific topics.</S.FAQAnswer>
                </S.FAQItem>
                <S.FAQItem>
                  <S.FAQQuestion>Can I copy the tags directly into YouTube Studio?</S.FAQQuestion>
                  <S.FAQAnswer>Yes. Click the copy button to get a comma-separated list that pastes directly into the Tags field in YouTube Studio's video details editor — no formatting adjustments needed.</S.FAQAnswer>
                </S.FAQItem>
                <S.FAQItem>
                  <S.FAQQuestion>Are these tags guaranteed to improve views?</S.FAQQuestion>
                  <S.FAQAnswer>Tags are one signal among many. They help YouTube understand your topic but are less influential than title, description, and click-through rate. Use the Tag Generator alongside the Video Analyzer for a complete SEO approach.</S.FAQAnswer>
                </S.FAQItem>
              </S.FAQList>
            </S.EducationalContent>

            <S.EducationalContent>
              <S.SectionSubTitle>Related Tools</S.SectionSubTitle>
              <S.RelatedToolsGrid>
                <S.RelatedToolCard onClick={() => navigate('/tools/keyword-analyzer')}>
                  <S.RelatedToolIconWrap><i className="bx bx-search-alt"></i></S.RelatedToolIconWrap>
                  <S.RelatedToolName>Keyword Analyzer</S.RelatedToolName>
                  <S.RelatedToolDesc>Research individual keywords for competition and search volume before choosing your primary tag.</S.RelatedToolDesc>
                  <S.RelatedToolLaunchBtn><i className="bx bx-rocket"></i>Launch Tool</S.RelatedToolLaunchBtn>
                </S.RelatedToolCard>
                <S.RelatedToolCard onClick={() => navigate('/tools/video-analyzer')}>
                  <S.RelatedToolIconWrap><i className="bx bx-film"></i></S.RelatedToolIconWrap>
                  <S.RelatedToolName>Video Analyzer</S.RelatedToolName>
                  <S.RelatedToolDesc>Analyze a competitor's video to see what tags they're using and how their SEO score compares to yours.</S.RelatedToolDesc>
                  <S.RelatedToolLaunchBtn><i className="bx bx-rocket"></i>Launch Tool</S.RelatedToolLaunchBtn>
                </S.RelatedToolCard>
                <S.RelatedToolCard onClick={() => navigate('/tools/channel-analyzer')}>
                  <S.RelatedToolIconWrap><i className="bx bx-bar-chart-alt-2"></i></S.RelatedToolIconWrap>
                  <S.RelatedToolName>Channel Analyzer</S.RelatedToolName>
                  <S.RelatedToolDesc>See what tags and topics are driving the most views on any channel in your niche.</S.RelatedToolDesc>
                  <S.RelatedToolLaunchBtn><i className="bx bx-rocket"></i>Launch Tool</S.RelatedToolLaunchBtn>
                </S.RelatedToolCard>
              </S.RelatedToolsGrid>
            </S.EducationalContent>

          </S.EducationalSection>
        )}

        <S.ResultsContainer className={showResults ? 'visible' : ''}>
          {isLoading ? (
            <S.LoadingContainer>
              <i className='bx bx-loader-alt bx-spin'></i>
              <p>Analyzing thousands of videos to generate optimal tags...</p>
              <S.LoadingSteps>
                <S.LoadingStep>🔍 Searching related content</S.LoadingStep>
                <S.LoadingStep>📊 Analyzing performance metrics</S.LoadingStep>
                <S.LoadingStep>🤖 AI processing tag relevance</S.LoadingStep>
                <S.LoadingStep>🎯 Optimizing for your audience</S.LoadingStep>
              </S.LoadingSteps>
            </S.LoadingContainer>
          ) : generatedTags && tagStats ? (
            <>
              <S.StatsOverview>
                <S.StatCard>
                  <S.StatIcon className="bx bx-hash"></S.StatIcon>
                  <S.StatValue>{tagStats.totalTags}</S.StatValue>
                  <S.StatLabel>Tags Analyzed</S.StatLabel>
                </S.StatCard>

                <S.StatCard>
                  <S.StatIcon className="bx bx-trending-up"></S.StatIcon>
                  <S.StatValue>{tagStats.avgPerformanceScore.toFixed(1)}</S.StatValue>
                  <S.StatLabel>Avg Performance</S.StatLabel>
                </S.StatCard>

                <S.StatCard>
                  <S.StatIcon className="bx bx-target-lock"></S.StatIcon>
                  <S.StatValue>{tagStats.estimatedReach.toLocaleString()}</S.StatValue>
                  <S.StatLabel>Est. Reach</S.StatLabel>
                </S.StatCard>
              </S.StatsOverview>

              <S.SelectedTagsSection visible={true}>
                <S.SelectedTagsHeader>
                  <S.SectionTitle>
                    <i className="bx bx-check-double"></i>
                    Selected Tags ({selectedTags.length})
                  </S.SectionTitle>
                  {selectedTags.length > 0 && (
                    <S.ActionButtons>
                      <S.CopyDropdown>
                        <S.CopyButton onClick={() => handleCopyTags('comma')}>
                          <i className={`bx ${copySuccess === 'comma' ? 'bxs-check-circle' : 'bxs-copy'}`}></i>
                          {copySuccess === 'comma' ? 'Copied!' : 'Copy'}
                        </S.CopyButton>
                        <S.CopyOptions>
                          <S.CopyOption onClick={() => handleCopyTags('comma')}>
                            Comma Separated
                          </S.CopyOption>
                          <S.CopyOption onClick={() => handleCopyTags('line')}>
                            Line by Line
                          </S.CopyOption>
                          <S.CopyOption onClick={() => handleCopyTags('quote')}>
                            With Quotes
                          </S.CopyOption>
                          <S.CopyOption onClick={() => handleCopyTags('hashtag')}>
                            With Hashtags
                          </S.CopyOption>
                        </S.CopyOptions>
                      </S.CopyDropdown>
                      <S.ClearButton onClick={() => setSelectedTags([])}>
                        <i className='bx bx-x'></i>
                        Clear Selection
                      </S.ClearButton>
                    </S.ActionButtons>
                  )}
                </S.SelectedTagsHeader>

                {selectedTags.length > 0 ? (
                  <S.SelectedTagsGrid>
                    {selectedTags.map((tag, index) => (
                      <S.SelectedTag key={index} onClick={() => toggleTag(tag)}>
                        {tag}
                        <i className="bx bx-x"></i>
                      </S.SelectedTag>
                    ))}
                  </S.SelectedTagsGrid>
                ) : (
                  <S.NoTagsMessage>
                    <i className="bx bx-info-circle"></i>
                    No tags selected. Click on tags below to add them to your selection.
                  </S.NoTagsMessage>
                )}
              </S.SelectedTagsSection>

              <S.TagCategoriesGrid>
                <S.TagCategory>
                  <S.CategoryHeader>
                    <S.CategoryTitle>
                      <i className="bx bx-crown"></i>
                      High Performance
                    </S.CategoryTitle>
                    <S.CategoryActions>
                      <S.SelectAllButton onClick={() => selectAllFromCategory(generatedTags.highPerformance)}>
                        Select All
                      </S.SelectAllButton>
                      <S.CategoryBadge>{generatedTags.highPerformance.length}</S.CategoryBadge>
                    </S.CategoryActions>
                  </S.CategoryHeader>
                  <S.CategoryDescription>
                    Tags with proven high engagement and visibility
                  </S.CategoryDescription>
                  <S.TagGrid>
                    {generatedTags.highPerformance.map((tag, index) => (
                      <S.TagChip
                        key={index}
                        selected={selectedTags.includes(tag)}
                        category="high-performance"
                        onClick={() => toggleTag(tag)}
                      >
                        <i className="bx bx-trophy"></i>
                        {tag}
                      </S.TagChip>
                    ))}
                  </S.TagGrid>
                </S.TagCategory>

                <S.TagCategory>
                  <S.CategoryHeader>
                    <S.CategoryTitle>
                      <i className="bx bx-trending-up"></i>
                      Trending
                    </S.CategoryTitle>
                    <S.CategoryActions>
                      <S.SelectAllButton onClick={() => selectAllFromCategory(generatedTags.trending)}>
                        Select All
                      </S.SelectAllButton>
                      <S.CategoryBadge>{generatedTags.trending.length}</S.CategoryBadge>
                    </S.CategoryActions>
                  </S.CategoryHeader>
                  <S.CategoryDescription>
                    Currently popular and frequently searched tags
                  </S.CategoryDescription>
                  <S.TagGrid>
                    {generatedTags.trending.map((tag, index) => (
                      <S.TagChip
                        key={index}
                        selected={selectedTags.includes(tag)}
                        category="trending"
                        onClick={() => toggleTag(tag)}
                      >
                        <i className="bx bx-line-chart"></i>
                        {tag}
                      </S.TagChip>
                    ))}
                  </S.TagGrid>
                </S.TagCategory>

                <S.TagCategory>
                  <S.CategoryHeader>
                    <S.CategoryTitle>
                      <i className="bx bx-bullseye"></i>
                      Niche Targeting
                    </S.CategoryTitle>
                    <S.CategoryActions>
                      <S.SelectAllButton onClick={() => selectAllFromCategory(generatedTags.niche)}>
                        Select All
                      </S.SelectAllButton>
                      <S.CategoryBadge>{generatedTags.niche.length}</S.CategoryBadge>
                    </S.CategoryActions>
                  </S.CategoryHeader>
                  <S.CategoryDescription>
                    Specific tags for targeted audience segments
                  </S.CategoryDescription>
                  <S.TagGrid>
                    {generatedTags.niche.map((tag, index) => (
                      <S.TagChip
                        key={index}
                        selected={selectedTags.includes(tag)}
                        category="niche"
                        onClick={() => toggleTag(tag)}
                      >
                        <i className="bx bx-target-lock"></i>
                        {tag}
                      </S.TagChip>
                    ))}
                  </S.TagGrid>
                </S.TagCategory>

                <S.TagCategory>
                  <S.CategoryHeader>
                    <S.CategoryTitle>
                      <i className="bx bx-text"></i>
                      Long-tail Keywords
                    </S.CategoryTitle>
                    <S.CategoryActions>
                      <S.SelectAllButton onClick={() => selectAllFromCategory(generatedTags.longtail)}>
                        Select All
                      </S.SelectAllButton>
                      <S.CategoryBadge>{generatedTags.longtail.length}</S.CategoryBadge>
                    </S.CategoryActions>
                  </S.CategoryHeader>
                  <S.CategoryDescription>
                    Detailed phrases for specific search queries
                  </S.CategoryDescription>
                  <S.TagGrid>
                    {generatedTags.longtail.map((tag, index) => (
                      <S.TagChip
                        key={index}
                        selected={selectedTags.includes(tag)}
                        category="longtail"
                        onClick={() => toggleTag(tag)}
                      >
                        <i className="bx bx-paragraph"></i>
                        {tag}
                      </S.TagChip>
                    ))}
                  </S.TagGrid>
                </S.TagCategory>

                {generatedTags.suggested.length > 0 && (
                  <S.TagCategory>
                    <S.CategoryHeader>
                      <S.CategoryTitle>
                        <i className="bx bx-bot"></i>
                        AI-Generated Tags
                      </S.CategoryTitle>
                      <S.CategoryActions>
                        <S.SelectAllButton onClick={() => selectAllFromCategory(generatedTags.suggested)}>
                          Select All
                        </S.SelectAllButton>
                        <S.CategoryBadge>{generatedTags.suggested.length}</S.CategoryBadge>
                      </S.CategoryActions>
                    </S.CategoryHeader>
                    <S.CategoryDescription>
                      AI-generated tags based on current trends and optimization
                    </S.CategoryDescription>
                    <S.TagGrid>
                      {generatedTags.suggested.map((tag, index) => (
                        <S.TagChip
                          key={index}
                          selected={selectedTags.includes(tag)}
                          category="suggested"
                          onClick={() => toggleTag(tag)}
                        >
                          <i className="bx bx-brain"></i>
                          {tag}
                        </S.TagChip>
                      ))}
                    </S.TagGrid>
                  </S.TagCategory>
                )}
              </S.TagCategoriesGrid>

              <S.ActionBar>
                <S.ResetButton onClick={handleClear}>
                  <i className='bx bx-refresh'></i>
                  Start Over
                </S.ResetButton>
              </S.ActionBar>
            </>
          ) : null}
        </S.ResultsContainer>
      </S.MainContainer>
    </S.PageWrapper>
    </>
  );
};

export default TagGenerator;