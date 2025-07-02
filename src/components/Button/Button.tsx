// src/components/Button/Button.tsx
import React from 'react';
import * as S from './styles';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right',
  disabled = false,
  fullWidth = false,
  onClick,
  type = 'button',
}) => {
  return (
    <S.StyledButton
      variant={variant}
      size={size}
      disabled={disabled}
      fullWidth={fullWidth}
      onClick={onClick}
      type={type}
    >
      {icon && iconPosition === 'left' && (
        <S.Icon className={icon} position="left" />
      )}
      <span>{children}</span>
      {icon && iconPosition === 'right' && (
        <S.Icon className={icon} position="right" />
      )}
    </S.StyledButton>
  );
};