// src/pages/Tools/components/SubscribeLinkGenerator/SubscribeLinkGenerator.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SEO } from '../../../../components/SEO';
import { toolsSEO, generateToolSchema } from '../../../../config/toolsSEO';
import * as S from './styles';

interface ChannelInfo {
  id: string;
  title: string;
  thumbnail: string;
  banner?: string;
  subscriberCount: number;
  videoCount: number;
  totalViews: number;
  customUrl: string;
  channelId: string;  // Always the channel ID
  isChannelId: boolean;  // True if we're using channel ID format, false for handle
  description: string;
  publishedAt: string;
  country?: string;
  keywords?: string[];
  uploads?: RecentVideo[];
}

interface RecentVideo {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  views: number;
}

interface LinkVariation {
  name: string;
  url: string;
  description: string;
  icon: string;
}

export const SubscribeLinkGenerator: React.FC = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [channelInfo, setChannelInfo] = useState<ChannelInfo | null>(null);
  const [copiedLink, setCopiedLink] = useState<string>('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Tool configuration
  const toolConfig = {
    name: 'Subscribe Link Generator',
    description: 'Generate professional subscribe links and channel cards for YouTube creators',
    image: 'https://64.media.tumblr.com/12a9d70197335903fdf345505df6b606/0e01452f9f6dd974-2d/s2048x3072/2f17ae0cb670be14c7c35f8084d926da44afd456.jpg',
    icon: 'bx bx-link',
    features: [
      'Multiple link variations',
      'Channel preview cards',
      'QR code generation'
    ]
  };

  const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY_5;

  useEffect(() => {
    if (channelId) {
      setUrl(channelId);
      // Check if it's a channel ID format
      const isChannelId = channelId.startsWith('UC') && channelId.length === 24;
      handleSubmit(undefined, channelId, isChannelId);
    }

    // Load search history
    const history = localStorage.getItem('subscribe_history');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, [channelId]);

  const saveToHistory = (handle: string) => {
    const handleToSave = handle.startsWith('@') ? handle : `@${handle}`;
    const newHistory = [handleToSave, ...searchHistory.filter(h => h !== handleToSave)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('subscribe_history', JSON.stringify(newHistory));
  };

  const extractChannelHandle = (url: string): { handle: string; isChannelId: boolean } | null => {
    // Direct handle or channel ID
    if (url.match(/^@?[A-Za-z0-9_-]+$/)) {
      const handle = url.startsWith('@') ? url.substring(1) : url;
      // Check if it's a channel ID (starts with UC and is 24 characters)
      const isChannelId = handle.startsWith('UC') && handle.length === 24;
      return { handle, isChannelId };
    }

    // URL patterns
    const patterns = [
      { regex: /youtube\.com\/@([^/?]+)/, isChannelId: false },
      { regex: /youtube\.com\/channel\/([^/?]+)/, isChannelId: true },
      { regex: /youtube\.com\/c\/([^/?]+)/, isChannelId: false },
      { regex: /youtube\.com\/user\/([^/?]+)/, isChannelId: false },
      { regex: /youtube\.com\/([^/?]+)$/, isChannelId: false },  // Matches youtube.com/moneyguyshow
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern.regex);
      if (match) {
        return { handle: match[1], isChannelId: pattern.isChannelId };
      }
    }

    return null;
  };

  const fetchChannelInfo = async (handle: string, isChannelId: boolean): Promise<ChannelInfo> => {
    try {
      // Try multiple methods to find the channel
      let channelData = null;

      if (isChannelId) {
        // If it's a channel ID, fetch directly by ID
        let response = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?` +
          `part=snippet,statistics,brandingSettings&` +
          `id=${handle}&` +
          `key=${API_KEY}`
        );
        let data = await response.json();
        if (data.items && data.items.length > 0) {
          channelData = data.items[0];
        }
      } else {
        // Method 1: Try by handle
        let response = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?` +
          `part=snippet,statistics,brandingSettings&` +
          `forHandle=${handle}&` +
          `key=${API_KEY}`
        );
        let data = await response.json();

        if (data.items && data.items.length > 0) {
          channelData = data.items[0];
        } else {
          // Method 2: Search for channel
          response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?` +
            `part=snippet&` +
            `q=${encodeURIComponent(handle)}&` +
            `type=channel&` +
            `key=${API_KEY}`
          );
          data = await response.json();

          if (data.items && data.items.length > 0) {
            // Get full channel info
            const channelId = data.items[0].id.channelId;
            response = await fetch(
              `https://www.googleapis.com/youtube/v3/channels?` +
              `part=snippet,statistics,brandingSettings&` +
              `id=${channelId}&` +
              `key=${API_KEY}`
            );
            data = await response.json();
            channelData = data.items[0];
          }
        }
      }

      if (!channelData) {
        throw new Error('Channel not found');
      }

      // Get recent uploads
      const uploadsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet&` +
        `channelId=${channelData.id}&` +
        `type=video&` +
        `order=date&` +
        `maxResults=3&` +
        `key=${API_KEY}`
      );
      const uploadsData = await uploadsResponse.json();

      const uploads: RecentVideo[] = uploadsData.items?.map((video: any) => ({
        id: video.id.videoId,
        title: video.snippet.title,
        thumbnail: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default.url,
        publishedAt: video.snippet.publishedAt,
        views: 0 // Would need additional API call for views
      })) || [];

      // Extract the custom URL if available, otherwise use the handle
      // Remove @ if it's already there to avoid duplication
      let customUrl = channelData.snippet.customUrl || handle;
      if (customUrl.startsWith('@')) {
        customUrl = customUrl.substring(1);
      }

      return {
        id: channelData.id,
        title: channelData.snippet.title,
        thumbnail: channelData.snippet.thumbnails.high?.url || channelData.snippet.thumbnails.default.url,
        banner: channelData.brandingSettings?.image?.bannerExternalUrl,
        subscriberCount: parseInt(channelData.statistics.subscriberCount) || 0,
        videoCount: parseInt(channelData.statistics.videoCount) || 0,
        totalViews: parseInt(channelData.statistics.viewCount) || 0,
        customUrl: customUrl,
        channelId: channelData.id,
        isChannelId: isChannelId || !channelData.snippet.customUrl,
        description: channelData.snippet.description || '',
        publishedAt: channelData.snippet.publishedAt,
        country: channelData.snippet.country,
        keywords: channelData.brandingSettings?.channel?.keywords?.split(',') || [],
        uploads
      };
    } catch (error) {
      console.error('Error fetching channel:', error);
      throw new Error('Failed to fetch channel information');
    }
  };

  const getLinkVariations = (channelInfo: ChannelInfo): LinkVariation[] => {
    // Use channel ID format if we don't have a custom URL or if we're dealing with a channel ID
    const baseUrl = channelInfo.isChannelId
      ? `https://www.youtube.com/channel/${channelInfo.channelId}`
      : `https://www.youtube.com/@${channelInfo.customUrl}`;
    
    const mobileBaseUrl = channelInfo.isChannelId
      ? `https://m.youtube.com/channel/${channelInfo.channelId}`
      : `https://m.youtube.com/@${channelInfo.customUrl}`;

    return [
      {
        name: 'Standard Subscribe',
        url: `${baseUrl}?sub_confirmation=1`,
        description: 'Basic subscribe link with confirmation dialog',
        icon: 'bx bx-user-plus'
      },
      {
        name: 'Subscribe + Bell',
        url: `${baseUrl}?sub_confirmation=1&feature=subscribe`,
        description: 'Subscribe link with notification bell prompt',
        icon: 'bx bx-bell-plus'
      },
      {
        name: 'Channel Homepage',
        url: baseUrl,
        description: 'Direct link to channel homepage',
        icon: 'bx bx-home'
      },
      {
        name: 'Mobile Optimized',
        url: `${mobileBaseUrl}?sub_confirmation=1`,
        description: 'Mobile-optimized subscribe link',
        icon: 'bx bx-mobile'
      }
    ];
  };

  const handleSearch = () => {
    const channelData = extractChannelHandle(url);
    if (channelData) {
      // Instead of navigating, directly process the channel
      handleSubmit(undefined, channelData.handle, channelData.isChannelId);
    } else {
      alert('Please enter a valid YouTube channel URL or handle');
    }
  };

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>, directHandle?: string, directIsChannelId?: boolean) => {
    if (e) e.preventDefault();

    let handle: string;
    let isChannelId: boolean;
    
    if (directHandle !== undefined && directIsChannelId !== undefined) {
      handle = directHandle;
      isChannelId = directIsChannelId;
    } else {
      const channelData = extractChannelHandle(url);
      if (!channelData) {
        alert('Please enter a valid YouTube channel URL or handle');
        return;
      }
      handle = channelData.handle;
      isChannelId = channelData.isChannelId;
    }

    setIsLoading(true);
    setChannelInfo(null);
    setCopiedLink('');

    try {
      const info = await fetchChannelInfo(handle, isChannelId);
      setChannelInfo(info);
      saveToHistory(handle);

      // Optional: Update URL without navigation to allow direct linking
      if (window.history && window.history.pushState) {
        const newUrl = `/tools/subscribe-link-generator/${handle}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to fetch channel information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (link: string, linkName: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(linkName);
      setTimeout(() => setCopiedLink(''), 2000);
    } catch (err) {
      alert('Failed to copy link');
    }
  };

  const downloadQRCode = async (url: string) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(url)}`;
    const response = await fetch(qrUrl);
    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${channelInfo?.title}_subscribe_qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  };

  const shareChannel = async () => {
    if (!channelInfo) return;

    const shareData = {
      title: `Subscribe to ${channelInfo.title}`,
      text: `Check out this YouTube channel: ${channelInfo.title}`,
      url: getLinkVariations(channelInfo)[0].url
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback - copy to clipboard
      await handleCopy(shareData.url, 'Share Link');
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const getChannelAge = (publishedAt: string): string => {
    const now = new Date();
    const published = new Date(publishedAt);
    const years = now.getFullYear() - published.getFullYear();
    return `${years} year${years !== 1 ? 's' : ''} old`;
  };

  const seoConfig = toolsSEO['subscribe-link-generator'];
  const schemaData = generateToolSchema('subscribe-link-generator', seoConfig);

  return (
    <>
      <SEO
        title={seoConfig.title}
        description={seoConfig.description}
        keywords={seoConfig.keywords}
        canonical="https://youtool.io/tools/subscribe-link-generator"
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
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter your channel URL to generate subscribe link"
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

        {searchHistory.length > 0 && !channelInfo && (
          <S.HistorySection>
            <S.HistoryLabel>Recent channels:</S.HistoryLabel>
            <S.HistoryList>
              {searchHistory.map((channel, index) => (
                <S.HistoryItem key={index} onClick={() => setUrl(channel)}>
                  <i className="bx bx-history"></i>
                  <span>{channel}</span>
                </S.HistoryItem>
              ))}
            </S.HistoryList>
          </S.HistorySection>
        )}

        {/* Educational Content Section */}
        {!channelInfo && !isLoading && (
          <S.EducationalSection>
            <S.EducationalContent>
              <S.SectionSubTitle>How to Use the Subscribe Link Generator</S.SectionSubTitle>

              <S.EducationalText>
                Our Subscribe Link Generator creates professional subscription links and channel preview cards
                for YouTube creators. Generate multiple link variations, download QR codes, and get tools to
                help grow your subscriber base with optimized subscription experiences.
              </S.EducationalText>

              <S.StepByStep>
                <S.StepItem>
                  <S.StepNumberCircle>1</S.StepNumberCircle>
                  <S.StepContent>
                    <S.SubscribeLinkGeneratorStepTitle>Enter Channel Information</S.SubscribeLinkGeneratorStepTitle>
                    <S.EducationalText>
                      Input your YouTube channel URL, @handle, or channel ID. Our system automatically
                      fetches channel metadata including subscriber count, video statistics, and recent
                      uploads to create a comprehensive channel preview.
                    </S.EducationalText>
                  </S.StepContent>
                </S.StepItem>

                <S.StepItem>
                  <S.StepNumberCircle>2</S.StepNumberCircle>
                  <S.StepContent>
                    <S.SubscribeLinkGeneratorStepTitle>Generate Multiple Link Variations</S.SubscribeLinkGeneratorStepTitle>
                    <S.EducationalText>
                      Access various subscribe link formats including direct subscription links, channel
                      homepage links, and specialized URLs for different marketing purposes. Each variation
                      is optimized for specific use cases and platforms.
                    </S.EducationalText>
                  </S.StepContent>
                </S.StepItem>

                <S.StepItem>
                  <S.StepNumberCircle>3</S.StepNumberCircle>
                  <S.StepContent>
                    <S.SubscribeLinkGeneratorStepTitle>Download & Share Assets</S.SubscribeLinkGeneratorStepTitle>
                    <S.EducationalText>
                      Copy generated links, download QR codes for offline promotion, and use the channel
                      preview cards for social media marketing. Share your channel professionally across
                      different platforms and marketing materials.
                    </S.EducationalText>
                  </S.StepContent>
                </S.StepItem>
              </S.StepByStep>
            </S.EducationalContent>

            <S.EducationalContent>
              <S.SectionSubTitle>Subscribe Link Features</S.SectionSubTitle>

              <S.FeatureList>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Direct Subscribe Links:</strong> Create immediate subscription links that bypass the channel page</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Channel Preview Cards:</strong> Professional-looking channel cards with subscriber counts and recent videos</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>QR Code Generation:</strong> Downloadable QR codes for offline marketing and promotional materials</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Multiple Link Formats:</strong> Various URL structures optimized for different platforms and use cases</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Channel Analytics:</strong> Display subscriber count, video count, and total view statistics</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Social Media Ready:</strong> Links and cards optimized for sharing across social platforms</span>
                </S.FeatureListItem>
              </S.FeatureList>

              <S.EducationalText>
                Perfect for content creators, marketers, and businesses looking to grow their YouTube presence.
                Use these professional subscription tools to increase subscriber conversion rates, enhance
                marketing campaigns, and create consistent branding across all promotional materials.
              </S.EducationalText>
            </S.EducationalContent>
          </S.EducationalSection>
        )}

        {isLoading && (
          <S.LoadingContainer>
            <i className='bx bx-loader-alt bx-spin'></i>
            <p>Fetching channel information...</p>
          </S.LoadingContainer>
        )}

        {channelInfo && (
          <S.ResultsContainer>
            {/* Premium Channel Card */}
            <S.ChannelCard>
              {channelInfo.banner && (
                <S.ChannelBanner
                  src={channelInfo.banner}
                  alt="Channel banner"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}

              <S.ChannelContent>
                <S.ChannelHeader>
                  <S.ChannelAvatar src={channelInfo.thumbnail} alt={channelInfo.title} />
                  <S.ChannelInfo>
                    <S.ChannelTitle>{channelInfo.title}</S.ChannelTitle>
                    <S.ChannelHandle>{channelInfo.isChannelId ? `Channel ID: ${channelInfo.channelId}` : `@${channelInfo.customUrl}`}</S.ChannelHandle>
                    <S.ChannelMeta>
                      <S.MetaItem>
                        <i className="bx bx-user"></i>
                        {formatNumber(channelInfo.subscriberCount)} subscribers
                      </S.MetaItem>
                      <S.MetaItem>
                        <i className="bx bx-video"></i>
                        {formatNumber(channelInfo.videoCount)} videos
                      </S.MetaItem>
                      <S.MetaItem>
                        <i className="bx bx-show"></i>
                        {formatNumber(channelInfo.totalViews)} views
                      </S.MetaItem>
                      <S.MetaItem>
                        <i className="bx bx-calendar"></i>
                        {getChannelAge(channelInfo.publishedAt)}
                      </S.MetaItem>
                    </S.ChannelMeta>
                  </S.ChannelInfo>

                  <S.ChannelActions>
                    <S.ActionButton onClick={shareChannel}>
                      <i className="bx bx-share"></i>
                      Share
                    </S.ActionButton>
                  </S.ChannelActions>
                </S.ChannelHeader>

                {channelInfo.description && (
                  <S.ChannelDescription>
                    {channelInfo.description.length > 200
                      ? channelInfo.description.substring(0, 200) + '...'
                      : channelInfo.description
                    }
                  </S.ChannelDescription>
                )}

                {channelInfo.uploads && channelInfo.uploads.length > 0 && (
                  <S.RecentUploads>
                    <S.SectionTitle>Recent Videos</S.SectionTitle>
                    <S.VideoGrid>
                      {channelInfo.uploads.map((video) => (
                        <S.VideoCard
                          key={video.id}
                          onClick={() => window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank')}
                        >
                          <S.VideoThumbnail src={video.thumbnail} alt={video.title} />
                          <S.VideoTitle>{video.title}</S.VideoTitle>
                          <S.VideoDate>
                            {new Date(video.publishedAt).toLocaleDateString()}
                          </S.VideoDate>
                        </S.VideoCard>
                      ))}
                    </S.VideoGrid>
                  </S.RecentUploads>
                )}
              </S.ChannelContent>
            </S.ChannelCard>

            {/* Link Generation Section */}
            <S.LinksSection>
              <S.SectionTitle>
                <i className="bx bx-link"></i>
                Subscribe Link Variations
              </S.SectionTitle>

              <S.LinkVariations>
                {getLinkVariations(channelInfo).map((variation, index) => (
                  <S.LinkCard key={index}>
                    <S.LinkHeader>
                      <S.LinkIcon className={variation.icon}></S.LinkIcon>
                      <S.LinkInfo>
                        <S.LinkName>{variation.name}</S.LinkName>
                        <S.LinkDescription>{variation.description}</S.LinkDescription>
                      </S.LinkInfo>
                    </S.LinkHeader>

                    <S.LinkUrl>{variation.url}</S.LinkUrl>

                    <S.LinkActions>
                      <S.CopyButton
                        onClick={() => handleCopy(variation.url, variation.name)}
                        copied={copiedLink === variation.name}
                      >
                        {copiedLink === variation.name ? (
                          <>
                            <i className="bx bx-check"></i>
                            Copied!
                          </>
                        ) : (
                          <>
                            <i className="bx bx-copy"></i>
                            Copy
                          </>
                        )}
                      </S.CopyButton>

                      <S.QRButton onClick={() => downloadQRCode(variation.url)}>
                        <i className="bx bx-qr"></i>
                        QR Code
                      </S.QRButton>
                    </S.LinkActions>
                  </S.LinkCard>
                ))}
              </S.LinkVariations>
            </S.LinksSection>
          </S.ResultsContainer>
        )}
      </S.MainContainer>
    </S.PageWrapper>
    </>
  );
};

export default SubscribeLinkGenerator;