// src/pages/Tools/components/ChannelComparer/styles.ts
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
  max-width: 700px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

export const InputContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 2rem;
  align-items: end;
  max-width: 800px;
  margin: 0 auto 2rem auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    text-align: center;
  }
`;

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const InputLabel = styled.label`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 0.5rem;
`;

export const SearchInput = styled.input`
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme }) => theme.colors.dark3};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;
  font-family: ${({ theme }) => theme.fonts.primary};
  transition: all 0.2s ease;

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.red3};
    box-shadow: 0 0 0 3px rgba(125, 0, 0, 0.1);
  }
`;

export const VsIndicator = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4});
  color: ${({ theme }) => theme.colors.white};
  padding: 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-weight: 700;
  font-size: 1.2rem;
  text-align: center;
  min-width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${({ theme }) => theme.shadows.md};
  
  @media (max-width: 768px) {
    margin: 1rem auto;
  }
`;

export const CompareButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4});
  color: ${({ theme }) => theme.colors.white};
  padding: 1.25rem 2rem;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0 auto;
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
    font-size: 1.3rem;
  }
`;

export const ResultsContainer = styled.div`
  display: none;
  animation: fadeIn 0.3s ease-in-out;
  margin-top: 3rem;

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

export const ComparisonHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 2rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red3});
  }
`;

export const OverallWinner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

export const WinnerTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4});
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  @media (max-width: 768px) {
    font-size: 1.6rem;
  }
`;

export const WinnerSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1.1rem;
  margin: 0;
`;

export const ChannelGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

export const ChannelCard = styled.div<{ isWinner: boolean }>`
  background: ${({ theme }) => theme.colors.dark3};
  border: 2px solid ${({ theme, isWinner }) => isWinner ? theme.colors.red3 : theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 1.5rem;
  position: relative;
  transition: all 0.3s ease;
  box-shadow: ${({ theme, isWinner }) => isWinner ? theme.shadows.lg : theme.shadows.md};
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.xl};
  }
  
`;

export const WinnerBadge = styled.div`
  position: absolute;
  top: -1px;
  right: 1rem;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4});
  color: ${({ theme }) => theme.colors.white};
  padding: 0.5rem 1rem;
  border-radius: 0 0 ${({ theme }) => theme.borderRadius.md} ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  i {
    color: gold;
  }
`;

export const ChannelHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
    text-align: center;
  }
`;

export const ChannelLogo = styled.img`
  width: 80px;
  height: 80px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  border: 3px solid ${({ theme }) => theme.colors.dark5};
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.red3};
    transform: scale(1.05);
  }
`;

export const ChannelInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const ChannelName = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.2;
`;

export const ChannelMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  
  @media (max-width: 480px) {
    align-items: center;
  }
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

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

export const StatItem = styled.div`
  text-align: center;
  background: ${({ theme }) => theme.colors.dark4};
  padding: 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.dark5};
  }
`;

export const StatValue = styled.div`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.25rem;
`;

export const StatLabel = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const VisitChannelButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: ${({ theme }) => theme.colors.dark4};
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 0.75rem 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.red3};
    color: ${({ theme }) => theme.colors.white};
    transform: translateY(-2px);
  }
`;

export const DetailedComparison = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 2rem;
  margin-bottom: 2rem;
`;

export const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 1.5rem 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.4rem;
  font-weight: 600;
  
  i {
    color: ${({ theme }) => theme.colors.red3};
    font-size: 1.6rem;
  }
`;

export const MetricsTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const MetricRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.dark4};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.dark5};
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    text-align: center;
  }
`;

export const MetricName = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 600;
  
  @media (max-width: 768px) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.dark5};
    padding-bottom: 0.5rem;
    margin-bottom: 0.5rem;
  }
`;

export const MetricValue = styled.div<{ winner: boolean }>`
  color: ${({ theme, winner }) => winner ? theme.colors.success : theme.colors.text.secondary};
  font-weight: ${({ winner }) => winner ? '700' : '500'};
  padding: 0.25rem 0.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ theme, winner }) => winner ? `${theme.colors.success}20` : 'transparent'};
  text-align: center;
  
  @media (max-width: 768px) {
    margin: 0.25rem 0;
  }
`;

export const InsightsSection = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 2rem;
  margin-bottom: 2rem;
`;

export const Insight = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.5;
  
  i {
    color: ${({ theme }) => theme.colors.success};
    font-size: 1.1rem;
    margin-top: 0.1rem;
    flex-shrink: 0;
  }
`;

export const BottomAdContainer = styled.div`
  margin: 2rem 0;
  text-align: center;
  
  @media (min-width: 1401px) {
    display: none;
  }
`;
