import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ToolPageWrapper } from '../../../../components/ToolPageWrapper';
import { SEO } from '../../../../components/SEO';
import { GoogleAd } from '../../../../components/GoogleAd';
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
  const schemaData = generateToolSchema('banner-downloader', seoConfig, [
    { question: 'Why does the banner look different on my TV versus my phone?', answer: 'YouTube crops the banner differently depending on the screen size. The full 2560×1440 canvas is only visible on TV screens. Phones see only the center strip (approximately 1546px wide). This is why the universal safe zone (1235×338px center area) is so important — it is the only region guaranteed to be visible everywhere.' },
    { question: 'Can I download a banner if the channel has no banner set?', answer: 'No. If a channel has not set a custom channel banner, the YouTube API will not return a banner URL and the tool will display an error indicating that no banner was found for that channel.' },
    { question: 'What is the maximum banner resolution this tool downloads?', answer: 'This tool fetches banners at 2120px width by appending YouTube CDN quality parameters to the image URL. This is the largest resolution YouTube makes available through its API, equivalent to what is shown on large desktop displays.' },
    { question: 'Does downloading a banner notify the channel owner?', answer: 'No. Banner images are publicly accessible static files on YouTube\'s CDN. Fetching them does not trigger any notification to the channel owner and has no effect on the channel\'s analytics or account status.' }
  ]);

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

            {/* Google Ad Spot */}
            <GoogleAd adSlot="1234567890" />

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
                  <S.SectionSubTitle>What This Tool Does</S.SectionSubTitle>
                  <S.EducationalText>
                    The YouTube Channel Banner Downloader retrieves the full-resolution channel art (banner) from any YouTube channel and lets you download it as a high-quality image file. YouTube stores channel banners at up to 2120px wide — this tool fetches the banner at that maximum resolution by appending the appropriate URL parameters to YouTube's image CDN endpoint, giving you the cleanest, largest version available.
                  </S.EducationalText>
                  <S.EducationalText>
                    The tool works by accepting any YouTube channel identifier — a full channel URL, a @handle, or a channel ID — and using the YouTube Data API v3 to retrieve the channel's branding settings, which include the banner image URL. It then modifies that URL to force the maximum quality before displaying the preview and download options.
                  </S.EducationalText>
                </S.EducationalContent>

                <S.EducationalContent>
                  <S.SectionSubTitle>How to Use the Channel Banner Downloader</S.SectionSubTitle>
                  <S.StepByStep>
                    <S.StepItem>
                      <S.StepNumberCircle>1</S.StepNumberCircle>
                      <S.StepContent>
                        <S.StepTitle>Enter the Channel URL or Handle</S.StepTitle>
                        <S.EducationalText>
                          Paste any YouTube channel identifier into the search bar. This tool accepts the full range of YouTube channel URL formats: youtube.com/channel/CHANNEL_ID, youtube.com/c/CustomURL, youtube.com/@handle, youtube.com/user/OldUsername, or a raw channel ID starting with "UC". You can also paste the channel's home page URL directly from your browser.
                        </S.EducationalText>
                      </S.StepContent>
                    </S.StepItem>
                    <S.StepItem>
                      <S.StepNumberCircle>2</S.StepNumberCircle>
                      <S.StepContent>
                        <S.StepTitle>Preview the Full-Resolution Banner</S.StepTitle>
                        <S.EducationalText>
                          Once the channel loads, you will see the banner displayed at full width with the channel title and ID shown below. The preview renders the banner at 2120px quality — the same resolution YouTube uses for TV and large desktop screens. This lets you evaluate the design at full fidelity before downloading.
                        </S.EducationalText>
                      </S.StepContent>
                    </S.StepItem>
                    <S.StepItem>
                      <S.StepNumberCircle>3</S.StepNumberCircle>
                      <S.StepContent>
                        <S.StepTitle>Download or Copy the Banner URL</S.StepTitle>
                        <S.EducationalText>
                          Click "Download Banner" to save the image file to your device. The file is automatically named using the channel title for easy organization. You can also copy the direct CDN URL if you need to reference the image in a design tool, CMS, or spreadsheet without downloading the file locally.
                        </S.EducationalText>
                      </S.StepContent>
                    </S.StepItem>
                  </S.StepByStep>
                </S.EducationalContent>

                <S.EducationalContent>
                  <S.SectionSubTitle>Understanding YouTube Banner Dimensions</S.SectionSubTitle>
                  <S.EducationalText>
                    YouTube channel banners are displayed at different sizes depending on the device. Understanding these safe zones is critical for designing a banner that looks correct across all platforms.
                  </S.EducationalText>
                  <S.FeatureList>
                    <S.FeatureListItem>
                      <i className="bx bx-check-circle"></i>
                      <span><strong>TV Display — 2560×1440px (full banner):</strong> The entire banner canvas, visible only on TV screens. Background design and branding at the edges lives here, but important content should not be placed here since it is cropped on all other devices.</span>
                    </S.FeatureListItem>
                    <S.FeatureListItem>
                      <i className="bx bx-check-circle"></i>
                      <span><strong>Desktop — 2560×423px (top strip):</strong> The horizontal strip shown on desktop browsers. Your logo, channel name, and tagline should fit within this zone. This tool downloads at 2120px, which covers the full desktop display area.</span>
                    </S.FeatureListItem>
                    <S.FeatureListItem>
                      <i className="bx bx-check-circle"></i>
                      <span><strong>Tablet — 1855×423px:</strong> A narrower crop shown on tablet devices. Keep critical design elements toward the center of your banner to ensure visibility across both desktop and tablet viewports.</span>
                    </S.FeatureListItem>
                    <S.FeatureListItem>
                      <i className="bx bx-check-circle"></i>
                      <span><strong>Mobile — 1546×423px:</strong> The tightest crop, shown on smartphone screens. Only the very center of your banner is visible here. Text and logos placed too far left or right will be cut off on mobile.</span>
                    </S.FeatureListItem>
                    <S.FeatureListItem>
                      <i className="bx bx-check-circle"></i>
                      <span><strong>Universal Safe Zone — 1235×338px (center of banner):</strong> The area guaranteed to be visible on every device. Any logo, text, or key visual element should live within this zone to remain visible to all viewers regardless of their device.</span>
                    </S.FeatureListItem>
                  </S.FeatureList>
                </S.EducationalContent>

                <S.EducationalContent>
                  <S.SectionSubTitle>Common Use Cases</S.SectionSubTitle>
                  <S.FeatureList>
                    <S.FeatureListItem>
                      <i className="bx bx-check-circle"></i>
                      <span><strong>Design Inspiration and Niche Research:</strong> Download banners from successful channels in your niche and study their color choices, typography, layout, and messaging. Patterns in high-performing channels reveal what resonates with that specific audience and can inform your own banner refresh.</span>
                    </S.FeatureListItem>
                    <S.FeatureListItem>
                      <i className="bx bx-check-circle"></i>
                      <span><strong>Channel Asset Backup:</strong> Save a copy of your own channel's current banner before making design changes. YouTube does not provide an export function for channel art, so this tool is a practical way to keep a local record of your branding history.</span>
                    </S.FeatureListItem>
                    <S.FeatureListItem>
                      <i className="bx bx-check-circle"></i>
                      <span><strong>Safe Zone Analysis:</strong> Download a competitor's banner and open it in your design tool to measure how they positioned elements relative to the known safe zones. This is one of the fastest ways to understand advanced banner design technique.</span>
                    </S.FeatureListItem>
                    <S.FeatureListItem>
                      <i className="bx bx-check-circle"></i>
                      <span><strong>Media Kits and Collaboration Materials:</strong> When creating a media kit, partnership one-pager, or collaboration announcement, you may need the channel banner of a partner or sponsor. Download it at full resolution for professional-quality design documents.</span>
                    </S.FeatureListItem>
                  </S.FeatureList>
                </S.EducationalContent>

                <S.EducationalContent>
                  <S.SectionSubTitle>Rights &amp; Usage Notice</S.SectionSubTitle>
                  <S.EducationalText>
                    YouTube channel banners are creative works owned by the respective channel operators. This tool is intended for downloading banners from your own channel, for channels where you have explicit permission from the owner, or for personal reference and research purposes. Do not use downloaded banners to impersonate another channel, claim ownership of someone else's branding, or use them commercially without the copyright holder's written permission.
                  </S.EducationalText>
                </S.EducationalContent>

                <S.EducationalContent>
                  <S.SectionSubTitle>Frequently Asked Questions</S.SectionSubTitle>
                  <S.FeatureList>
                    <S.FeatureListItem>
                      <i className="bx bx-help-circle"></i>
                      <span><strong>Why does the banner look different on my TV versus my phone?</strong> YouTube crops the banner differently depending on the screen size. The full 2560×1440 canvas is only visible on TV screens. Phones see only the center strip (approximately 1546px wide). This is why the universal safe zone (1235×338px center area) is so important — it is the only region guaranteed to be visible everywhere.</span>
                    </S.FeatureListItem>
                    <S.FeatureListItem>
                      <i className="bx bx-help-circle"></i>
                      <span><strong>Can I download a banner if the channel has no banner set?</strong> No. If a channel has not set a custom channel banner, the YouTube API will not return a banner URL and the tool will display an error indicating that no banner was found for that channel.</span>
                    </S.FeatureListItem>
                    <S.FeatureListItem>
                      <i className="bx bx-help-circle"></i>
                      <span><strong>What is the maximum banner resolution this tool downloads?</strong> This tool fetches banners at 2120px width by appending YouTube CDN quality parameters to the image URL. This is the largest resolution YouTube makes available through its API, equivalent to what is shown on large desktop displays.</span>
                    </S.FeatureListItem>
                    <S.FeatureListItem>
                      <i className="bx bx-help-circle"></i>
                      <span><strong>Does downloading a banner notify the channel owner?</strong> No. Banner images are publicly accessible static files on YouTube's CDN. Fetching them does not trigger any notification to the channel owner and has no effect on the channel's analytics or account status.</span>
                    </S.FeatureListItem>
                  </S.FeatureList>
                </S.EducationalContent>

                <S.EducationalContent>
                  <S.SectionSubTitle>Related Tools</S.SectionSubTitle>
                  <S.FeatureList>
                    <S.FeatureListItem>
                      <i className="bx bx-link"></i>
                      <span><a href="/tools/profile-picture-downloader"><strong>Profile Picture Downloader</strong></a> — Download the channel's profile picture (avatar) at up to 2048px resolution alongside the banner.</span>
                    </S.FeatureListItem>
                    <S.FeatureListItem>
                      <i className="bx bx-link"></i>
                      <span><a href="/tools/color-palette"><strong>Color Palette Generator</strong></a> — Upload the downloaded banner to extract its exact color palette for use in your own channel branding.</span>
                    </S.FeatureListItem>
                    <S.FeatureListItem>
                      <i className="bx bx-link"></i>
                      <span><a href="/tools/channel-analyzer"><strong>Channel Analyzer</strong></a> — Get a full analytics breakdown of any channel including engagement, SEO score, and growth metrics.</span>
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
