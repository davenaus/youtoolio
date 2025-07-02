// components/HomepageModal/HomepageModal.tsx
import React from 'react';
import * as S from './styles';

interface HomepageModalProps {
  isOpen: boolean;
  onClose: () => void;
  badge?: string;
  title: string;
  description: string;
  buttonText?: string;
  imageUrl?: string;
  imageAlt?: string;
}

export const HomepageModal: React.FC<HomepageModalProps> = ({ 
  isOpen, 
  onClose, 
  badge = "Announcement",
  title,
  description,
  buttonText = "Continue",
  imageUrl,
  imageAlt = "Announcement"
}) => {
  if (!isOpen) return null;

  return (
    <S.ModalOverlay onClick={onClose}>
      <S.ModalContent onClick={(e) => e.stopPropagation()}>
        <S.ModalClose onClick={onClose}>
          <i className="bx bx-x"></i>
        </S.ModalClose>
        
        <S.ModalBody>
          <S.ModalBadge>{badge}</S.ModalBadge>
          <S.ModalTitle>{title}</S.ModalTitle>
          
          {imageUrl && (
            <S.ModalImageContainer>
              <S.ModalImage 
                src={imageUrl} 
                alt={imageAlt} 
              />
              <S.ModalImageOverlay />
            </S.ModalImageContainer>
          )}
          
          <S.ModalDescription>
            {description}
          </S.ModalDescription>
          
          <S.ModalButton onClick={onClose}>
            <span>{buttonText}</span>
            <i className="bx bx-right-arrow-alt"></i>
          </S.ModalButton>
        </S.ModalBody>
      </S.ModalContent>
    </S.ModalOverlay>
  );
};