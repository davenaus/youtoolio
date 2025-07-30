// src/pages/Tools/components/ColorPickerFromImage/ColorPickerFromImage.tsx
import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdSense } from '../../../../components/AdSense/AdSense';
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

  return (
    <S.PageWrapper>
      {/* Left Sidebar Ad */}
      <S.AdSidebar position="left">
        <AdSense 
          slot={process.env.REACT_APP_ADSENSE_SLOT_SIDEBAR || ''}
          format="vertical"
        />
      </S.AdSidebar>

      {/* Right Sidebar Ad */}
      <S.AdSidebar position="right">
        <AdSense 
          slot={process.env.REACT_APP_ADSENSE_SLOT_SIDEBAR || ''}
          format="vertical"
        />
      </S.AdSidebar>

      <S.MainContainer>
        <S.Header>
          <S.BackButton onClick={() => navigate('/tools')}>
            <i className="bx bx-arrow-back"></i>
            Back to Tools
          </S.BackButton>
          <S.Title>Color Picker from Image</S.Title>
          <S.Subtitle>
            Upload an image and click anywhere to instantly copy the hex color to your clipboard
          </S.Subtitle>
        </S.Header>

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

        {/* Bottom Ad */}
        <S.BottomAdContainer>
          <AdSense 
            slot={process.env.REACT_APP_ADSENSE_SLOT_BOTTOM || ''}
            format="horizontal"
          />
        </S.BottomAdContainer>
      </S.MainContainer>
    </S.PageWrapper>
  );
};

export { ColorPickerFromImage };
export default ColorPickerFromImage;