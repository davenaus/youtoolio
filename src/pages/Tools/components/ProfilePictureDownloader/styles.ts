import styled, { keyframes } from 'styled-components';

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(229, 72, 72, 0.4); }
  50% { box-shadow: 0 0 40px rgba(229, 72, 72, 0.8); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Page Structure
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
    opacity: 0.5;
    cursor: not-allowed;
  }

  i {
    font-size: 1.5rem;
  }

  @media (max-width: 768px) {
    padding: 0.875rem 1.25rem;
    min-width: 50px;
  }
`;

// Educational Content Styled Components
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

// Error Message
export const ErrorMessage = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 2px solid #ef4444;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1rem 1.5rem;
  color: #ef4444;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
  animation: ${fadeIn} 0.3s ease-out;

  i {
    font-size: 1.5rem;
  }
`;

// Results Section
export const ResultsSection = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 2rem;
  margin-bottom: 2rem;
  animation: ${fadeIn} 0.5s ease-out;
`;

export const ChannelInfo = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

export const ChannelTitle = styled.h2`
  font-size: 1.75rem;
  color: ${({ theme }) => theme.colors.white};
  margin-bottom: 0.5rem;
`;

export const ChannelId = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-family: monospace;
`;

export const BannerPreview = styled.div`
  width: 100%;
  margin-bottom: 2rem;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.dark5};
`;

export const BannerImage = styled.img`
  width: 100%;
  height: auto;
  display: block;
`;

export const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

export const ActionButton = styled.button`
  padding: 1rem 1.5rem;
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  color: ${({ theme }) => theme.colors.white};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  text-decoration: none;

  &:hover {
    background: ${({ theme }) => theme.colors.red3};
    border-color: ${({ theme }) => theme.colors.red3};
    transform: translateY(-2px);
  }

  i {
    font-size: 1.25rem;
  }
`;

export const InfoBox = styled.div`
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;
`;

export const InfoTitle = styled.h3`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.white};
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  i {
    color: ${({ theme }) => theme.colors.red3};
  }
`;

export const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const InfoItem = styled.div`
  display: flex;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.25rem;
  }
`;

export const InfoLabel = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
  min-width: 100px;
`;

export const InfoValue = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
`;



/* ============================
   Profile Picture — Quality UI
   ============================ */

export const QualitySelector = styled.div`
  margin: 2rem 0;
  padding: 1.5rem;
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
`;

export const QualityTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.white};
  margin-bottom: 1rem;
`;

export const QualityOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 0.75rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const QualityOption = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  padding: 0.85rem 1rem;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.red3 : theme.colors.dark3};

  border: 1px solid
    ${({ $active, theme }) =>
      $active ? theme.colors.red4 : theme.colors.dark5};

  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.white};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;

  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.red3};
    border-color: ${({ theme }) => theme.colors.red4};
    transform: translateY(-1px);
  }

  i {
    font-size: 1.2rem;
    color: ${({ theme }) => theme.colors.white};
  }
`;

/* ============================
   Profile Picture Preview
   ============================ */

export const ProfilePreview = styled.div`
  display: flex;
  justify-content: center;
  margin: 2.5rem 0;
`;

export const ProfileImage = styled.img`
  width: 260px;
  height: 260px;
  object-fit: cover;
  border-radius: 50%;

  background: ${({ theme }) => theme.colors.dark4};
  border: 3px solid ${({ theme }) => theme.colors.red3};

  box-shadow:
    0 0 0 6px rgba(229, 72, 72, 0.15),
    0 20px 40px rgba(0, 0, 0, 0.4);

  animation: ${fadeIn} 0.4s ease-out;

  @media (max-width: 768px) {
    width: 200px;
    height: 200px;
  }
`;
