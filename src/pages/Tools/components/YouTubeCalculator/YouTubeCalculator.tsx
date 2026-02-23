// src/pages/Tools/components/YouTubeCalculator/YouTubeCalculator.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../../../../components/SEO';
import { GoogleAd } from '../../../../components/GoogleAd';
import { toolsSEO, generateToolSchema } from '../../../../config/toolsSEO';
import * as S from './styles';

interface CategoryRates {
  name: string;
  cpm: number;
  icon: string;
  description: string;
  color: string;
}

interface ChannelData {
  subscribers: number;
  avgViews: number;
  engagementRate: number;
  category: string;
  country: string;
  isMonetized: boolean;
}

interface EarningsBreakdown {
  adRevenue: number;
  membershipRevenue: number;
  sponsorshipRevenue: number;
  merchandiseRevenue: number;
  totalRevenue: number;
  yearlyProjection: number;
}

interface CalculationHistory {
  id: string;
  date: Date;
  views: number;
  category: string;
  earnings: EarningsBreakdown;
  videoLength: number;
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

const countryMultipliers: { [key: string]: number } = {
  US: 1.0, UK: 0.85, CA: 0.82, AU: 0.78, DE: 0.72, FR: 0.68, JP: 0.65,
  KR: 0.58, BR: 0.35, IN: 0.28, MX: 0.25, RU: 0.22, CN: 0.18
};

export const YouTubeCalculator: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'input' | 'results'>('input');
  const [isCalculating, setIsCalculating] = useState(false);

  // Tool configuration
  const toolConfig = {
    name: 'YouTube Calculator',
    description: 'Estimate your potential YouTube earnings based on views, video length, and content category',
    image: 'https://64.media.tumblr.com/95def04a5eda69c7703fca45158d5256/0e01452f9f6dd974-57/s2048x3072/ec37f2775fabde8ea0dc7ba6e16a91cfe8d8870d.jpg',
    icon: 'bx bx-dollar-circle',
    features: [
      'Quick revenue estimates',
      'Category-based CPM',
      'Country-specific rates'
    ]
  };

  // Input mode toggle
  const [inputMode, setInputMode] = useState<'link' | 'manual'>('link');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isLoadingVideo, setIsLoadingVideo] = useState<boolean>(false);

  // Simplified inputs - only the essentials
  const [videoLength, setVideoLength] = useState<number>(10);
  const [views, setViews] = useState<number>(10000);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [country, setCountry] = useState<string>('US');

  // Results and history
  const [earningsBreakdown, setEarningsBreakdown] = useState<EarningsBreakdown | null>(null);
  const [calculationHistory, setCalculationHistory] = useState<CalculationHistory[]>([]);

  // Load calculation history
  useEffect(() => {
    const history = localStorage.getItem('youtube_calc_history');
    if (history) {
      const parsed = JSON.parse(history);
      setCalculationHistory(parsed.map((item: any) => ({
        ...item,
        date: new Date(item.date)
      })));
    }
  }, []);

  const saveToHistory = useCallback((calculation: Omit<CalculationHistory, 'id' | 'date'>) => {
    const newEntry: CalculationHistory = {
      ...calculation,
      id: Date.now().toString(),
      date: new Date()
    };

    const newHistory = [newEntry, ...calculationHistory].slice(0, 10);
    setCalculationHistory(newHistory);
    localStorage.setItem('youtube_calc_history', JSON.stringify(newHistory));
  }, [calculationHistory]);

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
      /youtube\.com\/embed\/([^&\s]+)/,
      /youtube\.com\/v\/([^&\s]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const parseDuration = (duration: string): number => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    return hours * 60 + minutes + Math.ceil(seconds / 60);
  };

  const handleLoadFromUrl = async () => {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      alert('Invalid YouTube URL. Please enter a valid video link.');
      return;
    }

    setIsLoadingVideo(true);

    try {
      const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY_4;
      if (!API_KEY) {
        alert('YouTube API key not configured. Please contact support.');
        setIsLoadingVideo(false);
        return;
      }

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${API_KEY}`
      );

      if (!response.ok) throw new Error('Failed to fetch video data');

      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        alert('Video not found. Please check the URL and try again.');
        setIsLoadingVideo(false);
        return;
      }

      const video = data.items[0];

      // Auto-fill form with video data
      const videoViews = parseInt(video.statistics.viewCount || '10000');
      const videoDuration = parseDuration(video.contentDetails.duration);

      setViews(videoViews);
      setVideoLength(videoDuration);

      // Try to auto-detect category from video category ID
      const categoryId = video.snippet.categoryId;
      const categoryMap: { [key: string]: string } = {
        '1': 'entertainment',     // Film & Animation
        '2': 'entertainment',     // Autos & Vehicles
        '10': 'music',            // Music
        '15': 'lifestyle',        // Pets & Animals
        '17': 'lifestyle',        // Sports
        '18': 'entertainment',    // Short Movies
        '19': 'travel',           // Travel & Events
        '20': 'gaming',           // Gaming
        '21': 'lifestyle',        // Videoblogging
        '22': 'lifestyle',        // People & Blogs
        '23': 'entertainment',    // Comedy
        '24': 'entertainment',    // Entertainment
        '25': 'news',             // News & Politics
        '26': 'lifestyle',        // Howto & Style
        '27': 'education',        // Education
        '28': 'tech',             // Science & Technology
        '29': 'entertainment',    // Nonprofits & Activism
        '43': 'entertainment',    // Shows
        // Categories we have but YouTube doesn't have specific IDs for:
        // 'business', 'health', 'food', 'beauty' - will need manual selection
      };

      const detectedCategory = categoryMap[categoryId];

      if (detectedCategory) {
        setSelectedCategory(detectedCategory);

        // Auto-calculate if we have all required data
        setIsLoadingVideo(false);
        setIsCalculating(true);

        // Simulate calculation time for premium feel
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Calculate earnings with the loaded data
        const category = categoryRates[detectedCategory];
        const countryMultiplier = countryMultipliers[country] || 0.5;
        let baseCpm = category.cpm * countryMultiplier;

        let lengthMultiplier = 1;
        if (videoDuration >= 8) {
          lengthMultiplier = 1.2;
        } else if (videoDuration < 4) {
          lengthMultiplier = 0.7;
        }

        const monetizedViews = videoViews * 0.75 * 0.5;
        const finalCpm = baseCpm * lengthMultiplier;
        const grossAdRevenue = (monetizedViews / 1000) * finalCpm;
        const adRevenue = grossAdRevenue * 0.55;
        const totalRevenue = adRevenue;
        const yearlyProjection = totalRevenue * 4 * 12;

        const earnings: EarningsBreakdown = {
          adRevenue: Math.max(0, adRevenue),
          membershipRevenue: 0,
          sponsorshipRevenue: 0,
          merchandiseRevenue: 0,
          totalRevenue: Math.max(0, totalRevenue),
          yearlyProjection: Math.max(0, yearlyProjection)
        };

        setEarningsBreakdown(earnings);

        // Save to history
        saveToHistory({
          views: videoViews,
          category: detectedCategory,
          earnings,
          videoLength: videoDuration
        });

        setCurrentStep('results');
        setIsCalculating(false);
      } else {
        // Category couldn't be auto-detected, switch to manual mode for user to select
        setIsLoadingVideo(false);
        setInputMode('manual');
        alert('Video loaded! Please select a content category to calculate earnings.');
      }
    } catch (error) {
      console.error('Error fetching video:', error);
      alert('Failed to load video data. Please try again or enter details manually.');
      setIsLoadingVideo(false);
    }
  };

  const calculateEarnings = useCallback((): EarningsBreakdown => {
    if (!selectedCategory) return { adRevenue: 0, membershipRevenue: 0, sponsorshipRevenue: 0, merchandiseRevenue: 0, totalRevenue: 0, yearlyProjection: 0 };

    const category = categoryRates[selectedCategory];
    const countryMultiplier = countryMultipliers[country] || 0.5;

    // Simplified, more realistic calculation
    let baseCpm = category.cpm * countryMultiplier;

    // Video length factor
    let lengthMultiplier = 1;
    if (videoLength >= 8) {
      lengthMultiplier = 1.2; // 20% boost for mid-roll ads
    } else if (videoLength < 4) {
      lengthMultiplier = 0.7; // Penalty for shorts/very short videos
    }

    // Typical ad block rate (25%) and monetized view rate (50%)
    const monetizedViews = views * 0.75 * 0.5;

    // Final CPM
    const finalCpm = baseCpm * lengthMultiplier;

    // Calculate ad revenue (YouTube takes 45%, creator gets 55%)
    const grossAdRevenue = (monetizedViews / 1000) * finalCpm;
    const adRevenue = grossAdRevenue * 0.55;

    // Simplified other revenue (just ad revenue for now, can add bonuses)
    const totalRevenue = adRevenue;

    // Yearly projection (assumes 4 videos per month)
    const yearlyProjection = totalRevenue * 4 * 12;

    return {
      adRevenue: Math.max(0, adRevenue),
      membershipRevenue: 0,
      sponsorshipRevenue: 0,
      merchandiseRevenue: 0,
      totalRevenue: Math.max(0, totalRevenue),
      yearlyProjection: Math.max(0, yearlyProjection)
    };
  }, [videoLength, views, selectedCategory, country]);

  const handleCalculate = async () => {
    setIsCalculating(true);

    // Simulate calculation time for premium feel
    await new Promise(resolve => setTimeout(resolve, 1500));

    const earnings = calculateEarnings();
    setEarningsBreakdown(earnings);

    // Save to history
    saveToHistory({
      views,
      category: selectedCategory,
      earnings,
      videoLength
    });

    setCurrentStep('results');
    setIsCalculating(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getOptimizationTips = () => {
    const tips = [];

    if (videoLength < 8) {
      tips.push({ icon: 'bx-time', text: 'Consider videos 8+ minutes for mid-roll ads (20% revenue boost)', type: 'warning' as const });
    }

    if (videoLength >= 8) {
      tips.push({ icon: 'bx-check-circle', text: 'Great! Your video length qualifies for mid-roll ads', type: 'success' as const });
    }

    const category = categoryRates[selectedCategory];
    if (category && category.cpm < 10) {
      tips.push({ icon: 'bx-target-lock', text: 'Consider diversifying into higher-CPM categories like Business or Education', type: 'info' as const });
    }

    if (country !== 'US' && country !== 'UK' && country !== 'CA') {
      tips.push({ icon: 'bx-world', text: 'Create content that appeals to US/UK/CA audiences for higher CPM rates', type: 'info' as const });
    }

    tips.push({ icon: 'bx-trending-up', text: 'Consistent upload schedule (4+ videos/month) maximizes yearly earnings', type: 'success' as const });

    return tips;
  };

  const renderStepIndicator = () => (
    <S.StepIndicator>
      <S.Step active={currentStep === 'input'} completed={currentStep === 'results'}>
        <S.StepNumber active={currentStep === 'input'} completed={currentStep === 'results'}>1</S.StepNumber>
        <S.StepLabel active={currentStep === 'input'} completed={currentStep === 'results'}>Enter Details</S.StepLabel>
      </S.Step>
      <S.StepConnector completed={currentStep === 'results'} />
      <S.Step active={currentStep === 'results'} completed={false}>
        <S.StepNumber active={currentStep === 'results'} completed={false}>2</S.StepNumber>
        <S.StepLabel active={currentStep === 'results'} completed={false}>View Results</S.StepLabel>
      </S.Step>
    </S.StepIndicator>
  );

  const seoConfig = toolsSEO['youtube-calculator'];
  const schemaData = generateToolSchema('youtube-calculator', seoConfig);

  return (
    <>
      <SEO
        title={seoConfig.title}
        description={seoConfig.description}
        keywords={seoConfig.keywords}
        canonical="https://youtool.io/tools/youtube-calculator"
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
            </S.HeaderTextContent>
          </S.HeaderContent>
        </S.EnhancedHeader>

        {/* Google Ad Spot */}
        <GoogleAd adSlot="1234567890" />

        {/* Educational Content */}
        {currentStep === 'input' && (
          <S.EducationalSection>

            <S.EducationalContent>
              <S.SectionSubTitle>What This Tool Does</S.SectionSubTitle>
              <S.EducationalText>
                The YouTube Revenue Calculator estimates how much a video earns based on its view count, niche, watch time, and other monetization factors. It uses industry-standard CPM (Cost Per Mille) benchmarks for each content category to generate a realistic revenue range — from a conservative floor to an optimistic ceiling — giving you a more honest picture of potential earnings than a single-number estimate.
              </S.EducationalText>
              <S.EducationalText>
                YouTube ad revenue is one of the most misunderstood topics in the creator economy. The actual amount varies enormously based on viewer geography, seasonal ad rates, content category, video length, and what percentage of viewers watch ads. This tool uses real-world CPM data to give you calibrated estimates rather than inflated projections.
              </S.EducationalText>
            </S.EducationalContent>

            <S.EducationalContent>
              <S.SectionSubTitle>How to Use the Revenue Calculator</S.SectionSubTitle>
              <S.EduStepByStep>
                <S.EduStepItem>
                  <S.EduStepNumberCircle>1</S.EduStepNumberCircle>
                  <S.EduStepContent>
                    <S.EduStepTitle>Enter Your Video Details</S.EduStepTitle>
                    <S.EducationalText>
                      Paste a YouTube video URL for automatic data fetching, or manually enter your view count, average watch time percentage, and video length. Manual entry is useful for projecting earnings on a video you haven't published yet based on expected performance.
                    </S.EducationalText>
                  </S.EduStepContent>
                </S.EduStepItem>
                <S.EduStepItem>
                  <S.EduStepNumberCircle>2</S.EduStepNumberCircle>
                  <S.EduStepContent>
                    <S.EduStepTitle>Select Your Content Category</S.EduStepTitle>
                    <S.EducationalText>
                      Choose the category that best matches your content. CPM rates vary significantly by niche — finance and business content commands some of the highest CPMs ($15–$40+) because advertisers pay more to reach those audiences. Gaming and entertainment typically have lower CPMs ($2–$8). Selecting the right category is the most important input for an accurate estimate.
                    </S.EducationalText>
                  </S.EduStepContent>
                </S.EduStepItem>
                <S.EduStepItem>
                  <S.EduStepNumberCircle>3</S.EduStepNumberCircle>
                  <S.EduStepContent>
                    <S.EduStepTitle>Review Your Revenue Breakdown</S.EduStepTitle>
                    <S.EducationalText>
                      The results show your estimated RPM (Revenue Per Mille), total ad revenue range, and a breakdown of how different factors affect your earnings. Use the detailed report to understand which variables have the biggest impact on your channel's monetization potential.
                    </S.EducationalText>
                  </S.EduStepContent>
                </S.EduStepItem>
              </S.EduStepByStep>
            </S.EducationalContent>

            <S.EducationalContent>
              <S.SectionSubTitle>Key YouTube Revenue Concepts</S.SectionSubTitle>
              <S.FeatureList>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>CPM vs RPM:</strong> CPM (Cost Per Mille) is what advertisers pay per 1,000 ad impressions. RPM (Revenue Per Mille) is what creators actually earn per 1,000 video views — which is always lower than CPM because not every view results in an ad impression, and YouTube takes a 45% revenue share. Most creators earn 40–60% of the CPM rate as their RPM.</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Watch time and ad load:</strong> YouTube serves more ads on longer videos (8+ minutes enables mid-roll ads). A 15-minute video with 60% average view duration earns significantly more than a 4-minute video with the same view count because it can display multiple ad slots per viewer session.</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Seasonal rate fluctuations:</strong> Ad CPMs spike dramatically in Q4 (October–December) as advertisers compete for holiday ad inventory. CPMs in December can be 3–5x higher than January rates for the same content. This means the same 100,000-view video can earn $800 in January and $3,000 in December.</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Geographic audience value:</strong> Viewer geography has a massive impact on revenue. US, UK, Canadian, and Australian viewers generate 5–15x more ad revenue per view than viewers from regions with lower advertiser demand. A channel with a predominantly US audience earns far more per view than one with equivalent views from other regions.</span>
                </S.FeatureListItem>
              </S.FeatureList>
            </S.EducationalContent>

            <S.EducationalContent>
              <S.SectionSubTitle>Frequently Asked Questions</S.SectionSubTitle>
              <S.FeatureList>
                <S.FeatureListItem>
                  <i className="bx bx-help-circle"></i>
                  <span><strong>Why is my actual revenue different from the estimate?</strong> Ad revenue estimates have wide variance because they depend on factors that cannot be observed externally — your specific audience geography, the exact advertisers targeting your videos, your ad settings, and YouTube's real-time auction dynamics. Think of the calculator's output as an informed range, not a guarantee.</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-help-circle"></i>
                  <span><strong>Does the estimate include YouTube Premium revenue?</strong> YouTube Premium revenue (where Premium subscribers watch your content without ads) adds a small additional amount beyond ad revenue — typically 5–15% additional on top of ad revenue. The calculator's estimate primarily models ad revenue; Premium revenue is a bonus on top.</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-help-circle"></i>
                  <span><strong>How can I increase my RPM?</strong> The most reliable ways to increase RPM are: create longer videos to enable mid-roll ads, target higher-CPM content categories (finance, business, tech reviews), grow your US/UK/AU viewer base through targeted SEO, and maintain high ad suitability by avoiding monetization-restricted topics in titles and descriptions.</span>
                </S.FeatureListItem>
              </S.FeatureList>
            </S.EducationalContent>

            <S.EducationalContent>
              <S.SectionSubTitle>Related Tools</S.SectionSubTitle>
              <S.FeatureList>
                <S.FeatureListItem>
                  <i className="bx bx-link"></i>
                  <span><a href="/tools/video-analyzer"><strong>Video Analyzer</strong></a> — Get detailed analytics on any video's performance metrics to compare against your revenue estimates.</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-link"></i>
                  <span><a href="/tools/channel-analyzer"><strong>Channel Analyzer</strong></a> — Analyze a full channel's performance including engagement scores that directly correlate with monetization health.</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-link"></i>
                  <span><a href="/tools/moderation-checker"><strong>Moderation Checker</strong></a> — Check your video titles and descriptions for content that could trigger demonetization before you publish.</span>
                </S.FeatureListItem>
              </S.FeatureList>
            </S.EducationalContent>

          </S.EducationalSection>
        )}

        {renderStepIndicator()}

        {/* Step 1: Video Details */}
        {currentStep === 'input' && (
          <S.InputSection>
            <S.SectionTitle>
              <i className="bx bx-video"></i>
              Video Details
            </S.SectionTitle>

            {/* Input Mode Toggle */}
            <S.InputModeToggle>
              <S.ToggleButton
                active={inputMode === 'link'}
                onClick={() => setInputMode('link')}
              >
                <i className="bx bx-link"></i>
                Quick Estimate (Paste Video Link)
              </S.ToggleButton>
              <S.ToggleButton
                active={inputMode === 'manual'}
                onClick={() => setInputMode('manual')}
              >
                <i className="bx bx-edit"></i>
                Manual Input
              </S.ToggleButton>
            </S.InputModeToggle>

            {/* Video URL Input (Link Mode) */}
            {inputMode === 'link' && (
              <S.UrlInputContainer>
                <S.UrlInputCard>
                  <S.CardTitle>
                    <i className="bx bx-link-alt"></i>
                    Enter YouTube Video URL
                  </S.CardTitle>
                  <S.UrlInputWrapper>
                    <S.UrlInput
                      type="text"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !isLoadingVideo && handleLoadFromUrl()}
                    />
                    <S.LoadButton
                      onClick={handleLoadFromUrl}
                      disabled={!videoUrl.trim() || isLoadingVideo}
                    >
                      {isLoadingVideo ? (
                        <>
                          <i className="bx bx-loader-alt bx-spin"></i>
                          Loading...
                        </>
                      ) : (
                        <>
                          <i className="bx bx-right-arrow-alt"></i>
                          Load Video
                        </>
                      )}
                    </S.LoadButton>
                  </S.UrlInputWrapper>
                  <S.InputHint>
                    Paste a YouTube video link to automatically fetch views, length, and category
                  </S.InputHint>
                </S.UrlInputCard>
              </S.UrlInputContainer>
            )}

            {/* Manual Input Mode */}
            {inputMode === 'manual' && (
              <>
            <S.StatsGrid>
              <S.StatCard>
                <S.StatIcon>
                  <i className="bx bx-play-circle"></i>
                </S.StatIcon>
                <S.StatContent>
                  <S.StatValue>{formatNumber(views)}</S.StatValue>
                  <S.StatLabel>Expected Views</S.StatLabel>
                </S.StatContent>
              </S.StatCard>

              <S.StatCard>
                <S.StatIcon>
                  <i className="bx bx-time"></i>
                </S.StatIcon>
                <S.StatContent>
                  <S.StatValue>{videoLength}min</S.StatValue>
                  <S.StatLabel>Video Length</S.StatLabel>
                </S.StatContent>
              </S.StatCard>

              <S.StatCard>
                <S.StatIcon>
                  <i className="bx bx-category"></i>
                </S.StatIcon>
                <S.StatContent>
                  <S.StatValue>{selectedCategory ? categoryRates[selectedCategory].name : 'None'}</S.StatValue>
                  <S.StatLabel>Category</S.StatLabel>
                </S.StatContent>
              </S.StatCard>
            </S.StatsGrid>

            <S.InputGrid>
              <S.InputCard>
                <S.CardTitle>
                  <i className="bx bx-bar-chart-alt-2"></i>
                  Expected Views
                </S.CardTitle>
                <S.SliderContainer>
                  <S.SliderLabel>
                    <span>1K</span>
                    <span>{formatNumber(views)}</span>
                    <span>10M</span>
                  </S.SliderLabel>
                  <S.Slider
                    type="range"
                    min={1000}
                    max={10000000}
                    value={views}
                    onChange={(e) => setViews(parseInt(e.target.value))}
                    step={views >= 100000 ? 50000 : views >= 10000 ? 5000 : 1000}
                  />
                </S.SliderContainer>
                <S.InputHint>
                  Estimate based on your typical video performance or target audience
                </S.InputHint>
              </S.InputCard>

              <S.InputCard>
                <S.CardTitle>
                  <i className="bx bx-stopwatch"></i>
                  Video Length
                </S.CardTitle>
                <S.SliderContainer>
                  <S.SliderLabel>
                    <span>1min</span>
                    <span>{videoLength}min</span>
                    <span>60min</span>
                  </S.SliderLabel>
                  <S.Slider
                    type="range"
                    min={1}
                    max={60}
                    value={videoLength}
                    onChange={(e) => setVideoLength(parseInt(e.target.value))}
                  />
                </S.SliderContainer>
                <S.InputHint>
                  Videos 8+ minutes can include mid-roll ads for higher revenue
                </S.InputHint>
              </S.InputCard>
            </S.InputGrid>

            <S.CategorySection>
              <S.CardTitle>
                <i className="bx bx-category"></i>
                Select Your Content Category
              </S.CardTitle>
              <S.CategoryGrid>
                {Object.entries(categoryRates).map(([key, category]) => (
                  <S.CategoryCard
                    key={key}
                    selected={selectedCategory === key}
                    onClick={() => setSelectedCategory(key)}
                    color={category.color}
                  >
                    <S.CategoryIcon color={category.color}>
                      <i className={`bx ${category.icon}`}></i>
                    </S.CategoryIcon>
                    <S.CategoryInfo>
                      <S.CategoryName>{category.name}</S.CategoryName>
                      <S.CategoryCPM>~${category.cpm} CPM</S.CategoryCPM>
                      <S.CategoryDesc>{category.description}</S.CategoryDesc>
                    </S.CategoryInfo>
                  </S.CategoryCard>
                ))}
              </S.CategoryGrid>
            </S.CategorySection>

            <S.InputCard>
              <S.CardTitle>
                <i className="bx bx-world"></i>
                Primary Audience Country
              </S.CardTitle>
              <S.Select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                <option value="US">🇺🇸 United States</option>
                <option value="UK">🇬🇧 United Kingdom</option>
                <option value="CA">🇨🇦 Canada</option>
                <option value="AU">🇦🇺 Australia</option>
                <option value="DE">🇩🇪 Germany</option>
                <option value="FR">🇫🇷 France</option>
                <option value="JP">🇯🇵 Japan</option>
                <option value="KR">🇰🇷 South Korea</option>
                <option value="BR">🇧🇷 Brazil</option>
                <option value="IN">🇮🇳 India</option>
                <option value="MX">🇲🇽 Mexico</option>
                <option value="RU">🇷🇺 Russia</option>
                <option value="CN">🇨🇳 China</option>
              </S.Select>
              <S.InputHint>
                Different countries have varying CPM rates - US/UK/CA typically pay the most
              </S.InputHint>
            </S.InputCard>

            <S.ActionButtons>
              <S.PrimaryButton
                onClick={handleCalculate}
                disabled={!selectedCategory || isCalculating}
              >
                {isCalculating ? (
                  <>
                    <i className="bx bx-loader-alt bx-spin"></i>
                    Calculating Revenue...
                  </>
                ) : (
                  <>
                    <i className="bx bx-calculator"></i>
                    Calculate Earnings
                  </>
                )}
              </S.PrimaryButton>
            </S.ActionButtons>
              </>
            )}
          </S.InputSection>
        )}

        {/* Step 2: Results */}
        {currentStep === 'results' && earningsBreakdown && (
          <S.ResultSection>
            <S.SectionTitle>
              <i className="bx bx-trophy"></i>
              Revenue Breakdown & Insights
            </S.SectionTitle>

            <S.ResultsGrid>
              <S.MainResultCard>
                <S.CardTitle>
                  <i className="bx bx-dollar-circle"></i>
                  Estimated Revenue Per Video
                </S.CardTitle>
                <S.TotalRevenue>
                  {formatCurrency(earningsBreakdown.totalRevenue * 0.5)} - {formatCurrency(earningsBreakdown.totalRevenue * 1.5)}
                </S.TotalRevenue>
              </S.MainResultCard>

              <S.BreakdownCard>
                <S.CardTitle>
                  <i className="bx bx-pie-chart-alt-2"></i>
                  Revenue Breakdown
                </S.CardTitle>
                <S.RevenueBreakdown>
                  <S.RevenueItem>
                    <S.RevenueIcon color="#ff6b6b">
                      <i className="bx bx-play-circle"></i>
                    </S.RevenueIcon>
                    <S.RevenueDetails>
                      <S.RevenueLabel>Ad Revenue</S.RevenueLabel>
                      <S.RevenueAmount>{formatCurrency(earningsBreakdown.adRevenue)}</S.RevenueAmount>
                    </S.RevenueDetails>
                    <S.RevenuePercentage>
                      {((earningsBreakdown.adRevenue / earningsBreakdown.totalRevenue) * 100).toFixed(1)}%
                    </S.RevenuePercentage>
                  </S.RevenueItem>

                  {earningsBreakdown.membershipRevenue > 0 && (
                    <S.RevenueItem>
                      <S.RevenueIcon color="#4ecdc4">
                        <i className="bx bx-crown"></i>
                      </S.RevenueIcon>
                      <S.RevenueDetails>
                        <S.RevenueLabel>Memberships</S.RevenueLabel>
                        <S.RevenueAmount>{formatCurrency(earningsBreakdown.membershipRevenue)}</S.RevenueAmount>
                      </S.RevenueDetails>
                      <S.RevenuePercentage>
                        {((earningsBreakdown.membershipRevenue / earningsBreakdown.totalRevenue) * 100).toFixed(1)}%
                      </S.RevenuePercentage>
                    </S.RevenueItem>
                  )}

                  {earningsBreakdown.sponsorshipRevenue > 0 && (
                    <S.RevenueItem>
                      <S.RevenueIcon color="#f9ca24">
                        <i className="bx bx-handshake"></i>
                      </S.RevenueIcon>
                      <S.RevenueDetails>
                        <S.RevenueLabel>Sponsorships</S.RevenueLabel>
                        <S.RevenueAmount>{formatCurrency(earningsBreakdown.sponsorshipRevenue)}</S.RevenueAmount>
                      </S.RevenueDetails>
                      <S.RevenuePercentage>
                        {((earningsBreakdown.sponsorshipRevenue / earningsBreakdown.totalRevenue) * 100).toFixed(1)}%
                      </S.RevenuePercentage>
                    </S.RevenueItem>
                  )}

                  {earningsBreakdown.merchandiseRevenue > 0 && (
                    <S.RevenueItem>
                      <S.RevenueIcon color="#6c5ce7">
                        <i className="bx bx-shopping-bag"></i>
                      </S.RevenueIcon>
                      <S.RevenueDetails>
                        <S.RevenueLabel>Merchandise</S.RevenueLabel>
                        <S.RevenueAmount>{formatCurrency(earningsBreakdown.merchandiseRevenue)}</S.RevenueAmount>
                      </S.RevenueDetails>
                      <S.RevenuePercentage>
                        {((earningsBreakdown.merchandiseRevenue / earningsBreakdown.totalRevenue) * 100).toFixed(1)}%
                      </S.RevenuePercentage>
                    </S.RevenueItem>
                  )}
                </S.RevenueBreakdown>
              </S.BreakdownCard>

              <S.OptimizationCard>
                <S.CardTitle>
                  <i className="bx bx-brain"></i>
                  Optimization Tips
                </S.CardTitle>
                <S.TipsList>
                  {getOptimizationTips().map((tip, index) => (
                    <S.TipItem key={index} type={tip.type}>
                      <i className={`bx ${tip.icon}`}></i>
                      <span>{tip.text}</span>
                    </S.TipItem>
                  ))}
                </S.TipsList>
              </S.OptimizationCard>

              <S.ComparisonCard>
                <S.CardTitle>
                  <i className="bx bx-bar-chart-alt-2"></i>
                  Performance Metrics
                </S.CardTitle>
                <S.MetricsList>
                  <S.MetricItem>
                    <S.MetricLabel>Content Category</S.MetricLabel>
                    <S.MetricValue>
                      <i className={`bx ${categoryRates[selectedCategory]?.icon || 'bx-video'}`} style={{ marginRight: '8px' }}></i>
                      {categoryRates[selectedCategory]?.name || 'Unknown'}
                    </S.MetricValue>
                  </S.MetricItem>
                  <S.MetricItem>
                    <S.MetricLabel>Revenue Per 1K Views (RPM)</S.MetricLabel>
                    <S.MetricValue>{formatCurrency((earningsBreakdown.totalRevenue / views) * 1000)}</S.MetricValue>
                  </S.MetricItem>
                  <S.MetricItem>
                    <S.MetricLabel>Effective CPM</S.MetricLabel>
                    <S.MetricValue>${((earningsBreakdown.adRevenue / views) * 1000).toFixed(2)}</S.MetricValue>
                  </S.MetricItem>
                  <S.MetricItem>
                    <S.MetricLabel>Videos Needed for $1K/month</S.MetricLabel>
                    <S.MetricValue>{Math.ceil(1000 / earningsBreakdown.totalRevenue)}</S.MetricValue>
                  </S.MetricItem>
                  <S.MetricItem>
                    <S.MetricLabel>Videos Needed for $5K/month</S.MetricLabel>
                    <S.MetricValue>{Math.ceil(5000 / earningsBreakdown.totalRevenue)}</S.MetricValue>
                  </S.MetricItem>
                </S.MetricsList>
              </S.ComparisonCard>
            </S.ResultsGrid>

            {calculationHistory.length > 1 && (
              <S.HistoryCard>
                <S.CardTitle>
                  <i className="bx bx-history"></i>
                  Recent Calculations
                </S.CardTitle>
                <S.HistoryList>
                  {calculationHistory.slice(0, 5).map((calc) => (
                    <S.HistoryItem key={calc.id}>
                      <S.HistoryIcon>
                        <i className={`bx ${categoryRates[calc.category]?.icon || 'bx-video'}`}></i>
                      </S.HistoryIcon>
                      <S.HistoryDetails>
                        <S.HistoryTitle>
                          {formatNumber(calc.views)} views • {calc.videoLength}min • {categoryRates[calc.category]?.name}
                        </S.HistoryTitle>
                        <S.HistoryDate>
                          {calc.date.toLocaleDateString()}
                        </S.HistoryDate>
                      </S.HistoryDetails>
                      <S.HistoryRevenue>
                        {formatCurrency(calc.earnings.totalRevenue)}
                      </S.HistoryRevenue>
                    </S.HistoryItem>
                  ))}
                </S.HistoryList>
              </S.HistoryCard>
            )}

            <S.ActionButtons>
              <S.SecondaryButton onClick={() => setCurrentStep('input')}>
                <i className="bx bx-refresh"></i>
                New Calculation
              </S.SecondaryButton>
              <S.PrimaryButton onClick={() => {
                const report = `YouTube Revenue Calculator Results\n\nVideo Details:\n- Views: ${formatNumber(views)}\n- Length: ${videoLength} minutes\n- Category: ${categoryRates[selectedCategory].name}\n\nRevenue Breakdown:\n- Ad Revenue: ${formatCurrency(earningsBreakdown.adRevenue)}\n- Total Revenue: ${formatCurrency(earningsBreakdown.totalRevenue)}\n\nGenerated by YouTube Revenue Calculator`;
                navigator.clipboard.writeText(report);
                alert('Report copied to clipboard!');
              }}>
                <i className="bx bx-copy"></i>
                Copy Report
              </S.PrimaryButton>
            </S.ActionButtons>
          </S.ResultSection>
        )}
      </S.MainContainer>
    </S.PageWrapper>
    </>
  );
};

export default YouTubeCalculator;