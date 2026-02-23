import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../../../../components/SEO';
import { GoogleAd } from '../../../../components/GoogleAd';
import { toolsSEO, generateToolSchema } from '../../../../config/toolsSEO';
import * as S from './styles';

interface Color {
  hex: string;
  r: number;
  g: number;
  b: number;
  count: number;
}

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
  const [gradientSeed, setGradientSeed] = useState(1);
  const [copyFeedback, setCopyFeedback] = useState<string>('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [previewColor, setPreviewColor] = useState<string>();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gradientCanvasRef = useRef<HTMLCanvasElement>(null);
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

  const calculateColorDistance = (r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number => {
    const rmean = (r1 + r2) / 2;
    const dr = r1 - r2;
    const dg = g1 - g2;
    const db = b1 - b2;
    return Math.sqrt(
      (2 + rmean/256) * dr**2 +
      4 * dg**2 +
      (2 + (255-rmean)/256) * db**2
    );
  };

  const extractColors = (imageData: Uint8ClampedArray): string[] => {
    const colorBuckets = new Map<string, Color>();
    const BUCKET_SIZE = 24;
    
    for (let i = 0; i < imageData.length; i += 4) {
      const r = Math.floor(imageData[i] / BUCKET_SIZE) * BUCKET_SIZE;
      const g = Math.floor(imageData[i + 1] / BUCKET_SIZE) * BUCKET_SIZE;
      const b = Math.floor(imageData[i + 2] / BUCKET_SIZE) * BUCKET_SIZE;
      
      const brightness = (r + g + b) / 3;
      if (brightness < 20 || brightness > 235) continue;
      
      const key = `${r},${g},${b}`;
      if (!colorBuckets.has(key)) {
        colorBuckets.set(key, {
          hex: rgbToHex(imageData[i], imageData[i + 1], imageData[i + 2]),
          r: imageData[i],
          g: imageData[i + 1],
          b: imageData[i + 2],
          count: 0
        });
      }
      colorBuckets.get(key)!.count++;
    }
    
    const sortedColors = Array.from(colorBuckets.values())
      .sort((a, b) => b.count - a.count);
    
    const distinctColors: Color[] = [];
    for (const color of sortedColors) {
      if (distinctColors.length >= 8) break;
      
      const isDifferentEnough = distinctColors.every(selected => {
        const deltaE = calculateColorDistance(
          color.r, color.g, color.b,
          selected.r, selected.g, selected.b
        );
        return deltaE > 30;
      });
      
      if (isDifferentEnough) {
        distinctColors.push(color);
      }
    }
    
    return distinctColors.map(color => color.hex);
  };

  // Gradient functions
  const seededRandom = (seed: number) => {
    return () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
  };

  const shuffleArray = (array: string[], seed: number): string[] => {
    const random = seededRandom(seed);
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const generateGradient = useCallback((currentColors: string[] = extractedColors) => {
    const validColors = (currentColors || [])
      .filter((color): color is string => 
        typeof color === 'string' && 
        color.startsWith('#') && 
        color.length === 7
      );

    if (validColors.length < 2) return;

    const canvas = gradientCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);

    const shuffledColors = shuffleArray([...validColors], gradientSeed);
    const angle = 45 * (Math.PI / 180);
    
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    
    shuffledColors.forEach((color, index) => {
      if (typeof color === 'string' && color.startsWith('#')) {
        const position = index / (shuffledColors.length - 1);
        gradient.addColorStop(position, color);
      }
    });
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    const gradientDataUrl = canvas.toDataURL('image/png');
    
    requestAnimationFrame(() => {
      const gradientPreview = document.querySelector<HTMLDivElement>('.gradient-preview');
      if (gradientPreview) {
        gradientPreview.style.backgroundImage = `url(${gradientDataUrl})`;
      }
    });
  }, [extractedColors, gradientSeed]);

  React.useEffect(() => {
    if (extractedColors.length >= 2) {
      generateGradient();
    }
  }, [extractedColors, gradientSeed, generateGradient]);

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
      generateGradient(colors);
    };
    img.src = dataUrl;
  }, [generateGradient]);

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
    setGradientSeed(1);
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

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    setMousePos({ x, y });

    const scaleX = e.currentTarget.naturalWidth / rect.width;
    const scaleY = e.currentTarget.naturalHeight / rect.height;

    const pixelX = Math.floor((e.clientX - rect.left) * scaleX);
    const pixelY = Math.floor((e.clientY - rect.top) * scaleY);

    try {
      const pixelData = ctx.getImageData(pixelX, pixelY, 1, 1).data;
      const color = rgbToHex(pixelData[0], pixelData[1], pixelData[2]);
      setPreviewColor(color);
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
    const newColors = extractedColors.filter((_, i) => i !== index);
    setExtractedColors(newColors);
    generateGradient(newColors);
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
    setGradientSeed(1);
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

  const downloadGradient = () => {
    if (extractedColors.length < 2) {
      alert('Please add at least 2 colors to generate a gradient');
      return;
    }
    
    const canvas = gradientCanvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `gradient-${gradientSeed}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

        {/* Google Ad Spot */}
        <GoogleAd adSlot="1234567890" />

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
                    <S.ColorActions>
                      <S.CopyIndicator $show={copyFeedback === color}>
                        Copied!
                      </S.CopyIndicator>
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

            {/* Gradient Section */}
            {extractedColors.length >= 2 && (
              <S.GradientCard>
                <S.GradientHeader>
                  <S.GradientTitle>
                    <i className="bx bx-color-fill"></i>
                    Generated Gradient
                  </S.GradientTitle>
                  <S.GradientControls>
                    <S.SeedControl>
                      <S.SeedLabel>Variation:</S.SeedLabel>
                      <S.SeedInput
                        type="number"
                        value={gradientSeed}
                        onChange={(e) => setGradientSeed(parseInt(e.target.value) || 1)}
                        min={1}
                        max={100}
                      />
                    </S.SeedControl>
                  </S.GradientControls>
                </S.GradientHeader>
                
                <S.GradientPreview 
                  className="gradient-preview"
                  onClick={downloadGradient}
                  style={{ cursor: 'pointer' }}
                >
                  <canvas
                    ref={gradientCanvasRef}
                    width={3840}
                    height={2160}
                    style={{ display: 'none' }}
                  />
                  <S.GradientDownloadHint>
                    Download 4K Version
                  </S.GradientDownloadHint>
                </S.GradientPreview>
              </S.GradientCard>
            )}

            {/* Export Actions */}
            <S.ExportCard>
              <S.ExportTitle>Export Your Work</S.ExportTitle>
              <S.ExportActions>
                <S.ExportButton onClick={exportPalette}>
                  <i className="bx bx-download"></i>
                  <div>
                    <div>Download Palette</div>
                    <S.ExportSubtext>High-res PNG with color codes</S.ExportSubtext>
                  </div>
                </S.ExportButton>
                
                {extractedColors.length >= 2 && (
                  <S.ExportButton onClick={downloadGradient}>
                    <i className="bx bx-color-fill"></i>
                    <div>
                      <div>Download Gradient</div>
                      <S.ExportSubtext>4K resolution background</S.ExportSubtext>
                    </div>
                  </S.ExportButton>
                )}
                
                <S.ExportButton onClick={resetAll} $variant="secondary">
                  <i className="bx bx-reset"></i>
                  <div>
                    <div>Start Over</div>
                    <S.ExportSubtext>Upload a new image</S.ExportSubtext>
                  </div>
                </S.ExportButton>
              </S.ExportActions>
            </S.ExportCard>
          </S.ResultsSection>
        )}

        

        {/* Hidden canvas for processing */}
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
                    maxHeight: '400px',
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