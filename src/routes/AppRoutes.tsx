// src/routes/AppRoutes.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Home } from '../pages/Home/Home';
import { Tools } from '../pages/Tools/Tools';
import { NotFound } from '../pages/NotFound/NotFound';
import { LinkInBioLanding } from '../pages/LinkInBioLanding/LinkInBioLanding';

// Legal Pages
import { PrivacyPolicy, TermsOfService, CookiePolicy, DataUsageDisclosure } from '../pages/Legal';

// Company Pages
import { Blog, CreatorGuides, HelpCenter, AboutUs, Contact, Careers, PressKit, Partnerships, Changelog } from '../pages/Company';

// Blog Posts
import { YouTubeAnalyticsMetrics, YouTubeSEOOptimization } from '../pages/Company/BlogPosts';

// Tool imports
import { OutlierFinder } from '../pages/Tools/components/OutlierFinder/OutlierFinder';
import { VideoAnalyzer } from '../pages/Tools/components/VideoAnalyzer/VideoAnalyzer';
import { ChannelAnalyzer } from '../pages/Tools/components/ChannelAnalyzer/ChannelAnalyzer';
import { ChannelComparer } from '../pages/Tools/components/ChannelComparer/ChannelComparer';
import { ChannelConsultant } from '../pages/Tools/components/ChannelConsultant/ChannelConsultant';
import { CommentDownloader } from '../pages/Tools/components/CommentDownloader/CommentDownloader';
import { PlaylistAnalyzer } from '../pages/Tools/components/PlaylistAnalyzer/PlaylistAnalyzer';
import { QRCodeGenerator } from '../pages/Tools/components/QRCodeGenerator/QRCodeGenerator';
import { TagGenerator } from '../pages/Tools/components/TagGenerator/TagGenerator';
import { ThumbnailDownloader } from '../pages/Tools/components/ThumbnailDownloader/ThumbnailDownloader';
import { ThumbnailTester } from '../pages/Tools/components/ThumbnailTester/ThumbnailTester';
import { YouTubeCalculator } from '../pages/Tools/components/YouTubeCalculator/YouTubeCalculator';
import { YouTubeTranscript } from '../pages/Tools/components/YouTubeTranscript/YouTubeTranscript';
import { CommentPicker } from '../pages/Tools/components/CommentPicker/CommentPicker';
import { SubscribeLinkGenerator } from '../pages/Tools/components/SubscribeLinkGenerator/SubscribeLinkGenerator';
import { ColorPalette } from '../pages/Tools/components/ColorPalette/ColorPalette';
import { ColorPickerFromImage } from '../pages/Tools/components/ColorPickerFromImage/ColorPickerFromImage';

// New tool imports
import { KeywordAnalyzer } from '../pages/Tools/components/KeywordAnalyzer/KeywordAnalyzer';
import { ChannelIdFinder } from '../pages/Tools/components/ChannelIdFinder/ChannelIdFinder';
import { ModerationChecker } from '../pages/Tools/components/ModerationChecker/ModerationChecker';

export const AppRoutes: React.FC = () => {
  return (
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
      <Route path="/guides" element={<CreatorGuides />} />
      <Route path="/help" element={<HelpCenter />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/careers" element={<Careers />} />
      <Route path="/press" element={<PressKit />} />
      <Route path="/partnerships" element={<Partnerships />} />
      <Route path="/changelog" element={<Changelog />} />
      
      {/* Link in Bio Landing Page */}
      <Route path="/link-in-bio-page-maker" element={<LinkInBioLanding />} />
      
      {/* Tool Routes */}
      <Route path="/tools/youtube-transcript" element={<YouTubeTranscript />} />
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
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};