// src/pages/NotFound/NotFound.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import * as S from './styles';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <S.Container>
      <S.Content>
        <S.ErrorCode>404</S.ErrorCode>
        <S.Title>Page Not Found</S.Title>
        <S.Description>
          Sorry, the page you're looking for doesn't exist. It might have been moved, 
          deleted, or you entered the wrong URL.
        </S.Description>
        
        <S.ButtonGroup>
          <Button
            variant="primary"
            icon="bx bx-home"
            onClick={() => navigate('/')}
          >
            Go Home
          </Button>
          <Button
            variant="secondary"
            icon="bx bx-wrench"
            onClick={() => navigate('/tools')}
          >
            Browse Tools
          </Button>
        </S.ButtonGroup>
        
        <S.HelpText>
          Need help? Contact us or check our documentation.
        </S.HelpText>
      </S.Content>
    </S.Container>
  );
};