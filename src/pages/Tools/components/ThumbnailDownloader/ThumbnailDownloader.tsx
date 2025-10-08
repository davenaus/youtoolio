// src/pages/Tools/components/ThumbnailDownloader/ThumbnailDownloader.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ToolPageWrapper } from '../../../../components/ToolPageWrapper';
import { SEO } from '../../../../components/SEO';
import { toolsSEO, generateToolSchema } from '../../../../config/toolsSEO';
import * as S from './styles';

interface ThumbnailData {
  url: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: string;
  duration: string;
  thumbnails: {
    default: { url: string; width: number; height: number };
    medium: { url: string; width: number; height: number };
    high: { url: string; width: number; height: number };
    standard?: { url: string; width: number; height: number };
    maxres?: { url: string; width: number; height: number };
  };
}

interface ThumbnailQuality {
  name: string;
  key: keyof ThumbnailData['thumbnails'];
  width: number;
  height: number;
  recommended?: boolean;
}

interface DownloadHistory {
  url: string;
  title: string;
  downloadedAt: string;
}

export const ThumbnailDownloader: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [thumbnailData, setThumbnailData] = useState<ThumbnailData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<keyof ThumbnailData['thumbnails']>('maxres');
  const [downloadHistory, setDownloadHistory] = useState<DownloadHistory[]>([]);
  const [currentStep, setCurrentStep] = useState<'input' | 'preview' | 'download'>('input');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Tool configuration
  const toolConfig = {
    name: 'Thumbnail Downloader',
    description: 'Download high-quality YouTube video thumbnails in multiple resolutions',
    image: 'https://64.media.tumblr.com/b12f0a4e3b88cf8409200338965cf706/0e01452f9f6dd974-5e/s2048x3072/00de80d7d1ca44cb236d21cab0adbe20fc5bbfb9.jpg',
    icon: 'bx bx-photo-album',
    features: [
      'Multiple resolutions',
      'Batch downloads',
      'Direct save to device'
    ]
  };

  useEffect(() => {
    if (videoId) {
      const videoUrl = `https://youtube.com/watch?v=${videoId}`;
      setUrl(videoUrl);
      handleAnalyze(videoId);
    }

    // Load download history
    const history = localStorage.getItem('thumbnail_download_history');
    if (history) {
      setDownloadHistory(JSON.parse(history));
    }
  }, [videoId]);

  const extractVideoId = (url: string): string | null => {
    // Handle direct video ID
    if (url.match(/^[A-Za-z0-9_-]{11}$/)) {
      return url;
    }

    const patterns = [
      /v=([^&]+)/,          // Regular youtube.com/watch?v=ID
      /youtu\.be\/([^?]+)/, // youtu.be/ID
      /embed\/([^?]+)/,     // youtube.com/embed/ID
      /shorts\/([^?]+)/     // youtube.com/shorts/ID
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return null;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      alert('Please enter a YouTube video URL');
      return;
    }

    const extractedId = extractVideoId(url);
    if (extractedId) {
      navigate(`/tools/thumbnail-downloader/${extractedId}`);
    } else {
      alert('Invalid YouTube URL. Please check the URL and try again.');
    }
  };

  const handleHeaderSearch = () => {
    if (!url.trim()) {
      alert('Please enter a YouTube video URL');
      return;
    }

    const extractedId = extractVideoId(url);
    if (extractedId) {
      navigate(`/tools/thumbnail-downloader/${extractedId}`);
    } else {
      alert('Invalid YouTube URL. Please check the URL and try again.');
    }
  };

  const handleAnalyze = async (id: string) => {
    setIsLoading(true);
    setCurrentStep('preview');

    try {
      const data = await fetchThumbnail(id);
      setThumbnailData(data);

      // Auto-select best quality
      if (data.thumbnails.maxres) {
        setSelectedQuality('maxres');
      } else if (data.thumbnails.standard) {
        setSelectedQuality('standard');
      } else {
        setSelectedQuality('high');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to fetch thumbnail. Please try again.');
      setThumbnailData(null);
      setCurrentStep('input');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchThumbnail = async (videoId: string): Promise<ThumbnailData> => {
    const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY_2;

    if (!API_KEY) {
      throw new Error('YouTube API key not configured');
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?` +
        `id=${videoId}&` +
        `key=${API_KEY}&` +
        `part=snippet,statistics,contentDetails`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch video data');
      }

      const data = await response.json();

      if (!data.items?.[0]) {
        throw new Error('Video not found');
      }

      const video = data.items[0];
      const snippet = video.snippet;
      const statistics = video.statistics;
      const contentDetails = video.contentDetails;

      return {
        url: snippet.thumbnails.maxres?.url || snippet.thumbnails.high?.url || snippet.thumbnails.standard?.url,
        title: snippet.title,
        channelTitle: snippet.channelTitle,
        publishedAt: snippet.publishedAt,
        viewCount: statistics.viewCount || '0',
        duration: contentDetails.duration,
        thumbnails: snippet.thumbnails
      };
    } catch (error) {
      console.error('Error fetching thumbnail:', error);
      throw error;
    }
  };

  const getAvailableQualities = (): ThumbnailQuality[] => {
    if (!thumbnailData) return [];

    const qualities: ThumbnailQuality[] = [];

    if (thumbnailData.thumbnails.maxres) {
      qualities.push({
        name: 'Maximum Resolution',
        key: 'maxres',
        width: 1280,
        height: 720,
        recommended: true
      });
    }

    if (thumbnailData.thumbnails.standard) {
      qualities.push({
        name: 'Standard Quality',
        key: 'standard',
        width: 640,
        height: 480
      });
    }

    qualities.push({
      name: 'High Quality',
      key: 'high',
      width: 480,
      height: 360
    });

    qualities.push({
      name: 'Medium Quality',
      key: 'medium',
      width: 320,
      height: 180
    });

    qualities.push({
      name: 'Low Quality',
      key: 'default',
      width: 120,
      height: 90
    });

    return qualities.filter(q => thumbnailData.thumbnails[q.key]);
  };

  const downloadThumbnail = async (quality: keyof ThumbnailData['thumbnails']) => {
    if (!thumbnailData) return;

    const thumbnailUrl = thumbnailData.thumbnails[quality]?.url;
    if (!thumbnailUrl) return;

    setIsDownloading(quality);

    try {
      const image = await fetch(thumbnailUrl);
      const imageBlob = await image.blob();
      const imageURL = URL.createObjectURL(imageBlob);

      const cleanTitle = thumbnailData.title
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase()
        .substring(0, 50);

      const qualityInfo = getAvailableQualities().find(q => q.key === quality);
      const filename = `${cleanTitle}_${qualityInfo?.width}x${qualityInfo?.height}.jpg`;

      const link = document.createElement('a');
      link.href = imageURL;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(imageURL);

      // Save to history
      const newHistory: DownloadHistory = {
        url: thumbnailUrl,
        title: thumbnailData.title,
        downloadedAt: new Date().toISOString()
      };

      const updatedHistory = [newHistory, ...downloadHistory.filter(h => h.url !== thumbnailUrl)].slice(0, 10);
      setDownloadHistory(updatedHistory);
      localStorage.setItem('thumbnail_download_history', JSON.stringify(updatedHistory));

      setCurrentStep('download');
    } catch (error) {
      console.error('Error downloading thumbnail:', error);
      // Fallback: open in new tab
      window.open(thumbnailUrl, '_blank');
    } finally {
      setIsDownloading(null);
    }
  };

  const downloadAllQualities = async () => {
    const qualities = getAvailableQualities();

    for (const quality of qualities) {
      await downloadThumbnail(quality.key);
      // Small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const copyThumbnailUrl = async (quality: keyof ThumbnailData['thumbnails']) => {
    if (!thumbnailData) return;

    const thumbnailUrl = thumbnailData.thumbnails[quality]?.url;
    if (!thumbnailUrl) return;

    try {
      await navigator.clipboard.writeText(thumbnailUrl);
      alert('Thumbnail URL copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy URL:', error);
      alert('Failed to copy URL to clipboard');
    }
  };

  const formatDuration = (duration: string): string => {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 'Unknown';

    const hours = parseInt(match[1] || '0') || 0;
    const minutes = parseInt(match[2] || '0') || 0;
    const seconds = parseInt(match[3] || '0') || 0;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (isoString: string): string => {
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const startOver = () => {
    setCurrentStep('input');
    setUrl('');
    setThumbnailData(null);
    setSelectedQuality('maxres');
  };

  const renderStepIndicator = () => (
    <S.StepIndicator>
      <S.Step active={currentStep === 'input'} completed={currentStep !== 'input'}>
        <S.StepNumber active={currentStep === 'input'} completed={currentStep !== 'input'}>1</S.StepNumber>
        <S.StepLabel active={currentStep === 'input'} completed={currentStep !== 'input'}>Video URL</S.StepLabel>
      </S.Step>
      <S.StepConnector completed={currentStep === 'download'} />
      <S.Step active={currentStep === 'preview'} completed={currentStep === 'download'}>
        <S.StepNumber active={currentStep === 'preview'} completed={currentStep === 'download'}>2</S.StepNumber>
        <S.StepLabel active={currentStep === 'preview'} completed={currentStep === 'download'}>Preview</S.StepLabel>
      </S.Step>
      <S.StepConnector completed={currentStep === 'download'} />
      <S.Step active={currentStep === 'download'} completed={false}>
        <S.StepNumber active={currentStep === 'download'} completed={false}>3</S.StepNumber>
        <S.StepLabel active={currentStep === 'download'} completed={false}>Download</S.StepLabel>
      </S.Step>
    </S.StepIndicator>
  );

  const seoConfig = toolsSEO['thumbnail-downloader'];
  const schemaData = generateToolSchema('thumbnail-downloader', seoConfig);

  return (
    <>
      <SEO
        title={seoConfig.title}
        description={seoConfig.description}
        keywords={seoConfig.keywords}
        canonical="https://youtool.io/tools/thumbnail-downloader"
        schemaData={schemaData}
      />
      <ToolPageWrapper
        toolKey="thumbnail-downloader"
        videoId={videoId}
        customTitle={thumbnailData ? `Download ${thumbnailData.title} Thumbnail - YouTool.io` : undefined}
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
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="Enter YouTube video URL to download thumbnail"
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

          {renderStepIndicator()}

          {/* Educational Content Section */}
          {currentStep === 'input' && (
            <S.EducationalSection>

              <S.EducationalContent>
                <S.SectionSubTitle>How to Use the Thumbnail Downloader</S.SectionSubTitle>

                <S.EducationalText>
                  Our Thumbnail Downloader provides instant access to high-quality YouTube video thumbnails
                  in multiple resolutions. Whether you need thumbnails for design inspiration, content creation,
                  or competitive analysis, this tool delivers crisp, original-quality images directly to your device.
                </S.EducationalText>

                <S.StepByStep>
                  <S.StepItem>
                    <S.StepNumberCircle>1</S.StepNumberCircle>
                    <S.StepContent>
                      <S.StepTitle>Enter Video URL</S.StepTitle>
                      <S.EducationalText>
                        Paste any YouTube video URL into the search bar. Our system accepts various formats
                        including youtube.com/watch?v=, youtu.be/, youtube.com/embed/, and youtube.com/shorts/
                        links. You can also enter just the video ID directly.
                      </S.EducationalText>
                    </S.StepContent>
                  </S.StepItem>

                  <S.StepItem>
                    <S.StepNumberCircle>2</S.StepNumberCircle>
                    <S.StepContent>
                      <S.StepTitle>Preview Thumbnails</S.StepTitle>
                      <S.EducationalText>
                        View the video information and preview the thumbnail in your selected quality.
                        Choose from multiple resolution options including maximum resolution (1280×720),
                        standard quality (640×480), high quality (480×360), medium (320×180), and low quality (120×90).
                      </S.EducationalText>
                    </S.StepContent>
                  </S.StepItem>

                  <S.StepItem>
                    <S.StepNumberCircle>3</S.StepNumberCircle>
                    <S.StepContent>
                      <S.StepTitle>Download Instantly</S.StepTitle>
                      <S.EducationalText>
                        Click download to save the thumbnail directly to your device. The file is automatically
                        named with the video title and resolution for easy organization. Use advanced options
                        to download all qualities at once or copy direct URLs.
                      </S.EducationalText>
                    </S.StepContent>
                  </S.StepItem>
                </S.StepByStep>
              </S.EducationalContent>

              <S.EducationalContent>
                <S.SectionSubTitle>Available Thumbnail Qualities & Use Cases</S.SectionSubTitle>

                <S.FeatureList>
                  <S.FeatureListItem>
                    <i className="bx bx-check-circle"></i>
                    <span><strong>Maximum Resolution (1280×720):</strong> Perfect for website headers, blog posts, social media covers, and professional presentations requiring crisp, high-quality images</span>
                  </S.FeatureListItem>
                  <S.FeatureListItem>
                    <i className="bx bx-check-circle"></i>
                    <span><strong>Standard Quality (640×480):</strong> Ideal for email newsletters, medium-sized web content, and applications where file size balance is important</span>
                  </S.FeatureListItem>
                  <S.FeatureListItem>
                    <i className="bx bx-check-circle"></i>
                    <span><strong>High Quality (480×360):</strong> Great for social media posts, thumbnails for video galleries, and content management systems</span>
                  </S.FeatureListItem>
                  <S.FeatureListItem>
                    <i className="bx bx-check-circle"></i>
                    <span><strong>Medium Quality (320×180):</strong> Suitable for mobile applications, small web widgets, and situations requiring faster loading times</span>
                  </S.FeatureListItem>
                  <S.FeatureListItem>
                    <i className="bx bx-check-circle"></i>
                    <span><strong>Low Quality (120×90):</strong> Perfect for generating previews, creating image catalogs, and applications requiring minimal bandwidth usage</span>
                  </S.FeatureListItem>
                  <S.FeatureListItem>
                    <i className="bx bx-check-circle"></i>
                    <span><strong>Batch Download Option:</strong> Download all available resolutions simultaneously for comprehensive thumbnail collections and future-proofing your design assets</span>
                  </S.FeatureListItem>
                  <S.FeatureListItem>
                    <i className="bx bx-check-circle"></i>
                    <span><strong>Direct URL Access:</strong> Copy thumbnail URLs for integration into content management systems, automated workflows, and API implementations</span>
                  </S.FeatureListItem>
                  <S.FeatureListItem>
                    <i className="bx bx-check-circle"></i>
                    <span><strong>Download History:</strong> Track recently downloaded thumbnails with automatic history management for easy re-access and project organization</span>
                  </S.FeatureListItem>
                </S.FeatureList>
              </S.EducationalContent>

            </S.EducationalSection>
          )}

          {/* Step 1: URL Input */}
          {currentStep === 'input' && (
            <S.InputSection>



              {downloadHistory.length > 0 && (
                <S.HistorySection>
                  <S.HistoryTitle>Recent downloads:</S.HistoryTitle>
                  <S.HistoryList>
                    {downloadHistory.slice(0, 5).map((item, index) => (
                      <S.HistoryItem key={index} onClick={() => window.open(item.url, '_blank')}>
                        <S.HistoryThumbnail src={item.url} alt={item.title} />
                        <S.HistoryInfo>
                          <S.HistoryItemTitle>{item.title}</S.HistoryItemTitle>
                          <S.HistoryDate>{formatDate(item.downloadedAt)}</S.HistoryDate>
                        </S.HistoryInfo>
                      </S.HistoryItem>
                    ))}
                  </S.HistoryList>
                </S.HistorySection>
              )}
            </S.InputSection>
          )}

          {/* Step 2: Preview */}
          {currentStep === 'preview' && (
            <S.PreviewSection>
              {isLoading ? (
                <S.LoadingContainer>
                  <i className='bx bx-loader-alt bx-spin'></i>
                  <p>Fetching video information and thumbnails...</p>
                </S.LoadingContainer>
              ) : thumbnailData ? (
                <>

                  <S.VideoInfo>
                    <S.VideoDetails>
                      <S.VideoTitle>{thumbnailData.title}</S.VideoTitle>
                      <S.VideoMeta>
                        <S.MetaItem>
                          <i className="bx bx-user"></i>
                          {thumbnailData.channelTitle}
                        </S.MetaItem>
                        <S.MetaItem>
                          <i className="bx bx-calendar"></i>
                          {formatDate(thumbnailData.publishedAt)}
                        </S.MetaItem>
                        <S.MetaItem>
                          <i className="bx bx-show"></i>
                          {parseInt(thumbnailData.viewCount).toLocaleString()} views
                        </S.MetaItem>
                        <S.MetaItem>
                          <i className="bx bx-time"></i>
                          {formatDuration(thumbnailData.duration)}
                        </S.MetaItem>
                      </S.VideoMeta>
                    </S.VideoDetails>
                  </S.VideoInfo>

                  <S.ThumbnailPreview>
                    <S.PreviewImage
                      src={thumbnailData.thumbnails[selectedQuality]?.url || thumbnailData.url}
                      alt={thumbnailData.title}
                    />
                    <S.QualityInfo>
                      {(() => {
                        const quality = getAvailableQualities().find(q => q.key === selectedQuality);
                        return quality ? `${quality.width} × ${quality.height} pixels` : 'Unknown resolution';
                      })()}
                    </S.QualityInfo>
                  </S.ThumbnailPreview>


                  <S.ActionButtons>
                    <S.SecondaryButton onClick={() => setCurrentStep('input')}>
                      <i className="bx bx-left-arrow-alt"></i>
                      Back
                    </S.SecondaryButton>

                    <S.AdvancedToggle onClick={() => setShowAdvanced(!showAdvanced)}>
                      <i className="bx bx-cog"></i>
                      Advanced Options
                    </S.AdvancedToggle>

                    <S.PrimaryButton
                      onClick={() => downloadThumbnail(selectedQuality)}
                      disabled={!!isDownloading}
                    >
                      {isDownloading === selectedQuality ? (
                        <>
                          <i className="bx bx-loader-alt bx-spin"></i>
                          Downloading...
                        </>
                      ) : (
                        <>
                          <i className="bx bx-download"></i>
                          Download Thumbnail
                        </>
                      )}
                    </S.PrimaryButton>
                  </S.ActionButtons>

                  {showAdvanced && (
                    <S.AdvancedOptions>
                      <S.AdvancedTitle>Advanced Download Options</S.AdvancedTitle>
                      <S.AdvancedGrid>
                        <S.AdvancedOption onClick={() => downloadAllQualities()}>
                          <i className="bx bx-download"></i>
                          <div>
                            <div>Download All Qualities</div>
                            <span>Get all available resolutions</span>
                          </div>
                        </S.AdvancedOption>

                        <S.AdvancedOption onClick={() => copyThumbnailUrl(selectedQuality)}>
                          <i className="bx bx-copy"></i>
                          <div>
                            <div>Copy Direct URL</div>
                            <span>Copy thumbnail link to clipboard</span>
                          </div>
                        </S.AdvancedOption>

                        <S.AdvancedOption onClick={() => window.open(thumbnailData.thumbnails[selectedQuality]?.url, '_blank')}>
                          <i className="bx bx-link-external"></i>
                          <div>
                            <div>Open in New Tab</div>
                            <span>View full-size thumbnail</span>
                          </div>
                        </S.AdvancedOption>
                      </S.AdvancedGrid>
                    </S.AdvancedOptions>
                  )}
                </>
              ) : null}
            </S.PreviewSection>
          )}

          {/* Step 3: Download Complete */}
          {currentStep === 'download' && thumbnailData && (
            <S.ResultSection>
              <S.SectionTitle>
                <i className="bx bx-check-circle"></i>
                Download Complete!
              </S.SectionTitle>

              <S.SuccessMessage>
                <S.SuccessIcon>
                  <i className="bx bx-check-circle"></i>
                </S.SuccessIcon>
                <S.SuccessText>
                  <h3>Thumbnail downloaded successfully!</h3>
                  <p>The thumbnail for "{thumbnailData.title}" has been saved to your downloads folder.</p>
                </S.SuccessText>
              </S.SuccessMessage>

              <S.NextActions>
                <S.NextActionsTitle>What's next?</S.NextActionsTitle>
                <S.NextActionsList>
                  <S.NextAction onClick={startOver}>
                    <i className="bx bx-refresh"></i>
                    <div>
                      <div>Download Another</div>
                      <span>Get thumbnails from another video</span>
                    </div>
                  </S.NextAction>

                  <S.NextAction onClick={() => downloadAllQualities()}>
                    <i className="bx bx-download"></i>
                    <div>
                      <div>Download All Qualities</div>
                      <span>Get all available resolutions</span>
                    </div>
                  </S.NextAction>

                  <S.NextAction onClick={() => navigate('/tools/video-analyzer/' + extractVideoId(url))}>
                    <i className="bx bx-line-chart"></i>
                    <div>
                      <div>Analyze This Video</div>
                      <span>Get detailed video insights</span>
                    </div>
                  </S.NextAction>
                </S.NextActionsList>
              </S.NextActions>
            </S.ResultSection>
          )}
        </S.MainContainer>
      </S.PageWrapper>
      </ToolPageWrapper>
    </>
  );
};

export default ThumbnailDownloader;