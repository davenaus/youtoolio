import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

type BillingInterval = 'monthly' | 'yearly';

interface BillingStatus {
  isPremium: boolean;
}

const Page = styled.div`
  min-height: 100vh;
  padding: 4rem 2rem 2rem;
  font-family: ${({ theme }) => theme.fonts.primary};
  background:
    radial-gradient(circle at 48% 8%, ${({ theme }) => theme.colors.red2}38 0%, transparent 36%),
    radial-gradient(circle at 90% 18%, ${({ theme }) => theme.colors.red1}66 0%, transparent 34%),
    linear-gradient(135deg, ${({ theme }) => theme.colors.dark2} 0%, ${({ theme }) => theme.colors.dark3} 100%),
    ${({ theme }) => theme.colors.dark2};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Shell = styled.div`
  max-width: 1120px;
  margin: 0 auto;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: ${({ theme }) => theme.colors.text.muted};
  text-decoration: none;
  font-size: 0.86rem;
  font-weight: 600;
  margin-bottom: 2.5rem;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const Hero = styled.header`
  max-width: 680px;
  margin-bottom: 2rem;
`;

const Kicker = styled.div`
  color: ${({ theme }) => theme.colors.red6};
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 0.8rem;
`;

const Title = styled.h1`
  font-size: clamp(2.1rem, 5vw, 4rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: 0;
  margin: 0 0 1rem;
`;

const TitleAccent = styled.span`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  max-width: 560px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.98rem;
  line-height: 1.6;
  margin: 0;
`;

const PricingGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
  gap: 1.25rem;
  align-items: stretch;
  margin-top: 2rem;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const PlanCard = styled.div<{ $featured?: boolean }>`
  position: relative;
  overflow: hidden;
  border-radius: 18px;
  padding: 1.75rem;
  border: 1px solid ${({ $featured }) => $featured ? 'rgba(185, 28, 28, 0.55)' : 'rgba(255,255,255,0.08)'};
  background:
    ${({ $featured, theme }) => $featured
      ? `radial-gradient(circle at top right, ${theme.colors.red3}55, transparent 44%), linear-gradient(135deg, ${theme.colors.red1}55, rgba(255,255,255,0.02))`
      : 'linear-gradient(180deg, rgba(255,255,255,0.028), rgba(255,255,255,0.012))'},
    ${({ theme }) => theme.colors.dark3};
  box-shadow: ${({ $featured }) => $featured ? '0 24px 70px rgba(185, 28, 28, 0.18)' : '0 18px 45px rgba(0, 0, 0, 0.22)'};
`;

const PlanName = styled.h2`
  font-size: 1.55rem;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: 0;
  margin: 0;
`;

const PlanCopy = styled.p`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.88rem;
  line-height: 1.5;
  min-height: 0;
  margin: 0.7rem 0 1.15rem;
`;

const Price = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.45rem;
  margin-bottom: 0.4rem;
`;

const PriceValue = styled.span`
  font-size: clamp(2.1rem, 5vw, 3.2rem);
  line-height: 1;
  font-weight: 700;
  letter-spacing: 0;
`;

const PriceMeta = styled.span`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.9rem;
`;

const SaveLine = styled.div`
  color: ${({ theme }) => theme.colors.red6};
  font-size: 0.8rem;
  font-weight: 700;
  min-height: 22px;
`;

const Toggle = styled.div`
  display: inline-grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.25rem;
  padding: 0.28rem;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(0, 0, 0, 0.22);
  margin: 1.15rem 0 1.35rem;
`;

const ToggleButton = styled.button<{ $active?: boolean }>`
  min-height: 34px;
  border: 0;
  border-radius: 999px;
  padding: 0 0.9rem;
  cursor: pointer;
  color: ${({ $active, theme }) => $active ? theme.colors.white : theme.colors.text.muted};
  background: ${({ $active, theme }) => $active ? `linear-gradient(135deg, ${theme.colors.red3}, ${theme.colors.red4})` : 'transparent'};
  font-family: ${({ theme }) => theme.fonts.primary};
  font-size: 0.78rem;
  font-weight: 800;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1.4rem 0 0;
  display: grid;
  gap: 0.82rem;
`;

const FeatureItem = styled.li<{ $muted?: boolean }>`
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr);
  gap: 0.72rem;
  align-items: start;
  color: ${({ $muted, theme }) => $muted ? theme.colors.text.muted : theme.colors.text.secondary};
  font-size: 0.86rem;
  line-height: 1.5;

  i {
    width: 24px;
    height: 24px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    background: ${({ $muted }) => $muted ? 'rgba(255,255,255,0.045)' : 'rgba(185, 28, 28, 0.16)'};
    color: ${({ $muted, theme }) => $muted ? theme.colors.text.muted : theme.colors.red6};
    font-size: 0.95rem;
  }
`;

const CtaLink = styled(Link)<{ $primary?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  min-height: 46px;
  border-radius: 12px;
  border: 1px solid ${({ $primary, theme }) => $primary ? theme.colors.red3 : theme.colors.dark5};
  background: ${({ $primary, theme }) => $primary ? `linear-gradient(135deg, ${theme.colors.red3}, ${theme.colors.red4})` : theme.colors.dark4};
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.fonts.primary};
  text-decoration: none;
  font-weight: 700;
  margin-top: 1.35rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ $primary }) => $primary ? '0 0 18px rgba(185, 28, 28, 0.18)' : '0 10px 20px rgba(0,0,0,0.16)'};
  }
`;

const CtaButton = styled.button<{ $primary?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  min-height: 46px;
  border-radius: 12px;
  border: 1px solid ${({ $primary, theme }) => $primary ? theme.colors.red3 : theme.colors.dark5};
  background: ${({ $primary, theme }) => $primary ? `linear-gradient(135deg, ${theme.colors.red3}, ${theme.colors.red4})` : theme.colors.dark4};
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.fonts.primary};
  font-weight: 700;
  margin-top: 1.35rem;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${({ $primary }) => $primary ? '0 0 18px rgba(185, 28, 28, 0.18)' : '0 10px 20px rgba(0,0,0,0.16)'};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const CurrentPlanButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  min-height: 46px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.075);
  color: ${({ theme }) => theme.colors.text.muted};
  font-family: ${({ theme }) => theme.fonts.primary};
  font-weight: 700;
  margin-top: 1.35rem;
  cursor: default;
`;

const CheckoutError = styled.div`
  margin-top: 0.8rem;
  padding: 0.75rem 0.85rem;
  border: 1px solid rgba(248, 113, 113, 0.24);
  border-radius: 12px;
  background: rgba(127, 29, 29, 0.16);
  color: #fecaca;
  font-size: 0.76rem;
  line-height: 1.45;
`;

export const Pricing: React.FC = () => {
  const [interval, setBillingInterval] = useState<BillingInterval>('yearly');
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const yearly = interval === 'yearly';
  const price = yearly ? '$47.99' : '$4.99';
  const period = yearly ? '/year' : '/month';
  const signedIn = Boolean(user);
  const billingChecking = signedIn && billingStatus === null;
  const isPremium = Boolean(billingStatus?.isPremium);
  const isFreeCurrentPlan = signedIn && !billingChecking && !isPremium;

  useEffect(() => {
    let cancelled = false;

    async function loadBillingStatus() {
      if (loading || !user) {
        setBillingStatus(null);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          if (!cancelled) setBillingStatus(null);
          return;
        }

        const response = await fetch('/api/billing?action=status', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const payload = await response.json();

        if (!cancelled) {
          setBillingStatus(payload.billing ? { isPremium: Boolean(payload.billing.isPremium) } : { isPremium: false });
        }
      } catch {
        if (!cancelled) setBillingStatus(null);
      }
    }

    loadBillingStatus();

    return () => {
      cancelled = true;
    };
  }, [loading, user]);

  const handleCheckout = async () => {
    setCheckoutError('');

    if (loading) return;
    if (!user) {
      navigate('/login');
      return;
    }

    setCheckoutLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      const response = await fetch('/api/billing', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'create_checkout_session', interval }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.url) {
        const message = payload.message || 'Could not start checkout.';
        if (String(message).toLowerCase().includes('connect')) {
          setCheckoutError('Connect your YouTube channel from the account page before upgrading.');
          return;
        }
        throw new Error(message);
      }

      window.location.href = payload.url;
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Could not start checkout.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <Page>
      <Shell>
        <BackLink to="/"><i className="bx bx-arrow-back"></i> Back to home</BackLink>

        <Hero>
          <Kicker>YouTool.io Premium</Kicker>
          <Title><TitleAccent>Simple</TitleAccent> pricing.</Title>
          <Subtitle>
            Free website tools. Premium Chrome extension workflows.
          </Subtitle>
        </Hero>

        <PricingGrid>
          <PlanCard>
            <PlanName>Free</PlanName>
            <PlanCopy>
              Use YouTool on the web and connect your channel.
            </PlanCopy>
            <Price>
              <PriceValue>$0</PriceValue>
              <PriceMeta>/month</PriceMeta>
            </Price>
            {isFreeCurrentPlan ? (
              <CurrentPlanButton type="button" disabled>Current plan</CurrentPlanButton>
            ) : (
              <CtaLink to={signedIn ? '/account' : '/login'}>{signedIn ? 'View account' : 'Start free'}</CtaLink>
            )}
            <FeatureList>
              <FeatureItem><i className="bx bx-check"></i><span>Website tools</span></FeatureItem>
              <FeatureItem><i className="bx bx-check"></i><span>Google Chrome extension basics</span></FeatureItem>
              <FeatureItem><i className="bx bx-check"></i><span>Connected-channel stats</span></FeatureItem>
              <FeatureItem><i className="bx bx-check"></i><span>Full channel analysis</span></FeatureItem>
              <FeatureItem $muted><i className="bx bx-lock-alt"></i><span>Premium Studio workflow features are locked</span></FeatureItem>
            </FeatureList>
          </PlanCard>

          <PlanCard $featured>
            <PlanName>Premium</PlanName>
            <PlanCopy>
              An enhanced Chrome extension experience for YouTube and YouTube Studio.
            </PlanCopy>
            <Toggle aria-label="Billing interval">
              <ToggleButton type="button" $active={interval === 'monthly'} onClick={() => setBillingInterval('monthly')}>Monthly</ToggleButton>
              <ToggleButton type="button" $active={interval === 'yearly'} onClick={() => setBillingInterval('yearly')}>Yearly</ToggleButton>
            </Toggle>
            <Price>
              <PriceValue>{price}</PriceValue>
              <PriceMeta>{period}</PriceMeta>
            </Price>
            <SaveLine>{yearly ? 'Save about 20% compared with monthly billing.' : 'Switch to yearly to save about 20%.'}</SaveLine>
            {isPremium ? (
              <CurrentPlanButton type="button" disabled>Current plan</CurrentPlanButton>
            ) : (
              <CtaButton $primary type="button" onClick={handleCheckout} disabled={checkoutLoading || loading || billingChecking}>
                {checkoutLoading ? 'Opening checkout…' : 'Subscribe'}
              </CtaButton>
            )}
            {checkoutError && <CheckoutError>{checkoutError}</CheckoutError>}
            <FeatureList>
              <FeatureItem><i className="bx bx-check"></i><span>Everything in the free Chrome extension, upgraded</span></FeatureItem>
              <FeatureItem><i className="bx bx-check"></i><span>Unlimited video, channel, and comment tools inside YouTube</span></FeatureItem>
              <FeatureItem><i className="bx bx-check"></i><span>Higher comment export limits</span></FeatureItem>
              <FeatureItem><i className="bx bx-check"></i><span>Premium Studio tools: timelines, columns, streamer mode, and engaged views</span></FeatureItem>
            </FeatureList>
          </PlanCard>
        </PricingGrid>
      </Shell>
    </Page>
  );
};

export default Pricing;
