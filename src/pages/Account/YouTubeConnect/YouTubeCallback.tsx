import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import styled from 'styled-components';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.dark2};
  padding: 2rem;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: 20px;
  padding: 2.5rem;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  text-align: center;
`;

const Logo = styled.img`
  width: 48px;
  height: 48px;
`;

const Heading = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const Sub = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
  line-height: 1.5;
`;

const StatusText = styled.p<{ $error?: boolean }>`
  font-size: 0.8rem;
  color: ${({ $error }) => $error ? '#f87171' : 'rgba(255,255,255,0.4)'};
  margin: 0;
`;

export const YouTubeCallback: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Connecting your YouTube channel…');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const oauthError = params.get('error');

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate('/login'); return; }

    if (oauthError) {
      setError(`Google denied access: ${oauthError}`);
      return;
    }

    if (!code) {
      setError('No authorization code received.');
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { navigate('/login'); return; }

      try {
        const res = await fetch('/api/youtube/exchange', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ code }),
        });

        const data = await res.json();
        if (data.error) {
          setError(`Connection failed: ${data.error}`);
          return;
        }

        setDone(true);
        setTimeout(() => navigate('/account'), 1500);
      } catch (err: any) {
        setError(`Network error: ${err.message}`);
      }
    });
  }, [loading, user, code, oauthError, navigate]);

  if (done) {
    return (
      <Container>
        <Card>
          <Logo src="/logo512_transparent.png" alt="YouTool" />
          <Heading>YouTube connected!</Heading>
          <Sub>Your channel is linked. Redirecting to your account…</Sub>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Card>
        <Logo src="/logo512_transparent.png" alt="YouTool" />
        <Heading>Connecting YouTube…</Heading>
        <Sub>Linking your YouTube channel to YouTool. Just a moment.</Sub>
        {error
          ? <StatusText $error>{error}</StatusText>
          : <StatusText>{status}</StatusText>
        }
      </Card>
    </Container>
  );
};

export default YouTubeCallback;
