// src/pages/Tools/components/ThumbnailTester/styles.ts
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









// New wrapper for the side-by-side layout
export const UploadAndFormWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
  align-items: start;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

// Modified UploadArea to work in the grid
export const UploadArea = styled.div`
  /* Remove margin-bottom since it's now in a grid */
  display: flex;
  flex-direction: column;
`;

// New wrapper for the form inputs (title and channel name)
export const MainFormInputs = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

// Modified FormSection to only contain the profile picture section
export const FormSection = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 2rem;
  margin-top: 2rem; /* Add top margin since it's now separate */
`;

// Optional: Add a label for the upload section to match the form styling
export const UploadSectionLabel = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  i {
    color: ${({ theme }) => theme.colors.red3};
    font-size: 1.2rem;
  }
`;

// Updated ThumbnailUpload to work better in the new layout
export const ThumbnailUpload = styled.div`
  width: 100%;
  aspect-ratio: 16/9;
  background: ${({ theme }) => theme.colors.dark3};
  border: 2px dashed ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.red3};
    background: ${({ theme }) => theme.colors.dark4};
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
  max-width: 700px;
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
  color: ${({ theme, active, completed }) => 
    active || completed ? theme.colors.white : theme.colors.text.secondary
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

// Section Components
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
  max-width: 800px;
  margin: 0 auto;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

export const UploadedImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
`;

export const UploadPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  gap: 1rem;
  
  i {
    font-size: 3rem;
    color: ${({ theme }) => theme.colors.red3};
  }
  
  div {
    color: ${({ theme }) => theme.colors.text.primary};
    font-weight: 600;
    font-size: 1.2rem;
  }
  
  span {
    color: ${({ theme }) => theme.colors.text.muted};
    font-size: 0.9rem;
  }
`;


export const InputGroup = styled.div`
  margin-bottom: 1.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const InputLabel = styled.label`
  display: block;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
`;

export const TextInput = styled.input`
  width: 100%;
  padding: 1rem;
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

export const OptionalSection = styled.div`
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;
  margin-top: 2rem;
`;

export const OptionalTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  
  i {
    color: ${({ theme }) => theme.colors.red3};
    font-size: 1.3rem;
  }
`;

export const ProfileUpload = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  background: ${({ theme }) => theme.colors.dark5};
  border: 2px dashed ${({ theme }) => theme.colors.dark5};
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0 auto;
  overflow: hidden;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.red3};
    background: ${({ theme }) => theme.colors.dark4};
  }
`;

export const ProfilePreview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const ProfilePlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
  
  i {
    font-size: 1.5rem;
    color: ${({ theme }) => theme.colors.red3};
  }
  
  span {
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: 0.8rem;
  }
`;

// Step 2: Preview Section
export const PreviewSection = styled.div`
  animation: fadeIn 0.3s ease-in-out;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

export const PreviewControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

// YouTube-like Preview Components
export const YouTubePreviewContainer = styled.div<{ darkMode: boolean }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

export const YouTubePreviewCard = styled.div<{ darkMode: boolean }>`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    border-color: ${({ theme }) => theme.colors.red3};
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

export const PreviewCardHeader = styled.div`
  padding: 1rem;
  background: ${({ theme }) => theme.colors.dark3};
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark5};
`;

export const PreviewCardTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  
  i {
    color: ${({ theme }) => theme.colors.red3};
    font-size: 1.3rem;
  }
`;

export const PreviewCardDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.4;
`;

export const YouTubeVideoContainer = styled.div<{ layout: string; darkMode: boolean }>`
  padding: 16px;
  background: ${({ theme, darkMode }) => darkMode ? '#0f0f0f' : '#ffffff'};
  color: ${({ theme, darkMode }) => darkMode ? '#ffffff' : '#0f0f0f'};
  font-family: 'Roboto', sans-serif;
  display: ${({ layout }) => layout === 'sidebar' || layout === 'search-results' ? 'flex' : 'block'};
  gap: ${({ layout }) => layout === 'sidebar' || layout === 'search-results' ? '12px' : '0'};
`;

export const YouTubeThumbnailContainer = styled.div<{ layout?: string }>`
  position: relative;
  width: ${({ layout }) => {
    switch (layout) {
      case 'home-small': return '168px';
      case 'sidebar': return '168px';
      case 'search-results': return '360px';
      default: return '100%';
    }
  }};
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: ${({ layout }) => 
    layout === 'sidebar' || layout === 'search-results' ? '0' : '12px'
  };

  @media (max-width: 768px) {
    width: ${({ layout }) => {
      switch (layout) {
        case 'sidebar': return '168px';
        case 'search-results': return '100%';
        default: return '100%';
      }
    }};
  }
`;

export const YouTubeThumbnailImage = styled.img`
  width: 100%;
  height: auto;
  display: block;
  aspect-ratio: 16/9;
  object-fit: cover;
`;

export const YouTubeVideoTime = styled.div`
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 2px 4px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 2px;
  font-family: 'Roboto', sans-serif;
`;

export const YouTubeVideoInfo = styled.div<{ layout?: string }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
`;

export const YouTubeProfilePicture = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
`;

export const YouTubeVideoDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

export const YouTubeVideoTitle = styled.div<{ darkMode: boolean; layout?: string }>`
  font-weight: 500;
  font-size: ${({ layout }) => 
    layout === 'search-results' ? '18px' : '14px'
  };
  line-height: ${({ layout }) => 
    layout === 'search-results' ? '1.4' : '1.3'
  };
  margin-bottom: 4px;
  color: ${({ darkMode }) => darkMode ? '#ffffff' : '#0f0f0f'};
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  font-family: 'Roboto', sans-serif;
`;

export const YouTubeChannelName = styled.div<{ darkMode: boolean }>`
  font-size: 12px;
  color: ${({ darkMode }) => darkMode ? '#aaaaaa' : '#606060'};
  margin-bottom: 2px;
  font-family: 'Roboto', sans-serif;
`;

export const YouTubeVideoMetadata = styled.div<{ darkMode: boolean }>`
  font-size: 12px;
  color: ${({ darkMode }) => darkMode ? '#aaaaaa' : '#606060'};
  font-family: 'Roboto', sans-serif;
`;

// Comparison Options
export const ComparisonOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const ComparisonCard = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 2rem;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.red3};
    transform: translateY(-2px);
  }
`;

export const ComparisonCardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  i {
    font-size: 2rem;
    color: ${({ theme }) => theme.colors.red3};
    flex-shrink: 0;
    margin-top: 0.25rem;
  }
  
  div {
    flex: 1;
    
    h3 {
      color: ${({ theme }) => theme.colors.text.primary};
      font-size: 1.2rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
    }
    
    p {
      color: ${({ theme }) => theme.colors.text.secondary};
      font-size: 0.9rem;
      margin: 0;
      line-height: 1.4;
    }
  }
`;

export const ChannelInputGroup = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
  
  ${TextInput} {
    flex: 1;
  }
  
  ${PrimaryButton} {
    white-space: nowrap;
  }
`;

// Step 3: Comparison Section
export const ComparisonSection = styled.div`
  animation: fadeIn 0.3s ease-in-out;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

export const ComparisonContainer = styled.div`
  margin-bottom: 2rem;
`;

export const ComparisonHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
`;

export const ComparisonTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  
  i {
    color: ${({ theme }) => theme.colors.red3};
    font-size: 1.4rem;
  }
`;

export const ComparisonControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

export const LayoutToggle = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: hidden;
`;

export const LayoutButton = styled.button<{ active: boolean }>`
  padding: 0.5rem 0.75rem;
  background: ${({ theme, active }) => active ? theme.colors.red3 : 'transparent'};
  color: ${({ theme, active }) => active ? theme.colors.white : theme.colors.text.secondary};
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme, active }) => active ? theme.colors.red2 : theme.colors.dark5};
    color: ${({ theme }) => theme.colors.white};
  }
  
  i {
    font-size: 1rem;
  }
`;

export const DarkModeToggle = styled.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
`;

export const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
`;

export const ThemeSlider = styled.span<{ isChecked: boolean }>`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ isChecked, theme }) => 
    isChecked ? theme.colors.dark4 : theme.colors.gray3};
  transition: .4s;
  border-radius: 34px;

  i {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    font-size: 16px;
    z-index: 1;
    
    &.bx-sun {
      right: 8px;
      color: ${({ isChecked, theme }) => 
        isChecked ? theme.colors.text.muted : theme.colors.red3};
    }
    
    &.bx-moon {
      left: 8px;
      color: ${({ isChecked, theme }) => 
        isChecked ? theme.colors.red3 : theme.colors.text.muted};
    }
  }

  &:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: ${({ theme }) => theme.colors.white};
    transition: .4s;
    border-radius: 50%;
    transform: ${({ isChecked }) => isChecked ? 'translateX(26px)' : 'translateX(0)'};
    z-index: 2;
  }
`;

// YouTube Homepage-like Comparison
export const YouTubeHomePage = styled.div<{ layout: string; darkMode: boolean }>`
  background: ${({ darkMode }) => darkMode ? '#0f0f0f' : '#ffffff'};
  padding: 24px;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  
  display: ${({ layout }) => layout === 'grid' ? 'grid' : 'flex'};
  ${({ layout }) => layout === 'grid' ? `
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  ` : `
    flex-direction: column;
    gap: 12px;
  `}
  
  @media (max-width: 768px) {
    padding: 16px;
    ${({ layout }) => layout === 'grid' ? `
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    ` : ''}
  }
`;

export const YouTubeHomeVideo = styled.div<{ isUser?: boolean; layout: string; darkMode: boolean }>`
  background: transparent;
  border-radius: 12px;
  transition: all 0.2s ease;
  cursor: pointer;
  display: ${({ layout }) => layout === 'list' ? 'flex' : 'block'};
  gap: ${({ layout }) => layout === 'list' ? '16px' : '0'};
  padding: ${({ layout }) => layout === 'list' ? '12px' : '0'};
  
  ${({ isUser, theme }) => isUser && `
    border-radius: 12px;
    padding: 8px;
  `}
  
  &:hover {
    transform: translateY(-2px);
  }
`;

export const YouTubeHomeThumbnail = styled.div<{ layout: string }>`
  position: relative;
  width: ${({ layout }) => layout === 'list' ? '246px' : '100%'};
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: ${({ layout }) => layout === 'list' ? '0' : '12px'};
`;

export const YouTubeHomeVideoInfo = styled.div<{ layout: string }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: ${({ layout }) => layout === 'list' ? '1' : 'none'};
`;

export const YouTubeHomeVideoTitle = styled.div<{ darkMode: boolean; layout: string }>`
  font-weight: 500;
  font-size: ${({ layout }) => layout === 'list' ? '16px' : '14px'};
  line-height: 1.3;
  margin-bottom: 4px;
  color: ${({ darkMode }) => darkMode ? '#ffffff' : '#0f0f0f'};
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  font-family: 'Roboto', sans-serif;
`;

export const BottomAdContainer = styled.div`
  margin: 3rem 0 0 0;
  text-align: center;
  
  @media (min-width: 1401px) {
    display: none;
  }
`;







