const jpeg = require('jpeg-js');

const ANALYZER_VERSION = 'thumbnail-visual-features-v1';
const MAX_FETCH_BYTES = 5 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 4500;
const TARGET_SAMPLE_DIMENSION = 320;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round(value, digits = 4) {
  if (!Number.isFinite(Number(value))) return null;
  const factor = Math.pow(10, digits);
  return Math.round(Number(value) * factor) / factor;
}

function brightness(data, width, x, y) {
  const idx = (y * width + x) * 4;
  return (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
}

function rgbToHue(r, g, b) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;

  if (!delta) return 0;
  if (max === red) return (60 * (((green - blue) / delta) % 6) + 360) % 360;
  if (max === green) return 60 * ((blue - red) / delta + 2);
  return 60 * ((red - green) / delta + 4);
}

function hueBucket(hue) {
  if (!Number.isFinite(Number(hue))) return 'unknown';
  if (hue < 20 || hue >= 340) return 'red';
  if (hue < 45) return 'orange';
  if (hue < 70) return 'yellow';
  if (hue < 165) return 'green';
  if (hue < 200) return 'cyan';
  if (hue < 255) return 'blue';
  if (hue < 295) return 'purple';
  return 'pink';
}

function bucket(value, low, high, labels) {
  if (!Number.isFinite(Number(value))) return labels[1];
  if (value < low) return labels[0];
  if (value > high) return labels[2];
  return labels[1];
}

function scoreLighting(avgBrightness, brightRatio, darkRatio, contrastStdDev) {
  let score = 70;

  if (avgBrightness > 100 && avgBrightness < 180) {
    score += 15;
  }

  if (brightRatio < 0.05 && darkRatio < 0.05) {
    score += 10;
  } else if (brightRatio > 0.2 || darkRatio > 0.2) {
    score -= 15;
  }

  if (contrastStdDev > 40 && contrastStdDev < 70) {
    score += 10;
  }

  return clamp(score, 0, 100);
}

function decodeJpeg(buffer) {
  try {
    return jpeg.decode(buffer, {
      useTArray: true,
      formatAsRGBA: true,
      maxMemoryUsageInMB: 96,
    });
  } catch {
    return null;
  }
}

async function fetchThumbnailBuffer(url) {
  if (!url || !/^https:\/\/.+/i.test(url)) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        accept: 'image/jpeg,image/*;q=0.8',
        'user-agent': 'YouTool.io thumbnail visual feature collector',
      },
    });

    if (!response.ok) return null;

    const contentLength = Number(response.headers.get('content-length'));
    if (Number.isFinite(contentLength) && contentLength > MAX_FETCH_BYTES) return null;

    const arrayBuffer = await response.arrayBuffer();
    if (!arrayBuffer || arrayBuffer.byteLength > MAX_FETCH_BYTES) return null;

    return Buffer.from(arrayBuffer);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function analyzeThumbnailBuffer(buffer) {
  const decoded = decodeJpeg(buffer);
  if (!decoded?.data || !decoded.width || !decoded.height) return null;

  const { width, height, data } = decoded;
  const step = Math.max(1, Math.ceil(Math.max(width, height) / TARGET_SAMPLE_DIMENSION));
  const edgeOffset = Math.max(1, step);
  const centerX = width / 2;
  const centerY = height / 2;
  const thirdX = width / 3;
  const thirdY = height / 3;

  let sampleCount = 0;
  let totalBrightness = 0;
  let totalBrightnessSquared = 0;
  let totalSaturation = 0;
  let totalHue = 0;
  let brightPixels = 0;
  let darkPixels = 0;
  let skinTonePixels = 0;
  let centerBrightness = 0;
  let centerPixels = 0;
  let sharpEdgeCount = 0;
  let horizontalEdgeCount = 0;
  let verticalEdgeCount = 0;
  let edgeMagnitudeTotal = 0;
  const colorBuckets = new Map();

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const pixelBrightness = (r + g + b) / 3;
      const saturation = max === 0 ? 0 : (max - min) / max;
      const hue = rgbToHue(r, g, b);
      const colorKey = `${Math.floor(r / 64)}-${Math.floor(g / 64)}-${Math.floor(b / 64)}`;

      sampleCount += 1;
      totalBrightness += pixelBrightness;
      totalBrightnessSquared += pixelBrightness * pixelBrightness;
      totalSaturation += saturation;
      totalHue += hue;
      colorBuckets.set(colorKey, (colorBuckets.get(colorKey) || 0) + 1);

      if (pixelBrightness > 200) brightPixels += 1;
      if (pixelBrightness < 50) darkPixels += 1;
      if (r > 120 && g > 80 && b > 60 && r > b && Math.abs(r - g) < 50) skinTonePixels += 1;

      if (Math.abs(x - centerX) < thirdX && Math.abs(y - centerY) < thirdY) {
        centerBrightness += pixelBrightness;
        centerPixels += 1;
      }

      if (x >= edgeOffset && x < width - edgeOffset && y >= edgeOffset && y < height - edgeOffset) {
        const horizontalDiff = Math.abs(brightness(data, width, x - edgeOffset, y) - brightness(data, width, x + edgeOffset, y));
        const verticalDiff = Math.abs(brightness(data, width, x, y - edgeOffset) - brightness(data, width, x, y + edgeOffset));
        edgeMagnitudeTotal += Math.sqrt(horizontalDiff * horizontalDiff + verticalDiff * verticalDiff);

        if (horizontalDiff > 70) {
          horizontalEdgeCount += 1;
          sharpEdgeCount += 1;
        }

        if (verticalDiff > 70) {
          verticalEdgeCount += 1;
          sharpEdgeCount += 1;
        }
      }
    }
  }

  if (!sampleCount) return null;

  const avgBrightness = totalBrightness / sampleCount;
  const brightnessVariance = totalBrightnessSquared / sampleCount - avgBrightness * avgBrightness;
  const contrastStdDev = Math.sqrt(Math.max(0, brightnessVariance));
  const avgSaturation = totalSaturation / sampleCount;
  const avgHue = totalHue / sampleCount;
  const edgeRatio = sharpEdgeCount / sampleCount;
  const edgeDensity = sharpEdgeCount / (sampleCount * 2);
  const edgeBalance = Math.min(horizontalEdgeCount, verticalEdgeCount) / Math.max(horizontalEdgeCount, verticalEdgeCount, 1);
  const averageEdgeMagnitude = edgeMagnitudeTotal / sampleCount;
  const brightRatio = brightPixels / sampleCount;
  const darkRatio = darkPixels / sampleCount;
  const skinToneRatio = skinTonePixels / sampleCount;
  const avgCenterBrightness = centerPixels ? centerBrightness / centerPixels : avgBrightness;
  const centerFocusRatio = avgBrightness ? avgCenterBrightness / avgBrightness : 1;
  const aspectRatio = width / height;
  const textPresent = edgeRatio > 0.025 && edgeRatio < 0.2 && edgeBalance > 0.5;
  const textConfidence = textPresent ? Math.min(0.95, edgeRatio * 15) : 0;
  const textReadabilityScore = textPresent
    ? Math.min(90, Math.round(edgeBalance * 80 + Math.min(edgeRatio * 500, 30)))
    : 50;
  const compositionScore = clamp(70 + (centerFocusRatio > 1.1 ? 15 : 0) + (aspectRatio >= 1.5 && aspectRatio <= 1.8 ? 10 : 0), 0, 100);
  const lightingScore = scoreLighting(avgBrightness, brightRatio, darkRatio, contrastStdDev);
  const subjectClarityProxy = clamp(62 + (centerFocusRatio > 1.08 ? 8 : 0) + Math.min(skinToneRatio * 120, 12) + Math.min(edgeDensity * 80, 8), 0, 100);
  const visualComplexity = clamp((edgeDensity * 260 + avgSaturation * 70 + contrastStdDev * 0.6 + averageEdgeMagnitude * 0.35), 0, 100);
  const overallScore = (compositionScore + lightingScore + textReadabilityScore + subjectClarityProxy) / 4;
  const dominantColorBucket = Array.from(colorBuckets.entries()).sort((left, right) => right[1] - left[1])[0]?.[0] || 'unknown';
  const dominantHueBucket = hueBucket(avgHue);
  const styleSignature = [
    dominantHueBucket,
    bucket(avgBrightness, 95, 180, ['dark', 'balanced', 'bright']),
    bucket(avgSaturation, 0.22, 0.58, ['muted', 'colorful', 'vivid']),
    bucket(visualComplexity, 32, 68, ['simple', 'moderate', 'busy']),
    textPresent ? 'text' : 'no-text',
  ].join(':');

  return {
    version: ANALYZER_VERSION,
    source: 'server-jpeg-js',
    width,
    height,
    sampleStep: step,
    sampleCount,
    aspectRatio: round(aspectRatio, 4),
    averageBrightness: round(avgBrightness, 2),
    contrastStdDev: round(contrastStdDev, 2),
    brightPixelRatio: round(brightRatio, 4),
    darkPixelRatio: round(darkRatio, 4),
    averageSaturation: round(avgSaturation, 4),
    averageHue: round(avgHue, 2),
    dominantHueBucket,
    dominantColorBucket,
    edgeDensity: round(edgeDensity, 4),
    edgeBalance: round(edgeBalance, 4),
    averageEdgeMagnitude: round(averageEdgeMagnitude, 2),
    skinTonePixelRatio: round(skinToneRatio, 4),
    centerFocusRatio: round(centerFocusRatio, 4),
    textPresent,
    textConfidence: round(textConfidence, 4),
    textReadabilityScore: round(textReadabilityScore, 2),
    compositionScore: round(compositionScore, 2),
    lightingScore: round(lightingScore, 2),
    subjectClarityProxy: round(subjectClarityProxy, 2),
    visualComplexity: round(visualComplexity, 2),
    overallScore: round(overallScore, 2),
    styleSignature,
  };
}

async function analyzeThumbnailUrl(url) {
  const buffer = await fetchThumbnailBuffer(url);
  if (!buffer) return null;
  return analyzeThumbnailBuffer(buffer);
}

module.exports = {
  ANALYZER_VERSION,
  analyzeThumbnailBuffer,
  analyzeThumbnailUrl,
};
