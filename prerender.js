// prerender.js — runs react-snap with environment-aware Chrome config
// On Vercel CI: uses puppeteer's bundled Chromium (no path needed)
// Locally on Mac: uses your installed Chrome

const { run } = require('react-snap');
const isCI = process.env.CI === 'true';

const baseConfig = {
  source: 'build',
  minifyHtml: { collapseWhitespace: false },
  puppeteerArgs: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
  ],
  skipThirdPartyRequests: true,
  inlineCss: false,
  include: [
    '/',
    '/tools',
    '/tools/thumbnail-downloader',
    '/tools/video-analyzer',
    '/tools/channel-analyzer',
    '/tools/tag-generator',
    '/tools/keyword-analyzer',
    '/tools/thumbnail-tester',
    '/tools/thumbnail-analyzer',
    '/tools/channel-comparer',
    '/tools/comment-downloader',
    '/tools/comment-picker',
    '/tools/playlist-analyzer',
    '/tools/qr-code-generator',
    '/tools/subscribe-link-generator',
    '/tools/youtube-calculator',
    '/tools/color-palette',
    '/tools/color-picker-from-image',
    '/tools/outlier-finder',
    '/tools/channel-consultant',
    '/tools/channel-id-finder',
    '/tools/moderation-checker',
    '/tools/banner-downloader',
    '/tools/profile-picture-downloader',
    '/tools/youtool-playbooks',
    '/about',
    '/blog',
    '/privacy-policy',
    '/terms-of-service',
    '/glossary',
    '/guides',
    '/cookie-policy',
  ],
};

// Only set local Chrome path when NOT in CI
if (!isCI) {
  baseConfig.puppeteerExecutablePath =
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
}

run(baseConfig).catch((err) => {
  console.error('react-snap failed:', err);
  process.exit(1);
});
