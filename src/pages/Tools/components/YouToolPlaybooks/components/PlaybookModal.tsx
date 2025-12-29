import React, { useState, useEffect, useRef } from 'react';
import { Playbook, PlaybookInput } from '../playbooks';
import {
  ModalOverlay,
  ModalContent,
  ModalHeader,
  CloseButton,
  ModalTitle,
  FullDescription,
  Divider,
  FormSection,
  SectionTitle,
  InputGroup,
  Label,
  Required,
  Input,
  Select,
  TextArea,
  ButtonGroup,
  BackButton,
  PrimaryButton,
  SuccessHeader,
  PromptDisplay,
  TerminalText,
  ActionButtons,
  CopyButton,
  ExternalButton,
  ResetButton
} from './PlaybookModalStyles';

interface PlaybookModalProps {
  playbook: Playbook | null;
  onClose: () => void;
}

const PlaybookModal: React.FC<PlaybookModalProps> = ({ playbook, onClose }) => {
  const [view, setView] = useState<'form' | 'result' | 'generating'>('form');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [displayedPrompt, setDisplayedPrompt] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const displayContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (playbook) {
      // Initialize form data with default values
      const initialData: Record<string, string> = {};
      playbook.inputs.forEach((input) => {
        if (input.defaultValue) {
          initialData[input.id] = input.defaultValue;
        }
      });
      setFormData(initialData);
      setView('form');
      setGeneratedPrompt('');
      setDisplayedPrompt('');
      setCopied(false);
      setIsTyping(false);
    }
  }, [playbook]);

  // Typing effect for the generated prompt
  useEffect(() => {
    if (view === 'generating' && generatedPrompt) {
      setIsTyping(true);
      setDisplayedPrompt('');
      let currentIndex = 0;

      const typingInterval = setInterval(() => {
        if (currentIndex < generatedPrompt.length) {
          setDisplayedPrompt(generatedPrompt.slice(0, currentIndex + 1));
          currentIndex++;

          // Auto-scroll to bottom
          if (displayContainerRef.current) {
            displayContainerRef.current.scrollTop = displayContainerRef.current.scrollHeight;
          }
        } else {
          setIsTyping(false);
          setView('result');
          clearInterval(typingInterval);
        }
      }, 8); // Adjust speed here (lower = faster)

      return () => clearInterval(typingInterval);
    }
  }, [view, generatedPrompt]);

  if (!playbook) return null;

  const handleInputChange = (id: string, value: string) => {
    setFormData({ ...formData, [id]: value });
  };

  const handleGenerate = () => {
    // Replace template variables with form data
    let prompt = playbook.promptTemplate;
    playbook.inputs.forEach((input) => {
      const value = formData[input.id] || input.defaultValue || '';
      const regex = new RegExp(`{{${input.id}}}`, 'g');
      prompt = prompt.replace(regex, value);
    });

    setGeneratedPrompt(prompt);
    setView('generating');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleOpenInChatGPT = () => {
    const encoded = encodeURIComponent(generatedPrompt);
    window.open(`https://chat.openai.com/?q=${encoded}`, '_blank');
  };

  const handleOpenInGemini = () => {
    const encoded = encodeURIComponent(generatedPrompt);
    window.open(`https://gemini.google.com/app?q=${encoded}`, '_blank');
  };

  const handleReset = () => {
    setView('form');
    setGeneratedPrompt('');
    setDisplayedPrompt('');
    setCopied(false);
    setIsTyping(false);
  };

  const renderInput = (input: PlaybookInput) => {
    switch (input.type) {
      case 'select':
        return (
          <Select
            value={formData[input.id] || input.defaultValue || ''}
            onChange={(e) => handleInputChange(input.id, e.target.value)}
          >
            {input.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        );
      case 'textarea':
        return (
          <TextArea
            value={formData[input.id] || ''}
            onChange={(e) => handleInputChange(input.id, e.target.value)}
            placeholder={input.placeholder}
            rows={4}
          />
        );
      default:
        return (
          <Input
            type="text"
            value={formData[input.id] || ''}
            onChange={(e) => handleInputChange(input.id, e.target.value)}
            placeholder={input.placeholder}
          />
        );
    }
  };

  const isFormValid = () => {
    return playbook.inputs
      .filter((input) => input.required)
      .every((input) => formData[input.id]?.trim());
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            {view === 'form'
              ? playbook.title
              : view === 'generating'
              ? '🤖 Generating Your Prompt...'
              : '✅ Your Custom Prompt is Ready'}
          </ModalTitle>
          <CloseButton onClick={onClose} disabled={isTyping}>
            <i className="bx bx-x"></i>
          </CloseButton>
        </ModalHeader>

        {view === 'form' ? (
          <>
            <FullDescription>
              <i className={`bx ${playbook.icon}`}></i> {playbook.fullDescription}
            </FullDescription>

            <Divider />

            <FormSection>
              <SectionTitle>Fill in the details below:</SectionTitle>

              {playbook.inputs.map((input) => (
                <InputGroup key={input.id}>
                  <Label>
                    {input.label} {input.required && <Required>*</Required>}
                  </Label>
                  {renderInput(input)}
                </InputGroup>
              ))}
            </FormSection>

            <ButtonGroup>
              <BackButton onClick={onClose}>
                <i className="bx bx-arrow-back"></i> Back
              </BackButton>
              <PrimaryButton onClick={handleGenerate} disabled={!isFormValid()}>
                Generate Prompt <i className="bx bx-right-arrow-alt"></i>
              </PrimaryButton>
            </ButtonGroup>
          </>
        ) : view === 'generating' ? (
          <>
            <Divider />

            <PromptDisplay ref={displayContainerRef}>
              <TerminalText isGenerating={isTyping}>
                {displayedPrompt}
              </TerminalText>
            </PromptDisplay>
          </>
        ) : (
          <>
            <Divider />

            <PromptDisplay ref={displayContainerRef}>
              <TerminalText isGenerating={false}>
                {generatedPrompt}
              </TerminalText>
            </PromptDisplay>

            <ActionButtons>
              <CopyButton onClick={handleCopy}>
                <i className={`bx ${copied ? 'bx-check' : 'bx-copy'}`}></i>
                {copied ? 'Copied!' : 'Copy Prompt'}
              </CopyButton>
              <ExternalButton onClick={handleOpenInChatGPT}>
                <i className="bx bx-bot"></i> Open in ChatGPT
              </ExternalButton>
              <ExternalButton onClick={handleOpenInGemini}>
                <i className="bx bx-sparkle"></i> Open in Gemini
              </ExternalButton>
              <ResetButton onClick={handleReset}>
                <i className="bx bx-refresh"></i> Generate New
              </ResetButton>
            </ActionButtons>
          </>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default PlaybookModal;
