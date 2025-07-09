// src/pages/Tools/components/CommentDownloader/styles.ts
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

export const ToggleContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const ToggleButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  color: ${({ theme }) => theme.colors.text.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-family: ${({ theme }) => theme.fonts.primary};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.dark4};
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  &.active {
    background: ${({ theme }) => theme.colors.red3};
    border-color: ${({ theme }) => theme.colors.red3};
    color: ${({ theme }) => theme.colors.white};
  }
  
  i {
    font-size: 1rem;
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
  margin-bottom: 1rem;
  
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

export const FilterInput = styled.input`
  padding: 0.75rem;
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.primary};
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.red3};
  }
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

export const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
`;

export const Checkbox = styled.input`
  width: 1.25rem;
  height: 1.25rem;
  accent-color: ${({ theme }) => theme.colors.red3};
  cursor: pointer;
`;

export const CheckboxLabel = styled.label`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.9rem;
  cursor: pointer;
`;

export const BatchContainer = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 1.5rem;
  margin-bottom: 2rem;
  animation: fadeIn 0.3s ease-in-out;
`;

export const BatchLabel = styled.label`
  display: block;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
`;

export const BatchTextarea = styled.textarea`
  width: 100%;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.primary};
  resize: vertical;
  min-height: 120px;
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.red3};
  }
`;

export const BatchButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4});
  border: none;
  color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-family: ${({ theme }) => theme.fonts.primary};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 1rem;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.red2}, ${({ theme }) => theme.colors.red3});
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  i {
    font-size: 1.1rem;
  }
`;

export const Status = styled.div`
  text-align: center;
  margin: 1rem 0;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.95rem;
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

export const VideoInfo = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 2rem;
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 1.5rem;
  gap: 1.5rem;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
  }
`;

export const ThumbnailContainer = styled.div`
  flex: 0 0 30%;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;

  @media (max-width: 768px) {
    flex: 0 0 100%;
  }
`;

export const Thumbnail = styled.img`
  width: 100%;
  height: auto;
  display: block;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
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
  line-height: 1.3;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

export const VideoMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
  
  i {
    color: ${({ theme }) => theme.colors.red3};
    font-size: 1rem;
  }
`;

// New Batch Results Styles
export const BatchResultsSection = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

export const BatchResultsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

export const BatchResultItem = styled.div<{ success: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme, success }) => success ? theme.colors.success || '#4caf50' : theme.colors.warning || '#f44336'};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border-left: 4px solid ${({ success }) => success ? '#4caf50' : '#f44336'};
`;

export const BatchResultIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  i {
    font-size: 1.25rem;
  }
`;

export const BatchResultDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const BatchResultVideoId = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 500;
  font-size: 0.9rem;
`;

export const BatchResultComments = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.85rem;
`;

export const BatchResultError = styled.div`
  color: ${({ theme }) => theme.colors.warning || '#f44336'};
  font-size: 0.85rem;
`;

export const BatchSummary = styled.div`
  text-align: center;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 600;
`;

export const DownloadSection = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 1.5rem;
  margin-bottom: 2rem;
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

export const DownloadGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const DownloadButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
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
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
  
  i {
    font-size: 1.25rem;
  }
`;

export const TopCommentsSection = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

export const CommentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const CommentItem = styled.div`
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1rem;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.red3};
  }
`;

export const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

export const CommentAuthor = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 600;
  font-size: 0.9rem;
`;

export const CommentLikes = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.85rem;
  
  i {
    color: ${({ theme }) => theme.colors.red3};
  }
`;

export const CommentText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.4;
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
`;

export const CommentDate = styled.span`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.8rem;
`;

export const AILinks = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: center;
`;

export const AILinkText = styled.p`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0 0 1rem 0;
`;

export const AIButtonGrid = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

export const AIButton = styled.button<{ color: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${({ color }) => color};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-family: ${({ theme }) => theme.fonts.primary};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
  
  i {
    font-size: 1.1rem;
  }
`;

export const BottomAdContainer = styled.div`
  margin: 2rem 0;
  text-align: center;
  
  @media (min-width: 1401px) {
    display: none;
  }
`;