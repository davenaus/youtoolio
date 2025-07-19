// src/pages/LinkInBioLanding/styles.ts
import styled from 'styled-components';

// Green color constants
const GREEN_PRIMARY = '#4CAF50';
const GREEN_SECONDARY = '#45a049';
const GREEN_LIGHT = '#66BB6A';
const GREEN_DARK = '#388E3C';

export const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.dark2};
  padding: 2rem 1rem;
`;

export const MainContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
`;

export const Header = styled.div`
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    margin-bottom: 1rem;
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
  
  &:hover {
    background: ${({ theme }) => theme.colors.dark4};
    border-color: ${GREEN_PRIMARY};
    color: ${({ theme }) => theme.colors.text.primary};
    transform: translateX(-2px);
  }
  
  i {
    font-size: 1.1rem;
  }
`;

export const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4rem;
`;

export const HeroSection = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 4rem 3rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${GREEN_PRIMARY}, ${GREEN_LIGHT});
  }
  
  @media (max-width: 768px) {
    padding: 3rem 2rem;
  }
`;

export const HeroImageContainer = styled.div`
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
`;

export const HeroImage = styled.img`
  width: 700px;
  height: auto;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  
  @media (max-width: 1024px) {
    width: 500px;
  }
  
  @media (max-width: 768px) {
    width: 350px;
  }
  
  @media (max-width: 480px) {
    width: 250px;
  }
`;

export const Title = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  background: linear-gradient(135deg, ${GREEN_PRIMARY}, ${GREEN_LIGHT});
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1.5rem;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

export const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 3rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 2rem;
  }
`;

export const CTASection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

export const CTANote = styled.p`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.9rem;
  margin: 0;
  text-align: center;
`;

export const FeaturesSection = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 3rem 2rem;
`;

export const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;
  margin-bottom: 3rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 2rem;
  }
`;

export const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
  }
`;

export const FeatureCard = styled.div`
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    border-color: ${GREEN_PRIMARY};
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

export const FeatureIcon = styled.i`
  font-size: 3rem;
  color: ${GREEN_PRIMARY};
  margin-bottom: 1rem;
  display: block;
`;

export const FeatureTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

export const FeatureDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.5;
  margin: 0;
`;

export const ValueSection = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 3rem 2rem;
`;

export const ValueContent = styled.div`
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
`;

export const ValueBadge = styled.div`
  display: inline-block;
  background: ${GREEN_PRIMARY};
  color: ${({ theme }) => theme.colors.white};
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

export const ValueTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

export const ValuePrice = styled.div`
  font-size: 3rem;
  font-weight: 700;
  color: ${GREEN_PRIMARY};
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

export const ValuePriceNote = styled.span`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 400;
`;

export const ValueComparison = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 2rem;
  line-height: 1.5;
`;

export const ValueFeatures = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
  text-align: left;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

export const ValueFeature = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  
  i {
    color: ${GREEN_PRIMARY};
    font-size: 1.25rem;
    flex-shrink: 0;
  }
`;

export const ValueCTA = styled.div`
  margin-top: 2rem;
`;

export const VideoSection = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 3rem 2rem;
`;

export const VideoWrapper = styled.div`
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  
  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
  }
`;

export const FAQSection = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 3rem 2rem;
`;

export const FAQList = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

export const FAQItem = styled.div<{ isOpen?: boolean }>`
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: 1rem;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${GREEN_PRIMARY};
  }
`;

export const FAQQuestion = styled.div`
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  
  &:hover {
    background: ${({ theme }) => theme.colors.dark5};
  }
`;

export const FAQToggle = styled.span<{ isOpen?: boolean }>`
  font-size: 1.5rem;
  color: ${GREEN_PRIMARY};
  transition: transform 0.3s ease;
  transform: ${({ isOpen }) => isOpen ? 'rotate(45deg)' : 'rotate(0deg)'};
`;

export const FAQAnswer = styled.div<{ isOpen?: boolean }>`
  max-height: ${({ isOpen }) => isOpen ? '300px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
  
  p {
    padding: 0 1.5rem 1.5rem;
    margin: 0;
    color: ${({ theme }) => theme.colors.text.secondary};
    line-height: 1.6;
  }
`;

export const FinalCTA = styled.div`
  background: linear-gradient(135deg, ${GREEN_PRIMARY}, ${GREEN_LIGHT});
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 4rem 3rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.white};
  
  @media (max-width: 768px) {
    padding: 3rem 2rem;
  }
`;

export const FinalCTAContent = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

export const FinalCTATitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

export const FinalCTASubtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  line-height: 1.5;
`;

export const FinalCTAButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1.5rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: center;
  }
`;

export const FinalCTANote = styled.p`
  font-size: 1rem;
  margin: 0;
  opacity: 0.8;
  font-weight: 500;
`;

// Green Button Components
export const GreenButton = styled.button<{ variant?: 'primary' | 'secondary', size?: 'lg' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: ${({ size }) => size === 'lg' ? '1rem 2rem' : '0.75rem 1.5rem'};
  font-size: ${({ size }) => size === 'lg' ? '1.1rem' : '1rem'};
  font-weight: 600;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  font-family: ${({ theme }) => theme.fonts.primary};
  
  ${({ variant }) => variant === 'primary' ? `
    background: linear-gradient(135deg, ${GREEN_DARK}, ${GREEN_PRIMARY});
    color: white;
        border: 2px solid ${GREEN_DARK};
    
    &:hover {
      background: linear-gradient(135deg, ${GREEN_SECONDARY}, ${GREEN_PRIMARY});
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(76, 175, 80, 0.3);
    }
  ` : `
    background: linear-gradient(135deg, ${GREEN_DARK}, ${GREEN_PRIMARY});
    color: white;
    border: 2px solid ${GREEN_DARK};
    
    &:hover {
      background: linear-gradient(135deg, ${GREEN_SECONDARY}, ${GREEN_PRIMARY});
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(76, 175, 80, 0.3);
    }
  `}
  
  i {
    font-size: 1.2em;
  }
`;