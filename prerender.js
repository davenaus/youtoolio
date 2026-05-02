// prerender.js — runs react-snap with environment-aware Chrome config
// On Vercel CI: uses puppeteer's bundled Chromium (no path needed)
// Locally on Mac: uses your installed Chrome

const { run } = require('react-snap');
const fs = require('fs');
const net = require('net');
const { execSync } = require('child_process');

const LOCAL_CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const hasLocalChrome = fs.existsSync(LOCAL_CHROME);

function getAvailablePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.unref();
    server.on('error', reject);
    server.listen(0, () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : null;

      server.close(() => {
        if (!port) {
          reject(new Error('Could not find an available prerender port.'));
          return;
        }

        resolve(port);
      });
    });
  });
}

// On Linux CI (Vercel), install missing Chromium system dependencies
if (!hasLocalChrome && process.platform === 'linux') {
  console.log('Linux detected — installing Chromium dependencies...');
  try {
    execSync(
      'apt-get install -y libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2 2>/dev/null || true',
      { stdio: 'inherit' }
    );
  } catch (e) {
    console.log('apt-get not available or failed, continuing anyway...');
  }
}

const baseConfig = {
  source: 'build',
  minifyHtml: { collapseWhitespace: false },
  puppeteerArgs: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--no-first-run',
    '--no-zygote',
    '--single-process',
  ],
  crawl: false,
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
    '/blog/youtube-analytics-metrics-2025',
    '/blog/youtube-seo-optimization-guide',
    '/blog/youtube-algorithm-2025',
    '/blog/youtube-thumbnail-guide',
    '/blog/youtube-monetization-2025',
    '/blog/youtube-content-strategy',
    '/blog/youtube-growth-hacks',
    '/blog/youtube-niche-research',
    '/blog/youtube-subscriber-tactics',
    '/blog/youtube-comment-strategy',
    '/blog/youtube-competitor-analysis',
    '/blog/youtube-playlist-strategy',
    '/blog/youtube-channel-art-guide',
    '/blog/youtube-giveaway-guide',
    '/glossary',
    '/guides',
    '/help',
    '/cookie-policy',
    '/privacy-policy',
    '/terms-of-service',
  ],
};

// Only use local Chrome if it actually exists on this machine
if (hasLocalChrome) {
  baseConfig.puppeteerExecutablePath = LOCAL_CHROME;
  console.log('Using local Chrome for prerendering');
} else {
  console.log('Using puppeteer bundled Chromium for prerendering');
}

async function main() {
  baseConfig.port = await getAvailablePort();
  console.log(`Using port ${baseConfig.port} for prerendering`);
  await run(baseConfig);
}

main().catch((err) => {
  console.error('react-snap failed:', err);
  // Don't fail the whole build if prerendering fails
  // The site will still work as a standard SPA
  console.log('Continuing deployment without prerendering...');
  process.exit(0);
});
