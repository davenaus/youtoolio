// src/pages/Tools/components/YouTubeCalculator/YouTubeCalculator.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../../../../components/SEO';
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
  const [currentStep, setCurrentStep] = useState<'input' | 'channel' | 'advanced' | 'results'>('input');
  const [isCalculating, setIsCalculating] = useState(false);

  // Tool configuration
  const toolConfig = {
    name: 'YouTube Calculator',
    description: 'Estimate your potential YouTube earnings based on views, video length, and content category',
    image: 'https://64.media.tumblr.com/95def04a5eda69c7703fca45158d5256/0e01452f9f6dd974-57/s2048x3072/ec37f2775fabde8ea0dc7ba6e16a91cfe8d8870d.jpg',
    icon: 'bx bx-dollar-circle',
    features: [
      'Revenue estimation',
      'Category-based CPM',
      'Advanced analytics'
    ]
  };

  // Basic video data
  const [videoLength, setVideoLength] = useState<number>(10);
  const [views, setViews] = useState<number>(10000);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Channel data
  const [channelData, setChannelData] = useState<ChannelData>({
    subscribers: 1000,
    avgViews: 5000,
    engagementRate: 3.5,
    category: '',
    country: 'US',
    isMonetized: true
  });

  // Advanced settings
  const [premiumTraffic, setPremiumTraffic] = useState<number>(15);
  const [seasonalMultiplier, setSeasonalMultiplier] = useState<number>(1.0);
  const [adBlockRate, setAdBlockRate] = useState<number>(25);
  const [ctr, setCtr] = useState<number>(2.1);

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

  const calculateEarnings = useCallback((): EarningsBreakdown => {
    if (!selectedCategory) return { adRevenue: 0, membershipRevenue: 0, sponsorshipRevenue: 0, merchandiseRevenue: 0, totalRevenue: 0, yearlyProjection: 0 };

    const category = categoryRates[selectedCategory];
    const countryMultiplier = countryMultipliers[channelData.country] || 0.5;

    // Base CPM calculation (much more conservative)
    let baseCpm = category.cpm * countryMultiplier;

    // Video length factor (more realistic)
    let lengthMultiplier = 1;
    if (videoLength >= 8) {
      lengthMultiplier = 1 + ((videoLength - 8) * 0.02); // Small boost for longer videos
    } else if (videoLength < 4) {
      lengthMultiplier = 0.7; // Penalty for very short videos
    }

    // Premium traffic adjustment (reduced impact)
    const premiumAdjustment = 1 + (premiumTraffic / 100 * 0.2);

    // Engagement adjustment (smaller impact)
    const engagementAdjustment = 1 + ((channelData.engagementRate - 2) * 0.05);

    // Ad block adjustment (realistic ad block rates)
    const effectiveViews = views * (1 - adBlockRate / 100);

    // Only 40-60% of views typically see ads (realistic monetized views)
    const monetizedViews = effectiveViews * 0.5;

    // Seasonal adjustment
    baseCpm *= seasonalMultiplier;

    // CTR adjustment (smaller impact)
    const ctrAdjustment = ctr / 2.1; // 2.1% is average CTR

    // Final CPM (more realistic)
    const finalCpm = baseCpm * lengthMultiplier * premiumAdjustment * engagementAdjustment * ctrAdjustment;

    // Calculate ad revenue (YouTube takes 45%, creator gets 55%)
    const grossAdRevenue = (monetizedViews / 1000) * finalCpm;
    const adRevenue = grossAdRevenue * 0.55; // YouTube's actual revenue split

    // Much more conservative other revenue streams

    // Membership revenue (very conservative)
    const membershipRevenue = channelData.subscribers > 1000 ?
      Math.min((channelData.subscribers / 10000) * (views / channelData.avgViews) * 0.5, adRevenue * 0.1) : 0;

    // Sponsorship potential (very conservative, only for larger channels)
    const sponsorshipRevenue = channelData.subscribers > 50000 ?
      (views / 10000) * 0.2 * (channelData.engagementRate / 5) : 0;

    // Merchandise potential (very conservative)
    const merchandiseRevenue = channelData.subscribers > 10000 ?
      views * 0.0001 * (channelData.engagementRate / 8) : 0;

    const totalRevenue = adRevenue + membershipRevenue + sponsorshipRevenue + merchandiseRevenue;

    // More realistic yearly projection (assumes consistent performance with some growth)
    const monthlyRevenue = totalRevenue * 4; // 4 videos per month assumption
    const yearlyProjection = monthlyRevenue * 12 * (1 + Math.min(channelData.engagementRate / 100, 0.05));

    return {
      adRevenue: Math.max(0, adRevenue),
      membershipRevenue: Math.max(0, membershipRevenue),
      sponsorshipRevenue: Math.max(0, sponsorshipRevenue),
      merchandiseRevenue: Math.max(0, merchandiseRevenue),
      totalRevenue: Math.max(0, totalRevenue),
      yearlyProjection: Math.max(0, yearlyProjection)
    };
  }, [videoLength, views, selectedCategory, channelData, premiumTraffic, seasonalMultiplier, adBlockRate, ctr]);

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
      tips.push({ icon: 'bx-time', text: 'Consider videos 8+ minutes for mid-roll ads', type: 'warning' as const });
    }

    if (channelData.engagementRate < 3) {
      tips.push({ icon: 'bx-heart', text: 'Improve engagement with CTAs and community posts', type: 'info' as const });
    }

    if (premiumTraffic < 20) {
      tips.push({ icon: 'bx-target-lock', text: 'Target higher-value demographics', type: 'success' as const });
    }

    if (channelData.subscribers < 10000) {
      tips.push({ icon: 'bx-user-plus', text: 'Focus on subscriber growth for sponsorship opportunities', type: 'info' as const });
    }

    return tips;
  };

  const renderStepIndicator = () => (
    <S.StepIndicator>
      <S.Step active={currentStep === 'input'} completed={['channel', 'advanced', 'results'].includes(currentStep)}>
        <S.StepNumber active={currentStep === 'input'} completed={['channel', 'advanced', 'results'].includes(currentStep)}>1</S.StepNumber>
        <S.StepLabel active={currentStep === 'input'} completed={['channel', 'advanced', 'results'].includes(currentStep)}>Video Details</S.StepLabel>
      </S.Step>
      <S.StepConnector completed={['advanced', 'results'].includes(currentStep)} />
      <S.Step active={currentStep === 'channel'} completed={['advanced', 'results'].includes(currentStep)}>
        <S.StepNumber active={currentStep === 'channel'} completed={['advanced', 'results'].includes(currentStep)}>2</S.StepNumber>
        <S.StepLabel active={currentStep === 'channel'} completed={['advanced', 'results'].includes(currentStep)}>Channel Info</S.StepLabel>
      </S.Step>
      <S.StepConnector completed={currentStep === 'results'} />
      <S.Step active={currentStep === 'advanced'} completed={currentStep === 'results'}>
        <S.StepNumber active={currentStep === 'advanced'} completed={currentStep === 'results'}>3</S.StepNumber>
        <S.StepLabel active={currentStep === 'advanced'} completed={currentStep === 'results'}>Advanced</S.StepLabel>
      </S.Step>
      <S.StepConnector completed={currentStep === 'results'} />
      <S.Step active={currentStep === 'results'} completed={false}>
        <S.StepNumber active={currentStep === 'results'} completed={false}>4</S.StepNumber>
        <S.StepLabel active={currentStep === 'results'} completed={false}>Results</S.StepLabel>
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

        {renderStepIndicator()}

        {/* Step 1: Video Details */}
        {currentStep === 'input' && (
          <S.InputSection>
            <S.SectionTitle>
              <i className="bx bx-video"></i>
              Video Details
            </S.SectionTitle>

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

            <S.ActionButtons>
              <S.PrimaryButton
                onClick={() => setCurrentStep('channel')}
                disabled={!selectedCategory}
              >
                <i className="bx bx-right-arrow-alt"></i>
                Next: Channel Information
              </S.PrimaryButton>
            </S.ActionButtons>
          </S.InputSection>
        )}

        {/* Step 2: Channel Information */}
        {currentStep === 'channel' && (
          <S.ChannelSection>
            <S.SectionTitle>
              <i className="bx bx-user"></i>
              Channel Information
            </S.SectionTitle>

            <S.ChannelGrid>
              <S.ChannelCard>
                <S.CardTitle>
                  <i className="bx bx-user-plus"></i>
                  Subscriber Count
                </S.CardTitle>
                <S.SliderContainer>
                  <S.SliderLabel>
                    <span>0</span>
                    <span>{formatNumber(channelData.subscribers)}</span>
                    <span>10M</span>
                  </S.SliderLabel>
                  <S.Slider
                    type="range"
                    min={0}
                    max={10000000}
                    value={channelData.subscribers}
                    onChange={(e) => setChannelData(prev => ({ ...prev, subscribers: parseInt(e.target.value) }))}
                    step={channelData.subscribers >= 100000 ? 50000 : channelData.subscribers >= 10000 ? 5000 : 100}
                  />
                </S.SliderContainer>
              </S.ChannelCard>

              <S.ChannelCard>
                <S.CardTitle>
                  <i className="bx bx-trending-up"></i>
                  Average Views Per Video
                </S.CardTitle>
                <S.SliderContainer>
                  <S.SliderLabel>
                    <span>100</span>
                    <span>{formatNumber(channelData.avgViews)}</span>
                    <span>5M</span>
                  </S.SliderLabel>
                  <S.Slider
                    type="range"
                    min={100}
                    max={5000000}
                    value={channelData.avgViews}
                    onChange={(e) => setChannelData(prev => ({ ...prev, avgViews: parseInt(e.target.value) }))}
                    step={channelData.avgViews >= 50000 ? 25000 : channelData.avgViews >= 5000 ? 2500 : 100}
                  />
                </S.SliderContainer>
              </S.ChannelCard>

              <S.ChannelCard>
                <S.CardTitle>
                  <i className="bx bx-heart"></i>
                  Engagement Rate
                </S.CardTitle>
                <S.SliderContainer>
                  <S.SliderLabel>
                    <span>0%</span>
                    <span>{channelData.engagementRate.toFixed(1)}%</span>
                    <span>15%</span>
                  </S.SliderLabel>
                  <S.Slider
                    type="range"
                    min={0}
                    max={15}
                    step={0.1}
                    value={channelData.engagementRate}
                    onChange={(e) => setChannelData(prev => ({ ...prev, engagementRate: parseFloat(e.target.value) }))}
                  />
                </S.SliderContainer>
                <S.InputHint>
                  Likes, comments, shares as % of views. Average is 2-4%
                </S.InputHint>
              </S.ChannelCard>

              <S.ChannelCard>
                <S.CardTitle>
                  <i className="bx bx-world"></i>
                  Primary Audience Country
                </S.CardTitle>
                <S.Select
                  value={channelData.country}
                  onChange={(e) => setChannelData(prev => ({ ...prev, country: e.target.value }))}
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
                  Different countries have varying CPM rates
                </S.InputHint>
              </S.ChannelCard>
            </S.ChannelGrid>

            <S.MonetizationCard>
              <S.CardTitle>
                <i className="bx bx-dollar"></i>
                Monetization Status
              </S.CardTitle>
              <S.MonetizationOptions>
                <S.MonetizationOption
                  active={channelData.isMonetized}
                  onClick={() => setChannelData(prev => ({ ...prev, isMonetized: true }))}
                >
                  <i className="bx bx-check-circle"></i>
                  <div>
                    <div>Monetized Channel</div>
                    <span>YouTube Partner Program enabled</span>
                  </div>
                </S.MonetizationOption>
                <S.MonetizationOption
                  active={!channelData.isMonetized}
                  onClick={() => setChannelData(prev => ({ ...prev, isMonetized: false }))}
                >
                  <i className="bx bx-x-circle"></i>
                  <div>
                    <div>Not Monetized</div>
                    <span>Working towards monetization requirements</span>
                  </div>
                </S.MonetizationOption>
              </S.MonetizationOptions>
            </S.MonetizationCard>

            <S.ActionButtons>
              <S.SecondaryButton onClick={() => setCurrentStep('input')}>
                <i className="bx bx-left-arrow-alt"></i>
                Back
              </S.SecondaryButton>
              <S.PrimaryButton onClick={() => setCurrentStep('advanced')}>
                <i className="bx bx-right-arrow-alt"></i>
                Next: Advanced Settings
              </S.PrimaryButton>
            </S.ActionButtons>
          </S.ChannelSection>
        )}

        {/* Step 3: Advanced Settings */}
        {currentStep === 'advanced' && (
          <S.AdvancedSection>
            <S.SectionTitle>
              <i className="bx bx-cog"></i>
              Advanced Revenue Factors
            </S.SectionTitle>

            <S.AdvancedGrid>
              <S.AdvancedCard>
                <S.CardTitle>
                  <i className="bx bx-target-lock"></i>
                  Premium Traffic %
                </S.CardTitle>
                <S.SliderContainer>
                  <S.SliderLabel>
                    <span>0%</span>
                    <span>{premiumTraffic}%</span>
                    <span>50%</span>
                  </S.SliderLabel>
                  <S.Slider
                    type="range"
                    min={0}
                    max={50}
                    value={premiumTraffic}
                    onChange={(e) => setPremiumTraffic(parseInt(e.target.value))}
                  />
                </S.SliderContainer>
                <S.InputHint>
                  Percentage of viewers from high-value demographics
                </S.InputHint>
              </S.AdvancedCard>

              <S.AdvancedCard>
                <S.CardTitle>
                  <i className="bx bx-calendar"></i>
                  Seasonal Multiplier
                </S.CardTitle>
                <S.SeasonalOptions>
                  <S.SeasonalOption
                    active={seasonalMultiplier === 1.4}
                    onClick={() => setSeasonalMultiplier(1.4)}
                  >
                    <i className="bx bx-gift"></i>
                    <div>Holiday Season</div>
                    <span>+40% CPM</span>
                  </S.SeasonalOption>
                  <S.SeasonalOption
                    active={seasonalMultiplier === 1.2}
                    onClick={() => setSeasonalMultiplier(1.2)}
                  >
                    <i className="bx bx-trending-up"></i>
                    <div>High Season</div>
                    <span>+20% CPM</span>
                  </S.SeasonalOption>
                  <S.SeasonalOption
                    active={seasonalMultiplier === 1.0}
                    onClick={() => setSeasonalMultiplier(1.0)}
                  >
                    <i className="bx bx-minus"></i>
                    <div>Normal</div>
                    <span>Base CPM</span>
                  </S.SeasonalOption>
                  <S.SeasonalOption
                    active={seasonalMultiplier === 0.8}
                    onClick={() => setSeasonalMultiplier(0.8)}
                  >
                    <i className="bx bx-trending-down"></i>
                    <div>Low Season</div>
                    <span>-20% CPM</span>
                  </S.SeasonalOption>
                </S.SeasonalOptions>
              </S.AdvancedCard>

              <S.AdvancedCard>
                <S.CardTitle>
                  <i className="bx bx-shield"></i>
                  Ad Block Rate
                </S.CardTitle>
                <S.SliderContainer>
                  <S.SliderLabel>
                    <span>0%</span>
                    <span>{adBlockRate}%</span>
                    <span>60%</span>
                  </S.SliderLabel>
                  <S.Slider
                    type="range"
                    min={0}
                    max={60}
                    value={adBlockRate}
                    onChange={(e) => setAdBlockRate(parseInt(e.target.value))}
                  />
                </S.SliderContainer>
                <S.InputHint>
                  Estimated percentage of viewers using ad blockers
                </S.InputHint>
              </S.AdvancedCard>

              <S.AdvancedCard>
                <S.CardTitle>
                  <i className="bx bx-mouse"></i>
                  Click-Through Rate
                </S.CardTitle>
                <S.SliderContainer>
                  <S.SliderLabel>
                    <span>0.5%</span>
                    <span>{ctr.toFixed(1)}%</span>
                    <span>5%</span>
                  </S.SliderLabel>
                  <S.Slider
                    type="range"
                    min={0.5}
                    max={5}
                    step={0.1}
                    value={ctr}
                    onChange={(e) => setCtr(parseFloat(e.target.value))}
                  />
                </S.SliderContainer>
                <S.InputHint>
                  Average CTR is 2.1%. Higher CTR = higher revenue
                </S.InputHint>
              </S.AdvancedCard>
            </S.AdvancedGrid>

            <S.ActionButtons>
              <S.SecondaryButton onClick={() => setCurrentStep('channel')}>
                <i className="bx bx-left-arrow-alt"></i>
                Back
              </S.SecondaryButton>
              <S.PrimaryButton onClick={handleCalculate} disabled={isCalculating}>
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
          </S.AdvancedSection>
        )}

        {/* Step 4: Results */}
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
                  Total Estimated Revenue
                </S.CardTitle>
                <S.TotalRevenue>
                  {formatCurrency(earningsBreakdown.totalRevenue * 0.7)} - {formatCurrency(earningsBreakdown.totalRevenue * 1.3)}
                </S.TotalRevenue>
                <S.YearlyProjection>
                  <i className="bx bx-calendar"></i>
                  Yearly Range: {formatCurrency(earningsBreakdown.yearlyProjection * 0.1)} - {formatCurrency(earningsBreakdown.yearlyProjection * 0.2)}
                </S.YearlyProjection>
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
                    <S.MetricLabel>Revenue Per 1K Views</S.MetricLabel>
                    <S.MetricValue>{formatCurrency((earningsBreakdown.totalRevenue / views) * 1000)}</S.MetricValue>
                  </S.MetricItem>
                  <S.MetricItem>
                    <S.MetricLabel>Effective CPM</S.MetricLabel>
                    <S.MetricValue>${((earningsBreakdown.adRevenue / views) * 1000).toFixed(2)}</S.MetricValue>
                  </S.MetricItem>
                  <S.MetricItem>
                    <S.MetricLabel>Revenue Per Subscriber</S.MetricLabel>
                    <S.MetricValue>{formatCurrency(earningsBreakdown.totalRevenue / Math.max(channelData.subscribers, 1))}</S.MetricValue>
                  </S.MetricItem>
                  <S.MetricItem>
                    <S.MetricLabel>Videos Needed for $1K/month</S.MetricLabel>
                    <S.MetricValue>{Math.ceil(1000 / earningsBreakdown.totalRevenue)}</S.MetricValue>
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
                const report = `YouTube Revenue Calculator Results\n\nVideo Details:\n- Views: ${formatNumber(views)}\n- Length: ${videoLength} minutes\n- Category: ${categoryRates[selectedCategory].name}\n\nRevenue Breakdown:\n- Ad Revenue: ${formatCurrency(earningsBreakdown.adRevenue)}\n- Total Revenue: ${formatCurrency(earningsBreakdown.totalRevenue)}\n- Yearly Projection: ${formatCurrency(earningsBreakdown.yearlyProjection)}\n\nGenerated by YouTube Revenue Calculator`;
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