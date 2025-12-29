import styled, { keyframes, css } from 'styled-components';

const cursorBlink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

const scanline = keyframes`
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${({ theme }) => theme.spacing.md};
  overflow-y: auto;
`;

export const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.dark2};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: 16px;
  padding: ${({ theme }) => theme.spacing.xxl};
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);

  @media (max-width: 640px) {
    padding: ${({ theme }) => theme.spacing.lg};
    max-height: 95vh;
  }
`;

export const ModalHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  flex: 1;

  @media (max-width: 640px) {
    font-size: 1.25rem;
  }
`;

export const CloseButton = styled.button`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  color: ${({ theme }) => theme.colors.text.muted};
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  i {
    font-size: 1.5rem;
  }

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.dark4};
    color: ${({ theme }) => theme.colors.text.primary};
    border-color: ${({ theme }) => theme.colors.red4};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const FullDescription = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.6;
  margin: 0;
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};

  i {
    font-size: 1.2rem;
    color: ${({ theme }) => theme.colors.red4};
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

export const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.dark5};
  margin: ${({ theme }) => theme.spacing.lg} 0;
`;

export const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

export const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const Required = styled.span`
  color: ${({ theme }) => theme.colors.red5};
`;

export const Input = styled.input`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
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

export const Select = styled.select`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.red4};
    box-shadow: 0 0 0 3px rgba(185, 28, 28, 0.1);
  }

  option {
    background: ${({ theme }) => theme.colors.dark2};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

export const TextArea = styled.textarea`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: 'Poppins', sans-serif;
  resize: vertical;
  min-height: 100px;
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

export const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

export const BackButton = styled.button`
  flex: 1;
  padding: 12px 24px;
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  color: ${({ theme }) => theme.colors.text.primary};
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};

  &:hover {
    background: ${({ theme }) => theme.colors.dark4};
    border-color: ${({ theme }) => theme.colors.text.muted};
  }
`;

export const PrimaryButton = styled.button`
  flex: 2;
  padding: 12px 24px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4});
  border: none;
  color: ${({ theme }) => theme.colors.text.primary};
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(185, 28, 28, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const SuccessHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.success};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  i {
    font-size: 1.5rem;
  }
`;

export const PromptDisplay = styled.div`
  background: #0a0a0a;
  border: 2px solid #00ff00;
  border-radius: 8px;
  padding: ${({ theme }) => theme.spacing.lg};
  max-height: 400px;
  overflow-y: auto;
  position: relative;

  /* CRT Screen effect */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to bottom,
      transparent 50%,
      rgba(0, 255, 0, 0.03) 50%
    );
    background-size: 100% 4px;
    pointer-events: none;
    z-index: 1;
  }

  /* Scanline effect */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 20%;
    background: linear-gradient(
      to bottom,
      transparent,
      rgba(0, 255, 0, 0.1),
      transparent
    );
    pointer-events: none;
    animation: ${scanline} 8s linear infinite;
    z-index: 2;
  }

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #0a0a0a;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #00ff00;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #00cc00;
  }
`;

export const TerminalText = styled.pre<{ isGenerating?: boolean }>`
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  color: #00ff00;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
  position: relative;
  z-index: 3;

  ${({ isGenerating }) => isGenerating && css`
    &::after {
      content: '▋';
      animation: ${cursorBlink} 1s step-end infinite;
      color: #00ff00;
    }
  `}
`;

export const ActionButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const CopyButton = styled.button`
  padding: 12px 20px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4});
  border: none;
  color: ${({ theme }) => theme.colors.text.primary};
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};

  &:hover {
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(185, 28, 28, 0.4);
  }

  i {
    font-size: 1.1rem;
  }
`;

export const ExternalButton = styled.button`
  padding: 12px 20px;
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  color: ${({ theme }) => theme.colors.text.primary};
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};

  &:hover {
    background: ${({ theme }) => theme.colors.dark4};
    border-color: ${({ theme }) => theme.colors.text.muted};
    transform: translateY(-2px);
  }

  i {
    font-size: 1.1rem;
  }
`;

export const ResetButton = styled.button`
  padding: 12px 20px;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  color: ${({ theme }) => theme.colors.text.secondary};
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  grid-column: 1 / -1;

  &:hover {
    background: ${({ theme }) => theme.colors.dark3};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  i {
    font-size: 1.1rem;
  }
`;
