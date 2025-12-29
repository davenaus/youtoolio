// src/pages/Tools/styles.ts
import styled from 'styled-components';

export const Container = styled.div`
  padding: 0;
  padding-bottom: 8rem;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.dark2};
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 1440px) {
    padding: 0 2rem 8rem 2rem;
  }

  @media (max-width: 768px) {
    padding: 0 1rem 5rem 1rem;
  }
`;

export const Header = styled.div`
  margin-bottom: 3rem;
  padding: 2rem 2rem 0 2rem;
  
  @media (max-width: 768px) {
    padding: 2rem 1rem 0 1rem;
    margin-bottom: 2rem;
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
  min-height: 44px;

  &:hover {
    background: ${({ theme }) => theme.colors.dark4};
    border-color: ${({ theme }) => theme.colors.dark5};
    color: ${({ theme }) => theme.colors.text.primary};
    transform: translateX(-2px);
  }

  i {
    font-size: 1.1rem;
  }

  @media (max-width: 768px) {
    padding: 0.625rem 1.125rem;
    margin-bottom: 1.5rem;

    &:hover {
      transform: translateX(-1px);
    }
  }

  @media (max-width: 480px) {
    padding: 0.75rem 1.25rem;
    font-size: 0.875rem;
    margin-bottom: 1.25rem;

    &:hover {
      transform: none;
    }

    i {
      font-size: 1rem;
    }
  }
`;

export const HeaderContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 5rem;
  
  @media (max-width: 1368px) {
    flex-direction: column;
    gap: 2rem;
  }
`;

export const HeaderLeft = styled.div`
  flex: 0 0 auto;
  max-width: 800px;
`;

export const HeaderRight = styled.div`
  flex: 1;
  position: relative;
  
  @media (max-width: 1368px) {
    flex: 1;
    width: 100%;
  }
`;

export const Title = styled.h1`
  font-size: 2.5rem;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
  font-weight: 700;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

export const Description = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1.1rem;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

// Search Components
export const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  margin-top: 0.75rem;
`;

export const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 0.875rem 1.25rem;
  transition: all 0.2s ease;
  min-height: 56px;

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.red3};
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }

  i {
    color: ${({ theme }) => theme.colors.text.muted};
    margin-right: 1rem;
    font-size: 1.25rem;
  }

  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    min-height: 52px;

    i {
      font-size: 1.15rem;
      margin-right: 0.75rem;
    }
  }

  @media (max-width: 480px) {
    padding: 0.625rem 0.875rem;
    min-height: 48px;

    i {
      font-size: 1.1rem;
      margin-right: 0.625rem;
    }
  }
`;

export const SearchInput = styled.input`
  flex: 1;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.primary};
  font-size: 1rem;
  outline: none;
  min-height: 32px;

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }

  @media (max-width: 768px) {
    font-size: 0.95rem;
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

export const ClearButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.muted};
  cursor: pointer;
  padding: 0.5rem;
  margin-left: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  min-width: 44px;
  min-height: 44px;

  &:hover {
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  i {
    font-size: 1.25rem;
  }

  @media (max-width: 768px) {
    min-width: 40px;
    min-height: 40px;
    padding: 0.375rem;

    i {
      font-size: 1.15rem;
    }
  }
`;

export const SearchDropdown = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  max-height: 400px;
  overflow-y: auto;
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  visibility: ${({ isOpen }) => (isOpen ? 'visible' : 'hidden')};
  transform: translateY(${({ isOpen }) => (isOpen ? '0' : '-10px')});
  transition: all 0.2s ease;
  z-index: 100;
  box-shadow: ${({ theme }) => theme.shadows.xl};

  @media (max-width: 768px) {
    max-height: 60vh;
    border-radius: ${({ theme }) => theme.borderRadius.md};
  }

  @media (max-width: 480px) {
    max-height: 50vh;
    left: -0.5rem;
    right: -0.5rem;
  }

  /* Smooth scrolling on mobile */
  -webkit-overflow-scrolling: touch;

  /* Hide scrollbar on mobile for cleaner look */
  @media (max-width: 768px) {
    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: ${({ theme }) => theme.colors.dark5};
      border-radius: 2px;
    }
  }
`;

export const SearchResult = styled.div`
  padding: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark5};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
  min-height: 64px;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.dark4};
  }

  /* Better touch target on mobile */
  @media (max-width: 768px) {
    padding: 0.875rem;
    gap: 0.875rem;
    min-height: 60px;
  }

  @media (max-width: 480px) {
    padding: 0.75rem;
    gap: 0.75rem;
    min-height: 56px;
  }

  /* Prevent accidental selections */
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
`;

export const SearchResultIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4});
  border-radius: ${({ theme }) => theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  i {
    font-size: 1.25rem;
    color: ${({ theme }) => theme.colors.white};
  }
`;

export const SearchResultContent = styled.div`
  flex: 1;
  min-width: 0;
`;

export const SearchResultName = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const SearchResultDescription = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const SearchResultTags = styled.div`
  display: flex;
  gap: 0.25rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
`;

export const SearchResultTag = styled.span`
  background: ${({ theme }) => theme.colors.dark5};
  color: ${({ theme }) => theme.colors.text.muted};
  padding: 0.125rem 0.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 0.75rem;
`;

export const NoResults = styled.div`
  padding: 2rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.muted};
`;

// Rest of the existing styles remain the same...
export const ToolsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  @media (max-width: 480px) {
    gap: 1rem;
  }
`;

export const ToolImageContainer = styled.div<{ backgroundImage: string }>`
  position: relative;
  height: 120px;
  background-image: url(${props => props.backgroundImage});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: ${({ theme }) => theme.borderRadius.xl} ${({ theme }) => theme.borderRadius.xl} 0 0;
  overflow: hidden;
`;

export const ToolImageOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.1) 30%,
    rgba(26, 26, 29, 0.6) 70%,
    rgba(26, 26, 29, 1) 100%
  );
  transition: all 0.3s ease;
`;

export const ToolCard = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: ${({ theme }) => theme.fonts.primary};
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
    z-index: 3;
  }
    
    ${ToolImageOverlay} {
      background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0) 0%,
        rgba(0, 0, 0, 0.2) 30%,
        rgba(26, 26, 29, 0.7) 70%,
        rgba(26, 26, 29, 1) 100%
      );
    }
  }
`;

export const ToolCardContent = styled.div`
  padding: 1rem;
  padding-top: 0.5rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  background: ${({ theme }) => theme.colors.dark3};
  position: relative;
  margin-top: -20px;
  z-index: 2;
`;

export const ToolIcon = styled.div`
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4});
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
  box-shadow: ${({ theme }) => theme.shadows.glow};

  i {
    font-size: 1.25rem;
    color: ${({ theme }) => theme.colors.white};
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
  }
`;

export const ToolName = styled.h3`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const StatusTag = styled.span<{ variant: 'new' | 'beta' }>`
  display: inline-block;
  padding: 0.125rem 0.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  background: ${({ theme, variant }) => 
    variant === 'new' ? theme.colors.red3 : theme.colors.gray5};
  color: ${({ theme }) => theme.colors.white};
`;

export const ToolDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.85rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  flex-grow: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const CategorySection = styled.section`
  margin-bottom: 4rem;
  padding: 0 2rem;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

export const CategoryTitle = styled.h2`
  font-size: 1.75rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid ${({ theme }) => theme.colors.dark5};
  position: relative;
  font-weight: 600;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 60px;
    height: 2px;
    background: linear-gradient(90deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4});
  }
`;

export const TagContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

export const Tag = styled.span`
  background: ${({ theme }) => theme.colors.dark4};
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 0.25rem 0.75rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  transition: all 0.2s ease;
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: auto;
  font-family: ${({ theme }) => theme.fonts.primary};
`;

// Educational Card Styles
export const EducationalCard = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 2rem;
  margin-bottom: 2rem;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  @media (max-width: 480px) {
    padding: 1.25rem;
    margin-bottom: 1.25rem;
  }
`;

export const EducationalCardTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

export const EducationalCardDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.6;
  margin-bottom: 1rem;
  font-size: 1rem;
`;

export const EducationalCardBenefits = styled.p`
  color: ${({ theme }) => theme.colors.text.muted};
  line-height: 1.6;
  margin: 0;
  font-size: 0.95rem;
  
  strong {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;