import styled, { keyframes } from 'styled-components';

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(229, 72, 72, 0.4); }
  50% { box-shadow: 0 0 40px rgba(229, 72, 72, 0.8); }
`;

export const Container = styled.div`
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.lg};
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.md};
  }
`;

export const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  i {
    font-size: 1.1rem;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.dark4};
    color: ${({ theme }) => theme.colors.text.primary};
    border-color: ${({ theme }) => theme.colors.red4};
  }
`;

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

export const ToolIconBox = styled.div`
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

export const Feature = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.95rem;

  i {
    color: ${({ theme }) => theme.colors.red4};
    font-size: 1.1rem;
    flex-shrink: 0;
  }

  span {
    opacity: 0.9;
  }
`;

export const HeaderSearchContainer = styled.div`
  margin-top: 1.5rem;
  width: 100%;
  max-width: 600px;

  @media (max-width: 768px) {
    margin-top: 1rem;
    max-width: 100%;
  }
`;

export const HeaderSearchBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const SearchInput = styled.input`
  flex: 1;
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 14px 20px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: 'Poppins', sans-serif;
  transition: all 0.2s ease;

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.red4};
    box-shadow: 0 0 0 3px rgba(185, 28, 28, 0.1);
  }
`;

export const SearchButton = styled.button`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4});
  border: none;
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 14px 32px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  white-space: nowrap;

  i {
    font-size: 1.1rem;
  }

  &:hover {
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(185, 28, 28, 0.4);
  }
`;

export const FiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  padding-bottom: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark5};
`;

export const FilterButton = styled.button<{ active: boolean }>`
  padding: 10px 20px;
  background: ${({ active, theme }) =>
    active
      ? `linear-gradient(135deg, ${theme.colors.red3}, ${theme.colors.red4})`
      : theme.colors.dark3};
  border: 1px solid ${({ active, theme }) => (active ? theme.colors.red4 : theme.colors.dark5)};
  color: ${({ theme }) => theme.colors.text.primary};
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: ${({ active, theme }) =>
      active
        ? `linear-gradient(135deg, ${theme.colors.red4}, ${theme.colors.red5})`
        : theme.colors.dark4};
    border-color: ${({ theme }) => theme.colors.red4};
    transform: translateY(-2px);
  }
`;

export const PlaybooksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.lg};
  }
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xxl} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: 16px;
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

export const EmptyIcon = styled.div`
  font-size: 4rem;
  color: ${({ theme }) => theme.colors.text.muted};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  i {
    opacity: 0.5;
  }
`;

export const EmptyTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
`;

export const EmptyDescription = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
`;

export const EmptyList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;

  li {
    margin: ${({ theme }) => theme.spacing.xs} 0;
  }

  li::before {
    content: '•';
    color: ${({ theme }) => theme.colors.red4};
    font-weight: bold;
    display: inline-block;
    width: 1em;
  }
`;
