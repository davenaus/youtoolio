import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../../../../components/SEO';import { toolsSEO, generateToolSchema } from '../../../../config/toolsSEO';
import * as S from './styles';


const ColorPaletteComponent: React.FC = () => {
  const navigate = useNavigate();
  
  // Tool configuration
  const toolConfig = {
    name: 'Color Palette Generator',
    description: 'Extract color palettes from images and generate beautiful gradients',
    image: 'https://64.media.tumblr.com/f97bde423a79533024eef1213555f72b/0e01452f9f6dd974-57/s2048x3072/10d31cb6dce21a536ff44a7638cf80cdb52df36a.jpg',
    icon: 'bx bx-palette',
    features: [
      'Color extraction',
      'Gradient generation',
      'Design inspiration'
    ]
  };
  
  // State declarations
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string>('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [previewColor, setPreviewColor] = useState<string>();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pickerCanvasRef = useRef<HTMLCanvasElement>(null);

  // Utility functions
  const rgbToHex = (r: number, g: number, b: number): string => {
    const componentToHex = (c: number): string => {
      const hex = Math.round(c).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
  };

  // Perceptual color distance (weighted RGB approximation)
  const colorDist = (a: number[], b: number[]): number => {
    const dr = a[0] - b[0], dg = a[1] - b[1], db = a[2] - b[2];
    const rmean = (a[0] + b[0]) / 2;
    return (2 + rmean / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rmean) / 256) * db * db;
  };

  // K-means clustering with k-means++ initialization for accurate palette extraction
  const extractColors = (imageData: Uint8ClampedArray): string[] => {
    const K = 8;
    const MAX_ITER = 15;

    // Sample every 8th pixel for performance
    const pixels: number[][] = [];
    for (let i = 0; i < imageData.length; i += 32) {
      const a = imageData[i + 3];
      if (a < 128) continue; // skip transparent
      pixels.push([imageData[i], imageData[i + 1], imageData[i + 2]]);
    }

    if (pixels.length < K) return pixels.map(p => rgbToHex(p[0], p[1], p[2]));

    // k-means++ initialization (deterministic seed)
    let seed = 42;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) & 0x7fffffff;
      return seed / 0x7fffffff;
    };

    const centroids: number[][] = [[...pixels[Math.floor(rand() * pixels.length)]]];
    for (let i = 1; i < K; i++) {
      const dists = pixels.map(p => Math.min(...centroids.map(c => colorDist(p, c))));
      const total = dists.reduce((s, d) => s + d, 0);
      let r = rand() * total;
      let idx = 0;
      for (let j = 0; j < dists.length; j++) {
        r -= dists[j];
        if (r <= 0) { idx = j; break; }
      }
      centroids.push([...pixels[idx]]);
    }

    // K-means iterations
    const assignments = new Int32Array(pixels.length);
    for (let iter = 0; iter < MAX_ITER; iter++) {
      let changed = false;
      for (let i = 0; i < pixels.length; i++) {
        let best = 0, bestDist = Infinity;
        for (let j = 0; j < K; j++) {
          const d = colorDist(pixels[i], centroids[j]);
          if (d < bestDist) { bestDist = d; best = j; }
        }
        if (assignments[i] !== best) { assignments[i] = best; changed = true; }
      }
      if (!changed) break;

      // Recompute centroids as mean of assigned pixels
      const sums = Array.from({ length: K }, () => [0, 0, 0]);
      const counts = new Int32Array(K);
      for (let i = 0; i < pixels.length; i++) {
        const j = assignments[i];
        sums[j][0] += pixels[i][0];
        sums[j][1] += pixels[i][1];
        sums[j][2] += pixels[i][2];
        counts[j]++;
      }
      for (let j = 0; j < K; j++) {
        if (counts[j] > 0) {
          centroids[j] = [sums[j][0] / counts[j], sums[j][1] / counts[j], sums[j][2] / counts[j]];
        }
      }
    }

    // Sort clusters by size (most dominant color first)
    const counts = new Int32Array(K);
    for (let i = 0; i < pixels.length; i++) counts[assignments[i]]++;

    return centroids
      .map((c, i) => ({ hex: rgbToHex(Math.round(c[0]), Math.round(c[1]), Math.round(c[2])), count: counts[i] }))
      .filter(c => c.count > 0)
      .sort((a, b) => b.count - a.count)
      .map(c => c.hex);
  };

  // Image processing
  const processImage = useCallback((dataUrl: string) => {
    setIsLoading(true);
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const maxDim = 600;
      let width = img.width;
      let height = img.height;
      
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      const imageData = ctx.getImageData(0, 0, width, height).data;
      const colors = extractColors(imageData);
      setExtractedColors(colors);
      setIsLoading(false);
    };
    img.src = dataUrl;
  }, []);

  // File handling
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImagePreview(dataUrl);
      processImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (file) {
    // Reset all state when a new image is selected
    setExtractedColors([]);
    setImagePreview('');
    setCopyFeedback('');
    setShowColorPicker(false);
    setPreviewColor(undefined);
    
    // Process the new file
    handleFileUpload(file);
  }
};

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileUpload(file);
      e.dataTransfer.clearData();
    }
  }, []);

  // Color picker handlers for image
  const handleImageMouseMove = useCallback((e: React.MouseEvent<HTMLImageElement>) => {
    const canvas = pickerCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setMousePos({ x: e.clientX, y: e.clientY });

    const img = e.currentTarget;
    const rect = img.getBoundingClientRect();

    // Account for object-fit: contain letterboxing
    const naturalAspect = img.naturalWidth / img.naturalHeight;
    const displayAspect = rect.width / rect.height;

    let renderedW: number, renderedH: number, offsetX: number, offsetY: number;
    if (naturalAspect > displayAspect) {
      renderedW = rect.width;
      renderedH = rect.width / naturalAspect;
      offsetX = 0;
      offsetY = (rect.height - renderedH) / 2;
    } else {
      renderedH = rect.height;
      renderedW = rect.height * naturalAspect;
      offsetX = (rect.width - renderedW) / 2;
      offsetY = 0;
    }

    const localX = e.clientX - rect.left - offsetX;
    const localY = e.clientY - rect.top - offsetY;

    if (localX < 0 || localY < 0 || localX > renderedW || localY > renderedH) {
      setPreviewColor(undefined);
      return;
    }

    const pixelX = Math.floor((localX / renderedW) * img.naturalWidth);
    const pixelY = Math.floor((localY / renderedH) * img.naturalHeight);

    try {
      const pixelData = ctx.getImageData(pixelX, pixelY, 1, 1).data;
      setPreviewColor(rgbToHex(pixelData[0], pixelData[1], pixelData[2]));
    } catch (error) {
      console.error('Error getting pixel data:', error);
    }
  }, []);

  const handleImageColorPick = useCallback((e: React.MouseEvent<HTMLImageElement>) => {
    if (previewColor) {
      setExtractedColors([...extractedColors, previewColor]);
      setShowColorPicker(false);
    }
  }, [previewColor, extractedColors]);

  const handleImageMouseLeave = useCallback(() => {
    setPreviewColor(undefined);
  }, []);

  // Color management functions
  const copyColor = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopyFeedback(color);
      setTimeout(() => setCopyFeedback(''), 2000);
    } catch (error) {
      console.error('Failed to copy color:', error);
    }
  };

  const removeColor = (index: number) => {
    setExtractedColors(extractedColors.filter((_, i) => i !== index));
  };

  const addCustomColor = () => {
    if (!imagePreview) {
      const color = prompt('Enter a hex color (e.g., #FF5733):');
      if (color && /^#[0-9A-F]{6}$/i.test(color)) {
        setExtractedColors([...extractedColors, color.toUpperCase()]);
      } else if (color) {
        alert('Please enter a valid hex color code (e.g., #FF5733)');
      }
    } else {
      // Open color picker mode for the uploaded image
      setShowColorPicker(true);
    }
  };

  const shuffleColors = () => {
    const shuffled = [...extractedColors];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setExtractedColors(shuffled);
  };

  const resetAll = () => {
    setExtractedColors([]);
    setImagePreview('');
    setCopyFeedback('');
  };

  // Export functions
  const exportPalette = () => {
    if (extractedColors.length === 0) {
      alert('No colors to export. Please upload an image first.');
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = 1920;
    const height = 1080;
    canvas.width = width;
    canvas.height = height;
    
    // Background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);
    
    // Calculate layout
    const swatchSize = 120;
    const spacing = 20;
    const cols = Math.min(extractedColors.length, 6);
    const rows = Math.ceil(extractedColors.length / cols);
    
    const totalWidth = cols * swatchSize + (cols - 1) * spacing;
    const totalHeight = rows * swatchSize + (rows - 1) * spacing;
    
    const startX = (width - totalWidth) / 2;
    const startY = (height - totalHeight) / 2 - 50;
    
    // Draw colors
    extractedColors.forEach((color, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      const x = startX + col * (swatchSize + spacing);
      const y = startY + row * (swatchSize + spacing);
      
      // Color swatch
      ctx.fillStyle = color;
      ctx.fillRect(x, y, swatchSize, swatchSize);
      
      // Color text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(color, x + swatchSize / 2, y + swatchSize + 25);
    });
    
    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Color Palette', width / 2, 80);
    
    const link = document.createElement('a');
    link.download = 'color-palette.png';
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportCSS = () => {
    const lines = extractedColors.map((color, i) => `  --color-${i + 1}: ${color};`);
    const css = `:root {\n${lines.join('\n')}\n}\n`;
    const blob = new Blob([css], { type: 'text/css' });
    const link = document.createElement('a');
    link.download = 'palette.css';
    link.href = URL.createObjectURL(blob);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const exportJSON = () => {
    const json = JSON.stringify(extractedColors, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.download = 'palette.json';
    link.href = URL.createObjectURL(blob);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const copyAllHex = async () => {
    try {
      await navigator.clipboard.writeText(extractedColors.join(', '));
      setCopyFeedback('__all__');
      setTimeout(() => setCopyFeedback(''), 2000);
    } catch (error) {
      console.error('Failed to copy colors:', error);
    }
  };

  const seoConfig = toolsSEO['color-palette'];
  const schemaData = generateToolSchema('color-palette', seoConfig);

  return (
    <>
      <SEO
        title={seoConfig.title}
        description={seoConfig.description}
        keywords={seoConfig.keywords}
        canonical="https://youtool.io/tools/color-palette"
        schemaData={schemaData}
      />
      <S.PageWrapper>
      <S.MainContainer>
        <S.BackButton onClick={() => navigate('/tools')}>
          <i className="bx bx-arrow-back"></i>
          Back to Tools
        </S.BackButton>

        {/* Enhanced Header Section */}
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

        {/* Step 1: Upload */}
        {!imagePreview && (
          <S.UploadSection>
            <S.StepIndicator>
              <S.StepNumber>1</S.StepNumber>
              <S.StepTitle>Upload Your Image</S.StepTitle>
            </S.StepIndicator>

            <S.UploadContainer
              $isDragging={isDragging}
              onDragEnter={handleDragIn}
              onDragLeave={handleDragOut}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <S.UploadContent>
                <S.UploadIcon className="bx bx-cloud-upload"></S.UploadIcon>
                <S.UploadTitle>
                  {isDragging ? 'Drop your image here!' : 'Choose or Drop an Image'}
                </S.UploadTitle>
                <S.UploadText>
                  Upload any image to extract its color palette
                </S.UploadText>

                <S.UploadActions>
                  <S.UploadButton onClick={handleChooseFile}>
                    <i className="bx bx-image-add"></i>
                    Choose Image
                  </S.UploadButton>
                  <S.UploadHint>or drag and drop</S.UploadHint>
                </S.UploadActions>

                <S.SupportedFormats>
                  Supports: JPG, PNG, GIF, WebP, BMP
                </S.SupportedFormats>
              </S.UploadContent>
            </S.UploadContainer>

            <S.FileInput
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
            />
          </S.UploadSection>
        )}



        {/* Step 2: Processing */}
        {imagePreview && isLoading && (
          <S.ProcessingSection>
            <S.StepIndicator>
              <S.StepNumber>2</S.StepNumber>
              <S.StepTitle>Extracting Colors</S.StepTitle>
            </S.StepIndicator>
            
            <S.ImagePreviewCard>
              <S.ImagePreview src={imagePreview} alt="Uploaded image" />
              <S.ProcessingOverlay>
                <S.LoadingSpinner className='bx bx-loader-alt bx-spin'></S.LoadingSpinner>
                <S.ProcessingText>Analyzing image colors...</S.ProcessingText>
              </S.ProcessingOverlay>
            </S.ImagePreviewCard>
          </S.ProcessingSection>
        )}

        {/* Step 3: Results */}
        {extractedColors.length > 0 && !isLoading && (
          <S.ResultsSection>
            <S.StepIndicator>
              <S.StepNumber>3</S.StepNumber>
              <S.StepTitle>Your Color Palette</S.StepTitle>
            </S.StepIndicator>

            {/* Image Preview */}
            <S.ImageResultCard>
              <S.ImagePreview src={imagePreview} alt="Source image" />
<S.ImageActions>
  <S.ActionButton onClick={() => window.location.reload()}>
    <i className="bx bx-image"></i>
    Try Different Image
  </S.ActionButton>
</S.ImageActions>
            </S.ImageResultCard>

            {/* Color Palette */}
            <S.PaletteCard>
              <S.PaletteHeader>
                <S.PaletteTitle>
                  <i className="bx bx-palette"></i>
                  Extracted Colors ({extractedColors.length})
                </S.PaletteTitle>
                <S.PaletteActions>
                  <S.ActionButton onClick={addCustomColor}>
                    <i className="bx bx-plus"></i>
                    {imagePreview ? 'Pick from Image' : 'Add Color'}
                  </S.ActionButton>
                  <S.ActionButton onClick={shuffleColors}>
                    <i className="bx bx-shuffle"></i>
                    Shuffle
                  </S.ActionButton>
                </S.PaletteActions>
              </S.PaletteHeader>
              
              <S.ColorsGrid>
                {extractedColors.map((color, index) => (
                  <S.ColorCard 
                    key={`${color}-${index}`}
                    $color={color}
                    onClick={() => copyColor(color)}
                    title={`Click to copy ${color}`}
                  >
                    <S.ColorSwatchPreview $color={color} />
                    <S.ColorCode>{color}</S.ColorCode>
                    <S.CopyIndicator $show={copyFeedback === color}>
                      Copied!
                    </S.CopyIndicator>
                    <S.ColorActions>
                      <S.RemoveButton onClick={(e) => {
                        e.stopPropagation();
                        removeColor(index);
                      }}>
                        <i className="bx bx-x"></i>
                      </S.RemoveButton>
                    </S.ColorActions>
                  </S.ColorCard>
                ))}
              </S.ColorsGrid>
            </S.PaletteCard>

            {/* Export Actions */}
            <S.ExportCard>
              <S.ExportTitle>Export Your Palette</S.ExportTitle>
              <S.ExportActions>
                <S.ExportButton onClick={exportPalette}>
                  <i className="bx bx-image"></i>
                  <div>
                    <div>Download PNG</div>
                    <S.ExportSubtext>High-res swatch card with hex codes</S.ExportSubtext>
                  </div>
                </S.ExportButton>

                <S.ExportButton onClick={exportCSS}>
                  <i className="bx bx-code-alt"></i>
                  <div>
                    <div>Download CSS</div>
                    <S.ExportSubtext>CSS custom properties (--color-1…)</S.ExportSubtext>
                  </div>
                </S.ExportButton>

                <S.ExportButton onClick={exportJSON}>
                  <i className="bx bx-file"></i>
                  <div>
                    <div>Download JSON</div>
                    <S.ExportSubtext>Hex array for design tools &amp; APIs</S.ExportSubtext>
                  </div>
                </S.ExportButton>

                <S.ExportButton onClick={copyAllHex}>
                  <i className={`bx ${copyFeedback === '__all__' ? 'bx-check' : 'bx-copy'}`}></i>
                  <div>
                    <div>{copyFeedback === '__all__' ? 'Copied!' : 'Copy All Hex'}</div>
                    <S.ExportSubtext>All codes as a comma-separated list</S.ExportSubtext>
                  </div>
                </S.ExportButton>
              </S.ExportActions>

              <S.ExportResetRow>
                <S.ExportButton onClick={resetAll} $variant="secondary">
                  <i className="bx bx-reset"></i>
                  <div>
                    <div>Start Over</div>
                    <S.ExportSubtext>Upload a new image</S.ExportSubtext>
                  </div>
                </S.ExportButton>
              </S.ExportResetRow>
            </S.ExportCard>
          </S.ResultsSection>
        )}
        {/* Educational Content */}
        {!imagePreview && (
          <S.EducationalSection>

            <S.EducationalContent>
              <S.SectionSubTitle>What This Tool Does</S.SectionSubTitle>
              <S.EducationalText>
                The Color Palette Extractor analyzes any image you upload and identifies the dominant colors, presenting them as a clean, copyable palette with hex codes, RGB values, and HSL values. Upload a thumbnail, brand photo, logo, or any visual asset and instantly extract the exact colors used.
              </S.EducationalText>
              <S.EducationalText>
                For YouTube creators, color consistency is a critical part of channel branding. When your thumbnails, channel art, and video graphics all share the same color palette, your channel looks cohesive and professional — which builds viewer recognition and trust over time.
              </S.EducationalText>
            </S.EducationalContent>

            <S.EducationalContent>
              <S.SectionSubTitle>How to Use the Color Palette Extractor</S.SectionSubTitle>
              <S.StepByStep>
                <S.StepItem>
                  <S.StepNumberCircle>1</S.StepNumberCircle>
                  <S.StepContent>
                    <S.StepTitle>Upload an Image</S.StepTitle>
                    <S.EducationalText>
                      Drag and drop any image onto the upload area, or click to browse your files. The tool accepts JPEG, PNG, WebP, and most common image formats. You can upload a thumbnail from a top-performing video in your niche, your channel banner, a competitor's thumbnail, or any image whose color scheme you want to replicate.
                    </S.EducationalText>
                  </S.StepContent>
                </S.StepItem>
                <S.StepItem>
                  <S.StepNumberCircle>2</S.StepNumberCircle>
                  <S.StepContent>
                    <S.StepTitle>Review the Extracted Palette</S.StepTitle>
                    <S.EducationalText>
                      The tool extracts the most dominant colors from the image and displays them as color swatches. Each color shows its hex code (for web use), RGB values (for design tools), and a visual swatch. Colors are sorted by dominance — the most prevalent colors in the image appear first.
                    </S.EducationalText>
                  </S.StepContent>
                </S.StepItem>
                <S.StepItem>
                  <S.StepNumberCircle>3</S.StepNumberCircle>
                  <S.StepContent>
                    <S.StepTitle>Copy and Apply Your Colors</S.StepTitle>
                    <S.EducationalText>
                      Click any color swatch to copy its hex code to your clipboard. Paste these codes directly into Canva, Photoshop, Figma, or any design tool to instantly match the color palette in your own thumbnails and graphics.
                    </S.EducationalText>
                  </S.StepContent>
                </S.StepItem>
              </S.StepByStep>
            </S.EducationalContent>

            <S.EducationalContent>
              <S.SectionSubTitle>How to Use Color Palettes for YouTube Branding</S.SectionSubTitle>
              <S.FeatureList>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Extract from your best-performing thumbnail:</strong> Upload the thumbnail from your most-viewed video and extract its palette. This is likely the color combination that resonates most with your audience — use it as the baseline for all future thumbnails.</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Analyze competitor thumbnails:</strong> Download thumbnails from the top-performing videos in your niche using the Thumbnail Downloader tool, then extract their palettes here. Understanding what colors dominate in your niche helps you design thumbnails that both fit the category and stand out from competitors.</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Build a consistent brand kit:</strong> Extract colors from your logo, channel banner, and profile picture to identify which colors consistently appear across your existing assets. Use these as your official brand colors so all future graphics stay visually coherent.</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Find complementary accent colors:</strong> The extracted palette will reveal secondary and tertiary colors used alongside the dominant ones. These accent colors are often ideal for text overlays, borders, or graphic elements that need to pop against your primary thumbnail background.</span>
                </S.FeatureListItem>
              </S.FeatureList>
            </S.EducationalContent>

            <S.EducationalContent>
              <S.SectionSubTitle>Frequently Asked Questions</S.SectionSubTitle>
              <S.FeatureList>
                <S.FeatureListItem>
                  <i className="bx bx-help-circle"></i>
                  <span><strong>How many colors does the tool extract?</strong> The tool extracts the top 6–10 most dominant colors from the image. Very complex images with many gradients may show more variations, while simple graphics with flat colors will show a smaller palette that precisely matches the original design.</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-help-circle"></i>
                  <span><strong>Is my image uploaded to any server?</strong> No. All color extraction happens locally in your browser using the HTML5 Canvas API. Your images are never transmitted to any server or stored anywhere outside your device.</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-help-circle"></i>
                  <span><strong>What format should I enter in Canva or Photoshop?</strong> Use the hex code format (e.g., #FF5733) for most design tools. Canva, Photoshop, Figma, and Illustrator all accept hex codes in their color picker dialogs. For CSS or web work, use either hex or the RGB values provided.</span>
                </S.FeatureListItem>
              </S.FeatureList>
            </S.EducationalContent>

            <S.EducationalContent>
              <S.SectionSubTitle>Related Tools</S.SectionSubTitle>
              <S.FeatureList>
                <S.FeatureListItem>
                  <i className="bx bx-link"></i>
                  <span><a href="/tools/color-picker-from-image"><strong>Color Picker From Image</strong></a> — Click anywhere on an image to pick an exact color at the pixel level, giving you precise control over color selection.</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-link"></i>
                  <span><a href="/tools/thumbnail-downloader"><strong>Thumbnail Downloader</strong></a> — Download thumbnails from any YouTube video to analyze their color palettes.</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-link"></i>
                  <span><a href="/tools/thumbnail-tester"><strong>Thumbnail Tester</strong></a> — After extracting colors and designing a new thumbnail, test it against trending videos to see if it stands out.</span>
                </S.FeatureListItem>
              </S.FeatureList>
            </S.EducationalContent>

          </S.EducationalSection>
        )}

        {/* Hidden canvases for processing and color picking */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <canvas ref={pickerCanvasRef} style={{ display: 'none' }} />

        {/* Color Picker Modal */}
        {showColorPicker && imagePreview && (
          <S.ColorPickerModal onClick={() => setShowColorPicker(false)}>
            <S.ColorPickerContent onClick={e => e.stopPropagation()}>
              <S.ModalHeader>
                <S.ModalTitle>Pick Color from Image</S.ModalTitle>
                <S.CloseButton onClick={() => setShowColorPicker(false)}>
                  <i className="bx bx-x"></i>
                </S.CloseButton>
              </S.ModalHeader>
              
              <S.PickerInstructions>
                <i className="bx bx-mouse"></i>
                Move your mouse over the image and click to pick a color
              </S.PickerInstructions>
              
              <S.ImagePickerContainer>
                <img 
                  src={imagePreview} 
                  alt="Color picker"
                  style={{
                    width: '100%',
                    height: 'auto',
                    cursor: 'crosshair',
                    borderRadius: '8px',
                    maxHeight: '600px',
                    objectFit: 'contain'
                  }}
                  onMouseMove={handleImageMouseMove}
                  onMouseLeave={handleImageMouseLeave}
                  onClick={handleImageColorPick}
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    const canvas = pickerCanvasRef.current;
                    if (!canvas) return;
                    
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return;
                    
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                    
                    try {
                      ctx.drawImage(img, 0, 0);
                    } catch (error) {
                      console.error('Error drawing image:', error);
                    }
                  }}
                />
                <S.EyedropperPreview 
                  $color={previewColor} 
                  $x={mousePos.x} 
                  $y={mousePos.y}
                />
              </S.ImagePickerContainer>

              {previewColor && (
                <S.PreviewColorDisplay>
                  <S.PreviewSwatch $color={previewColor} />
                  <S.PreviewColorCode>{previewColor}</S.PreviewColorCode>
                </S.PreviewColorDisplay>
              )}
            </S.ColorPickerContent>
          </S.ColorPickerModal>
        )}
      </S.MainContainer>
    </S.PageWrapper>
    </>
  );
};

export const ColorPalette = ColorPaletteComponent;
export default ColorPalette;