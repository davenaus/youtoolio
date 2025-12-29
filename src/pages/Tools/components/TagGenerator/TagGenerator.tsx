// src/pages/Tools/components/TagGenerator/TagGenerator.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SEO } from '../../../../components/SEO';
import { toolsSEO, generateToolSchema } from '../../../../config/toolsSEO';
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

    setIsLoading(true);
    setShowResults(false);

    try {
      const results = await generateAdvancedTags(title);
      setGeneratedTags(results.tags);
      setTagStats(results.stats);
      setShowResults(true);
    } catch (error) {
      console.error('Error generating tags:', error);
      alert(`Failed to generate tags: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAdvancedTags = async (searchTerm: string) => {
    const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
    if (!API_KEY) {
      throw new Error('YouTube API key not configured');
    }

    // Multiple search strategies for better tag diversity
    const searchQueries = [
      searchTerm,
      `${searchTerm} tutorial`,
      `${searchTerm} how to`,
      `${searchTerm} ${new Date().getFullYear()}`,
      `best ${searchTerm}`
    ];

    const allTagAnalysis: TagAnalysis[] = [];
    const processedVideos: VideoDetails[] = [];

    for (const query of searchQueries) {
      try {
        // Search for videos
        const searchResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/search?` +
          `key=${API_KEY}&` +
          `q=${encodeURIComponent(query)}&` +
          `part=snippet&` +
          `type=video&` +
          `maxResults=15&` +
          `order=relevance&` +
          `publishedAfter=${new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()}`
        );

        if (!searchResponse.ok) continue;
        const searchData = await searchResponse.json();

        if (!searchData.items?.length) continue;

        // Get detailed video information
        const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
        const detailsResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?` +
          `key=${API_KEY}&` +
          `part=snippet,statistics&` +
          `id=${videoIds}`
        );

        if (!detailsResponse.ok) continue;
        const detailsData = await detailsResponse.json();

        detailsData.items.forEach((video: VideoDetails) => {
          processedVideos.push(video);
          const videoTags = video.snippet.tags || [];

          videoTags.forEach(tag => {
            const analysis = analyzeTag(tag, video, searchTerm);
            if (analysis.score > 0) {
              allTagAnalysis.push(analysis);
            }
          });
        });

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.warn(`Error processing query "${query}":`, error);
      }
    }

    return categorizeAndRankTags(allTagAnalysis, processedVideos, searchTerm);
  };

  const analyzeTag = (tag: string, video: VideoDetails, searchTerm: string): TagAnalysis => {
    const lowercaseTag = tag.toLowerCase();
    const lowercaseTitle = video.snippet.title.toLowerCase();
    const lowercaseDescription = video.snippet.description.toLowerCase();
    const lowercaseSearchTerm = searchTerm.toLowerCase();
    const searchWords = lowercaseSearchTerm.split(' ').filter(w => w.length > 2);

    let score = 0;
    let relevanceScore = 0;

    // Filter out very generic/irrelevant tags
    const genericTags = ['video', 'youtube', 'new', 'best', 'top', 'like', 'subscribe', 'comment', 'share'];
    if (genericTags.includes(lowercaseTag)) {
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

    // Categorize tags
    const highPerformance = consolidatedTags
      .filter(tag => tag.score >= 15 && tag.frequency >= 2)
      .slice(0, 10)
      .map(tag => tag.tag);

    const trending = consolidatedTags
      .filter(tag => tag.relevanceScore >= 8 && tag.frequency >= 3)
      .slice(0, 15)
      .map(tag => tag.tag);

    const niche = consolidatedTags
      .filter(tag => tag.frequency <= 2 && tag.score >= 8)
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
    const suggestions: string[] = [];
    const currentYear = new Date().getFullYear();

    // Time-based suggestions
    suggestions.push(
      `${searchTerm} ${currentYear}`,
      `${searchTerm} tutorial`,
      `${searchTerm} guide`,
      `how to ${searchTerm}`,
      `best ${searchTerm}`,
      `${searchTerm} tips`,
      `${searchTerm} review`
    );

    // Audience-based suggestions
    if (targetAudience !== 'general') {
      suggestions.push(
        `${searchTerm} for ${targetAudience}`,
        `${targetAudience} ${searchTerm}`
      );
    }

    return suggestions.filter(tag =>
      !existingTags.some(existing => existing.tag.toLowerCase() === tag.toLowerCase())
    );
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
            </S.HeaderTextContent>
          </S.HeaderContent>
        </S.EnhancedHeader>

        {/* Advanced Settings Container */}
        <S.ControlsContainer>
          <S.FilterToggle onClick={() => setShowFilters(!showFilters)}>
            <i className="bx bx-cog"></i>
            Advanced Settings
          </S.FilterToggle>
        </S.ControlsContainer>

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
              <S.SectionSubTitle>How to Use the Tag Generator</S.SectionSubTitle>

              <S.EducationalText>
                Our Tag Generator helps you discover high-performing YouTube tags using advanced keyword research
                and competitor analysis. Generate targeted tags that improve video discoverability, boost search rankings,
                and reach the right audience for maximum engagement and growth.
              </S.EducationalText>

              <S.StepByStep>
                <S.StepItem>
                  <S.StepNumberCircle>1</S.StepNumberCircle>
                  <S.StepContent>
                    <S.StepTitle>Enter Your Topic</S.StepTitle>
                    <S.EducationalText>
                      Input your main video topic, target keyword, or seed phrase into the generator above.
                      Our system analyzes related terms, trending keywords, and successful tag patterns
                      to provide comprehensive tag suggestions tailored to your content.
                    </S.EducationalText>
                  </S.StepContent>
                </S.StepItem>

                <S.StepItem>
                  <S.StepNumberCircle>2</S.StepNumberCircle>
                  <S.StepContent>
                    <S.StepTitle>Advanced Tag Analysis</S.StepTitle>
                    <S.EducationalText>
                      Our algorithm examines search volume, competition levels, and trending patterns
                      to suggest optimal tags. We analyze successful videos in your niche to identify
                      high-performing tag combinations and keyword opportunities.
                    </S.EducationalText>
                  </S.StepContent>
                </S.StepItem>

                <S.StepItem>
                  <S.StepNumberCircle>3</S.StepNumberCircle>
                  <S.StepContent>
                    <S.StepTitle>Copy & Optimize</S.StepTitle>
                    <S.EducationalText>
                      Select from generated tags based on relevance and search potential. Copy tags
                      directly to your clipboard for easy pasting into YouTube Studio. Use our optimization
                      tips to maximize tag effectiveness and improve video discoverability.
                    </S.EducationalText>
                  </S.StepContent>
                </S.StepItem>
              </S.StepByStep>
            </S.EducationalContent>

            <S.EducationalContent>
              <S.SectionSubTitle>Tag Optimization Features</S.SectionSubTitle>

              <S.FeatureList>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Long-tail Keyword Discovery:</strong> Find specific, targeted tags with lower competition and higher conversion potential</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Trending Tag Analysis:</strong> Identify currently popular tags and emerging keywords in your niche</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Competition Assessment:</strong> Evaluate tag difficulty and competition levels for strategic selection</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Search Volume Insights:</strong> Understand monthly search volumes and trending patterns for each tag</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Related Tag Suggestions:</strong> Discover semantically related keywords and topic clusters</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Tag Performance Scoring:</strong> Get recommendations based on relevance, competition, and search potential</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Bulk Tag Generation:</strong> Generate comprehensive tag lists for multiple videos and content series</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Export & Organization:</strong> Save and organize your tag collections for future content planning</span>
                </S.FeatureListItem>
              </S.FeatureList>
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