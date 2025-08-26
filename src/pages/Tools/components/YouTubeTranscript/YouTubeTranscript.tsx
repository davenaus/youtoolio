// src/pages/Tools/components/YouTubeTranscript/YouTubeTranscript.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdSense } from '../../../../components/AdSense/AdSense';
import * as S from './styles';

type Cue = { 
  startMs: number; 
  durationMs: number; 
  text: string; 
};

type OutFormat = 'text' | 'inline' | 'srt' | 'vtt' | 'json';

interface TranscriptData {
  videoId: string;
  lineCount: number;
  format: string;
  cues: Cue[];
  text?: string;
  videoTitle?: string;
  channelTitle?: string;
  publishedAt?: string;
  viewCount?: string;
  duration?: string;
}

interface TranscriptHistory {
  videoId: string;
  title: string;
  downloadedAt: string;
  format: string;
}

export const YouTubeTranscript: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [transcriptData, setTranscriptData] = useState<TranscriptData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [format, setFormat] = useState<OutFormat>('text');
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [currentStep, setCurrentStep] = useState<'input' | 'preview' | 'download'>('input');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [transcriptHistory, setTranscriptHistory] = useState<TranscriptHistory[]>([]);

  // Processing options
  const [dedupe, setDedupe] = useState(true);
  const [joinMs, setJoinMs] = useState(400);
  const [minDur, setMinDur] = useState(0);

  // Tool configuration
  const toolConfig = {
    name: 'YouTube Transcript Downloader',
    description: 'Extract and download YouTube video transcripts in multiple formats with smart processing options',
    image: 'https://64.media.tumblr.com/b12f0a4e3b88cf8409200338965cf706/0e01452f9f6dd974-5e/s2048x3072/00de80d7d1ca44cb236d21cab0adbe20fc5bbfb9.jpg',
    icon: 'bx bx-text',
    features: [
      'Multiple output formats',
      'Smart duplicate removal',
      'Timestamp control',
      'Batch processing'
    ]
  };

  useEffect(() => {
    if (videoId) {
      const videoUrl = `https://youtube.com/watch?v=${videoId}`;
      setUrl(videoUrl);
      handleAnalyze(videoId);
    }
    
    // Load transcript history
    const history = localStorage.getItem('transcript_download_history');
    if (history) {
      setTranscriptHistory(JSON.parse(history));
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
      setError('Please enter a YouTube video URL');
      return;
    }

    const extractedId = extractVideoId(url);
    if (extractedId) {
      navigate(`/tools/youtube-transcript/${extractedId}`);
    } else {
      setError('Invalid YouTube URL. Please check the URL and try again.');
    }
  };

  const handleHeaderSearch = () => {
    if (!url.trim()) {
      setError('Please enter a YouTube video URL');
      return;
    }

    const extractedId = extractVideoId(url);
    if (extractedId) {
      navigate(`/tools/youtube-transcript/${extractedId}`);
    } else {
      setError('Invalid YouTube URL. Please check the URL and try again.');
    }
  };

  const handleAnalyze = async (id: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentStep('preview');
    
    try {
      // TODO: Replace this with your actual API endpoint
      // For now, this is a placeholder that simulates the API call
      const data = await fetchTranscript(id);
      setTranscriptData(data);
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'Failed to fetch transcript. Please try again.');
      setTranscriptData(null);
      setCurrentStep('input');
    } finally {
      setIsLoading(false);
    }
  };

  // Placeholder function - replace with your actual API implementation
  const fetchTranscript = async (videoId: string): Promise<TranscriptData> => {
    const response = await fetch('/api/transcript', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        urlOrId: videoId,
        options: {
          format: 'json',
          dedupe,
          joinAdjacentThresholdMs: joinMs,
          minDurationMs: minDur
        }
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error || 'Failed to fetch transcript');
    }
    
    return await response.json();
  };

  // Local formatting functions (client-side)
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatTimeForSRT = (ms: number): string => {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const msR = ms % 1000;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')},${msR.toString().padStart(3, '0')}`;
  };

  const formatTimeForVTT = (ms: number): string => {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const msR = ms % 1000;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${msR.toString().padStart(3, '0')}`;
  };

  const getRenderedText = (): string => {
    if (!transcriptData?.cues.length) return '';
    
    const cues = transcriptData.cues;
    
    switch (format) {
      case 'text':
        if (!showTimestamps) {
          return cues.map(c => c.text).join('\n');
        }
        return cues.map(c => `[${formatTime(c.startMs)}] ${c.text}`).join('\n');
        
      case 'inline':
        return cues.map(c => `[${formatTime(c.startMs)}] ${c.text}`).join('\n');
        
      case 'srt':
        return cues.map((c, i) => {
          const start = formatTimeForSRT(c.startMs);
          const end = formatTimeForSRT(c.startMs + Math.max(c.durationMs, 1));
          return `${i + 1}\n${start} --> ${end}\n${c.text}\n`;
        }).join('\n');
        
      case 'vtt':
        const body = cues.map(c => {
          const start = formatTimeForVTT(c.startMs);
          const end = formatTimeForVTT(c.startMs + Math.max(c.durationMs, 1));
          return `${start} --> ${end}\n${c.text}\n`;
        }).join('\n');
        return `WEBVTT\n\n${body}`;
        
      case 'json':
        return JSON.stringify(cues, null, 2);
        
      default:
        return cues.map(c => c.text).join('\n');
    }
  };

  const getFileExtension = (): string => {
    switch (format) {
      case 'srt': return 'srt';
      case 'vtt': return 'vtt';
      case 'json': return 'json';
      default: return 'txt';
    }
  };

  const handleCopy = async () => {
    const text = getRenderedText();
    try {
      await navigator.clipboard.writeText(text);
      // You might want to add a toast notification here
      alert('Transcript copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy to clipboard');
    }
  };

  const handleDownload = () => {
    const text = getRenderedText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const cleanTitle = transcriptData?.videoTitle
      ?.replace(/[^a-z0-9]/gi, '_')
      ?.toLowerCase()
      ?.substring(0, 50) || 'transcript';
    
    const filename = `${cleanTitle}_transcript.${getFileExtension()}`;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Save to history
    if (transcriptData) {
      const newHistory: TranscriptHistory = {
        videoId: transcriptData.videoId,
        title: transcriptData.videoTitle || 'Unknown Video',
        downloadedAt: new Date().toISOString(),
        format: format
      };
      
      const updatedHistory = [newHistory, ...transcriptHistory.filter(h => h.videoId !== transcriptData.videoId)].slice(0, 10);
      setTranscriptHistory(updatedHistory);
      localStorage.setItem('transcript_download_history', JSON.stringify(updatedHistory));
    }

    setCurrentStep('download');
  };

  const startOver = () => {
    setCurrentStep('input');
    setUrl('');
    setTranscriptData(null);
    setError(null);
  };

  const formatDate = (isoString: string): string => {
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  return (
    <S.PageWrapper>
      {/* Left Sidebar Ad */}
      <S.AdSidebar position="left">
        <AdSense 
          slot={process.env.REACT_APP_ADSENSE_SLOT_SIDEBAR || ''}
          format="vertical"
        />
      </S.AdSidebar>

      {/* Right Sidebar Ad */}
      <S.AdSidebar position="right">
        <AdSense 
          slot={process.env.REACT_APP_ADSENSE_SLOT_SIDEBAR || ''}
          format="vertical"
        />
      </S.AdSidebar>

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
                    placeholder="Enter YouTube video URL to extract transcript"
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
                      <i className='bx bx-text'></i>
                    )}
                  </S.HeaderSearchButton>
                </S.HeaderSearchBar>
              </S.HeaderSearchContainer>
            </S.HeaderTextContent>
          </S.HeaderContent>
        </S.EnhancedHeader>

        {renderStepIndicator()}

        {/* Error Display */}
        {error && (
          <S.ErrorMessage>
            <i className="bx bx-error-circle"></i>
            <span>{error}</span>
          </S.ErrorMessage>
        )}

        {/* Educational Content Section */}
        {currentStep === 'input' && (
          <S.EducationalSection>
            <S.EducationalContent>
              <S.SectionSubTitle>How to Use the YouTube Transcript Downloader</S.SectionSubTitle>
              
              <S.EducationalText>
                Our YouTube Transcript Downloader provides instant access to video transcripts with advanced 
                processing options. Extract captions, subtitles, and spoken content from any YouTube video 
                with automatic cleanup, duplicate removal, and multiple export formats for your workflow needs.
              </S.EducationalText>

              <S.StepByStep>
                <S.StepItem>
                  <S.StepNumberCircle>1</S.StepNumberCircle>
                  <S.StepContent>
                    <S.StepTitle>Enter Video URL</S.StepTitle>
                    <S.EducationalText>
                      Paste any YouTube video URL into the search bar. Our system accepts various formats 
                      including youtube.com/watch?v=, youtu.be/, youtube.com/embed/, and youtube.com/shorts/ 
                      links. You can also enter just the video ID directly for faster processing.
                    </S.EducationalText>
                  </S.StepContent>
                </S.StepItem>

                <S.StepItem>
                  <S.StepNumberCircle>2</S.StepNumberCircle>
                  <S.StepContent>
                    <S.StepTitle>Preview & Configure</S.StepTitle>
                    <S.EducationalText>
                      Review the extracted transcript with your selected format and processing options. 
                      Choose from plain text, timestamped versions, SRT subtitles, VTT captions, or JSON data. 
                      Configure duplicate removal, adjacent line joining, and minimum duration filtering.
                    </S.EducationalText>
                  </S.StepContent>
                </S.StepItem>

                <S.StepItem>
                  <S.StepNumberCircle>3</S.StepNumberCircle>
                  <S.StepContent>
                    <S.StepTitle>Download or Copy</S.StepTitle>
                    <S.EducationalText>
                      Download the transcript file directly to your device or copy the content to your 
                      clipboard for immediate use. Files are automatically named with the video title 
                      and format for easy organization in your content management system.
                    </S.EducationalText>
                  </S.StepContent>
                </S.StepItem>
              </S.StepByStep>
            </S.EducationalContent>

            <S.EducationalContent>
              <S.SectionSubTitle>Output Formats & Processing Options</S.SectionSubTitle>
              
              <S.FeatureList>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Plain Text:</strong> Clean transcript text perfect for blog posts, articles, content analysis, and SEO research without timing information</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Timestamped Text:</strong> Text with timestamp markers ideal for creating chapter markers, navigation aids, and content indexing systems</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>SRT Subtitles:</strong> Standard subtitle format compatible with video editing software, media players, and video hosting platforms</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>VTT Captions:</strong> WebVTT format for web video players, accessibility compliance, and modern video streaming platforms</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>JSON Data:</strong> Structured data format perfect for developers, automated processing, and integration with content management APIs</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Smart Deduplication:</strong> Advanced algorithm removes repeated lines and overlapping speech segments for cleaner, more readable transcripts</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Adjacent Line Joining:</strong> Automatically combines closely-timed caption segments to create more natural reading flow and reduce fragmentation</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Duration Filtering:</strong> Remove very short caption segments that may contain incomplete words or speech artifacts for higher quality output</span>
                </S.FeatureListItem>
              </S.FeatureList>
            </S.EducationalContent>

            {/* Processing Options */}
            <S.ProcessingOptions>
              <S.SectionSubTitle>Processing Options</S.SectionSubTitle>
              <S.OptionsGrid>
                <S.OptionItem>
                  <S.CheckboxContainer>
                    <input 
                      type="checkbox" 
                      id="dedupe" 
                      checked={dedupe} 
                      onChange={e => setDedupe(e.target.checked)} 
                    />
                    <label htmlFor="dedupe">Smart deduplication</label>
                  </S.CheckboxContainer>
                  <S.OptionDescription>Remove repeated and overlapping lines</S.OptionDescription>
                </S.OptionItem>
                
                <S.OptionItem>
                  <S.InputContainer>
                    <label>Join adjacent lines (≤ ms)</label>
                    <input
                      type="number" 
                      min={0} 
                      step={50} 
                      value={joinMs}
                      onChange={e => setJoinMs(parseInt(e.target.value || '0', 10))}
                    />
                  </S.InputContainer>
                  <S.OptionDescription>Merge lines separated by short gaps</S.OptionDescription>
                </S.OptionItem>
                
                <S.OptionItem>
                  <S.InputContainer>
                    <label>Minimum duration (ms)</label>
                    <input
                      type="number" 
                      min={0} 
                      step={50} 
                      value={minDur}
                      onChange={e => setMinDur(parseInt(e.target.value || '0', 10))}
                    />
                  </S.InputContainer>
                  <S.OptionDescription>Filter out very short segments</S.OptionDescription>
                </S.OptionItem>
              </S.OptionsGrid>
            </S.ProcessingOptions>

            {/* Recent History */}
            {transcriptHistory.length > 0 && (
              <S.HistorySection>
                <S.HistoryTitle>Recent transcripts:</S.HistoryTitle>
                <S.HistoryList>
                  {transcriptHistory.slice(0, 5).map((item, index) => (
                    <S.HistoryItem key={index} onClick={() => navigate(`/tools/youtube-transcript/${item.videoId}`)}>
                      <S.HistoryInfo>
                        <S.HistoryItemTitle>{item.title}</S.HistoryItemTitle>
                        <S.HistoryMeta>
                          <span>{formatDate(item.downloadedAt)}</span>
                          <span>•</span>
                          <span>{item.format.toUpperCase()}</span>
                        </S.HistoryMeta>
                      </S.HistoryInfo>
                    </S.HistoryItem>
                  ))}
                </S.HistoryList>
              </S.HistorySection>
            )}
          </S.EducationalSection>
        )}

        {/* Step 2: Preview */}
        {currentStep === 'preview' && (
          <S.PreviewSection>
            {isLoading ? (
              <S.LoadingContainer>
                <i className='bx bx-loader-alt bx-spin'></i>
                <p>Extracting transcript and processing content...</p>
              </S.LoadingContainer>
            ) : transcriptData ? (
              <>
                {/* Video Info */}
                {(transcriptData.videoTitle || transcriptData.channelTitle) && (
                  <S.VideoInfo>
                    <S.VideoDetails>
                      {transcriptData.videoTitle && (
                        <S.VideoTitle>{transcriptData.videoTitle}</S.VideoTitle>
                      )}
                      {transcriptData.channelTitle && (
                        <S.VideoMeta>
                          <S.MetaItem>
                            <i className="bx bx-user"></i>
                            {transcriptData.channelTitle}
                          </S.MetaItem>
                        </S.VideoMeta>
                      )}
                    </S.VideoDetails>
                  </S.VideoInfo>
                )}

                {/* Format Controls */}
                <S.FormatControls>
                  <S.FormatTitle>
                    <i className="bx bx-cog"></i>
                    Output Format & Options
                  </S.FormatTitle>
                  
                  <S.ControlsGrid>
                    <S.FormatSelector>
                      <label>Format:</label>
                      <select value={format} onChange={e => setFormat(e.target.value as OutFormat)}>
                        <option value="text">Plain Text</option>
                        <option value="inline">Timestamped Text</option>
                        <option value="srt">SRT Subtitles</option>
                        <option value="vtt">VTT Captions</option>
                        <option value="json">JSON Data</option>
                      </select>
                    </S.FormatSelector>

                    {format === 'text' && (
                      <S.TimestampToggle>
                        <input 
                          type="checkbox" 
                          id="timestamps" 
                          checked={showTimestamps} 
                          onChange={e => setShowTimestamps(e.target.checked)} 
                        />
                        <label htmlFor="timestamps">Include timestamps</label>
                      </S.TimestampToggle>
                    )}

                    <S.StatsDisplay>
                      <span>{transcriptData.lineCount} segments</span>
                    </S.StatsDisplay>
                  </S.ControlsGrid>
                </S.FormatControls>

                {/* Preview */}
                <S.TranscriptPreview>
                  <S.PreviewHeader>
                    <span>Preview</span>
                    <S.PreviewActions>
                      <S.PreviewAction onClick={handleCopy}>
                        <i className="bx bx-copy"></i>
                        Copy
                      </S.PreviewAction>
                      <S.PreviewAction onClick={handleDownload}>
                        <i className="bx bx-download"></i>
                        Download
                      </S.PreviewAction>
                    </S.PreviewActions>
                  </S.PreviewHeader>
                  <S.PreviewContent>
                    {getRenderedText()}
                  </S.PreviewContent>
                </S.TranscriptPreview>

                <S.ActionButtons>
                  <S.SecondaryButton onClick={() => setCurrentStep('input')}>
                    <i className="bx bx-left-arrow-alt"></i>
                    Back
                  </S.SecondaryButton>
                  
                  <S.AdvancedToggle onClick={() => setShowAdvanced(!showAdvanced)}>
                    <i className="bx bx-cog"></i>
                    Advanced Options
                  </S.AdvancedToggle>
                  
                  <S.PrimaryButton onClick={handleDownload}>
                    <i className="bx bx-download"></i>
                    Download Transcript
                  </S.PrimaryButton>
                </S.ActionButtons>

                {showAdvanced && (
                  <S.AdvancedOptions>
                    <S.AdvancedTitle>Advanced Options</S.AdvancedTitle>
                    <S.AdvancedGrid>
                      <S.AdvancedOption onClick={() => {
                        // Download all formats
                        const formats: OutFormat[] = ['text', 'srt', 'vtt', 'json'];
                        formats.forEach((fmt, index) => {
                          setTimeout(() => {
                            const originalFormat = format;
                            setFormat(fmt);
                            setTimeout(() => {
                              handleDownload();
                              if (index === formats.length - 1) {
                                setFormat(originalFormat);
                              }
                            }, 100);
                          }, index * 500);
                        });
                      }}>
                        <i className="bx bx-download"></i>
                        <div>
                          <div>Download All Formats</div>
                          <span>Get TXT, SRT, VTT, and JSON</span>
                        </div>
                      </S.AdvancedOption>
                      
                      <S.AdvancedOption onClick={handleCopy}>
                        <i className="bx bx-copy"></i>
                        <div>
                          <div>Copy to Clipboard</div>
                          <span>Copy current format content</span>
                        </div>
                      </S.AdvancedOption>
                      
                      <S.AdvancedOption onClick={() => navigate(`/tools/video-analyzer/${transcriptData.videoId}`)}>
                        <i className="bx bx-line-chart"></i>
                        <div>
                          <div>Analyze This Video</div>
                          <span>Get detailed video insights</span>
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
        {currentStep === 'download' && transcriptData && (
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
                <h3>Transcript downloaded successfully!</h3>
                <p>The transcript for "{transcriptData.videoTitle || 'this video'}" has been saved to your downloads folder.</p>
              </S.SuccessText>
            </S.SuccessMessage>

            <S.NextActions>
              <S.NextActionsTitle>What's next?</S.NextActionsTitle>
              <S.NextActionsList>
                <S.NextAction onClick={startOver}>
                  <i className="bx bx-refresh"></i>
                  <div>
                    <div>Extract Another</div>
                    <span>Get transcript from another video</span>
                  </div>
                </S.NextAction>
                
                <S.NextAction onClick={() => navigate(`/tools/video-analyzer/${transcriptData.videoId}`)}>
                  <i className="bx bx-line-chart"></i>
                  <div>
                    <div>Analyze This Video</div>
                    <span>Get detailed video insights</span>
                  </div>
                </S.NextAction>
                
                <S.NextAction onClick={() => navigate('/tools/tag-generator')}>
                  <i className="bx bx-tag"></i>
                  <div>
                    <div>Generate Tags</div>
                    <span>Create optimized video tags</span>
                  </div>
                </S.NextAction>
              </S.NextActionsList>
            </S.NextActions>
          </S.ResultSection>
        )}

        {/* Bottom Ad */}
        <S.BottomAdContainer>
          <AdSense 
            slot={process.env.REACT_APP_ADSENSE_SLOT_BOTTOM || ''}
            format="horizontal"
          />
        </S.BottomAdContainer>
      </S.MainContainer>
    </S.PageWrapper>
  );
};

export default YouTubeTranscript;