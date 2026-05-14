import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

type BillingInterval = 'monthly' | 'yearly';

const Page = styled.div`
  min-height: 100vh;
  padding: 4rem 2rem 2rem;
  background:
    radial-gradient(circle at 15% 8%, ${({ theme }) => theme.colors.red2}66 0%, transparent 28%),
    radial-gradient(circle at 86% 18%, ${({ theme }) => theme.colors.red1}88 0%, transparent 34%),
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
  max-width: 760px;
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
  font-size: clamp(2.2rem, 6vw, 4.8rem);
  line-height: 0.95;
  letter-spacing: -0.055em;
  margin: 0;
`;

const Subtitle = styled.p`
  max-width: 680px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1rem;
  line-height: 1.75;
  margin: 1.2rem 0 0;
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

const PopularBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 28px;
  padding: 0 0.72rem;
  border-radius: 999px;
  background: rgba(185, 28, 28, 0.18);
  border: 1px solid rgba(229, 72, 72, 0.42);
  color: ${({ theme }) => theme.colors.red6};
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 1rem;
`;

const PlanName = styled.h2`
  font-size: 1.55rem;
  margin: 0;
`;

const PlanCopy = styled.p`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.88rem;
  line-height: 1.65;
  min-height: 58px;
  margin: 0.8rem 0 1.35rem;
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
  font-weight: 800;
  letter-spacing: -0.05em;
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
  text-decoration: none;
  font-weight: 800;
  margin-top: 1.35rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ $primary }) => $primary ? '0 0 24px rgba(185, 28, 28, 0.34)' : '0 12px 28px rgba(0,0,0,0.28)'};
  }
`;

const NoteBand = styled.div`
  margin-top: 1.25rem;
  border: 1px solid rgba(185, 28, 28, 0.28);
  background: linear-gradient(135deg, rgba(46, 4, 4, 0.36), rgba(255,255,255,0.018));
  border-radius: 16px;
  padding: 1.1rem 1.25rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.88rem;
  line-height: 1.65;

  strong {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const BenefitSection = styled.section`
  margin-top: 3rem;
`;

const SectionTitle = styled.h2`
  font-size: clamp(1.6rem, 3vw, 2.4rem);
  letter-spacing: -0.035em;
  margin: 0 0 1rem;
`;

const BenefitCards = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const BenefitCard = styled.div`
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 1.1rem;
  background: rgba(255,255,255,0.022);

  i {
    width: 38px;
    height: 38px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    color: ${({ theme }) => theme.colors.red6};
    background: ${({ theme }) => theme.colors.red1};
    box-shadow: 0 0 22px rgba(229, 72, 72, 0.2);
    margin-bottom: 0.9rem;
  }

  h3 {
    margin: 0;
    font-size: 1rem;
  }

  p {
    margin: 0.45rem 0 0;
    color: ${({ theme }) => theme.colors.text.muted};
    font-size: 0.82rem;
    line-height: 1.6;
  }
`;

export const Pricing: React.FC = () => {
  const [interval, setBillingInterval] = useState<BillingInterval>('yearly');
  const yearly = interval === 'yearly';
  const price = yearly ? '$47.99' : '$4.99';
  const period = yearly ? '/year' : '/month';

  return (
    <Page>
      <Shell>
        <BackLink to="/"><i className="bx bx-arrow-back"></i> Back to home</BackLink>

        <Hero>
          <Kicker>YouTool.io Premium</Kicker>
          <Title>Pricing built around the Chrome extension.</Title>
          <Subtitle>
            The website tools stay useful and easy to access. Premium is for creators who want YouTool directly inside YouTube and YouTube Studio, with higher limits, exports, and workflow upgrades where they actually work.
          </Subtitle>
        </Hero>

        <PricingGrid>
          <PlanCard>
            <PlanName>Free</PlanName>
            <PlanCopy>
              Start with the website tools, connect your YouTube channel, and get enough extension access to understand how YouTool fits your workflow.
            </PlanCopy>
            <Price>
              <PriceValue>$0</PriceValue>
              <PriceMeta>/month</PriceMeta>
            </Price>
            <SaveLine>Connect YouTube for tailored analysis.</SaveLine>
            <CtaLink to="/login">Start free</CtaLink>
            <FeatureList>
              <FeatureItem><i className="bx bx-check"></i><span>Free YouTool website tools</span></FeatureItem>
              <FeatureItem><i className="bx bx-check"></i><span>Connected-channel stats and trend graph</span></FeatureItem>
              <FeatureItem><i className="bx bx-check"></i><span>Full channel analysis from your account page</span></FeatureItem>
              <FeatureItem><i className="bx bx-check"></i><span>Limited weekly in-YouTube YouTool tool runs</span></FeatureItem>
              <FeatureItem $muted><i className="bx bx-lock-alt"></i><span>Premium Studio workflow features are locked</span></FeatureItem>
            </FeatureList>
          </PlanCard>

          <PlanCard $featured>
            <PopularBadge><i className="bx bx-extension"></i> Chrome extension focus</PopularBadge>
            <PlanName>Premium</PlanName>
            <PlanCopy>
              Unlock the in-YouTube experience: run YouTool tools from the page you are already on, export deeper data, and upgrade YouTube Studio workflows.
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
            <CtaLink $primary to="/account">Connect YouTube & subscribe</CtaLink>
            <FeatureList>
              <FeatureItem><i className="bx bx-check"></i><span>Unlimited in-YouTube YouTool tool runs</span></FeatureItem>
              <FeatureItem><i className="bx bx-check"></i><span>Video analyzer, channel analyzer, and comment exports from YouTube pages</span></FeatureItem>
              <FeatureItem><i className="bx bx-check"></i><span>Higher comment export limits inside the extension</span></FeatureItem>
              <FeatureItem><i className="bx bx-check"></i><span>More YouTube Studio timelines and content-page columns</span></FeatureItem>
              <FeatureItem><i className="bx bx-check"></i><span>Streamer Mode and real-time engaged views for Studio workflows</span></FeatureItem>
            </FeatureList>
          </PlanCard>
        </PricingGrid>

        <NoteBand>
          <strong>Important:</strong> Premium is mainly for the Chrome extension experience. You can still use YouTool.io’s public website tools without paying, and the account flow asks you to connect YouTube before checkout so the paid features can be tied to the right channel.
        </NoteBand>

        <BenefitSection>
          <SectionTitle>What Premium changes</SectionTitle>
          <BenefitCards>
            <BenefitCard>
              <i className="bx bx-window-open"></i>
              <h3>Tools where you work</h3>
              <p>Analyze videos, channels, comments, and exports from inside YouTube instead of opening separate website tools in another tab.</p>
            </BenefitCard>
            <BenefitCard>
              <i className="bx bx-download"></i>
              <h3>More useful exports</h3>
              <p>Premium raises in-extension export limits and makes YouTool feel like a working package you can save, copy, and share.</p>
            </BenefitCard>
            <BenefitCard>
              <i className="bx bx-slider-alt"></i>
              <h3>Studio workflow upgrades</h3>
              <p>Unlock premium YouTube Studio helpers like extra timelines, content columns, streamer mode, and engaged-view workflow tools.</p>
            </BenefitCard>
          </BenefitCards>
        </BenefitSection>
      </Shell>
    </Page>
  );
};

export default Pricing;
