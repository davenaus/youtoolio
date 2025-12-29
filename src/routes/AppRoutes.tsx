// src/routes/AppRoutes.tsx
import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

// Eagerly load only critical pages that appear on initial load
import { Home } from '../pages/Home/Home';
import { Tools } from '../pages/Tools/Tools';
import { NotFound } from '../pages/NotFound/NotFound';

// Lazy load everything else to reduce initial bundle size
const LinkInBioLanding = lazy(() => import('../pages/LinkInBioLanding/LinkInBioLanding').then(m => ({ default: m.LinkInBioLanding })));

// Legal Pages - lazy loaded
const PrivacyPolicy = lazy(() => import('../pages/Legal').then(m => ({ default: m.PrivacyPolicy })));
const TermsOfService = lazy(() => import('../pages/Legal').then(m => ({ default: m.TermsOfService })));
const CookiePolicy = lazy(() => import('../pages/Legal').then(m => ({ default: m.CookiePolicy })));
const DataUsageDisclosure = lazy(() => import('../pages/Legal').then(m => ({ default: m.DataUsageDisclosure })));

// Company Pages - lazy loaded
const Blog = lazy(() => import('../pages/Company').then(m => ({ default: m.Blog })));
const CreatorGuides = lazy(() => import('../pages/Company').then(m => ({ default: m.CreatorGuides })));
const HelpCenter = lazy(() => import('../pages/Company').then(m => ({ default: m.HelpCenter })));
const AboutUs = lazy(() => import('../pages/Company').then(m => ({ default: m.AboutUs })));
const Contact = lazy(() => import('../pages/Company').then(m => ({ default: m.Contact })));
const Careers = lazy(() => import('../pages/Company').then(m => ({ default: m.Careers })));
const PressKit = lazy(() => import('../pages/Company').then(m => ({ default: m.PressKit })));
const Partnerships = lazy(() => import('../pages/Company').then(m => ({ default: m.Partnerships })));
const Changelog = lazy(() => import('../pages/Company').then(m => ({ default: m.Changelog })));
const YouTubeEducationCenter = lazy(() => import('../pages/Company').then(m => ({ default: m.YouTubeEducationCenter })));
const YouTubeGlossary = lazy(() => import('../pages/Company').then(m => ({ default: m.YouTubeGlossary })));
const CaseStudies = lazy(() => import('../pages/Company').then(m => ({ default: m.CaseStudies })));

// Blog Posts - lazy loaded
const YouTubeAnalyticsMetrics = lazy(() => import('../pages/Company/BlogPosts').then(m => ({ default: m.YouTubeAnalyticsMetrics })));
const YouTubeSEOOptimization = lazy(() => import('../pages/Company/BlogPosts').then(m => ({ default: m.YouTubeSEOOptimization })));
const YouTubeAlgorithm2025 = lazy(() => import('../pages/Company/BlogPosts').then(m => ({ default: m.YouTubeAlgorithm2025 })));
const YouTubeThumbnailGuide = lazy(() => import('../pages/Company/BlogPosts').then(m => ({ default: m.YouTubeThumbnailGuide })));
const YouTubeMonetization2025 = lazy(() => import('../pages/Company/BlogPosts').then(m => ({ default: m.YouTubeMonetization2025 })));
const YouTubeContentStrategy = lazy(() => import('../pages/Company/BlogPosts').then(m => ({ default: m.YouTubeContentStrategy })));
const YouTubeGrowthHacks = lazy(() => import('../pages/Company/BlogPosts').then(m => ({ default: m.YouTubeGrowthHacks })));

// Tool components - lazy loaded (HUGE performance win)
const OutlierFinder = lazy(() => import('../pages/Tools/components/OutlierFinder/OutlierFinder').then(m => ({ default: m.OutlierFinder })));
const VideoAnalyzer = lazy(() => import('../pages/Tools/components/VideoAnalyzer/VideoAnalyzer'));
const ChannelAnalyzer = lazy(() => import('../pages/Tools/components/ChannelAnalyzer/ChannelAnalyzer').then(m => ({ default: m.ChannelAnalyzer })));
const ChannelComparer = lazy(() => import('../pages/Tools/components/ChannelComparer/ChannelComparer').then(m => ({ default: m.ChannelComparer })));
const ChannelConsultant = lazy(() => import('../pages/Tools/components/ChannelConsultant/ChannelConsultant').then(m => ({ default: m.ChannelConsultant })));
const CommentDownloader = lazy(() => import('../pages/Tools/components/CommentDownloader/CommentDownloader').then(m => ({ default: m.CommentDownloader })));
const PlaylistAnalyzer = lazy(() => import('../pages/Tools/components/PlaylistAnalyzer/PlaylistAnalyzer').then(m => ({ default: m.PlaylistAnalyzer })));
const QRCodeGenerator = lazy(() => import('../pages/Tools/components/QRCodeGenerator/QRCodeGenerator').then(m => ({ default: m.QRCodeGenerator })));
const TagGenerator = lazy(() => import('../pages/Tools/components/TagGenerator/TagGenerator').then(m => ({ default: m.TagGenerator })));
const ThumbnailDownloader = lazy(() => import('../pages/Tools/components/ThumbnailDownloader/ThumbnailDownloader').then(m => ({ default: m.ThumbnailDownloader })));
const ThumbnailTester = lazy(() => import('../pages/Tools/components/ThumbnailTester/ThumbnailTester').then(m => ({ default: m.ThumbnailTester })));
const YouTubeCalculator = lazy(() => import('../pages/Tools/components/YouTubeCalculator/YouTubeCalculator').then(m => ({ default: m.YouTubeCalculator })));
const CommentPicker = lazy(() => import('../pages/Tools/components/CommentPicker/CommentPicker').then(m => ({ default: m.CommentPicker })));
const SubscribeLinkGenerator = lazy(() => import('../pages/Tools/components/SubscribeLinkGenerator/SubscribeLinkGenerator').then(m => ({ default: m.SubscribeLinkGenerator })));
const ColorPalette = lazy(() => import('../pages/Tools/components/ColorPalette/ColorPalette').then(m => ({ default: m.ColorPalette })));
const ColorPickerFromImage = lazy(() => import('../pages/Tools/components/ColorPickerFromImage/ColorPickerFromImage').then(m => ({ default: m.ColorPickerFromImage })));
const KeywordAnalyzer = lazy(() => import('../pages/Tools/components/KeywordAnalyzer/KeywordAnalyzer').then(m => ({ default: m.KeywordAnalyzer })));
const ChannelIdFinder = lazy(() => import('../pages/Tools/components/ChannelIdFinder/ChannelIdFinder').then(m => ({ default: m.ChannelIdFinder })));
const ModerationChecker = lazy(() => import('../pages/Tools/components/ModerationChecker/ModerationChecker').then(m => ({ default: m.ModerationChecker })));
const YouToolPlaybooks = lazy(() => import('../pages/Tools/components/YouToolPlaybooks/YouToolPlaybooks'));

// Loading fallback component
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
    color: '#fff',
    fontSize: '1.2rem'
  }}>
    <div>Loading...</div>
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tools" element={<Tools />} />
        
        {/* Legal Pages */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/data-usage" element={<DataUsageDisclosure />} />
        
        {/* Company Pages */}
        <Route path="/blog" element={<Blog />} />
        
        {/* Blog Post Routes */}
        <Route path="/blog/youtube-analytics-metrics-2025" element={<YouTubeAnalyticsMetrics />} />
        <Route path="/blog/youtube-seo-optimization-guide" element={<YouTubeSEOOptimization />} />
        <Route path="/blog/youtube-algorithm-2025" element={<YouTubeAlgorithm2025 />} />
        <Route path="/blog/youtube-thumbnail-guide" element={<YouTubeThumbnailGuide />} />
        <Route path="/blog/youtube-monetization-2025" element={<YouTubeMonetization2025 />} />
        <Route path="/blog/youtube-content-strategy" element={<YouTubeContentStrategy />} />
        <Route path="/blog/youtube-growth-hacks" element={<YouTubeGrowthHacks />} />
        
        <Route path="/guides" element={<CreatorGuides />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/press" element={<PressKit />} />
        <Route path="/partnerships" element={<Partnerships />} />
        <Route path="/changelog" element={<Changelog />} />
        <Route path="/education" element={<YouTubeEducationCenter />} />
        <Route path="/glossary" element={<YouTubeGlossary />} />
        <Route path="/case-studies" element={<CaseStudies />} />
        
        {/* Link in Bio Landing Page */}
        <Route path="/link-in-bio-page-maker" element={<LinkInBioLanding />} />
        
        {/* Tool Routes */}
        <Route path="/tools/outlier-finder" element={<OutlierFinder />} />
        <Route path="/tools/outlier-finder/:searchQuery/:type" element={<OutlierFinder />} />
        <Route path="/tools/video-analyzer" element={<VideoAnalyzer />} />
        <Route path="/tools/video-analyzer/:videoId" element={<VideoAnalyzer />} />
        <Route path="/tools/channel-analyzer" element={<ChannelAnalyzer />} />
        <Route path="/tools/channel-analyzer/:channelId" element={<ChannelAnalyzer />} />
        <Route path="/tools/channel-comparer" element={<ChannelComparer />} />
        <Route path="/tools/channel-consultant" element={<ChannelConsultant />} />
        <Route path="/tools/comment-downloader" element={<CommentDownloader />} />
        <Route path="/tools/comment-downloader/:videoId" element={<CommentDownloader />} />
        <Route path="/tools/comment-picker" element={<CommentPicker />} />
        <Route path="/tools/comment-picker/:videoId" element={<CommentPicker />} />
        <Route path="/tools/playlist-analyzer" element={<PlaylistAnalyzer />} />
        <Route path="/tools/playlist-analyzer/:playlistId" element={<PlaylistAnalyzer />} />
        <Route path="/tools/qr-code-generator" element={<QRCodeGenerator />} />
        <Route path="/tools/subscribe-link-generator" element={<SubscribeLinkGenerator />} />
        <Route path="/tools/tag-generator" element={<TagGenerator />} />
        <Route path="/tools/tag-generator/:searchTitle" element={<TagGenerator />} />
        <Route path="/tools/thumbnail-downloader" element={<ThumbnailDownloader />} />
        <Route path="/tools/thumbnail-downloader/:videoId" element={<ThumbnailDownloader />} />
        <Route path="/tools/thumbnail-tester" element={<ThumbnailTester />} />
        <Route path="/tools/youtube-calculator" element={<YouTubeCalculator />} />
        <Route path="/tools/color-palette" element={<ColorPalette />} />
        <Route path="/tools/color-picker-from-image" element={<ColorPickerFromImage />} />
        
        {/* New Tool Routes */}
        <Route path="/tools/keyword-analyzer" element={<KeywordAnalyzer />} />
        <Route path="/tools/keyword-analyzer/:keyword" element={<KeywordAnalyzer />} />
        <Route path="/tools/channel-id-finder" element={<ChannelIdFinder />} />
        <Route path="/tools/moderation-checker" element={<ModerationChecker />} />
        <Route path="/tools/youtool-playbooks" element={<YouToolPlaybooks />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};
