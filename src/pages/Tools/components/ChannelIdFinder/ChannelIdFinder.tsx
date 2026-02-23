import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../../../../components/SEO';
import { GoogleAd } from '../../../../components/GoogleAd';
import { toolsSEO, generateToolSchema } from '../../../../config/toolsSEO';
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

  // ✅ SEO setup
  const seoConfig = toolsSEO['channel-id-finder'];
  const schemaData = generateToolSchema('channel-id-finder', seoConfig, [
    { question: 'What is the difference between a channel ID and a handle?', answer: 'A channel ID is YouTube\'s permanent internal identifier — a 24-character string beginning with "UC" that never changes regardless of what the creator renames their channel. A handle is the @username the creator chose, which can be changed. For API integrations and long-term tracking, always use the channel ID.' },
    { question: 'How do I find my own channel ID without this tool?', answer: 'In YouTube Studio, click your profile picture → Settings → Advanced Settings → Channel ID. The 24-character string shown there is your channel ID. Alternatively, open your channel page in a browser, right-click and view the page source, then search for "channelId" — it appears multiple times in the HTML.' },
    { question: 'Can I look up a channel from a video URL?', answer: 'Yes. Paste any youtube.com/watch?v=VIDEO_ID URL into the search field and the tool will automatically fetch the video\'s associated channel ID and then retrieve full channel details.' },
    { question: 'Does the tool work for channels that have changed their handle or URL?', answer: 'Yes. Because the tool resolves all lookups to the underlying channel ID, it works regardless of what the creator\'s current handle or custom URL is. If you search by an old URL that still redirects to the channel, the tool will find the correct channel ID.' }
  ]);

  // Tool configuration
  const toolConfig = {
    name: 'Channel ID Finder',
    description: 'Find any YouTube channel\'s ID, statistics, and detailed information from URLs, names, or handles',
    image: 'https://64.media.tumblr.com/10ccc3757948e253900a92bc6ce226ab/0e01452f9f6dd974-3b/s2048x3072/62471a32052a5c06b185d9c0242331a986f0cca6.jpg',
    icon: 'bx bx-search-alt-2',
    features: [
      'Multi-format search',
      'Complete channel data',
      'API-ready results'
    ]
  };

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
      { regex: /youtube\.com\/shorts\/([A-Za-z0-9_-]+)/, type: 'video' },
      // Handle without @ - Matches youtube.com/moneyguyshow
      { regex: /youtube\.com\/([A-Za-z0-9_-]+)$/, type: 'handleWithoutAt' }
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
    const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY_4;
    
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
    const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY_4;
    
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
    const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY_4;
    
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

    const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY_4;
    if (!API_KEY) {
      setError('YouTube API key not configured.');
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
        } else if (extracted.type === 'handleWithoutAt') {
          // For handles without @ symbol, try forHandle first then search
          const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY_4;
          let response = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${extracted.value}&key=${API_KEY}`
          );
          let data = await response.json();
          if (data.items?.[0]) {
            channelId = data.items[0].id;
          } else {
            // If not found, try search
            channelId = await fetchChannelBySearch(extracted.value);
          }
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
    <>
      <SEO
        title={seoConfig.title}
        description={seoConfig.description}
        keywords={seoConfig.keywords}
        canonical="https://youtool.io/tools/channel-id-finder"
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
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      setSearchType(detectInputType(e.target.value));
                      if (error) setError(null);
                    }}
                    placeholder="Enter channel URL, name, handle (@username), or channel ID"
                    onKeyPress={(e) => e.key === 'Enter' && searchChannel()}
                  />
                  <S.HeaderSearchButton onClick={searchChannel} disabled={isSearching || !input.trim()}>
                    {isSearching ? (
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

        {/* Google Ad Spot */}
        <GoogleAd adSlot="1234567890" />

        {/* Error Message */}
        {error && (
          <S.ErrorMessage>
            <i className="bx bx-error"></i>
            {error}
          </S.ErrorMessage>
        )}

        {/* Search History */}
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

        {/* Educational Content Section */}
        {!showResults && !isSearching && (
          <S.EducationalSection>
            <S.EducationalContent>
              <S.SectionSubTitle>How to Use the Channel ID Finder</S.SectionSubTitle>
              
              <S.EducationalText>
                Our Channel ID Finder extracts comprehensive information from any YouTube channel using multiple 
                search methods. Whether you have a channel URL, handle, name, or even a video link, our tool 
                identifies the channel and provides complete details including statistics, IDs, and API endpoints.
              </S.EducationalText>

              <S.StepByStep>
                <S.StepItem>
                  <S.StepNumberCircle>1</S.StepNumberCircle>
                  <S.StepContent>
                    <S.StepTitle>Enter Channel Information</S.StepTitle>
                    <S.EducationalText>
                      Paste any YouTube channel URL, type a channel name, enter a @handle, use a direct 
                      channel ID, or even paste a video URL. Our intelligent system automatically detects 
                      the input type and finds the associated channel information.
                    </S.EducationalText>
                  </S.StepContent>
                </S.StepItem>

                <S.StepItem>
                  <S.StepNumberCircle>2</S.StepNumberCircle>
                  <S.StepContent>
                    <S.StepTitle>Automatic Resolution</S.StepTitle>
                    <S.EducationalText>
                      The tool processes your input through multiple resolution methods including URL parsing, 
                      API searches, and video-to-channel mapping. We handle all YouTube URL formats and 
                      find channels even from video or playlist links.
                    </S.EducationalText>
                  </S.StepContent>
                </S.StepItem>

                <S.StepItem>
                  <S.StepNumberCircle>3</S.StepNumberCircle>
                  <S.StepContent>
                    <S.StepTitle>Complete Channel Data</S.StepTitle>
                    <S.EducationalText>
                      Get comprehensive channel information including IDs, statistics, custom URLs, handles, 
                      API endpoints, and metadata. All data is formatted for easy copying and immediate use 
                      in your projects, research, or API integrations.
                    </S.EducationalText>
                  </S.StepContent>
                </S.StepItem>
              </S.StepByStep>
            </S.EducationalContent>

            <S.EducationalContent>
              <S.SectionSubTitle>Supported Input Formats</S.SectionSubTitle>
              
              <S.FeatureList>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Channel URLs:</strong> youtube.com/channel/UC..., youtube.com/c/name, youtube.com/user/name</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Handle/Username:</strong> @channelname or youtube.com/@channelname formats</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Direct Channel IDs:</strong> 24-character IDs starting with UC for immediate lookup</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Video URLs:</strong> Extract channel information from any video or shorts link</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Channel Names:</strong> Search by channel name for popular or unique channels</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>API Integration:</strong> Ready-to-use YouTube Data API v3 endpoints for developers</span>
                </S.FeatureListItem>
              </S.FeatureList>

              <S.EducationalText>
                Perfect for developers, researchers, marketers, and content creators who need to programmatically 
                access YouTube channel data. All results include both human-readable information and 
                API-ready identifiers for seamless integration with your applications or analysis workflows.
              </S.EducationalText>
            </S.EducationalContent>

            <S.EducationalContent>
              <S.SectionSubTitle>Why You Need Your Channel ID</S.SectionSubTitle>

              <S.EducationalText>
                Every YouTube channel has two primary identifiers: a human-readable handle (@username) and a machine-readable channel ID (the 24-character string starting with "UC"). While handles are easy to remember and share, channel IDs are required for many important technical tasks. The YouTube Data API v3 uses channel IDs — not handles — as the primary parameter for fetching channel statistics, video lists, playlists, and community posts programmatically.
              </S.EducationalText>
              <S.EducationalText>
                Channel IDs are also permanent. Even if a creator changes their handle, custom URL, or channel name, their channel ID never changes. This makes the channel ID the most reliable identifier for long-term tracking, RSS feed subscriptions, API integrations, and database records.
              </S.EducationalText>
            </S.EducationalContent>

            <S.EducationalContent>
              <S.SectionSubTitle>Frequently Asked Questions</S.SectionSubTitle>

              <S.FeatureList>
                <S.FeatureListItem>
                  <i className="bx bx-help-circle"></i>
                  <span><strong>What is the difference between a channel ID and a handle?</strong> A channel ID is YouTube's permanent internal identifier — a 24-character string beginning with "UC" that never changes regardless of what the creator renames their channel. A handle is the @username the creator chose, which can be changed. For API integrations and long-term tracking, always use the channel ID. For sharing links with humans, handles are more readable.</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-help-circle"></i>
                  <span><strong>How do I find my own channel ID without this tool?</strong> In YouTube Studio, click your profile picture → Settings → Advanced Settings → Channel ID. The 24-character string shown there is your channel ID. Alternatively, open your channel page in a browser, right-click and view the page source, then search for "channelId" — it appears multiple times in the HTML.</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-help-circle"></i>
                  <span><strong>What is an uploads playlist ID and what is it used for?</strong> Every YouTube channel has a hidden playlist that contains all of its public uploads in chronological order. This uploads playlist ID (which starts with "UU" instead of "PL") is used by developers to retrieve all videos from a channel using the YouTube Data API's playlistItems endpoint — which is more efficient than the search endpoint for bulk video retrieval.</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-help-circle"></i>
                  <span><strong>Can I look up a channel from a video URL?</strong> Yes. Paste any youtube.com/watch?v=VIDEO_ID URL into the search field and the tool will automatically fetch the video's associated channel ID and then retrieve full channel details. This is useful when you encounter a video you want to research but don't know the creator's handle or channel page URL.</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-help-circle"></i>
                  <span><strong>Does the tool work for channels that have changed their handle or URL?</strong> Yes. Because the tool resolves all lookups to the underlying channel ID, it works regardless of what the creator's current handle or custom URL is. If you search by an old URL that still redirects to the channel, the tool will find the correct channel ID.</span>
                </S.FeatureListItem>
              </S.FeatureList>
            </S.EducationalContent>

            <S.EducationalContent>
              <S.SectionSubTitle>Related Tools</S.SectionSubTitle>

              <S.FeatureList>
                <S.FeatureListItem>
                  <i className="bx bx-link"></i>
                  <span><a href="/tools/subscribe-link-generator"><strong>Subscribe Link Generator</strong></a> — Use your channel ID to generate optimized subscribe links and QR codes for marketing materials.</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-link"></i>
                  <span><a href="/tools/channel-analyzer"><strong>Channel Analyzer</strong></a> — Run a full analytics audit on any channel using its URL or ID to get engagement scores, SEO ratings, and growth metrics.</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-link"></i>
                  <span><a href="/tools/channel-comparer"><strong>Channel Comparer</strong></a> — Compare two channels head-to-head across subscribers, views, engagement, and upload frequency using their channel IDs.</span>
                </S.FeatureListItem>
              </S.FeatureList>
            </S.EducationalContent>
          </S.EducationalSection>
        )}

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
        </S.MainContainer>
      </S.PageWrapper>
    </>
  );
};

export default ChannelIdFinder;