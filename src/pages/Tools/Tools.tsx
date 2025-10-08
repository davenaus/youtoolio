import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  image: string;
}

const tools: Tool[] = [
  { id: 'channel-analyzer', name: 'Channel Analyzer', description: 'Comprehensive channel analytics with growth tracking, competitor analysis, and optimization recommendations.', icon: 'bx bx-line-chart', category: 'SEO', tags: ['Channel', 'Growth', 'Insights', 'Analytics', 'Competition'], url: '/tools/channel-analyzer', image: '/images/tools/channel-analyzer.jpg' },
  { id: 'video-analyzer', name: 'Video Analyzer', description: 'Deep-dive analytics for your YouTube videos. Track performance metrics, engagement rates, and viewer retention patterns.', icon: 'bx bx-chart', category: 'SEO', tags: ['YouTube', 'Analytics', 'Metrics', 'Performance', 'Engagement'], url: '/tools/video-analyzer', isNew: true, image: '/images/tools/video-analyzer.jpg' },
  { id: 'keyword-analyzer', name: 'Keyword Analyzer', description: 'Discover search volume, competition, and optimization opportunities for YouTube keywords with detailed insights.', icon: 'bx bx-search-alt', category: 'SEO', tags: ['Keywords', 'Search', 'SEO', 'Research', 'Optimization'], url: '/tools/keyword-analyzer', isNew: true, image: '/images/tools/keyword-analyzer.jpg' },
  { id: 'thumbnail-tester', name: 'Thumbnail Tester', description: 'Preview how your thumbnails will look across different YouTube layouts and compare with trending videos.', icon: 'bx bx-book-content', category: 'SEO', tags: ['Thumbnails', 'Preview', 'Testing', 'Design', 'CTR'], url: '/tools/thumbnail-tester', image: '/images/tools/thumbnail-tester.jpg' },
  { id: 'thumbnail-downloader', name: 'Thumbnail Downloader', description: 'Download high-quality thumbnails from any YouTube video with a single click.', icon: 'bx bx-photo-album', category: 'Utilities', tags: ['Download', 'Images', 'Thumbnails', 'Export'], url: '/tools/thumbnail-downloader', image: '/images/tools/thumbnail-downloader.jpg' },
  { id: 'tag-generator', name: 'Tag Generator', description: 'Generate optimized tags for your videos using AI and trend analysis to improve discoverability.', icon: 'bx bx-purchase-tag-alt', category: 'SEO', tags: ['SEO', 'Tags', 'Keywords', 'AI', 'Optimization'], url: '/tools/tag-generator', isBeta: true, image: '/images/tools/tag-generator.jpg' },
  { id: 'qr-code-generator', name: 'QR Code Generator', description: 'Generate custom QR codes with optional logo overlay for your content.', icon: 'bx bx-qr-scan', category: 'Utilities', tags: ['QR Code', 'Generator', 'Links', 'Marketing'], url: '/tools/qr-code-generator', image: '/images/tools/qr-code-generator.jpg' },
  { id: 'channel-id-finder', name: 'Channel ID Finder', description: 'Find any YouTube channel\'s ID, statistics, and detailed information from URLs, names, or handles.', icon: 'bx bx-search-alt-2', category: 'Utilities', tags: ['Channel ID', 'Search', 'API', 'Information'], url: '/tools/channel-id-finder', isNew: true, image: '/images/tools/channel-id-finder.jpg' },
  { id: 'playlist-analyzer', name: 'Playlist Analyzer', description: 'Analyze any YouTube playlist for detailed insights on views, engagement, and channel distribution.', icon: 'bx bx-list-ul', category: 'SEO', tags: ['Playlist', 'Analytics', 'Insights', 'Engagement'], url: '/tools/playlist-analyzer', image: '/images/tools/playlist-analyzer.jpg' },
  { id: 'outlier-finder', name: 'Outlier Finder', description: 'Discover high-performing videos that exceed typical view-to-subscriber ratios in any niche.', icon: 'bx bx-trophy', category: 'SEO', tags: ['Views', 'Analysis', 'Discovery', 'Viral', 'Trends'], url: '/tools/outlier-finder', image: '/images/tools/outlier-finder.jpg' },
  { id: 'comment-downloader', name: 'Comment Downloader', description: 'Download all comments from any YouTube video for analysis and insights.', icon: 'bx bx-download', category: 'Utilities', tags: ['Comments', 'Analysis', 'Data', 'Export', 'Download'], url: '/tools/comment-downloader', image: '/images/tools/comment-downloader.jpg' },
  { id: 'channel-consultant', name: 'Channel Consultant', description: 'Create a custom AI bot trained on your channel to help with content creation and strategy.', icon: 'bx bx-user-circle', category: 'SEO', tags: ['AI', 'Assistant', 'Strategy', 'Automation'], url: '/tools/channel-consultant', image: '/images/tools/channel-consultant.jpg' },
  { id: 'channel-comparer', name: 'Channel Comparer', description: 'Compare any two YouTube channels side by side with detailed metrics and analysis.', icon: 'bx bx-analyse', category: 'SEO', tags: ['Analytics', 'Insights', 'Comparison', 'Competition'], url: '/tools/channel-comparer', image: '/images/tools/channel-comparer.jpg' },
  { id: 'moderation-checker', name: 'Content Moderation Checker', description: 'Analyze your content for potential policy violations, toxicity, and audience safety before publishing.', icon: 'bx bx-shield', category: 'Utilities', tags: ['Safety', 'Moderation', 'Policy', 'Compliance'], url: '/tools/moderation-checker', isNew: true, image: '/images/tools/moderation-checker.jpg' },
  { id: 'color-palette', name: 'Color Palette Generator', description: 'Extract color palettes from images and generate beautiful gradients.', icon: 'bx bx-palette', category: 'Utilities', tags: ['Colors', 'Design', 'Palette', 'Creative'], url: '/tools/color-palette', image: '/images/tools/color-palette.jpg' },
  { id: 'comment-picker', name: 'Comment Picker', description: 'Randomly select a winner from your YouTube video comments for giveaways and contests.', icon: 'bx bx-gift', category: 'Utilities', tags: ['Comments', 'Giveaway', 'Random', 'Contest'], url: '/tools/comment-picker', image: '/images/tools/comment-picker.jpg' },
  { id: 'subscribe-link-generator', name: 'Subscribe Link Generator', description: 'Create personalized subscription links for your YouTube channel.', icon: 'bx bx-link', category: 'Utilities', tags: ['Subscribe', 'Channel', 'Growth', 'Links'], url: '/tools/subscribe-link-generator', image: '/images/tools/subscribe-link-generator.jpg' },
  { id: 'youtube-calculator', name: 'YouTube Calculator', description: 'Estimate your potential YouTube earnings based on views, video length, and content category.', icon: 'bx bx-dollar-circle', category: 'Utilities', tags: ['Monetization', 'Calculator', 'Revenue', 'Earnings'], url: '/tools/youtube-calculator', image: '/images/tools/youtube-calculator.jpg' },
];

const categories = Array.from(new Set(tools.map(tool => tool.category)));

const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  const userAgent = navigator.userAgent || navigator.vendor;
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
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
      if (isMobileDevice() && !userForcedDesktop) setShowMobileModal(true);
      else setShowMobileModal(false);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, [userForcedDesktop]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleForceDesktop = () => {
    setUserForcedDesktop(true);
    setShowMobileModal(false);
  };

  const handleGoBack = () => navigate('/');
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowDropdown(value.length > 0);
  };
  const handleToolSelect = (tool: Tool) => navigate(tool.url);
  const handleClearSearch = () => {
    setSearchQuery('');
    setShowDropdown(false);
  };

  return (
    <>
      <S.Container className={showMobileModal ? 'blurred' : ''}>
        <S.Header>
          <S.BackButton onClick={handleGoBack}>
            <i className="bx bx-arrow-back"></i> Back to Home
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
                    <S.SearchResult key={tool.id} onClick={() => handleToolSelect(tool)}>
                      <S.SearchResultIcon><i className={tool.icon}></i></S.SearchResultIcon>
                      <S.SearchResultContent>
                        <S.SearchResultName>
                          {tool.name}
                          {tool.isNew && <Tag variant="new">New</Tag>}
                          {tool.isBeta && <Tag variant="beta">Beta</Tag>}
                        </S.SearchResultName>
                        <S.SearchResultDescription>{tool.description}</S.SearchResultDescription>
                      </S.SearchResultContent>
                    </S.SearchResult>
                  ))}
                  {searchQuery && searchResults.length === 0 && (
                    <S.NoResults>No tools found matching "{searchQuery}"</S.NoResults>
                  )}
                </S.SearchDropdown>
              </S.SearchContainer>
            </S.HeaderRight>
          </S.HeaderContent>
        </S.Header>

        {categories.map(category => (
          <S.CategorySection key={category}>
            <S.CategoryTitle>{category}</S.CategoryTitle>

            {category === 'SEO' && (
              <S.EducationalCard>
                <S.EducationalCardTitle>SEO & Growth Tools</S.EducationalCardTitle>
                <S.EducationalCardDescription>
                  These tools help you research keywords, analyze competition, and optimize your content
                  for discoverability to grow your organic reach.
                </S.EducationalCardDescription>
              </S.EducationalCard>
            )}

            {category === 'Utilities' && (
              <S.EducationalCard>
                <S.EducationalCardTitle>Creator Utility Tools</S.EducationalCardTitle>
                <S.EducationalCardDescription>
                  Save time and streamline your workflow with tools for downloading, moderation, and monetization.
                </S.EducationalCardDescription>
              </S.EducationalCard>
            )}

            <S.ToolsGrid>
              {tools.filter(t => t.category === category).map(tool => (
                <S.ToolCard key={tool.id}>
                  <S.ToolImageContainer backgroundImage={tool.image}>
                    <img
                      src={tool.image}
                      alt={tool.name}
                      loading="lazy"
                      style={{
                        width: '1px',
                        height: '1px',
                        opacity: 0,
                        position: 'absolute',
                        pointerEvents: 'none',
                      }}
                    />
                    <S.ToolImageOverlay />
                  </S.ToolImageContainer>

                  <S.ToolCardContent>
                    <S.ToolIcon><i className={tool.icon}></i></S.ToolIcon>
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

      {showMobileModal && (
        <S.MobileModal>
          <S.ModalBackdrop />
          <S.ModalContent>
            <S.ModalIcon><i className="bx bx-desktop"></i></S.ModalIcon>
            <S.ModalTitle>Desktop Required</S.ModalTitle>
            <S.ModalText>
              These YouTube tools are designed for desktop use. Please access this page from a computer
              for the best experience.
            </S.ModalText>
            <S.ModalButtons>
              <S.ModalButton onClick={handleGoBack} variant="primary">
                <i className="bx bx-arrow-back"></i> Go Back Home
              </S.ModalButton>
              <S.ModalButton onClick={handleForceDesktop} variant="secondary">
                <i className="bx bx-error-alt"></i> Continue Anyway
              </S.ModalButton>
            </S.ModalButtons>
            <S.ModalNote>Tools may not function properly on mobile devices.</S.ModalNote>
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
  <S.StatusTag variant={variant}>{children}</S.StatusTag>
);

export default Tools;
