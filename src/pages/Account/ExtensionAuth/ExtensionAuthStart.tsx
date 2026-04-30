import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
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

const StatusText = styled.p<{ error?: boolean }>`
  font-size: 0.8rem;
  color: ${({ error }) => error ? '#f87171' : 'rgba(255,255,255,0.4)'};
  margin: 0;
`;

export const ExtensionAuthStart: React.FC = () => {
  const { user, session, loading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Verifying your session…');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const redirectUri = params.get('redirect_uri') ?? '';
  const state = params.get('state') ?? '';
  const extensionId = params.get('extension_id') ?? '';

  useEffect(() => {
    if (loading) return;

    // Not logged in — save this URL and send to login
    if (!user || !session) {
      sessionStorage.setItem('youtool_auth_next', window.location.pathname + window.location.search);
      navigate('/login');
      return;
    }

    if (!redirectUri || !extensionId) {
      setError('Invalid request — missing redirect_uri or extension_id.');
      return;
    }

    setStatus('Generating extension token…');

    // Call the serverless function to create a one-time code
    fetch('/api/extension/session/create-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ redirect_uri: redirectUri, state, extension_id: extensionId }),
    })
      .then(async res => {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (data.error) { setError(`API error: ${data.error}`); return; }
          setDone(true);
          window.location.href = data.redirect;
        } catch {
          setError(`Bad response (${res.status}): ${text.slice(0, 200)}`);
        }
      })
      .catch(err => setError(`Network error: ${err.message}`));
  }, [loading, user, session, redirectUri, extensionId, state, navigate]);

  if (done) {
    return (
      <Container>
        <Card>
          <Logo src="/logo512_transparent.png" alt="YouTool" />
          <Heading>You're all set!</Heading>
          <Sub>Your account is linked to the extension. You can close this window.</Sub>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Card>
        <Logo src="/logo512_transparent.png" alt="YouTool" />
        <Heading>Connecting to extension…</Heading>
        <Sub>
          Linking your YouTool account to the Chrome extension.
          This window will close automatically.
        </Sub>
        {error
          ? <StatusText error>{error}</StatusText>
          : <StatusText>{status}</StatusText>
        }
      </Card>
    </Container>
  );
};

export default ExtensionAuthStart;
