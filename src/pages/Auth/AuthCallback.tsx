import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import styled from 'styled-components';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.dark2};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1rem;
`;

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // If Supabase returned an error in the URL, bail immediately
    const params = new URLSearchParams(window.location.search);
    if (params.get('error')) {
      navigate('/login');
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        navigate('/login');
        return;
      }

      const { user } = session;
      await supabase.from('profiles').upsert({
        user_id: user.id,
        email: user.email,
        display_name: user.user_metadata?.full_name ?? null,
        avatar_url: user.user_metadata?.avatar_url ?? null,
      }, { onConflict: 'user_id' });

      const next = sessionStorage.getItem('youtool_auth_next');
      sessionStorage.removeItem('youtool_auth_next');
      navigate(next || '/account');
    });
  }, [navigate]);

  return <Container>Signing you in…</Container>;
};

export default AuthCallback;
