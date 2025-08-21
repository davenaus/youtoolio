// src/pages/Tools/Tools.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import { AdSense } from '../../components/AdSense/AdSense';
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
  image: string;
}

const tools: Tool[] = [
    {
    id: 'channel-analyzer',
    name: 'Channel Analyzer',
    description: 'Comprehensive channel analytics with growth tracking, competitor analysis, and optimization recommendations.',
    icon: 'bx bx-line-chart',
    category: 'SEO',
    tags: ['Channel', 'Growth', 'Insights', 'Analytics', 'Competition'],
    url: '/tools/channel-analyzer',
    image: 'https://64.media.tumblr.com/ac9ad9e3a75b264881169b38018b6be8/0e01452f9f6dd974-e5/s2048x3072/8c12986bb347fdcb8bb1f003ca88748e35b437d8.jpg',
  },
  {
    id: 'video-analyzer',
    name: 'Video Analyzer',
    description: 'Deep-dive analytics for your YouTube videos. Track performance metrics, engagement rates, and viewer retention patterns.',
    icon: 'bx bx-chart',
    category: 'SEO',
    tags: ['YouTube', 'Analytics', 'Metrics', 'Performance', 'Engagement'],
    url: '/tools/video-analyzer',
    isNew: true,
    image: 'https://64.media.tumblr.com/f55e2ae2e5b16799fd5889c64b3fe36b/0e01452f9f6dd974-0e/s2048x3072/09051a8561ff4ab1cc8a5fa3b4b3d81f8a3a720d.jpg',
  },
  {
    id: 'keyword-analyzer',
    name: 'Keyword Analyzer',
    description: 'Discover search volume, competition, and optimization opportunities for YouTube keywords with detailed insights.',
    icon: 'bx bx-search-alt',
    category: 'SEO',
    tags: ['Keywords', 'Search', 'SEO', 'Research', 'Optimization'],
    url: '/tools/keyword-analyzer',
    isNew: true,
    image: 'https://64.media.tumblr.com/10c0d99fe1fe964324e1cdb293ee4756/0e01452f9f6dd974-c1/s2048x3072/4307ba680bb19d0d80529c1d1415552dffdd3b9a.jpg',
  },
  {
    id: 'thumbnail-tester',
    name: 'Thumbnail Tester',
    description: 'Preview how your thumbnails will look across different YouTube layouts and compare with trending videos.',
    icon: 'bx bx-book-content',
    category: 'SEO',
    tags: ['Thumbnails', 'Preview', 'Testing', 'Design', 'CTR'],
    url: '/tools/thumbnail-tester',
    image: 'https://64.media.tumblr.com/c16a513f7724612ec41c27bf532b7d8f/0e01452f9f6dd974-6d/s2048x3072/8f37d7ca31ccb0b698b3e21d74c2e276c260c7a0.jpg',
  },
  {
    id: 'thumbnail-downloader',
    name: 'Thumbnail Downloader',
    description: 'Download high-quality thumbnails from any YouTube video with a single click.',
    icon: 'bx bx-photo-album',
    category: 'Utilities',
    tags: ['Download', 'Images', 'Thumbnails', 'Export'],
    url: '/tools/thumbnail-downloader',
    image: 'https://64.media.tumblr.com/b12f0a4e3b88cf8409200338965cf706/0e01452f9f6dd974-5e/s2048x3072/00de80d7d1ca44cb236d21cab0adbe20fc5bbfb9.jpg',
  },
  {
    id: 'tag-generator',
    name: 'Tag Generator',
    description: 'Generate optimized tags for your videos using AI and trend analysis to improve discoverability.',
    icon: 'bx bx-purchase-tag-alt',
    category: 'SEO',
    tags: ['SEO', 'Tags', 'Keywords', 'AI', 'Optimization'],
    url: '/tools/tag-generator',
    isBeta: true,
    image: 'https://64.media.tumblr.com/276a73213e38fa7b326758ee7f115ed6/0e01452f9f6dd974-35/s2048x3072/a99f9ebfb857f86f0b720517850972aff27712c1.jpg',
  },
  {
    id: 'qr-code-generator',
    name: 'QR Code Generator',
    description: 'Generate custom QR codes with optional logo overlay for your content.',
    icon: 'bx bx-qr-scan',
    category: 'Utilities',
    tags: ['QR Code', 'Generator', 'Links', 'Marketing'],
    url: '/tools/qr-code-generator',
    image: 'https://64.media.tumblr.com/da5e76716d812a5ccec22e37179e2575/0e01452f9f6dd974-89/s2048x3072/2c12bac7610d803f4a197ea109c839a969849ac2.jpg',
  },

  {
    id: 'channel-id-finder',
    name: 'Channel ID Finder',
    description: 'Find any YouTube channel\'s ID, statistics, and detailed information from URLs, names, or handles.',
    icon: 'bx bx-search-alt-2',
    category: 'Utilities',
    tags: ['Channel ID', 'Search', 'API', 'Information'],
    url: '/tools/channel-id-finder',
    isNew: true,
    image: 'https://64.media.tumblr.com/10ccc3757948e253900a92bc6ce226ab/0e01452f9f6dd974-3b/s2048x3072/62471a32052a5c06b185d9c0242331a986f0cca6.jpg',
  },
  {
    id: 'playlist-analyzer',
    name: 'Playlist Analyzer',
    description: 'Analyze any YouTube playlist for detailed insights on views, engagement, and channel distribution.',
    icon: 'bx bx-list-ul',
    category: 'SEO',
    tags: ['Playlist', 'Analytics', 'Insights', 'Engagement'],
    url: '/tools/playlist-analyzer',
    image: 'https://64.media.tumblr.com/85cd205bebdd16ad2dbd1dec3eace901/0e01452f9f6dd974-52/s2048x3072/6e82ba74aec1cf9c1f02548aaa618d2a7c49fd14.jpg',
  },
  {
    id: 'outlier-finder',
    name: 'Outlier Finder',
    description: 'Discover high-performing videos that exceed typical view-to-subscriber ratios in any niche.',
    icon: 'bx bx-trophy',
    category: 'SEO',
    tags: ['Views', 'Analysis', 'Discovery', 'Viral', 'Trends'],
    url: '/tools/outlier-finder',
    image: 'https://64.media.tumblr.com/60109acd631995e9b43834a7f4358e78/0e01452f9f6dd974-f2/s2048x3072/3390c9b19607d957940ac9e1b8b23b6afbdc037f.jpg',
  },
  {
    id: 'comment-downloader',
    name: 'Comment Downloader',
    description: 'Download all comments from any YouTube video for analysis and insights.',
    icon: 'bx bx-download',
    category: 'Utilities',
    tags: ['Comments', 'Analysis', 'Data', 'Export', 'Download'],
    url: '/tools/comment-downloader',
    image: 'https://64.media.tumblr.com/66078549793f9f7a2f8135de9fa7332b/0e01452f9f6dd974-a7/s2048x3072/d1645c95d5bd8165f5fd093296a1372f053a2a21.jpg',
  },
  {
    id: 'channel-consultant',
    name: 'Channel Consultant',
    description: 'Create a custom AI bot trained on your channel to help with content creation and strategy.',
    icon: 'bx bx-user-circle',
    category: 'SEO',
    tags: ['AI', 'Assistant', 'Strategy', 'Automation'],
    url: '/tools/channel-consultant',
    image: 'https://64.media.tumblr.com/dec9583099d591e567f0ceecac3b080a/0e01452f9f6dd974-11/s2048x3072/d955005ed173796f50e9a654b7dafe7ca077a024.jpg',
  },
  {
    id: 'channel-comparer',
    name: 'Channel Comparer',
    description: 'Compare any two YouTube channels side by side with detailed metrics and analysis.',
    icon: 'bx bx-analyse',
    category: 'SEO',
    tags: ['Analytics', 'Insights', 'Comparison', 'Competition'],
    url: '/tools/channel-comparer',
    image: 'https://64.media.tumblr.com/b5ef4a3f8a1a52b8b8bf5633b71856ce/0e01452f9f6dd974-22/s2048x3072/af73a8628e0cbe0468bb714952560c7d95172cf1.jpg',
  },
  {
    id: 'moderation-checker',
    name: 'Content Moderation Checker',
    description: 'Analyze your content for potential policy violations, toxicity, and audience safety before publishing.',
    icon: 'bx bx-shield',
    category: 'Utilities',
    tags: ['Safety', 'Moderation', 'Policy', 'Compliance'],
    url: '/tools/moderation-checker',
    isNew: true,
    image: 'https://64.media.tumblr.com/85fa58821bb2821eae83196f1bd591b6/0e01452f9f6dd974-9c/s2048x3072/23294c53a2da205260c1f54a1515d3ead28110ff.jpg',
  },
  {
    id: 'color-palette',
    name: 'Color Palette Generator',
    description: 'Extract color palettes from images and generate beautiful gradients.',
    icon: 'bx bx-palette',
    category: 'Utilities',
    tags: ['Colors', 'Design', 'Palette', 'Creative'],
    url: '/tools/color-palette',
    image: 'https://64.media.tumblr.com/f97bde423a79533024eef1213555f72b/0e01452f9f6dd974-57/s2048x3072/10d31cb6dce21a536ff44a7638cf80cdb52df36a.jpg',
  },
  {
    id: 'color-picker-from-image',
    name: 'Color Picker from Image',
    description: 'Click anywhere on an image to instantly copy hex colors to clipboard.',
    icon: 'bx bxs-eyedropper',
    category: 'Utilities',
    tags: ['Color Picker', 'Eyedropper', 'Image', 'Hex', 'Design'],
    url: '/tools/color-picker-from-image',
    isNew: true,
    image: 'https://64.media.tumblr.com/f55e2ae2e5b16799fd5889c64b3fe36b/0e01452f9f6dd974-0e/s2048x3072/09051a8561ff4ab1cc8a5fa3b4b3d81f8a3a720d.jpg',
  },
  {
    id: 'youtube-calculator',
    name: 'YouTube Calculator',
    description: 'Estimate your potential YouTube earnings based on views, video length, and content category.',
    icon: 'bx bx-dollar-circle',
    category: 'Utilities',
    tags: ['Monetization', 'Calculator', 'Revenue', 'Earnings'],
    url: '/tools/youtube-calculator',
    image: 'https://64.media.tumblr.com/95def04a5eda69c7703fca45158d5256/0e01452f9f6dd974-57/s2048x3072/ec37f2775fabde8ea0dc7ba6e16a91cfe8d8870d.jpg',
  },
  {
    id: 'comment-picker',
    name: 'Comment Picker',
    description: 'Randomly select a winner from your YouTube video comments for giveaways and contests.',
    icon: 'bx bx-gift',
    category: 'Utilities',
    tags: ['Comments', 'Giveaway', 'Random', 'Contest'],
    url: '/tools/comment-picker',
    image: 'https://64.media.tumblr.com/7c92a8b39ed686b3e40b91f763e37c8c/0e01452f9f6dd974-f7/s2048x3072/14f006ed9268af160a22e5a70e802d8a98395ac1.jpg',
  },
  {
    id: 'subscribe-link-generator',
    name: 'Subscribe Link Generator',
    description: 'Create personalized subscription links for your YouTube channel.',
    icon: 'bx bx-link',
    category: 'Utilities',
    tags: ['Subscribe', 'Channel', 'Growth', 'Links'],
    url: '/tools/subscribe-link-generator',
    image: 'https://64.media.tumblr.com/12a9d70197335903fdf345505df6b606/0e01452f9f6dd974-2d/s2048x3072/2f17ae0cb670be14c7c35f8084d926da44afd456.jpg',
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
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Search results for dropdown only
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    return tools.filter(tool => 
      tool.name.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query) ||
      tool.tags.some(tag => tag.toLowerCase().includes(query)) ||
      tool.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

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

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleForceDesktop = () => {
    setUserForcedDesktop(true);
    setShowMobileModal(false);
  };

  const handleGoBack = () => {
    navigate('/');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowDropdown(value.length > 0);
  };

  const handleToolSelect = (tool: Tool) => {
    navigate(tool.url);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setShowDropdown(false);
  };

  return (
    <>
      <S.Container className={showMobileModal ? 'blurred' : ''}>
        <S.Header>
        <S.BackButton onClick={() => navigate('/')}>            
        <i className="bx bx-arrow-back"></i>
        Back to Home
        </S.BackButton>
        
        <S.HeaderContent>
        <S.HeaderLeft>
        <S.Title>YouTube Analytics Tools</S.Title>
        <S.Description>
        Comprehensive analytics suite designed by creators for creators. Our tools help you understand 
        your performance, optimize your content strategy, and grow your channel with data-driven insights. 
          </S.Description>
            </S.HeaderLeft>
            
            <S.HeaderRight ref={searchRef}>
              <S.SearchContainer>
                <S.SearchBar>
                  <i className="bx bx-search"></i>
                  <S.SearchInput
                    type="text"
                    placeholder="Search tools..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => searchQuery && setShowDropdown(true)}
                  />
                  {searchQuery && (
                    <S.ClearButton onClick={handleClearSearch}>
                      <i className="bx bx-x"></i>
                    </S.ClearButton>
                  )}
                </S.SearchBar>
                
                <S.SearchDropdown isOpen={showDropdown && searchResults.length > 0}>
                  {searchResults.slice(0, 8).map(tool => (
                    <S.SearchResult 
                      key={tool.id} 
                      onClick={() => handleToolSelect(tool)}
                    >
                      <S.SearchResultIcon>
                        <i className={tool.icon}></i>
                      </S.SearchResultIcon>
                      <S.SearchResultContent>
                        <S.SearchResultName>
                          {tool.name}
                          {tool.isNew && <Tag variant="new">New</Tag>}
                          {tool.isBeta && <Tag variant="beta">Beta</Tag>}
                        </S.SearchResultName>
                        <S.SearchResultDescription>
                          {tool.description}
                        </S.SearchResultDescription>
                        <S.SearchResultTags>
                          {tool.tags.slice(0, 3).map(tag => (
                            <S.SearchResultTag key={tag}>{tag}</S.SearchResultTag>
                          ))}
                          {tool.tags.length > 3 && (
                            <S.SearchResultTag>+{tool.tags.length - 3}</S.SearchResultTag>
                          )}
                        </S.SearchResultTags>
                      </S.SearchResultContent>
                    </S.SearchResult>
                  ))}
                  {searchQuery && searchResults.length === 0 && (
                    <S.NoResults>
                      No tools found matching "{searchQuery}"
                    </S.NoResults>
                  )}
                </S.SearchDropdown>
              </S.SearchContainer>
            </S.HeaderRight>
          </S.HeaderContent>
        </S.Header>

        {/* Tools Grid - Always shows all tools */}
        {categories.map(category => (
          <S.CategorySection key={category}>
            <S.CategoryTitle>{category}</S.CategoryTitle>
            
            {/* Educational content for each category */}
            {category === 'SEO' && (
              <S.EducationalCard>
                <S.EducationalCardTitle>SEO & Growth Tools</S.EducationalCardTitle>
                <S.EducationalCardDescription>
                  Search Engine Optimization is crucial for YouTube success. These tools help you research keywords, 
                  analyze competition, optimize your content for discoverability, and understand what makes videos 
                  rank well in both YouTube and Google search results. Master these tools to dramatically increase 
                  your organic reach and attract viewers who are actively searching for your content.
                </S.EducationalCardDescription>
                <S.EducationalCardBenefits>
                  <strong>Key Benefits:</strong> Higher search rankings, increased organic traffic, 
                  better content discoverability, competitive intelligence, and data-driven content planning.
                </S.EducationalCardBenefits>
              </S.EducationalCard>
            )}
            
            {category === 'Utilities' && (
              <S.EducationalCard>
                <S.EducationalCardTitle>Creator Utility Tools</S.EducationalCardTitle>
                <S.EducationalCardDescription>
                  Streamline your content creation workflow with these essential utility tools. From downloading 
                  resources and generating assets to calculating potential earnings and moderating content, 
                  these tools save time and help you maintain professional standards across all aspects 
                  of your YouTube presence.
                </S.EducationalCardDescription>
                <S.EducationalCardBenefits>
                  <strong>Key Benefits:</strong> Time-saving automation, professional asset creation, 
                  revenue planning, content moderation, and streamlined workflow management.
                </S.EducationalCardBenefits>
              </S.EducationalCard>
            )}
            
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