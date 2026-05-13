import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/Button/Button';
import { AccountYouTubeInsights } from './AccountYouTubeInsights';
import { AdminPlatformStats } from './AdminPlatformStats';
import { AdminYouTubeResearchDashboard } from './AdminYouTubeResearchDashboard';
import styled from 'styled-components';

const CHROME_EXTENSION_STORE_URL = 'https://chromewebstore.google.com/search/YouTool.io';

// ─── Page shell (matches 404 background) ──────────────────────────────────────

const Page = styled.div`
  min-height: 100vh;
  padding: 3rem 2rem 6rem;
  background:
    radial-gradient(circle at 16% 12%, ${({ theme }) => theme.colors.red2}55 0%, transparent 28%),
    radial-gradient(circle at 86% 8%, ${({ theme }) => theme.colors.red1}88 0%, transparent 34%),
    linear-gradient(135deg,
      ${({ theme }) => theme.colors.dark1} 0%,
      ${({ theme }) => theme.colors.dark2} 52%,
      ${({ theme }) => theme.colors.dark3} 100%);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.018), transparent 38%),
      radial-gradient(ellipse at 70% 20%, rgba(125, 0, 0, 0.12) 0%, transparent 60%);
    pointer-events: none;
  }
`;

const Inner = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

// ─── Cards ────────────────────────────────────────────────────────────────────

const Card = styled.div`
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.018), transparent 42%),
    ${({ theme }) => theme.colors.dark3};
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.75rem;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.22);
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
  color: ${({ theme }) => theme.colors.red6};
  margin: 0;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  @media (max-width: 560px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

const HeroCard = styled(Card)`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 0.42fr);
  gap: 1.5rem;
  align-items: stretch;
  padding: 2rem;
  background:
    radial-gradient(circle at top right, ${({ theme }) => theme.colors.red3}42, transparent 46%),
    linear-gradient(135deg, ${({ theme }) => theme.colors.red1}33, transparent 34%),
    ${({ theme }) => theme.colors.dark3};

  @media (max-width: 920px) {
    grid-template-columns: 1fr;
  }
`;

const HeroContent = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.5rem;
`;

const HeroTitle = styled.h1`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: clamp(1.8rem, 4vw, 3.1rem);
  line-height: 0.98;
  letter-spacing: -0.04em;
  margin: 0.5rem 0 0;
`;

const HeroSub = styled.p`
  max-width: 620px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.95rem;
  line-height: 1.65;
  margin: 0.8rem 0 0;
`;

const HeroActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const ProfilePanel = styled.div`
  min-width: 0;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgba(185, 28, 28, 0.08), rgba(255, 255, 255, 0.018)),
    rgba(255, 255, 255, 0.025);
  padding: 1.25rem;
  display: grid;
  gap: 1rem;
  align-content: space-between;
`;

const ProfileMini = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.9rem;
  min-width: 0;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
  gap: 1.5rem;

  @media (max-width: 880px) {
    grid-template-columns: 1fr;
  }
`;

const BenefitGrid = styled.div`
  display: grid;
  gap: 0.75rem;
`;

const BenefitTile = styled.div<{ $premium?: boolean }>`
  display: grid;
  grid-template-columns: 34px 1fr;
  gap: 0.8rem;
  align-items: start;
  padding: 0.9rem;
  border: 1px solid ${({ $premium }) => $premium ? 'rgba(185, 28, 28, 0.42)' : 'rgba(255,255,255,0.08)'};
  border-radius: 12px;
  background: ${({ $premium }) => $premium
    ? 'linear-gradient(135deg, rgba(185, 28, 28, 0.13), rgba(82, 1, 1, 0.08))'
    : 'rgba(255,255,255,0.018)'};
`;

const BenefitIcon = styled.div<{ $active?: boolean }>`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: ${({ $active, theme }) => $active ? `${theme.colors.red1}` : 'rgba(255,255,255,0.05)'};
  color: ${({ $active, theme }) => $active ? theme.colors.red6 : theme.colors.text.muted};
`;

const BenefitTitle = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.88rem;
  font-weight: 700;
`;

const BenefitSub = styled.div`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.74rem;
  line-height: 1.45;
  margin-top: 0.18rem;
`;

// ─── Profile ─────────────────────────────────────────────────────────────────

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
  overflow-wrap: anywhere;
  white-space: normal;
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
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.dark4}, ${({ theme }) => theme.colors.dark3});
  border: 1px solid rgba(255, 255, 255, 0.06);
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
  background: ${({ $connected }) => $connected ? '#f87171' : 'rgba(255,255,255,0.2)'};
  display: inline-block;
  flex-shrink: 0;
  box-shadow: ${({ $connected }) => $connected ? '0 0 8px rgba(248, 113, 113, 0.7)' : 'none'};
`;

// ─── Extension instructions ───────────────────────────────────────────────────

const InstructionBox = styled.div`
  background: linear-gradient(135deg, rgba(46, 4, 4, 0.38), rgba(255, 255, 255, 0.018));
  border: 1px solid rgba(185, 28, 28, 0.22);
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
  background: ${({ theme }) => theme.colors.red1};
  color: ${({ theme }) => theme.colors.red6};
  font-size: 0.68rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
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

const AllToolsLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 34px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  background: rgba(255, 255, 255, 0.035);
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0 0.85rem;
  text-decoration: none;

  &:hover {
    border-color: rgba(248, 113, 113, 0.45);
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const ExtensionStoreCard = styled.a`
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) auto;
  gap: 0.85rem;
  align-items: center;
  margin: 1rem 0 0.9rem;
  padding: 0.95rem 1rem;
  border-radius: 14px;
  border: 1px solid rgba(185, 28, 28, 0.34);
  background:
    radial-gradient(circle at top left, ${({ theme }) => theme.colors.red3}36, transparent 46%),
    linear-gradient(135deg, rgba(82, 1, 1, 0.34), rgba(255, 255, 255, 0.018));
  color: ${({ theme }) => theme.colors.text.primary};
  text-decoration: none;
  transition: border-color 0.2s ease, transform 0.2s ease, background 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.red4};
    transform: translateY(-1px);
    background:
      radial-gradient(circle at top left, ${({ theme }) => theme.colors.red3}55, transparent 48%),
      linear-gradient(135deg, rgba(82, 1, 1, 0.42), rgba(255, 255, 255, 0.026));
  }
`;

const ExtensionStoreIcon = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
  box-shadow: 0 10px 26px rgba(185, 28, 28, 0.28);
  color: white;

  i {
    font-size: 1.25rem;
  }
`;

const ExtensionStoreCopy = styled.div`
  min-width: 0;

  strong {
    display: block;
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 0.88rem;
    line-height: 1.25;
  }

  span {
    display: block;
    color: ${({ theme }) => theme.colors.text.muted};
    font-size: 0.72rem;
    line-height: 1.45;
    margin-top: 0.18rem;
  }
`;

const ExtensionStoreArrow = styled.span`
  width: 28px;
  height: 28px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.06);
  color: ${({ theme }) => theme.colors.red6};
  flex-shrink: 0;
`;

const PlanBadge = styled.span<{ $premium?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  border: 1px solid ${({ $premium }) => $premium ? 'rgba(185, 28, 28, 0.48)' : 'rgba(255,255,255,0.12)'};
  background: ${({ $premium }) => $premium ? 'rgba(185, 28, 28, 0.16)' : 'rgba(255,255,255,0.05)'};
  color: ${({ $premium, theme }) => $premium ? theme.colors.red6 : theme.colors.text.secondary};
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${({ $premium, theme }) => $premium ? theme.colors.red5 : 'rgba(255,255,255,0.28)'};
    box-shadow: ${({ $premium }) => $premium ? '0 0 10px rgba(229, 72, 72, 0.72)' : 'none'};
  }
`;

const StatusPill = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.05);
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.76rem;
  font-weight: 700;
  padding: 0 0.75rem;
`;

const BillingNotice = styled.div<{ $canceling?: boolean }>`
  display: grid;
  gap: 0.35rem;
  margin: 0;
  padding: 0.95rem 1rem;
  border-radius: 12px;
  border: 1px solid ${({ $canceling }) => $canceling ? 'rgba(248, 113, 113, 0.38)' : 'rgba(248, 113, 113, 0.22)'};
  background: ${({ $canceling }) => $canceling ? 'rgba(127, 29, 29, 0.22)' : 'rgba(248, 113, 113, 0.1)'};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.8rem;
  line-height: 1.45;

  strong {
    color: ${({ $canceling }) => $canceling ? '#fecaca' : '#fff'};
    font-size: 0.86rem;
  }
`;

const BillingRows = styled.div`
  display: grid;
  gap: 0;
  border-top: 1px solid ${({ theme }) => theme.colors.dark5};
`;

const BillingRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark5};

  &:last-child { border-bottom: none; }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
    align-items: stretch;
  }
`;

const BillingRowTitle = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.92rem;
  font-weight: 700;
`;

const BillingRowMeta = styled.div`
  margin-top: 0.2rem;
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.75rem;
  line-height: 1.45;
`;

const BillingError = styled.div`
  margin-top: 1rem;
  padding: 0.8rem 0.95rem;
  border: 1px solid rgba(248, 113, 113, 0.22);
  border-radius: 10px;
  background: rgba(127, 29, 29, 0.16);
  color: #fecaca;
  font-size: 0.78rem;
  line-height: 1.45;
`;

interface BillingStatus {
  plan: string;
  label: string;
  isPremium: boolean;
  status: string;
  interval: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  hasStripeCustomer: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const Account: React.FC = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [extensionConnected, setExtensionConnected] = useState<boolean | null>(null);
  const [lastUsed, setLastUsed] = useState<string | null>(null);
  const [ytChannel, setYtChannel] = useState<{ title: string; thumbnail: string | null } | null>(null);
  const [ytConnecting, setYtConnecting] = useState(false);
  const [ytDisconnecting, setYtDisconnecting] = useState(false);
  const [isResearchAdmin, setIsResearchAdmin] = useState(false);
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingAction, setBillingAction] = useState('');
  const [billingError, setBillingError] = useState('');

  useEffect(() => {
    if (!user) return;
    setIsResearchAdmin(false);
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

      fetch('/api/youtube/account-dashboard?admin=status', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
        .then(r => r.json())
        .then(({ isAdmin }) => setIsResearchAdmin(Boolean(isAdmin)))
        .catch(() => setIsResearchAdmin(false));

      fetch('/api/youtube/account-dashboard?connection=status', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
        .then(r => r.json())
        .then(({ connected, channelTitle, channelThumbnail }) => {
          setYtChannel(connected ? { title: channelTitle, thumbnail: channelThumbnail } : null);
        })
        .catch(() => setYtChannel(null));

      const checkoutParams = new URLSearchParams(location.search);
      const checkoutSessionId = checkoutParams.get('session_id');
      const shouldSyncCheckout = checkoutParams.get('checkout') === 'success' && checkoutSessionId;

      setBillingLoading(true);
      const billingRequest = shouldSyncCheckout
        ? fetch('/api/billing', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'sync_checkout_session', sessionId: checkoutSessionId }),
          })
        : fetch('/api/billing?action=status', {
            headers: { Authorization: `Bearer ${session.access_token}` },
          });

      billingRequest
        .then(r => r.json())
        .then(({ billing, message }) => {
          setBilling(billing || null);
          if (!billing && message) setBillingError(message);
        })
        .catch(() => setBilling(null))
        .finally(() => setBillingLoading(false));
    });
  }, [user, location.search]);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const name  = user.user_metadata?.full_name ?? 'YouTool User';
  const avatar = user.user_metadata?.avatar_url as string | undefined;

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  const handleDisconnectYouTube = async () => {
    if (!window.confirm('Disconnect your YouTube channel from YouTool? This stops new connected-channel stats requests and deletes stored private YouTube analytics history tied to your account.')) return;
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

  const refreshBilling = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch('/api/billing?action=status', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const payload = await res.json();
    if (payload.billing) setBilling(payload.billing);
  };

  const handleStartCheckout = async (interval: 'monthly' | 'yearly') => {
    setBillingError('');
    if (!ytChannel) {
      setBillingError('Connect your YouTube channel before upgrading to Premium.');
      return;
    }

    setBillingAction(interval);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate('/login'); return; }

    try {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'create_checkout_session', interval }),
      });
      const payload = await res.json();
      if (!res.ok || !payload.url) throw new Error(payload.message || 'Could not start checkout.');
      window.location.href = payload.url;
    } catch (error) {
      setBillingError(error instanceof Error ? error.message : 'Could not start checkout.');
      setBillingAction('');
    }
  };

  const handleManageBilling = async () => {
    setBillingError('');
    setBillingAction('portal');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate('/login'); return; }

    try {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'create_customer_portal_session' }),
      });
      const payload = await res.json();
      if (!res.ok || !payload.url) throw new Error(payload.message || 'Could not open billing portal.');
      window.location.href = payload.url;
    } catch (error) {
      setBillingError(error instanceof Error ? error.message : 'Could not open billing portal.');
      setBillingAction('');
      refreshBilling().catch(() => {});
    }
  };

  const formatLastUsed = (iso: string | null) => {
    if (!iso) return null;
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatBillingDate = (iso: string | null) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isPremium = Boolean(billing?.isPremium);
  const billingLabel = billingLoading ? 'Checking' : isPremium ? 'Premium' : 'Free';
  const billingPeriodEndLabel = formatBillingDate(billing?.currentPeriodEnd || null);
  const billingIsCanceling = Boolean(isPremium && billing?.cancelAtPeriodEnd && billingPeriodEndLabel);
  const billingRenewalCopy = billingPeriodEndLabel
    ? billingIsCanceling
      ? `Your plan will cancel on ${billingPeriodEndLabel}`
      : `Renews on ${billingPeriodEndLabel}`
    : '';
  const extensionStatusCopy = extensionConnected === null
    ? 'Checking extension session...'
    : extensionConnected
      ? `Connected${lastUsed ? ` - Last used ${formatLastUsed(lastUsed)}` : ''}`
      : 'Open the Chrome extension and sign in to link this account.';
  const youtubeStatusCopy = ytChannel
    ? `Connected to ${ytChannel.title}`
    : 'Connect your YouTube channel to unlock stats, full analysis, and extension tools.';

  return (
    <Page>
      <Inner>

        <TopBar>
          <BackLink to="/"><i className="bx bx-arrow-back"></i> Back to home</BackLink>
          <HeroActions>
            <AllToolsLink to="/tools"><i className="bx bx-grid-alt"></i> All tools</AllToolsLink>
            <SignOutLink onClick={handleSignOut}>Sign out</SignOutLink>
          </HeroActions>
        </TopBar>

        <HeroCard>
          <HeroContent>
            <div>
              <CardTitle>Membership</CardTitle>
              <HeroTitle>{isPremium ? 'Premium is active' : 'Your YouTool dashboard'}</HeroTitle>
              <HeroSub>
                {isPremium
                  ? 'You have access to YouTool’s in-YouTube workflow: analysis, exports, and Studio tools without leaving YouTube.'
                  : 'Connect your channel, manage extension access, and upgrade when you want YouTool’s tools directly inside YouTube.'}
              </HeroSub>
            </div>

            <HeroActions>
              {isPremium ? (
                <Button
                  variant="primary"
                  size="sm"
                  disabled={billingAction !== '' || !billing?.hasStripeCustomer}
                  onClick={handleManageBilling}
                >
                  {billingAction === 'portal' ? 'Opening…' : 'Manage billing'}
                </Button>
              ) : ytChannel ? (
                <Button
                  variant="primary"
                  size="sm"
                  disabled={billingLoading || billingAction !== ''}
                  onClick={() => handleStartCheckout('yearly')}
                >
                  {billingAction === 'yearly' ? 'Opening…' : 'Upgrade to Premium'}
                </Button>
              ) : (
                <Button variant="primary" size="sm" onClick={handleConnectYouTube} disabled={ytConnecting}>
                  {ytConnecting ? 'Redirecting…' : 'Connect YouTube'}
                </Button>
              )}
              {billingRenewalCopy && <StatusPill>{billingRenewalCopy}</StatusPill>}
            </HeroActions>

            {isPremium && billingRenewalCopy && (
              <BillingNotice $canceling={billingIsCanceling}>
                <strong>{billingRenewalCopy}</strong>
                <span>
                  {billingIsCanceling
                    ? 'You keep Premium access until that date, including the Chrome extension features.'
                    : 'Your Premium access and Chrome extension features stay active.'}
                </span>
              </BillingNotice>
            )}

            {!isPremium && (
              <BillingRows>
                <BillingRow>
                  <div>
                    <BillingRowTitle>Monthly</BillingRowTitle>
                    <BillingRowMeta>$4.99/month · In-YouTube YouTool tools</BillingRowMeta>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={billingLoading || billingAction !== '' || !ytChannel}
                    onClick={() => handleStartCheckout('monthly')}
                  >
                    {billingAction === 'monthly' ? 'Opening…' : 'Upgrade'}
                  </Button>
                </BillingRow>

                <BillingRow>
                  <div>
                    <BillingRowTitle>Yearly</BillingRowTitle>
                    <BillingRowMeta>$47.99/year · About 20% off</BillingRowMeta>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={billingLoading || billingAction !== '' || !ytChannel}
                    onClick={() => handleStartCheckout('yearly')}
                  >
                    {billingAction === 'yearly' ? 'Opening…' : 'Upgrade'}
                  </Button>
                </BillingRow>
              </BillingRows>
            )}

            {billingError && <BillingError>{billingError}</BillingError>}
          </HeroContent>

          <ProfilePanel>
            <ProfileMini>
              {avatar
                ? <Avatar src={avatar} alt={name} />
                : <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
              }
              <ProfileInfo>
                <ProfileName>{name}</ProfileName>
                <ProfileEmail>{user.email}</ProfileEmail>
              </ProfileInfo>
            </ProfileMini>
            <StatusRow>
              <StatusLeft>
                <StatusIcon><i className="bx bx-id-card"></i></StatusIcon>
                <div>
                  <StatusLabel>{billingLabel}</StatusLabel>
                  <StatusSub>{isPremium ? 'Full extension access' : 'Free extension account'}</StatusSub>
                </div>
              </StatusLeft>
              <PlanBadge $premium={isPremium}>{billingLabel}</PlanBadge>
            </StatusRow>
          </ProfilePanel>
        </HeroCard>

        <DashboardGrid>
          <Card>
            <CardHeader>
              <CardTitle>Plan benefits</CardTitle>
              <PlanBadge $premium={isPremium}>{isPremium ? 'Unlocked' : 'Free'}</PlanBadge>
            </CardHeader>
            <BenefitGrid>
              <BenefitTile $premium>
                <BenefitIcon $active><i className="bx bx-line-chart"></i></BenefitIcon>
                <div>
                  <BenefitTitle>Channel stats and full analysis</BenefitTitle>
                  <BenefitSub>1D, 7D, 30D stats, trend graphs, and the deeper channel analysis stay available after connecting YouTube.</BenefitSub>
                </div>
              </BenefitTile>
              <BenefitTile $premium={isPremium}>
                <BenefitIcon $active={isPremium}><i className="bx bx-window-open"></i></BenefitIcon>
                <div>
                  <BenefitTitle>Use YouTool tools inside YouTube</BenefitTitle>
                  <BenefitSub>{isPremium ? 'Unlimited in-YouTube tool runs are active.' : 'Free accounts get limited weekly in-YouTube tool runs before Premium is needed.'}</BenefitSub>
                </div>
              </BenefitTile>
              <BenefitTile $premium={isPremium}>
                <BenefitIcon $active={isPremium}><i className="bx bx-download"></i></BenefitIcon>
                <div>
                  <BenefitTitle>In-page exports</BenefitTitle>
                  <BenefitSub>Download comments, analysis, and working files from YouTube pages without bouncing between tabs.</BenefitSub>
                </div>
              </BenefitTile>
              <BenefitTile $premium={isPremium}>
                <BenefitIcon $active={isPremium}><i className="bx bx-slider-alt"></i></BenefitIcon>
                <div>
                  <BenefitTitle>Premium Studio workflow tools</BenefitTitle>
                  <BenefitSub>More timelines, content columns, streamer mode, and real-time engaged views are Premium extension features.</BenefitSub>
                </div>
              </BenefitTile>
            </BenefitGrid>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Extension access</CardTitle>
              <PlanBadge $premium={extensionConnected === true}>{extensionConnected === true ? 'Connected' : 'Setup'}</PlanBadge>
            </CardHeader>

            <StatusRow>
              <StatusLeft>
                <StatusIcon><i className="bx bx-extension"></i></StatusIcon>
                <div>
                  <StatusLabel>Chrome extension</StatusLabel>
                  <StatusSub>{extensionStatusCopy}</StatusSub>
                </div>
              </StatusLeft>
              <Dot $connected={extensionConnected === true} />
            </StatusRow>

            <ExtensionStoreCard href={CHROME_EXTENSION_STORE_URL} target="_blank" rel="noopener noreferrer">
              <ExtensionStoreIcon><i className="bx bxl-chrome"></i></ExtensionStoreIcon>
              <ExtensionStoreCopy>
                <strong>{extensionConnected ? 'Get the Chrome Extension' : 'Install the Chrome Extension'}</strong>
                <span>
                  {extensionConnected
                    ? 'Install YouTool on another browser or computer whenever you need it.'
                    : 'Get YouTool on this computer and open the tools directly inside YouTube.'}
                </span>
              </ExtensionStoreCopy>
              <ExtensionStoreArrow><i className="bx bx-right-arrow-alt"></i></ExtensionStoreArrow>
            </ExtensionStoreCard>

            <StatusRow>
              <StatusLeft>
                <StatusIcon><i className="bx bxl-youtube"></i></StatusIcon>
                <div>
                  <StatusLabel>YouTube channel</StatusLabel>
                  <StatusSub>
                    {ytChannel
                      ? <>{youtubeStatusCopy} · <SignOutLink onClick={handleDisconnectYouTube} disabled={ytDisconnecting}>{ytDisconnecting ? 'Disconnecting…' : 'Disconnect'}</SignOutLink></>
                      : youtubeStatusCopy}
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
              <InstructionTitle>Extension setup</InstructionTitle>
              <InstructionStep>
                <StepNum>1</StepNum>
                Use the install card above, then pin the YouTool.io Chrome extension.
              </InstructionStep>
              <InstructionStep>
                <StepNum>2</StepNum>
                Open the extension popup and sign in with this account.
              </InstructionStep>
              <InstructionStep>
                <StepNum>3</StepNum>
                Connect YouTube to unlock channel-aware tools.
              </InstructionStep>
            </InstructionBox>}
          </Card>
        </DashboardGrid>

        {ytChannel && <AccountYouTubeInsights channel={ytChannel} />}

        {isResearchAdmin && <AdminPlatformStats />}

        {isResearchAdmin && <AdminYouTubeResearchDashboard />}

      </Inner>
    </Page>
  );
};

export default Account;
