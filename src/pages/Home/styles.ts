import styled, { keyframes } from 'styled-components';

export const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  width: 100%;
  position: relative;
  z-index: 2;
  
  @media (max-width: 768px) {
    padding: 0 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 0 0.75rem;
  }
`

// All animations must be declared first before any styled components
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(2deg); }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideInFromRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// Main Container
export const Container = styled.div`
  min-height: 100vh;
  font-family: ${({ theme }) => theme.fonts.primary};
  background: ${({ theme }) => theme.colors.dark2};
  position: relative;
  overflow-x: hidden;
`;

// Hero Section
export const HeroSection = styled.section`
  display: flex;
  align-items: center;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  
  ${ContentWrapper} {
    display: flex;
    align-items: center;
    min-height: 100vh;
    
    @media (max-width: 768px) {
      flex-direction: column;
      text-align: center;
      justify-content: center;
      min-height: auto;
      padding-top: 2rem;
      padding-bottom: 2rem;
    }
  }
`;

export const HeroBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(ellipse at 20% 50%, rgba(125, 0, 0, 0.1) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(125, 0, 0, 0.05) 0%, transparent 50%),
    linear-gradient(135deg, ${({ theme }) => theme.colors.dark1} 0%, ${({ theme }) => theme.colors.dark2} 50%, ${({ theme }) => theme.colors.dark3} 100%);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 25% 25%, rgba(125, 0, 0, 0.1) 1px, transparent 1px),
      radial-gradient(circle at 75% 75%, rgba(125, 0, 0, 0.05) 1px, transparent 1px);
    background-size: 50px 50px, 80px 80px;
    animation: ${float} 20s ease-in-out infinite;
  }
`;

export const HeroContent = styled.div`
  flex: 1;
  max-width: 600px;
  margin-right: 2rem;
  animation: ${fadeInUp} 1s ease-out;
  
  @media (max-width: 768px) {
    margin-right: 0;
    margin-bottom: 2rem;
    max-width: none;
    order: 2;
  }
`;

export const HeroImage = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: ${slideInFromRight} 1s ease-out 0.3s both;
  
  @media (max-width: 768px) {
    width: 100%;
    order: 1;
    margin-bottom: 1.5rem;
  }
`;

export const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    justify-content: center;
    margin-bottom: 1.5rem;
  }
`;

export const LogoImage = styled.img.attrs(() => ({
  draggable: 'false',
  onContextMenu: (e: React.SyntheticEvent) => e.preventDefault(),
}))`
  height: 60px;
  width: auto;
  object-fit: contain;
  pointer-events: none;
  user-select: none;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    height: 45px;
  }
  
  @media (max-width: 480px) {
    height: 40px;
  }
`;

export const HeroTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.colors.text.primary};
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 2rem;
    line-height: 1.2;
  }
  
  @media (max-width: 360px) {
    font-size: 1.8rem;
  }
`;

export const Highlight = styled.span`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4});
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4});
    opacity: 0.6;
    border-radius: 2px;
    
    @media (max-width: 480px) {
      height: 2px;
    }
  }
`;

export const HeroSubtitle = styled.p`
  font-size: 1.3rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.6;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
    line-height: 1.5;
  }
`;

export const HeroStats = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 2.5rem;
  
  @media (max-width: 768px) {
    justify-content: center;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  @media (max-width: 480px) {
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: space-around;
  }
  
  @media (max-width: 360px) {
    flex-direction: column;
    gap: 0.75rem;
    align-items: center;
  }
`;

export const HeroStat = styled.div`
  text-align: center;
  min-width: 80px;
  
  @media (max-width: 480px) {
    min-width: 70px;
  }
  
  @media (max-width: 360px) {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-align: left;
    min-width: auto;
  }
`;

export const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.red3};
  margin-bottom: 0.25rem;
  
  @media (max-width: 768px) {
    font-size: 1.6rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.4rem;
  }
`;

export const StatLabel = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.muted};
  font-weight: 500;
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

export const HeroButtons = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

export const VideoPreview = styled.div`
  width: 100%;
  max-width: 600px;
  aspect-ratio: 16/9;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.xl};
    border-color: ${({ theme }) => theme.colors.red3};
  }
  
  @media (max-width: 768px) {
    max-width: 100%;
    width: 100%;
    
    &:hover {
      transform: none;
    }
  }
  
  @media (max-width: 480px) {
    border-radius: ${({ theme }) => theme.borderRadius.lg};
  }
`;

export const VideoThumbnail = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
`;

export const VideoOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, 
    ${({ theme }) => theme.colors.red2} 0%, 
    ${({ theme }) => theme.colors.red3} 50%,
    ${({ theme }) => theme.colors.red4} 100%);
  opacity: 0.3;
  transition: opacity 0.3s ease;
  
  ${VideoPreview}:hover & {
    opacity: 0.1;
  }
`;

export const PlayButton = styled.div`
  position: relative;
  z-index: 2;
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  animation: ${pulse} 2s ease-in-out infinite;
  
  i {
    font-size: 2.5rem;
    color: ${({ theme }) => theme.colors.white};
    margin-left: 4px;
  }
  
  ${VideoPreview}:hover & {
    transform: scale(1.1);
    background: rgba(255, 255, 255, 0.3);
  }
  
  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
    
    i {
      font-size: 2rem;
    }
    
    ${VideoPreview}:hover & {
      transform: none;
    }
  }
  
  @media (max-width: 480px) {
    width: 50px;
    height: 50px;
    
    i {
      font-size: 1.5rem;
    }
  }
`;

// Section Components
export const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 4rem;
  
  @media (max-width: 768px) {
    margin-bottom: 3rem;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 2rem;
  }
`;

export const SectionBadge = styled.div`
  display: inline-block;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4});
  color: ${({ theme }) => theme.colors.white};
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  animation: ${fadeInUp} 0.6s ease-out;
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
    padding: 0.4rem 1.2rem;
  }
`;

export const SectionTitle = styled.h2`
  font-size: 3rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;
  animation: ${fadeInUp} 0.6s ease-out 0.1s both;
  
  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.8rem;
    line-height: 1.2;
  }
  
  @media (max-width: 360px) {
    font-size: 1.6rem;
  }
`;

export const SectionSubtitle = styled.p`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
  animation: ${fadeInUp} 0.6s ease-out 0.2s both;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
    max-width: none;
    padding: 0 0.5rem;
  }
`;

// Features Section
export const FeaturesSection = styled.section`
  padding: 8rem 0;
  background: ${({ theme }) => theme.colors.dark1};
  position: relative;
  
  @media (max-width: 768px) {
    padding: 6rem 0;
  }
  
  @media (max-width: 480px) {
    padding: 4rem 0;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      45deg,
      transparent 0%,
      rgba(125, 0, 0, 0.02) 25%,
      transparent 50%,
      rgba(125, 0, 0, 0.02) 75%,
      transparent 100%
    );
    background-size: 100px 100px;
  }
`;

export const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  @media (max-width: 480px) {
    gap: 1rem;
  }
`;

export const FeatureCard = styled.div<{ delay: number }>`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  animation: ${fadeInUp} 0.6s ease-out ${props => props.delay}s both;
  cursor: pointer;
  
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
    transform: translateY(-10px);
    box-shadow: ${({ theme }) => theme.shadows.xl};
    border-color: ${({ theme }) => theme.colors.red3};
    
    &::before {
      opacity: 1;
    }
  }
  
  @media (max-width: 768px) {
    &:hover {
      transform: translateY(-5px);
    }
  }
  
  @media (max-width: 480px) {
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    
    &:hover {
      transform: none;
    }
  }
`;

export const FeatureImageContainer = styled.div`
  position: relative;
  height: 200px;
  overflow: hidden;
  
  @media (max-width: 480px) {
    height: 150px;
  }
`;

export const FeatureImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
  
  ${FeatureCard}:hover & {
    transform: scale(1.05);
  }
`;

export const FeatureImageOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.1) 50%,
    rgba(26, 26, 29, 0.8) 100%
  );
`;

export const FeatureContent = styled.div`
  padding: 1.5rem;
  
  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

export const FeatureHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

export const FeatureIcon = styled.div`
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4});
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  
  i {
    font-size: 1.5rem;
    color: ${({ theme }) => theme.colors.white};
  }
  
  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
    
    i {
      font-size: 1.2rem;
    }
  }
`;

export const FeatureHighlight = styled.div`
  background: rgba(125, 0, 0, 0.1);
  color: ${({ theme }) => theme.colors.red3};
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid rgba(125, 0, 0, 0.2);
  
  @media (max-width: 480px) {
    font-size: 0.75rem;
    padding: 0.2rem 0.6rem;
    align-self: flex-start;
  }
`;

export const FeatureTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.75rem;
  
  @media (max-width: 480px) {
    font-size: 1.2rem;
  }
`;

export const FeatureDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.6;
  margin-bottom: 1rem;
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
    line-height: 1.5;
  }
`;

export const FeatureAction = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.red4};
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  
  i {
    transition: transform 0.2s ease;
  }
  
  ${FeatureCard}:hover & {
    color: ${({ theme }) => theme.colors.red5};
    
    i {
      transform: translateX(3px);
    }
  }
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;

// Testimonials Section
export const TestimonialsSection = styled.section`
  padding: 8rem 0;
  background: ${({ theme }) => theme.colors.dark2};
  position: relative;
  
  @media (max-width: 768px) {
    padding: 6rem 0;
  }
  
  @media (max-width: 480px) {
    padding: 4rem 0;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(ellipse at 50% 50%, rgba(125, 0, 0, 0.05) 0%, transparent 70%);
  }
`;

export const TestimonialsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  @media (max-width: 480px) {
    gap: 1rem;
    grid-template-columns: 1fr;
  }
`;

export const TestimonialCard = styled.div<{ delay: number }>`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 2rem;
  transition: all 0.3s ease;
  animation: ${fadeInUp} 0.6s ease-out ${props => props.delay}s both;
  position: relative;
  
  &::before {
    content: '"';
    position: absolute;
    top: -10px;
    left: 20px;
    font-size: 4rem;
    color: ${({ theme }) => theme.colors.red3};
    opacity: 0.3;
    font-family: serif;
  }
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
    border-color: ${({ theme }) => theme.colors.dark4};
  }
  
  @media (max-width: 480px) {
    padding: 1.5rem;
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    
    &:hover {
      transform: none;
    }
    
    &::before {
      font-size: 3rem;
      top: -5px;
      left: 15px;
    }
  }
`;

export const TestimonialQuote = styled.p`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  font-style: italic;
  
  @media (max-width: 480px) {
    font-size: 1rem;
    line-height: 1.5;
    margin-bottom: 1rem;
  }
`;

export const TestimonialAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 480px) {
    gap: 0.75rem;
  }
`;

export const AuthorAvatar = styled.div`
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4});
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.white};
  font-size: 1.1rem;
  flex-shrink: 0;
  
  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
    font-size: 0.9rem;
  }
`;

export const AuthorInfo = styled.div``;

export const AuthorName = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.25rem;
  
  @media (max-width: 480px) {
    font-size: 0.95rem;
  }
`;

export const AuthorRole = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

// Stats Section
export const StatsSection = styled.section`
  padding: 6rem 0;
  position: relative;
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 4rem 0;
  }
  
  @media (max-width: 480px) {
    padding: 3rem 0;
  }
`;

export const StatsBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red2}, ${({ theme }) => theme.colors.red1});
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    opacity: 0.3;
  }
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  position: relative;
  z-index: 2;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    max-width: 300px;
    margin: 0 auto;
  }
`;

export const StatCard = styled.div<{ delay: number }>`
  text-align: center;
  color: ${({ theme }) => theme.colors.white};
  animation: ${fadeInUp} 0.6s ease-out ${props => props.delay}s both;
  
  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

export const StatIcon = styled.div`
  margin: 0 auto 1rem;
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  i {
    font-size: 1.8rem;
  }
  
  @media (max-width: 480px) {
    width: 50px;
    height: 50px;
    
    i {
      font-size: 1.5rem;
    }
  }
`;

export const StatDescription = styled.div`
  font-size: 0.9rem;
  opacity: 0.9;
  margin-top: 0.5rem;
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

// CTA Section
export const CTASection = styled.section`
  padding: 8rem 0;
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.colors.dark1} 0%, 
    ${({ theme }) => theme.colors.dark2} 50%, 
    ${({ theme }) => theme.colors.dark3} 100%);
  text-align: center;
  position: relative;
  
  @media (max-width: 768px) {
    padding: 6rem 0;
  }
  
  @media (max-width: 480px) {
    padding: 4rem 0;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(ellipse at center, rgba(125, 0, 0, 0.08) 0%, transparent 70%);
    pointer-events: none;
  }
`;

export const CTAContent = styled.div`
  max-width: 700px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
  animation: ${fadeInUp} 0.8s ease-out;
  
  @media (max-width: 480px) {
    max-width: none;
    padding: 0 0.5rem;
  }
`;

export const CTABadge = styled.div`
  display: inline-block;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4});
  color: ${({ theme }) => theme.colors.white};
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 2rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
    padding: 0.4rem 1.2rem;
    margin-bottom: 1.5rem;
  }
`;

export const CTATitle = styled.h2`
  font-size: 3.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 2rem;
    line-height: 1.2;
    margin-bottom: 1rem;
  }
  
  @media (max-width: 360px) {
    font-size: 1.8rem;
  }
`;

export const CTASubtitle = styled.p`
  font-size: 1.3rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 3rem;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1.15rem;
    margin-bottom: 2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
    line-height: 1.5;
    margin-bottom: 1.5rem;
  }
`;

export const CTAButtons = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  
  @media (max-width: 480px) {
    gap: 1rem;
  }
`;

export const CTASecondaryText = styled.div`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.9rem;
  text-align: center;
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

// Featured Tools Section
export const FeaturedToolsSection = styled.section`
  padding: 8rem 0;
  background: ${({ theme }) => theme.colors.dark3};
  position: relative;
  
  @media (max-width: 768px) {
    padding: 6rem 0;
  }
  
  @media (max-width: 480px) {
    padding: 4rem 0;
  }
`;

export const FeaturedToolsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6rem;
  margin-bottom: 8rem;
  
  @media (max-width: 768px) {
    gap: 4rem;
    margin-bottom: 3rem;
  }
  
  @media (max-width: 480px) {
    gap: 3rem;
    margin-bottom: 2rem;
  }
`;

export const FeaturedToolItem = styled.div<{ reverse: boolean }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  
  ${props => props.reverse && `
    direction: rtl;
    
    > * {
      direction: ltr;
    }
  `}
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
    direction: ltr;
    
    > * {
      direction: ltr;
    }
  }
  
  @media (max-width: 480px) {
    gap: 1.5rem;
  }
`;

export const FeaturedToolImage = styled.div`
  position: relative;
  aspect-ratio: 16/10;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
  }
  
  &:hover img {
    transform: scale(1.05);
  }
  
  @media (max-width: 768px) {
    &:hover img {
      transform: none;
    }
  }
  
  @media (max-width: 480px) {
    border-radius: ${({ theme }) => theme.borderRadius.lg};
  }
`;

export const FeaturedToolImageOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    45deg,
    rgba(125, 0, 0, 0.1) 0%,
    transparent 50%,
    rgba(125, 0, 0, 0.05) 100%
  );
`;

export const FeaturedToolContent = styled.div`
  animation: ${fadeInUp} 0.6s ease-out;
  
  @media (max-width: 480px) {
    text-align: center;
  }
`;

export const FeaturedToolHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 480px) {
    justify-content: center;
    margin-bottom: 1rem;
  }
`;

export const FeaturedToolIcon = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4});
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  i {
    font-size: 1.8rem;
    color: ${({ theme }) => theme.colors.white};
  }
  
  @media (max-width: 480px) {
    width: 50px;
    height: 50px;
    
    i {
      font-size: 1.5rem;
    }
  }
`;

export const FeaturedToolName = styled.h3`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

export const FeaturedToolDescription = styled.p`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.6;
  margin-bottom: 2rem;
  
  @media (max-width: 480px) {
    font-size: 1rem;
    line-height: 1.5;
    margin-bottom: 1.5rem;
  }
`;

export const FeaturedToolFeatures = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 2rem;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }
`;

export const FeaturedToolFeature = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  
  i {
    color: ${({ theme }) => theme.colors.red3};
    font-size: 1.1rem;
    flex-shrink: 0;
  }
  
  span {
    font-size: 0.95rem;
  }
  
  @media (max-width: 480px) {
    justify-content: center;
    
    span {
      font-size: 0.9rem;
    }
  }
`;

export const FeaturedToolAction = styled.button`
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
  margin: 0 auto;

  &:hover {
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.red2}, ${({ theme }) => theme.colors.red3});
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
  
  i {
    font-size: 1.2rem;
    transition: transform 0.2s ease;
  }
  
  &:hover i {
    transform: translateX(3px);
  }
  
  @media (max-width: 768px) {
    &:hover {
      transform: none;
    }
  }
  
  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
    padding: 0.875rem 1.5rem;
    font-size: 0.95rem;
  }
`;

export const AllToolsAction = styled.div`
  text-align: center;
  margin-top: 4rem;
  
  @media (max-width: 768px) {
    margin-top: 3rem;
  }
  
  @media (max-width: 480px) {
    margin-top: 2rem;
  }
`;

// Video Modal
export const VideoModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  
  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

export const VideoModalBackdrop = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
`;

export const VideoModalContent = styled.div`
  position: relative;
  width: 90%;
  max-width: 1000px;
  aspect-ratio: 16/9;
  background: ${({ theme }) => theme.colors.dark3};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  animation: ${fadeInUp} 0.3s ease-out;
  
  @media (max-width: 768px) {
    width: 95%;
  }
  
  @media (max-width: 480px) {
    width: 100%;
    border-radius: ${({ theme }) => theme.borderRadius.lg};
  }
`;

export const VideoModalClose = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.7);
  border: none;
  border-radius: 50%;
  color: ${({ theme }) => theme.colors.white};
  cursor: pointer;
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: scale(1.1);
  }
  
  i {
    font-size: 1.5rem;
  }
  
  @media (max-width: 480px) {
    top: 0.5rem;
    right: 0.5rem;
    width: 35px;
    height: 35px;
    
    i {
      font-size: 1.2rem;
    }
  }
`;

export const VideoPlayer = styled.div`
  width: 100%;
  height: 100%;
  
  iframe {
    border: none;
  }
`;