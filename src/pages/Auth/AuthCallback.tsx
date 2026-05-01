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
    // Use onAuthStateChange so we wait for Supabase to finish exchanging
    // the PKCE code before checking the session. getSession() races and
    // returns null if called before the exchange completes.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          subscription.unsubscribe();

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
        } else if (event === 'INITIAL_SESSION' && !session) {
          subscription.unsubscribe();
          navigate('/login');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  return <Container>Signing you in…</Container>;
};

export default AuthCallback;
