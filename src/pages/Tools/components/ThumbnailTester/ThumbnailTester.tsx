// src/pages/Tools/components/ThumbnailTester/ThumbnailTester.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../../../../components/SEO';import { toolsSEO, generateToolSchema } from '../../../../config/toolsSEO';
import * as S from './styles';

const TT_API_KEYS = [
  process.env.REACT_APP_YOUTUBE_API_KEY_3,
  process.env.REACT_APP_YOUTUBE_API_KEY_4,
  process.env.REACT_APP_YOUTUBE_API_KEY_5,
  process.env.REACT_APP_YOUTUBE_API_KEY_7,
  process.env.REACT_APP_YOUTUBE_API_KEY_8,
  process.env.REACT_APP_YOUTUBE_API_KEY,
].filter(Boolean) as string[];

interface PreviewScenario {
  name: string;
  class: string;
  showProfile: boolean;
  icon: string;
  description: string;
}

interface ChannelVideo {
  thumbnail: string;
  title: string;
  channelTitle: string;
  profilePicture: string;
  isUser?: boolean;
}

interface ComparisonSettings {
  mode: 'trending' | 'channel';
  channelUrl: string;
  darkMode: boolean;
  layout: 'grid' | 'list';
}

const previewScenarios: PreviewScenario[] = [
  {
    name: 'Desktop Home',
    class: 'home-large',
    showProfile: true,
    icon: 'bx-desktop',
    description: 'How your thumbnail appears on desktop homepage'
  },
  {
    name: 'Mobile Home',
    class: 'home-small',
    showProfile: false,
    icon: 'bx-mobile',
    description: 'Mobile homepage layout view'
  },
  {
    name: 'Sidebar',
    class: 'sidebar',
    showProfile: false,
    icon: 'bx-sidebar',
    description: 'Suggested videos sidebar appearance'
  },
];

export const ThumbnailTester: React.FC = () => {
  const navigate = useNavigate();
  const keyIndexRef = useRef(0);
  const [title, setTitle] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [profileUrl, setProfileUrl] = useState<string | null>(null);
  const [channelName, setChannelName] = useState('Your Channel');
  const [showPreview, setShowPreview] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'input' | 'preview' | 'compare'>('input');

  const fetchWithKeyRotation = async (buildUrl: (key: string) => string): Promise<Response> => {
    for (let attempt = 0; attempt < TT_API_KEYS.length; attempt++) {
      const idx = (keyIndexRef.current + attempt) % TT_API_KEYS.length;
      const response = await fetch(buildUrl(TT_API_KEYS[idx]));
      if (response.status !== 403 && response.status !== 429) {
        keyIndexRef.current = idx;
        return response;
      }
    }
    throw new Error('All API keys exhausted');
  };

  // Tool configuration
  const toolConfig = {
    name: 'Thumbnail Tester',
    description: 'Preview how your thumbnails will look across different YouTube layouts and compare with trending videos',
    image: 'https://64.media.tumblr.com/c16a513f7724612ec41c27bf532b7d8f/0e01452f9f6dd974-6d/s2048x3072/8f37d7ca31ccb0b698b3e21d74c2e276c260c7a0.jpg',
    icon: 'bx bx-book-content',
    features: [
      'Layout preview testing',
      'Trending comparison',
      'CTR optimization'
    ]
  };

  // Comparison state
  const [comparisonVideos, setComparisonVideos] = useState<ChannelVideo[]>([]);
  const [settings, setSettings] = useState<ComparisonSettings>({
    mode: 'trending',
    channelUrl: '',
    darkMode: false,
    layout: 'grid'
  });

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleChannelNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChannelName(e.target.value);
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        alert('Image must be smaller than 50MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setThumbnailUrl(result);
        // DON'T automatically go to preview - wait for user to click button
      };
      reader.readAsDataURL(file);
    }
  };

  const handleThumbnailDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        alert('Image must be smaller than 50MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setThumbnailUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleThumbnailDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleProfileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Profile image must be smaller than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfileUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Profile image must be smaller than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfileUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const extractChannelId = (url: string): string | null => {
    const patterns = [
      /youtube\.com\/channel\/([\w-]+)/,
      /youtube\.com\/@([\w-]+)/,
      /youtube\.com\/c\/([\w-]+)/,
      /youtube\.com\/user\/([\w-]+)/,
      /youtube\.com\/([\w-]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1] !== 'c' && match[1] !== 'user' && match[1] !== 'channel') {
        return match[1];
      }
    }
    return null;
  };

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /youtube\.com\/watch\?v=([\w-]+)/,
      /youtu\.be\/([\w-]+)/,
      /youtube\.com\/embed\/([\w-]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  };

  const handleVideoUrlInput = async (url: string) => {
    if (!url.trim()) {
      alert('Please enter a YouTube video URL');
      return;
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      alert('Please enter a valid YouTube video URL');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetchWithKeyRotation(key =>
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${key}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch video data');
      }

      const data = await response.json();
      if (!data.items?.[0]) {
        throw new Error('Video not found');
      }

      const video = data.items[0];
      const thumbnail = video.snippet.thumbnails.maxres?.url ||
        video.snippet.thumbnails.high?.url ||
        video.snippet.thumbnails.medium?.url;

      setThumbnailUrl(thumbnail);
      setTitle(video.snippet.title);
      setChannelName(video.snippet.channelTitle);

      // Clear the input field
      const input = document.querySelector('input[placeholder*="YouTube video URL"]') as HTMLInputElement;
      if (input) input.value = '';

      alert('Thumbnail loaded successfully!');
    } catch (error) {
      console.error('Error loading thumbnail:', error);
      alert(`Failed to load thumbnail: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrendingVideos = async (): Promise<ChannelVideo[]> => {
    if (!TT_API_KEYS.length) {
      throw new Error('YouTube API key not configured');
    }

    try {
      const response = await fetchWithKeyRotation(key =>
        `https://www.googleapis.com/youtube/v3/videos?` +
        `part=snippet&chart=mostPopular&maxResults=15&key=${key}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch trending videos');
      }

      const data = await response.json();

      const channelIds = data.items.map((item: any) => item.snippet.channelId).join(',');
      const channelResponse = await fetchWithKeyRotation(key =>
        `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelIds}&key=${key}`
      );

      if (!channelResponse.ok) {
        throw new Error('Failed to fetch channel data');
      }

      const channelData = await channelResponse.json();

      const channelIcons: { [key: string]: string } = {};
      channelData.items.forEach((channel: any) => {
        channelIcons[channel.id] = channel.snippet.thumbnails.default.url;
      });

      return data.items.slice(0, 11).map((item: any) => ({
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        profilePicture: channelIcons[item.snippet.channelId] || 'https://via.placeholder.com/36',
        isUser: false
      }));
    } catch (error) {
      console.error('Error fetching trending videos:', error);
      throw error;
    }
  };

  const fetchChannelVideos = async (channelUrl: string): Promise<ChannelVideo[]> => {
    const channelId = extractChannelId(channelUrl);

    if (!channelId) {
      throw new Error('Invalid YouTube channel URL');
    }

    try {
      // First try to get channel directly
      let channelResponse = await fetchWithKeyRotation(key =>
        `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails&id=${channelId}&key=${key}`
      );
      let channelData = await channelResponse.json();

      // If not found, try searching by username for @handle channels
      if (!channelData.items?.length && channelUrl.includes('@')) {
        const searchResponse = await fetchWithKeyRotation(key =>
          `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${channelId}&key=${key}`
        );
        const searchData = await searchResponse.json();

        if (searchData.items?.length) {
          const foundChannelId = searchData.items[0].id.channelId;
          channelResponse = await fetchWithKeyRotation(key =>
            `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails&id=${foundChannelId}&key=${key}`
          );
          channelData = await channelResponse.json();
        }
      }

      if (!channelData.items?.length) {
        throw new Error('Channel not found');
      }

      const channelIcon = channelData.items[0].snippet.thumbnails.default.url;
      const channelTitle = channelData.items[0].snippet.title;
      const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

      // Get videos from uploads playlist (fetch more to account for filtering)
      const videosResponse = await fetchWithKeyRotation(key =>
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&key=${key}`
      );

      if (!videosResponse.ok) {
        throw new Error('Failed to fetch channel videos');
      }

      const videosData = await videosResponse.json();

      if (!videosData.items?.length) {
        throw new Error('No videos found for this channel');
      }

      // Extract video IDs to get detailed video information including duration
      const videoIds = videosData.items.map((item: any) => item.snippet.resourceId.videoId).join(',');

      // Fetch video details including duration and contentDetails
      const videoDetailsResponse = await fetchWithKeyRotation(key =>
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoIds}&key=${key}`
      );

      if (!videoDetailsResponse.ok) {
        throw new Error('Failed to fetch video details');
      }

      const videoDetailsData = await videoDetailsResponse.json();

      // Function to convert YouTube duration format (PT4M13S) to seconds
      const parseDuration = (duration: string): number => {
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!match) return 0;

        const hours = parseInt(match[1] || '0');
        const minutes = parseInt(match[2] || '0');
        const seconds = parseInt(match[3] || '0');

        return hours * 3600 + minutes * 60 + seconds;
      };

      // Filter out Shorts (videos under 60 seconds) and process videos
      const longFormatVideos = videoDetailsData.items
        .filter((video: any) => {
          const durationInSeconds = parseDuration(video.contentDetails.duration);
          // Filter out videos shorter than 60 seconds (Shorts)
          return durationInSeconds >= 60;
        })
        .slice(0, 11) // Take first 11 long-format videos
        .map((video: any) => ({
          thumbnail: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url,
          title: video.snippet.title,
          channelTitle: channelTitle,
          profilePicture: channelIcon,
          isUser: false
        }));

      if (longFormatVideos.length === 0) {
        throw new Error('No long-format videos found for this channel (only Shorts available)');
      }

      return longFormatVideos;
    } catch (error) {
      console.error('Error fetching channel videos:', error);
      throw error;
    }
  };

  const handleCompareWithTrending = async () => {
    if (!thumbnailUrl) {
      alert('Please upload a thumbnail first');
      return;
    }

    setIsLoading(true);
    setCurrentStep('compare');

    try {
      const videos = await fetchTrendingVideos();
      const userVideo: ChannelVideo = {
        thumbnail: thumbnailUrl,
        title: title || 'Your Video Title',
        channelTitle: channelName,
        profilePicture: profileUrl || 'https://via.placeholder.com/36',
        isUser: true
      };

      // Insert user video at random position
      const randomIndex = Math.floor(Math.random() * (videos.length + 1));
      videos.splice(randomIndex, 0, userVideo);

      setComparisonVideos(videos);
      setSettings(prev => ({ ...prev, mode: 'trending' }));
      setShowComparison(true);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to load trending videos. Please try again.');
      setCurrentStep('preview');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompareWithChannel = async () => {
    if (!thumbnailUrl) {
      alert('Please upload a thumbnail first');
      return;
    }

    if (!settings.channelUrl.trim()) {
      alert('Please enter a channel URL');
      return;
    }

    setIsLoading(true);
    setCurrentStep('compare');

    try {
      const videos = await fetchChannelVideos(settings.channelUrl);
      const userVideo: ChannelVideo = {
        thumbnail: thumbnailUrl,
        title: title || 'Your Video Title',
        channelTitle: channelName,
        profilePicture: profileUrl || videos[0]?.profilePicture || 'https://via.placeholder.com/36',
        isUser: true
      };

      // Insert user video at random position
      const randomIndex = Math.floor(Math.random() * (videos.length + 1));
      videos.splice(randomIndex, 0, userVideo);

      setComparisonVideos(videos);
      setSettings(prev => ({ ...prev, mode: 'channel' }));
      setShowComparison(true);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to load channel videos. Please check the URL and try again.');
      setCurrentStep('preview');
    } finally {
      setIsLoading(false);
    }
  };

  const startOver = () => {
    setCurrentStep('input');
    setThumbnailUrl(null);
    setProfileUrl(null);
    setTitle('');
    setChannelName('Your Channel');
    setShowPreview(false);
    setShowComparison(false);
    setComparisonVideos([]);
  };

  const renderStepIndicator = () => (
    <S.StepIndicator>
      <S.Step active={currentStep === 'input'} completed={currentStep !== 'input'}>
        <S.StepNumber active={currentStep === 'input'} completed={currentStep !== 'input'}>1</S.StepNumber>
        <S.StepLabel active={currentStep === 'input'} completed={currentStep !== 'input'}>Upload</S.StepLabel>
      </S.Step>
      <S.StepConnector completed={currentStep === 'compare'} />
      <S.Step active={currentStep === 'preview'} completed={currentStep === 'compare'}>
        <S.StepNumber active={currentStep === 'preview'} completed={currentStep === 'compare'}>2</S.StepNumber>
        <S.StepLabel active={currentStep === 'preview'} completed={currentStep === 'compare'}>Preview</S.StepLabel>
      </S.Step>
      <S.StepConnector completed={currentStep === 'compare'} />
      <S.Step active={currentStep === 'compare'} completed={false}>
        <S.StepNumber active={currentStep === 'compare'} completed={false}>3</S.StepNumber>
        <S.StepLabel active={currentStep === 'compare'} completed={false}>Compare</S.StepLabel>
      </S.Step>
    </S.StepIndicator>
  );

  const renderPreview = () => {
    if (!thumbnailUrl) return null;

    return (
      <S.YouTubePreviewContainer darkMode={settings.darkMode}>
        {previewScenarios.map((scenario) => (
          <S.YouTubePreviewCard key={scenario.class} darkMode={settings.darkMode}>
            <S.PreviewCardHeader>
              <S.PreviewCardTitle>
                <i className={scenario.icon}></i>
                {scenario.name}
              </S.PreviewCardTitle>
              <S.PreviewCardDescription>{scenario.description}</S.PreviewCardDescription>
            </S.PreviewCardHeader>

            <S.YouTubeVideoContainer layout={scenario.class} darkMode={settings.darkMode}>
              <S.YouTubeThumbnailContainer layout={scenario.class}>
                <S.YouTubeThumbnailImage src={thumbnailUrl} alt="Thumbnail" />
                <S.YouTubeVideoTime>14:56</S.YouTubeVideoTime>
              </S.YouTubeThumbnailContainer>

              <S.YouTubeVideoInfo layout={scenario.class}>
                {scenario.showProfile && (
                  <S.YouTubeProfilePicture
                    src={profileUrl || 'https://via.placeholder.com/36'}
                    alt="Channel"
                  />
                )}
                <S.YouTubeVideoDetails>
                  <S.YouTubeVideoTitle darkMode={settings.darkMode} layout={scenario.class}>
                    {title || 'Enter your title to see how it looks'}
                  </S.YouTubeVideoTitle>
                  <S.YouTubeChannelName darkMode={settings.darkMode}>{channelName}</S.YouTubeChannelName>
                  <S.YouTubeVideoMetadata darkMode={settings.darkMode}>
                    123K views • 1 hour ago
                  </S.YouTubeVideoMetadata>
                </S.YouTubeVideoDetails>
              </S.YouTubeVideoInfo>
            </S.YouTubeVideoContainer>
          </S.YouTubePreviewCard>
        ))}
      </S.YouTubePreviewContainer>
    );
  };

  const renderComparison = () => (
    <S.ComparisonContainer>
      <S.ComparisonHeader>
        <S.ComparisonTitle>
          <i className={settings.mode === 'trending' ? 'bx-trending-up' : 'bx-user'}></i>
          Your thumbnail compared to {settings.mode === 'trending' ? 'trending videos' : 'channel videos'}
        </S.ComparisonTitle>
        <S.ComparisonControls>
          <S.LayoutToggle>
            <S.LayoutButton
              active={settings.layout === 'grid'}
              onClick={() => setSettings(prev => ({ ...prev, layout: 'grid' }))}
            >
              <i className="bx bx-grid-alt"></i>
            </S.LayoutButton>
            <S.LayoutButton
              active={settings.layout === 'list'}
              onClick={() => setSettings(prev => ({ ...prev, layout: 'list' }))}
            >
              <i className="bx bx-list-ul"></i>
            </S.LayoutButton>
          </S.LayoutToggle>

          <S.DarkModeToggle>
            <S.ToggleInput
              type="checkbox"
              checked={settings.darkMode}
              onChange={(e) => setSettings(prev => ({ ...prev, darkMode: e.target.checked }))}
            />
            <S.ThemeSlider isChecked={settings.darkMode}>
              <i className='bx bx-sun'></i>
              <i className='bx bx-moon'></i>
            </S.ThemeSlider>
          </S.DarkModeToggle>
        </S.ComparisonControls>
      </S.ComparisonHeader>

      <S.YouTubeHomePage darkMode={settings.darkMode} layout={settings.layout}>
        {comparisonVideos.map((video, index) => (
          <S.YouTubeHomeVideo key={index} isUser={video.isUser} layout={settings.layout} darkMode={settings.darkMode}>
            <S.YouTubeHomeThumbnail layout={settings.layout}>
              <S.YouTubeThumbnailImage src={video.thumbnail} alt={video.title} />
              <S.YouTubeVideoTime>14:56</S.YouTubeVideoTime>
            </S.YouTubeHomeThumbnail>
            <S.YouTubeHomeVideoInfo layout={settings.layout}>
              <S.YouTubeProfilePicture src={video.profilePicture} alt={video.channelTitle} />
              <S.YouTubeVideoDetails>
                <S.YouTubeHomeVideoTitle darkMode={settings.darkMode} layout={settings.layout}>
                  {video.title}
                </S.YouTubeHomeVideoTitle>
                <S.YouTubeChannelName darkMode={settings.darkMode}>{video.channelTitle}</S.YouTubeChannelName>
                <S.YouTubeVideoMetadata darkMode={settings.darkMode}>
                  123K views • 1 hour ago
                </S.YouTubeVideoMetadata>
              </S.YouTubeVideoDetails>
            </S.YouTubeHomeVideoInfo>
          </S.YouTubeHomeVideo>
        ))}
      </S.YouTubeHomePage>
    </S.ComparisonContainer>
  );

  const seoConfig = toolsSEO['thumbnail-tester'];
  const schemaData = generateToolSchema('thumbnail-tester', seoConfig);

  return (
    <>
      <SEO
        title={seoConfig.title}
        description={seoConfig.description}
        keywords={seoConfig.keywords}
        canonical="https://youtool.io/tools/thumbnail-tester"
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
            </S.HeaderTextContent>
          </S.HeaderContent>
        </S.EnhancedHeader>



        {renderStepIndicator()}

        {/* Step 1: Upload Section */}
        {currentStep === 'input' && (
          <S.InputSection>

            {/* New side-by-side layout */}
            <S.UploadAndFormWrapper>
              {/* Left side - Thumbnail upload */}
              <S.UploadArea>
                <S.UploadSectionLabel>
                  <i className="bx bx-image"></i>
                  Thumbnail Image
                </S.UploadSectionLabel>
                <S.ThumbnailUpload
                  onClick={() => document.getElementById('thumbnail-input')?.click()}
                  onDrop={handleThumbnailDrop}
                  onDragOver={handleThumbnailDragOver}
                >
                  {thumbnailUrl ? (
                    <S.UploadedImage src={thumbnailUrl} alt="Uploaded thumbnail" />
                  ) : (
                    <S.UploadPlaceholder>
                      <i className="bx bx-image-add"></i>
                      <div>Drop your thumbnail here</div>
                      <span>or click to browse • PNG, JPG, or WebP (max 50MB)</span>
                    </S.UploadPlaceholder>
                  )}
                </S.ThumbnailUpload>

                <input
                  id="thumbnail-input"
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  style={{ display: 'none' }}
                />
              </S.UploadArea>

              {/* Right side - Title and Channel inputs */}
              <S.MainFormInputs>
                <S.InputGroup>
                  <S.InputLabel>Video Title</S.InputLabel>
                  <S.TextInput
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Enter your video title to see how it looks"
                  />
                </S.InputGroup>

                <S.InputGroup>
                  <S.InputLabel>Channel Name</S.InputLabel>
                  <S.TextInput
                    value={channelName}
                    onChange={handleChannelNameChange}
                    placeholder="Your channel name"
                  />
                </S.InputGroup>
              </S.MainFormInputs>
            </S.UploadAndFormWrapper>

            {/* Profile picture section stays below as a separate section */}
            <S.FormSection>
              <S.OptionalTitle>
                <i className="bx bx-user"></i>
                Profile Picture (Optional)
              </S.OptionalTitle>
              <S.ProfileUpload
                onClick={() => document.getElementById('profile-input')?.click()}
                onDrop={handleProfileDrop}
                onDragOver={handleProfileDragOver}
              >
                {profileUrl ? (
                  <S.ProfilePreview src={profileUrl} alt="Profile" />
                ) : (
                  <S.ProfilePlaceholder>
                    <i className="bx bx-user-plus"></i>
                    <span>Drop or click to add profile picture</span>
                  </S.ProfilePlaceholder>
                )}
              </S.ProfileUpload>

              <input
                id="profile-input"
                type="file"
                accept="image/*"
                onChange={handleProfileUpload}
                style={{ display: 'none' }}
              />
            </S.FormSection>

            {thumbnailUrl && (
              <S.ActionButtons>
                <S.PrimaryButton onClick={() => setCurrentStep('preview')}>
                  <i className="bx bx-right-arrow-alt"></i>
                  Preview Layouts
                </S.PrimaryButton>
              </S.ActionButtons>
            )}
          </S.InputSection>
        )}
        {/* Educational Content - shown below input */}
        {currentStep === 'input' && (
          <S.EducationalSection>

            <S.EducationalContent>
              <S.SectionSubTitle>What This Tool Does</S.SectionSubTitle>
              <S.EducationalText>
                The Thumbnail Tester lets you upload a YouTube thumbnail and compare it side-by-side against thumbnails from trending videos or any specific channel. The goal is to answer one question before you publish: does your thumbnail look click-worthy and distinctive next to what's already performing well?
              </S.EducationalText>
              <S.EducationalText>
                Thumbnails are one of the highest-leverage variables in YouTube performance. A compelling thumbnail can double your click-through rate, while a weak one causes your video to be skipped regardless of content quality. Testing before you publish costs nothing and can save weeks of effort.
              </S.EducationalText>
            </S.EducationalContent>

            <S.EducationalContent>
              <S.SectionSubTitle>How to Use the Thumbnail Tester</S.SectionSubTitle>
              <S.EduStepByStep>
                <S.EduStepItem>
                  <S.EduStepNumberCircle>1</S.EduStepNumberCircle>
                  <S.EduStepContent>
                    <S.EduStepTitle>Upload Your Thumbnail</S.EduStepTitle>
                    <S.EducationalText>
                      Click the upload area or drag and drop your thumbnail. Accepts PNG, JPG, and WebP. Your thumbnail will be previewed at YouTube's standard 16:9 aspect ratio.
                    </S.EducationalText>
                  </S.EduStepContent>
                </S.EduStepItem>
                <S.EduStepItem>
                  <S.EduStepNumberCircle>2</S.EduStepNumberCircle>
                  <S.EduStepContent>
                    <S.EduStepTitle>Choose Your Comparison Mode</S.EduStepTitle>
                    <S.EducationalText>
                      "Compare with Trending" benchmarks against YouTube's current trending videos — the most competitive bar. "Compare with Channel" lets you enter any channel URL and compare against their top-performing thumbnails, ideal for niche research.
                    </S.EducationalText>
                  </S.EduStepContent>
                </S.EduStepItem>
                <S.EduStepItem>
                  <S.EduStepNumberCircle>3</S.EduStepNumberCircle>
                  <S.EduStepContent>
                    <S.EduStepTitle>Evaluate and Iterate</S.EduStepTitle>
                    <S.EducationalText>
                      Review how your thumbnail holds up in the grid. Does it stand out? Is the text readable at small sizes? Does the color palette contrast with adjacent thumbnails? Iterate on your design before publishing.
                    </S.EducationalText>
                  </S.EduStepContent>
                </S.EduStepItem>
              </S.EduStepByStep>
            </S.EducationalContent>

            <S.EducationalContent>
              <S.SectionSubTitle>What Makes a Strong YouTube Thumbnail</S.SectionSubTitle>
              <S.MetricCardsGrid>
                <S.MetricInfoCard>
                  <S.MetricInfoHeader>
                    <i className="bx bx-palette"></i>
                    <S.MetricInfoTitle>High Contrast and Bold Colors</S.MetricInfoTitle>
                  </S.MetricInfoHeader>
                  <S.MetricInfoText>
                    Vibrant, high-contrast combinations draw the eye faster than muted palettes. Red, yellow, and orange consistently perform well on YouTube — they signal urgency and pop against dark-themed interfaces.
                  </S.MetricInfoText>
                </S.MetricInfoCard>
                <S.MetricInfoCard>
                  <S.MetricInfoHeader>
                    <i className="bx bx-text"></i>
                    <S.MetricInfoTitle>Readable Text at Small Sizes</S.MetricInfoTitle>
                  </S.MetricInfoHeader>
                  <S.MetricInfoText>
                    YouTube shows thumbnails as small as 168×94px on mobile. Use large, bold fonts with strong contrast. Limit text to 3–5 words max — the thumbnail is not the video title.
                  </S.MetricInfoText>
                </S.MetricInfoCard>
                <S.MetricInfoCard>
                  <S.MetricInfoHeader>
                    <i className="bx bx-crosshair"></i>
                    <S.MetricInfoTitle>One Clear Focal Point</S.MetricInfoTitle>
                  </S.MetricInfoHeader>
                  <S.MetricInfoText>
                    Strong thumbnails lead with one dominant subject — a face with a strong expression, or the key outcome the video delivers. Thumbnails that try to show too much end up showing nothing memorable.
                  </S.MetricInfoText>
                </S.MetricInfoCard>
                <S.MetricInfoCard>
                  <S.MetricInfoHeader>
                    <i className="bx bx-layer"></i>
                    <S.MetricInfoTitle>Consistent Channel Style</S.MetricInfoTitle>
                  </S.MetricInfoHeader>
                  <S.MetricInfoText>
                    Once you find a thumbnail style that works, stick to it. Consistent fonts, colors, and layout help subscribers recognize your content instantly in their feed, boosting CTR from your existing audience.
                  </S.MetricInfoText>
                </S.MetricInfoCard>
              </S.MetricCardsGrid>
            </S.EducationalContent>

            <S.EducationalContent>
              <S.SectionSubTitle>Common Use Cases</S.SectionSubTitle>
              <S.UseCaseGrid>
                <S.UseCaseCard>
                  <S.UseCaseTitle>Pre-Publish CTR Check</S.UseCaseTitle>
                  <S.UseCaseText>
                    Before going live, upload your thumbnail and run it against trending content. If it blends in, iterate. A quick test before publishing can meaningfully change your video's early performance.
                  </S.UseCaseText>
                </S.UseCaseCard>
                <S.UseCaseCard>
                  <S.UseCaseTitle>Niche Competitor Analysis</S.UseCaseTitle>
                  <S.UseCaseText>
                    Compare your thumbnail against a top channel in your niche to see how your visual style holds up. Identify gaps in color, composition, or text usage that your competitors are exploiting.
                  </S.UseCaseText>
                </S.UseCaseCard>
                <S.UseCaseCard>
                  <S.UseCaseTitle>Thumbnail Redesign Validation</S.UseCaseTitle>
                  <S.UseCaseText>
                    Testing a new thumbnail style for your channel? Run both versions through the tester side-by-side against the same comparison set to objectively evaluate which stands out more.
                  </S.UseCaseText>
                </S.UseCaseCard>
              </S.UseCaseGrid>
            </S.EducationalContent>

            <S.EducationalContent>
              <S.SectionSubTitle>Frequently Asked Questions</S.SectionSubTitle>
              <S.FAQList>
                <S.FAQItem>
                  <S.FAQQuestion>Does the tool upload my thumbnail anywhere?</S.FAQQuestion>
                  <S.FAQAnswer>No. Your thumbnail is processed locally in your browser and never sent to any server. Comparison images are fetched from YouTube's CDN using publicly available thumbnail URLs.</S.FAQAnswer>
                </S.FAQItem>
                <S.FAQItem>
                  <S.FAQQuestion>How many comparison thumbnails will I see?</S.FAQQuestion>
                  <S.FAQAnswer>The comparison grid shows your thumbnail alongside 8–12 thumbnails from the selected source (trending or channel) — replicating the density a viewer sees on YouTube's homepage or search results.</S.FAQAnswer>
                </S.FAQItem>
                <S.FAQItem>
                  <S.FAQQuestion>What thumbnail dimensions should I use?</S.FAQQuestion>
                  <S.FAQAnswer>YouTube recommends 1280×720px (HD) at a 16:9 aspect ratio, under 2MB. PNG gives the best quality. The minimum acceptable size is 640×360px.</S.FAQAnswer>
                </S.FAQItem>
                <S.FAQItem>
                  <S.FAQQuestion>Can I test thumbnails for existing videos?</S.FAQQuestion>
                  <S.FAQAnswer>Yes. Download your existing thumbnail from YouTube Studio or use the Thumbnail Downloader tool, then upload it here to see how it compares against current competition in your niche.</S.FAQAnswer>
                </S.FAQItem>
              </S.FAQList>
            </S.EducationalContent>

            <S.EducationalContent>
              <S.SectionSubTitle>Related Tools</S.SectionSubTitle>
              <S.RelatedToolsGrid>
                <S.RelatedToolCard onClick={() => navigate('/tools/thumbnail-analyzer')}>
                  <S.RelatedToolIconWrap><i className="bx bx-analyse"></i></S.RelatedToolIconWrap>
                  <S.RelatedToolName>Thumbnail Analyzer</S.RelatedToolName>
                  <S.RelatedToolDesc>Get a detailed AI-powered analysis of your thumbnail's composition, contrast, and readability score.</S.RelatedToolDesc>
                  <S.RelatedToolLaunchBtn><i className="bx bx-rocket"></i>Launch Tool</S.RelatedToolLaunchBtn>
                </S.RelatedToolCard>
                <S.RelatedToolCard onClick={() => navigate('/tools/thumbnail-downloader')}>
                  <S.RelatedToolIconWrap><i className="bx bx-download"></i></S.RelatedToolIconWrap>
                  <S.RelatedToolName>Thumbnail Downloader</S.RelatedToolName>
                  <S.RelatedToolDesc>Download thumbnails from any YouTube video for competitive research and design inspiration.</S.RelatedToolDesc>
                  <S.RelatedToolLaunchBtn><i className="bx bx-rocket"></i>Launch Tool</S.RelatedToolLaunchBtn>
                </S.RelatedToolCard>
                <S.RelatedToolCard onClick={() => navigate('/tools/outlier-finder')}>
                  <S.RelatedToolIconWrap><i className="bx bx-trending-up"></i></S.RelatedToolIconWrap>
                  <S.RelatedToolName>Outlier Finder</S.RelatedToolName>
                  <S.RelatedToolDesc>Find the highest-performing videos in any niche to study what thumbnail styles are driving breakout views.</S.RelatedToolDesc>
                  <S.RelatedToolLaunchBtn><i className="bx bx-rocket"></i>Launch Tool</S.RelatedToolLaunchBtn>
                </S.RelatedToolCard>
              </S.RelatedToolsGrid>
            </S.EducationalContent>

          </S.EducationalSection>
        )}

        {/* Step 2: Preview Section */}
        {currentStep === 'preview' && (
          <S.PreviewSection>
            <S.SectionTitle>
              <i className="bx bx-desktop"></i>
              Preview Your Thumbnail
            </S.SectionTitle>

            <S.PreviewControls>
              <S.SecondaryButton onClick={() => setCurrentStep('input')}>
                <i className="bx bx-left-arrow-alt"></i>
                Back to Upload
              </S.SecondaryButton>

              <S.DarkModeToggle>
                <S.ToggleInput
                  type="checkbox"
                  checked={settings.darkMode}
                  onChange={(e) => setSettings(prev => ({ ...prev, darkMode: e.target.checked }))}
                />
                <S.ThemeSlider isChecked={settings.darkMode}>
                  <i className='bx bx-sun'></i>
                  <i className='bx bx-moon'></i>
                </S.ThemeSlider>
              </S.DarkModeToggle>
            </S.PreviewControls>

            {renderPreview()}

            <S.ComparisonOptions>
              <S.ComparisonCard>
                <S.ComparisonCardHeader>
                  <i className="bx bx-trending-up"></i>
                  <div>
                    <h3>Compare with Trending</h3>
                    <p>See how your thumbnail stands out against currently trending videos</p>
                  </div>
                </S.ComparisonCardHeader>
                <S.PrimaryButton onClick={handleCompareWithTrending} disabled={isLoading}>
                  {isLoading && settings.mode === 'trending' ? (
                    <>
                      <i className="bx bx-loader-alt bx-spin"></i>
                      Loading...
                    </>
                  ) : (
                    <>
                      <i className="bx bx-trending-up"></i>
                      Compare with Trending
                    </>
                  )}
                </S.PrimaryButton>
              </S.ComparisonCard>

              <S.ComparisonCard>
                <S.ComparisonCardHeader>
                  <i className="bx bx-user"></i>
                  <div>
                    <h3>Compare with Channel</h3>
                    <p>Compare against a specific YouTube channel's videos</p>
                  </div>
                </S.ComparisonCardHeader>
                <S.ChannelInputGroup>
                  <S.TextInput
                    value={settings.channelUrl}
                    onChange={(e) => setSettings(prev => ({ ...prev, channelUrl: e.target.value }))}
                    placeholder="Enter YouTube channel URL"
                  />
                  <S.PrimaryButton onClick={handleCompareWithChannel} disabled={isLoading || !settings.channelUrl.trim()}>
                    {isLoading && settings.mode === 'channel' ? (
                      <>
                        <i className="bx bx-loader-alt bx-spin"></i>
                        Loading...
                      </>
                    ) : (
                      <>
                        <i className="bx bx-user"></i>
                        Compare
                      </>
                    )}
                  </S.PrimaryButton>
                </S.ChannelInputGroup>
              </S.ComparisonCard>
            </S.ComparisonOptions>
          </S.PreviewSection>
        )}

        {/* Step 3: Comparison Section */}
        {currentStep === 'compare' && showComparison && (
          <S.ComparisonSection>
            <S.SectionTitle>
              <i className="bx bx-analyze"></i>
              Thumbnail Comparison
            </S.SectionTitle>

            {renderComparison()}

            <S.ActionButtons>
              <S.SecondaryButton onClick={() => setCurrentStep('preview')}>
                <i className="bx bx-left-arrow-alt"></i>
                Back to Preview
              </S.SecondaryButton>
              <S.SecondaryButton onClick={startOver}>
                <i className="bx bx-refresh"></i>
                Start Over
              </S.SecondaryButton>
            </S.ActionButtons>
          </S.ComparisonSection>
        )}
      </S.MainContainer>
    </S.PageWrapper>
    </>
  );
};

export default ThumbnailTester;