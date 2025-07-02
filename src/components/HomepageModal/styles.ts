// components/HomepageModal/styles.ts
import styled, { keyframes } from 'styled-components';

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const fadeInOverlay = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(15px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  animation: ${fadeInOverlay} 0.3s ease-out;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem;
  }
`;

export const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.dark2};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  width: 100%;
  max-width: 600px;
  position: relative;
  overflow: hidden;
  animation: ${fadeInUp} 0.4s ease-out;
  box-shadow: ${({ theme }) => theme.shadows.xl};
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4});
  }
  
  @media (max-width: 480px) {
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    max-width: none;
  }
`;

export const ModalClose = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: 50%;
  color: ${({ theme }) => theme.colors.white};
  cursor: pointer;
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  
  &:hover {
    background: rgba(0, 0, 0, 0.7);
    border-color: ${({ theme }) => theme.colors.red3};
    transform: scale(1.05);
  }
  
  i {
    font-size: 1.3rem;
  }
  
  @media (max-width: 480px) {
    top: 0.75rem;
    right: 0.75rem;
    width: 35px;
    height: 35px;
    
    i {
      font-size: 1.1rem;
    }
  }
`;

export const ModalBody = styled.div`
  padding: 2.5rem;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 2rem;
  }
  
  @media (max-width: 480px) {
    padding: 1.5rem;
  }
`;

export const ModalBadge = styled.div`
  display: inline-block;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4});
  color: ${({ theme }) => theme.colors.white};
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.2) 50%,
      transparent 100%
    );
    animation: ${shimmer} 2s ease-in-out infinite;
  }
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
    padding: 0.4rem 1rem;
    margin-bottom: 1rem;
  }
`;

export const ModalTitle = styled.h2`
  font-size: 2.2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 2rem;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 1.9rem;
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.6rem;
    margin-bottom: 1rem;
  }
`;

export const ModalImageContainer = styled.div`
  position: relative;
  aspect-ratio: 16/9;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  margin-bottom: 2rem;
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  
  @media (max-width: 480px) {
    margin-bottom: 1.5rem;
    border-radius: ${({ theme }) => theme.borderRadius.md};
  }
`;

export const ModalImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
  
  ${ModalImageContainer}:hover & {
    transform: scale(1.02);
  }
  
  @media (max-width: 768px) {
    ${ModalImageContainer}:hover & {
      transform: none;
    }
  }
`;

export const ModalImageOverlay = styled.div`
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

export const ModalDescription = styled.p`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.6;
  margin-bottom: 2.5rem;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.95rem;
    line-height: 1.5;
    margin-bottom: 1.5rem;
    max-width: none;
  }
`;

export const ModalButton = styled.button`
  display: inline-flex;
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
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.2) 50%,
      transparent 100%
    );
    transition: left 0.5s ease;
  }
  
  &:hover {
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.red2}, ${({ theme }) => theme.colors.red3});
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
    
    &::before {
      left: 100%;
    }
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