// src/pages/Tools/components/KeywordAnalyzer/styles.ts
import styled, { keyframes } from 'styled-components';

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(229, 72, 72, 0.4); }
  50% { box-shadow: 0 0 40px rgba(229, 72, 72, 0.8); }
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

// Enhanced Header Components
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
  gap: 0.5rem;
  background: ${({ theme }) => theme.colors.error || '#f44336'}15;
  border: 1px solid ${({ theme }) => theme.colors.error || '#f44336'}30;
  color: ${({ theme }) => theme.colors.error || '#f44336'};
  padding: 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-top: 1rem;
  font-size: 0.9rem;
  
  i {
    font-size: 1.1rem;
    flex-shrink: 0;
  }
`;

export const HistorySection = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 1.5rem;
  margin-bottom: 1rem;
`;

export const HistoryLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 600;
  margin-bottom: 1rem;
`;

export const HistoryList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

export const HistoryItem = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  color: ${({ theme }) => theme.colors.text.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: ${({ theme }) => theme.fonts.primary};
  font-size: 0.9rem;
  
  &:hover {
    background: ${({ theme }) => theme.colors.dark5};
    color: ${({ theme }) => theme.colors.text.primary};
    border-color: ${({ theme }) => theme.colors.red3};
  }
  
  i {
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.red3};
  }
`;

export const LoadingContainer = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 3rem;
  text-align: center;
  margin-bottom: 2rem;
`;

export const LoadingAnimation = styled.div`
  i {
    font-size: 3rem;
    color: ${({ theme }) => theme.colors.red3};
    margin-bottom: 1rem;
  }
`;

export const LoadingText = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
`;

export const LoadingSteps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 300px;
  margin: 0 auto;
`;

export const LoadingStep = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
  text-align: left;
  
  &::before {
    content: '•';
    color: ${({ theme }) => theme.colors.red3};
    margin-right: 0.5rem;
  }
`;

export const ResultsContainer = styled.div`
  animation: fadeIn 0.5s ease-in-out;
  
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
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

export const SectionTitle = styled.h2`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 2rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  
  i {
    color: ${({ theme }) => theme.colors.red3};
    font-size: 1.75rem;
  }
`;

// Premium Overview Section - Ultra Premium Design
export const PremiumOverviewSection = styled.div`
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.colors.dark4}95,
    ${({ theme }) => theme.colors.dark4}90,
    ${({ theme }) => theme.colors.dark4}85
  );
  border: 1px solid ${({ theme }) => theme.colors.red3}20;
  border-radius: 24px;
  padding: 0;
  margin-bottom: 3rem;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(20px);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 20%, ${({ theme }) => theme.colors.red1}15 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, ${({ theme }) => theme.colors.red2}10 0%, transparent 50%),
      linear-gradient(135deg, ${({ theme }) => theme.colors.red3}05, transparent 60%);
    z-index: 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent, 
      ${({ theme }) => theme.colors.red3}60, 
      transparent
    );
    z-index: 2;
  }
  
  > * {
    position: relative;
    z-index: 1;
  }
  
  @media (max-width: 768px) {
    border-radius: 20px;
  }
`;

export const PremiumOverviewHeader = styled.div`
  padding: 2rem 3rem 1rem 3rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark5}40;
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.colors.dark1}30,
    ${({ theme }) => theme.colors.dark2}20
  );
  
  @media (max-width: 768px) {
    padding: 1.5rem 2rem 1rem 2rem;
  }
`;

export const PremiumOverviewContent = styled.div`
  padding: 2rem 3rem 3rem 3rem;
  
  @media (max-width: 768px) {
    padding: 1.5rem 2rem 2rem 2rem;
  }
`;

export const PremiumOverviewGrid = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 3rem;
  align-items: start;
  
  @media (max-width: 1700px) {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
`;

// Tag Score Hero Card - Enhanced
export const TagScoreHeroCard = styled.div`
  position: relative;
  background: linear-gradient(145deg, 
    ${({ theme }) => theme.colors.dark5}90,
    ${({ theme }) => theme.colors.dark4}95,
    ${({ theme }) => theme.colors.dark4}90
  );
  border: 1px solid ${({ theme }) => theme.colors.red3}25;
  border-radius: 20px;
  padding: 3rem 2.5rem;
  overflow: hidden;
  backdrop-filter: blur(15px);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 120px;
    height: 120px;
    background: radial-gradient(circle, ${({ theme }) => theme.colors.red2}20 0%, transparent 70%);
    border-radius: 50%;
    transform: translate(30%, -30%);
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 80px;
    height: 80px;
    background: radial-gradient(circle, ${({ theme }) => theme.colors.red1}15 0%, transparent 70%);
    border-radius: 50%;
    transform: translate(-30%, 30%);
  }
`;

export const TagScoreContent = styled.div`
  position: relative;
  z-index: 2;
`;

export const TagScoreLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.9rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.75rem;
`;

export const TagScoreHeroNumber = styled.div<{ color: string }>`
  font-size: 4.5rem;
  font-weight: 900;
  color: ${props => props.color};
  line-height: 0.9;
  margin-bottom: 1rem;
  display: flex;
  align-items: baseline;
  text-shadow: 0 4px 8px ${props => props.color}30;
  
  @media (max-width: 768px) {
    font-size: 3.5rem;
  }
`;

export const TagScoreOutOf = styled.span`
  font-size: 1.8rem;
  color: ${({ theme }) => theme.colors.text.muted};
  font-weight: 600;
  margin-left: 0.5rem;
  opacity: 0.8;
  
  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`;

export const TagScoreQuality = styled.div<{ score: number }>`
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: ${({ score, theme }) => {
    if (score >= 70) return `linear-gradient(135deg, ${theme.colors.success || '#4caf50'}20, ${theme.colors.success || '#4caf50'}30)`;
    if (score >= 50) return `linear-gradient(135deg, ${theme.colors.warning || '#ff9800'}20, ${theme.colors.warning || '#ff9800'}30)`;
    if (score >= 30) return `linear-gradient(135deg, ${theme.colors.error || '#f44336'}20, ${theme.colors.error || '#f44336'}30)`;
    return `linear-gradient(135deg, ${theme.colors.error || '#f44336'}30, ${theme.colors.error || '#f44336'}40)`;
  }};
  color: ${({ score, theme }) => {
    if (score >= 70) return theme.colors.success || '#4caf50';
    if (score >= 50) return theme.colors.warning || '#ff9800';
    if (score >= 30) return theme.colors.error || '#f44336';
    return theme.colors.error || '#f44336';
  }};
  border: 1px solid ${({ score, theme }) => {
    if (score >= 70) return `${theme.colors.success || '#4caf50'}60`;
    if (score >= 50) return `${theme.colors.warning || '#ff9800'}60`;
    if (score >= 30) return `${theme.colors.error || '#f44336'}60`;
    return `${theme.colors.error || '#f44336'}70`;
  }};
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 1.5rem;
  backdrop-filter: blur(5px);
  box-shadow: 0 4px 12px ${({ score, theme }) => {
    if (score >= 70) return `${theme.colors.success || '#4caf50'}30`;
    if (score >= 50) return `${theme.colors.warning || '#ff9800'}30`;
    if (score >= 30) return `${theme.colors.error || '#f44336'}30`;
    return `${theme.colors.error || '#f44336'}40`;
  }};
`;

export const TagScoreDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1rem;
  line-height: 1.6;
  margin: 0 0 1.5rem 0;
  opacity: 0.9;
`;

// Integrated Chart Components
export const IntegratedChartContainer = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.dark5}40;
`;

export const IntegratedChartTitle = styled.h4`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  opacity: 0.9;
  
  i {
    color: ${({ theme }) => theme.colors.red3};
    font-size: 1.1rem;
  }
`;

export const TagScoreIcon = styled.div`
  position: absolute;
  top: 2rem;
  right: 2rem;
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4});
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
  box-shadow: 0 8px 20px ${({ theme }) => theme.colors.red3}40;
  
  i {
    font-size: 2.2rem;
    color: ${({ theme }) => theme.colors.white};
  }
`;

// Enhanced Metrics Cards Container
export const MetricsCardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
`;

export const PremiumMetricCard = styled.div`
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.colors.dark4}85,
    ${({ theme }) => theme.colors.dark5}90
  );
  border: 1px solid ${({ theme }) => theme.colors.dark5}40;
  border-radius: 16px;
  padding: 1.75rem;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(180deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4});
    opacity: 0;
    transition: all 0.4s ease;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 60px;
    height: 60px;
    background: radial-gradient(circle, ${({ theme }) => theme.colors.red2}15 0%, transparent 70%);
    border-radius: 50%;
    transform: translate(30%, -30%);
    transition: all 0.4s ease;
  }
  
  &:hover {
    background: linear-gradient(135deg, 
      ${({ theme }) => theme.colors.dark3}90,
      ${({ theme }) => theme.colors.dark4}85
    );
    border-color: ${({ theme }) => theme.colors.red3}60;
    transform: translateX(8px);
    box-shadow: 0 8px 25px ${({ theme }) => theme.colors.dark1}60;
    
    &::before {
      opacity: 1;
    }
    
    &::after {
      background: radial-gradient(circle, ${({ theme }) => theme.colors.red2}25 0%, transparent 70%);
    }
  }
`;

export const MetricCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
`;

export const MetricCardIcon = styled.i`
  font-size: 1.75rem;
  color: ${({ theme }) => theme.colors.red3};
  transition: all 0.3s ease;
`;

export const MetricCardTitle = styled.h4`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
`;

export const MetricProgressContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;
`;

export const MetricProgressBar = styled.div`
  flex: 1;
  height: 10px;
  background: ${({ theme }) => theme.colors.dark5};
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 2px 4px ${({ theme }) => theme.colors.dark1}40;
`;

export const MetricProgressFill = styled.div<{ width: number; color: string; delay: string }>`
  height: 100%;
  background: linear-gradient(90deg, ${props => props.color}, ${props => props.color}80);
  border-radius: 20px;
  width: ${props => props.width}%;
  transform: scaleX(0);
  transform-origin: left;
  animation: fillProgress 1.2s ease ${props => props.delay} forwards;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, 
      transparent, 
      ${props => props.color}40, 
      transparent
    );
    animation: shimmer 2s ease-in-out infinite;
  }
  
  @keyframes fillProgress {
    to {
      transform: scaleX(1);
    }
  }
  
  @keyframes shimmer {
    0%, 100% { opacity: 0; }
    50% { opacity: 1; }
  }
`;

export const MetricScoreContainer = styled.div`
  text-align: right;
  min-width: 85px;
`;

export const MetricScore = styled.div`
  font-size: 1.6rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1;
  margin-bottom: 0.25rem;
`;

export const MetricLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 600;
  margin-bottom: 0.75rem;
  font-size: 1.1rem;
`;

// Enhanced Trend Components
export const TrendContainer = styled.div`
  text-align: center;
  padding: 0.5rem 0;
`;

export const TrendValue = styled.div<{ color: string }>`
  font-size: 1.6rem;
  font-weight: 800;
  color: ${props => props.color};
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px ${props => props.color}30;
`;

export const TrendSubtext = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.muted};
  font-weight: 500;
  opacity: 0.8;
`;

// Detailed Metrics Grid
export const DetailedMetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

export const MetricCard = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 2rem;
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
  font-size: 2.5rem;
  color: ${({ theme }) => theme.colors.red3};
  margin-bottom: 1rem;
  display: block;
`;

export const DetailedMetricValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

// Upload Time Distribution Chart
export const ChartSection = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 2rem;
  margin-bottom: 3rem;
  
  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
    overflow-x: hidden;
  }
`;

export const UploadTimeChart = styled.div`
  width: 100%;
`;

export const ChartTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

export const ChartSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.9rem;
  margin: 0 0 2rem 0;
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
    margin-bottom: 1.5rem;
  }
`;

export const HeatmapContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  
  @media (max-width: 480px) {
    transform: scale(0.7);
    margin-bottom: -60px;
  }
`;

export const HourLabels = styled.div`
  display: grid;
  grid-template-columns: 60px repeat(24, minmax(12px, 1fr));
  gap: 2px;
  margin-bottom: 0.5rem;
  position: relative;
  width: 100%;
  min-width: 500px;
`;

export const HourLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.75rem;
  text-align: center;
  position: absolute;
  transform: translateX(-50%);
  top: 0;
  
  @media (max-width: 768px) {
    font-size: 0.7rem;
  }
`;

export const HeatmapGrid = styled.div`
  display: flex;
  gap: 0.5rem;
  width: 100%;
  min-width: 500px;
`;

export const DayLabels = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 60px;
`;

export const DayLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.85rem;
  height: 15px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 0.5rem;
`;

export const HeatmapRows = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const HeatmapRow = styled.div`
  display: grid;
  grid-template-columns: repeat(24, minmax(12px, 1fr));
  gap: 2px;
  width: 100%;
`;

export const HeatmapCell = styled.div<{ color: string }>`
  width: 15px;
  height: 15px;
  background: ${props => props.color};
  border-radius: 2px;
  transition: opacity 0.2s ease;
  
  @media (max-width: 768px) {
    width: 12px;
    height: 12px;
  }
`;

export const HeatmapLegend = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text.muted};
`;

export const LegendGradient = styled.div`
  width: 100px;
  height: 10px;
  background: linear-gradient(90deg, #28a745, #fac11b, #d73527);
  border-radius: 5px;
`;

// Mobile Summary Components
export const MobileSummaryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1rem 0;
`;

export const MobileSummaryBar = styled.div`
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.dark5};
    border-color: ${({ theme }) => theme.colors.red3};
  }
`;

export const MobileSummaryLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  
  strong {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1rem;
    font-weight: 600;
  }
  
  span {
    color: ${({ theme }) => theme.colors.text.muted};
    font-size: 0.9rem;
  }
`;

export const MobileSummaryProgress = styled.div`
  width: 100%;
  height: 12px;
  background: ${({ theme }) => theme.colors.dark5};
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 0.75rem;
  box-shadow: inset 0 2px 4px ${({ theme }) => theme.colors.dark1}40;
`;

export const MobileSummaryFill = styled.div<{ intensity: number; color: string }>`
  width: ${props => Math.max(5, props.intensity * 100)}%;
  height: 100%;
  background: linear-gradient(90deg, ${props => props.color}, ${props => props.color}80);
  border-radius: 6px;
  position: relative;
  transition: width 0.8s ease;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, 
      transparent, 
      ${props => props.color}40, 
      transparent
    );
    animation: shimmer 2s ease-in-out infinite;
  }
  
  @keyframes shimmer {
    0%, 100% { opacity: 0; }
    50% { opacity: 1; }
  }
`;

export const MobileSummaryStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  span {
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: 0.85rem;
    
    &:first-child {
      font-weight: 600;
      color: ${({ theme }) => theme.colors.red5};
    }
  }
`;


// Upload Insights Section
export const UploadInsightsSection = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 2rem;
  margin-bottom: 3rem;
`;

export const UploadInsightsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

export const InsightCard = styled.div`
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;
`;

export const InsightTitle = styled.h4`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
`;

export const OptimalTime = styled.div`
  color: ${({ theme }) => theme.colors.red4};
  font-size: 1.25rem;
  font-weight: 700;
`;

export const TimesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const TimeItem = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
  padding: 0.5rem;
  background: ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

export const AnalysisGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

export const AnalysisCard = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 2rem;
`;

export const CardTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  
  i {
    color: ${({ theme }) => theme.colors.red3};
    font-size: 1.5rem;
  }
`;

export const InsightItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark5};
  
  &:last-child {
    border-bottom: none;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
`;

export const InsightLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;
`;

export const InsightValue = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 600;
`;

export const TagScoreBadge = styled.span<{ color: string }>`
  background: ${props => props.color};
  color: ${({ theme }) => theme.colors.white};
  padding: 0.25rem 0.75rem;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 0.85rem;
  font-weight: 600;
`;

export const DaysList = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

export const DayBadge = styled.span`
  background: ${({ theme }) => theme.colors.dark4};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 0.25rem 0.75rem;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 0.85rem;
  border: 1px solid ${({ theme }) => theme.colors.dark5};
`;

export const KeywordsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

export const KeywordTag = styled.button`
  background: ${({ theme }) => theme.colors.dark4};
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 0.5rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: ${({ theme }) => theme.fonts.primary};
  
  &:hover {
    background: ${({ theme }) => theme.colors.red3};
    color: ${({ theme }) => theme.colors.white};
    border-color: ${({ theme }) => theme.colors.red3};
    transform: translateY(-1px);
  }
`;

export const KeywordNote = styled.p`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.85rem;
  margin: 0;
  font-style: italic;
`;

export const TopVideosSection = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 2rem;
  margin-bottom: 3rem;
`;

export const VideosList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const VideoCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.dark5};
    border-color: ${({ theme }) => theme.colors.red3};
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

export const VideoRank = styled.div`
  background: ${({ theme }) => theme.colors.red3};
  color: ${({ theme }) => theme.colors.white};
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  flex-shrink: 0;
`;

export const VideoThumbnail = styled.img`
  width: 120px;
  height: 68px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  object-fit: cover;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    width: 160px;
    height: 90px;
  }
`;

export const VideoInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const VideoTitle = styled.h4`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const VideoChannel = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

export const VideoMeta = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

export const VideoMetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.85rem;
  
  i {
    color: ${({ theme }) => theme.colors.red3};
  }
`;

export const VideoAction = styled.a`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${({ theme }) => theme.colors.red3};
  color: ${({ theme }) => theme.colors.white};
  padding: 0.75rem 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  flex-shrink: 0;
  
  &:hover {
    background: ${({ theme }) => theme.colors.red2};
    transform: translateY(-1px);
  }
  
  i {
    font-size: 1.1rem;
  }
`;

export const RecommendationsSection = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 2rem;
  margin-bottom: 3rem;
`;

export const RecommendationsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const Recommendation = styled.div<{ type: 'success' | 'info' | 'warning' }>`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme, type }) => {
    switch (type) {
      case 'success': return `${theme.colors.success || '#4caf50'}15`;
      case 'info': return `${theme.colors.info || '#2196f3'}15`;
      case 'warning': return `${theme.colors.warning || '#ff9800'}15`;
      default: return theme.colors.dark4;
    }
  }};
  border: 1px solid ${({ theme, type }) => {
    switch (type) {
      case 'success': return `${theme.colors.success || '#4caf50'}30`;
      case 'info': return `${theme.colors.info || '#2196f3'}30`;
      case 'warning': return `${theme.colors.warning || '#ff9800'}30`;
      default: return theme.colors.dark5;
    }
  }};
  
  i {
    font-size: 1.25rem;
    margin-top: 0.125rem;
    flex-shrink: 0;
    color: ${({ theme, type }) => {
      switch (type) {
        case 'success': return theme.colors.success || '#4caf50';
        case 'info': return theme.colors.info || '#2196f3';
        case 'warning': return theme.colors.warning || '#ff9800';
        default: return theme.colors.red3;
      }
    }};
  }
  
  div {
    color: ${({ theme }) => theme.colors.text.secondary};
    line-height: 1.5;

    strong {
      color: ${({ theme }) => theme.colors.text.primary};
    }
  }
`;

export const RecommendationCard = styled.div<{ rating: string }>`
  background: ${({ theme }) => theme.colors.dark4};
  border: 2px solid ${({ theme, rating }) => {
    switch (rating) {
      case 'excellent': return '#4caf50';
      case 'good': return '#ffc107';
      case 'fair': return '#ff9800';
      case 'poor': return '#f44336';
      default: return theme.colors.dark5;
    }
  }};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

export const RecommendationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  gap: 1rem;
`;

export const RecommendationMetric = styled.h4`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
`;

export const RecommendationRating = styled.span<{ rating: string }>`
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  white-space: nowrap;
  background: ${({ rating }) => {
    switch (rating) {
      case 'excellent': return '#4caf5020';
      case 'good': return '#ffc10720';
      case 'fair': return '#ff980020';
      case 'poor': return '#f4433620';
      default: return '#2196f320';
    }
  }};
  color: ${({ rating }) => {
    switch (rating) {
      case 'excellent': return '#4caf50';
      case 'good': return '#ffc107';
      case 'fair': return '#ff9800';
      case 'poor': return '#f44336';
      default: return '#2196f3';
    }
  }};
`;

export const RecommendationValue = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

export const RecommendationAction = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
`;

export const BottomAdContainer = styled.div`
  margin: 3rem 0 0 0;
  text-align: center;
  
  @media (min-width: 1401px) {
    display: none;
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

  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }

  &:focus {
    outline: none;
  }
  
  @media (max-width: 768px) {
    padding: 0.875rem 1.25rem;
    font-size: 0.9rem;
    min-width: 0;
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
