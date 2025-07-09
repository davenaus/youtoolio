// src/pages/Tools/components/YouTubeTranscript/styles.ts
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

// Step Indicator
export const StepIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 3rem;
  
  @media (max-width: 768px) {
    margin-bottom: 2rem;
  }
`;

export const Step = styled.div<{ active: boolean; completed: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

export const StepNumber = styled.div<{ active?: boolean; completed?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  background: ${({ theme, active, completed }) => 
    completed ? `linear-gradient(135deg, ${theme.colors.success || '#4caf50'}, ${theme.colors.success || '#388e3c'})` :
    active ? `linear-gradient(135deg, ${theme.colors.red3}, ${theme.colors.red4})` :
    theme.colors.dark4
  };
  border: 2px solid ${({ theme, active, completed }) => 
    completed ? (theme.colors.success || '#4caf50') :
    active ? theme.colors.red3 :
    theme.colors.dark5
  };
  transition: all 0.3s ease;
`;

export const StepLabel = styled.span<{ active?: boolean; completed?: boolean }>`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${({ theme, active, completed }) => 
    active || completed ? theme.colors.text.primary : theme.colors.text.secondary
  };
  transition: color 0.3s ease;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

export const StepConnector = styled.div<{ completed?: boolean }>`
  width: 60px;
  height: 2px;
  background: ${({ theme, completed }) => 
    completed ? (theme.colors.success || '#4caf50') : theme.colors.dark5
  };
  margin: 0 1rem;
  transition: background 0.3s ease;
  
  @media (max-width: 768px) {
    width: 30px;
    margin: 0 0.5rem;
  }
`;

// Common Components
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

export const CardTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  
  i {
    color: ${({ theme }) => theme.colors.red3};
    font-size: 1.4rem;
  }
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
`;

export const SecondaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: ${({ theme }) => theme.colors.dark4};
  color: ${({ theme }) => theme.colors.text.primary};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  padding: 1rem 2rem;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: ${({ theme }) => theme.fonts.primary};

  &:hover {
    background: ${({ theme }) => theme.colors.dark5};
    border-color: ${({ theme }) => theme.colors.red3};
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  i {
    font-size: 1.2rem;
  }
`;

// Step 1: Input Section
export const InputSection = styled.div`
  animation: fadeIn 0.3s ease-in-out;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

export const UrlCard = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 2rem;
  margin-bottom: 2rem;
`;

export const UrlInput = styled.input`
  width: 100%;
  padding: 1rem 1.5rem;
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;
  font-family: ${({ theme }) => theme.fonts.primary};
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

export const UrlExamples = styled.div`
  margin-top: 1rem;
  text-align: center;
  
  span {
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: 0.9rem;
    font-weight: 600;
    display: block;
    margin-bottom: 0.5rem;
  }
  
  div {
    color: ${({ theme }) => theme.colors.text.muted};
    font-size: 0.85rem;
    font-family: 'JetBrains Mono', monospace;
  }
`;

export const OptionsCard = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 2rem;
  margin-bottom: 2rem;
`;

export const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const OptionGroup = styled.div``;

export const OptionLabel = styled.label`
  display: block;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
`;

export const Select = styled.select`
  width: 100%;
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
  }
`;

export const FormatOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
`;

export const FormatOption = styled.button<{ active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: ${({ theme, active }) => active ? theme.colors.red3 : theme.colors.dark4};
  color: ${({ theme, active }) => active ? theme.colors.white : theme.colors.text.secondary};
  border: 1px solid ${({ theme, active }) => active ? theme.colors.red3 : theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme, active }) => active ? theme.colors.red2 : theme.colors.dark5};
  }
  
  i {
    font-size: 1.2rem;
  }
  
  div {
    font-size: 0.85rem;
    font-weight: 500;
  }
`;

export const CheckboxOption = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: ${({ theme }) => theme.colors.red3};
`;

export const CheckboxLabel = styled.label`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.9rem;
  cursor: pointer;
`;

export const HistoryCard = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 2rem;
  margin-bottom: 2rem;
`;

export const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const HistoryItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.red3};
    transform: translateY(-1px);
  }
`;

export const HistoryIcon = styled.div`
  width: 40px;
  height: 40px;
  background: ${({ theme }) => theme.colors.red3}20;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  i {
    font-size: 1.2rem;
    color: ${({ theme }) => theme.colors.red3};
  }
`;

export const HistoryDetails = styled.div`
  flex: 1;
`;

export const HistoryTitle = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const HistoryMeta = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.8rem;
`;

export const ErrorMessage = styled.div`
  background: ${({ theme }) => theme.colors.red2 || '#ffebee'};
  border: 1px solid ${({ theme }) => theme.colors.red3 || '#f44336'};
  color: ${({ theme }) => theme.colors.red5 || '#c62828'};
  padding: 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: 2rem;
  text-align: center;
`;

export const BackendRecommendation = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.dark4};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  text-align: left;
  
  strong {
    color: ${({ theme }) => theme.colors.text.primary};
    display: block;
    margin-bottom: 0.5rem;
  }
  
  ul {
    margin: 0;
    padding-left: 1.5rem;
    
    li {
      color: ${({ theme }) => theme.colors.text.secondary};
      font-size: 0.9rem;
      margin-bottom: 0.25rem;
    }
  }
`;

// Step 2: Processing Section
export const ProcessingSection = styled.div`
  animation: fadeIn 0.3s ease-in-out;
`;

export const ProcessingCard = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 3rem 2rem;
  text-align: center;
`;

export const ProcessingSteps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

export const ProcessingStep = styled.div<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: ${({ theme, active }) => active ? theme.colors.dark4 : theme.colors.dark4};
  border: 1px solid ${({ theme, active }) => active ? theme.colors.red3 : theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  opacity: ${({ active }) => active ? 1 : 0.5};
  transition: all 0.3s ease;
  
  i {
    font-size: 1.2rem;
    color: ${({ theme, active }) => active ? theme.colors.red3 : theme.colors.text.secondary};
  }
  
  span {
    color: ${({ theme, active }) => active ? theme.colors.text.primary : theme.colors.text.secondary};
    font-weight: 500;
  }
`;

export const ProcessingNote = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-style: italic;
  font-size: 0.9rem;
`;

// Step 3: Results Section
export const ResultSection = styled.div`
  animation: fadeIn 0.3s ease-in-out;
`;

export const VideoInfoCard = styled.div`
  display: flex;
  gap: 1.5rem;
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const VideoThumbnail = styled.div`
  flex-shrink: 0;
  
  img {
    width: 200px;
    height: 112px;
    object-fit: cover;
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    border: 1px solid ${({ theme }) => theme.colors.dark5};
    
    @media (max-width: 768px) {
      width: 100%;
      height: 200px;
    }
  }
`;

export const VideoDetails = styled.div`
  flex: 1;
`;

export const VideoTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  line-height: 1.4;
`;

export const VideoMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
  
  span:nth-child(2) {
    opacity: 0.5;
  }
`;

export const TranscriptCard = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 2rem;
  margin-bottom: 2rem;
`;

export const TranscriptHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
`;

export const TranscriptActions = styled.div`
  display: flex;
  gap: 0.75rem;
`;

export const TranscriptContent = styled.div`
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;
  max-height: 400px;
  overflow-y: auto;
  white-space: pre-wrap;
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.6;
  font-size: 0.95rem;
  margin-bottom: 1rem;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.dark4};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.dark4};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.red3};
  }
`;

export const TranscriptStats = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
`;

export const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.85rem;
  
  i {
    color: ${({ theme }) => theme.colors.red3};
  }
`;

export const BottomAdContainer = styled.div`
  margin: 3rem 0 0 0;
  text-align: center;
  
  @media (min-width: 1401px) {
    display: none;
  }
`;