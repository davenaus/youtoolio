import styled from 'styled-components';

export const Card = styled.div`
  position: relative;
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: 16px;
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 0 30px rgba(185, 28, 28, 0.3);
    border-color: ${({ theme }) => theme.colors.red4};
  }
`;

export const CategoryBadge = styled.div<{ color: string }>`
  position: absolute;
  top: ${({ theme }) => theme.spacing.md};
  right: ${({ theme }) => theme.spacing.md};
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  background: ${props => `${props.color}20`};
  color: ${props => props.color};
  border: 1px solid ${props => `${props.color}40`};
`;

export const IconBox = styled.div<{ color: string }>`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(135deg, ${props => props.color}30, ${props => props.color}10);
  border: 1px solid ${props => `${props.color}40`};
  display: flex;
  align-items: center;
  justify-content: center;

  i {
    font-size: 1.5rem;
    color: ${props => props.color};
  }
`;

export const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  line-height: 1.3;
`;

export const Description = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.5;
  margin: 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const GenerateButton = styled.button`
  width: 100%;
  padding: 12px 24px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4});
  color: ${({ theme }) => theme.colors.text.primary};
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(185, 28, 28, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;
