// src/pages/Tools/components/ThumbnailAnalyzer/styles.ts
import styled, { keyframes } from 'styled-components';

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(229, 72, 72, 0.4); }
  50% { box-shadow: 0 0 40px rgba(229, 72, 72, 0.8); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.dark2};
  display: flex;
  justify-content: center;
  position: relative;
`;

export const MainContainer = styled.div`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  position: relative;

  @media (max-width: 1700px) {
    max-width: 900px;
  }

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

export const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 0.5rem 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-family: ${({ theme }) => theme.fonts.primary};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 2rem;

  &:hover {
    background: ${({ theme }) => theme.colors.dark4};
    color: ${({ theme }) => theme.colors.text.primary};
    transform: translateX(-2px);
  }

  i {
    font-size: 1.1rem;
  }
`;

export const EnhancedHeader = styled.div<{ backgroundImage: string }>`
  position: relative;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red1}, ${({ theme }) => theme.colors.red2});
  border: 1px solid ${({ theme }) => theme.colors.red3};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 3rem 2rem;
  margin-bottom: 3rem;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('${({ backgroundImage }) => backgroundImage}');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    opacity: 0.15;
    z-index: 0;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg,
      ${({ theme }) => theme.colors.red1}80,
      ${({ theme }) => theme.colors.red2}60,
      transparent 70%
    );
    z-index: 1;
  }

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
  }
`;

export const HeaderOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg,
    rgba(125, 0, 0, 0.3),
    rgba(82, 1, 1, 0.2),
    transparent 70%
  );
  z-index: 1;
`;

export const HeaderContent = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
`;

export const ToolIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  flex-shrink: 0;
  box-shadow: 0 0 30px rgba(229, 72, 72, 0.4);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.red5}, ${({ theme }) => theme.colors.red3});
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    z-index: -1;
    opacity: 0.5;
    animation: ${pulseGlow} 3s ease-in-out infinite;
  }

  i {
    font-size: 2.5rem;
    color: ${({ theme }) => theme.colors.white};
  }

  @media (max-width: 768px) {
    width: 60px;
    height: 60px;

    i {
      font-size: 2rem;
    }
  }
`;

export const HeaderTextContent = styled.div`
  flex: 1;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const ToolTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 1rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

export const ToolDescription = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.6;
  margin: 0 0 1.5rem 0;
  opacity: 0.95;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

export const FeaturesList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
`;

export const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.9rem;

  i {
    color: ${({ theme }) => theme.colors.red4};
    font-size: 1.1rem;
    flex-shrink: 0;
  }

  span {
    opacity: 0.9;
  }
`;

export const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1rem 1.5rem;
  margin-bottom: 2rem;
  color: #ef4444;
  font-size: 0.95rem;
  animation: ${fadeIn} 0.3s ease;

  i {
    font-size: 1.5rem;
    flex-shrink: 0;
  }
`;

// Upload Section
export const UploadSection = styled.div`
  animation: ${fadeIn} 0.5s ease;
`;

export const DropZone = styled.div<{ hasImage: boolean }>`
  position: relative;
  background: ${({ theme, hasImage }) => hasImage ? 'transparent' : theme.colors.dark3};
  border: 2px dashed ${({ theme, hasImage }) => hasImage ? theme.colors.red3 : theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ hasImage }) => hasImage ? '0' : '3rem'};
  margin: 0 auto 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  width: 100%;
  max-width: ${({ hasImage }) => hasImage ? '100%' : '800px'};
  aspect-ratio: 16 / 9;

  &:hover {
    border-color: ${({ theme }) => theme.colors.red3};
    background: ${({ theme, hasImage }) => hasImage ? 'transparent' : theme.colors.dark4};
  }

  i.bx-cloud-upload {
    font-size: 4rem;
    color: ${({ theme }) => theme.colors.red3};
    margin-bottom: 1rem;
  }

  h3 {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1.5rem;
    margin: 0;
  }

  p {
    color: ${({ theme }) => theme.colors.text.secondary};
    margin: 0.5rem 0 0 0;
  }

  @media (max-width: 768px) {
    max-width: ${({ hasImage }) => hasImage ? '100%' : '95%'};
  }
`;

export const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
`;

export const SupportedFormats = styled.div`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.85rem;
  margin-top: 1rem;
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

export const PrimaryButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4});
  color: ${({ theme }) => theme.colors.white};
  border: none;
  padding: 1rem 2rem;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: ${({ theme }) => theme.fonts.primary};
  box-shadow: ${({ theme }) => theme.shadows.md};

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.red2}, ${({ theme }) => theme.colors.red3});
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  i {
    font-size: 1.2rem;
  }

  @media (max-width: 768px) {
    width: 100%;
    max-width: 400px;
  }
`;

export const SecondaryButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  color: ${({ theme }) => theme.colors.text.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-family: ${({ theme }) => theme.fonts.primary};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.dark4};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  i {
    font-size: 1.2rem;
  }

  @media (max-width: 768px) {
    width: 100%;
    max-width: 400px;
  }
`;

// Educational Section
export const EducationalSection = styled.div`
  margin-top: 3rem;
  animation: ${fadeIn} 0.8s ease;
`;

export const SectionTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 2rem 0;
  text-align: center;
  justify-content: center;

  i {
    color: ${({ theme }) => theme.colors.red3};
    font-size: 1.75rem;
  }

  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

export const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const FeatureCard = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.red3};
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }

  i {
    font-size: 2.5rem;
    color: ${({ theme }) => theme.colors.red3};
    margin-bottom: 1rem;
  }

  h3 {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1.1rem;
    margin: 0 0 0.75rem 0;
  }

  p {
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: 0.9rem;
    margin: 0;
    line-height: 1.6;
  }
`;

export const EduContent = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 2.5rem;
  margin-bottom: 2rem;
  margin-top: 2rem;
  line-height: 1.7;
`;

export const EduSubTitle = styled.h3`
  color: ${({ theme }) => theme.colors.red4};
  font-size: 1.2rem;
  margin-bottom: 1rem;
  font-weight: 600;
`;

export const EduText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 1.2rem;
  font-size: 0.9rem;
  line-height: 1.6;
`;

export const EduList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1rem 0;
`;

export const EduListItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
  
  i {
    color: ${({ theme }) => theme.colors.success};
    font-size: 1.1rem;
    margin-top: 0.1rem;
    flex-shrink: 0;
  }
  
  span {
    flex: 1;
  }
`;

// Loading Section
export const LoadingSection = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  animation: ${fadeIn} 0.3s ease;
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  max-width: 700px;
  margin: 0 auto;
`;

export const LoadingSpinner = styled.div`
  position: relative;
  margin-bottom: 2rem;

  i {
    font-size: 3.5rem;
    color: ${({ theme }) => theme.colors.red3};
    animation: ${spin} 1.5s linear infinite;
    display: inline-block;
  }

  h3 {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1.75rem;
    font-weight: 600;
    margin: 1.5rem 0 0 0;
    letter-spacing: -0.5px;
  }

  @media (max-width: 768px) {
    i {
      font-size: 3rem;
    }

    h3 {
      font-size: 1.5rem;
    }
  }
`;

export const ProgressCounter = styled.div`
  font-size: 5rem;
  font-weight: 800;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red5});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 2rem 0 1rem 0;
  line-height: 1;
  position: relative;
  display: inline-block;

  @media (max-width: 768px) {
    font-size: 4rem;
  }
`;

export const ProgressBarContainer = styled.div`
  width: 100%;
  max-width: 550px;
  height: 12px;
  background: ${({ theme }) => theme.colors.dark4};
  border-radius: 20px;
  overflow: hidden;
  margin: 2.5rem auto;
  position: relative;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.3);
  border: 1px solid ${({ theme }) => theme.colors.dark5};
`;

const progressShimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

export const ProgressBarFill = styled.div<{ width: number }>`
  height: 100%;
  width: ${({ width }) => width}%;
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.red4},
    ${({ theme }) => theme.colors.red3},
    ${({ theme }) => theme.colors.red5},
    ${({ theme }) => theme.colors.red3},
    ${({ theme }) => theme.colors.red4}
  );
  background-size: 200% 100%;
  border-radius: 20px;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${progressShimmer} 2s linear infinite;
  box-shadow: 0 0 20px rgba(229, 72, 72, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0.3) 0%, transparent 50%, rgba(0, 0, 0, 0.2) 100%);
    border-radius: 20px;
  }
`;

export const AnalyzingSteps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 500px;
  margin: 2rem auto 0;
`;

export const AnalyzingStep = styled.div<{ completed?: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: ${({ theme, completed }) => completed ? theme.colors.text.primary : theme.colors.text.secondary};
  font-size: 0.95rem;
  transition: all 0.3s ease;
  opacity: ${({ completed }) => completed ? 1 : 0.6};

  i {
    color: ${({ theme, completed }) => completed ? (theme.colors.success || '#4caf50') : theme.colors.text.muted};
    font-size: 1.3rem;
    transition: all 0.3s ease;
  }
`;

// Results Section
export const ResultsSection = styled.div`
  animation: ${fadeIn} 0.5s ease;
`;

export const ResultsWrapper = styled.div`
  display: flex;
  flex-direction: column;

  @media (max-width: 1023px) {
    /* On mobile, use flexbox to control order */
    display: flex;
    flex-direction: column;
  }
`;

export const TwoColumnContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (min-width: 1024px) {
    grid-template-columns: 1.5fr 1fr;
    gap: 2rem;
  }

  @media (max-width: 1023px) {
    gap: 1.5rem;
  }

  @media (max-width: 768px) {
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
`;

export const ScorecardTile = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  height: 100%;

  @media (max-width: 1023px) {
    order: 2;
    height: auto;
    padding: 1.5rem;
    gap: 1rem;
  }
`;

export const OverallScoreTile = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  height: 100%;
  min-height: 400px;

  @media (max-width: 1023px) {
    order: -1;
    height: auto;
    min-height: auto;
    padding: 1.5rem;
    gap: 1rem;
  }
`;

export const OverallScore = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;

  @media (max-width: 1023px) {
    margin-top: 2rem;
  }
`;

export const ScoreCircle = styled.div<{ color: string }>`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.dark4};
  border: 6px solid ${({ color }) => color};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  @media (max-width: 1023px) {
    width: 120px;
    height: 120px;
    border-width: 5px;
  }
`;

export const ScoreNumber = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1;
  margin-bottom: 0.5rem;

  @media (max-width: 1023px) {
    font-size: 2rem;
    margin-bottom: 0.25rem;
  }
`;

export const ScoreLabel = styled.div`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;

  @media (max-width: 1023px) {
    font-size: 0.85rem;
  }
`;

// Heatmap Section
export const HeatmapSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

export const ImageComparison = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const ComparisonImage = styled.div`
  position: relative;

  img {
    width: 100%;
    height: auto;
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    border: 1px solid ${({ theme }) => theme.colors.dark5};
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

export const ImageLabel = styled.div`
  margin-top: 0.75rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 600;
  font-size: 1rem;
`;

export const HeatmapLegend = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
  margin: 0;
  padding: 1.5rem;
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};

  @media (max-width: 768px) {
    gap: 1rem;
    padding: 1rem;
  }
`;

export const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
`;

export const LegendColor = styled.div<{ color: string }>`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: ${({ color }) => color};
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

// Heatmap with Scores Container
export const HeatmapWithScoresContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-bottom: 3rem;

  @media (min-width: 1024px) {
    grid-template-columns: 1.2fr 1fr;
    gap: 3rem;
  }
`;

export const HeatmapColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

export const ScoresColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

// Heatmap Overlay
export const HeatmapOverlayContainer = styled.div`
  position: relative;
  width: 100%;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  margin-bottom: 1.5rem;
`;

export const OriginalImage = styled.img`
  width: 100%;
  height: auto;
  display: block;
`;

export const HeatmapOverlay = styled.img<{ opacity: number }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: ${({ opacity }) => opacity / 100};
  transition: opacity 0.2s ease;
  pointer-events: none;
`;

// Opacity Slider
export const OpacitySliderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: ${({ theme }) => theme.colors.dark3};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: 1.5rem;

  @media (max-width: 1023px) {
    padding: 1rem;
    gap: 0.75rem;
  }

  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
`;

export const SliderLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
  font-weight: 500;
  min-width: 70px;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 0.75rem;
    min-width: 50px;
  }
`;

export const OpacitySlider = styled.input`
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 8px;
  background: linear-gradient(
    to right,
    ${({ theme }) => theme.colors.dark5} 0%,
    ${({ theme }) => theme.colors.red3} 100%
  );
  border-radius: 5px;
  outline: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.white};
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      transform: scale(1.2);
    }
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.white};
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    cursor: pointer;
    border: none;
    transition: all 0.2s ease;

    &:hover {
      transform: scale(1.2);
    }
  }

  @media (max-width: 1023px) {
    height: 8px;

    &::-webkit-slider-thumb {
      width: 16px;
      height: 16px;
    }

    &::-moz-range-thumb {
      width: 16px;
      height: 16px;
    }
  }

  @media (max-width: 768px) {
    min-height: 8px;

    &::-webkit-slider-thumb {
      width: 14px;
      height: 14px;
    }

    &::-moz-range-thumb {
      width: 14px;
      height: 14px;
    }
  }
`;

// Scores Grid
export const ScoresGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const ScoreCard = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

export const ScoreIcon = styled.div`
  margin-bottom: 1rem;

  i {
    font-size: 2rem;
    color: ${({ theme }) => theme.colors.red3};
  }
`;

export const ScoreName = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
`;

export const ScoreBar = styled.div`
  height: 8px;
  background: ${({ theme }) => theme.colors.dark4};
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
`;

export const ScoreFill = styled.div<{ width: number; color: string }>`
  height: 100%;
  width: ${({ width }) => width}%;
  background: ${({ color }) => color};
  border-radius: 4px;
  transition: width 1s ease;
`;

export const ScoreValue = styled.div<{ color: string }>`
  color: ${({ color }) => color};
  font-size: 1.2rem;
  font-weight: 700;
  text-align: right;
`;

export const ScoreReason = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.85rem;
  line-height: 1.5;
  margin-top: 0.75rem;
  font-style: italic;
  opacity: 0.9;
`;

// Insights Section
export const InsightsSection = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }
`;

export const InsightsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const InsightItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.95rem;
  line-height: 1.6;

  &:last-child {
    margin-bottom: 0;
  }

  i {
    color: ${({ theme }) => theme.colors.success || '#4caf50'};
    font-size: 1.3rem;
    flex-shrink: 0;
    margin-top: 0.1rem;
  }

  @media (max-width: 768px) {
    font-size: 0.9rem;
    gap: 0.75rem;

    i {
      font-size: 1.1rem;
    }
  }
`;

// Recommendations Section
export const RecommendationsSection = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.red4};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 2rem;
  margin-bottom: 2rem;
`;

export const RecommendationsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const RecommendationItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.95rem;
  line-height: 1.6;

  &:last-child {
    margin-bottom: 0;
  }

  i {
    color: ${({ theme }) => theme.colors.red3};
    font-size: 1.3rem;
    flex-shrink: 0;
    margin-top: 0.1rem;
  }
`;

// Scorecard Scores List
export const ScorecardScoresList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (max-width: 768px) {
    gap: 0.75rem;
  }
`;

export const ScorecardScoreItem = styled.div`
  padding: 1rem;
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.dark5};
  }

  @media (max-width: 768px) {
    padding: 0.75rem;
  }
`;

export const ScorecardScoreHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    gap: 0.5rem;
    margin-bottom: 0.35rem;
  }
`;

export const ScoreIconSmall = styled.div`
  i {
    font-size: 1.2rem;
    color: ${({ theme }) => theme.colors.red3};
  }

  @media (max-width: 768px) {
    i {
      font-size: 1rem;
    }
  }
`;

export const ScoreNameSmall = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.9rem;
  font-weight: 600;
  flex: 1;

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

export const ScoreValueSmall = styled.div<{ color: string }>`
  color: ${({ color }) => color};
  font-size: 1rem;
  font-weight: 700;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

export const ScoreReasonSmall = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.8rem;
  line-height: 1.4;
  padding-left: 2rem;

  @media (max-width: 768px) {
    font-size: 0.75rem;
    padding-left: 1.5rem;
  }
`;
