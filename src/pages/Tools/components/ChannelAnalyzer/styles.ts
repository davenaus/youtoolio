// src/pages/Tools/components/ChannelAnalyzer/styles.ts
import styled from 'styled-components';

export const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.dark2};
  display: flex;
  justify-content: center;
  position: relative;
`;

export const AdSidebar = styled.div<{ position: 'left' | 'right' }>`
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  ${({ position }) => position}: 20px;
  width: 160px;
  z-index: 10;
  
  @media (max-width: 1275px) {
    display: none;
  }
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

export const Header = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

export const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 0.5rem 1rem;
  border-radius: 8px;
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

export const Title = styled.h1`
  font-size: 2.5rem;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4});
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
  font-weight: 700;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

export const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1.1rem;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

export const SearchContainer = styled.div`
  max-width: 600px;
  margin: 0 auto 2rem auto;
`;

export const SearchBar = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  margin-bottom: 0.5rem;
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

export const ChannelInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.dark3}, ${({ theme }) => theme.colors.dark2});
  border: 1px solid ${({ theme }) => theme.colors.red3};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 2rem;
  gap: 2rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red3});
  }
  

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 1.5rem;
    gap: 1.5rem;
    text-align: center;
  }
`;

export const ChannelLogoContainer = styled.div`
  flex: 0 0 auto;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: ${({ theme }) => theme.borderRadius.full};
    background: linear-gradient(45deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red3});
    z-index: -1;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover::after {
    opacity: 1;
  }
  
  @media (max-width: 768px) {
    align-self: center;
  }
`;

export const ChannelLogo = styled.img`
  width: 100px;
  height: 100px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  border: 4px solid ${({ theme }) => theme.colors.dark5};
  transition: all 0.3s ease;
  box-shadow: ${({ theme }) => theme.shadows.md};
  
  &:hover {
    border-color: transparent;
    transform: scale(1.05);
    box-shadow: ${({ theme }) => theme.shadows.xl};
  }
`;

export const ChannelDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const ChannelName = styled.h2`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.text.primary}, ${({ theme }) => theme.colors.gray3});
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  @media (max-width: 768px) {
    font-size: 1.6rem;
  }
`;

export const ChannelMeta = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    justify-items: center;
  }
`;

export const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1rem;
  font-weight: 500;
  background: ${({ theme }) => theme.colors.dark4};
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  transition: all 0.2s ease;
  
  
  i {
    color: ${({ theme }) => theme.colors.red3};
    font-size: 1.2rem;
    flex-shrink: 0;
  }
`;

export const VisitButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4});
  color: ${({ theme }) => theme.colors.white};
  padding: 1rem 2rem;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  align-self: flex-start;
  box-shadow: ${({ theme }) => theme.shadows.md};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &::after {
    content: '';
    position: relative;
    z-index: 1;
  }
  
  span, i {
    position: relative;
    z-index: 1;
  }
  
  @media (max-width: 768px) {
    align-self: center;
    padding: 1rem 1.5rem;
  }

  &:hover {
    transform: translateY(-3px);
    
    &::before {
      opacity: 1;
    }
  }
  
  i {
    font-size: 1.2rem;
    transition: transform 0.3s ease;
  }
  
  &:hover i {
    transform: translateX(2px);
  }
`;

export const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

export const MetricCard = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4});
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-4px);
    border-color: ${({ theme }) => theme.colors.red3};
    box-shadow: ${({ theme }) => theme.shadows.lg};
    
    &::before {
      opacity: 1;
    }
  }
`;

export const MetricIcon = styled.i`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.red3};
  margin-bottom: 0.5rem;
  display: block;
`;

export const MetricValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.25rem;
  
  @media (max-width: 480px) {
    font-size: 1.25rem;
  }
`;

export const MetricLabel = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const BrandingSection = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

export const BrandingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
`;

export const BrandingItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

export const BrandingPreview = styled.div`
  width: 220px;
  height: 220px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  border: 2px solid ${({ theme }) => theme.colors.dark5};
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.red3};
    transform: scale(1.05);
  }
`;

export const BrandingImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const BrandingLabel = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.5rem;
`;

export const ViewButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: ${({ theme }) => theme.colors.dark4};
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 0.5rem 1rem;
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.red3};
    color: ${({ theme }) => theme.colors.white};
    transform: translateY(-2px);
  }
`;

export const AnalysisGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

export const AnalysisSection = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 1.5rem;
`;

export const SectionTitle = styled.h3`
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

export const Achievement = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.4;
  
  i {
    color: ${({ theme }) => theme.colors.success};
    font-size: 1.1rem;
    margin-top: 0.1rem;
    flex-shrink: 0;
  }
`;

export const Drawback = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.4;
  
  i {
    color: ${({ theme }) => theme.colors.warning};
    font-size: 1.1rem;
    margin-top: 0.1rem;
    flex-shrink: 0;
  }
`;

// New Detailed Analysis Styles
export const DetailedAnalysisGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

export const DetailedSection = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 1.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.red3};
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

export const DescriptionContainer = styled.div`
  margin-top: 1rem;
`;

export const DescriptionText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.6;
  font-size: 0.95rem;
  margin: 0 0 1rem 0;
  background: ${({ theme }) => theme.colors.dark4};
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid ${({ theme }) => theme.colors.red3};
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.dark5};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.red3};
    border-radius: 3px;
  }
`;

export const DescriptionStats = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

export const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.9rem;
  background: ${({ theme }) => theme.colors.dark2};
  padding: 0.5rem 0.75rem;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  
  i {
    color: ${({ theme }) => theme.colors.red3};
    font-size: 1rem;
  }
`;

export const EmptyState = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: ${({ theme }) => theme.colors.text.muted};
  font-style: italic;
  padding: 2rem;
  text-align: center;
  background: ${({ theme }) => theme.colors.dark4};
  border-radius: 8px;
  border: 2px dashed ${({ theme }) => theme.colors.dark5};
  
  i {
    color: ${({ theme }) => theme.colors.red3};
    font-size: 1.2rem;
    opacity: 0.7;
  }
`;

export const KeywordContainer = styled.div`
  margin-top: 1rem;
`;

export const KeywordList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

export const KeywordTag = styled.span`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4});
  color: ${({ theme }) => theme.colors.white};
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }
`;

export const CategoryContainer = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const CategoryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.dark4};
  border-radius: 8px;
  border-left: 4px solid ${({ theme }) => theme.colors.red3};
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

export const CategoryLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 600;
  font-size: 0.9rem;
`;

export const CategoryValue = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 500;
  background: ${({ theme }) => theme.colors.dark2};
  padding: 0.25rem 0.75rem;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

export const PerformanceContainer = styled.div`
  margin-top: 1rem;
  display: grid;
  gap: 1rem;
`;

export const PerformanceMetric = styled.div`
  padding: 1rem;
  background: ${({ theme }) => theme.colors.dark4};
  border-radius: 8px;
  border-left: 4px solid ${({ theme }) => theme.colors.red3};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.dark2};
    transform: translateX(4px);
  }
`;

export const MetricTitle = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
`;

export const MetricDescription = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
  line-height: 1.4;
`;

// Content Strategy Styles
export const ContentStrategyContainer = styled.div`
  margin-top: 1rem;
  display: grid;
  gap: 1rem;
`;

export const StrategyMetric = styled.div`
  padding: 1rem;
  background: ${({ theme }) => theme.colors.dark4};
  border-radius: 8px;
  border-left: 4px solid ${({ theme }) => theme.colors.red3};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.dark2};
    transform: translateX(4px);
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }
`;

// Engagement Insights Styles
export const EngagementContainer = styled.div`
  margin-top: 1rem;
  display: grid;
  gap: 1rem;
`;

export const EngagementMetric = styled.div`
  padding: 1rem;
  background: ${({ theme }) => theme.colors.dark4};
  border-radius: 8px;
  border-left: 4px solid ${({ theme }) => theme.colors.red3};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.dark2};
    transform: translateX(4px);
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }
`;

export const EngagementDetail = styled.div`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.8rem;
  margin-top: 0.5rem;
  font-style: italic;
  opacity: 0.8;
`;

export const BottomAdContainer = styled.div`
  margin: 2rem 0;
  text-align: center;
  
  @media (min-width: 1401px) {
    display: none;
  }
`;