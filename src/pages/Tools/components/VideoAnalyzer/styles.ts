// src/pages/Tools/components/VideoAnalyzer/styles.ts - IMPROVED VERSION
import styled, { keyframes } from 'styled-components';

// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(229, 72, 72, 0.4); }
  50% { box-shadow: 0 0 40px rgba(229, 72, 72, 0.8); }
`;

const typing = keyframes`
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-10px); }
`;

const slideInFromBottom = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Educational Content Styled Components
export const EducationalSection = styled.div`
  margin-bottom: 3rem;
  animation: ${fadeIn} 0.8s ease-out;
`;

export const EducationalContent = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 2.5rem;
  margin-bottom: 2rem;
  margin-top: 2rem;
  line-height: 1.7;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }

  @media (max-width: 480px) {
    padding: 1.25rem;
  }
`;

export const SectionSubTitle = styled.h2`
  color: ${({ theme }) => theme.colors.red4};
  font-size: 1.3rem;
  margin-bottom: 1rem;
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

export const EducationalText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 1.5rem;
  font-size: 0.90rem;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

export const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1.5rem 0;
`;

export const FeatureListItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1rem;
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

  @media (max-width: 768px) {
    font-size: 0.9rem;

    i {
      font-size: 1rem;
    }
  }
`;

export const StepByStep = styled.div`
  background: ${({ theme }) => theme.colors.dark4};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 2rem;
  margin: 2rem 0;

  @media (max-width: 768px) {
    padding: 1.5rem;
    margin: 1.5rem 0;
  }

  @media (max-width: 480px) {
    padding: 1.25rem;
    margin: 1.25rem 0;
  }
`;

export const StepItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

export const StepNumberCircle = styled.div`
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(125, 0, 0, 0.3);

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    font-size: 0.9rem;
  }
`;

export const StepContent = styled.div`
  flex: 1;
  font-size: 0.9rem;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

export const StepTitle = styled.h4`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.05rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
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



export const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 3rem;
  padding: 2rem;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.dark3}, ${({ theme }) => theme.colors.dark4});
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem;
    gap: 1rem;
  }
`;

export const HeaderIcon = styled.div`
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


export const Title = styled.h1`
  font-size: 2.5rem;
  color: ${({ theme }) => theme.colors.white};
  margin: 0 0 0.75rem 0;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;



export const Description = styled.p`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.2rem;
  margin: 0 0 1rem 0;
  opacity: 0.95;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;




// Video Info Section
export const ResultsContainer = styled.div`
  display: none;
  animation: ${fadeIn} 0.6s ease-in-out;

  &.visible {
    display: block;
  }
`;

export const LoadingContainer = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  
  i {
    font-size: 3rem;
    color: ${({ theme }) => theme.colors.red3};
    margin-bottom: 1rem;
    display: inline-block;
    animation: ${spin} 1s linear infinite;
  }
  
  p {
    font-size: 1.1rem;
    margin: 0;
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

export const VideoInfo = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 1.5rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    padding: 1.25rem;
  }

  @media (max-width: 480px) {
    padding: 1rem;
    border-radius: ${({ theme }) => theme.borderRadius.lg};
  }
`;

export const ThumbnailContainer = styled.div`
  flex: 0 0 300px;
  position: relative;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }

  @media (max-width: 768px) {
    flex: 0 0 auto;
    width: 100%;
    max-width: 100%;

    &:hover {
      transform: scale(1.01);
    }
  }

  @media (max-width: 480px) {
    border-radius: ${({ theme }) => theme.borderRadius.md};

    &:hover {
      transform: none;
    }
  }
`;

export const Thumbnail = styled.img`
  width: 100%;
  height: auto;
  display: block;
  max-width: 100%;
  object-fit: cover;
`;

export const ThumbnailOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 2;
  
  ${ThumbnailContainer}:hover & {
    opacity: 1;
  }
`;

export const DownloadThumbnailButton = styled.button`
  background: ${({ theme }) => theme.colors.red3};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-family: ${({ theme }) => theme.fonts.primary};
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  transform: translateY(10px);
  
  ${ThumbnailContainer}:hover & {
    transform: translateY(0);
  }
  
  &:hover {
    background: ${({ theme }) => theme.colors.red4};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
  
  i {
    font-size: 1.1rem;
  }
`;

export const VideoDuration = styled.div`
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 0, 0, 0.9);
  color: ${({ theme }) => theme.colors.white};
  padding: 0.25rem 0.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 0.85rem;
  font-weight: 600;
  z-index: 3;
`;

export const VideoDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const VideoTitle = styled.h2`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.4;
`;

export const ChannelInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const ChannelLogo = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 2px solid ${({ theme }) => theme.colors.dark5};
`;

export const ChannelText = styled.div`
  display: flex;
  flex-direction: column;
`;

export const ChannelName = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.9rem;
`;

export const SubscriberCount = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text.muted};
`;

export const ViewVideoButton = styled.button`
  align-self: flex-start;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${({ theme }) => theme.colors.red3};
  border: none;
  color: ${({ theme }) => theme.colors.white};
  padding: 0.75rem 1.25rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-family: ${({ theme }) => theme.fonts.primary};
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.red4};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }

  i {
    font-size: 1rem;
  }
  
  @media (max-width: 768px) {
    align-self: stretch;
    justify-content: center;
  }
`;

// Tab Navigation
export const TabNavigation = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid ${({ theme }) => theme.colors.dark5};
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
`;

export const TabButton = styled.button<{ isActive: boolean; disabled?: boolean }>`
  background: transparent;
  color: ${({ isActive, disabled, theme }) =>
    disabled ? theme.colors.text.muted + '60' :
    isActive ? theme.colors.red3 : theme.colors.text.muted
  };
  border: none;
  border-bottom: 3px solid ${({ isActive, disabled, theme }) =>
    disabled ? 'transparent' :
    isActive ? theme.colors.red3 : 'transparent'
  };
  padding: 1rem 1.5rem;
  margin-bottom: -2px;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: ${({ theme }) => theme.fonts.primary};
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
  opacity: ${({ disabled }) => disabled ? 0.5 : 1};

  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.colors.text.primary};
    background: ${({ theme }) => theme.colors.dark3};
  }

  &:disabled {
    pointer-events: none;
  }

  i {
    font-size: 1.1rem;
  }

  span {
    display: inline;
  }

  @media (max-width: 768px) {
    flex: 1;
    min-width: 80px;
    justify-content: center;
    padding: 0.875rem 0.75rem;
    font-size: 0.8rem;

    /* Show abbreviated text on medium mobile screens */
    span {
      display: inline;
      white-space: nowrap;
    }

    i {
      font-size: 1rem;
    }
  }

  @media (max-width: 640px) {
    padding: 0.875rem 0.5rem;
    font-size: 0.75rem;

    /* Hide text, show only icons on small screens */
    span {
      display: none;
    }

    i {
      font-size: 1.2rem;
    }
  }

  @media (max-width: 480px) {
    padding: 0.75rem 0.375rem;
    min-width: 56px;

    i {
      font-size: 1.1rem;
    }
  }
`;

export const TabContent = styled.div`
  animation: ${fadeIn} 0.4s ease-out;
`;

// Metrics Grid
export const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.875rem;
  }

  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

export const MetricCard = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    border-color: ${({ theme }) => theme.colors.red3};
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }

  @media (max-width: 768px) {
    padding: 1.25rem;

    &:hover {
      transform: translateY(-2px);
    }
  }

  @media (max-width: 480px) {
    padding: 1.125rem 1rem;
  }
`;

export const MetricIcon = styled.i`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.red3};
  margin-bottom: 0.75rem;
  display: block;
`;

export const MetricValue = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.25rem;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }

  @media (max-width: 480px) {
    font-size: 1.4rem;
  }
`;

export const MetricLabel = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
`;

export const MetricSubtext = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: 0.5rem;
`;

// Score Cards
export const ScoreGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

export const ScoreCard = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.red3};
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

export const ScoreHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

export const ScoreIcon = styled.i`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.red3};
`;

export const ScoreTitle = styled.h3`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  font-weight: 600;
`;

export const ScoreValue = styled.span`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const ScoreMax = styled.span`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.text.muted};
  margin-left: 0.25rem;
`;

export const ScoreBar = styled.div`
  width: 100%;
  height: 10px;
  background: ${({ theme }) => theme.colors.dark5};
  border-radius: 8px;
  margin-top: 1rem;
  overflow: hidden;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, 
      transparent, 
      rgba(255, 255, 255, 0.05), 
      transparent
    );
    animation: ${shimmer} 3s infinite;
  }
`;

export const ScoreBarFill = styled.div<{ width: number }>`
  height: 100%;
  width: ${({ width }) => width}%;
  background: linear-gradient(90deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4});
  border-radius: 8px;
  transition: width 1s ease-out;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    background-size: 200% 100%;
    animation: ${shimmer} 2s infinite;
  }
`;

// Detail Sections
export const DetailSection = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

export const DetailTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 1.5rem 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.25rem;
  font-weight: 600;
  
  i {
    color: ${({ theme }) => theme.colors.red3};
    font-size: 1.5rem;
  }
`;

export const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
`;

export const DetailItem = styled.div`
  padding: 1rem;
  background: ${({ theme }) => theme.colors.dark4};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  transition: all 0.3s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.dark5};
  }
`;

export const DetailLabel = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text.muted};
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const DetailValue = styled.div`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 600;
`;

// Insights Section
export const InsightSection = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

export const InsightTitle = styled.h3<{ success?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 1rem 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.25rem;
  font-weight: 600;
  
  i {
    color: ${({ success, theme }) => success ? theme.colors.success : theme.colors.red3};
    font-size: 1.5rem;
  }
`;

export const InsightItem = styled.div<{ type: 'success' | 'warning' | 'info' }>`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
  background: ${({ theme }) => theme.colors.dark4};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border-left: 3px solid ${({ type, theme }) => 
    type === 'success' ? theme.colors.success :
    type === 'warning' ? theme.colors.warning :
    theme.colors.info
  };
  color: ${({ theme }) => theme.colors.text.secondary};
  transition: all 0.3s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.dark5};
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  i {
    color: ${({ type, theme }) => 
      type === 'success' ? theme.colors.success :
      type === 'warning' ? theme.colors.warning :
      theme.colors.info
    };
    font-size: 1.1rem;
    margin-top: 0.1rem;
    flex-shrink: 0;
  }
`;

// Tags Section
export const TagsSection = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 1.5rem;
  margin: 2rem 0;
`;

export const TagsContainer = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 1.5rem;
  margin-top: 2rem;
`;

export const TagsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
`;

export const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.25rem;
  font-weight: 600;
  
  i {
    color: ${({ theme }) => theme.colors.red3};
    font-size: 1.5rem;
  }
`;

export const CopyTagsButton = styled.button`
  background: ${({ theme }) => theme.colors.dark4};
  color: ${({ theme }) => theme.colors.text.secondary};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  padding: 0.5rem 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-family: ${({ theme }) => theme.fonts.primary};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.red3};
    color: ${({ theme }) => theme.colors.white};
    border-color: ${({ theme }) => theme.colors.red3};
  }

  i {
    font-size: 1rem;
  }
`;

export const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
`;

export const Tag = styled.span`
  background: ${({ theme }) => theme.colors.dark4};
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  transition: all 0.3s ease;
  cursor: default;
  
  &:hover {
    background: ${({ theme }) => theme.colors.dark5};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

export const AnalyzableTag = styled.span`
  background: ${({ theme }) => theme.colors.dark4};
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  &:hover {
    background: ${({ theme }) => theme.colors.red3};
    color: ${({ theme }) => theme.colors.white};
    border-color: ${({ theme }) => theme.colors.red3};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

export const TagAnalyzeOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ theme }) => theme.colors.red3};
  color: ${({ theme }) => theme.colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  opacity: 0;
  transform: translateY(100%);
  transition: all 0.3s ease;
  
  ${AnalyzableTag}:hover & {
    opacity: 1;
    transform: translateY(0%);
  }
  
  i {
    font-size: 1rem;
  }
`;


// Channel Tab Components
export const PerformanceIndicator = styled.span<{ type: 'above' | 'below' | 'average' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: capitalize;
  
  background: ${({ type, theme }) => 
    type === 'above' ? 'rgba(16, 185, 129, 0.1)' :
    type === 'below' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(156, 163, 175, 0.1)'
  };
  
  color: ${({ type, theme }) => 
    type === 'above' ? theme.colors.success :
    type === 'below' ? theme.colors.error : theme.colors.text.muted
  };
  
  border: 1px solid ${({ type, theme }) => 
    type === 'above' ? theme.colors.success :
    type === 'below' ? theme.colors.error : theme.colors.text.muted
  };
  
  i {
    font-size: 1rem;
  }
`;

export const TrendIndicator = styled.span<{ trend: 'improving' | 'declining' | 'stable' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: capitalize;
  
  background: ${({ trend, theme }) => 
    trend === 'improving' ? 'rgba(16, 185, 129, 0.1)' :
    trend === 'declining' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(156, 163, 175, 0.1)'
  };
  
  color: ${({ trend, theme }) => 
    trend === 'improving' ? theme.colors.success :
    trend === 'declining' ? theme.colors.error : theme.colors.text.muted
  };
  
  border: 1px solid ${({ trend, theme }) => 
    trend === 'improving' ? theme.colors.success :
    trend === 'declining' ? theme.colors.error : theme.colors.text.muted
  };
  
  i {
    font-size: 1rem;
  }
`;

export const BestVideoCard = styled.div`
  background: ${({ theme }) => theme.colors.dark4};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.red3};
    background: ${({ theme }) => theme.colors.dark5};
  }
`;

export const BestVideoTitle = styled.h4`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  line-height: 1.4;
`;

export const BestVideoStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  span {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: 0.9rem;
    
    i {
      color: ${({ theme }) => theme.colors.red3};
    }
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
`;

export const WatchButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${({ theme }) => theme.colors.red3};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  padding: 0.5rem 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-family: ${({ theme }) => theme.fonts.primary};
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.red4};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }
  
  i {
    font-size: 1rem;
  }
`;

export const InsightsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const ChannelInsight = styled.div<{ type: 'success' | 'warning' | 'info' }>`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.dark4};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border-left: 3px solid ${({ type, theme }) => 
    type === 'success' ? theme.colors.success :
    type === 'warning' ? theme.colors.warning :
    theme.colors.info
  };
  color: ${({ theme }) => theme.colors.text.secondary};
  transition: all 0.3s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.dark5};
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  i {
    color: ${({ type, theme }) => 
      type === 'success' ? theme.colors.success :
      type === 'warning' ? theme.colors.warning :
      theme.colors.info
    };
    font-size: 1.2rem;
    flex-shrink: 0;
  }
`;

// Header Search Components
export const HeaderSearchContainer = styled.div`
  margin-top: 2rem;
  width: 100%;
  max-width: 600px;
  
  @media (max-width: 768px) {
    margin-top: 1.5rem;
    max-width: 100%;
  }
`;

export const HeaderSearchBar = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:focus-within {
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.15);
  }
`;

export const HeaderSearchInput = styled.input`
  flex: 1;
  padding: 1rem 1.5rem;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.white};
  font-size: 1rem;
  font-family: ${({ theme }) => theme.fonts.primary};
  font-weight: 500;
  min-height: 44px;

  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }

  &:focus {
    outline: none;
  }

  @media (max-width: 768px) {
    padding: 0.875rem 1.25rem;
    font-size: 0.9rem;
  }

  @media (max-width: 480px) {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }
`;

export const HeaderSearchButton = styled.button`
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: ${({ theme }) => theme.colors.white};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  min-height: 48px;
  backdrop-filter: blur(10px);

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  i {
    font-size: 1.25rem;
  }

  @media (max-width: 768px) {
    padding: 0.875rem 1.25rem;
    min-width: 52px;
    min-height: 44px;

    &:hover:not(:disabled) {
      transform: scale(1.02);
    }

    i {
      font-size: 1.15rem;
    }
  }

  @media (max-width: 480px) {
    padding: 0.75rem 1rem;
    min-width: 48px;
    min-height: 44px;

    i {
      font-size: 1.1rem;
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

// Chatbot Interface Styled Components
export const AskSection = styled.div`
  animation: ${fadeIn} 0.4s ease-out;
`;

export const ChatbotContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 600px;
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  overflow: hidden;
  
  @media (max-width: 768px) {
    height: 500px;
  }
`;

export const ChatbotHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 2rem;
  background: ${({ theme }) => theme.colors.dark4};
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark5};
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
    padding: 1rem 1.5rem;
    gap: 0.75rem;
  }
`;

export const ChatbotAvatar = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  i {
    font-size: 1.5rem;
    color: ${({ theme }) => theme.colors.white};
  }
  
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    
    i {
      font-size: 1.25rem;
    }
  }
`;

export const ChatbotHeaderText = styled.div`
  flex: 1;
  min-width: 0;
`;

export const ChatbotTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

export const ChatbotSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.4;
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

export const VideoTypeToggle = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: hidden;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const VideoTypeOption = styled.button<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${({ isActive, theme }) => isActive ? theme.colors.red3 : 'transparent'};
  color: ${({ isActive, theme }) => isActive ? theme.colors.white : theme.colors.text.secondary};
  border: none;
  font-family: ${({ theme }) => theme.fonts.primary};
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${({ isActive, theme }) => isActive ? theme.colors.red4 : theme.colors.dark4};
    color: ${({ isActive, theme }) => isActive ? theme.colors.white : theme.colors.text.primary};
  }
  
  i {
    font-size: 1rem;
  }
  
  @media (max-width: 768px) {
    flex: 1;
    justify-content: center;
    padding: 0.625rem 0.75rem;
    font-size: 0.8rem;
  }
`;

export const ConversationArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.dark5};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.red3};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.red4};
  }
`;

export const WelcomeMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 2rem;
`;

export const WelcomeIcon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  
  i {
    font-size: 2.5rem;
    color: ${({ theme }) => theme.colors.white};
  }
`;

export const WelcomeText = styled.div`
  margin-bottom: 2rem;
`;

export const WelcomeTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
`;

export const WelcomeDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
  max-width: 400px;
`;

export const SuggestedQuestions = styled.div`
  width: 100%;
  max-width: 500px;
`;

export const SuggestedTitle = styled.h4`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  text-align: left;
`;

export const SuggestedList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
`;

export const SuggestedItem = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-family: ${({ theme }) => theme.fonts.primary};
  font-size: 0.9rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.red3};
    color: ${({ theme }) => theme.colors.white};
    border-color: ${({ theme }) => theme.colors.red3};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }
  
  i {
    color: ${({ theme }) => theme.colors.red3};
    font-size: 1.1rem;
    flex-shrink: 0;
    transition: color 0.3s ease;
  }
  
  &:hover i {
    color: ${({ theme }) => theme.colors.white};
  }
`;

export const MessagesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 0;
`;

export const MessageGroup = styled.div<{ isUser: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  ${({ isUser }) => isUser ? 'flex-direction: row-reverse;' : ''}
  animation: ${slideInFromBottom} 0.3s ease-out;
`;

export const MessageAvatar = styled.div<{ isUser: boolean }>`
  width: 32px;
  height: 32px;
  background: ${({ isUser, theme }) => 
    isUser 
      ? `linear-gradient(135deg, ${theme.colors.dark5}, ${theme.colors.dark4})`
      : `linear-gradient(135deg, ${theme.colors.red4}, ${theme.colors.red5})`
  };
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  i {
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.white};
  }
`;

export const MessageBubble = styled.div<{ isUser: boolean }>`
  max-width: 80%;
  background: ${({ isUser, theme }) => 
    isUser ? theme.colors.dark5 : theme.colors.dark4
  };
  border: 1px solid ${({ isUser, theme }) => 
    isUser ? theme.colors.dark5 : theme.colors.dark4
  };
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1rem;
  position: relative;
  
  ${({ isUser }) => isUser ? 'margin-left: auto;' : ''}
  
  @media (max-width: 768px) {
    max-width: 90%;
  }
`;

export const MessageContent = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 0.5rem;
`;

export const MessageTimestamp = styled.div`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.8rem;
  text-align: right;
`;

export const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
  font-style: italic;
`;

export const TypingDot = styled.div`
  width: 6px;
  height: 6px;
  background: ${({ theme }) => theme.colors.red3};
  border-radius: 50%;
  animation: ${typing} 1.5s infinite;
`;

export const ResultPreview = styled.div`
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  &:hover {
    background: ${({ theme }) => theme.colors.red3};
    border-color: ${({ theme }) => theme.colors.red3};
    color: ${({ theme }) => theme.colors.white};
  }
`;

export const ResultPreviewIcon = styled.div`
  width: 32px;
  height: 32px;
  background: ${({ theme }) => theme.colors.red3};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  i {
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.white};
  }
`;

export const ResultPreviewText = styled.div`
  flex: 1;
`;

export const ResultPreviewTitle = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

export const ResultPreviewSubtitle = styled.div`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.8rem;
`;

export const ResultPreviewArrow = styled.div`
  color: ${({ theme }) => theme.colors.text.muted};
  
  i {
    font-size: 1.2rem;
  }
`;

export const ChatInputContainer = styled.div`
  position: relative;
  border-top: 1px solid ${({ theme }) => theme.colors.dark5};
  background: ${({ theme }) => theme.colors.dark4};
`;

export const ChatInputWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  gap: 0.75rem;
`;

export const ChatInput = styled.input`
  flex: 1;
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 0.75rem 1rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.primary};
  font-size: 0.9rem;
  resize: none;
  transition: all 0.3s ease;
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.red3};
    background: ${({ theme }) => theme.colors.dark4};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const ChatSendButton = styled.button`
  width: 40px;
  height: 40px;
  background: ${({ theme }) => theme.colors.red3};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  color: ${({ theme }) => theme.colors.white};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
  
  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.red4};
    transform: scale(1.05);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  i {
    font-size: 1.1rem;
  }
`;

export const SuggestionsDropdown = styled.div`
  position: absolute;
  bottom: 100%;
  left: 1rem;
  right: 1rem;
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  max-height: 300px;
  overflow-y: auto;
  z-index: 100;
  box-shadow: ${({ theme }) => theme.shadows.xl};
  animation: ${slideInFromBottom} 0.2s ease-out;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.dark5};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.red3};
    border-radius: 3px;
  }
`;

export const DropdownHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: ${({ theme }) => theme.colors.dark4};
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark5};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.85rem;
  font-weight: 600;
  
  i {
    color: ${({ theme }) => theme.colors.red3};
  }
`;

export const DropdownItem = styled.div<{ isSelected: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${({ isSelected, theme }) => isSelected ? theme.colors.red3 : 'transparent'};
  color: ${({ isSelected, theme }) => isSelected ? theme.colors.white : theme.colors.text.primary};
  
  &:hover {
    background: ${({ theme }) => theme.colors.red3};
    color: ${({ theme }) => theme.colors.white};
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.dark5};
  }
`;

export const DropdownItemContent = styled.div`
  flex: 1;
  min-width: 0;
`;

export const DropdownItemTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1.4;
  margin-bottom: 0.25rem;
`;

export const DropdownItemMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.25rem;
`;

export const DropdownItemCategory = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.muted};
  opacity: 0.8;
`;

export const DropdownItemComplexity = styled.span<{ complexity: 'simple' | 'medium' | 'complex' }>`
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  text-transform: capitalize;
  
  background: ${({ complexity, theme }) =>
    complexity === 'simple'
      ? 'rgba(34, 197, 94, 0.15)'
      : complexity === 'medium'
      ? 'rgba(251, 191, 36, 0.15)'
      : 'rgba(239, 68, 68, 0.15)'
  };
  
  color: ${({ complexity, theme }) =>
    complexity === 'simple'
      ? theme.colors.success
      : complexity === 'medium'
      ? theme.colors.warning
      : theme.colors.error
  };
  
  border: 1px solid ${({ complexity, theme }) =>
    complexity === 'simple'
      ? theme.colors.success
      : complexity === 'medium'
      ? theme.colors.warning
      : theme.colors.error
  };
`;

export const DropdownItemIcon = styled.div`
  color: ${({ theme }) => theme.colors.text.muted};
  flex-shrink: 0;
  
  i {
    font-size: 1rem;
  }
`;

// Results Modal Styled Components
export const ResultsModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  animation: ${fadeIn} 0.3s ease-out;
`;

export const ResultsModalBackdrop = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
`;

export const ResultsModalContent = styled.div`
  position: relative;
  width: 100%;
  max-width: 800px;
  max-height: 80vh;
  background: ${({ theme }) => theme.colors.dark2};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
`;

export const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  background: ${({ theme }) => theme.colors.dark3};
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark5};
`;

export const ResultsTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  
  i {
    color: ${({ theme }) => theme.colors.red3};
    font-size: 1.8rem;
  }
`;

export const ResultsCloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  transition: all 0.3s ease;
  
  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    background: ${({ theme }) => theme.colors.dark5};
  }
`;

export const ResultsBody = styled.div`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.dark5};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.red3};
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.red4};
  }
`;

export const QuestionDisplay = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;
`;

export const QuestionLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

export const QuestionText = styled.h4`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.4;
  
  /* Ensure long questions wrap properly */
  word-wrap: break-word;
  overflow-wrap: break-word;
`;

export const AnswerDisplay = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red1}, ${({ theme }) => theme.colors.red2});
  border: 1px solid ${({ theme }) => theme.colors.red3};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 2rem;
  text-align: center;
`;

export const AnswerLabel = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.75rem;
  font-weight: 600;
`;

export const AnswerValue = styled.div`
  color: ${({ theme }) => theme.colors.white};
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
`;

export const DetailsSection = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;
`;

export const DetailsTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  
  i {
    color: ${({ theme }) => theme.colors.red3};
  }
`;

export const DetailsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const InsightsSection = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;
`;

export const InsightsTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  
  i {
    color: ${({ theme }) => theme.colors.warning};
  }
`;

export const ChartsSection = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;
`;

export const ChartsTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  
  i {
    color: ${({ theme }) => theme.colors.info};
  }
`;

export const SimpleChart = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const ChartItem = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr 80px;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 100px 1fr 60px;
    gap: 0.75rem;
  }
`;

export const ChartLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
  font-weight: 600;
`;

export const ChartBar = styled.div`
  height: 24px;
  background: ${({ theme }) => theme.colors.dark5};
  border-radius: 8px;
  overflow: hidden;
  position: relative;
`;

export const ChartBarFill = styled.div<{ width: number }>`
  height: 100%;
  width: ${({ width }) => width}%;
  background: linear-gradient(90deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4});
  border-radius: 8px;
  transition: width 1s ease-out;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    background-size: 200% 100%;
    animation: ${shimmer} 2s infinite;
  }
`;

export const ChartValue = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.9rem;
  font-weight: 600;
  text-align: right;
`;

export const ResultsFooter = styled.div`
  padding: 1.5rem 2rem;
  background: ${({ theme }) => theme.colors.dark3};
  border-top: 1px solid ${({ theme }) => theme.colors.dark5};
`;

export const ResultsNote = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
  
  i {
    color: ${({ theme }) => theme.colors.red3};
    font-size: 1.1rem;
    flex-shrink: 0;
  }
`;

export const ResultsInsightItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.5;

  i {
    color: ${({ theme }) => theme.colors.warning};
    font-size: 1rem;
    margin-top: 0.1rem;
    flex-shrink: 0;
  }
`;

// Scorecard Breakdown Components
export const ScoreBreakdownList = styled.div`
  margin-top: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const ScoreBreakdownItem = styled.div<{ percentage: number }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: ${({ theme }) => theme.colors.dark4};
  border-left: 3px solid ${({ percentage }) =>
    percentage >= 80 ? '#10b981' :
    percentage >= 50 ? '#f59e0b' :
    '#ef4444'
  };
  border-radius: ${({ theme }) => theme.borderRadius.md};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.dark5};
    transform: translateX(3px);
  }
`;

export const ScoreBreakdownLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
`;

export const ScoreBreakdownLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const ScoreBreakdownReason = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.8rem;
  line-height: 1.4;
`;

export const ScoreBreakdownRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const ScoreBreakdownValue = styled.div<{ percentage: number }>`
  font-size: 1rem;
  font-weight: 700;
  color: ${({ percentage }) =>
    percentage >= 80 ? '#10b981' :
    percentage >= 50 ? '#f59e0b' :
    '#ef4444'
  };
  min-width: 60px;
  text-align: right;
`;

export const ScoreBreakdownBar = styled.div`
  width: 80px;
  height: 6px;
  background: ${({ theme }) => theme.colors.dark2};
  border-radius: 3px;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 60px;
  }
`;

export const ScoreBreakdownBarFill = styled.div<{ width: number; percentage: number }>`
  height: 100%;
  width: ${({ width }) => width}%;
  background: ${({ percentage }) =>
    percentage >= 80 ? 'linear-gradient(90deg, #10b981, #059669)' :
    percentage >= 50 ? 'linear-gradient(90deg, #f59e0b, #d97706)' :
    'linear-gradient(90deg, #ef4444, #dc2626)'
  };
  transition: width 0.5s ease;
  border-radius: 3px;
`;
// Channel Analyzer CTA Card
export const ChannelAnalyzerCTA = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.dark3}, ${({ theme }) => theme.colors.dark4});
  border: 2px solid ${({ theme }) => theme.colors.red4};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(229, 72, 72, 0.3);
    border-color: ${({ theme }) => theme.colors.red3};
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

export const CTAIcon = styled.div`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(229, 72, 72, 0.4);

  i {
    font-size: 2rem;
    color: white;
  }
`;

export const CTATitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
`;

export const CTADescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
  max-width: 600px;
`;

export const CTAButton = styled.button`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
  color: white;
  border: none;
  padding: 0.875rem 2rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-family: ${({ theme }) => theme.fonts.primary};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(229, 72, 72, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(229, 72, 72, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  i {
    font-size: 1.2rem;
  }
`;

// Insight Cards for Overview
export const InsightsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const InsightCard = styled.div<{ type: "success" | "warning" | "info" }>`
  background: ${({ theme }) => theme.colors.dark3};
  border-left: 4px solid ${({ type }) =>
    type === "success" ? "#10b981" :
    type === "warning" ? "#f59e0b" :
    "#3b82f6"
  };
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 1.25rem;
  display: flex;
  gap: 1rem;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
`;

export const InsightCardIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.1);

  i {
    font-size: 1.5rem;
  }
`;

export const InsightCardContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const InsightCardTitle = styled.div`
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const InsightCardText = styled.div`
  font-size: 0.9rem;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.text.primary};
`;
