// src/pages/Tools/components/ChannelIdFinder/ChannelIdFinder.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdSense } from '../../../../components/AdSense/AdSense';
import * as S from './styles';

interface ChannelInfo {
  id: string;
  title: string;
  description: string;
  customUrl: string;
  thumbnail: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  publishedAt: string;
  country: string;
  verified: boolean;
  handles: string[];
  keywords: string[];
  uploadsPlaylistId: string;
}

export const ChannelIdFinder: React.FC = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [channelInfo, setChannelInfo] = useState<ChannelInfo | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searchType, setSearchType] = useState<'url' | 'name' | 'id'>('url');
  const [error, setError] = useState<string | null>(null);

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('channel_search_history');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  const saveToHistory = (searchTerm: string) => {
    const newHistory = [searchTerm, ...searchHistory.filter(h => h !== searchTerm)].slice(0, 6);
    setSearchHistory(newHistory);
    localStorage.setItem('channel_search_history', JSON.stringify(newHistory));
  };

  const detectInputType = (input: string): 'url' | 'name' | 'id' => {
    const trimmed = input.trim();
    
    // Check if it's a YouTube URL
    if (trimmed.includes('youtube.com/') || trimmed.includes('youtu.be/')) {
      return 'url';
    }
    
    // Check if it's a channel ID (24 characters starting with UC)
    if (trimmed.match(/^UC[A-Za-z0-9_-]{22}$/)) {
      return 'id';
    }
    
    // Check if it's a handle (starts with @)
    if (trimmed.startsWith('@')) {
      return 'name';
    }
    
    // Default to name search
    return 'name';
  };

  const extractChannelInfo = (url: string): { type: string; value: string } | null => {
    const patterns = [
      // Channel ID URLs
      { regex: /youtube\.com\/channel\/([A-Za-z0-9_-]+)/, type: 'id' },
      // Custom URL
      { regex: /youtube\.com\/c\/([A-Za-z0-9_-]+)/, type: 'custom' },
      // User URL
      { regex: /youtube\.com\/user\/([A-Za-z0-9_-]+)/, type: 'user' },
      // Handle URL
      { regex: /youtube\.com\/@([A-Za-z0-9_.-]+)/, type: 'handle' },
      // Video URL (extract channel from video)
      { regex: /youtube\.com\/watch\?v=([A-Za-z0-9_-]+)/, type: 'video' },
      // Shorts URL
      { regex: /youtube\.com\/shorts\/([A-Za-z0-9_-]+)/, type: 'video' }
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern.regex);
      if (match) {
        return { type: pattern.type, value: match[1] };
      }
    }
    
    return null;
  };

  const fetchChannelByVideoId = async (videoId: string): Promise<string> => {
    const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
    
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?` +
      `part=snippet&id=${videoId}&key=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.items || data.items.length === 0) {
      throw new Error('Video not found');
    }

    return data.items[0].snippet.channelId;
  };

  const fetchChannelBySearch = async (searchTerm: string): Promise<string> => {
    const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
    
    // Try searching for channels
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
      throw new Error('Channel not found with that name/handle');
    }

    return data.items[0].snippet.channelId;
  };

  const fetchChannelDetails = async (channelId: string): Promise<ChannelInfo> => {
    const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
    
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?` +
      `part=snippet,statistics,brandingSettings,contentDetails&id=${channelId}&key=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.items || data.items.length === 0) {
      throw new Error('Channel not found');
    }

    const channel = data.items[0];
    const snippet = channel.snippet;
    const statistics = channel.statistics;
    const branding = channel.brandingSettings;
    const contentDetails = channel.contentDetails;

    // Extract possible handles
    const handles: string[] = [];
    if (snippet.customUrl) {
      handles.push(snippet.customUrl.startsWith('@') ? snippet.customUrl : `@${snippet.customUrl}`);
    }
    if (branding?.channel?.unsubscribedTrailer) {
      // Sometimes additional handles can be found in branding
    }

    return {
      id: channel.id,
      title: snippet.title,
      description: snippet.description || '',
      customUrl: snippet.customUrl || '',
      thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || '',
      subscriberCount: parseInt(statistics?.subscriberCount || '0'),
      videoCount: parseInt(statistics?.videoCount || '0'),
      viewCount: parseInt(statistics?.viewCount || '0'),
      publishedAt: snippet.publishedAt,
      country: snippet.country || '',
      verified: snippet.customUrl ? true : false, // Simplified verification check
      handles: handles.length > 0 ? handles : [snippet.customUrl ? `@${snippet.customUrl}` : ''],
      keywords: branding?.channel?.keywords ? branding.channel.keywords.split(',').map((k: string) => k.trim()) : [],
      uploadsPlaylistId: contentDetails?.relatedPlaylists?.uploads || ''
    };
  };

  const searchChannel = async () => {
    if (!input.trim()) {
      setError('Please enter a channel URL, name, or ID');
      return;
    }

    const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
    if (!API_KEY) {
      setError('YouTube API key not configured. Please add REACT_APP_YOUTUBE_API_KEY to your environment variables.');
      return;
    }

    setIsSearching(true);
    setShowResults(false);
    setError(null);

    try {
      const detectedType = detectInputType(input);
      setSearchType(detectedType);

      let channelId: string;

      if (detectedType === 'id') {
        // Direct channel ID
        channelId = input.trim();
      } else if (detectedType === 'url') {
        // Extract from URL
        const extracted = extractChannelInfo(input);
        if (!extracted) {
          throw new Error('Could not extract channel information from URL');
        }

        if (extracted.type === 'id') {
          channelId = extracted.value;
        } else if (extracted.type === 'video') {
          // Get channel ID from video
          channelId = await fetchChannelByVideoId(extracted.value);
        } else {
          // For custom URLs, user URLs, handles - search by name
          channelId = await fetchChannelBySearch(extracted.value);
        }
      } else {
        // Search by name/handle
        const searchTerm = input.startsWith('@') ? input.slice(1) : input;
        channelId = await fetchChannelBySearch(searchTerm);
      }

      // Fetch detailed channel information
      const channelDetails = await fetchChannelDetails(channelId);
      
      saveToHistory(input);
      setChannelInfo(channelDetails);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching channel:', error);
      setError(error instanceof Error ? error.message : 'Failed to find channel. Please check your input and try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(`${label} copied to clipboard!`);
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert(`${label} copied to clipboard!`);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInputTypeIcon = (type: string) => {
    switch (type) {
      case 'url': return 'bx bx-link';
      case 'id': return 'bx bx-hash';
      case 'name': return 'bx bx-user';
      default: return 'bx bx-search';
    }
  };

  const getInputTypeLabel = (type: string) => {
    switch (type) {
      case 'url': return 'YouTube URL';
      case 'id': return 'Channel ID';
      case 'name': return 'Channel Name/Handle';
      default: return 'Search';
    }
  };

  const generateApiUrl = (channelId: string) => {
    return `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=YOUR_API_KEY`;
  };

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
          <S.Title>Channel ID Finder</S.Title>
          <S.Subtitle>
            Find any YouTube channel's ID, statistics, and detailed information instantly
          </S.Subtitle>
        </S.Header>

        <S.SearchContainer>
          <S.SearchSection>
            <S.SectionTitle>
              <i className="bx bx-search-alt"></i>
              Find Channel Information
            </S.SectionTitle>
            
            
            <S.SearchBar>
              <S.SearchInput
                type="text"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setSearchType(detectInputType(e.target.value));
                  if (error) setError(null);
                }}
                placeholder="Enter channel URL, name, handle (@username), or channel ID"
                onKeyPress={(e) => e.key === 'Enter' && searchChannel()}
                autoFocus
              />
              <S.SearchButton onClick={searchChannel} disabled={isSearching || !input.trim()}>
                {isSearching ? (
                  <>
                    <i className="bx bx-loader-alt bx-spin"></i>
                    Searching...
                  </>
                ) : (
                  <>
                    <i className="bx bx-search"></i>
                    Find Channel
                  </>
                )}
              </S.SearchButton>
            </S.SearchBar>

            {error && (
              <S.ErrorMessage>
                <i className="bx bx-error"></i>
                {error}
              </S.ErrorMessage>
            )}

            <S.ExamplesGrid>
              <S.ExampleCard onClick={() => setInput('https://youtube.com/@mkbhd')}>
                <i className="bx bx-link"></i>
                <div>
                  <strong>URL Example</strong>
                  <span>https://youtube.com/@mkbhd</span>
                </div>
              </S.ExampleCard>
              
              <S.ExampleCard onClick={() => setInput('@mkbhd')}>
                <i className="bx bx-user"></i>
                <div>
                  <strong>Handle Example</strong>
                  <span>@mkbhd</span>
                </div>
              </S.ExampleCard>
              
              <S.ExampleCard onClick={() => setInput('UCBJycsmduvYEL83R_U4JriQ')}>
                <i className="bx bx-hash"></i>
                <div>
                  <strong>Channel ID</strong>
                  <span>UCBJycsmduvYEL83R_U4JriQ</span>
                </div>
              </S.ExampleCard>
            </S.ExamplesGrid>
          </S.SearchSection>

          {searchHistory.length > 0 && (
            <S.HistorySection>
              <S.HistoryLabel>Recent searches:</S.HistoryLabel>
              <S.HistoryList>
                {searchHistory.map((term, index) => (
                  <S.HistoryItem key={index} onClick={() => setInput(term)}>
                    <i className="bx bx-time"></i>
                    <span>{term}</span>
                  </S.HistoryItem>
                ))}
              </S.HistoryList>
            </S.HistorySection>
          )}
        </S.SearchContainer>

        {isSearching && (
          <S.LoadingContainer>
            <S.LoadingAnimation>
              <i className="bx bx-loader-alt bx-spin"></i>
            </S.LoadingAnimation>
            <S.LoadingText>Searching for channel...</S.LoadingText>
            <S.LoadingSteps>
              <S.LoadingStep>Resolving channel identifier</S.LoadingStep>
              <S.LoadingStep>Fetching channel data from YouTube API</S.LoadingStep>
              <S.LoadingStep>Loading statistics and metadata</S.LoadingStep>
            </S.LoadingSteps>
          </S.LoadingContainer>
        )}

        {showResults && channelInfo && (
          <S.ResultsContainer>
            <S.ResultsHeader>
              <S.ResultsTitle>Channel Information</S.ResultsTitle>
              <S.NewSearchButton onClick={() => { setShowResults(false); setInput(''); setError(null); }}>
                <i className="bx bx-plus"></i>
                New Search
              </S.NewSearchButton>
            </S.ResultsHeader>

            {/* Channel Overview */}
            <S.ChannelOverview>
              <S.ChannelThumbnail src={channelInfo.thumbnail} alt={channelInfo.title} />
              <S.ChannelDetails>
                <S.ChannelHeader>
                  <S.ChannelName>
                    {channelInfo.title}
                    {channelInfo.verified && (
                      <S.VerifiedBadge>
                        <i className="bx bx-check-circle"></i>
                        Verified
                      </S.VerifiedBadge>
                    )}
                  </S.ChannelName>
                  <S.ChannelHandle>{channelInfo.customUrl}</S.ChannelHandle>
                </S.ChannelHeader>
                
                <S.ChannelStats>
                  <S.StatItem>
                    <i className="bx bx-group"></i>
                    <strong>{channelInfo.subscriberCount.toLocaleString()}</strong>
                    <span>subscribers</span>
                  </S.StatItem>
                  <S.StatItem>
                    <i className="bx bx-video"></i>
                    <strong>{channelInfo.videoCount.toLocaleString()}</strong>
                    <span>videos</span>
                  </S.StatItem>
                  <S.StatItem>
                    <i className="bx bx-show"></i>
                    <strong>{channelInfo.viewCount.toLocaleString()}</strong>
                    <span>total views</span>
                  </S.StatItem>
                </S.ChannelStats>

                <S.ChannelDescription>
                  {channelInfo.description}
                </S.ChannelDescription>
              </S.ChannelDetails>
            </S.ChannelOverview>

            {/* Channel IDs and Links */}
            <S.InfoGrid>
              <S.InfoCard>
                <S.CardTitle>
                  <i className="bx bx-hash"></i>
                  Channel ID
                </S.CardTitle>
                <S.CopyableField>
                  <S.FieldValue>{channelInfo.id}</S.FieldValue>
                  <S.CopyButton onClick={() => copyToClipboard(channelInfo.id, 'Channel ID')}>
                    <i className="bx bx-copy"></i>
                    Copy
                  </S.CopyButton>
                </S.CopyableField>
                <S.FieldNote>Use this ID for YouTube Data API calls</S.FieldNote>
              </S.InfoCard>

              <S.InfoCard>
                <S.CardTitle>
                  <i className="bx bx-link"></i>
                  Channel URL
                </S.CardTitle>
                <S.CopyableField>
                  <S.FieldValue>youtube.com/channel/{channelInfo.id}</S.FieldValue>
                  <S.CopyButton onClick={() => copyToClipboard(`https://youtube.com/channel/${channelInfo.id}`, 'Channel URL')}>
                    <i className="bx bx-copy"></i>
                    Copy
                  </S.CopyButton>
                </S.CopyableField>
                <S.FieldNote>Direct link to channel page</S.FieldNote>
              </S.InfoCard>

              <S.InfoCard>
                <S.CardTitle>
                  <i className="bx bx-user"></i>
                  Custom URL
                </S.CardTitle>
                <S.CopyableField>
                  <S.FieldValue>{channelInfo.customUrl ? `youtube.com/${channelInfo.customUrl}` : 'Not available'}</S.FieldValue>
                  <S.CopyButton 
                    onClick={() => copyToClipboard(
                      channelInfo.customUrl ? `https://youtube.com/${channelInfo.customUrl}` : `https://youtube.com/channel/${channelInfo.id}`, 
                      'Custom URL'
                    )}
                  >
                    <i className="bx bx-copy"></i>
                    Copy
                  </S.CopyButton>
                </S.CopyableField>
                <S.FieldNote>Branded channel URL</S.FieldNote>
              </S.InfoCard>

              <S.InfoCard>
                <S.CardTitle>
                  <i className="bx bx-code"></i>
                  API Endpoint
                </S.CardTitle>
                <S.CopyableField>
                  <S.FieldValue>{generateApiUrl(channelInfo.id)}</S.FieldValue>
                  <S.CopyButton onClick={() => copyToClipboard(generateApiUrl(channelInfo.id), 'API URL')}>
                    <i className="bx bx-copy"></i>
                    Copy
                  </S.CopyButton>
                </S.CopyableField>
                <S.FieldNote>YouTube Data API v3 endpoint</S.FieldNote>
              </S.InfoCard>

              {channelInfo.uploadsPlaylistId && (
                <S.InfoCard>
                  <S.CardTitle>
                    <i className="bx bx-playlist"></i>
                    Uploads Playlist ID
                  </S.CardTitle>
                  <S.CopyableField>
                    <S.FieldValue>{channelInfo.uploadsPlaylistId}</S.FieldValue>
                    <S.CopyButton onClick={() => copyToClipboard(channelInfo.uploadsPlaylistId, 'Uploads Playlist ID')}>
                      <i className="bx bx-copy"></i>
                      Copy
                    </S.CopyButton>
                  </S.CopyableField>
                  <S.FieldNote>Use to fetch all channel videos</S.FieldNote>
                </S.InfoCard>
              )}
            </S.InfoGrid>

            {/* Additional Information */}
            <S.AdditionalInfo>
              <S.SectionTitle>
                <i className="bx bx-info-circle"></i>
                Additional Information
              </S.SectionTitle>
              
              <S.InfoList>
                <S.InfoItem>
                  <S.InfoLabel>
                    <i className="bx bx-calendar"></i>
                    Created Date:
                  </S.InfoLabel>
                  <S.InfoValue>{formatDate(channelInfo.publishedAt)}</S.InfoValue>
                </S.InfoItem>

                <S.InfoItem>
                  <S.InfoLabel>
                    <i className="bx bx-world"></i>
                    Country:
                  </S.InfoLabel>
                  <S.InfoValue>{channelInfo.country || 'Not specified'}</S.InfoValue>
                </S.InfoItem>

                <S.InfoItem>
                  <S.InfoLabel>
                    <i className="bx bx-check-shield"></i>
                    Custom URL:
                  </S.InfoLabel>
                  <S.InfoValue>
                    <S.VerificationStatus verified={!!channelInfo.customUrl}>
                      <i className={channelInfo.customUrl ? "bx bx-check-circle" : "bx bx-x-circle"}></i>
                      {channelInfo.customUrl ? 'Available' : 'Not Available'}
                    </S.VerificationStatus>
                  </S.InfoValue>
                </S.InfoItem>

                {channelInfo.handles.length > 0 && channelInfo.handles[0] && (
                  <S.InfoItem>
                    <S.InfoLabel>
                      <i className="bx bx-at"></i>
                      Handle(s):
                    </S.InfoLabel>
                    <S.HandlesList>
                      {channelInfo.handles.filter(handle => handle).map((handle, index) => (
                        <S.HandleTag key={index}>{handle}</S.HandleTag>
                      ))}
                    </S.HandlesList>
                  </S.InfoItem>
                )}

                {channelInfo.keywords.length > 0 && (
                  <S.InfoItem>
                    <S.InfoLabel>
                      <i className="bx bx-tag"></i>
                      Channel Keywords:
                    </S.InfoLabel>
                    <S.HandlesList>
                      {channelInfo.keywords.slice(0, 5).map((keyword, index) => (
                        <S.HandleTag key={index}>{keyword}</S.HandleTag>
                      ))}
                    </S.HandlesList>
                  </S.InfoItem>
                )}
              </S.InfoList>
            </S.AdditionalInfo>

            {/* Quick Actions */}
            <S.QuickActions>
              <S.SectionTitle>
                <i className="bx bx-rocket"></i>
                Quick Actions
              </S.SectionTitle>
              
              <S.ActionsList>
                <S.ActionButton
                  href={`https://youtube.com/channel/${channelInfo.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="bx bx-play-circle"></i>
                  <div>
                    <strong>Visit Channel</strong>
                    <span>Open in YouTube</span>
                  </div>
                </S.ActionButton>

                <S.ActionButton
                  href={`https://youtube.com/channel/${channelInfo.id}/videos`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="bx bx-video"></i>
                  <div>
                    <strong>View Videos</strong>
                    <span>Browse all uploads</span>
                  </div>
                </S.ActionButton>

                <S.ActionButton
                  href={`https://youtube.com/channel/${channelInfo.id}/about`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="bx bx-info-circle"></i>
                  <div>
                    <strong>About Page</strong>
                    <span>Channel details</span>
                  </div>
                </S.ActionButton>

                {channelInfo.uploadsPlaylistId && (
                  <S.ActionButton
                    href={`https://youtube.com/playlist?list=${channelInfo.uploadsPlaylistId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="bx bx-playlist"></i>
                    <div>
                      <strong>All Videos</strong>
                      <span>Uploads playlist</span>
                    </div>
                  </S.ActionButton>
                )}

                <S.ActionButton
                  onClick={() => copyToClipboard(
                    `Channel: ${channelInfo.title}\nID: ${channelInfo.id}\nURL: https://youtube.com/channel/${channelInfo.id}\nSubscribers: ${channelInfo.subscriberCount.toLocaleString()}\nVideos: ${channelInfo.videoCount.toLocaleString()}\nTotal Views: ${channelInfo.viewCount.toLocaleString()}`,
                    'Channel Info'
                  )}
                >
                  <i className="bx bx-share"></i>
                  <div>
                    <strong>Share Info</strong>
                    <span>Copy summary</span>
                  </div>
                </S.ActionButton>
              </S.ActionsList>
            </S.QuickActions>
          </S.ResultsContainer>
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

export default ChannelIdFinder;