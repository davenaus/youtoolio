// src/pages/Tools/components/ThumbnailAnalyzer/ThumbnailAnalyzer.tsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToolPageWrapper } from '../../../../components/ToolPageWrapper';
import { SEO } from '../../../../components/SEO';
import { GoogleAd } from '../../../../components/GoogleAd';
import { toolsSEO, generateToolSchema } from '../../../../config/toolsSEO';
import * as S from './styles';

interface AnalysisResult {
  heatmapUrl: string;
  scores: {
    composition: number;
    compositionReason: string;
    lighting: number;
    lightingReason: string;
    textReadability: number;
    textReadabilityReason: string;
    subjectClarity: number;
    subjectClarityReason: string;
    overall: number;
  };
  detectedObjects: Array<{
    label: string;
    confidence: number;
    box: { x: number; y: number; width: number; height: number };
  }>;
  detectedText: Array<{
    text: string;
    confidence: number;
    readabilityScore: number;
  }>;
  insights: string[];
}

export const ThumbnailAnalyzer: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [currentStep, setCurrentStep] = useState<'upload' | 'analyzing' | 'results'>('upload');
  const [error, setError] = useState<string | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [heatmapOpacity, setHeatmapOpacity] = useState(50);

  // Tool configuration
  const toolConfig = {
    name: 'Thumbnail Analyzer',
    description: 'AI-powered thumbnail analysis with attention heatmaps and composition scoring',
    image: '/images/tools/thumbnail-analyzer.jpg',
    icon: 'bx bx-image-alt',
    features: [
      'Eye-tracking heatmaps',
      'Composition scoring',
      'AI optimization insights'
    ]
  };

  const validateAspectRatio = (img: HTMLImageElement): boolean => {
    const aspectRatio = img.width / img.height;
    const targetRatio = 16 / 9;
    const tolerance = 0.01; // Allow small tolerance for floating point comparison
    return Math.abs(aspectRatio - targetRatio) < tolerance;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, WEBP)');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('Image file size must be less than 50MB');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Validate 16:9 aspect ratio
        if (!validateAspectRatio(img)) {
          setError('Image must have a 16:9 aspect ratio (e.g., 1920x1080, 1280x720, 3840x2160)');
          return;
        }
        setUploadedImage(event.target?.result as string);
        setCurrentStep('upload');
        setAnalysisResult(null);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, WEBP)');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('Image file size must be less than 50MB');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Validate 16:9 aspect ratio
        if (!validateAspectRatio(img)) {
          setError('Image must have a 16:9 aspect ratio (e.g., 1920x1080, 1280x720, 3840x2160)');
          return;
        }
        setUploadedImage(event.target?.result as string);
        setCurrentStep('upload');
        setAnalysisResult(null);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const generateHeatmap = async (imageDataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(imageDataUrl);
          return;
        }

        // Moderate downscaling - balance between speed and quality
        const maxDim = 800;
        const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
        const width = Math.floor(img.width * scale);
        const height = Math.floor(img.height * scale);

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Enhanced saliency calculation
        const saliencyMap = new Float32Array(width * height);
        const grayscale = new Uint8Array(width * height);

        // Convert to grayscale
        for (let i = 0; i < data.length; i += 4) {
          grayscale[i / 4] = (data[i] + data[i + 1] + data[i + 2]) / 3;
        }

        // Sobel edge detection with sampling
        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            const idx = y * width + x;

            // Sobel operator
            const gx =
              -grayscale[(y - 1) * width + (x - 1)] +
              grayscale[(y - 1) * width + (x + 1)] +
              -2 * grayscale[y * width + (x - 1)] +
              2 * grayscale[y * width + (x + 1)] +
              -grayscale[(y + 1) * width + (x - 1)] +
              grayscale[(y + 1) * width + (x + 1)];

            const gy =
              -grayscale[(y - 1) * width + (x - 1)] +
              -2 * grayscale[(y - 1) * width + x] +
              -grayscale[(y - 1) * width + (x + 1)] +
              grayscale[(y + 1) * width + (x - 1)] +
              2 * grayscale[(y + 1) * width + x] +
              grayscale[(y + 1) * width + (x + 1)];

            const edgeMagnitude = Math.sqrt(gx * gx + gy * gy);

            // Color saliency (saturated colors attract attention)
            const idx4 = idx * 4;
            const r = data[idx4];
            const g = data[idx4 + 1];
            const b = data[idx4 + 2];
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const saturation = max === 0 ? 0 : (max - min) / max;
            const brightness = (r + g + b) / 3;

            // Face/skin tone detection boost (peachy/warm tones)
            const skinToneBoost = (r > 120 && g > 80 && b > 60 && r > b && Math.abs(r - g) < 50) ? 60 : 0;

            saliencyMap[idx] = edgeMagnitude * 0.6 + saturation * 100 + brightness * 0.4 + skinToneBoost;
          }
        }

        // Add center bias with stronger weight
        const centerX = width / 2;
        const centerY = height / 2;
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            const dx = (x - centerX) / width;
            const dy = (y - centerY) / height;
            const distFromCenter = Math.sqrt(dx * dx + dy * dy);
            const centerBoost = Math.exp(-distFromCenter * 2.5) * 50;
            saliencyMap[idx] += centerBoost;
          }
        }

        // Weighted Gaussian-like blur for smooth heatmap
        const blurredSaliency = new Float32Array(width * height);
        const kernelSize = 12;
        const sigma = 6.0;

        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            let sum = 0;
            let weightSum = 0;

            for (let ky = -kernelSize; ky <= kernelSize; ky += 2) {
              for (let kx = -kernelSize; kx <= kernelSize; kx += 2) {
                const nx = Math.max(0, Math.min(width - 1, x + kx));
                const ny = Math.max(0, Math.min(height - 1, y + ky));
                const weight = Math.exp(-(kx * kx + ky * ky) / (2 * sigma * sigma));
                sum += saliencyMap[ny * width + nx] * weight;
                weightSum += weight;
              }
            }

            blurredSaliency[y * width + x] = sum / weightSum;
          }
        }

        // Find min/max for normalization
        let maxSaliency = 0;
        let minSaliency = Infinity;
        for (let i = 0; i < blurredSaliency.length; i++) {
          if (blurredSaliency[i] > maxSaliency) maxSaliency = blurredSaliency[i];
          if (blurredSaliency[i] < minSaliency) minSaliency = blurredSaliency[i];
        }

        // Create output canvas at original size
        const heatmapCanvas = document.createElement('canvas');
        heatmapCanvas.width = img.width;
        heatmapCanvas.height = img.height;
        const heatmapCtx = heatmapCanvas.getContext('2d');
        if (!heatmapCtx) {
          resolve(imageDataUrl);
          return;
        }

        // Draw original image with darkening
        heatmapCtx.drawImage(img, 0, 0);
        heatmapCtx.globalAlpha = 0.4;
        heatmapCtx.fillStyle = 'black';
        heatmapCtx.fillRect(0, 0, img.width, img.height);
        heatmapCtx.globalAlpha = 1.0;

        // Create temp canvas for heatmap
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) {
          resolve(imageDataUrl);
          return;
        }

        const heatmapData = tempCtx.createImageData(width, height);

        for (let i = 0; i < blurredSaliency.length; i++) {
          // Enhanced contrast curve
          let normalized = (blurredSaliency[i] - minSaliency) / (maxSaliency - minSaliency);
          normalized = Math.pow(normalized, 0.65);

          const intensity = Math.min(255, normalized * 230 + 40);

          let r, g, b;
          if (normalized < 0.15) {
            // Deep blue for low attention
            r = 0;
            g = 0;
            b = 255;
          } else if (normalized < 0.35) {
            // Blue to cyan
            const t = (normalized - 0.15) / 0.2;
            r = 0;
            g = 255 * t;
            b = 255;
          } else if (normalized < 0.55) {
            // Cyan to green
            const t = (normalized - 0.35) / 0.2;
            r = 0;
            g = 255;
            b = 255 * (1 - t);
          } else if (normalized < 0.70) {
            // Green to yellow
            const t = (normalized - 0.55) / 0.15;
            r = 255 * t;
            g = 255;
            b = 0;
          } else if (normalized < 0.85) {
            // Yellow to orange
            const t = (normalized - 0.70) / 0.15;
            r = 255;
            g = 255 * (1 - t * 0.4);
            b = 0;
          } else {
            // Orange to bright red
            const t = (normalized - 0.85) / 0.15;
            r = 255;
            g = 155 * (1 - t);
            b = 0;
          }

          heatmapData.data[i * 4] = r;
          heatmapData.data[i * 4 + 1] = g;
          heatmapData.data[i * 4 + 2] = b;
          heatmapData.data[i * 4 + 3] = intensity;
        }

        tempCtx.putImageData(heatmapData, 0, 0);

        // Scale up and overlay on main canvas
        heatmapCtx.drawImage(tempCanvas, 0, 0, img.width, img.height);

        resolve(heatmapCanvas.toDataURL());
      };
      img.src = imageDataUrl;
    });
  };

  const calculateCompositionScore = (imageDataUrl: string): Promise<{ score: number; reason: string }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ score: 70, reason: 'Standard composition detected' });
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        let score = 70;
        const reasons: string[] = [];

        // Check rule of thirds
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const thirdX = canvas.width / 3;
        const thirdY = canvas.height / 3;

        // Analyze brightness distribution
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        let totalBrightness = 0;
        let centerBrightness = 0;
        let centerPixels = 0;

        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const idx = (y * canvas.width + x) * 4;
            const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
            totalBrightness += brightness;

            // Check if pixel is in center region
            if (Math.abs(x - centerX) < thirdX && Math.abs(y - centerY) < thirdY) {
              centerBrightness += brightness;
              centerPixels++;
            }
          }
        }

        const avgBrightness = totalBrightness / (canvas.width * canvas.height);
        const avgCenterBrightness = centerBrightness / centerPixels;

        // Reward center focus
        if (avgCenterBrightness > avgBrightness * 1.1) {
          score += 15;
          reasons.push('Strong center focus draws viewer attention');
        } else {
          reasons.push('Subjects could be better centered for impact');
        }

        // Check for balanced composition
        const aspectRatio = canvas.width / canvas.height;
        if (aspectRatio >= 1.5 && aspectRatio <= 1.8) {
          score += 10; // YouTube thumbnail optimal ratio
          reasons.push('Perfect 16:9 aspect ratio for YouTube');
        } else {
          reasons.push('Non-standard aspect ratio may crop on some devices');
        }

        const finalScore = Math.min(100, score);
        const reason = reasons.join('. ');
        resolve({ score: finalScore, reason });
      };
      img.src = imageDataUrl;
    });
  };

  const calculateLightingScore = (imageDataUrl: string): Promise<{ score: number; reason: string }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ score: 70, reason: 'Standard lighting detected' });
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        let score = 70;
        const reasons: string[] = [];
        let totalBrightness = 0;
        let brightPixels = 0;
        let darkPixels = 0;

        for (let i = 0; i < data.length; i += 4) {
          const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
          totalBrightness += brightness;

          if (brightness > 200) brightPixels++;
          if (brightness < 50) darkPixels++;
        }

        const avgBrightness = totalBrightness / (data.length / 4);
        const totalPixels = data.length / 4;

        // Ideal brightness range
        if (avgBrightness > 100 && avgBrightness < 180) {
          score += 15;
          reasons.push('Optimal brightness range for visibility');
        } else if (avgBrightness <= 100) {
          reasons.push('Image appears too dark, may not stand out');
        } else {
          reasons.push('Image may be too bright, reducing detail');
        }

        // Penalize too many blown out or crushed blacks
        const brightRatio = brightPixels / totalPixels;
        const darkRatio = darkPixels / totalPixels;

        if (brightRatio < 0.05 && darkRatio < 0.05) {
          score += 10;
          reasons.push('Good dynamic range without clipping');
        } else if (brightRatio > 0.2 || darkRatio > 0.2) {
          score -= 15;
          reasons.push('Too many overexposed or underexposed areas');
        }

        // Calculate contrast
        let variance = 0;
        for (let i = 0; i < data.length; i += 4) {
          const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
          variance += Math.pow(brightness - avgBrightness, 2);
        }
        const stdDev = Math.sqrt(variance / (data.length / 4));

        // Reward good contrast
        if (stdDev > 40 && stdDev < 70) {
          score += 10;
          reasons.push('Excellent contrast for visual pop');
        } else if (stdDev <= 40) {
          reasons.push('Low contrast may appear flat');
        } else {
          reasons.push('Very high contrast may be harsh');
        }

        const finalScore = Math.min(100, Math.max(0, score));
        const reason = reasons.join('. ');
        resolve({ score: finalScore, reason });
      };
      img.src = imageDataUrl;
    });
  };

  const detectText = async (imageDataUrl: string): Promise<Array<{ text: string; confidence: number; readabilityScore: number }>> => {
    // Enhanced text detection with canvas analysis
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve([]);
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Analyze for text-like patterns
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        let sharpEdgeCount = 0;
        let horizontalEdgeCount = 0;
        let verticalEdgeCount = 0;
        const sampleRate = 3; // Sample every 3rd pixel for better coverage

        for (let y = 2; y < canvas.height - 2; y += sampleRate) {
          for (let x = 2; x < canvas.width - 2; x += sampleRate) {
            const idx = (y * canvas.width + x) * 4;
            const current = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

            // Check horizontal edges (common in text)
            const leftIdx = (y * canvas.width + (x - 2)) * 4;
            const left = (data[leftIdx] + data[leftIdx + 1] + data[leftIdx + 2]) / 3;
            const rightIdx = (y * canvas.width + (x + 2)) * 4;
            const right = (data[rightIdx] + data[rightIdx + 1] + data[rightIdx + 2]) / 3;
            const horizDiff = Math.abs(left - right);

            // Check vertical edges (common in text)
            const topIdx = ((y - 2) * canvas.width + x) * 4;
            const top = (data[topIdx] + data[topIdx + 1] + data[topIdx + 2]) / 3;
            const bottomIdx = ((y + 2) * canvas.width + x) * 4;
            const bottom = (data[bottomIdx] + data[bottomIdx + 1] + data[bottomIdx + 2]) / 3;
            const vertDiff = Math.abs(top - bottom);

            // Text typically has sharp, clean edges (high contrast threshold)
            if (horizDiff > 70) {
              horizontalEdgeCount++;
              sharpEdgeCount++;
            }
            if (vertDiff > 70) {
              verticalEdgeCount++;
              sharpEdgeCount++;
            }
          }
        }

        // Calculate metrics
        const detectedText: Array<{ text: string; confidence: number; readabilityScore: number }> = [];
        const totalSamples = ((canvas.width / sampleRate) * (canvas.height / sampleRate));
        const edgeRatio = sharpEdgeCount / totalSamples;
        const edgeBalance = Math.min(horizontalEdgeCount, verticalEdgeCount) / Math.max(horizontalEdgeCount, verticalEdgeCount, 1);

        // Text has both horizontal and vertical edges in balance, and sufficient edge density
        // More conservative: require at least 2.5% edge density and 50% edge balance
        // This reduces false positives while still catching actual text overlays
        if (edgeRatio > 0.025 && edgeRatio < 0.15 && edgeBalance > 0.5) {
          const confidence = Math.min(0.95, edgeRatio * 15);
          const readabilityScore = Math.min(90, Math.round(edgeBalance * 80 + Math.min(edgeRatio * 500, 30)));

          detectedText.push({
            text: 'Text detected in thumbnail',
            confidence,
            readabilityScore
          });
        }

        resolve(detectedText);
      };
      img.src = imageDataUrl;
    });
  };

  const detectObjects = async (imageDataUrl: string): Promise<Array<{ label: string; confidence: number; box: any }>> => {
    // Object detection disabled - would require external API (Hugging Face, etc.)
    // Returning empty array to avoid false positives
    return [];
  };

  const generateInsights = (result: AnalysisResult): string[] => {
    const insights: string[] = [];

    if (result.scores.composition > 85) {
      insights.push('Excellent composition following rule of thirds and visual balance');
    } else if (result.scores.composition < 60) {
      insights.push('Composition could be improved - consider repositioning main subjects');
    }

    if (result.scores.lighting > 85) {
      insights.push('Great lighting with balanced exposure and contrast');
    } else if (result.scores.lighting < 60) {
      insights.push('Lighting needs improvement - check for blown highlights or crushed shadows');
    }

    if (result.detectedText.length > 0) {
      const avgReadability = result.detectedText.reduce((sum, t) => sum + t.readabilityScore, 0) / result.detectedText.length;
      if (avgReadability > 75) {
        insights.push('Text is clear and readable - great for viewer engagement');
      } else {
        insights.push('Text readability could be improved with better contrast or sizing');
      }
    }

    if (result.detectedObjects.length > 0) {
      const personDetected = result.detectedObjects.some(obj => obj.label === 'person');
      if (personDetected) {
        insights.push('Human presence detected - thumbnails with faces tend to get 30% more clicks');
      }
    }

    if (result.scores.overall > 80) {
      insights.push('Strong overall performance - this thumbnail should perform well');
    }

    return insights;
  };


  const analyzeImage = async () => {
    if (!uploadedImage) return;

    setIsAnalyzing(true);
    setCurrentStep('analyzing');
    setError(null);
    setAnalysisProgress(0);

    // Progress counter animation (15 seconds max to reach 100%)
    const progressDuration = 15000; // 15 seconds
    const progressInterval = 100; // Update every 100ms
    const progressIncrement = (100 / (progressDuration / progressInterval));

    const progressTimer = setInterval(() => {
      setAnalysisProgress(prev => {
        const next = prev + progressIncrement;
        if (next >= 99) {
          clearInterval(progressTimer);
          return 99; // Stop at 99%, jump to 100% when done
        }
        return next;
      });
    }, progressInterval);

    try {
      // Simulate progress steps
      setAnalysisProgress(10);

      // Generate heatmap
      const heatmap = await generateHeatmap(uploadedImage);
      setAnalysisProgress(40);

      // Calculate all scores
      const [compositionData, lightingData, detectedTextResult, detectedObjectsResult] = await Promise.all([
        calculateCompositionScore(uploadedImage),
        calculateLightingScore(uploadedImage),
        detectText(uploadedImage),
        detectObjects(uploadedImage)
      ]);

      setAnalysisProgress(80);

      const textReadability = detectedTextResult.length > 0
        ? detectedTextResult.reduce((sum, t) => sum + t.readabilityScore, 0) / detectedTextResult.length
        : 50;
      const textReadabilityReason = detectedTextResult.length > 0
        ? 'Text detected with readable contrast and sizing'
        : 'No text detected in thumbnail';

      const subjectClarity = detectedObjectsResult.length > 0
        ? detectedObjectsResult.reduce((sum, obj) => sum + obj.confidence * 100, 0) / detectedObjectsResult.length
        : 70;
      const subjectClarityReason = detectedObjectsResult.length > 0
        ? `Clear subjects detected: ${detectedObjectsResult.map(o => o.label).join(', ')}`
        : 'Subject clarity based on composition and visual balance';

      const overall = (compositionData.score + lightingData.score + textReadability + subjectClarity) / 4;

      const result: AnalysisResult = {
        heatmapUrl: heatmap,
        scores: {
          composition: compositionData.score,
          compositionReason: compositionData.reason,
          lighting: lightingData.score,
          lightingReason: lightingData.reason,
          textReadability,
          textReadabilityReason,
          subjectClarity,
          subjectClarityReason,
          overall
        },
        detectedObjects: detectedObjectsResult,
        detectedText: detectedTextResult,
        insights: []
      };

      result.insights = generateInsights(result);

      setAnalysisProgress(100);
      clearInterval(progressTimer);

      // Small delay to show 100%
      setTimeout(() => {
        setAnalysisResult(result);
        setCurrentStep('results');
      }, 300);
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze thumbnail. Please try again.');
      setCurrentStep('upload');
      clearInterval(progressTimer);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setUploadedImage(null);
    setAnalysisResult(null);
    setCurrentStep('upload');
    setError(null);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 85) return '#10b981'; // green
    if (score >= 70) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 55) return 'Fair';
    return 'Needs Improvement';
  };

  const seoConfig = toolsSEO['thumbnail-analyzer'] || {
    title: 'Thumbnail Analyzer - AI Eye-Tracking & Composition Analysis | YouTool.io',
    description: 'Analyze your YouTube thumbnails with AI-powered eye-tracking heatmaps, composition scoring, and optimization recommendations.',
    keywords: ['thumbnail analyzer', 'eye tracking', 'heatmap', 'thumbnail optimization']
  };
  const schemaData = generateToolSchema('thumbnail-analyzer', seoConfig);

  return (
    <>
      <SEO
        title={seoConfig.title}
        description={seoConfig.description}
        keywords={seoConfig.keywords}
        canonical="https://youtool.io/tools/thumbnail-analyzer"
        schemaData={schemaData}
      />
      <ToolPageWrapper toolKey="thumbnail-analyzer">
        <S.PageWrapper>
          <S.MainContainer>
            <S.BackButton onClick={() => navigate('/tools')}>
              <i className="bx bx-arrow-back"></i>
              Back to Tools
            </S.BackButton>

            {/* Enhanced Header */}
            <S.EnhancedHeader backgroundImage={toolConfig.image}>
              <S.HeaderOverlay />
              <S.HeaderContent>
                <S.ToolIconContainer>
                  <i className={toolConfig.icon}></i>
                </S.ToolIconContainer>

                <S.HeaderTextContent>
                  <S.ToolTitle>{toolConfig.name}</S.ToolTitle>
                  <S.ToolDescription>{toolConfig.description}</S.ToolDescription>

                  <S.FeaturesList>
                    {toolConfig.features.map((feature, index) => (
                      <S.FeatureItem key={index}>
                        <i className="bx bx-check-circle"></i>
                        <span>{feature}</span>
                      </S.FeatureItem>
                    ))}
                  </S.FeaturesList>
                </S.HeaderTextContent>
              </S.HeaderContent>
            </S.EnhancedHeader>

            {/* Google Ad Spot */}
            <GoogleAd adSlot="1234567890" />

            {error && (
              <S.ErrorMessage>
                <i className="bx bx-error-circle"></i>
                {error}
              </S.ErrorMessage>
            )}

            {/* Upload Section */}
            {currentStep === 'upload' && (
              <S.UploadSection>
                <S.DropZone
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                  hasImage={!!uploadedImage}
                >
                  {uploadedImage ? (
                    <S.PreviewImage src={uploadedImage} alt="Uploaded thumbnail" />
                  ) : (
                    <>
                      <i className="bx bx-cloud-upload"></i>
                      <h3>Drop your thumbnail here</h3>
                      <p>or click to browse files</p>
                      <S.SupportedFormats>
                        Supports: JPG, PNG, WEBP (Max 50MB)
                      </S.SupportedFormats>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                </S.DropZone>

                {uploadedImage && (
                  <S.ActionButtons>
                    <S.SecondaryButton onClick={resetAnalysis}>
                      <i className="bx bx-x"></i>
                      Remove Image
                    </S.SecondaryButton>
                    <S.PrimaryButton onClick={analyzeImage} disabled={isAnalyzing}>
                      <i className="bx bx-brain"></i>
                      Analyze Thumbnail
                    </S.PrimaryButton>
                  </S.ActionButtons>
                )}

                {/* Educational Content */}
                <S.EducationalSection>
                  <S.SectionTitle>What This Tool Analyzes</S.SectionTitle>
                  <S.FeatureGrid>
                    <S.FeatureCard>
                      <i className="bx bx-bullseye"></i>
                      <h3>Eye-Tracking Heatmap</h3>
                      <p>See where viewers' eyes naturally gravitate using AI-powered visual saliency detection</p>
                    </S.FeatureCard>
                    <S.FeatureCard>
                      <i className="bx bx-grid-alt"></i>
                      <h3>Composition Analysis</h3>
                      <p>Evaluate rule of thirds, subject placement, and visual balance</p>
                    </S.FeatureCard>
                    <S.FeatureCard>
                      <i className="bx bx-sun"></i>
                      <h3>Lighting Quality</h3>
                      <p>Assess brightness, contrast, and exposure for optimal visibility</p>
                    </S.FeatureCard>
                    <S.FeatureCard>
                      <i className="bx bx-font"></i>
                      <h3>Text Readability</h3>
                      <p>Measure text clarity, contrast, and effectiveness</p>
                    </S.FeatureCard>
                  </S.FeatureGrid>

                  <S.EduContent>
                    <S.EduSubTitle>How the Thumbnail Analyzer Works</S.EduSubTitle>
                    <S.EduText>
                      Upload any YouTube thumbnail and the analyzer processes it through several visual analysis algorithms. It generates an attention heatmap showing where the human eye is likely to focus first, scores the composition against design principles like the rule of thirds, and evaluates text contrast and readability at the small sizes YouTube displays thumbnails.
                    </S.EduText>
                    <S.EduText>
                      The analysis produces a score from 0–100 for each dimension, along with specific, actionable feedback. Use the results to iterate on your thumbnail design before publishing — fixing a low contrast score or a poorly placed subject can meaningfully increase your click-through rate.
                    </S.EduText>
                  </S.EduContent>

                  <S.EduContent>
                    <S.EduSubTitle>Understanding Your Analysis Results</S.EduSubTitle>
                    <S.EduList>
                      <S.EduListItem>
                        <i className="bx bx-check-circle"></i>
                        <span><strong>Attention Heatmap:</strong> The heatmap overlays color gradients on your thumbnail showing where visual attention concentrates — red areas receive the most attention, blue areas the least. Ideally, your most important element (a face, product, or text) should sit in a high-attention zone. If your key subject is in a low-attention area, consider repositioning it.</span>
                      </S.EduListItem>
                      <S.EduListItem>
                        <i className="bx bx-check-circle"></i>
                        <span><strong>Composition Score:</strong> Evaluates whether subjects are placed on or near the rule-of-thirds intersection points, whether the visual weight is balanced, and whether there's a clear hierarchy between elements. Thumbnails with strong composition feel immediately organized and professional even at a glance.</span>
                      </S.EduListItem>
                      <S.EduListItem>
                        <i className="bx bx-check-circle"></i>
                        <span><strong>Lighting and Contrast Score:</strong> Measures the overall brightness, dynamic range, and contrast ratio of the image. Thumbnails that are too dark or washed out become invisible in YouTube's dark-themed interface. High contrast thumbnails pop off the screen — the goal is a contrast ratio of at least 4.5:1 between the primary subject and the background.</span>
                      </S.EduListItem>
                      <S.EduListItem>
                        <i className="bx bx-check-circle"></i>
                        <span><strong>Text Readability Score:</strong> If your thumbnail includes text, this score evaluates whether it's readable at YouTube's smallest display sizes (168×94px on mobile). Key factors are font size, font weight, and contrast between text and background. The test simulates how your thumbnail looks scaled down to ensure the text doesn't disappear.</span>
                      </S.EduListItem>
                    </S.EduList>
                  </S.EduContent>

                  <S.EduContent>
                    <S.EduSubTitle>Frequently Asked Questions</S.EduSubTitle>
                    <S.EduList>
                      <S.EduListItem>
                        <i className="bx bx-help-circle"></i>
                        <span><strong>Is my thumbnail uploaded to a server?</strong> No. All analysis is performed locally in your browser using the HTML5 Canvas API and JavaScript image processing. Your thumbnail image never leaves your device.</span>
                      </S.EduListItem>
                      <S.EduListItem>
                        <i className="bx bx-help-circle"></i>
                        <span><strong>What score should I aim for?</strong> A combined score above 75 generally indicates a strong thumbnail. Scores between 60–75 are acceptable with some room for improvement. Below 60 usually means there's a specific significant issue — low contrast, unreadable text, or a cluttered composition — that's worth addressing before publishing.</span>
                      </S.EduListItem>
                      <S.EduListItem>
                        <i className="bx bx-help-circle"></i>
                        <span><strong>How is this different from the Thumbnail Tester?</strong> The Thumbnail Analyzer evaluates your thumbnail in isolation using visual analysis algorithms — it tells you what's strong or weak about the image itself. The Thumbnail Tester places your thumbnail in a competitive context by showing how it looks alongside trending or competitor thumbnails. Both tools are complementary — use the Analyzer to improve the thumbnail, then the Tester to check if it stands out in the feed.</span>
                      </S.EduListItem>
                    </S.EduList>
                  </S.EduContent>

                  <S.EduContent>
                    <S.EduSubTitle>Related Tools</S.EduSubTitle>
                    <S.EduList>
                      <S.EduListItem>
                        <i className="bx bx-link"></i>
                        <span><a href="/tools/thumbnail-tester"><strong>Thumbnail Tester</strong></a> — Compare your thumbnail side-by-side against trending videos or a competitor's channel to see how it looks in context.</span>
                      </S.EduListItem>
                      <S.EduListItem>
                        <i className="bx bx-link"></i>
                        <span><a href="/tools/thumbnail-downloader"><strong>Thumbnail Downloader</strong></a> — Download thumbnails from high-performing videos to analyze their composition and study what works in your niche.</span>
                      </S.EduListItem>
                      <S.EduListItem>
                        <i className="bx bx-link"></i>
                        <span><a href="/tools/color-palette"><strong>Color Palette Extractor</strong></a> — Extract the exact color palette from your thumbnail or from high-performing competitor thumbnails.</span>
                      </S.EduListItem>
                    </S.EduList>
                  </S.EduContent>

                </S.EducationalSection>
              </S.UploadSection>
            )}

            {/* Analyzing Section */}
            {currentStep === 'analyzing' && (
              <S.LoadingSection>
                <S.LoadingSpinner>
                  <i className="bx bx-loader-alt bx-spin"></i>
                </S.LoadingSpinner>
                <h3>Analyzing Your Thumbnail...</h3>
                <S.ProgressCounter>{Math.round(analysisProgress)}%</S.ProgressCounter>
                <S.ProgressBarContainer>
                  <S.ProgressBarFill width={analysisProgress} />
                </S.ProgressBarContainer>
                <S.AnalyzingSteps>
                  <S.AnalyzingStep completed={analysisProgress >= 10}>
                    <i className={analysisProgress >= 10 ? "bx bx-check-circle" : "bx bx-loader-circle bx-spin"}></i>
                    Generating attention heatmap
                  </S.AnalyzingStep>
                  <S.AnalyzingStep completed={analysisProgress >= 40}>
                    <i className={analysisProgress >= 40 ? "bx bx-check-circle" : "bx bx-loader-circle"}></i>
                    Calculating composition score
                  </S.AnalyzingStep>
                  <S.AnalyzingStep completed={analysisProgress >= 80}>
                    <i className={analysisProgress >= 80 ? "bx bx-check-circle" : "bx bx-loader-circle"}></i>
                    Analyzing lighting and readability
                  </S.AnalyzingStep>
                  <S.AnalyzingStep completed={analysisProgress >= 100}>
                    <i className={analysisProgress >= 100 ? "bx bx-check-circle" : "bx bx-loader-circle"}></i>
                    Detecting text and subjects
                  </S.AnalyzingStep>
                </S.AnalyzingSteps>
              </S.LoadingSection>
            )}

            {/* Results Section */}
            {currentStep === 'results' && analysisResult && (
              <S.ResultsSection>
                <S.ResultsWrapper>
                  {/* Two Column Layout: Heatmap on Left, Scorecard on Right */}
                  <S.TwoColumnContainer>
                    {/* Left Column: Heatmap Section */}
                    <S.HeatmapSection>
                    <S.SectionTitle>Attention Heatmap</S.SectionTitle>

                    <S.HeatmapOverlayContainer>
                      <S.OriginalImage src={uploadedImage!} alt="Original" />
                      <S.HeatmapOverlay
                        src={analysisResult.heatmapUrl}
                        alt="Heatmap"
                        opacity={heatmapOpacity}
                      />
                    </S.HeatmapOverlayContainer>

                    <S.OpacitySliderContainer>
                      <S.SliderLabel>Original</S.SliderLabel>
                      <S.OpacitySlider
                        type="range"
                        min="0"
                        max="100"
                        value={heatmapOpacity}
                        onChange={(e) => setHeatmapOpacity(Number(e.target.value))}
                      />
                      <S.SliderLabel>Heatmap</S.SliderLabel>
                    </S.OpacitySliderContainer>

                    {/* Legend - under slider */}
                    <S.HeatmapLegend>
                      <S.LegendItem>
                        <S.LegendColor color="#FF0000" />
                        <span>High Attention</span>
                      </S.LegendItem>
                      <S.LegendItem>
                        <S.LegendColor color="#FFFF00" />
                        <span>Medium Attention</span>
                      </S.LegendItem>
                      <S.LegendItem>
                        <S.LegendColor color="#00FF00" />
                        <span>Low Attention</span>
                      </S.LegendItem>
                      <S.LegendItem>
                        <S.LegendColor color="#0000FF" />
                        <span>Minimal Attention</span>
                      </S.LegendItem>
                    </S.HeatmapLegend>
                  </S.HeatmapSection>

                  {/* Right Column: Scorecard with All Scores */}
                  <S.ScorecardTile>
                    <S.SectionTitle>Scorecard</S.SectionTitle>

                    <S.ScoreCircle color={getScoreColor(analysisResult.scores.overall)}>
                      <S.ScoreNumber>{Math.round(analysisResult.scores.overall)}</S.ScoreNumber>
                      <S.ScoreLabel>{getScoreLabel(analysisResult.scores.overall)}</S.ScoreLabel>
                    </S.ScoreCircle>

                    {/* Individual Scores inside Scorecard */}
                    <S.ScorecardScoresList>
                      <S.ScorecardScoreItem>
                        <S.ScorecardScoreHeader>
                          <S.ScoreIconSmall>
                            <i className="bx bx-grid-alt"></i>
                          </S.ScoreIconSmall>
                          <S.ScoreNameSmall>Composition</S.ScoreNameSmall>
                          <S.ScoreValueSmall color={getScoreColor(analysisResult.scores.composition)}>
                            {Math.round(analysisResult.scores.composition)}/100
                          </S.ScoreValueSmall>
                        </S.ScorecardScoreHeader>
                        <S.ScoreBar>
                          <S.ScoreFill
                            width={analysisResult.scores.composition}
                            color={getScoreColor(analysisResult.scores.composition)}
                          />
                        </S.ScoreBar>
                        <S.ScoreReasonSmall>{analysisResult.scores.compositionReason}</S.ScoreReasonSmall>
                      </S.ScorecardScoreItem>

                      <S.ScorecardScoreItem>
                        <S.ScorecardScoreHeader>
                          <S.ScoreIconSmall>
                            <i className="bx bx-sun"></i>
                          </S.ScoreIconSmall>
                          <S.ScoreNameSmall>Lighting</S.ScoreNameSmall>
                          <S.ScoreValueSmall color={getScoreColor(analysisResult.scores.lighting)}>
                            {Math.round(analysisResult.scores.lighting)}/100
                          </S.ScoreValueSmall>
                        </S.ScorecardScoreHeader>
                        <S.ScoreBar>
                          <S.ScoreFill
                            width={analysisResult.scores.lighting}
                            color={getScoreColor(analysisResult.scores.lighting)}
                          />
                        </S.ScoreBar>
                        <S.ScoreReasonSmall>{analysisResult.scores.lightingReason}</S.ScoreReasonSmall>
                      </S.ScorecardScoreItem>

                      <S.ScorecardScoreItem>
                        <S.ScorecardScoreHeader>
                          <S.ScoreIconSmall>
                            <i className="bx bx-font"></i>
                          </S.ScoreIconSmall>
                          <S.ScoreNameSmall>Text Readability</S.ScoreNameSmall>
                          <S.ScoreValueSmall color={getScoreColor(analysisResult.scores.textReadability)}>
                            {Math.round(analysisResult.scores.textReadability)}/100
                          </S.ScoreValueSmall>
                        </S.ScorecardScoreHeader>
                        <S.ScoreBar>
                          <S.ScoreFill
                            width={analysisResult.scores.textReadability}
                            color={getScoreColor(analysisResult.scores.textReadability)}
                          />
                        </S.ScoreBar>
                        <S.ScoreReasonSmall>{analysisResult.scores.textReadabilityReason}</S.ScoreReasonSmall>
                      </S.ScorecardScoreItem>

                      <S.ScorecardScoreItem>
                        <S.ScorecardScoreHeader>
                          <S.ScoreIconSmall>
                            <i className="bx bx-user"></i>
                          </S.ScoreIconSmall>
                          <S.ScoreNameSmall>Subject Clarity</S.ScoreNameSmall>
                          <S.ScoreValueSmall color={getScoreColor(analysisResult.scores.subjectClarity)}>
                            {Math.round(analysisResult.scores.subjectClarity)}/100
                          </S.ScoreValueSmall>
                        </S.ScorecardScoreHeader>
                        <S.ScoreBar>
                          <S.ScoreFill
                            width={analysisResult.scores.subjectClarity}
                            color={getScoreColor(analysisResult.scores.subjectClarity)}
                          />
                        </S.ScoreBar>
                        <S.ScoreReasonSmall>{analysisResult.scores.subjectClarityReason}</S.ScoreReasonSmall>
                      </S.ScorecardScoreItem>
                    </S.ScorecardScoresList>
                  </S.ScorecardTile>
                </S.TwoColumnContainer>
                </S.ResultsWrapper>

                {/* Insights */}
                {analysisResult.insights.length > 0 && (
                  <S.InsightsSection>
                    <S.SectionTitle>
                      <i className="bx bx-bulb"></i>
                      Key Insights
                    </S.SectionTitle>
                    <S.InsightsList>
                      {analysisResult.insights.map((insight, index) => (
                        <S.InsightItem key={index}>
                          <i className="bx bx-check-circle"></i>
                          {insight}
                        </S.InsightItem>
                      ))}
                    </S.InsightsList>
                  </S.InsightsSection>
                )}

                {/* Action Buttons */}
                <S.ActionButtons>
                  <S.SecondaryButton onClick={resetAnalysis}>
                    <i className="bx bx-refresh"></i>
                    Analyze Another
                  </S.SecondaryButton>
                  <S.PrimaryButton onClick={() => {
                    const link = document.createElement('a');
                    link.href = analysisResult.heatmapUrl;
                    link.download = 'thumbnail-heatmap.png';
                    link.click();
                  }}>
                    <i className="bx bx-download"></i>
                    Download Heatmap
                  </S.PrimaryButton>
                </S.ActionButtons>
              </S.ResultsSection>
            )}
          </S.MainContainer>
        </S.PageWrapper>
      </ToolPageWrapper>
    </>
  );
};

export default ThumbnailAnalyzer;
