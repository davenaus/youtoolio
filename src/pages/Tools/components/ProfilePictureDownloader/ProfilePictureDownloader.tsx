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
  const schemaData = generateToolSchema('profile-picture-downloader', seoConfig);

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
                  <S.SectionSubTitle>How to Use the Profile Picture Downloader</S.SectionSubTitle>

                  <S.EducationalText>
                    Our Profile Picture Downloader provides instant access to YouTube channel profile pictures
                    in multiple resolutions (88px to 2048px). Perfect for creating collages, presentations, or archiving channel assets.
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
                        <S.StepTitle>Select Quality</S.StepTitle>
                        <S.EducationalText>
                          Choose from 4 quality options: Default (88x88), Medium (240x240), High (800x800), or Max Resolution (2048x2048).
                          Preview updates in real-time as you switch between qualities.
                        </S.EducationalText>
                      </S.StepContent>
                    </S.StepItem>

                    <S.StepItem>
                      <S.StepNumberCircle>3</S.StepNumberCircle>
                      <S.StepContent>
                        <S.StepTitle>Download or Copy URL</S.StepTitle>
                        <S.EducationalText>
                          Download the profile picture directly to your device or copy the URL for use in other applications.
                          The file is automatically named with the channel title and quality for easy organization.
                        </S.EducationalText>
                      </S.StepContent>
                    </S.StepItem>
                  </S.StepByStep>
                </S.EducationalContent>

                <S.EducationalContent>
                  <S.SectionSubTitle>Quality Options & Use Cases</S.SectionSubTitle>

                  <S.FeatureList>
                    <S.FeatureListItem>
                      <i className="bx bx-check-circle"></i>
                      <span><strong>Max Resolution (2048x2048):</strong> Perfect for high-quality prints, professional presentations, and detailed design work</span>
                    </S.FeatureListItem>
                    <S.FeatureListItem>
                      <i className="bx bx-check-circle"></i>
                      <span><strong>High Quality (800x800):</strong> Ideal for website avatars, social media profiles, and most digital applications</span>
                    </S.FeatureListItem>
                    <S.FeatureListItem>
                      <i className="bx bx-check-circle"></i>
                      <span><strong>Medium Quality (240x240):</strong> Great for thumbnails, small web widgets, and applications requiring faster loading</span>
                    </S.FeatureListItem>
                    <S.FeatureListItem>
                      <i className="bx bx-check-circle"></i>
                      <span><strong>Default Quality (88x88):</strong> Suitable for icons, mobile apps, and situations where file size is critical</span>
                    </S.FeatureListItem>
                    <S.FeatureListItem>
                      <i className="bx bx-check-circle"></i>
                      <span><strong>Channel Research:</strong> Download creator profile pictures for competitive analysis and industry research</span>
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
