import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ToolPageWrapper } from '../../../../components/ToolPageWrapper';
import { SEO } from '../../../../components/SEO';
import { toolsSEO, generateToolSchema } from '../../../../config/toolsSEO';
import * as S from './styles';

interface BannerInfo {
  channelId: string;
  channelTitle: string;
  bannerUrl: string;
  fullSizeBannerUrl: string;
}

export const BannerDownloader: React.FC = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const navigate = useNavigate();
  const [channelUrl, setChannelUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bannerInfo, setBannerInfo] = useState<BannerInfo | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // SEO setup
  const seoConfig = toolsSEO['banner-downloader'];
  const schemaData = generateToolSchema('banner-downloader', seoConfig);

  // Tool configuration
  const toolConfig = {
    name: 'Channel Banner Downloader',
    description: 'Download full-resolution YouTube channel banners in the highest quality available',
    image: 'https://64.media.tumblr.com/10ccc3757948e253900a92bc6ce226ab/0e01452f9f6dd974-3b/s2048x3072/62471a32052a5c06b185d9c0242331a986f0cca6.jpg',
    icon: 'bx bx-image',
    features: [
      'Full resolution downloads (2120px)',
      'Multiple channel formats',
      'Instant preview & download'
    ]
  };

  useEffect(() => {
    const history = localStorage.getItem('banner_download_history');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }

    if (channelId) {
      setChannelUrl(`https://youtube.com/channel/${channelId}`);
      handleDownload(channelId);
    }
  }, [channelId]);

  const saveToHistory = (url: string) => {
    const newHistory = [url, ...searchHistory.filter(h => h !== url)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('banner_download_history', JSON.stringify(newHistory));
  };

  const getFullSizeBannerUrl = (bannerUrl: string): string => {
    if (!bannerUrl) return '';

    if (bannerUrl.includes('=w')) {
      return bannerUrl.replace(/=w\d+-.+/, '=w2120-fcrop64=1,00000000ffffffff-k-c0xffffffff-no-nd-rj');
    }

    return `${bannerUrl}=w2120-fcrop64=1,00000000ffffffff-k-c0xffffffff-no-nd-rj`;
  };

  const extractChannelId = (url: string): string | null => {
    const patterns = [
      /youtube\.com\/channel\/([A-Za-z0-9_-]+)/,
      /youtube\.com\/c\/([A-Za-z0-9_-]+)/,
      /youtube\.com\/user\/([A-Za-z0-9_-]+)/,
      /youtube\.com\/@([A-Za-z0-9_.-]+)/,
      /^UC[A-Za-z0-9_-]{22}$/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  };

  const fetchBannerBySearch = async (searchTerm: string): Promise<string> => {
    const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY_4;

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&type=channel&q=${encodeURIComponent(searchTerm)}&` +
      `maxResults=1&key=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.items || data.items.length === 0) {
      throw new Error('Channel not found');
    }

    return data.items[0].snippet.channelId;
  };

  const handleDownload = async (channelIdParam?: string) => {
    let idToFetch = channelIdParam;

    if (!idToFetch) {
      if (!channelUrl.trim()) {
        setError('Please enter a channel URL, handle, or name');
        return;
      }

      const extracted = extractChannelId(channelUrl);
      if (extracted) {
        idToFetch = extracted;
      } else {
        try {
          setIsLoading(true);
          setError(null);
          idToFetch = await fetchBannerBySearch(channelUrl);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to find channel');
          setIsLoading(false);
          return;
        }
      }
    }

    try {
      setIsLoading(true);
      setError(null);

      const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY_4;
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?` +
        `part=snippet,brandingSettings&id=${idToFetch}&key=${API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.items || data.items.length === 0) {
        throw new Error('Channel not found');
      }

      const channel = data.items[0];
      const bannerUrl = channel.brandingSettings?.image?.bannerExternalUrl;

      if (!bannerUrl) {
        throw new Error('This channel does not have a custom banner image');
      }

      const info: BannerInfo = {
        channelId: channel.id,
        channelTitle: channel.snippet.title,
        bannerUrl: bannerUrl,
        fullSizeBannerUrl: getFullSizeBannerUrl(bannerUrl)
      };

      setBannerInfo(info);
      saveToHistory(channelUrl);

      if (!channelIdParam) {
        navigate(`/tools/banner-downloader/${idToFetch}`, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setBannerInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHeaderSearch = () => {
    if (!channelUrl.trim()) {
      alert('Please enter a channel URL, handle, or name');
      return;
    }
    handleDownload();
  };

  const handleCopyUrl = () => {
    if (bannerInfo) {
      navigator.clipboard.writeText(bannerInfo.fullSizeBannerUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const handleDownloadImage = () => {
    if (bannerInfo) {
      const link = document.createElement('a');
      link.href = bannerInfo.fullSizeBannerUrl;
      link.download = `${bannerInfo.channelTitle.replace(/[^a-z0-9]/gi, '_')}_banner.jpg`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleReset = () => {
    setChannelUrl('');
    setBannerInfo(null);
    setError(null);
    navigate('/tools/banner-downloader', { replace: true });
  };

  return (
    <>
      <SEO
        title={seoConfig.title}
        description={seoConfig.description}
        keywords={seoConfig.keywords}
        canonical={`https://youtool.io/tools/banner-downloader${channelId ? `/${channelId}` : ''}`}
        schemaData={schemaData}
      />
      <ToolPageWrapper
        toolKey="banner-downloader"
        customTitle={bannerInfo ? `Download ${bannerInfo.channelTitle} Banner - YouTool.io` : undefined}
      >
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
                        value={channelUrl}
                        onChange={(e) => setChannelUrl(e.target.value)}
                        placeholder="Enter channel URL, @handle, or channel name..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleHeaderSearch();
                          }
                        }}
                      />
                      <S.HeaderSearchButton onClick={handleHeaderSearch} disabled={isLoading}>
                        {isLoading ? (
                          <i className='bx bx-loader-alt bx-spin'></i>
                        ) : (
                          <i className='bx bx-download'></i>
                        )}
                      </S.HeaderSearchButton>
                    </S.HeaderSearchBar>
                  </S.HeaderSearchContainer>
                </S.HeaderTextContent>
              </S.HeaderContent>
            </S.EnhancedHeader>

            {error && (
              <S.ErrorMessage>
                <i className="bx bx-error-circle"></i>
                {error}
              </S.ErrorMessage>
            )}

            {/* Educational Content Section */}
            {!bannerInfo && (
              <S.EducationalSection>
                <S.EducationalContent>
                  <S.SectionSubTitle>How to Use the Channel Banner Downloader</S.SectionSubTitle>

                  <S.EducationalText>
                    Our Channel Banner Downloader provides instant access to full-resolution YouTube channel banners
                    (2120px width). Perfect for design inspiration, competitor research, or backing up your own channel assets.
                  </S.EducationalText>

                  <S.StepByStep>
                    <S.StepItem>
                      <S.StepNumberCircle>1</S.StepNumberCircle>
                      <S.StepContent>
                        <S.StepTitle>Enter Channel Information</S.StepTitle>
                        <S.EducationalText>
                          Paste any YouTube channel URL, @handle, or channel name. Supports youtube.com/channel/,
                          youtube.com/c/, youtube.com/@handle, and channel ID formats.
                        </S.EducationalText>
                      </S.StepContent>
                    </S.StepItem>

                    <S.StepItem>
                      <S.StepNumberCircle>2</S.StepNumberCircle>
                      <S.StepContent>
                        <S.StepTitle>Preview Banner</S.StepTitle>
                        <S.EducationalText>
                          View the full-resolution banner with channel information. The tool automatically enhances
                          the URL to fetch the highest quality available (2120px width).
                        </S.EducationalText>
                      </S.StepContent>
                    </S.StepItem>

                    <S.StepItem>
                      <S.StepNumberCircle>3</S.StepNumberCircle>
                      <S.StepContent>
                        <S.StepTitle>Download or Copy URL</S.StepTitle>
                        <S.EducationalText>
                          Download the banner directly to your device or copy the URL for use in other applications.
                          The file is automatically named with the channel title for easy organization.
                        </S.EducationalText>
                      </S.StepContent>
                    </S.StepItem>
                  </S.StepByStep>
                </S.EducationalContent>

                <S.EducationalContent>
                  <S.SectionSubTitle>Use Cases & Applications</S.SectionSubTitle>

                  <S.FeatureList>
                    <S.FeatureListItem>
                      <i className="bx bx-check-circle"></i>
                      <span><strong>Design Inspiration:</strong> Analyze successful channel branding and banner designs in your niche for creative inspiration</span>
                    </S.FeatureListItem>
                    <S.FeatureListItem>
                      <i className="bx bx-check-circle"></i>
                      <span><strong>Competitor Research:</strong> Study how competitors position their brand through banner design and messaging</span>
                    </S.FeatureListItem>
                    <S.FeatureListItem>
                      <i className="bx bx-check-circle"></i>
                      <span><strong>Asset Backup:</strong> Save your own channel banner for backup purposes or design iteration tracking</span>
                    </S.FeatureListItem>
                    <S.FeatureListItem>
                      <i className="bx bx-check-circle"></i>
                      <span><strong>Media Kits:</strong> Download partner channel banners for collaboration announcements and promotional materials</span>
                    </S.FeatureListItem>
                    <S.FeatureListItem>
                      <i className="bx bx-check-circle"></i>
                      <span><strong>Design Analysis:</strong> Extract banners to analyze dimensions, text placement, and safe zones for all devices</span>
                    </S.FeatureListItem>
                  </S.FeatureList>
                </S.EducationalContent>
              </S.EducationalSection>
            )}

            {bannerInfo && (
              <S.ResultsSection>
                <S.ChannelInfo>
                  <S.ChannelTitle>{bannerInfo.channelTitle}</S.ChannelTitle>
                  <S.ChannelId>Channel ID: {bannerInfo.channelId}</S.ChannelId>
                </S.ChannelInfo>

                <S.BannerPreview>
                  <S.BannerImage
                    src={bannerInfo.fullSizeBannerUrl}
                    alt={`${bannerInfo.channelTitle} banner`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = bannerInfo.bannerUrl;
                    }}
                  />
                </S.BannerPreview>

                <S.ActionsGrid>
                  <S.ActionButton onClick={handleDownloadImage}>
                    <i className="bx bx-download"></i>
                    Download Banner
                  </S.ActionButton>
                  <S.ActionButton onClick={handleCopyUrl}>
                    <i className={copiedUrl ? 'bx bx-check' : 'bx bx-copy'}></i>
                    {copiedUrl ? 'Copied!' : 'Copy URL'}
                  </S.ActionButton>
                  <S.ActionButton
                    as="a"
                    href={bannerInfo.fullSizeBannerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="bx bx-link-external"></i>
                    View Full Size
                  </S.ActionButton>
                  <S.ActionButton onClick={handleReset}>
                    <i className="bx bx-refresh"></i>
                    New Search
                  </S.ActionButton>
                </S.ActionsGrid>

                <S.InfoBox>
                  <S.InfoTitle>
                    <i className="bx bx-info-circle"></i>
                    Banner Information
                  </S.InfoTitle>
                  <S.InfoList>
                    <S.InfoItem>
                      <S.InfoLabel>Resolution:</S.InfoLabel>
                      <S.InfoValue>2120px width (full resolution)</S.InfoValue>
                    </S.InfoItem>
                    <S.InfoItem>
                      <S.InfoLabel>Format:</S.InfoLabel>
                      <S.InfoValue>JPG/PNG (YouTube optimized)</S.InfoValue>
                    </S.InfoItem>
                    <S.InfoItem>
                      <S.InfoLabel>Use Case:</S.InfoLabel>
                      <S.InfoValue>Channel branding, headers, promotional materials</S.InfoValue>
                    </S.InfoItem>
                  </S.InfoList>
                </S.InfoBox>
              </S.ResultsSection>
            )}
          </S.MainContainer>
        </S.PageWrapper>
      </ToolPageWrapper>
    </>
  );
};

export default BannerDownloader;
