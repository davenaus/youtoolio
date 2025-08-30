// src/config/toolsSEO.ts
interface ToolSEOConfig {
  title: string;
  description: string;
  keywords: string[];
  structuredData: object;
}

export const toolsSEOConfig: Record<string, ToolSEOConfig> = {
  'thumbnail-downloader': {
    title: 'YouTube Thumbnail Downloader - Download HD Video Thumbnails Free',
    description: 'Download high-quality YouTube video thumbnails in multiple resolutions (1280x720, 640x480, 480x360). Free thumbnail downloader with instant downloads and all quality options.',
    keywords: [
      'youtube thumbnail downloader',
      'download youtube thumbnails',
      'youtube thumbnail download',
      'video thumbnail downloader',
      'hd youtube thumbnail',
      'youtube image download',
      'free thumbnail downloader',
      'youtube thumbnail extractor',
      'thumbnail download tool',
      'youtube thumbnail saver'
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "YouTube Thumbnail Downloader",
      "description": "Download high-quality YouTube video thumbnails in multiple resolutions",
      "url": "https://youtool.io/tools/thumbnail-downloader",
      "applicationCategory": "MultimediaApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "Multiple resolutions (1280x720, 640x480, 480x360)",
        "Instant downloads",
        "No registration required",
        "Batch download support",
        "Direct URL copying"
      ]
    }
  },
  'video-analyzer': {
    title: 'YouTube Video Analyzer - Free Video Analytics & SEO Tool',
    description: 'Analyze any YouTube video with detailed metrics, SEO insights, engagement data, and performance statistics. Get comprehensive video analytics for free.',
    keywords: [
      'youtube video analyzer',
      'video analytics tool',
      'youtube video analysis',
      'video performance analyzer',
      'youtube video metrics',
      'video seo analyzer',
      'youtube analytics tool',
      'video insights tool',
      'youtube video stats',
      'free video analyzer'
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "YouTube Video Analyzer",
      "description": "Analyze YouTube videos with detailed metrics and SEO insights",
      "url": "https://youtool.io/tools/video-analyzer",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "Video performance metrics",
        "SEO analysis",
        "Engagement insights",
        "Competitor analysis",
        "Tag analysis"
      ]
    }
  },
  'channel-analyzer': {
    title: 'YouTube Channel Analyzer - Free Channel Analytics & Growth Tool',
    description: 'Analyze any YouTube channel with detailed statistics, subscriber growth, video performance, and optimization insights. Complete channel analytics tool.',
    keywords: [
      'youtube channel analyzer',
      'channel analytics tool',
      'youtube channel analysis',
      'channel growth analyzer',
      'youtube channel stats',
      'channel performance tool',
      'youtube channel insights',
      'channel seo analyzer',
      'free channel analyzer',
      'youtube channel metrics'
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "YouTube Channel Analyzer",
      "description": "Comprehensive YouTube channel analytics and growth insights",
      "url": "https://youtool.io/tools/channel-analyzer",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "Channel performance metrics",
        "Subscriber analysis",
        "Video catalog insights",
        "Growth tracking",
        "Content optimization tips"
      ]
    }
  },
  'tag-generator': {
    title: 'YouTube Tag Generator - Free Video Tag Creator & SEO Tool',
    description: 'Generate optimized YouTube tags for better video SEO and discoverability. Free tag generator with trending keywords and competitor analysis.',
    keywords: [
      'youtube tag generator',
      'video tag creator',
      'youtube tags generator',
      'video seo tags',
      'youtube keyword tool',
      'free tag generator',
      'youtube tag maker',
      'video tag optimizer',
      'youtube hashtag generator',
      'video tags tool'
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "YouTube Tag Generator",
      "description": "Generate optimized YouTube tags for better video SEO",
      "url": "https://youtool.io/tools/tag-generator",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "SEO-optimized tag suggestions",
        "Trending keyword analysis",
        "Competitor tag research",
        "Bulk tag generation",
        "Tag performance insights"
      ]
    }
  },
  'keyword-analyzer': {
    title: 'YouTube Keyword Analyzer - Free Video Keyword Research Tool',
    description: 'Analyze YouTube keywords for search volume, competition, and trends. Find the best keywords for your videos with comprehensive keyword research.',
    keywords: [
      'youtube keyword analyzer',
      'video keyword research',
      'youtube keyword tool',
      'video seo keywords',
      'youtube search keywords',
      'keyword analysis tool',
      'youtube keyword planner',
      'video keyword finder',
      'free keyword analyzer',
      'youtube keyword research'
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "YouTube Keyword Analyzer",
      "description": "Comprehensive YouTube keyword research and analysis tool",
      "url": "https://youtool.io/tools/keyword-analyzer",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "Keyword search volume analysis",
        "Competition assessment",
        "Trending keywords",
        "Related keyword suggestions",
        "Long-tail keyword research"
      ]
    }
  },
  'thumbnail-tester': {
    title: 'YouTube Thumbnail Tester - A/B Test Video Thumbnails Free',
    description: 'Test and compare YouTube thumbnails to find the most engaging design. Free thumbnail A/B testing tool with visual comparison and performance insights.',
    keywords: [
      'youtube thumbnail tester',
      'thumbnail ab testing',
      'youtube thumbnail test',
      'thumbnail comparison tool',
      'video thumbnail tester',
      'thumbnail performance test',
      'youtube thumbnail optimizer',
      'free thumbnail tester',
      'thumbnail analytics tool',
      'video thumbnail comparison'
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "YouTube Thumbnail Tester",
      "description": "A/B test YouTube thumbnails to optimize click-through rates",
      "url": "https://youtool.io/tools/thumbnail-tester",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "Side-by-side thumbnail comparison",
        "Performance analytics",
        "Click-through rate optimization",
        "Visual impact assessment",
        "Mobile thumbnail preview"
      ]
    }
  },
  'comment-downloader': {
    title: 'YouTube Comment Downloader - Export Video Comments Free',
    description: 'Download and export YouTube video comments in CSV or JSON format. Free comment extraction tool with filtering and analysis features.',
    keywords: [
      'youtube comment downloader',
      'download youtube comments',
      'export video comments',
      'youtube comment extractor',
      'comment download tool',
      'youtube comments csv',
      'video comment exporter',
      'free comment downloader',
      'youtube comment analysis',
      'comment scraper tool'
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "YouTube Comment Downloader",
      "description": "Download and export YouTube video comments for analysis",
      "url": "https://youtool.io/tools/comment-downloader",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "Export comments to CSV/JSON",
        "Filter by date and engagement",
        "Bulk comment download",
        "Comment sentiment analysis",
        "Reply thread extraction"
      ]
    }
  },
  'playlist-analyzer': {
    title: 'YouTube Playlist Analyzer - Free Playlist Analytics Tool',
    description: 'Analyze YouTube playlists with detailed statistics, video performance, and optimization insights. Comprehensive playlist analytics for creators.',
    keywords: [
      'youtube playlist analyzer',
      'playlist analytics tool',
      'youtube playlist analysis',
      'playlist performance tool',
      'youtube playlist stats',
      'playlist optimization tool',
      'free playlist analyzer',
      'youtube playlist insights',
      'playlist metrics tool',
      'video playlist analysis'
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "YouTube Playlist Analyzer",
      "description": "Comprehensive analytics for YouTube playlists and video collections",
      "url": "https://youtool.io/tools/playlist-analyzer",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "Playlist performance metrics",
        "Video ranking analysis",
        "Engagement insights",
        "Optimization recommendations",
        "Content gap analysis"
      ]
    }
  },
  'youtube-calculator': {
    title: 'YouTube Money Calculator - Estimate Video Earnings Free',
    description: 'Calculate potential YouTube earnings with views, subscribers, and engagement metrics. Free YouTube revenue calculator and monetization estimator.',
    keywords: [
      'youtube money calculator',
      'youtube earnings calculator',
      'youtube revenue calculator',
      'video earnings estimator',
      'youtube income calculator',
      'youtube monetization calculator',
      'youtube profit calculator',
      'free youtube calculator',
      'youtube ad revenue calculator',
      'video income estimator'
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "YouTube Money Calculator",
      "description": "Estimate YouTube earnings and revenue potential",
      "url": "https://youtool.io/tools/youtube-calculator",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "Revenue estimation by views",
        "Subscriber monetization value",
        "Ad revenue calculator",
        "Sponsorship value estimator",
        "Growth projection tools"
      ]
    }
  },
  'channel-comparer': {
    title: 'YouTube Channel Comparer - Compare Channels Side by Side',
    description: 'Compare multiple YouTube channels with detailed analytics, performance metrics, and competitive insights. Free channel comparison tool.',
    keywords: [
      'youtube channel comparer',
      'compare youtube channels',
      'channel comparison tool',
      'youtube channel vs',
      'channel analytics comparison',
      'youtube competitor analysis',
      'free channel comparer',
      'youtube channel stats comparison',
      'channel performance comparison',
      'youtube channel benchmarking'
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "YouTube Channel Comparer",
      "description": "Compare multiple YouTube channels side-by-side with detailed analytics",
      "url": "https://youtool.io/tools/channel-comparer",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "Side-by-side channel comparison",
        "Performance benchmarking",
        "Competitive analysis",
        "Growth tracking",
        "Content strategy insights"
      ]
    }
  }
};
