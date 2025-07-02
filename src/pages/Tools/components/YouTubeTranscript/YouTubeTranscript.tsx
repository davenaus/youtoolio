// src/pages/Tools/components/YouTubeTranscript/YouTubeTranscript.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdSense } from '../../../../components/AdSense/AdSense';
import * as S from './styles';

interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

interface VideoInfo {
  title: string;
  channel: string;
  duration: string;
  viewCount: string;
}

interface TranscriptHistory {
  id: string;
  date: Date;
  url: string;
  title: string;
  channel: string;
  transcriptLength: number;
}

export const YouTubeTranscript: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'input' | 'processing' | 'results'>('input');
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [transcriptHistory, setTranscriptHistory] = useState<TranscriptHistory[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [availableLanguages, setAvailableLanguages] = useState<string[]>(['en']);
  const [includeTimestamps, setIncludeTimestamps] = useState(false);
  const [formatOption, setFormatOption] = useState<'paragraph' | 'sentences' | 'raw'>('paragraph');

  // Load transcript history
  useEffect(() => {
    const history = localStorage.getItem('youtube_transcript_history');
    if (history) {
      const parsed = JSON.parse(history);
      setTranscriptHistory(parsed.map((item: any) => ({
        ...item,
        date: new Date(item.date)
      })));
    }
  }, []);

  const extractVideoId = useCallback((url: string): string | null => {
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1].length === 11) return match[1];
    }

    return null;
  }, []);

  const fetchVideoInfo = async (videoId: string): Promise<VideoInfo> => {
    // Using a more reliable approach with oEmbed API
    try {
      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      if (response.ok) {
        const data = await response.json();
        return {
          title: data.title || 'Unknown Title',
          channel: data.author_name || 'Unknown Channel',
          duration: 'Unknown',
          viewCount: 'Unknown'
        };
      }
    } catch (error) {
      console.error('Error fetching video info:', error);
    }

    return {
      title: 'Unknown Title',
      channel: 'Unknown Channel', 
      duration: 'Unknown',
      viewCount: 'Unknown'
    };
  };

  const fetchTranscriptViaProxy = async (videoId: string, language: string = 'en'): Promise<TranscriptSegment[]> => {
    // Method 1: Use a dedicated backend API service (recommended approach)
    const backendEndpoints = [
      `https://youtube-transcript.io/api/transcripts`, // Paid service but reliable
      `https://api.supadata.ai/youtube/transcript`, // Another reliable service
      // You would set up your own backend here: `https://your-backend.com/api/transcript`
    ];

    // For now, let's try the free proxy approach but with better error handling
    const apiUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${language}&fmt=json3`;
    
    const proxyUrls = [
      `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`,
      `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`,
    ];

    for (const proxyUrl of proxyUrls) {
      try {
        const response = await fetch(proxyUrl, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          let transcriptData;
          
          // Handle different proxy response formats
          if (data.contents) {
            transcriptData = typeof data.contents === 'string' ? 
              JSON.parse(data.contents) : data.contents;
          } else {
            transcriptData = data;
          }
          
          if (transcriptData && transcriptData.events) {
            const segments: TranscriptSegment[] = [];
            
            for (const event of transcriptData.events) {
              if (event.segs) {
                let text = '';
                for (const seg of event.segs) {
                  if (seg.utf8) {
                    text += seg.utf8;
                  }
                }
                if (text.trim()) {
                  segments.push({
                    text: text.trim(),
                    start: event.tStartMs ? parseFloat(event.tStartMs) / 1000 : 0,
                    duration: event.dDurationMs ? parseFloat(event.dDurationMs) / 1000 : 0
                  });
                }
              }
            }
            
            if (segments.length > 0) {
              return segments;
            }
          }
        }
      } catch (error) {
        console.error(`Proxy ${proxyUrl} failed:`, error);
        continue;
      }
    }

    throw new Error('Unable to fetch transcript via proxy. Consider setting up a backend API for reliable access.');
  };

  const fetchTranscriptAlternative = async (videoId: string): Promise<TranscriptSegment[]> => {
    // Method 2: Try to extract transcript list and find available captions
    try {
      const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(watchUrl)}`;
      
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error('Failed to fetch video page');
      
      const data = await response.json();
      const pageContent = data.contents;
      
      // Extract caption tracks from the page source (same method as Python library)
      const captionRegex = /"captionTracks":\s*(\[.*?\])/;
      const match = pageContent.match(captionRegex);
      
      if (match) {
        const captionTracks = JSON.parse(match[1]);
        
        // Find the best caption track (prefer manual over auto-generated)
        let bestTrack = null;
        for (const track of captionTracks) {
          if (track.languageCode === selectedLanguage || track.languageCode === 'en') {
            if (!track.kind || track.kind !== 'asr') { // Manual transcript
              bestTrack = track;
              break;
            } else if (!bestTrack) { // Auto-generated as fallback
              bestTrack = track;
            }
          }
        }
        
        if (bestTrack) {
          // Fetch the actual transcript using the baseUrl
          const transcriptUrl = bestTrack.baseUrl;
          const transcriptProxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(transcriptUrl)}`;
          
          const transcriptResponse = await fetch(transcriptProxyUrl);
          if (transcriptResponse.ok) {
            const transcriptData = await transcriptResponse.json();
            const xmlContent = transcriptData.contents;
            
            // Parse XML format (like in the Python examples)
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
            const textNodes = xmlDoc.getElementsByTagName('text');
            
            const segments: TranscriptSegment[] = [];
            for (let i = 0; i < textNodes.length; i++) {
              const node = textNodes[i];
              const text = node.textContent?.trim().replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
              const start = parseFloat(node.getAttribute('start') || '0');
              const duration = parseFloat(node.getAttribute('dur') || '0');
              
              if (text) {
                segments.push({ 
                  text: text,
                  start: start,
                  duration: duration 
                });
              }
            }
            
            if (segments.length > 0) {
              return segments;
            }
          }
        }
      }
    } catch (error) {
      console.error('Alternative method failed:', error);
    }

    throw new Error('No transcript available through alternative method');
  };

  const fetchTranscriptManualSearch = async (videoId: string): Promise<TranscriptSegment[]> => {
    // Method 3: Search for manual transcripts first (higher quality)
    try {
      const languages = [selectedLanguage, 'en', 'en-US', 'en-GB'];
      
      for (const lang of languages) {
        try {
          const apiUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${lang}&fmt=json3&kind=asr`;
          const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;
          
          const response = await fetch(proxyUrl);
          if (response.ok) {
            const data = await response.json();
            const transcriptData = typeof data.contents === 'string' ? 
              JSON.parse(data.contents) : data.contents;
            
            if (transcriptData && transcriptData.events && transcriptData.events.length > 0) {
              const segments: TranscriptSegment[] = [];
              
              for (const event of transcriptData.events) {
                if (event.segs) {
                  let text = '';
                  for (const seg of event.segs) {
                    if (seg.utf8) {
                      text += seg.utf8;
                    }
                  }
                  if (text.trim()) {
                    segments.push({
                      text: text.trim(),
                      start: event.tStartMs ? parseFloat(event.tStartMs) / 1000 : 0,
                      duration: event.dDurationMs ? parseFloat(event.dDurationMs) / 1000 : 0
                    });
                  }
                }
              }
              
              if (segments.length > 0) {
                return segments;
              }
            }
          }
        } catch (error) {
          console.error(`Language ${lang} failed:`, error);
          continue;
        }
      }
    } catch (error) {
      console.error('Manual search method failed:', error);
    }

    throw new Error('No manual transcript found');
  };

  const fetchTranscriptFallback = async (videoId: string): Promise<TranscriptSegment[]> => {
    // Fallback: Try to extract from YouTube page source (limited success)
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}`;
      const response = await fetch(proxyUrl);
      
      if (response.ok) {
        const data = await response.json();
        const pageContent = data.contents;
        
        // Look for captions in the page source
        const captionRegex = /"captionTracks":\s*(\[.*?\])/;
        const match = pageContent.match(captionRegex);
        
        if (match) {
          const captionTracks = JSON.parse(match[1]);
          if (captionTracks.length > 0) {
            const captionUrl = captionTracks[0].baseUrl;
            
            // Fetch the actual captions
            const captionResponse = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(captionUrl)}`);
            if (captionResponse.ok) {
              const captionData = await captionResponse.json();
              const xmlContent = captionData.contents;
              
              // Parse XML captions
              const parser = new DOMParser();
              const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
              const textNodes = xmlDoc.getElementsByTagName('text');
              
              const segments: TranscriptSegment[] = [];
              for (let i = 0; i < textNodes.length; i++) {
                const node = textNodes[i];
                const text = node.textContent?.trim();
                const start = parseFloat(node.getAttribute('start') || '0');
                const duration = parseFloat(node.getAttribute('dur') || '0');
                
                if (text) {
                  segments.push({ text, start, duration });
                }
              }
              
              if (segments.length > 0) {
                return segments;
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Fallback method failed:', error);
    }

    throw new Error('No transcript available');
  };

  const fetchTranscript = async (videoId: string): Promise<TranscriptSegment[]> => {
    // Try multiple methods based on the successful Python approaches
    const methods = [
      () => fetchTranscriptManualSearch(videoId), // Try manual transcripts first (better quality)
      () => fetchTranscriptViaProxy(videoId, selectedLanguage), // Try selected language
      () => fetchTranscriptViaProxy(videoId, 'en'), // Fallback to English
      () => fetchTranscriptAlternative(videoId), // Extract from page source
    ];

    let lastError = null;
    for (const method of methods) {
      try {
        const result = await method();
        if (result.length > 0) {
          return result;
        }
      } catch (error) {
        console.error('Method failed, trying next:', error);
        lastError = error;
        continue;
      }
    }

    // If all methods fail, provide a helpful error message
    const errorMessage = `Unable to extract transcript for this video. This could be because:
    
• The video doesn't have captions/transcripts available
• Captions are disabled by the creator
• The video is private or restricted
• Auto-generated captions are not available in the selected language

Try checking if captions are visible when you watch the video directly on YouTube.`;
    
    throw new Error(errorMessage);
  };

  const handleSubmit = async () => {
    setError('');
    const extractedVideoId = extractVideoId(url);
    
    if (!extractedVideoId) {
      setError('Invalid YouTube URL. Please enter a valid YouTube video URL.');
      return;
    }

    setVideoId(extractedVideoId);
    setCurrentStep('processing');
    setIsLoading(true);

    try {
      // Fetch video info and transcript simultaneously
      const [videoInfoData, transcriptData] = await Promise.all([
        fetchVideoInfo(extractedVideoId),
        fetchTranscript(extractedVideoId)
      ]);

      setVideoInfo(videoInfoData);
      setTranscript(transcriptData);

      // Save to history
      const newEntry: TranscriptHistory = {
        id: Date.now().toString(),
        date: new Date(),
        url,
        title: videoInfoData.title,
        channel: videoInfoData.channel,
        transcriptLength: transcriptData.length
      };

      const newHistory = [newEntry, ...transcriptHistory].slice(0, 10);
      setTranscriptHistory(newHistory);
      localStorage.setItem('youtube_transcript_history', JSON.stringify(newHistory));

      setCurrentStep('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transcript');
      setCurrentStep('input');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTranscript = (): string => {
    if (transcript.length === 0) return '';

    switch (formatOption) {
      case 'paragraph':
        // Combine all text and add intelligent punctuation like the Python examples suggest
        let fullText = transcript
          .map(segment => segment.text)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        // Add basic punctuation at natural breaks (similar to ChatGPT suggestion in the Python examples)
        fullText = fullText
          .replace(/\b(and|but|so|because|however|therefore|meanwhile|furthermore|moreover|additionally)\b/g, '\n\n$1')
          .replace(/\b(now|well|okay|alright|so)\b\s+/g, '\n\n$1 ')
          .replace(/([.!?])\s+/g, '$1\n\n')
          .replace(/\n\n+/g, '\n\n')
          .trim();
        
        return fullText;

      case 'sentences':
        // Each segment on a new line with optional timestamps (like Python TextFormatter)
        return transcript
          .map(segment => {
            const prefix = includeTimestamps ? 
              `[${Math.floor(segment.start / 60)}:${(segment.start % 60).toFixed(0).padStart(2, '0')}] ` : '';
            return prefix + segment.text;
          })
          .join('\n');

      case 'raw':
        // Raw format with timestamps (similar to Python dictionary output)
        return transcript
          .map(segment => {
            if (includeTimestamps) {
              return `{'text': '${segment.text}', 'start': ${segment.start}, 'duration': ${segment.duration}}`;
            } else {
              return segment.text;
            }
          })
          .join('\n');

      default:
        return transcript.map(segment => segment.text).join(' ');
    }
  };

  const handleCopy = async () => {
    const formattedText = formatTranscript();
    try {
      await navigator.clipboard.writeText(formattedText);
      alert('Transcript copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy transcript');
    }
  };

  const handleDownload = () => {
    const formattedText = formatTranscript();
    const blob = new Blob([formattedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${videoInfo?.title || 'transcript'}_transcript.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderStepIndicator = () => (
    <S.StepIndicator>
      <S.Step active={currentStep === 'input'} completed={['processing', 'results'].includes(currentStep)}>
        <S.StepNumber active={currentStep === 'input'} completed={['processing', 'results'].includes(currentStep)}>1</S.StepNumber>
        <S.StepLabel active={currentStep === 'input'} completed={['processing', 'results'].includes(currentStep)}>Enter URL</S.StepLabel>
      </S.Step>
      <S.StepConnector completed={currentStep === 'results'} />
      <S.Step active={currentStep === 'processing'} completed={currentStep === 'results'}>
        <S.StepNumber active={currentStep === 'processing'} completed={currentStep === 'results'}>2</S.StepNumber>
        <S.StepLabel active={currentStep === 'processing'} completed={currentStep === 'results'}>Processing</S.StepLabel>
      </S.Step>
      <S.StepConnector completed={currentStep === 'results'} />
      <S.Step active={currentStep === 'results'} completed={false}>
        <S.StepNumber active={currentStep === 'results'} completed={false}>3</S.StepNumber>
        <S.StepLabel active={currentStep === 'results'} completed={false}>Transcript</S.StepLabel>
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
        <S.Header>
          <S.BackButton onClick={() => navigate('/tools')}>
            <i className="bx bx-arrow-back"></i>
            Back to Tools
          </S.BackButton>
          <S.Title>YouTube Transcript Extractor</S.Title>
          <S.Subtitle>
            Extract and download transcripts from any YouTube video with captions
          </S.Subtitle>
        </S.Header>

        {renderStepIndicator()}

        {/* Step 1: Input */}
        {currentStep === 'input' && (
          <S.InputSection>
            <S.SectionTitle>
              <i className="bx bx-link"></i>
              Enter YouTube Video URL
            </S.SectionTitle>

            <S.UrlCard>
              <S.UrlInput
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              />
              <S.UrlExamples>
                <span>Supported formats:</span>
                <div>youtube.com/watch?v=ID • youtu.be/ID • youtube.com/shorts/ID</div>
              </S.UrlExamples>
            </S.UrlCard>

            <S.OptionsCard>
              <S.CardTitle>
                <i className="bx bx-cog"></i>
                Extraction Options
              </S.CardTitle>
              
              <S.OptionsGrid>
                <S.OptionGroup>
                  <S.OptionLabel>Language Preference</S.OptionLabel>
                  <S.Select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="it">Italian</option>
                    <option value="pt">Portuguese</option>
                    <option value="ru">Russian</option>
                    <option value="ja">Japanese</option>
                    <option value="ko">Korean</option>
                    <option value="zh">Chinese</option>
                  </S.Select>
                </S.OptionGroup>

                <S.OptionGroup>
                  <S.OptionLabel>Format Output</S.OptionLabel>
                  <S.FormatOptions>
                    <S.FormatOption
                      active={formatOption === 'paragraph'}
                      onClick={() => setFormatOption('paragraph')}
                    >
                      <i className="bx bx-paragraph"></i>
                      <div>Paragraph</div>
                    </S.FormatOption>
                    <S.FormatOption
                      active={formatOption === 'sentences'}
                      onClick={() => setFormatOption('sentences')}
                    >
                      <i className="bx bx-list-ul"></i>
                      <div>Sentences</div>
                    </S.FormatOption>
                    <S.FormatOption
                      active={formatOption === 'raw'}
                      onClick={() => setFormatOption('raw')}
                    >
                      <i className="bx bx-code"></i>
                      <div>Raw</div>
                    </S.FormatOption>
                  </S.FormatOptions>
                </S.OptionGroup>
              </S.OptionsGrid>

              <S.CheckboxOption>
                <S.Checkbox
                  type="checkbox"
                  checked={includeTimestamps}
                  onChange={(e) => setIncludeTimestamps(e.target.checked)}
                />
                <S.CheckboxLabel>Include timestamps</S.CheckboxLabel>
              </S.CheckboxOption>
            </S.OptionsCard>

            {transcriptHistory.length > 0 && (
              <S.HistoryCard>
                <S.CardTitle>
                  <i className="bx bx-history"></i>
                  Recent Transcripts
                </S.CardTitle>
                <S.HistoryList>
                  {transcriptHistory.slice(0, 5).map((item) => (
                    <S.HistoryItem key={item.id} onClick={() => setUrl(item.url)}>
                      <S.HistoryIcon>
                        <i className="bx bx-video"></i>
                      </S.HistoryIcon>
                      <S.HistoryDetails>
                        <S.HistoryTitle>{item.title}</S.HistoryTitle>
                        <S.HistoryMeta>
                          {item.channel} • {item.transcriptLength} segments • {item.date.toLocaleDateString()}
                        </S.HistoryMeta>
                      </S.HistoryDetails>
                    </S.HistoryItem>
                  ))}
                </S.HistoryList>
              </S.HistoryCard>
            )}

            <S.ErrorMessage>
              {error}
              <S.BackendRecommendation>
                <strong>💡 For reliable transcript extraction, consider:</strong>
                <ul>
                  <li>Setting up a backend API using Python's youtube-transcript-api</li>
                  <li>Using a paid transcript service for production use</li>
                  <li>The free proxy method has limitations due to YouTube's restrictions</li>
                </ul>
              </S.BackendRecommendation>
            </S.ErrorMessage>

            <S.ActionButtons>
              <S.PrimaryButton onClick={handleSubmit} disabled={!url.trim()}>
                <i className="bx bx-download"></i>
                Extract Transcript
              </S.PrimaryButton>
            </S.ActionButtons>
          </S.InputSection>
        )}

        {/* Step 2: Processing */}
        {currentStep === 'processing' && (
          <S.ProcessingSection>
            <S.SectionTitle>
              <i className="bx bx-loader-alt bx-spin"></i>
              Extracting Transcript
            </S.SectionTitle>
            
            <S.ProcessingCard>
              <S.ProcessingSteps>
                <S.ProcessingStep active={true}>
                  <i className="bx bx-check"></i>
                  <span>Video URL validated</span>
                </S.ProcessingStep>
                <S.ProcessingStep active={isLoading}>
                  <i className="bx bx-loader-alt bx-spin"></i>
                  <span>Fetching video information</span>
                </S.ProcessingStep>
                <S.ProcessingStep active={false}>
                  <i className="bx bx-text"></i>
                  <span>Extracting captions</span>
                </S.ProcessingStep>
                <S.ProcessingStep active={false}>
                  <i className="bx bx-check-circle"></i>
                  <span>Processing complete</span>
                </S.ProcessingStep>
              </S.ProcessingSteps>
              
              <S.ProcessingNote>
                This may take a few moments depending on video length and caption availability...
              </S.ProcessingNote>
            </S.ProcessingCard>
          </S.ProcessingSection>
        )}

        {/* Step 3: Results */}
        {currentStep === 'results' && (
          <S.ResultSection>
            <S.SectionTitle>
              <i className="bx bx-check-circle"></i>
              Transcript Extracted Successfully
            </S.SectionTitle>

            {videoInfo && (
              <S.VideoInfoCard>
                <S.VideoThumbnail>
                  <img 
                    src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                    alt="Video thumbnail"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                    }}
                  />
                </S.VideoThumbnail>
                <S.VideoDetails>
                  <S.VideoTitle>{videoInfo.title}</S.VideoTitle>
                  <S.VideoMeta>
                    <span>{videoInfo.channel}</span>
                    <span>•</span>
                    <span>{transcript.length} transcript segments</span>
                  </S.VideoMeta>
                </S.VideoDetails>
              </S.VideoInfoCard>
            )}

            <S.TranscriptCard>
              <S.TranscriptHeader>
                <S.CardTitle>
                  <i className="bx bx-text"></i>
                  Transcript
                </S.CardTitle>
                <S.TranscriptActions>
                  <S.SecondaryButton onClick={handleCopy}>
                    <i className="bx bx-copy"></i>
                    Copy
                  </S.SecondaryButton>
                  <S.SecondaryButton onClick={handleDownload}>
                    <i className="bx bx-download"></i>
                    Download
                  </S.SecondaryButton>
                </S.TranscriptActions>
              </S.TranscriptHeader>

              <S.TranscriptContent>
                {formatTranscript()}
              </S.TranscriptContent>
              
              <S.TranscriptStats>
                <S.StatItem>
                  <i className="bx bx-text"></i>
                  <span>{formatTranscript().split(' ').length} words</span>
                </S.StatItem>
                <S.StatItem>
                  <i className="bx bx-time"></i>
                  <span>{transcript.length > 0 ? formatTime(transcript[transcript.length - 1].start) : '0:00'} duration</span>
                </S.StatItem>
                <S.StatItem>
                  <i className="bx bx-list-ul"></i>
                  <span>{transcript.length} segments</span>
                </S.StatItem>
              </S.TranscriptStats>
            </S.TranscriptCard>

            <S.ActionButtons>
              <S.SecondaryButton onClick={() => {
                setCurrentStep('input');
                setUrl('');
                setTranscript([]);
                setVideoInfo(null);
                setError('');
              }}>
                <i className="bx bx-refresh"></i>
                Extract Another
              </S.SecondaryButton>
              <S.PrimaryButton onClick={handleDownload}>
                <i className="bx bx-download"></i>
                Download Transcript
              </S.PrimaryButton>
            </S.ActionButtons>
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