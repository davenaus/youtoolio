// src/pages/Tools/styles.ts
import styled from 'styled-components';

export const Container = styled.div`
  padding: 0;
  transition: filter 0.3s ease;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.dark2};
  max-width: 1400px;
  margin: 0 auto;
  
  &.blurred {
    filter: blur(4px);
    pointer-events: none;
  }
  
  @media (max-width: 1440px) {
    padding: 0 2rem;
  }
  
  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

export const Header = styled.div`
  margin-bottom: 3rem;
  max-width: 800px;
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

export const ToolsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

export const ToolImageContainer = styled.div<{ backgroundImage: string }>`
  position: relative;
  height: 200px;
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

  &:hover {
    transform: translateY(-8px);
    border-color: ${({ theme }) => theme.colors.red3};
    box-shadow: ${({ theme }) => theme.shadows.xl};
    
    &::before {
      opacity: 1;
    }
    
    /* Make image overlay darker on hover */
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
  padding: 1.5rem;
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
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4});
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  box-shadow: ${({ theme }) => theme.shadows.glow};

  i {
    font-size: 1.5rem;
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
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  flex-grow: 1;
`;

export const CategorySection = styled.section`
  margin-bottom: 4rem;
  padding: 0 2rem;
  
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

// Mobile Modal Styles
export const MobileModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  font-family: ${({ theme }) => theme.fonts.primary};
`;

export const ModalBackdrop = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
`;

export const ModalContent = styled.div`
  position: relative;
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 2.5rem;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: ${({ theme }) => theme.shadows.xl};
  z-index: 1001;
  
  @media (max-width: 640px) {
    padding: 2rem;
    margin: 1rem;
  }
`;

export const ModalIcon = styled.div`
  width: 80px;
  height: 80px;
  background: ${({ theme }) => theme.colors.dark4};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  
  i {
    font-size: 2.5rem;
    color: ${({ theme }) => theme.colors.red3};
  }
`;

export const ModalTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;
  
  @media (max-width: 640px) {
    font-size: 1.5rem;
  }
`;

export const ModalText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  
  @media (max-width: 640px) {
    font-size: 0.9rem;
  }
`;

export const ModalFeatures = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
  text-align: left;
`;

export const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  i {
    color: ${({ theme }) => theme.colors.red3};
    font-size: 1.25rem;
    flex-shrink: 0;
  }
  
  span {
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: 0.9rem;
  }
`;

export const ModalButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

export const ModalButton = styled.button<{ variant: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 0.875rem 1.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.gray3};
  font-family: ${({ theme }) => theme.fonts.primary};
  font-size: 0.95rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${({ variant, theme }) => variant === 'primary' 
    ? `
      background: linear-gradient(135deg, ${theme.colors.red3}, ${theme.colors.red4});
      color: ${theme.colors.white};
      border-color: ${theme.colors.red3};
      
      &:hover {
        background: linear-gradient(135deg, ${theme.colors.red2}, ${theme.colors.red3});
        border-color: ${theme.colors.red2};
        transform: translateY(-2px);
        box-shadow: ${theme.shadows.glow};
      }
    `
    : `
      background: ${theme.colors.dark4};
      color: ${theme.colors.text.secondary};
      border-color: ${theme.colors.dark5};
      
      &:hover {
        background: ${theme.colors.dark5};
        color: ${theme.colors.red3};
        border-color: ${theme.colors.red3};
        transform: translateY(-2px);
      }
    `
  }
  
  i {
    font-size: 1.1rem;
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

export const ModalNote = styled.p`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.8rem;
  font-style: italic;
  margin: 0;
`;