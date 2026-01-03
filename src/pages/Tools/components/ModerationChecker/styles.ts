// src/pages/Tools/components/ModerationChecker/styles.ts
import styled, { keyframes } from 'styled-components';

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(229, 72, 72, 0.4); }
  50% { box-shadow: 0 0 40px rgba(229, 72, 72, 0.8); }
`;

// Educational Content Styled Components - SUBSTANTIAL CONTENT FOR ADSENSE APPROVAL
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

export const BottomAdContainer = styled.div`
  margin: 2rem 0;
  text-align: center;
  
  @media (min-width: 1401px) {
    display: none;
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

export const Header = styled.div`
  margin-bottom: 3rem;
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

export const AnalysisContainer = styled.div`
  max-width: 800px;
  margin: 0 auto 3rem auto;
`;

export const InputSection = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 2rem;
  margin-bottom: 2rem;
`;

export const SectionTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  
  i {
    color: ${({ theme }) => theme.colors.red3};
    font-size: 1.75rem;
  }
`;

export const ContentTypeSelector = styled.div`
  margin-bottom: 1.5rem;
`;

export const TypeLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 600;
  margin-bottom: 1rem;
`;

export const TypeOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const TypeOption = styled.button<{ active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: ${({ theme, active }) => active ? theme.colors.red3 : theme.colors.dark4};
  color: ${({ theme, active }) => active ? theme.colors.white : theme.colors.text.secondary};
  border: 1px solid ${({ theme, active }) => active ? theme.colors.red3 : theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: ${({ theme }) => theme.fonts.primary};
  font-size: 0.85rem;
  font-weight: 500;
  
  &:hover {
    background: ${({ theme, active }) => active ? theme.colors.red2 : theme.colors.dark5};
    border-color: ${({ theme }) => theme.colors.red3};
  }
  
  i {
    font-size: 1.25rem;
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;
  font-family: ${({ theme }) => theme.fonts.primary};
  line-height: 1.5;
  resize: vertical;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.red3};
    box-shadow: 0 0 0 3px rgba(125, 0, 0, 0.1);
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

export const CharacterCount = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0.75rem 0 1.5rem 0;
  
  span {
    color: ${({ theme }) => theme.colors.text.muted};
    font-size: 0.9rem;
  }
`;

export const Warning = styled.span`
  color: ${({ theme }) => theme.colors.warning || '#ff9800'} !important;
  font-weight: 500;
`;

export const AnalyzeButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4});
  border: none;
  color: ${({ theme }) => theme.colors.white};
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
`;

export const HistorySection = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 1.5rem;
`;

export const HistoryLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 600;
  margin-bottom: 1rem;
`;

export const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const HistoryItem = styled.button`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
  
  &:hover {
    background: ${({ theme }) => theme.colors.dark5};
    border-color: ${({ theme }) => theme.colors.red3};
  }
  
  i {
    font-size: 1.5rem;
    color: ${({ theme }) => theme.colors.red3};
    flex-shrink: 0;
  }
`;

export const HistoryContent = styled.div`
  flex: 1;
  min-width: 0;
`;

export const HistoryText = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 500;
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const HistoryMeta = styled.div`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.85rem;
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

export const NewAnalysisButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 0.75rem 1.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-family: ${({ theme }) => theme.fonts.primary};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.red3};
    border-color: ${({ theme }) => theme.colors.red3};
    color: ${({ theme }) => theme.colors.white};
  }
`;

export const OverallScore = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 2rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

export const ScoreCircle = styled.div<{ riskLevel: string }>`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: conic-gradient(
    ${props => {
      switch (props.riskLevel) {
        case 'Safe': return '#4caf50';
        case 'Low Risk': return '#8bc34a';
        case 'Medium Risk': return '#ff9800';
        case 'High Risk': return '#f44336';
        default: return '#607d8b';
      }
    }} 0deg,
    ${({ theme }) => theme.colors.dark5} 0deg
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
  
  &::before {
    content: '';
    position: absolute;
    inset: 8px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.dark3};
  }
`;

export const ScoreValue = styled.div`
  position: relative;
  z-index: 1;
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const ScoreLabel = styled.div`
  position: relative;
  z-index: 1;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: -0.25rem;
`;

export const ScoreDetails = styled.div`
  flex: 1;
`;

export const RiskLevel = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.color};
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
  
  i {
    font-size: 1.5rem;
  }
`;

export const ScoreDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
`;

export const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const CategoryCard = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.red3};
    transform: translateY(-2px);
  }
`;

export const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  
  i {
    font-size: 1.5rem;
    color: ${({ theme }) => theme.colors.red3};
    flex-shrink: 0;
  }
`;

export const CategoryName = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

export const CategoryScore = styled.div<{ severity: string }>`
  color: ${({ theme, severity }) => {
    switch (severity.toLowerCase()) {
      case 'low': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'high': return '#f44336';
      default: return theme.colors.text.secondary;
    }
  }};
  font-weight: 700;
`;

export const DetectedItems = styled.div`
  margin-top: 0.75rem;
`;

export const DetectedLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
`;

export const DetectedList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

export const DetectedWord = styled.span`
  background: ${({ theme }) => theme.colors.dark4};
  color: ${({ theme }) => theme.colors.text.muted};
  padding: 0.25rem 0.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 0.8rem;
  border: 1px solid ${({ theme }) => theme.colors.dark5};
`;

export const ConfidenceLevel = styled.div`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.85rem;
  margin-top: 0.5rem;
`;

export const IndicatorsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const Indicator = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.85rem;
  
  &::before {
    content: '•';
    color: ${({ theme }) => theme.colors.red3};
    margin-right: 0.5rem;
  }
`;

export const SentimentSection = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 2rem;
  margin-bottom: 2rem;
`;

export const SentimentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const SentimentCard = styled.div<{ sentiment: string }>`
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;
  text-align: center;
  border-left: 4px solid ${({ sentiment }) => {
    switch (sentiment) {
      case 'positive': return '#4caf50';
      case 'negative': return '#f44336';
      case 'neutral': return '#ff9800';
      default: return '#607d8b';
    }
  }};
`;

export const SentimentValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.5rem;
`;

export const SentimentLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const OverallSentiment = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: ${props => props.color};
  font-size: 1.1rem;
  font-weight: 600;
  text-transform: capitalize;
`;

export const SuggestionsSection = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 2rem;
  margin-bottom: 2rem;
`;

export const SuggestionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const Suggestion = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border-left: 4px solid ${({ theme }) => theme.colors.red3};
  
  i {
    color: ${({ theme }) => theme.colors.red3};
    font-size: 1.2rem;
    margin-top: 0.125rem;
    flex-shrink: 0;
  }
  
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.5;
`;

export const FlaggedWordsSection = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 2rem;
  margin-bottom: 2rem;
`;

export const FlaggedWordsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
`;

export const FlaggedWord = styled.div<{ severity: string }>`
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme, severity }) => {
    switch (severity.toLowerCase()) {
      case 'low': return '#4caf5030';
      case 'medium': return '#ff980030';
      case 'high': return '#f4433630';
      default: return theme.colors.dark5;
    }
  }};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1rem;
  border-left: 4px solid ${({ severity }) => {
    switch (severity.toLowerCase()) {
      case 'low': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'high': return '#f44336';
      default: return '#607d8b';
    }
  }};
`;

export const WordText = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-family: 'JetBrains Mono', monospace;
  background: ${({ theme }) => theme.colors.dark5};
  padding: 0.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
`;

export const WordDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const WordCategory = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.85rem;
  text-transform: capitalize;
`;

export const WordSeverity = styled.span<{ severity: string }>`
  color: ${({ severity }) => {
    switch (severity.toLowerCase()) {
      case 'low': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'high': return '#f44336';
      default: return '#607d8b';
    }
  }};
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
`;

export const ModerationCheckerBottomAdContainer = styled.div`
  margin: 3rem 0 0 0;
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
  margin-bottom: 3rem;
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