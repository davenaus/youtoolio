import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ToolPageWrapper } from '../../../../components/ToolPageWrapper';
import { SEO } from '../../../../components/SEO';
import { GoogleAd } from '../../../../components/GoogleAd';
import { toolsSEO, generateToolSchema } from '../../../../config/toolsSEO';
import * as S from './styles';

interface ProfilePictureInfo {
  channelId: string;
  channelTitle: string;
  defaultUrl: string;
  mediumUrl: string;
  highUrl: string;
  maxResUrl: string;
}

export const ProfilePictureDownloader: React.FC = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const navigate = useNavigate();
  const [channelUrl, setChannelUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pictureInfo, setPictureInfo] = useState<ProfilePictureInfo | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<'default' | 'medium' | 'high' | 'maxres'>('high');

  // SEO setup
  const seoConfig = toolsSEO['profile-picture-downloader'];
  const schemaData = generateToolSchema('profile-picture-downloader', seoConfig, [
    { question: 'Why is the Max Resolution option not always 2048px?', answer: 'The actual maximum resolution depends on the size of the image the creator originally uploaded to YouTube. If the creator uploaded a 400×400px photo, the CDN cannot serve it at 2048px — it will be served at its native upload size. The tool requests 2048px and YouTube returns the best it has available.' },
    { question: 'Can I download a profile picture from a private channel?', answer: 'No. Private channels are not accessible through the YouTube Data API. The tool can only retrieve profile pictures from public channels. Unlisted channels (channels that have not customized their URL but are still public) are generally accessible.' },
    { question: 'What image format are the downloaded pictures?', answer: 'YouTube stores profile pictures as JPEG or PNG files depending on what the creator uploaded. The download preserves the original format. If you need to convert to a different format, use an image editor after downloading.' },
    { question: 'Does this tool work for YouTube channels with new @handles?', answer: 'Yes. The tool supports all current YouTube channel URL and handle formats, including the newer @handle system that YouTube introduced in 2022. Simply paste the youtube.com/@handle URL directly into the search bar.' }
  ]);

  // Tool configuration
  const toolConfig = {
    name: 'Profile Picture Downloader',
    description: 'Download YouTube channel profile pictures in multiple resolutions and quality options',
    image: 'https://64.media.tumblr.com/10ccc3757948e253900a92bc6ce226ab/0e01452f9f6dd974-3b/s2048x3072/62471a32052a5c06b185d9c0242331a986f0cca6.jpg',
    icon: 'bx bx-user-circle',
    features: [
      'Multiple quality options (88px - 2048px)',
      'All channel formats supported',
      'Instant preview & download'
    ]
  };

  useEffect(() => {
    const history = localStorage.getItem('profile_picture_download_history');
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
    localStorage.setItem('profile_picture_download_history', JSON.stringify(newHistory));
  };

  const getMaxResUrl = (url: string): string => {
    if (!url) return '';
    return url.replace(/=s\d+/, '=s2048').replace(/\/s\d+/, '/s2048');
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

  const fetchProfileBySearch = async (searchTerm: string): Promise<string> => {
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
          idToFetch = await fetchProfileBySearch(channelUrl);
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
        `part=snippet&id=${idToFetch}&key=${API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.items || data.items.length === 0) {
        throw new Error('Channel not found');
      }

      const channel = data.items[0];
      const thumbnails = channel.snippet.thumbnails;

      const info: ProfilePictureInfo = {
        channelId: channel.id,
        channelTitle: channel.snippet.title,
        defaultUrl: thumbnails.default?.url || '',
        mediumUrl: thumbnails.medium?.url || '',
        highUrl: thumbnails.high?.url || '',
        maxResUrl: getMaxResUrl(thumbnails.high?.url || thumbnails.medium?.url || thumbnails.default?.url)
      };

      setPictureInfo(info);
      saveToHistory(channelUrl);

      if (!channelIdParam) {
        navigate(`/tools/profile-picture-downloader/${idToFetch}`, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setPictureInfo(null);
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

  const getSelectedUrl = (): string => {
    if (!pictureInfo) return '';

    switch (selectedQuality) {
      case 'default':
        return pictureInfo.defaultUrl;
      case 'medium':
        return pictureInfo.mediumUrl;
      case 'high':
        return pictureInfo.highUrl;
      case 'maxres':
        return pictureInfo.maxResUrl;
      default:
        return pictureInfo.highUrl;
    }
  };

  const getQualityLabel = (quality: string): string => {
    switch (quality) {
      case 'default':
        return 'Default (88x88)';
      case 'medium':
        return 'Medium (240x240)';
      case 'high':
        return 'High (800x800)';
      case 'maxres':
        return 'Max Resolution (2048x2048)';
      default:
        return quality;
    }
  };

  const handleCopyUrl = () => {
    const url = getSelectedUrl();
    if (url) {
      navigator.clipboard.writeText(url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const handleDownloadImage = () => {
    if (pictureInfo) {
      const url = getSelectedUrl();
      const link = document.createElement('a');
      link.href = url;
      link.download = `${pictureInfo.channelTitle.replace(/[^a-z0-9]/gi, '_')}_profile_${selectedQuality}.jpg`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleReset = () => {
    setChannelUrl('');
    setPictureInfo(null);
    setError(null);
    navigate('/tools/profile-picture-downloader', { replace: true });
  };

  return (
    <>
      <SEO
        title={seoConfig.title}
        description={seoConfig.description}
        keywords={seoConfig.keywords}
        canonical={`https://youtool.io/tools/profile-picture-downloader${channelId ? `/${channelId}` : ''}`}
        schemaData={schemaData}
      />
      <ToolPageWrapper
        toolKey="profile-picture-downloader"
        customTitle={pictureInfo ? `Download ${pictureInfo.channelTitle} Profile Picture - YouTool.io` : undefined}
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
            {!pictureInfo && (
              <S.EducationalSection>
                <S.EducationalContent>
                  <S.SectionSubTitle>What This Tool Does</S.SectionSubTitle>
                  <S.EducationalText>
                    The YouTube Profile Picture Downloader retrieves a channel's avatar (profile picture) at up to four resolution tiers — from the compact 88×88 default all the way up to 2048×2048 — and lets you download the image directly to your device. It works by querying the YouTube Data API v3 for the channel's snippet data, which includes the thumbnail object containing URLs for each available resolution. The tool then modifies the URL parameters to force the maximum quality before displaying the preview.
                  </S.EducationalText>
                  <S.EducationalText>
                    Profile pictures on YouTube are always square (1:1 aspect ratio) and stored as either JPEG or PNG files. This tool is useful for creators who need their own avatar at full resolution, researchers studying channel branding, and anyone building media kits or collaboration materials that reference specific YouTube channels.
                  </S.EducationalText>
                </S.EducationalContent>

                <S.EducationalContent>
                  <S.SectionSubTitle>How to Use the Profile Picture Downloader</S.SectionSubTitle>
                  <S.StepByStep>
                    <S.StepItem>
                      <S.StepNumberCircle>1</S.StepNumberCircle>
                      <S.StepContent>
                        <S.StepTitle>Enter the Channel URL or Handle</S.StepTitle>
                        <S.EducationalText>
                          Paste any YouTube channel URL or identifier into the search bar. Supported formats include: youtube.com/channel/CHANNEL_ID, youtube.com/@handle, youtube.com/c/CustomURL, youtube.com/user/OldUsername, and raw channel IDs beginning with "UC". You can also type a channel name directly and the tool will search for the best match.
                        </S.EducationalText>
                      </S.StepContent>
                    </S.StepItem>
                    <S.StepItem>
                      <S.StepNumberCircle>2</S.StepNumberCircle>
                      <S.StepContent>
                        <S.StepTitle>Choose a Resolution</S.StepTitle>
                        <S.EducationalText>
                          After the channel loads, select from four quality options: Default (88×88), Medium (240×240), High (800×800), or Max Resolution (2048×2048). The preview updates in real time as you switch options. For most use cases, High (800×800) provides an excellent balance of quality and file size. Choose Max Resolution when you need print-quality output or plan to scale the image up.
                        </S.EducationalText>
                      </S.StepContent>
                    </S.StepItem>
                    <S.StepItem>
                      <S.StepNumberCircle>3</S.StepNumberCircle>
                      <S.StepContent>
                        <S.StepTitle>Download or Copy the URL</S.StepTitle>
                        <S.EducationalText>
                          Click "Download Picture" to save the image file to your device. Files are automatically named with the channel title and quality level for easy organization. Use "Copy URL" if you need to reference the image in a CMS, design tool, or automation without downloading the file locally.
                        </S.EducationalText>
                      </S.StepContent>
                    </S.StepItem>
                  </S.StepByStep>
                </S.EducationalContent>

                <S.EducationalContent>
                  <S.SectionSubTitle>Understanding the Resolution Tiers</S.SectionSubTitle>
                  <S.EducationalText>
                    YouTube stores channel profile pictures in a resolution ladder. Here is when to use each tier:
                  </S.EducationalText>
                  <S.FeatureList>
                    <S.FeatureListItem>
                      <i className="bx bx-check-circle"></i>
                      <span><strong>Max Resolution — 2048×2048px:</strong> The highest quality available. Use this for print materials, large-format displays, or whenever you need to scale the image. This tier is generated by modifying the CDN URL parameters and may not always be available at exactly 2048px — the actual maximum depends on what resolution the creator originally uploaded.</span>
                    </S.FeatureListItem>
                    <S.FeatureListItem>
                      <i className="bx bx-check-circle"></i>
                      <span><strong>High — 800×800px:</strong> The best standard quality tier for most digital use cases. Use this for website avatars, social media headers, media kit documents, and anywhere that requires a crisp, clear profile image.</span>
                    </S.FeatureListItem>
                    <S.FeatureListItem>
                      <i className="bx bx-check-circle"></i>
                      <span><strong>Medium — 240×240px:</strong> A compact square well-suited for comment section icons, notification images, and UI elements where the avatar appears at small sizes. Good file-size-to-quality ratio for web use.</span>
                    </S.FeatureListItem>
                    <S.FeatureListItem>
                      <i className="bx bx-check-circle"></i>
                      <span><strong>Default — 88×88px:</strong> The smallest tier, matching the size YouTube uses in comment threads and subscription list thumbnails. Ideal for creating image catalogs, icon sets, or lightweight content where visual fidelity at small sizes is sufficient.</span>
                    </S.FeatureListItem>
                  </S.FeatureList>
                </S.EducationalContent>

                <S.EducationalContent>
                  <S.SectionSubTitle>Common Use Cases</S.SectionSubTitle>
                  <S.FeatureList>
                    <S.FeatureListItem>
                      <i className="bx bx-check-circle"></i>
                      <span><strong>Backup Your Own Channel Avatar:</strong> Download your channel's current profile picture at max resolution before updating it. YouTube does not provide a direct export, so keeping a local backup of each avatar iteration helps you track your branding evolution over time.</span>
                    </S.FeatureListItem>
                    <S.FeatureListItem>
                      <i className="bx bx-check-circle"></i>
                      <span><strong>Collaboration and Partnership Documents:</strong> When creating sponsor decks, media kits, or collaboration proposals, you often need the other channel's profile picture for visual reference. Download it at High or Max resolution for professional-quality documents.</span>
                    </S.FeatureListItem>
                    <S.FeatureListItem>
                      <i className="bx bx-check-circle"></i>
                      <span><strong>Branding Research:</strong> Download profile pictures from top channels in your niche and study their design choices — photography vs illustration, color background vs transparent, full face vs logo. These patterns reveal what resonates with your target audience.</span>
                    </S.FeatureListItem>
                    <S.FeatureListItem>
                      <i className="bx bx-check-circle"></i>
                      <span><strong>Cross-Platform Consistency:</strong> If you use a YouTube channel's avatar on other platforms (podcast cover art, Patreon, Discord), download the highest resolution to ensure it scales well across different display contexts and aspect ratio crops.</span>
                    </S.FeatureListItem>
                  </S.FeatureList>
                </S.EducationalContent>

                <S.EducationalContent>
                  <S.SectionSubTitle>Rights &amp; Usage Notice</S.SectionSubTitle>
                  <S.EducationalText>
                    YouTube channel profile pictures are creative works owned by the respective channel operators. This tool is intended for downloading profile pictures from your own channel, for channels where you have explicit permission from the owner, or for personal reference and research. Do not use downloaded profile pictures to impersonate another creator, claim ownership of their likeness or branding, or use them commercially without the copyright holder's permission.
                  </S.EducationalText>
                </S.EducationalContent>

                <S.EducationalContent>
                  <S.SectionSubTitle>Frequently Asked Questions</S.SectionSubTitle>
                  <S.FeatureList>
                    <S.FeatureListItem>
                      <i className="bx bx-help-circle"></i>
                      <span><strong>Why is the Max Resolution option not always 2048px?</strong> The actual maximum resolution depends on the size of the image the creator originally uploaded to YouTube. If the creator uploaded a 400×400px photo, the CDN cannot serve it at 2048px — it will be served at its native upload size. The tool requests 2048px and YouTube returns the best it has available.</span>
                    </S.FeatureListItem>
                    <S.FeatureListItem>
                      <i className="bx bx-help-circle"></i>
                      <span><strong>Can I download a profile picture from a private channel?</strong> No. Private channels are not accessible through the YouTube Data API. The tool can only retrieve profile pictures from public channels. Unlisted channels (channels that haven't customized their URL but are still public) are generally accessible.</span>
                    </S.FeatureListItem>
                    <S.FeatureListItem>
                      <i className="bx bx-help-circle"></i>
                      <span><strong>What image format are the downloaded pictures?</strong> YouTube stores profile pictures as JPEG or PNG files depending on what the creator uploaded. The download preserves the original format. If you need to convert to a different format, use an image editor after downloading.</span>
                    </S.FeatureListItem>
                    <S.FeatureListItem>
                      <i className="bx bx-help-circle"></i>
                      <span><strong>Does this tool work for YouTube channels with new @handles?</strong> Yes. The tool supports all current YouTube channel URL and handle formats, including the newer @handle system that YouTube introduced in 2022. Simply paste the youtube.com/@handle URL directly into the search bar.</span>
                    </S.FeatureListItem>
                  </S.FeatureList>
                </S.EducationalContent>

                <S.EducationalContent>
                  <S.SectionSubTitle>Related Tools</S.SectionSubTitle>
                  <S.FeatureList>
                    <S.FeatureListItem>
                      <i className="bx bx-link"></i>
                      <span><a href="/tools/banner-downloader"><strong>Channel Banner Downloader</strong></a> — Download the channel's banner art at full 2120px resolution alongside the profile picture.</span>
                    </S.FeatureListItem>
                    <S.FeatureListItem>
                      <i className="bx bx-link"></i>
                      <span><a href="/tools/color-picker-from-image"><strong>Color Picker from Image</strong></a> — Extract the exact hex color codes from the downloaded profile picture to match colors in your own branding.</span>
                    </S.FeatureListItem>
                    <S.FeatureListItem>
                      <i className="bx bx-link"></i>
                      <span><a href="/tools/channel-analyzer"><strong>Channel Analyzer</strong></a> — Get a full analytics and performance breakdown for any YouTube channel.</span>
                    </S.FeatureListItem>
                  </S.FeatureList>
                </S.EducationalContent>
              </S.EducationalSection>
            )}

            {pictureInfo && (
              <S.ResultsSection>
                <S.ChannelInfo>
                  <S.ChannelTitle>{pictureInfo.channelTitle}</S.ChannelTitle>
                  <S.ChannelId>Channel ID: {pictureInfo.channelId}</S.ChannelId>
                </S.ChannelInfo>

                <S.QualitySelector>
                  <S.QualityTitle>Select Quality:</S.QualityTitle>
                  <S.QualityOptions>
                    {(['default', 'medium', 'high', 'maxres'] as const).map((quality) => (
                      <S.QualityOption
                        key={quality}
                        $active={selectedQuality === quality}
                        onClick={() => setSelectedQuality(quality)}
                      >
                        <i className={`bx ${selectedQuality === quality ? 'bxs-check-circle' : 'bx-circle'}`}></i>
                        {getQualityLabel(quality)}
                      </S.QualityOption>
                    ))}
                  </S.QualityOptions>
                </S.QualitySelector>

                <S.ProfilePreview>
                  <S.ProfileImage
                    src={getSelectedUrl()}
                    alt={`${pictureInfo.channelTitle} profile picture`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = pictureInfo.highUrl || pictureInfo.mediumUrl || pictureInfo.defaultUrl;
                    }}
                  />
                </S.ProfilePreview>

                <S.ActionsGrid>
                  <S.ActionButton onClick={handleDownloadImage}>
                    <i className="bx bx-download"></i>
                    Download Picture
                  </S.ActionButton>
                  <S.ActionButton onClick={handleCopyUrl}>
                    <i className={copiedUrl ? 'bx bx-check' : 'bx bx-copy'}></i>
                    {copiedUrl ? 'Copied!' : 'Copy URL'}
                  </S.ActionButton>
                  <S.ActionButton
                    as="a"
                    href={getSelectedUrl()}
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
                    Picture Information
                  </S.InfoTitle>
                  <S.InfoList>
                    <S.InfoItem>
                      <S.InfoLabel>Current Quality:</S.InfoLabel>
                      <S.InfoValue>{getQualityLabel(selectedQuality)}</S.InfoValue>
                    </S.InfoItem>
                    <S.InfoItem>
                      <S.InfoLabel>Format:</S.InfoLabel>
                      <S.InfoValue>JPG/PNG (YouTube optimized)</S.InfoValue>
                    </S.InfoItem>
                    <S.InfoItem>
                      <S.InfoLabel>Use Case:</S.InfoLabel>
                      <S.InfoValue>Avatars, profiles, channel identification</S.InfoValue>
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

export default ProfilePictureDownloader;
