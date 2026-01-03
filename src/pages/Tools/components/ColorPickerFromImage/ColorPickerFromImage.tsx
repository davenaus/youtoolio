// src/pages/Tools/components/ColorPickerFromImage/ColorPickerFromImage.tsx
import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../../../../components/SEO';
import { GoogleAd } from '../../../../components/GoogleAd';
import { toolsSEO, generateToolSchema } from '../../../../config/toolsSEO';
import * as S from './styles';


const ColorPickerFromImage: React.FC = () => {
  const navigate = useNavigate();

  // State declarations
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string>('');
  const [pickedColors, setPickedColors] = useState<string[]>([]);
  const [previewColor, setPreviewColor] = useState<string>();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);

  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUrlUpload = async () => {
    if (!imageUrl) return;

    setIsLoading(true);
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'image-from-url', { type: blob.type });
      handleFileUpload(file);
    } catch (error) {
      alert('Failed to fetch image. Please check the URL.');
      console.error(error);
    }
    setIsLoading(false);
  };

  const toolConfig = {
    name: 'Color Picker from Image',
    description: 'Upload or paste any image and click anywhere to instantly copy the hex color.',
    icon: 'bx bxs-eyedropper',
    image: 'https://64.media.tumblr.com/f55e2ae2e5b16799fd5889c64b3fe36b/0e01452f9f6dd974-0e/s2048x3072/09051a8561ff4ab1cc8a5fa3b4b3d81f8a3a720d.jpg',
    features: [
      'Drag & Drop Image Support',
      'Hover to Preview Colors',
      'Supports JPG, PNG, GIF, WebP'
    ]
  };


  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Utility functions
  const rgbToHex = (r: number, g: number, b: number): string => {
    const componentToHex = (c: number): string => {
      const hex = Math.round(c).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
  };

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
      setIsActive(true);
      setPickedColors([]);
      setupCanvas(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const setupCanvas = (dataUrl: string) => {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
    };
    img.src = dataUrl;
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
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

  // Color picker handlers
  const handleImageMouseMove = useCallback((e: React.MouseEvent<HTMLImageElement>) => {
    if (!isActive) return;

    const canvas = canvasRef.current;
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
  }, [isActive]);

  const handleImageClick = useCallback(async (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isActive || !previewColor) return;

    try {
      await navigator.clipboard.writeText(previewColor);
      setCopyFeedback(previewColor);
      setPickedColors(prev => [previewColor, ...prev.filter(c => c !== previewColor)].slice(0, 10));
      setTimeout(() => setCopyFeedback(''), 2000);
    } catch (error) {
      console.error('Failed to copy color:', error);
      alert('Failed to copy color to clipboard');
    }
  }, [isActive, previewColor]);

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

  const clearHistory = () => {
    setPickedColors([]);
  };

  const resetAll = () => {
    setImagePreview('');
    setPickedColors([]);
    setPreviewColor(undefined);
    setIsActive(false);
    setCopyFeedback('');
  };

  // Paste from clipboard
  const handlePasteFromClipboard = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith('image/')) {
            const blob = await clipboardItem.getType(type);
            const file = new File([blob], 'pasted-image', { type });
            handleFileUpload(file);
            return;
          }
        }
      }
      alert('No image found in clipboard');
    } catch (error) {
      console.error('Failed to paste from clipboard:', error);
      alert('Failed to paste from clipboard. Please use the file upload instead.');
    }
  };

  const seoConfig = toolsSEO['color-picker-from-image'];
  const schemaData = generateToolSchema('color-picker-from-image', seoConfig);


  return (
    <>
      <SEO
        title={seoConfig.title}
        description={seoConfig.description}
        keywords={seoConfig.keywords}
        canonical="https://youtool.io/tools/color-picker-from-image"
        schemaData={schemaData}
      />

      <S.PageWrapper>
      <S.MainContainer>
        <S.BackButton onClick={() => navigate('/tools')}>
          <i className="bx bx-arrow-back"></i>
          Back to Tools
        </S.BackButton>

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

              {/* Integrated Search Bar */}
              <S.HeaderSearchContainer>
              </S.HeaderSearchContainer>
            </S.HeaderTextContent>
          </S.HeaderContent>
        </S.EnhancedHeader>

        {/* Google Ad Spot */}
        <GoogleAd adSlot="1234567890" />

        {/* Upload Section */}
        {!imagePreview && (
          <S.UploadSection>
            <S.StepIndicator>
              <S.StepNumber>1</S.StepNumber>
              <S.StepTitle>Upload or Paste Your Image</S.StepTitle>
            </S.StepIndicator>

            <S.UploadContainer
              $isDragging={isDragging}
              onDragEnter={handleDragIn}
              onDragLeave={handleDragOut}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <S.UploadContent>
                <S.UploadIcon className="bx bx-eyedropper"></S.UploadIcon>
                <S.UploadTitle>
                  {isDragging ? 'Drop your image here!' : 'Choose, Drop, or Paste an Image'}
                </S.UploadTitle>
                <S.UploadText>
                  Upload any image to start picking colors with precision
                </S.UploadText>

                <S.UploadActions>
                  <S.UploadButton onClick={handleChooseFile}>
                    <i className="bx bx-image-add"></i>
                    Choose Image
                  </S.UploadButton>
                  <S.UploadButton onClick={handlePasteFromClipboard} $variant="secondary">
                    <i className="bx bx-paste"></i>
                    Paste from Clipboard
                  </S.UploadButton>
                </S.UploadActions>

                <S.UploadHint>or drag and drop</S.UploadHint>

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


        {/* Educational Content Section */}
        {!imagePreview && (
          <S.EducationalSection>
            <S.EducationalContent>
              <S.SectionSubTitle>How to Use the Color Picker</S.SectionSubTitle>

              <S.EducationalText>
                Our Color Picker tool allows you to extract exact color values from any image with pixel-perfect
                precision. Simply upload an image, hover to preview colors, and click to copy hex codes instantly.
                Perfect for designers, developers, and artists who need precise color matching and extraction.
              </S.EducationalText>

              <S.StepByStep>
                <S.StepItem>
                  <S.StepNumberCircle>1</S.StepNumberCircle>
                  <S.StepContent>
                    <S.StepTitle>Upload Your Image</S.StepTitle>
                    <S.EducationalText>
                      Upload any image file (JPG, PNG, GIF, WebP, BMP) using drag-and-drop, file chooser,
                      or paste directly from your clipboard. The tool maintains original image quality
                      for accurate color sampling across all pixels.
                    </S.EducationalText>
                  </S.StepContent>
                </S.StepItem>

                <S.StepItem>
                  <S.StepNumberCircle>2</S.StepNumberCircle>
                  <S.StepContent>
                    <S.StepTitle>Preview & Pick Colors</S.StepTitle>
                    <S.EducationalText>
                      Move your mouse over any part of the image to see a live preview of the color
                      value. The preview cursor shows both the color swatch and corresponding hex code
                      in real-time as you explore different areas of your image.
                    </S.EducationalText>
                  </S.StepContent>
                </S.StepItem>

                <S.StepItem>
                  <S.StepNumberCircle>3</S.StepNumberCircle>
                  <S.StepContent>
                    <S.StepTitle>Copy & Save Colors</S.StepTitle>
                    <S.EducationalText>
                      Click anywhere on the image to instantly copy the hex color code to your clipboard.
                      All picked colors are automatically saved to your history for easy access and
                      comparison throughout your design workflow.
                    </S.EducationalText>
                  </S.StepContent>
                </S.StepItem>
              </S.StepByStep>
            </S.EducationalContent>

            <S.EducationalContent>
              <S.SectionSubTitle>Precision Color Extraction</S.SectionSubTitle>

              <S.FeatureList>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Pixel-Perfect Accuracy:</strong> Extract exact RGB values from any pixel in your image</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Live Color Preview:</strong> See color values in real-time as you hover over the image</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Instant Clipboard Copy:</strong> One-click copying of hex codes for immediate use</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Color History:</strong> Automatic saving of picked colors for easy comparison and reuse</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Multiple Input Methods:</strong> Upload, drag-drop, or paste images directly from clipboard</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Universal Format Support:</strong> Works with all common image formats and sizes</span>
                </S.FeatureListItem>
              </S.FeatureList>

              <S.EducationalText>
                Essential for web developers needing exact color matches, graphic designers extracting brand
                colors from references, and digital artists seeking color inspiration from photographs.
                The tool preserves image quality and provides professional-grade color accuracy for all
                your creative and technical projects.
              </S.EducationalText>
            </S.EducationalContent>
          </S.EducationalSection>
        )}


        {/* Color Picker Interface */}
        {imagePreview && (
          <S.PickerSection>
            <S.StepIndicator>
              <S.StepNumber>2</S.StepNumber>
              <S.StepTitle>Click Anywhere to Pick Colors</S.StepTitle>
            </S.StepIndicator>

            <S.PickerInstructions>
              <S.InstructionItem>
                <i className="bx bx-mouse"></i>
                <span>Hover over the image to preview colors</span>
              </S.InstructionItem>
              <S.InstructionItem>
                <i className="bx bx-mouse-alt"></i>
                <span>Click to copy the hex code to your clipboard</span>
              </S.InstructionItem>
              <S.InstructionItem>
                <i className="bx bx-copy"></i>
                <span>Colors are automatically saved to your history</span>
              </S.InstructionItem>
            </S.PickerInstructions>

            <S.ImageContainer>
              <S.ImageWrapper>
                <S.PickerImage
                  src={imagePreview}
                  alt="Color picker source"
                  onMouseMove={handleImageMouseMove}
                  onMouseLeave={handleImageMouseLeave}
                  onClick={handleImageClick}
                />

                {/* Color Preview Cursor */}
                {previewColor && isActive && (
                  <S.ColorPreviewCursor
                    $color={previewColor}
                    $x={mousePos.x}
                    $y={mousePos.y}
                  >
                    <S.ColorPreviewSwatch $color={previewColor} />
                    <S.ColorPreviewCode>{previewColor}</S.ColorPreviewCode>
                  </S.ColorPreviewCursor>
                )}

                {/* Copy Feedback */}
                {copyFeedback && (
                  <S.CopyFeedback>
                    <i className="bx bx-check-circle"></i>
                    Copied {copyFeedback} to clipboard!
                  </S.CopyFeedback>
                )}
              </S.ImageWrapper>

              <S.ImageActions>
                <S.ActionButton onClick={resetAll}>
                  <i className="bx bx-image"></i>
                  Try Different Image
                </S.ActionButton>
              </S.ImageActions>
            </S.ImageContainer>

            {/* Color History */}
            {pickedColors.length > 0 && (
              <S.ColorHistory>
                <S.HistoryHeader>
                  <S.HistoryTitle>
                    <i className="bx bx-history"></i>
                    Recently Picked Colors ({pickedColors.length})
                  </S.HistoryTitle>
                  <S.ClearHistoryButton onClick={clearHistory}>
                    <i className="bx bx-trash"></i>
                    Clear History
                  </S.ClearHistoryButton>
                </S.HistoryHeader>

                <S.ColorsGrid>
                  {pickedColors.map((color, index) => (
                    <S.ColorCard
                      key={`${color}-${index}`}
                      $color={color}
                      onClick={() => copyColor(color)}
                      title={`Click to copy ${color}`}
                    >
                      <S.ColorSwatch $color={color} />
                      <S.ColorCode>{color}</S.ColorCode>
                      <S.CopyIndicator $show={copyFeedback === color}>
                        <i className="bx bx-check"></i>
                        Copied!
                      </S.CopyIndicator>
                    </S.ColorCard>
                  ))}
                </S.ColorsGrid>
              </S.ColorHistory>
            )}
          </S.PickerSection>
        )}

        {/* Hidden canvas for color processing */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </S.MainContainer>
    </S.PageWrapper>
    </>
  );
};

export { ColorPickerFromImage };
export default ColorPickerFromImage;