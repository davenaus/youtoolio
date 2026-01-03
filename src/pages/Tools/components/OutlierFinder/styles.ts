// src/pages/Tools/components/OutlierFinder/styles.ts
import styled, { keyframes } from 'styled-components';

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(229, 72, 72, 0.4); }
  50% { box-shadow: 0 0 40px rgba(229, 72, 72, 0.8); }
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
    border-color: ${({ theme }) => theme.colors.dark5};
    color: ${({ theme }) => theme.colors.text.primary};
    transform: translateX(-2px);
  }
  
  i {
    font-size: 1.1rem;
  }
`;

export const SearchContainer = styled.div`
  max-width: 700px;
  margin: 0 auto 2rem auto;
`;

export const SearchBar = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
  
  &:focus-within {
    border-color: ${({ theme }) => theme.colors.red3};
    box-shadow: 0 0 0 3px rgba(125, 0, 0, 0.1);
  }
`;

export const SearchInput = styled.input`
  flex: 1;
  padding: 1rem;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;
  font-family: ${({ theme }) => theme.fonts.primary};

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }

  &:focus {
    outline: none;
  }
`;

export const SearchButton = styled.button`
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4});
  border: none;
  color: ${({ theme }) => theme.colors.white};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.red2}, ${({ theme }) => theme.colors.red3});
    transform: translateX(2px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  i {
    font-size: 1.25rem;
  }
`;

export const ControlsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-shrink: 0;
  margin-top: 1rem;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
    margin-top: 1rem;
  }
`;

export const ToggleContainer = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  backdrop-filter: blur(10px);

  @media (max-width: 768px) {
    flex: 1;
  }
`;

export const ToggleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-family: ${({ theme }) => theme.fonts.primary};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: ${({ theme }) => theme.colors.white};
  }

  &.active {
    background: rgba(255, 255, 255, 0.2);
    color: ${({ theme }) => theme.colors.white};
  }

  i {
    font-size: 1rem;
  }

  @media (max-width: 768px) {
    flex: 1;
    padding: 0.875rem 1rem;
    font-size: 0.85rem;
  }
`;

export const FilterToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.7);
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-family: ${({ theme }) => theme.fonts.primary};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  white-space: nowrap;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: ${({ theme }) => theme.colors.white};
  }

  i {
    font-size: 1rem;
  }

  @media (max-width: 768px) {
    padding: 0.875rem 1rem;
    font-size: 0.85rem;
  }
`;

export const SearchHistory = styled.div`
  margin-top: 1rem;
  text-align: center;
`;

export const HistoryLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  display: block;
`;

export const HistoryTags = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
`;

export const HistoryTag = styled.button`
  padding: 0.25rem 0.75rem;
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  color: ${({ theme }) => theme.colors.text.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.red3};
    border-color: ${({ theme }) => theme.colors.red3};
    color: ${({ theme }) => theme.colors.white};
  }
`;

export const FiltersContainer = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 1.5rem;
  margin-bottom: 2rem;
  animation: fadeIn 0.3s ease-in-out;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

export const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const FilterLabel = styled.label`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.9rem;
  font-weight: 500;
`;

export const FilterSelect = styled.select`
  padding: 0.75rem;
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.primary};
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.red3};
  }
  
  option {
    background: ${({ theme }) => theme.colors.dark4};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

export const LoadingContainer = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  
  i {
    font-size: 3rem;
    color: ${({ theme }) => theme.colors.red3};
    margin-bottom: 1rem;
  }
  
  p {
    font-size: 1.1rem;
    margin: 0;
  }
`;

export const ResultsContainer = styled.div`
  display: none;
  animation: fadeIn 0.3s ease-in-out;

  &.visible {
    display: block;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

export const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
`;

export const ResultsTitle = styled.h2`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

export const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  color: ${({ theme }) => theme.colors.text.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-family: ${({ theme }) => theme.fonts.primary};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.red3};
    border-color: ${({ theme }) => theme.colors.red3};
    color: ${({ theme }) => theme.colors.white};
    transform: translateY(-2px);
  }
  
  i {
    font-size: 1.1rem;
  }
`;

export const ResultsList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

export const ResultCard = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 2px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  /* Add subtle gradient background */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg,
      ${({ theme }) => theme.colors.red3},
      ${({ theme }) => theme.colors.red4},
      ${({ theme }) => theme.colors.red5}
    );
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  @media (max-width: 768px) {
    padding: 1rem;
  }

  &:hover {
    transform: translateY(-4px);
    border-color: ${({ theme }) => theme.colors.red3};
    box-shadow: 0 12px 40px rgba(229, 72, 72, 0.3);

    &::before {
      opacity: 1;
    }
  }
`;

export const CardHeader = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 2;
`;

export const RatioBadge = styled.div<{ ratio: number }>`
  background: ${({ ratio }) => {
    if (ratio >= 50) return 'linear-gradient(135deg, #d32f2f, #b71c1c)';      // Deep Red - Epic!
    if (ratio >= 20) return 'linear-gradient(135deg, #f57c00, #e65100)';      // Deep Orange - Amazing!
    if (ratio >= 10) return 'linear-gradient(135deg, #ff9800, #f57700)';      // Orange - Great!
    if (ratio >= 5) return 'linear-gradient(135deg, #ffb300, #ff8f00)';       // Amber - Good
    return 'linear-gradient(135deg, #546e7a, #37474f)';                       // Blue Gray - Decent
  }};
  color: ${({ theme }) => theme.colors.white};
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 800;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  border: 3px solid rgba(255, 255, 255, 0.3);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
  position: relative;

  /* Add pulsing animation for high ratios */
  ${({ ratio }) => ratio >= 20 && `
    animation: pulse 2s ease-in-out infinite;

    @keyframes pulse {
      0%, 100% {
        box-shadow: 0 6px 20px rgba(229, 72, 72, 0.4);
      }
      50% {
        box-shadow: 0 6px 30px rgba(229, 72, 72, 0.8);
      }
    }
  `}

  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
    font-size: 0.9rem;
  }
`;

export const ThumbnailContainer = styled.div`
  width: 100%;
  position: relative;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  margin-bottom: 0.5rem;
`;

export const Thumbnail = styled.img`
  width: 100%;
  height: auto;
  aspect-ratio: 16/9;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  transition: transform 0.3s ease;

  ${ResultCard}:hover & {
    transform: scale(1.05);
  }
`;

export const VideoDuration = styled.div`
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 0, 0, 0.8);
  color: ${({ theme }) => theme.colors.white};
  padding: 0.25rem 0.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 0.8rem;
  font-weight: 600;
`;

export const VideoInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;

  @media (max-width: 768px) {
    gap: 0.75rem;
  }
`;

export const VideoTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.3;

  @media (max-width: 768px) {
    font-size: 0.9rem;
    padding-right: 0;
    line-height: 1.25;
  }
`;

export const ChannelInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
`;

export const ChannelName = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

export const VideoDate = styled.span`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.85rem;

  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }
`;

export const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0.75rem;
  background: ${({ theme }) => theme.colors.dark4};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.dark5};

  @media (max-width: 768px) {
    padding: 0.5rem;
  }
`;

export const StatIcon = styled.i`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.red3};
  margin-bottom: 0.25rem;

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 0.15rem;
  }
`;

export const StatValue = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.1rem;

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

export const StatLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (max-width: 768px) {
    font-size: 0.65rem;
    letter-spacing: 0.3px;
  }
`;

export const MetricsRow = styled.div`
  display: flex;
  gap: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

export const Metric = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const MetricLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
`;

export const MetricValue = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 600;
  font-size: 0.9rem;
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: auto;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

export const VideoLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${({ theme }) => theme.colors.red3};
  color: ${({ theme }) => theme.colors.white};
  text-decoration: none;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-family: ${({ theme }) => theme.fonts.primary};
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.red2};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }

  i {
    font-size: 1.1rem;
  }

  @media (max-width: 768px) {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;

    i {
      font-size: 1rem;
    }
  }
`;

export const AnalyzeButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  color: ${({ theme }) => theme.colors.text.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-family: ${({ theme }) => theme.fonts.primary};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.red3};
    border-color: ${({ theme }) => theme.colors.red3};
    color: ${({ theme }) => theme.colors.white};
    transform: translateY(-2px);
  }

  i {
    font-size: 1.1rem;
  }

  @media (max-width: 768px) {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;

    i {
      font-size: 1rem;
    }
  }
`;

export const NoResults = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  
  i {
    font-size: 4rem;
    color: ${({ theme }) => theme.colors.red3};
    margin-bottom: 1rem;
  }
  
  h3 {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1.5rem;
    margin: 0 0 0.5rem 0;
  }
  
  p {
    font-size: 1rem;
    margin: 0;
  }
`;

export const BottomAdContainer = styled.div`
  margin: 2rem 0;
  text-align: center;
  
  @media (min-width: 1401px) {
    display: none;
  }
`;

// Enhanced Header Components
export const EnhancedHeader = styled.div<{ backgroundImage: string }>`
  position: relative;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red1}, ${({ theme }) => theme.colors.red2});
  border: 1px solid ${({ theme }) => theme.colors.red3};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 3rem 2rem;
  margin-bottom: 2rem;
  overflow: hidden;
  
  /* Background image with low opacity */
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
  
  /* Additional gradient overlay for better text readability */
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

// Header Search Components
export const HeaderSearchContainer = styled.div`
  margin-top: 2rem;
  width: 100%;
  display: flex;
  gap: 1rem;
  align-items: stretch;

  @media (max-width: 768px) {
    margin-top: 1.5rem;
    flex-direction: column;
    gap: 1rem;
  }
`;

export const HeaderSearchBar = styled.div`
  display: flex;
  flex: 1;
  max-width: 600px;
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

  @media (max-width: 768px) {
    width: 100%;
    max-width: 100%;
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
    min-width: 55px;
    
    i {
      font-size: 1.1rem;
    }
  }
`;

// Educational Content Styled Components 
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

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

export const OutlierFinderStepTitle = styled.h4`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
`;

export const OutlierFinderBottomAdContainer = styled.div`
  margin: 2rem 0;
  text-align: center;
  
  @media (min-width: 1401px) {
    display: none;
  }
`;