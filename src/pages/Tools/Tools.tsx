// src/pages/Tools/Tools.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import * as S from './styles';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tags: string[];
  url: string;
  isNew?: boolean;
  isBeta?: boolean;
  image: string; // Added image property
}

const tools: Tool[] = [
  {
    id: 'video-analyzer',
    name: 'Video Analyzer',
    description: 'Deep-dive analytics for your YouTube videos. Track performance metrics, engagement rates, and viewer retention patterns.',
    icon: 'bx bx-chart',
    category: 'SEO',
    tags: ['YouTube', 'Analytics', 'Metrics'],
    url: '/tools/video-analyzer',
    isNew: true,
    image: '/images/tools/video-analyzer.jpg',
  },
  {
    id: 'keyword-analyzer',
    name: 'Keyword Analyzer',
    description: 'Discover search volume, competition, and optimization opportunities for YouTube keywords with detailed insights.',
    icon: 'bx bx-search-alt',
    category: 'SEO',
    tags: ['Keywords', 'Search', 'SEO'],
    url: '/tools/keyword-analyzer',
    isNew: true,
    image: '/images/tools/keyword-analyzer.jpg',
  },
  {
    id: 'thumbnail-tester',
    name: 'Thumbnail Tester',
    description: 'Preview how your thumbnails will look across different YouTube layouts and compare with trending videos.',
    icon: 'bx bx-book-content',
    category: 'SEO',
    tags: ['Thumbnails', 'Preview', 'Testing'],
    url: '/tools/thumbnail-tester',
    image: '/images/tools/thumbnail-tester.jpg',
  },
  {
    id: 'thumbnail-downloader',
    name: 'Thumbnail Downloader',
    description: 'Download high-quality thumbnails from any YouTube video with a single click.',
    icon: 'bx bx-photo-album',
    category: 'Utilities',
    tags: ['Download', 'Images'],
    url: '/tools/thumbnail-downloader',
    image: '/images/tools/thumbnail-downloader.jpg',
  },
  {
    id: 'tag-generator',
    name: 'Tag Generator',
    description: 'Generate optimized tags for your videos using AI and trend analysis to improve discoverability.',
    icon: 'bx bx-purchase-tag-alt',
    category: 'SEO',
    tags: ['SEO', 'Tags', 'Keywords'],
    url: '/tools/tag-generator',
    isBeta: true,
    image: '/images/tools/tag-generator.jpg',
  },
  {
    id: 'qr-code-generator',
    name: 'QR Code Generator',
    description: 'Generate custom QR codes with optional logo overlay for your content.',
    icon: 'bx bx-qr-scan',
    category: 'Utilities',
    tags: ['QR Code', 'Generator', 'Links'],
    url: '/tools/qr-code-generator',
    image: '/images/tools/qr-code-generator.jpg',
  },
  {
    id: 'channel-analyzer',
    name: 'Channel Analyzer',
    description: 'Comprehensive channel analytics with growth tracking, competitor analysis, and optimization recommendations.',
    icon: 'bx bx-line-chart',
    category: 'SEO',
    tags: ['Channel', 'Growth', 'Insights'],
    url: '/tools/channel-analyzer',
    image: '/images/tools/channel-analyzer.jpg',
  },
  {
    id: 'channel-id-finder',
    name: 'Channel ID Finder',
    description: 'Find any YouTube channel\'s ID, statistics, and detailed information from URLs, names, or handles.',
    icon: 'bx bx-search-alt-2',
    category: 'Utilities',
    tags: ['Channel ID', 'Search', 'API'],
    url: '/tools/channel-id-finder',
    isNew: true,
    image: '/images/tools/channel-id-finder.jpg',
  },
  {
    id: 'playlist-analyzer',
    name: 'Playlist Analyzer',
    description: 'Analyze any YouTube playlist for detailed insights on views, engagement, and channel distribution.',
    icon: 'bx bx-list-ul',
    category: 'SEO',
    tags: ['Playlist', 'Analytics', 'Insights'],
    url: '/tools/playlist-analyzer',
    image: '/images/tools/playlist-analyzer.jpg',
  },
  {
    id: 'outlier-finder',
    name: 'Outlier Finder',
    description: 'Discover high-performing videos that exceed typical view-to-subscriber ratios in any niche.',
    icon: 'bx bx-trophy',
    category: 'SEO',
    tags: ['Views', 'Analysis', 'Discovery'],
    url: '/tools/outlier-finder',
    image: '/images/tools/outlier-finder.jpg',
  },
  {
    id: 'comment-downloader',
    name: 'Comment Downloader',
    description: 'Download all comments from any YouTube video for analysis and insights.',
    icon: 'bx bx-download',
    category: 'Utilities',
    tags: ['Comments', 'Analysis', 'Data'],
    url: '/tools/comment-downloader',
    image: '/images/tools/comment-downloader.jpg',
  },
  {
    id: 'channel-consultant',
    name: 'Channel Consultant',
    description: 'Create a custom AI bot trained on your channel to help with content creation and strategy.',
    icon: 'bx bx-user-circle',
    category: 'SEO',
    tags: ['AI', 'Assistant', 'Strategy'],
    url: '/tools/channel-consultant',
    image: '/images/tools/channel-consultant.jpg',
  },
  {
    id: 'channel-comparer',
    name: 'Channel Comparer',
    description: 'Compare any two YouTube channels side by side with detailed metrics and analysis.',
    icon: 'bx bx-analyse',
    category: 'SEO',
    tags: ['Analytics', 'Insights'],
    url: '/tools/channel-comparer',
    image: '/images/tools/channel-comparer.jpg',
  },
  {
    id: 'moderation-checker',
    name: 'Content Moderation Checker',
    description: 'Analyze your content for potential policy violations, toxicity, and audience safety before publishing.',
    icon: 'bx bx-shield',
    category: 'Utilities',
    tags: ['Safety', 'Moderation', 'Policy'],
    url: '/tools/moderation-checker',
    isNew: true,
    image: '/images/tools/moderation-checker.jpg',
  },
  {
    id: 'color-palette',
    name: 'Color Palette Generator',
    description: 'Extract color palettes from images and generate beautiful gradients.',
    icon: 'bx bx-palette',
    category: 'Utilities',
    tags: ['Colors', 'Design'],
    url: '/tools/color-palette',
    image: '/images/tools/color-palette.jpg',
  },
  {
    id: 'youtube-calculator',
    name: 'YouTube Calculator',
    description: 'Estimate your potential YouTube earnings based on views, video length, and content category.',
    icon: 'bx bx-dollar-circle',
    category: 'Utilities',
    tags: ['Monetization', 'Calculator'],
    url: '/tools/youtube-calculator',
    image: '/images/tools/youtube-calculator.jpg',
  },
  {
    id: 'comment-picker',
    name: 'Comment Picker',
    description: 'Randomly select a winner from your YouTube video comments for giveaways and contests.',
    icon: 'bx bx-gift',
    category: 'Utilities',
    tags: ['Comments', 'Giveaway'],
    url: '/tools/comment-picker',
    image: '/images/tools/comment-picker.jpg',
  },
  {
    id: 'subscribe-link-generator',
    name: 'Subscribe Link Generator',
    description: 'Create personalized subscription links for your YouTube channel.',
    icon: 'bx bx-link',
    category: 'Utilities',
    tags: ['Subscribe', 'Channel', 'Growth'],
    url: '/tools/subscribe-link-generator',
    image: '/images/tools/subscribe-link-generator.jpg',
  },
];

const categories = Array.from(new Set(tools.map(tool => tool.category)));

// Mobile detection function
const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor;
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  
  // Also check screen width as backup
  const isMobileWidth = window.innerWidth <= 768;
  
  return mobileRegex.test(userAgent) || isMobileWidth;
};

export const Tools: React.FC = () => {
  const navigate = useNavigate();
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [userForcedDesktop, setUserForcedDesktop] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      if (isMobileDevice() && !userForcedDesktop) {
        setShowMobileModal(true);
      } else {
        setShowMobileModal(false);
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => {
      window.removeEventListener('resize', checkDevice);
    };
  }, [userForcedDesktop]);

  const handleForceDesktop = () => {
    setUserForcedDesktop(true);
    setShowMobileModal(false);
  };

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <>
      <S.Container className={showMobileModal ? 'blurred' : ''}>
        <S.Header>
          <S.BackButton onClick={() => navigate('/')}>
            <i className="bx bx-arrow-back"></i>
            Back to Home
          </S.BackButton>
          
          <S.Title>YouTube Tools</S.Title>
          <S.Description>
            Professional-grade YouTube tools to help you analyze, optimize, and grow your channel. 
            All tools are completely free and designed to give you the insights you need to succeed.
          </S.Description>
        </S.Header>

        {categories.map(category => (
          <S.CategorySection key={category}>
            <S.CategoryTitle>{category}</S.CategoryTitle>
            <S.ToolsGrid>
              {tools
                .filter(tool => tool.category === category)
                .map(tool => (
                  <S.ToolCard key={tool.id}>
                    <S.ToolImageContainer backgroundImage={tool.image}>
                      <S.ToolImageOverlay />
                    </S.ToolImageContainer>
                    <S.ToolCardContent>
                      <S.ToolIcon>
                        <i className={tool.icon}></i>
                      </S.ToolIcon>

                      <S.ToolName>
                        {tool.name}
                        {tool.isNew && <Tag variant="new">New</Tag>}
                        {tool.isBeta && <Tag variant="beta">Beta</Tag>}
                      </S.ToolName>

                      <S.TagContainer>
                        {tool.tags.map(tag => (
                          <S.Tag key={tag}>{tag}</S.Tag>
                        ))}
                      </S.TagContainer>

                      <S.ToolDescription>{tool.description}</S.ToolDescription>

                      <S.ButtonGroup>
                        <Button
                          variant="primary"
                          icon="bx bx-right-arrow-alt"
                          onClick={() => navigate(tool.url)}
                        >
                          Launch Tool
                        </Button>
                      </S.ButtonGroup>
                    </S.ToolCardContent>
                  </S.ToolCard>
                ))}
            </S.ToolsGrid>
          </S.CategorySection>
        ))}
      </S.Container>

      {/* Mobile Modal */}
      {showMobileModal && (
        <S.MobileModal>
          <S.ModalBackdrop />
          <S.ModalContent>
            <S.ModalIcon>
              <i className="bx bx-desktop"></i>
            </S.ModalIcon>
            
            <S.ModalTitle>Desktop Required</S.ModalTitle>
            
            <S.ModalText>
              These YouTube tools are designed for desktop use and require a larger screen 
              for optimal functionality. Please access this page from a computer or laptop 
              for the best experience.
            </S.ModalText>

            <S.ModalFeatures>
              <S.FeatureItem>
                <i className="bx bx-check-circle"></i>
                <span>Better data visualization</span>
              </S.FeatureItem>
              <S.FeatureItem>
                <i className="bx bx-check-circle"></i>
                <span>Enhanced user interface</span>
              </S.FeatureItem>
              <S.FeatureItem>
                <i className="bx bx-check-circle"></i>
                <span>Full feature access</span>
              </S.FeatureItem>
            </S.ModalFeatures>

            <S.ModalButtons>
              <S.ModalButton onClick={handleGoBack} variant="primary">
                <i className="bx bx-arrow-back"></i>
                Go Back Home
              </S.ModalButton>
              <S.ModalButton onClick={handleForceDesktop} variant="secondary">
                <i className="bx bx-error-alt"></i>
                Continue Anyway
              </S.ModalButton>
            </S.ModalButtons>

            <S.ModalNote>
              Tools may not function properly on mobile devices
            </S.ModalNote>
          </S.ModalContent>
        </S.MobileModal>
      )}
    </>
  );
};

interface TagProps {
  children: React.ReactNode;
  variant: 'new' | 'beta';
}

const Tag: React.FC<TagProps> = ({ children, variant }) => (
  <S.StatusTag variant={variant}>
    {children}
  </S.StatusTag>
);

export default Tools;