import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button/Button';
import styled from 'styled-components';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg,
    ${({ theme }) => theme.colors.dark1} 0%,
    ${({ theme }) => theme.colors.dark2} 50%,
    ${({ theme }) => theme.colors.dark3} 100%);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at center, rgba(125, 0, 0, 0.12) 0%, transparent 70%);
    pointer-events: none;
  }
`;

const Content = styled.div`
  text-align: center;
  max-width: 440px;
  width: 100%;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
`;

const Logo = styled.img`
  width: 52px;
  height: 52px;
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 0.75rem;

  @media (max-width: 480px) { font-size: 1.6rem; }
`;

const Sub = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1rem;
  line-height: 1.6;
  margin: 0 0 2rem;
`;

const Card = styled.div`
  width: 100%;
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: 20px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
`;

const GoogleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  height: 52px;
  background: #ffffff;
  color: #1a1a1a;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  font-family: ${({ theme }) => theme.fonts.primary};
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    transform: translateY(-1px);
  }
  &:active { transform: translateY(0); }
`;

const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.dark5};
`;

const Fine = styled.p`
  font-size: 0.78rem;
  color: ${({ theme }) => theme.colors.text.muted};
  margin: 0;
  line-height: 1.5;
  text-align: center;

  a {
    color: ${({ theme }) => theme.colors.text.secondary};
    text-decoration: underline;
    &:hover { color: ${({ theme }) => theme.colors.text.primary}; }
  }
`;

const HelpText = styled.p`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.875rem;
  margin: 0;

  a {
    color: ${({ theme }) => theme.colors.red4};
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
`;

export const Login: React.FC = () => {
  const { signInWithGoogle, user } = useAuth();

  if (user) return <Navigate to="/account" replace />;

  return (
    <Container>
      <Content>
        <Logo src="/logo512_transparent.png" alt="YouTool" />
        <Title>Sign in to YouTool</Title>
        <Sub>
          Access your account, manage your extension, and unlock
          tools built around your channel.
        </Sub>

        <Card>
          <GoogleButton onClick={signInWithGoogle}>
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </GoogleButton>
          <Divider />
          <Fine>
            By continuing you agree to our{' '}
            <Link to="/terms-of-service">Terms of Service</Link> and{' '}
            <Link to="/privacy-policy">Privacy Policy</Link>.
          </Fine>
        </Card>

        <HelpText>
          Just browsing? <Link to="/tools">Explore all free tools →</Link>
        </HelpText>
      </Content>
    </Container>
  );
};

export default Login;
