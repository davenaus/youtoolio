// src/config/toolsSEO.ts
export interface ToolSEOConfig {
  title: string;
  description: string;
  keywords: string;
  h1: string;
  schemaType: string;
}

export const toolsSEO: Record<string, ToolSEOConfig> = {
  'thumbnail-downloader': {
    title: 'YouTube Thumbnail Downloader - Download HD Thumbnails Free',
    description: 'Download YouTube video thumbnails in high resolution (HD, Full HD, 4K). Get maxres, standard, high, medium quality thumbnails instantly. Free YouTube thumbnail grabber tool.',
    keywords: 'youtube thumbnail downloader, download youtube thumbnail, youtube thumbnail grabber, get youtube thumbnail, youtube thumbnail download, hd thumbnail download, maxres thumbnail, youtube thumbnail extractor',
    h1: 'YouTube Thumbnail Downloader',
    schemaType: 'WebApplication'
  },
  'video-analyzer': {
    title: 'YouTube Video Analyzer - Free Video Analytics Tool',
    description: 'Analyze any YouTube video with detailed metrics: views, likes, comments, engagement rate, upload time, tags, and SEO score. Free video analytics and insights tool.',
    keywords: 'youtube video analyzer, video analytics, youtube statistics, video metrics, youtube seo analyzer, video engagement, youtube insights, video performance',
    h1: 'YouTube Video Analyzer',
    schemaType: 'WebApplication'
  },
  'channel-analyzer': {
    title: 'YouTube Channel Analyzer - Channel Statistics & Analytics',
    description: 'Analyze YouTube channels with comprehensive statistics: subscriber count, total views, video count, engagement metrics, and growth insights. Free channel analytics tool.',
    keywords: 'youtube channel analyzer, channel statistics, youtube analytics, subscriber count, channel metrics, youtube channel stats, channel insights, youtube data',
    h1: 'YouTube Channel Analyzer',
    schemaType: 'WebApplication'
  },
  'tag-generator': {
    title: 'YouTube Tag Generator - Free Video Tag Maker',
    description: 'Generate optimized YouTube tags for better video SEO and discoverability. Get relevant tags based on your video title and content. Free YouTube tag generator tool.',
    keywords: 'youtube tag generator, video tags, youtube seo tags, tag maker, youtube keywords, video tag generator, youtube tag tool, seo tags generator',
    h1: 'YouTube Tag Generator',
    schemaType: 'WebApplication'
  },
  'keyword-analyzer': {
    title: 'YouTube Keyword Analyzer - Keyword Research Tool',
    description: 'Analyze YouTube keywords for search volume, competition, and trends. Find the best keywords for your videos with detailed metrics and suggestions.',
    keywords: 'youtube keyword analyzer, keyword research, youtube keywords, keyword tool, search volume, keyword competition, youtube seo keywords, keyword suggestions',
    h1: 'YouTube Keyword Analyzer',
    schemaType: 'WebApplication'
  },
  'thumbnail-tester': {
    title: 'YouTube Thumbnail Tester - A/B Test Your Thumbnails',
    description: 'Test and compare YouTube thumbnails side-by-side. Preview how your thumbnails look in search results, suggested videos, and mobile. Free thumbnail tester.',
    keywords: 'youtube thumbnail tester, thumbnail ab test, compare thumbnails, thumbnail preview, thumbnail comparison, youtube thumbnail tool, test thumbnails',
    h1: 'YouTube Thumbnail Tester',
    schemaType: 'WebApplication'
  },
  'channel-comparer': {
    title: 'YouTube Channel Comparison Tool - Compare Channels',
    description: 'Compare multiple YouTube channels side-by-side. Analyze subscribers, views, engagement, growth rate, and performance metrics. Free channel comparison tool.',
    keywords: 'youtube channel comparison, compare youtube channels, channel vs channel, youtube analytics comparison, channel metrics comparison, compare subscribers',
    h1: 'YouTube Channel Comparison Tool',
    schemaType: 'WebApplication'
  },
  'comment-downloader': {
    title: 'YouTube Comment Downloader - Export Comments to CSV',
    description: 'Download YouTube video comments to CSV or JSON format. Export all comments including replies, timestamps, likes, and author info. Free comment extractor.',
    keywords: 'youtube comment downloader, download youtube comments, export comments, youtube comment scraper, comment extractor, csv comment export, youtube comments tool',
    h1: 'YouTube Comment Downloader',
    schemaType: 'WebApplication'
  },
  'comment-picker': {
    title: 'YouTube Comment Picker - Random Comment Selector',
    description: 'Pick random winners from YouTube comments. Select random comments for giveaways, contests, or engagement. Fair and transparent comment picker tool.',
    keywords: 'youtube comment picker, random comment selector, youtube giveaway picker, comment winner picker, random youtube comment, giveaway tool, contest picker',
    h1: 'Random YouTube Comment Picker',
    schemaType: 'WebApplication'
  },
  'playlist-analyzer': {
    title: 'YouTube Playlist Analyzer - Playlist Statistics Tool',
    description: 'Analyze YouTube playlists with detailed statistics: total duration, video count, views, engagement metrics, and video performance. Free playlist analytics.',
    keywords: 'youtube playlist analyzer, playlist statistics, playlist metrics, youtube playlist tool, playlist duration calculator, playlist analytics, playlist insights',
    h1: 'YouTube Playlist Analyzer',
    schemaType: 'WebApplication'
  },
  'qr-code-generator': {
    title: 'YouTube QR Code Generator - Create Video QR Codes',
    description: 'Generate QR codes for YouTube videos and channels. Create scannable QR codes to promote your content offline. Free YouTube QR code maker.',
    keywords: 'youtube qr code generator, video qr code, youtube qr code maker, qr code creator, youtube link qr code, channel qr code, video qr code generator',
    h1: 'YouTube QR Code Generator',
    schemaType: 'WebApplication'
  },
  'subscribe-link-generator': {
    title: 'YouTube Subscribe Link Generator - Auto-Subscribe URL',
    description: 'Create custom YouTube subscribe links with pre-filled channel subscription. Generate one-click subscribe URLs to grow your channel faster.',
    keywords: 'youtube subscribe link, subscription link generator, auto subscribe link, youtube subscribe url, channel subscribe link, one click subscribe, youtube subscription',
    h1: 'YouTube Subscribe Link Generator',
    schemaType: 'WebApplication'
  },
  'youtube-calculator': {
    title: 'YouTube Money Calculator - Earnings Estimator',
    description: 'Calculate potential YouTube earnings based on views, CPM, and engagement. Estimate ad revenue and sponsorship income. Free YouTube money calculator.',
    keywords: 'youtube money calculator, youtube earnings calculator, youtube revenue calculator, cpm calculator, youtube income estimator, ad revenue calculator, youtube monetization',
    h1: 'YouTube Money Calculator',
    schemaType: 'WebApplication'
  },
  'color-palette': {
    title: 'YouTube Color Palette Generator - Brand Colors Tool',
    description: 'Generate beautiful color palettes for your YouTube branding. Create harmonious color schemes for thumbnails, channel art, and videos.',
    keywords: 'color palette generator, youtube colors, brand colors, color scheme generator, palette creator, thumbnail colors, youtube branding colors',
    h1: 'YouTube Color Palette Generator',
    schemaType: 'WebApplication'
  },
  'color-picker-from-image': {
    title: 'Color Picker from Image - Extract Colors from YouTube Thumbnails',
    description: 'Extract colors from any image or YouTube thumbnail. Pick hex color codes and create color palettes from photos. Free color picker tool.',
    keywords: 'color picker from image, extract colors, image color picker, hex color picker, thumbnail color extractor, get colors from image, color grabber',
    h1: 'Color Picker from Image',
    schemaType: 'WebApplication'
  },
  'outlier-finder': {
    title: 'YouTube Outlier Finder - Find Viral Videos',
    description: 'Discover high-performing outlier videos on YouTube. Find viral videos and trending content by analyzing view counts and engagement patterns.',
    keywords: 'youtube outlier finder, find viral videos, trending videos, viral video finder, high performing videos, youtube trends, video discovery tool',
    h1: 'YouTube Outlier Finder',
    schemaType: 'WebApplication'
  },
  'channel-consultant': {
    title: 'YouTube Channel Consultant - Get Expert Channel Advice',
    description: 'Get AI-powered recommendations for your YouTube channel. Receive expert advice on content strategy, optimization, and growth tactics.',
    keywords: 'youtube channel consultant, channel advice, youtube strategy, channel optimization, youtube expert, channel growth tips, youtube consulting',
    h1: 'YouTube Channel Consultant',
    schemaType: 'WebApplication'
  },
  'channel-id-finder': {
    title: 'YouTube Channel ID Finder - Get Channel ID',
    description: 'Find any YouTube channel ID instantly. Extract channel IDs from channel URLs or usernames. Free YouTube channel ID finder tool.',
    keywords: 'youtube channel id finder, find channel id, channel id extractor, youtube channel id, get channel id, youtube id finder, channel identifier',
    h1: 'YouTube Channel ID Finder',
    schemaType: 'WebApplication'
  },
  'moderation-checker': {
    title: 'YouTube Comment Moderation Checker - Filter Comments',
    description: 'Check YouTube comments for spam, profanity, and inappropriate content. Moderate comments efficiently with AI-powered filtering.',
    keywords: 'youtube comment moderation, comment checker, spam filter, comment filtering, youtube moderation tool, comment moderator, profanity filter',
    h1: 'YouTube Comment Moderation Checker',
    schemaType: 'WebApplication'
  },
  'banner-downloader': {
    title: 'YouTube Channel Banner Downloader - Download HD Channel Banners',
    description: 'Download YouTube channel banners in full resolution (2120px width). Get high-quality channel art and banner images instantly. Free YouTube banner downloader.',
    keywords: 'youtube banner downloader, download channel banner, youtube channel art downloader, banner download, channel banner grabber, youtube banner extractor, high resolution banner',
    h1: 'YouTube Channel Banner Downloader',
    schemaType: 'WebApplication'
  },
  'profile-picture-downloader': {
    title: 'YouTube Profile Picture Downloader - Download Channel Avatars',
    description: 'Download YouTube channel profile pictures in multiple resolutions (88px to 2048px). Get high-quality channel avatars instantly. Free YouTube profile picture downloader.',
    keywords: 'youtube profile picture downloader, download channel avatar, youtube profile pic, channel picture download, avatar downloader, youtube dp download, profile image extractor',
    h1: 'YouTube Profile Picture Downloader',
    schemaType: 'WebApplication'
  },
  'youtool-playbooks': {
    title: 'YouTool AI Playbooks - YouTube Strategy Templates',
    description: 'Pre-built AI playbooks with expert-level prompts for viral content, growth strategy, and audience analysis. Accelerate your YouTube success with proven templates.',
    keywords: 'youtube ai playbooks, content strategy templates, youtube growth strategy, ai prompts, content planning, youtube playbook, strategy templates, viral content guide',
    h1: 'YouTool AI Playbooks',
    schemaType: 'WebApplication'
  }
};

// Helper function to generate structured data for tools
export const generateToolSchema = (toolId: string, toolConfig: ToolSEOConfig) => {
  return {
    '@context': 'https://schema.org',
    '@type': toolConfig.schemaType,
    'name': toolConfig.title,
    'description': toolConfig.description,
    'url': `https://youtool.io/tools/${toolId}`,
    'applicationCategory': 'MultimediaApplication',
    'operatingSystem': 'Web Browser',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    },
    'provider': {
      '@type': 'Organization',
      'name': 'YouTool.io',
      'url': 'https://youtool.io'
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.8',
      'ratingCount': '1247',
      'bestRating': '5',
      'worstRating': '1'
    }
  };
};
