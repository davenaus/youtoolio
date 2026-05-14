import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/Button/Button';
import { AccountYouTubeInsights } from './AccountYouTubeInsights';
import { AdminPlatformStats } from './AdminPlatformStats';
import { AdminYouTubeResearchDashboard } from './AdminYouTubeResearchDashboard';
import styled, { keyframes } from 'styled-components';

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

const skeletonShimmer = keyframes`
  0% { background-position: 120% 0; }
  100% { background-position: -120% 0; }
`;

const SkeletonBlock = styled.div<{ $width?: string; $height?: string; $radius?: string }>`
  width: ${({ $width }) => $width || '100%'};
  height: ${({ $height }) => $height || '1rem'};
  max-width: 100%;
  border-radius: ${({ $radius }) => $radius || '999px'};
  background:
    linear-gradient(90deg, rgba(255,255,255,0.045), rgba(255,255,255,0.105), rgba(255,255,255,0.045));
  background-size: 220% 100%;
  animation: ${skeletonShimmer} 1.35s ease-in-out infinite;
`;

const SkeletonCircle = styled(SkeletonBlock)`
  flex-shrink: 0;
`;

const SkeletonStack = styled.div`
  display: grid;
  gap: 0.8rem;
`;

const SkeletonTextStack = styled.div<{ $gap?: string }>`
  display: grid;
  gap: ${({ $gap }) => $gap || '0.55rem'};
  width: 100%;
  min-width: 0;
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

const ExtensionAccessCard = styled(Card)`
  display: flex;
  flex-direction: column;
  min-height: 100%;
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
  font-size: clamp(1.9rem, 4vw, 3.5rem);
  font-weight: 700;
  line-height: 1.08;
  letter-spacing: 0;
  margin: 0.5rem 0 0;
`;

const HeroTitleAccent = styled.span`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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
  gap: 0;
`;

const BenefitTile = styled.div<{ $active?: boolean; $locked?: boolean }>`
  display: grid;
  grid-template-columns: 34px 1fr;
  gap: 0.875rem;
  align-items: start;
  padding: 1rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark5};
  opacity: ${({ $locked }) => $locked ? 0.72 : 1};

  &:first-child {
    padding-top: 0.15rem;
  }

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const BenefitIcon = styled.div<{ $active?: boolean; $locked?: boolean }>`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: ${({ $active, $locked, theme }) => $active ? `${theme.colors.red1}` : $locked ? 'rgba(255,255,255,0.024)' : 'rgba(255,255,255,0.045)'};
  color: ${({ $active, $locked, theme }) => $active ? theme.colors.red6 : $locked ? 'rgba(156, 163, 175, 0.62)' : theme.colors.text.muted};
  box-shadow: ${({ $active }) => $active ? '0 0 0 1px rgba(185, 28, 28, 0.34), 0 0 20px rgba(229, 72, 72, 0.26)' : 'none'};
`;

const BenefitTitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
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

const BenefitStateBadge = styled.span<{ $active?: boolean; $locked?: boolean }>`
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 0.5rem;
  border-radius: 999px;
  border: 1px solid ${({ $active, $locked }) =>
    $active ? 'rgba(185, 28, 28, 0.34)' : $locked ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.12)'};
  background: ${({ $active, $locked }) =>
    $active ? 'rgba(185, 28, 28, 0.13)' : $locked ? 'rgba(255,255,255,0.018)' : 'rgba(255,255,255,0.04)'};
  color: ${({ $active, $locked, theme }) =>
    $active ? theme.colors.red6 : $locked ? 'rgba(156, 163, 175, 0.72)' : theme.colors.text.muted};
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  white-space: nowrap;
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
  background: ${({ $connected }) => $connected ? '#22c55e' : 'rgba(255,255,255,0.2)'};
  display: inline-block;
  flex-shrink: 0;
  box-shadow: ${({ $connected }) => $connected ? '0 0 8px rgba(34, 197, 94, 0.7)' : 'none'};
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

const PrimaryLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.red3};
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4});
  color: ${({ theme }) => theme.colors.white};
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.red2}, ${({ theme }) => theme.colors.red3});
    border-color: ${({ theme }) => theme.colors.red2};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.glow};
  }
`;

const ExtensionStoreSlot = styled.div`
  margin-top: auto;
  padding-top: 1rem;
`;

const ExtensionStoreCard = styled.a`
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) auto;
  gap: 0.75rem;
  align-items: center;
  margin: 0;
  padding: 0.78rem 0.85rem;
  border-radius: 12px;
  border: 1px solid rgba(185, 28, 28, 0.18);
  background:
    radial-gradient(circle at top left, ${({ theme }) => theme.colors.red3}24, transparent 48%),
    linear-gradient(135deg, rgba(82, 1, 1, 0.16), rgba(255, 255, 255, 0.018));
  color: ${({ theme }) => theme.colors.text.primary};
  text-decoration: none;
  transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    border-color: rgba(248, 113, 113, 0.34);
    background:
      radial-gradient(circle at top left, ${({ theme }) => theme.colors.red3}34, transparent 48%),
      linear-gradient(135deg, rgba(82, 1, 1, 0.22), rgba(255, 255, 255, 0.024));
    box-shadow: 0 12px 30px rgba(185, 28, 28, 0.11);
  }
`;

const ExtensionStoreIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: rgba(185, 28, 28, 0.14);
  border: 1px solid rgba(248, 113, 113, 0.2);
  color: ${({ theme }) => theme.colors.red6};

  i {
    font-size: 1.05rem;
  }
`;

const ExtensionStoreCopy = styled.div`
  min-width: 0;

  strong {
    display: block;
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 0.82rem;
    line-height: 1.25;
  }

  span {
    display: block;
    color: ${({ theme }) => theme.colors.text.muted};
    font-size: 0.68rem;
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
  background: rgba(255, 255, 255, 0.035);
  color: ${({ theme }) => theme.colors.text.muted};
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

const DiscountNotice = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  width: fit-content;
  max-width: 100%;
  padding: 0.72rem 0.9rem;
  border-radius: 999px;
  border: 1px solid rgba(34, 197, 94, 0.3);
  background: rgba(20, 83, 45, 0.18);
  color: #bbf7d0;
  font-size: 0.8rem;
  line-height: 1.35;

  i {
    color: #4ade80;
    font-size: 1rem;
  }

  strong {
    color: #dcfce7;
    font-weight: 700;
  }
`;

const BillingError = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem;
  margin-top: 1rem;
  padding: 0.8rem 0.95rem;
  border: 1px solid rgba(248, 113, 113, 0.22);
  border-radius: 10px;
  background: rgba(127, 29, 29, 0.16);
  color: #fecaca;
  font-size: 0.78rem;
  line-height: 1.45;

  span {
    min-width: 0;
  }

  button {
    flex: 0 0 auto;
    border: 1px solid rgba(248, 113, 113, 0.28);
    border-radius: 999px;
    background: rgba(248, 113, 113, 0.12);
    color: #fee2e2;
    font: inherit;
    font-weight: 800;
    padding: 0.42rem 0.68rem;
    cursor: pointer;
  }

  button:disabled {
    cursor: wait;
    opacity: 0.62;
  }
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
  verificationStatus?: 'verified' | 'unverified';
  verificationError?: string | null;
  localIsPremium?: boolean;
  discount?: {
    label: string;
    couponName?: string | null;
    endsAt?: string | null;
  } | null;
}

async function readBillingPayload(response: Response, fallback: string) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.error) {
    throw new Error(payload.message || fallback);
  }
  return payload;
}

function getBillingVerificationError(billing: BillingStatus | null) {
  if (billing?.verificationStatus !== 'unverified') return '';
  return billing.verificationError || 'We could not verify your subscription with Stripe. Retry before relying on plan status.';
}

function AccountSkeleton() {
  const benefitRows = Array.from({ length: 6 });
  const statusRows = Array.from({ length: 2 });

  return (
    <Page>
      <Inner>
        <TopBar>
          <SkeletonBlock $width="118px" $height="18px" />
          <HeroActions>
            <SkeletonBlock $width="92px" $height="34px" />
            <SkeletonBlock $width="64px" $height="18px" />
          </HeroActions>
        </TopBar>

        <HeroCard>
          <HeroContent>
            <SkeletonStack>
              <SkeletonBlock $width="112px" $height="12px" />
              <SkeletonBlock $width="72%" $height="58px" $radius="18px" />
              <SkeletonBlock $width="88%" $height="16px" />
              <SkeletonBlock $width="62%" $height="16px" />
            </SkeletonStack>
            <HeroActions>
              <SkeletonBlock $width="138px" $height="38px" $radius="10px" />
              <SkeletonBlock $width="96px" $height="38px" $radius="10px" />
            </HeroActions>
          </HeroContent>

          <ProfilePanel>
            <ProfileMini>
              <SkeletonCircle $width="64px" $height="64px" $radius="50%" />
              <SkeletonTextStack $gap="0.65rem">
                <SkeletonBlock $width="78%" $height="20px" />
                <SkeletonBlock $width="92%" $height="14px" />
              </SkeletonTextStack>
            </ProfileMini>
            <StatusRow>
              <StatusLeft>
                <SkeletonBlock $width="36px" $height="36px" $radius="10px" />
                <SkeletonStack>
                  <SkeletonBlock $width="110px" $height="15px" />
                  <SkeletonBlock $width="150px" $height="12px" />
                </SkeletonStack>
              </StatusLeft>
              <SkeletonBlock $width="82px" $height="28px" />
            </StatusRow>
          </ProfilePanel>
        </HeroCard>

        <DashboardGrid>
          <Card>
            <CardHeader>
              <SkeletonBlock $width="124px" $height="12px" />
            </CardHeader>
            <BenefitGrid>
              {benefitRows.map((_, index) => (
                <BenefitTile key={index}>
                  <SkeletonBlock $width="34px" $height="34px" $radius="10px" />
                  <SkeletonStack>
                    <SkeletonBlock $width="78%" $height="15px" />
                    <SkeletonBlock $width="96%" $height="12px" />
                    <SkeletonBlock $width="64%" $height="12px" />
                  </SkeletonStack>
                </BenefitTile>
              ))}
            </BenefitGrid>
          </Card>

          <ExtensionAccessCard>
            <CardHeader>
              <SkeletonBlock $width="132px" $height="12px" />
            </CardHeader>
            {statusRows.map((_, index) => (
              <StatusRow key={index}>
                <StatusLeft>
                  <SkeletonBlock $width="36px" $height="36px" $radius="10px" />
                  <SkeletonStack>
                    <SkeletonBlock $width="134px" $height="15px" />
                    <SkeletonBlock $width="210px" $height="12px" />
                  </SkeletonStack>
                </StatusLeft>
                <SkeletonBlock $width="52px" $height="22px" />
              </StatusRow>
            ))}
            <ExtensionStoreSlot>
              <ExtensionStoreCard as="div">
                <SkeletonBlock $width="38px" $height="38px" $radius="12px" />
                <SkeletonStack>
                  <SkeletonBlock $width="172px" $height="16px" />
                  <SkeletonBlock $width="94%" $height="12px" />
                </SkeletonStack>
                <SkeletonBlock $width="28px" $height="28px" />
              </ExtensionStoreCard>
            </ExtensionStoreSlot>
          </ExtensionAccessCard>
        </DashboardGrid>
      </Inner>
    </Page>
  );
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
      if (!session) {
        navigate('/login', { replace: true });
        return;
      }

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
      setBillingError('');
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
        .then(r => readBillingPayload(r, 'Could not load subscription data.'))
        .then(({ billing, message }) => {
          setBilling(billing || null);
          const verificationError = getBillingVerificationError(billing || null);
          if (verificationError) {
            setBillingError(verificationError);
          } else if (!billing && message) {
            setBillingError(message);
          }
        })
        .catch((error) => {
          console.error('[account] billing load failed', error);
          setBilling(null);
          setBillingError(error instanceof Error ? error.message : 'Could not load subscription data.');
        })
        .finally(() => setBillingLoading(false));
    });
  }, [user, location.search, navigate]);

  if (loading || Boolean(user && !billing && !billingError)) return <AccountSkeleton />;
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
    setBillingLoading(true);
    setBillingError('');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setBillingLoading(false);
      navigate('/login');
      return;
    }

    try {
      const res = await fetch('/api/billing?action=status', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const payload = await readBillingPayload(res, 'Could not refresh subscription data.');
      const nextBilling = payload.billing || null;
      setBilling(nextBilling);
      const verificationError = getBillingVerificationError(nextBilling);
      if (verificationError) setBillingError(verificationError);
    } catch (error) {
      console.error('[account] billing refresh failed', error);
      setBilling(null);
      setBillingError(error instanceof Error ? error.message : 'Could not refresh subscription data.');
    } finally {
      setBillingLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setBillingError('');

    if (billing?.verificationStatus !== 'unverified' && billing?.discount?.label) {
      const shouldContinue = window.confirm(
        'You currently have a discount on your membership. If you cancel, you may lose this discount.'
      );
      if (!shouldContinue) return;
    }

    setBillingAction('portal');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setBillingAction('');
      navigate('/login');
      return;
    }

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
      console.error('[account] billing portal failed', error);
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

  const billingUnverified = billing?.verificationStatus === 'unverified';
  const billingUnavailable = billingUnverified || (!billing && Boolean(billingError));
  const benefitsReady = !billingUnavailable;
  const isPremium = Boolean(billing?.isPremium && !billingUnverified);
  const billingLabel = billingLoading ? 'Checking' : billingUnavailable ? 'Needs check' : isPremium ? 'Premium' : 'Free';
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
    : 'Connect your YouTube channel to run analysis and personalize extension tools.';

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
              <HeroTitle>
                {isPremium ? <><HeroTitleAccent>Premium</HeroTitleAccent> is active</> : <>Your YouTool <HeroTitleAccent>Dashboard</HeroTitleAccent></>}
              </HeroTitle>
              <HeroSub>
                {isPremium
                  ? 'You have access to YouTool’s in-YouTube workflow: analysis, exports, and Studio tools without leaving YouTube.'
                  : 'Connect your channel for tailored analysis, then upgrade when you want YouTool’s tools directly inside YouTube.'}
              </HeroSub>
            </div>

            <HeroActions>
              {billingUnavailable ? (
                <Button variant="primary" size="sm" onClick={refreshBilling} disabled={billingLoading}>
                  {billingLoading ? 'Checking…' : 'Retry billing check'}
                </Button>
              ) : isPremium ? (
                <Button
                  variant="primary"
                  size="sm"
                  disabled={billingAction !== '' || !billing?.hasStripeCustomer}
                  onClick={handleManageBilling}
                >
                  {billingAction === 'portal' ? 'Opening…' : 'Manage billing'}
                </Button>
              ) : ytChannel ? (
                <PrimaryLink to="/pricing">View pricing</PrimaryLink>
              ) : (
                <Button variant="primary" size="sm" onClick={handleConnectYouTube} disabled={ytConnecting}>
                  {ytConnecting ? 'Redirecting…' : 'Connect YouTube'}
                </Button>
              )}
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

            {billing?.verificationStatus !== 'unverified' && billing?.discount?.label && (
              <DiscountNotice>
                <i className="bx bx-purchase-tag-alt"></i>
                <span><strong>Discount active:</strong> {billing.discount.label}</span>
              </DiscountNotice>
            )}

            {billingError && (
              <BillingError>
                <span>{billingError}</span>
                <button type="button" onClick={refreshBilling} disabled={billingLoading}>
                  {billingLoading ? 'Checking...' : 'Retry'}
                </button>
              </BillingError>
            )}
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
                  <StatusSub>{billingUnavailable ? 'Retry billing check' : isPremium ? 'Full extension access' : 'Free extension account'}</StatusSub>
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
            </CardHeader>
            <BenefitGrid>
              <BenefitTile $active={benefitsReady}>
                <BenefitIcon $active><i className="bx bx-wrench"></i></BenefitIcon>
                <div>
                  <BenefitTitleRow>
                    <BenefitTitle>Website tools</BenefitTitle>
                    <BenefitStateBadge $active={benefitsReady}>{benefitsReady ? 'Included' : 'Checking'}</BenefitStateBadge>
                  </BenefitTitleRow>
                  <BenefitSub>{benefitsReady ? 'Use any tool on the YouTool.io website completely free.' : 'Retry billing check to confirm which account benefits are active.'}</BenefitSub>
                </div>
              </BenefitTile>
              <BenefitTile $active={benefitsReady}>
                <BenefitIcon $active><i className="bx bx-line-chart"></i></BenefitIcon>
                <div>
                  <BenefitTitleRow>
                    <BenefitTitle>Channel analysis</BenefitTitle>
                    <BenefitStateBadge $active={benefitsReady}>{benefitsReady ? 'Included' : 'Checking'}</BenefitStateBadge>
                  </BenefitTitleRow>
                  <BenefitSub>{benefitsReady ? 'Connect YouTube to run a full channel analysis from your account page.' : 'Channel analysis availability will show after billing is verified.'}</BenefitSub>
                </div>
              </BenefitTile>
              <BenefitTile $active={benefitsReady}>
                <BenefitIcon $active><i className="bx bx-extension"></i></BenefitIcon>
                <div>
                  <BenefitTitleRow>
                    <BenefitTitle>Creator YouTube customization</BenefitTitle>
                    <BenefitStateBadge $active={benefitsReady}>{benefitsReady ? 'Included' : 'Checking'}</BenefitStateBadge>
                  </BenefitTitleRow>
                  <BenefitSub>{benefitsReady ? 'Download the Chrome extension to customize YouTube and support your creator workflow.' : 'Extension access will show after billing is verified.'}</BenefitSub>
                </div>
              </BenefitTile>
              <BenefitTile $active={benefitsReady && isPremium}>
                <BenefitIcon $active={benefitsReady && isPremium}><i className="bx bx-window-open"></i></BenefitIcon>
                <div>
                  <BenefitTitleRow>
                    <BenefitTitle>Use YouTool tools inside YouTube</BenefitTitle>
                    <BenefitStateBadge $active={benefitsReady && isPremium}>{benefitsReady ? isPremium ? 'Unlimited' : 'Limited' : 'Checking'}</BenefitStateBadge>
                  </BenefitTitleRow>
                  <BenefitSub>{benefitsReady ? isPremium ? 'Unlimited in-YouTube tool runs are active.' : 'Free accounts get limited weekly in-YouTube tool runs before Premium is needed.' : 'Plan-limited extension access will show after billing is verified.'}</BenefitSub>
                </div>
              </BenefitTile>
              <BenefitTile $active={benefitsReady && isPremium} $locked={benefitsReady && !isPremium}>
                <BenefitIcon $active={benefitsReady && isPremium} $locked={benefitsReady && !isPremium}><i className="bx bx-download"></i></BenefitIcon>
                <div>
                  <BenefitTitleRow>
                    <BenefitTitle>Download reports</BenefitTitle>
                    <BenefitStateBadge $active={benefitsReady && isPremium} $locked={benefitsReady && !isPremium}>{benefitsReady ? isPremium ? 'Active' : 'Premium' : 'Checking'}</BenefitStateBadge>
                  </BenefitTitleRow>
                  <BenefitSub>{benefitsReady ? isPremium ? 'Download full channel analysis reports and richer export files when you need to save or share your work.' : 'Premium unlocks downloadable channel analysis reports and higher export limits.' : 'Report downloads will show after billing is verified.'}</BenefitSub>
                </div>
              </BenefitTile>
              <BenefitTile $active={benefitsReady && isPremium} $locked={benefitsReady && !isPremium}>
                <BenefitIcon $active={benefitsReady && isPremium} $locked={benefitsReady && !isPremium}><i className="bx bx-slider-alt"></i></BenefitIcon>
                <div>
                  <BenefitTitleRow>
                    <BenefitTitle>Premium Studio workflow tools</BenefitTitle>
                    <BenefitStateBadge $active={benefitsReady && isPremium} $locked={benefitsReady && !isPremium}>{benefitsReady ? isPremium ? 'Active' : 'Premium' : 'Checking'}</BenefitStateBadge>
                  </BenefitTitleRow>
                  <BenefitSub>More timelines, content columns, streamer mode, and real-time engaged views are Premium extension features.</BenefitSub>
                </div>
              </BenefitTile>
            </BenefitGrid>
          </Card>

          <ExtensionAccessCard>
            <CardHeader>
              <CardTitle>Extension access</CardTitle>
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
                Install and pin the YouTool.io Chrome extension.
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

            <ExtensionStoreSlot>
              <ExtensionStoreCard href={CHROME_EXTENSION_STORE_URL} target="_blank" rel="noopener noreferrer">
                <ExtensionStoreIcon><i className="bx bxl-chrome"></i></ExtensionStoreIcon>
                <ExtensionStoreCopy>
                  <strong>{extensionConnected ? 'Get the Chrome Extension' : 'Install the Chrome Extension'}</strong>
                  <span>
                    {extensionConnected
                      ? 'Open YouTool inside YouTube.'
                      : 'Use YouTool directly on YouTube.'}
                  </span>
                </ExtensionStoreCopy>
                <ExtensionStoreArrow><i className="bx bx-right-arrow-alt"></i></ExtensionStoreArrow>
              </ExtensionStoreCard>
            </ExtensionStoreSlot>
          </ExtensionAccessCard>
        </DashboardGrid>

        {ytChannel && <AccountYouTubeInsights channel={ytChannel} isPremium={isPremium} />}

        {isResearchAdmin && <AdminPlatformStats />}

        {isResearchAdmin && <AdminYouTubeResearchDashboard />}

      </Inner>
    </Page>
  );
};

export default Account;
