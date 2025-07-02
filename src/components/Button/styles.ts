// src/components/Button/styles.ts
import styled, { css } from 'styled-components';

interface StyledButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size: 'sm' | 'md' | 'lg';
  disabled: boolean;
  fullWidth: boolean;
}

interface IconProps {
  position: 'left' | 'right';
}

const getVariantStyles = (variant: string) => {
  switch (variant) {
    case 'primary':
      return css`
        background: linear-gradient(135deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4});
        color: ${({ theme }) => theme.colors.white};
        border: 1px solid ${({ theme }) => theme.colors.red3};
        box-shadow: ${({ theme }) => theme.shadows.sm};

        &:hover:not(:disabled) {
          background: linear-gradient(135deg, ${({ theme }) => theme.colors.red2}, ${({ theme }) => theme.colors.red3});
          border-color: ${({ theme }) => theme.colors.red2};
          transform: translateY(-2px);
          box-shadow: ${({ theme }) => theme.shadows.glow};
        }
      `;
    case 'secondary':
      return css`
        background: ${({ theme }) => theme.colors.dark3};
        color: ${({ theme }) => theme.colors.text.primary};
        border: 1px solid ${({ theme }) => theme.colors.dark5};

        &:hover:not(:disabled) {
          background: ${({ theme }) => theme.colors.dark4};
          border-color: ${({ theme }) => theme.colors.red3};
          transform: translateY(-2px);
          box-shadow: ${({ theme }) => theme.shadows.md};
        }
      `;
    case 'danger':
      return css`
        background: linear-gradient(135deg, ${({ theme }) => theme.colors.error}, #DC2626);
        color: ${({ theme }) => theme.colors.white};
        border: 1px solid ${({ theme }) => theme.colors.error};

        &:hover:not(:disabled) {
          background: linear-gradient(135deg, #DC2626, #B91C1C);
          border-color: #DC2626;
          transform: translateY(-2px);
          box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
        }
      `;
    default:
      return '';
  }
};

const getSizeStyles = (size: string) => {
  switch (size) {
    case 'sm':
      return css`
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
        border-radius: ${({ theme }) => theme.borderRadius.md};
      `;
    case 'md':
      return css`
        padding: 0.75rem 1.5rem;
        font-size: 1rem;
        border-radius: ${({ theme }) => theme.borderRadius.lg};
      `;
    case 'lg':
      return css`
        padding: 1rem 2rem;
        font-size: 1.125rem;
        border-radius: ${({ theme }) => theme.borderRadius.lg};
      `;
    default:
      return '';
  }
};

export const StyledButton = styled.button<StyledButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: ${({ theme }) => theme.fonts.primary};
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  ${({ variant }) => getVariantStyles(variant)}
  ${({ size }) => getSizeStyles(size)}
  
  ${({ fullWidth }) =>
    fullWidth &&
    css`
      width: 100%;
    `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(125, 0, 0, 0.3);
  }
`;

export const Icon = styled.i<IconProps>`
  font-size: 1em;
  
  ${({ position }) =>
    position === 'left' &&
    css`
      margin-right: -0.25rem;
    `}
    
  ${({ position }) =>
    position === 'right' &&
    css`
      margin-left: -0.25rem;
    `}
`;