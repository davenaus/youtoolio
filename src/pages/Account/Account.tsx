import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/Button/Button';
import { AccountYouTubeInsights } from './AccountYouTubeInsights';
import styled from 'styled-components';

// ─── Page shell (matches 404 background) ──────────────────────────────────────

const Page = styled.div`
  min-height: 100vh;
  padding: 3rem 2rem 6rem;
  background: linear-gradient(135deg,
    ${({ theme }) => theme.colors.dark1} 0%,
    ${({ theme }) => theme.colors.dark2} 50%,
    ${({ theme }) => theme.colors.dark3} 100%);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 70% 20%, rgba(125, 0, 0, 0.1) 0%, transparent 60%);
    pointer-events: none;
  }
`;

const Inner = styled.div`
  max-width: 760px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

// ─── Cards ────────────────────────────────────────────────────────────────────

const Card = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: 16px;
  padding: 1.75rem;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
`;

const CardTitle = styled.h2`
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${({ theme }) => theme.colors.text.muted};
  margin: 0;
`;

// ─── Profile ─────────────────────────────────────────────────────────────────

const ProfileRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;

  @media (max-width: 480px) { flex-direction: column; text-align: center; }
`;

const Avatar = styled.img`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.colors.dark5};
  flex-shrink: 0;
`;

const AvatarFallback = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4});
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
`;

const ProfileInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ProfileName = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 0.2rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ProfileEmail = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
`;

// ─── Status rows ─────────────────────────────────────────────────────────────

const StatusRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark5};
  gap: 1rem;
  &:last-child { border-bottom: none; }
`;

const StatusLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.875rem;
`;

const StatusIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.dark4};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  i {
    font-size: 1.1rem;
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

const StatusLabel = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const StatusSub = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: 0.15rem;
`;

const Dot = styled.span<{ $connected?: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $connected }) => $connected ? '#4ade80' : 'rgba(255,255,255,0.2)'};
  display: inline-block;
  flex-shrink: 0;
  box-shadow: ${({ $connected }) => $connected ? '0 0 6px rgba(74, 222, 128, 0.6)' : 'none'};
`;

// ─── Extension instructions ───────────────────────────────────────────────────

const InstructionBox = styled.div`
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: 12px;
  padding: 1.25rem;
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const InstructionTitle = styled.p`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const InstructionStep = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.5;
`;

const StepNum = styled.span`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.dark5};
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.68rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
`;

// ─── Promo grid ───────────────────────────────────────────────────────────────

const PromoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;

  @media (max-width: 600px) { grid-template-columns: 1fr; }
`;

const PromoTile = styled(Link)`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: 14px;
  padding: 1.25rem;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.red3};
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  }
`;

const PromoTileIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4});
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.25rem;

  i { font-size: 1.1rem; color: white; }
`;

const PromoTileTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const PromoTileSub = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.muted};
  line-height: 1.4;
`;

const SignOutLink = styled.button`
  background: none;
  border: none;
  min-height: 0;
  font-size: 0.8rem;
  font-family: ${({ theme }) => theme.fonts.primary};
  color: ${({ theme }) => theme.colors.text.muted};
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
  &:hover { color: #f87171; }
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text.muted};
  text-decoration: none;
  transition: color 0.2s;
  &:hover { color: ${({ theme }) => theme.colors.text.primary}; }
`;

// ─── Component ────────────────────────────────────────────────────────────────

export const Account: React.FC = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [extensionConnected, setExtensionConnected] = useState<boolean | null>(null);
  const [lastUsed, setLastUsed] = useState<string | null>(null);
  const [ytChannel, setYtChannel] = useState<{ title: string; thumbnail: string | null } | null>(null);
  const [ytConnecting, setYtConnecting] = useState(false);
  const [ytDisconnecting, setYtDisconnecting] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;

      fetch('/api/extension/session/status', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
        .then(r => r.json())
        .then(({ connected, last_used_at }) => {
          setExtensionConnected(connected);
          setLastUsed(last_used_at);
        })
        .catch(() => setExtensionConnected(false));

      // Check YouTube connection via Supabase directly
      supabase
        .from('youtube_connections')
        .select('channel_title, channel_thumbnail_url')
        .is('disconnected_at', null)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setYtChannel({ title: data.channel_title, thumbnail: data.channel_thumbnail_url });
        });
    });
  }, [user]);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const name  = user.user_metadata?.full_name ?? 'YouTool User';
  const avatar = user.user_metadata?.avatar_url as string | undefined;

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  const handleDisconnectYouTube = async () => {
    if (!window.confirm('Disconnect your YouTube channel from YouTool?')) return;
    setYtDisconnecting(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setYtDisconnecting(false); return; }
    await fetch('/api/youtube/disconnect', {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    setYtChannel(null);
    setYtDisconnecting(false);
  };

  const handleConnectYouTube = async () => {
    setYtConnecting(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate('/login'); return; }
    const res = await fetch('/api/youtube/connect', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const { url, error } = await res.json();
    if (error || !url) { setYtConnecting(false); return; }
    window.location.href = url;
  };

  const formatLastUsed = (iso: string | null) => {
    if (!iso) return null;
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Page>
      <Inner>

        <BackLink to="/"><i className="bx bx-arrow-back"></i> Back to home</BackLink>

        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <SignOutLink onClick={handleSignOut}>Sign out</SignOutLink>
          </CardHeader>
          <ProfileRow>
            {avatar
              ? <Avatar src={avatar} alt={name} />
              : <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
            }
            <ProfileInfo>
              <ProfileName>{name}</ProfileName>
              <ProfileEmail>{user.email}</ProfileEmail>
            </ProfileInfo>
          </ProfileRow>
        </Card>

        {/* Extension */}
        <Card>
          <CardHeader>
            <CardTitle>YouTool Extension</CardTitle>
          </CardHeader>

          <StatusRow>
            <StatusLeft>
              <StatusIcon><i className="bx bx-extension"></i></StatusIcon>
              <div>
                <StatusLabel>Extension status</StatusLabel>
                <StatusSub>
                  {extensionConnected === null
                    ? 'Checking…'
                    : extensionConnected
                      ? `Connected${lastUsed ? ` · Last used ${formatLastUsed(lastUsed)}` : ''}`
                      : 'Sign in from the extension popup to connect'}
                </StatusSub>
              </div>
            </StatusLeft>
            <Dot $connected={extensionConnected === true} />
          </StatusRow>

          <StatusRow>
            <StatusLeft>
              <StatusIcon><i className="bx bxl-youtube"></i></StatusIcon>
              <div>
                <StatusLabel>YouTube channel</StatusLabel>
                <StatusSub>
                  {ytChannel
                    ? <>Connected · {ytChannel.title} · <SignOutLink onClick={handleDisconnectYouTube} disabled={ytDisconnecting}>{ytDisconnecting ? 'Disconnecting…' : 'Disconnect'}</SignOutLink></>
                    : 'Not connected — link your channel to unlock analytics'}
                </StatusSub>
              </div>
            </StatusLeft>
            {ytChannel
              ? <Dot $connected />
              : <Button variant="secondary" size="sm" onClick={handleConnectYouTube} disabled={ytConnecting}>
                  {ytConnecting ? 'Redirecting…' : 'Connect'}
                </Button>
            }
          </StatusRow>

          {extensionConnected !== true && <InstructionBox>
            <InstructionTitle>Don't have the extension yet?</InstructionTitle>
            <InstructionStep>
              <StepNum>1</StepNum>
              Install the YouTool.io Extension from the Chrome Web Store
            </InstructionStep>
            <InstructionStep>
              <StepNum>2</StepNum>
              Pin it to your Chrome toolbar and open the popup
            </InstructionStep>
            <InstructionStep>
              <StepNum>3</StepNum>
              Click "Sign in with Google" — your account here links automatically
            </InstructionStep>
            <InstructionStep>
              <StepNum>4</StepNum>
              Click "Connect YouTube" inside the extension to unlock channel tools
            </InstructionStep>
            <div style={{ marginTop: '0.25rem' }}>
              <Button
                variant="primary"
                icon="bx bx-extension"
                iconPosition="left"
                onClick={() => window.open('https://chrome.google.com/webstore', '_blank')}
              >
                Get the Extension
              </Button>
            </div>
          </InstructionBox>}
        </Card>

        {ytChannel && <AccountYouTubeInsights channel={ytChannel} />}

        {/* Promo — explore the website */}
        <CardTitle style={{ padding: '0 0.25rem' }}>While you're here</CardTitle>
        <PromoGrid>
          <PromoTile to="/tools">
            <PromoTileIcon><i className="bx bx-wrench"></i></PromoTileIcon>
            <PromoTileTitle>20+ Free Tools</PromoTileTitle>
            <PromoTileSub>Analyze videos, research keywords, test thumbnails — no login needed.</PromoTileSub>
          </PromoTile>
          <PromoTile to="/tools/outlier-finder">
            <PromoTileIcon><i className="bx bx-trophy"></i></PromoTileIcon>
            <PromoTileTitle>Outlier Finder</PromoTileTitle>
            <PromoTileSub>Find videos that blew up in your niche and decode why they worked.</PromoTileSub>
          </PromoTile>
          <PromoTile to="/tools/keyword-analyzer">
            <PromoTileIcon><i className="bx bx-search-alt"></i></PromoTileIcon>
            <PromoTileTitle>Keyword Analyzer</PromoTileTitle>
            <PromoTileSub>Discover what your audience is searching for and rank faster.</PromoTileSub>
          </PromoTile>
        </PromoGrid>

      </Inner>
    </Page>
  );
};

export default Account;
