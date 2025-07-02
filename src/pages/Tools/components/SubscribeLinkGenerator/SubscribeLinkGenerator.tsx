// src/pages/Tools/components/SubscribeLinkGenerator/SubscribeLinkGenerator.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdSense } from '../../../../components/AdSense/AdSense';
import * as S from './styles';

interface ChannelInfo {
  id: string;
  title: string;
  thumbnail: string;
  banner?: string;
  subscriberCount: number;
  videoCount: number;
  totalViews: number;
  customUrl: string;
  description: string;
  publishedAt: string;
  country?: string;
  keywords?: string[];
  uploads?: RecentVideo[];
}

interface RecentVideo {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  views: number;
}

interface LinkVariation {
  name: string;
  url: string;
  description: string;
  icon: string;
}

export const SubscribeLinkGenerator: React.FC = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [channelInfo, setChannelInfo] = useState<ChannelInfo | null>(null);
  const [copiedLink, setCopiedLink] = useState<string>('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;

  useEffect(() => {
    if (channelId) {
      setUrl(channelId);
      handleSubmit(undefined, channelId);
    }
    
    // Load search history
    const history = localStorage.getItem('subscribe_history');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, [channelId]);

  const saveToHistory = (handle: string) => {
    const handleToSave = handle.startsWith('@') ? handle : `@${handle}`;
    const newHistory = [handleToSave, ...searchHistory.filter(h => h !== handleToSave)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('subscribe_history', JSON.stringify(newHistory));
  };

  const extractChannelHandle = (url: string): string | null => {
    if (url.match(/^@?[A-Za-z0-9_-]+$/)) {
      return url.startsWith('@') ? url.substring(1) : url;
    }

    const patterns = [
      /youtube\.com\/@([^/?]+)/,
      /youtube\.com\/channel\/([^/?]+)/,
      /youtube\.com\/c\/([^/?]+)/,
      /youtube\.com\/user\/([^/?]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return null;
  };

  const fetchChannelInfo = async (handle: string): Promise<ChannelInfo> => {
    try {
      // Try multiple methods to find the channel
      let channelData = null;
      
      // Method 1: Try by handle
      let response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?` +
        `part=snippet,statistics,brandingSettings&` +
        `forHandle=${handle}&` +
        `key=${API_KEY}`
      );
      let data = await response.json();

      if (data.items && data.items.length > 0) {
        channelData = data.items[0];
      } else {
        // Method 2: Search for channel
        response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?` +
          `part=snippet&` +
          `q=${encodeURIComponent(handle)}&` +
          `type=channel&` +
          `key=${API_KEY}`
        );
        data = await response.json();
        
        if (data.items && data.items.length > 0) {
          // Get full channel info
          const channelId = data.items[0].id.channelId;
          response = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?` +
            `part=snippet,statistics,brandingSettings&` +
            `id=${channelId}&` +
            `key=${API_KEY}`
          );
          data = await response.json();
          channelData = data.items[0];
        }
      }

      if (!channelData) {
        throw new Error('Channel not found');
      }

      // Get recent uploads
      const uploadsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet&` +
        `channelId=${channelData.id}&` +
        `type=video&` +
        `order=date&` +
        `maxResults=3&` +
        `key=${API_KEY}`
      );
      const uploadsData = await uploadsResponse.json();
      
      const uploads: RecentVideo[] = uploadsData.items?.map((video: any) => ({
        id: video.id.videoId,
        title: video.snippet.title,
        thumbnail: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default.url,
        publishedAt: video.snippet.publishedAt,
        views: 0 // Would need additional API call for views
      })) || [];

      return {
        id: channelData.id,
        title: channelData.snippet.title,
        thumbnail: channelData.snippet.thumbnails.high?.url || channelData.snippet.thumbnails.default.url,
        banner: channelData.brandingSettings?.image?.bannerExternalUrl,
        subscriberCount: parseInt(channelData.statistics.subscriberCount) || 0,
        videoCount: parseInt(channelData.statistics.videoCount) || 0,
        totalViews: parseInt(channelData.statistics.viewCount) || 0,
        customUrl: handle,
        description: channelData.snippet.description || '',
        publishedAt: channelData.snippet.publishedAt,
        country: channelData.snippet.country,
        keywords: channelData.brandingSettings?.channel?.keywords?.split(',') || [],
        uploads
      };
    } catch (error) {
      console.error('Error fetching channel:', error);
      throw new Error('Failed to fetch channel information');
    }
  };

  const getLinkVariations = (handle: string): LinkVariation[] => [
    {
      name: 'Standard Subscribe',
      url: `https://www.youtube.com/@${handle}?sub_confirmation=1`,
      description: 'Basic subscribe link with confirmation dialog',
      icon: 'bx bx-user-plus'
    },
    {
      name: 'Subscribe + Bell',
      url: `https://www.youtube.com/@${handle}?sub_confirmation=1&feature=subscribe`,
      description: 'Subscribe link with notification bell prompt',
      icon: 'bx bx-bell-plus'
    },
    {
      name: 'Channel Homepage',
      url: `https://www.youtube.com/@${handle}`,
      description: 'Direct link to channel homepage',
      icon: 'bx bx-home'
    },
    {
      name: 'Mobile Optimized',
      url: `https://m.youtube.com/@${handle}?sub_confirmation=1`,
      description: 'Mobile-optimized subscribe link',
      icon: 'bx bx-mobile'
    },
    {
      name: 'Embedded Widget',
      url: `https://www.youtube.com/subscribe_widget?p=${handle}`,
      description: 'For embedding subscribe buttons',
      icon: 'bx bx-code-alt'
    }
  ];

  const handleSearch = () => {
    const handle = extractChannelHandle(url);
    if (handle) {
      // Instead of navigating, directly process the channel
      handleSubmit(undefined, handle);
    } else {
      alert('Please enter a valid YouTube channel URL or handle');
    }
  };

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>, directHandle?: string) => {
    if (e) e.preventDefault();
    
    const handle = directHandle || extractChannelHandle(url);
    if (!handle) {
      alert('Please enter a valid YouTube channel URL or handle');
      return;
    }

    setIsLoading(true);
    setChannelInfo(null);
    setCopiedLink('');

    try {
      const info = await fetchChannelInfo(handle);
      setChannelInfo(info);
      saveToHistory(handle);
      
      // Optional: Update URL without navigation to allow direct linking
      if (window.history && window.history.pushState) {
        const newUrl = `/tools/subscribe-link-generator/${handle}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to fetch channel information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (link: string, linkName: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(linkName);
      setTimeout(() => setCopiedLink(''), 2000);
    } catch (err) {
      alert('Failed to copy link');
    }
  };

  const downloadQRCode = async (url: string) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(url)}`;
    const response = await fetch(qrUrl);
    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${channelInfo?.title}_subscribe_qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  };

  const shareChannel = async () => {
    if (!channelInfo) return;
    
    const shareData = {
      title: `Subscribe to ${channelInfo.title}`,
      text: `Check out this YouTube channel: ${channelInfo.title}`,
      url: getLinkVariations(channelInfo.customUrl)[0].url
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback - copy to clipboard
      await handleCopy(shareData.url, 'Share Link');
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const getChannelAge = (publishedAt: string): string => {
    const now = new Date();
    const published = new Date(publishedAt);
    const years = now.getFullYear() - published.getFullYear();
    return `${years} year${years !== 1 ? 's' : ''} old`;
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
          <S.Title>Subscribe Link Generator</S.Title>
          <S.Subtitle>
            Generate professional subscribe links and channel cards for YouTube creators
          </S.Subtitle>
        </S.Header>

        <S.SearchContainer>
          <form onSubmit={handleSubmit}>
            <S.SearchBar>
              <S.SearchInput
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter YouTube channel URL or @handle"
                disabled={isLoading}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <S.SearchButton onClick={handleSearch} disabled={isLoading || !url.trim()}>
                {isLoading ? (
                  <i className='bx bx-loader-alt bx-spin'></i>
                ) : (
                  <i className='bx bx-search'></i>
                )}
              </S.SearchButton>
            </S.SearchBar>
          </form>

          {searchHistory.length > 0 && !channelInfo && (
            <S.HistorySection>
              <S.HistoryLabel>Recent channels:</S.HistoryLabel>
              <S.HistoryList>
                {searchHistory.map((channel, index) => (
                  <S.HistoryItem key={index} onClick={() => setUrl(channel)}>
                    <i className="bx bx-history"></i>
                    <span>{channel}</span>
                  </S.HistoryItem>
                ))}
              </S.HistoryList>
            </S.HistorySection>
          )}
        </S.SearchContainer>

        {isLoading && (
          <S.LoadingContainer>
            <i className='bx bx-loader-alt bx-spin'></i>
            <p>Fetching channel information...</p>
          </S.LoadingContainer>
        )}

        {channelInfo && (
          <S.ResultsContainer>
            {/* Premium Channel Card */}
            <S.ChannelCard>
              {channelInfo.banner && (
                <S.ChannelBanner
                  src={channelInfo.banner}
                  alt="Channel banner"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              
              <S.ChannelContent>
                <S.ChannelHeader>
                  <S.ChannelAvatar src={channelInfo.thumbnail} alt={channelInfo.title} />
                  <S.ChannelInfo>
                    <S.ChannelTitle>{channelInfo.title}</S.ChannelTitle>
                    <S.ChannelHandle>@{channelInfo.customUrl}</S.ChannelHandle>
                    <S.ChannelMeta>
                      <S.MetaItem>
                        <i className="bx bx-user"></i>
                        {formatNumber(channelInfo.subscriberCount)} subscribers
                      </S.MetaItem>
                      <S.MetaItem>
                        <i className="bx bx-video"></i>
                        {formatNumber(channelInfo.videoCount)} videos
                      </S.MetaItem>
                      <S.MetaItem>
                        <i className="bx bx-show"></i>
                        {formatNumber(channelInfo.totalViews)} views
                      </S.MetaItem>
                      <S.MetaItem>
                        <i className="bx bx-calendar"></i>
                        {getChannelAge(channelInfo.publishedAt)}
                      </S.MetaItem>
                    </S.ChannelMeta>
                  </S.ChannelInfo>
                  
                  <S.ChannelActions>
                    <S.ActionButton onClick={shareChannel}>
                      <i className="bx bx-share"></i>
                      Share
                    </S.ActionButton>
                  </S.ChannelActions>
                </S.ChannelHeader>

                {channelInfo.description && (
                  <S.ChannelDescription>
                    {channelInfo.description.length > 200 
                      ? channelInfo.description.substring(0, 200) + '...'
                      : channelInfo.description
                    }
                  </S.ChannelDescription>
                )}

                {channelInfo.uploads && channelInfo.uploads.length > 0 && (
                  <S.RecentUploads>
                    <S.SectionTitle>Recent Videos</S.SectionTitle>
                    <S.VideoGrid>
                      {channelInfo.uploads.map((video) => (
                        <S.VideoCard
                          key={video.id}
                          onClick={() => window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank')}
                        >
                          <S.VideoThumbnail src={video.thumbnail} alt={video.title} />
                          <S.VideoTitle>{video.title}</S.VideoTitle>
                          <S.VideoDate>
                            {new Date(video.publishedAt).toLocaleDateString()}
                          </S.VideoDate>
                        </S.VideoCard>
                      ))}
                    </S.VideoGrid>
                  </S.RecentUploads>
                )}
              </S.ChannelContent>
            </S.ChannelCard>

            {/* Link Generation Section */}
            <S.LinksSection>
              <S.SectionTitle>
                <i className="bx bx-link"></i>
                Subscribe Link Variations
              </S.SectionTitle>
              
              <S.LinkVariations>
                {getLinkVariations(channelInfo.customUrl).map((variation, index) => (
                  <S.LinkCard key={index}>
                    <S.LinkHeader>
                      <S.LinkIcon className={variation.icon}></S.LinkIcon>
                      <S.LinkInfo>
                        <S.LinkName>{variation.name}</S.LinkName>
                        <S.LinkDescription>{variation.description}</S.LinkDescription>
                      </S.LinkInfo>
                    </S.LinkHeader>
                    
                    <S.LinkUrl>{variation.url}</S.LinkUrl>
                    
                    <S.LinkActions>
                      <S.CopyButton
                        onClick={() => handleCopy(variation.url, variation.name)}
                        copied={copiedLink === variation.name}
                      >
                        {copiedLink === variation.name ? (
                          <>
                            <i className="bx bx-check"></i>
                            Copied!
                          </>
                        ) : (
                          <>
                            <i className="bx bx-copy"></i>
                            Copy
                          </>
                        )}
                      </S.CopyButton>
                      
                      <S.QRButton onClick={() => downloadQRCode(variation.url)}>
                        <i className="bx bx-qr"></i>
                        QR Code
                      </S.QRButton>
                    </S.LinkActions>
                  </S.LinkCard>
                ))}
              </S.LinkVariations>
            </S.LinksSection>

            {/* Bottom Ad for smaller screens */}
            <S.BottomAdContainer>
              <AdSense 
                slot={process.env.REACT_APP_ADSENSE_SLOT_BOTTOM || ''}
                format="horizontal"
              />
            </S.BottomAdContainer>
          </S.ResultsContainer>
        )}
      </S.MainContainer>
    </S.PageWrapper>
  );
};

export default SubscribeLinkGenerator;