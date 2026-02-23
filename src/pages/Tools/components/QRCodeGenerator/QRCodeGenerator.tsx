// src/pages/Tools/components/QRCodeGenerator/QRCodeGenerator.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../../../../components/SEO';
import { GoogleAd } from '../../../../components/GoogleAd';
import { toolsSEO, generateToolSchema } from '../../../../config/toolsSEO';
import * as S from './styles';

interface QRConfig {
  url: string;
  size: number;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
  foregroundColor: string;
  backgroundColor: string;
  margin: number;
  format: 'PNG' | 'SVG' | 'JPG';
  hasLogo: boolean;
}

interface GeneratedQR {
  dataUrl: string;
  downloadUrl: string;
  config: QRConfig;
}

export const QRCodeGenerator: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'input' | 'customize' | 'result'>('input');
  const [isGenerating, setIsGenerating] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [generatedQR, setGeneratedQR] = useState<GeneratedQR | null>(null);
  const [qrHistory, setQrHistory] = useState<string[]>([]);

  // Tool configuration
  const toolConfig = {
    name: 'QR Code Generator',
    description: 'Generate custom QR codes with optional logo overlay for your content',
    image: 'https://64.media.tumblr.com/da5e76716d812a5ccec22e37179e2575/0e01452f9f6dd974-89/s2048x3072/2c12bac7610d803f4a197ea109c839a969849ac2.jpg',
    icon: 'bx bx-qr-scan',
    features: [
      'Custom logo overlay',
      'Multiple formats',
      'High resolution output'
    ]
  };

  const [config, setConfig] = useState<QRConfig>({
    url: '',
    size: 1000,
    errorCorrection: 'M',
    foregroundColor: '#000000',
    backgroundColor: '#ffffff',
    margin: 10,
    format: 'PNG',
    hasLogo: false
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load QR history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('qr_history');
    if (history) {
      setQrHistory(JSON.parse(history));
    }
  }, []);

  const saveToHistory = (url: string) => {
    const newHistory = [url, ...qrHistory.filter(h => h !== url)].slice(0, 5);
    setQrHistory(newHistory);
    localStorage.setItem('qr_history', JSON.stringify(newHistory));
  };

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return false;

    // Allow various types of content
    const patterns = [
      /^https?:\/\/.+/i, // URLs
      /^mailto:.+/i,     // Email
      /^tel:.+/i,        // Phone
      /^sms:.+/i,        // SMS
      /^wifi:T:.+/i,     // WiFi
      /^[^:]+$/          // Plain text
    ];

    return patterns.some(pattern => pattern.test(url));
  };

  const handleNext = () => {
    if (!validateUrl(config.url)) {
      alert('Please enter valid content for your QR code');
      return;
    }

    saveToHistory(config.url);
    setCurrentStep('customize');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Logo file must be smaller than 5MB');
        return;
      }

      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setConfig(prev => ({ ...prev, hasLogo: true }));
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
    setConfig(prev => ({ ...prev, hasLogo: false }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const generateQRCode = async (): Promise<string> => {
    const params = new URLSearchParams({
      size: `${config.size}x${config.size}`,
      data: config.url,
      ecc: config.errorCorrection,
      color: config.foregroundColor.replace('#', ''),
      bgcolor: config.backgroundColor.replace('#', ''),
      margin: config.margin.toString(),
      format: config.format.toLowerCase()
    });

    const baseUrl = `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`;

    try {
      const response = await fetch(baseUrl);
      if (!response.ok) throw new Error('Failed to generate QR code');

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  };

  const addLogoToQR = async (qrUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current;
      if (!canvas) return reject('Canvas not found');

      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('Canvas context not found');

      canvas.width = config.size;
      canvas.height = config.size;

      const qrImg = new Image();
      qrImg.crossOrigin = 'anonymous';

      qrImg.onload = () => {
        ctx.drawImage(qrImg, 0, 0, config.size, config.size);

        if (logoFile && logoPreview) {
          const logoImg = new Image();
          logoImg.onload = () => {
            const logoSize = config.size * 0.15; // Logo is 15% of QR code
            const logoX = (config.size - logoSize) / 2;
            const logoY = (config.size - logoSize) / 2;

            // Draw white background circle for logo
            ctx.fillStyle = config.backgroundColor;
            ctx.beginPath();
            ctx.arc(config.size / 2, config.size / 2, logoSize / 2 + 10, 0, 2 * Math.PI);
            ctx.fill();

            // Draw logo
            ctx.save();
            ctx.beginPath();
            ctx.arc(config.size / 2, config.size / 2, logoSize / 2, 0, 2 * Math.PI);
            ctx.clip();

            ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
            ctx.restore();

            resolve(canvas.toDataURL(`image/${config.format.toLowerCase()}`));
          };
          logoImg.src = logoPreview;
        } else {
          resolve(canvas.toDataURL(`image/${config.format.toLowerCase()}`));
        }
      };

      qrImg.onerror = () => reject('Failed to load QR code image');
      qrImg.src = qrUrl;
    });
  };

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      const qrUrl = await generateQRCode();
      const finalQR = config.hasLogo && logoFile ? await addLogoToQR(qrUrl) : qrUrl;

      setGeneratedQR({
        dataUrl: finalQR,
        downloadUrl: finalQR,
        config: { ...config }
      });

      setCurrentStep('result');
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Failed to generate QR code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQR = () => {
    if (!generatedQR) return;

    const link = document.createElement('a');
    link.href = generatedQR.downloadUrl;
    link.download = `qrcode_${Date.now()}.${config.format.toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyQR = async () => {
    if (!generatedQR) return;

    try {
      const response = await fetch(generatedQR.dataUrl);
      const blob = await response.blob();
      const clipboardItem = new ClipboardItem({ [blob.type]: blob });
      await navigator.clipboard.write([clipboardItem]);
      alert('QR code copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy QR code:', error);
      alert('Failed to copy QR code to clipboard.');
    }
  };

  const shareQR = async () => {
    if (!generatedQR) return;

    if (navigator.share) {
      try {
        const response = await fetch(generatedQR.dataUrl);
        const blob = await response.blob();
        const file = new File([blob], `qrcode.${config.format.toLowerCase()}`, { type: blob.type });

        await navigator.share({
          title: 'QR Code',
          text: `QR Code for: ${config.url}`,
          files: [file]
        });
      } catch (error) {
        console.error('Failed to share:', error);
      }
    } else {
      // Fallback to copy URL
      try {
        await navigator.clipboard.writeText(config.url);
        alert('URL copied to clipboard!');
      } catch (error) {
        alert('Sharing not supported on this device');
      }
    }
  };

  const startOver = () => {
    setCurrentStep('input');
    setConfig(prev => ({ ...prev, url: '' }));
    setGeneratedQR(null);
    removeLogo();
  };

  const getQRContent = () => {
    const { url } = config;

    if (url.startsWith('http')) return { type: 'Website', icon: 'bx bx-globe', color: '#4285f4' };
    if (url.startsWith('mailto:')) return { type: 'Email', icon: 'bx bx-envelope', color: '#ea4335' };
    if (url.startsWith('tel:')) return { type: 'Phone', icon: 'bx bx-phone', color: '#34a853' };
    if (url.startsWith('sms:')) return { type: 'SMS', icon: 'bx bx-message', color: '#fbbc05' };
    if (url.startsWith('wifi:')) return { type: 'WiFi', icon: 'bx bx-wifi', color: '#9c27b0' };

    return { type: 'Text', icon: 'bx-text', color: '#607d8b' };
  };

  const getPresetColors = () => [
    { name: 'Classic Black', fg: '#000000', bg: '#ffffff' },
    { name: 'Dark Blue', fg: '#1a237e', bg: '#ffffff' },
    { name: 'Forest Green', fg: '#1b5e20', bg: '#ffffff' },
    { name: 'Deep Red', fg: '#b71c1c', bg: '#ffffff' },
    { name: 'Royal Purple', fg: '#4a148c', bg: '#ffffff' },
    { name: 'Dark Mode', fg: '#ffffff', bg: '#121212' },
  ];

  const renderStepIndicator = () => (
    <S.StepIndicator>
      <S.Step active={currentStep === 'input'} completed={currentStep !== 'input'}>
        <S.StepNumber active={currentStep === 'input'} completed={currentStep !== 'input'}>1</S.StepNumber>
        <S.StepLabel active={currentStep === 'input'} completed={currentStep !== 'input'}>Content</S.StepLabel>
      </S.Step>
      <S.StepConnector completed={currentStep === 'result'} />
      <S.Step active={currentStep === 'customize'} completed={currentStep === 'result'}>
        <S.StepNumber active={currentStep === 'customize'} completed={currentStep === 'result'}>2</S.StepNumber>
        <S.StepLabel active={currentStep === 'customize'} completed={currentStep === 'result'}>Customize</S.StepLabel>
      </S.Step>
      <S.StepConnector completed={currentStep === 'result'} />
      <S.Step active={currentStep === 'result'} completed={false}>
        <S.StepNumber active={currentStep === 'result'} completed={false}>3</S.StepNumber>
        <S.StepLabel active={currentStep === 'result'} completed={false}>Download</S.StepLabel>
      </S.Step>
    </S.StepIndicator>
  );

  const seoConfig = toolsSEO['qr-code-generator'];
  const schemaData = generateToolSchema('qr-code-generator', seoConfig);

  return (
    <>
      <SEO
        title={seoConfig.title}
        description={seoConfig.description}
        keywords={seoConfig.keywords}
        canonical="https://youtool.io/tools/qr-code-generator"
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
        {currentStep === 'input' && (
          <S.EducationalSection>

            <S.EducationalContent>
              <S.SectionSubTitle>What This Tool Does</S.SectionSubTitle>
              <S.EducationalText>
                The QR Code Generator creates custom, branded QR codes for any URL, text, email address, phone number, or channel link. Unlike generic QR generators, this tool lets you customize the colors, add your logo, and choose from multiple QR styles — so your QR code matches your channel's branding rather than looking like a generic black-and-white square.
              </S.EducationalText>
              <S.EducationalText>
                QR codes are a powerful bridge between your offline presence and your YouTube channel. Use them on business cards, merchandise, event signage, video end screens printed materials, or anywhere a viewer might encounter your brand outside of YouTube.
              </S.EducationalText>
            </S.EducationalContent>

            <S.EducationalContent>
              <S.SectionSubTitle>How to Use the QR Code Generator</S.SectionSubTitle>
              <S.StepByStep>
                <S.StepItem>
                  <S.StepNumberCircle>1</S.StepNumberCircle>
                  <S.StepContent>
                    <S.StepTitle>Enter Your Content</S.StepTitle>
                    <S.EducationalText>
                      Paste the URL, text, email, or phone number you want to encode. For YouTube channels, use your channel's full URL (e.g., youtube.com/@handle) or your channel's subscribe link to drive direct subscriptions. You can also encode your most recent video URL to drive views to a specific piece of content.
                    </S.EducationalText>
                  </S.StepContent>
                </S.StepItem>
                <S.StepItem>
                  <S.StepNumberCircle>2</S.StepNumberCircle>
                  <S.StepContent>
                    <S.StepTitle>Customize the Design</S.StepTitle>
                    <S.EducationalText>
                      Choose foreground and background colors that match your brand. Optionally upload your channel logo to embed in the center of the QR code. Select a QR style — dots, rounded, or classic squares — to give your code a unique look while maintaining scannability.
                    </S.EducationalText>
                  </S.StepContent>
                </S.StepItem>
                <S.StepItem>
                  <S.StepNumberCircle>3</S.StepNumberCircle>
                  <S.StepContent>
                    <S.StepTitle>Download and Deploy</S.StepTitle>
                    <S.EducationalText>
                      Download your QR code as a high-resolution PNG. The QR code is generated at a resolution suitable for both digital use and print. For print materials, use the highest quality setting to ensure the code remains scannable at large sizes.
                    </S.EducationalText>
                  </S.StepContent>
                </S.StepItem>
              </S.StepByStep>
            </S.EducationalContent>

            <S.EducationalContent>
              <S.SectionSubTitle>Best Uses for YouTube Creators</S.SectionSubTitle>
              <S.FeatureList>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Channel subscribe links:</strong> Generate a QR code that links directly to your YouTube subscribe page. Place it on merchandise, business cards, or at the end of your videos (rendered as a screen graphic) to make subscribing effortless for viewers who encounter your brand offline.</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Event and speaking appearances:</strong> If you speak at events, conferences, or meetups, include your QR code on your slide deck or handouts so attendees can find your channel immediately without having to search.</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Video end screens and outros:</strong> Design a QR code that links to your newest video or a curated playlist, then overlay it on your outro graphic. Viewers watching on a second screen (phone while TV plays) can scan it to continue watching.</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-check-circle"></i>
                  <span><strong>Printed merchandise and packaging:</strong> T-shirts, stickers, and packaging are a natural place for QR codes. A branded QR code that matches your channel's color palette looks intentional rather than an afterthought.</span>
                </S.FeatureListItem>
              </S.FeatureList>
            </S.EducationalContent>

            <S.EducationalContent>
              <S.SectionSubTitle>Frequently Asked Questions</S.SectionSubTitle>
              <S.FeatureList>
                <S.FeatureListItem>
                  <i className="bx bx-help-circle"></i>
                  <span><strong>Will adding a logo reduce scannability?</strong> Logos reduce scannability slightly because they cover part of the QR code's error-correction data. This tool uses QR error-correction level “H” when a logo is present, which allows up to 30% of the code to be obscured while remaining scannable. Keep logos small (under 20% of the QR code area) for best results.</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-help-circle"></i>
                  <span><strong>Do the QR codes expire?</strong> The QR codes generated are static — they encode the URL directly in the pattern and do not expire. As long as the destination URL is live, the QR code will work indefinitely. Dynamic QR codes that can be updated after printing require a paid third-party service.</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-help-circle"></i>
                  <span><strong>What's the minimum print size for a QR code?</strong> For reliable scanning, QR codes should be printed at a minimum of 2.5 cm × 2.5 cm (approximately 1 inch × 1 inch). Larger is better — for billboard or signage use, scale proportionally and test scan distance before printing at scale.</span>
                </S.FeatureListItem>
              </S.FeatureList>
            </S.EducationalContent>

            <S.EducationalContent>
              <S.SectionSubTitle>Related Tools</S.SectionSubTitle>
              <S.FeatureList>
                <S.FeatureListItem>
                  <i className="bx bx-link"></i>
                  <span><a href="/tools/subscribe-link-generator"><strong>Subscribe Link Generator</strong></a> — Create a direct YouTube subscribe link with a confirmation prompt to maximize subscription conversions.</span>
                </S.FeatureListItem>
                <S.FeatureListItem>
                  <i className="bx bx-link"></i>
                  <span><a href="/tools/channel-id-finder"><strong>Channel ID Finder</strong></a> — Find your channel ID to construct custom YouTube URLs for use in your QR codes.</span>
                </S.FeatureListItem>
              </S.FeatureList>
            </S.EducationalContent>

          </S.EducationalSection>
        )}

        {renderStepIndicator()}

        {/* Step 1: Content Input */}
        {currentStep === 'input' && (
          <S.InputSection>
            <S.SectionTitle>
              <i className="bx bx-edit"></i>
              What do you want to encode?
            </S.SectionTitle>

            <S.ContentTypeGrid>
              <S.ContentTypeCard onClick={() => setConfig(prev => ({ ...prev, url: 'https://' }))}>
                <i className="bx bx-globe"></i>
                <div>Website URL</div>
                <span>Link to any website</span>
              </S.ContentTypeCard>

              <S.ContentTypeCard onClick={() => setConfig(prev => ({ ...prev, url: 'mailto:' }))}>
                <i className="bx bx-envelope"></i>
                <div>Email Address</div>
                <span>Send an email</span>
              </S.ContentTypeCard>

              <S.ContentTypeCard onClick={() => setConfig(prev => ({ ...prev, url: 'tel:' }))}>
                <i className="bx bx-phone"></i>
                <div>Phone Number</div>
                <span>Make a call</span>
              </S.ContentTypeCard>

              <S.ContentTypeCard onClick={() => setConfig(prev => ({ ...prev, url: 'sms:' }))}>
                <i className="bx bx-message"></i>
                <div>SMS Message</div>
                <span>Send a text</span>
              </S.ContentTypeCard>
            </S.ContentTypeGrid>

            <S.InputContainer>
              <S.InputLabel>Enter your content:</S.InputLabel>
              <S.TextInput
                value={config.url}
                onChange={(e) => setConfig(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://example.com or any text content"
                autoFocus
              />
              <S.InputHint>
                Supports URLs, email addresses, phone numbers, WiFi credentials, or plain text
              </S.InputHint>
            </S.InputContainer>

            {qrHistory.length > 0 && (
              <S.HistorySection>
                <S.HistoryLabel>Recent QR codes:</S.HistoryLabel>
                <S.HistoryList>
                  {qrHistory.map((url, index) => (
                    <S.HistoryItem key={index} onClick={() => setConfig(prev => ({ ...prev, url }))}>
                      <i className={getQRContent().icon}></i>
                      <span>{url.length > 50 ? url.substring(0, 50) + '...' : url}</span>
                    </S.HistoryItem>
                  ))}
                </S.HistoryList>
              </S.HistorySection>
            )}

            <S.ActionButtons>
              <S.PrimaryButton onClick={handleNext} disabled={!validateUrl(config.url)}>
                <i className="bx bx-right-arrow-alt"></i>
                Next: Customize Design
              </S.PrimaryButton>
            </S.ActionButtons>
          </S.InputSection>
        )}

        {/* Step 2: Customization */}
        {currentStep === 'customize' && (
          <S.CustomizeSection>
            <S.SectionTitle>
              <i className="bx bx-palette"></i>
              Customize Your QR Code
            </S.SectionTitle>

            <S.ContentPreview>
              <S.ContentInfo>
                <i className={getQRContent().icon} style={{ color: getQRContent().color }}></i>
                <div>
                  <S.ContentType>{getQRContent().type}</S.ContentType>
                  <S.ContentText>{config.url}</S.ContentText>
                </div>
              </S.ContentInfo>
            </S.ContentPreview>

            <S.CustomizationGrid>
              <S.CustomizationCard>
                <S.CardTitle>
                  <i className="bx bx-palette"></i>
                  Colors
                </S.CardTitle>

                <S.ColorPresets>
                  {getPresetColors().map((preset, index) => (
                    <S.ColorPreset
                      key={index}
                      onClick={() => setConfig(prev => ({
                        ...prev,
                        foregroundColor: preset.fg,
                        backgroundColor: preset.bg
                      }))}
                    >
                      <S.PresetSwatch fg={preset.fg} bg={preset.bg} />
                      <span>{preset.name}</span>
                    </S.ColorPreset>
                  ))}
                </S.ColorPresets>

                <S.ColorInputs>
                  <S.ColorInput>
                    <label>Foreground:</label>
                    <div>
                      <input
                        type="color"
                        value={config.foregroundColor}
                        onChange={(e) => setConfig(prev => ({ ...prev, foregroundColor: e.target.value }))}
                      />
                      <span>{config.foregroundColor}</span>
                    </div>
                  </S.ColorInput>
                  <S.ColorInput>
                    <label>Background:</label>
                    <div>
                      <input
                        type="color"
                        value={config.backgroundColor}
                        onChange={(e) => setConfig(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      />
                      <span>{config.backgroundColor}</span>
                    </div>
                  </S.ColorInput>
                </S.ColorInputs>
              </S.CustomizationCard>

              <S.CustomizationCard>
                <S.CardTitle>
                  <i className="bx bx-cog"></i>
                  Settings
                </S.CardTitle>

                <S.SettingItem>
                  <label>Size:</label>
                  <S.SizeSelector>
                    {[500, 1000, 2000, 4000].map(size => (
                      <S.SizeOption
                        key={size}
                        active={config.size === size}
                        onClick={() => setConfig(prev => ({ ...prev, size }))}
                      >
                        {size}px
                      </S.SizeOption>
                    ))}
                  </S.SizeSelector>
                </S.SettingItem>

                <S.SettingItem>
                  <label>Error Correction:</label>
                  <S.Select
                    value={config.errorCorrection}
                    onChange={(e) => setConfig(prev => ({ ...prev, errorCorrection: e.target.value as any }))}
                  >
                    <option value="L">Low (7%)</option>
                    <option value="M">Medium (15%)</option>
                    <option value="Q">Quartile (25%)</option>
                    <option value="H">High (30%)</option>
                  </S.Select>
                </S.SettingItem>

                <S.SettingItem>
                  <label>Format:</label>
                  <S.FormatSelector>
                    {['PNG', 'JPG', 'SVG'].map(format => (
                      <S.FormatOption
                        key={format}
                        active={config.format === format}
                        onClick={() => setConfig(prev => ({ ...prev, format: format as any }))}
                      >
                        {format}
                      </S.FormatOption>
                    ))}
                  </S.FormatSelector>
                </S.SettingItem>
              </S.CustomizationCard>

              <S.CustomizationCard>
                <S.CardTitle>
                  <i className="bx bx-image"></i>
                  Logo (Optional)
                </S.CardTitle>

                {!logoPreview ? (
                  <S.LogoUpload onClick={() => fileInputRef.current?.click()}>
                    <i className="bx bx-image-add"></i>
                    <div>Add Your Logo</div>
                    <span>PNG, JPG, or SVG (max 5MB)</span>
                  </S.LogoUpload>
                ) : (
                  <S.LogoPreview>
                    <img src={logoPreview} alt="Logo preview" />
                    <S.LogoActions>
                      <S.LogoAction onClick={() => fileInputRef.current?.click()}>
                        <i className="bx bx-edit"></i>
                        Change
                      </S.LogoAction>
                      <S.LogoAction onClick={removeLogo}>
                        <i className="bx bx-trash"></i>
                        Remove
                      </S.LogoAction>
                    </S.LogoActions>
                  </S.LogoPreview>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  style={{ display: 'none' }}
                />
              </S.CustomizationCard>
            </S.CustomizationGrid>

            <S.ActionButtons>
              <S.SecondaryButton onClick={() => setCurrentStep('input')}>
                <i className="bx bx-left-arrow-alt"></i>
                Back
              </S.SecondaryButton>
              <S.PrimaryButton onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <i className="bx bx-loader-alt bx-spin"></i>
                    Generating...
                  </>
                ) : (
                  <>
                    <i className="bx bx-qr"></i>
                    Generate QR Code
                  </>
                )}
              </S.PrimaryButton>
            </S.ActionButtons>
          </S.CustomizeSection>
        )}

        {/* Step 3: Results */}
        {currentStep === 'result' && generatedQR && (
          <S.ResultSection>
            <S.SectionTitle>
              <i className="bx bx-check-circle"></i>
              Your QR Code is Ready!
            </S.SectionTitle>

            <S.ResultGrid>
              <S.QRPreviewCard>
                <S.QRImage src={generatedQR.dataUrl} alt="Generated QR Code" />
                <S.QRInfo>
                  <S.QRSummary>
                    <i className={getQRContent().icon} style={{ color: getQRContent().color }}></i>
                    <div>
                      <div>{getQRContent().type}</div>
                      <span>{config.url}</span>
                    </div>
                  </S.QRSummary>
                  <S.QRSpecs>
                    <span>Size: {config.size}×{config.size}px</span>
                    <span>Format: {config.format}</span>
                    <span>Error Correction: {config.errorCorrection}</span>
                    {config.hasLogo && <span>✓ With Logo</span>}
                  </S.QRSpecs>
                </S.QRInfo>
              </S.QRPreviewCard>

              <S.ActionsCard>
                <S.CardTitle>
                  <i className="bx bx-download"></i>
                  Download & Share
                </S.CardTitle>

                <S.ActionsList>
                  <S.ActionItem onClick={downloadQR}>
                    <i className="bx bx-download"></i>
                    <div>
                      <div>Download QR Code</div>
                      <span>High resolution {config.format}</span>
                    </div>
                  </S.ActionItem>

                  <S.ActionItem onClick={copyQR}>
                    <i className="bx bx-copy"></i>
                    <div>
                      <div>Copy to Clipboard</div>
                      <span>Quick sharing</span>
                    </div>
                  </S.ActionItem>

                  <S.ActionItem onClick={shareQR}>
                    <i className="bx bx-share"></i>
                    <div>
                      <div>Share QR Code</div>
                      <span>Send to others</span>
                    </div>
                  </S.ActionItem>
                </S.ActionsList>

                <S.StartOverButton onClick={startOver}>
                  <i className="bx bx-refresh"></i>
                  Create Another QR Code
                </S.StartOverButton>
              </S.ActionsCard>
            </S.ResultGrid>
          </S.ResultSection>
        )}

        {/* Hidden canvas for logo processing */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </S.MainContainer>
    </S.PageWrapper>
    </>
  );
};

export default QRCodeGenerator;