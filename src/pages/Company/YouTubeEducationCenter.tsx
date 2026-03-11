// src/pages/Company/YouTubeEducationCenter.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.dark2};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 2rem 0;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const BackButton = styled.button`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 0.75rem 1.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.dark4};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 4rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.text.muted};
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
`;

const TabNav = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const TabButton = styled.button<{ active: boolean }>`
  background: ${({ active, theme }) => active ? theme.colors.red4 : theme.colors.dark3};
  color: ${({ active, theme }) => active ? 'white' : theme.colors.text.secondary};
  border: 1px solid ${({ active, theme }) => active ? theme.colors.red4 : theme.colors.dark5};
  padding: 1rem 2rem;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${({ active, theme }) => active ? theme.colors.red5 : theme.colors.dark4};
    color: ${({ active, theme }) => active ? 'white' : theme.colors.text.primary};
  }
`;

const ContentSection = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 3rem;
  margin-bottom: 3rem;

  @media (max-width: 640px) {
    padding: 1.5rem 1.25rem;
  }

  h2 {
    color: ${({ theme }) => theme.colors.red4};
    font-size: 2rem;
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  h3 {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1.5rem;
    margin: 2rem 0 1rem 0;
    font-weight: 600;
  }

  h4 {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1.2rem;
    font-weight: 600;
  }

  p {
    color: ${({ theme }) => theme.colors.text.secondary};
    line-height: 1.7;
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
  }

  ul, ol {
    margin-bottom: 1.5rem;
    padding-left: 2rem;
    color: ${({ theme }) => theme.colors.text.secondary};

    li {
      margin-bottom: 0.75rem;
      line-height: 1.6;
    }
  }

  strong {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const DefinitionBox = styled.div`
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;
  margin: 1.5rem 0;

  .term {
    color: ${({ theme }) => theme.colors.red4};
    font-weight: 700;
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }

  .definition {
    color: ${({ theme }) => theme.colors.text.secondary};
    line-height: 1.6;
    margin: 0;
  }
`;

const ToolCalloutWrapper = styled.div`
  background: linear-gradient(135deg, rgba(185, 28, 28, 0.08), rgba(185, 28, 28, 0.03));
  border: 1px solid rgba(185, 28, 28, 0.28);
  border-radius: 16px;
  padding: 1.5rem 1.75rem;
  margin: 2rem 0;
  display: flex;
  align-items: center;
  gap: 1.25rem;

  @media (max-width: 600px) {
    flex-direction: column;
    text-align: center;
  }
`;

const ToolCalloutIcon = styled.div`
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.4rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(185, 28, 28, 0.3);
`;

const ToolCalloutContent = styled.div`
  flex: 1;

  h4 {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1rem;
    margin: 0 0 0.25rem;
  }

  p {
    color: ${({ theme }) => theme.colors.text.muted};
    font-size: 0.875rem;
    margin: 0;
    line-height: 1.4;
  }
`;

const ToolCalloutBtn = styled(Link)`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
  color: white;
  padding: 0.6rem 1.25rem;
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(185, 28, 28, 0.4);
  }
`;

interface ToolCalloutProps {
  icon: string;
  toolName: string;
  description: string;
  href: string;
}

const ToolCallout: React.FC<ToolCalloutProps> = ({ icon, toolName, description, href }) => (
  <ToolCalloutWrapper>
    <ToolCalloutIcon>
      <i className={`bx ${icon}`} />
    </ToolCalloutIcon>
    <ToolCalloutContent>
      <h4>{toolName}</h4>
      <p>{description}</p>
    </ToolCalloutContent>
    <ToolCalloutBtn to={href}>
      Use Tool <i className="bx bx-right-arrow-alt" />
    </ToolCalloutBtn>
  </ToolCalloutWrapper>
);

// ─── Visual Enhancement Components ───────────────────────────────────────────

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 1rem;
  margin: 1.5rem 0 2rem;

  @media (max-width: 500px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const MetricCard = styled.div<{ accent?: string }>`
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-top: 3px solid ${({ accent, theme }) => accent || theme.colors.red4};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.25rem;

  .metric-value {
    font-size: 2rem;
    font-weight: 700;
    color: ${({ accent, theme }) => accent || theme.colors.red4};
    margin-bottom: 0.2rem;
    line-height: 1;
  }

  .metric-label {
    font-size: 0.75rem;
    color: ${({ theme }) => theme.colors.text.muted};
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 0.5rem;
  }

  .metric-desc {
    font-size: 0.83rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    line-height: 1.4;
    margin: 0;
  }
`;

const VisualCategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(175px, 1fr));
  gap: 0.75rem;
  margin: 1.25rem 0 1.75rem;

  @media (max-width: 500px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const VisualCategoryCard = styled.div`
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.1rem 1.25rem;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.red4}55;
  }

  .cat-icon {
    font-size: 1.4rem;
    color: ${({ theme }) => theme.colors.red4};
    margin-bottom: 0.5rem;
    display: block;
    line-height: 1;
  }

  .cat-name {
    font-size: 0.88rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: 0.2rem;
  }

  .cat-desc {
    font-size: 0.78rem;
    color: ${({ theme }) => theme.colors.text.muted};
    line-height: 1.4;
  }
`;

const SplitBox = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin: 1.25rem 0 1.75rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const SplitPanel = styled.div`
  background: rgba(185, 28, 28, 0.05);
  border: 1px solid rgba(185, 28, 28, 0.2);
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.25rem;

  .panel-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
    font-size: 0.82rem;
    color: ${({ theme }) => theme.colors.red4};
    margin-bottom: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid rgba(185, 28, 28, 0.15);
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      font-size: 0.875rem;
      color: ${({ theme }) => theme.colors.text.secondary};
      padding: 0.4rem 0;
      border-bottom: 1px solid rgba(185, 28, 28, 0.08);
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      line-height: 1.4;

      &:last-child { border-bottom: none; }

      &::before {
        content: '•';
        color: ${({ theme }) => theme.colors.red4};
        font-weight: bold;
        flex-shrink: 0;
        margin-top: 1px;
      }
    }
  }
`;

const StepFlow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  margin: 1.25rem 0 1.75rem;
`;

const StepFlowItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  position: relative;
  padding-bottom: 1.1rem;

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    left: 19px;
    top: 40px;
    bottom: 0;
    width: 2px;
    background: ${({ theme }) => theme.colors.dark5};
  }

  .step-num {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4});
    color: white;
    font-weight: 700;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .step-body {
    flex: 1;
    background: ${({ theme }) => theme.colors.dark4};
    border: 1px solid ${({ theme }) => theme.colors.dark5};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    padding: 0.9rem 1.1rem;

    .step-title {
      font-weight: 700;
      color: ${({ theme }) => theme.colors.text.primary};
      font-size: 0.95rem;
      margin-bottom: 0.25rem;
    }

    .step-desc {
      font-size: 0.85rem;
      color: ${({ theme }) => theme.colors.text.secondary};
      line-height: 1.5;
      margin: 0;
    }
  }
`;

const StatBarGroup = styled.div`
  margin: 1.25rem 0 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

interface StatBarProps {
  label: string;
  value: string;
  pct: number;
}

const StatBarWrapper = styled.div`
  .bar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.35rem;

    .bar-label {
      font-size: 0.88rem;
      font-weight: 500;
      color: ${({ theme }) => theme.colors.text.primary};
    }

    .bar-value {
      font-size: 0.85rem;
      font-weight: 700;
      color: ${({ theme }) => theme.colors.red4};
    }
  }

  .bar-track {
    height: 8px;
    background: ${({ theme }) => theme.colors.dark5};
    border-radius: 4px;
    overflow: hidden;

    .bar-fill {
      height: 100%;
      background: linear-gradient(90deg, ${({ theme }) => theme.colors.red3}, ${({ theme }) => theme.colors.red4});
      border-radius: 4px;
    }
  }
`;

const StatBar: React.FC<StatBarProps> = ({ label, value, pct }) => (
  <StatBarWrapper>
    <div className="bar-header">
      <span className="bar-label">{label}</span>
      <span className="bar-value">{value}</span>
    </div>
    <div className="bar-track">
      <div className="bar-fill" style={{ width: `${pct}%` }} />
    </div>
  </StatBarWrapper>
);

const PlatformGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(155px, 1fr));
  gap: 0.75rem;
  margin: 1.25rem 0 1.75rem;

  @media (max-width: 500px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const PlatformCard = styled.div`
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1rem 1.1rem;
  transition: border-color 0.2s ease, transform 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.red4}88;
    transform: translateY(-2px);
  }

  .platform-icon {
    font-size: 1.3rem;
    color: ${({ theme }) => theme.colors.red4};
    margin-bottom: 0.4rem;
    display: block;
    line-height: 1;
  }

  .platform-name {
    font-weight: 700;
    font-size: 0.85rem;
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: 0.2rem;
  }

  .platform-use {
    font-size: 0.78rem;
    color: ${({ theme }) => theme.colors.text.muted};
    line-height: 1.4;
  }
`;

const KeyTakeaway = styled.div`
  background: rgba(185, 28, 28, 0.06);
  border: 1px solid rgba(185, 28, 28, 0.2);
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.1rem 1.4rem;
  margin: 1.5rem 0;
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;

  i {
    font-size: 1.2rem;
    color: ${({ theme }) => theme.colors.red4};
    flex-shrink: 0;
    margin-top: 2px;
  }

  p {
    font-size: 0.95rem;
    color: ${({ theme }) => theme.colors.text.primary} !important;
    line-height: 1.6;
    margin: 0 !important;

    strong { color: ${({ theme }) => theme.colors.red5} !important; }
  }
`;

const VisualChecklist = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 1.25rem 0 1.75rem;
`;

const ChecklistItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 0.75rem 1rem;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.red4}44;
  }

  i {
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.red4};
    flex-shrink: 0;
    margin-top: 2px;
  }

  .check-text {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    line-height: 1.5;

    strong { color: ${({ theme }) => theme.colors.text.primary}; }
  }
`;

// ─── Component ────────────────────────────────────────────────────────────────

export const YouTubeEducationCenter: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('basics');

  const tabs = [
    { id: 'basics', name: 'YouTube Basics', icon: 'bx-play-circle' },
    { id: 'analytics', name: 'Analytics Guide', icon: 'bx-chart' },
    { id: 'optimization', name: 'Optimization', icon: 'bx-trending-up' },
    { id: 'monetization', name: 'Monetization', icon: 'bx-dollar-circle' },
    { id: 'advanced', name: 'Advanced Strategies', icon: 'bx-brain' }
  ];

  const renderContent = () => {
    switch (activeTab) {

      // ── BASICS ──────────────────────────────────────────────────────────────
      case 'basics':
        return (
          <ContentSection>
            <h2><i className="bx bx-play-circle"></i>YouTube Platform Fundamentals</h2>

            <p>
              Understanding YouTube as a platform is essential for creator success. YouTube is not just a video
              hosting service — it's a sophisticated recommendation engine, search platform, social network, and
              entertainment destination all in one. Success requires understanding how these different aspects
              work together to serve creators and viewers alike.
            </p>

            <h3>How YouTube's Ecosystem Works</h3>
            <p>
              YouTube operates as a three-sided marketplace connecting viewers seeking content, creators providing
              content, and advertisers seeking audience attention. The platform's business model depends on keeping
              viewers engaged as long as possible, which directly influences how the algorithm promotes content.
            </p>

            <MetricGrid>
              <MetricCard>
                <div className="metric-value">2B+</div>
                <div className="metric-label">Monthly Users</div>
                <p className="metric-desc">Logged-in users visiting YouTube every month worldwide</p>
              </MetricCard>
              <MetricCard accent="#E54848">
                <div className="metric-value">500h</div>
                <div className="metric-label">Uploaded / Min</div>
                <p className="metric-desc">Hours of video uploaded to the platform every single minute</p>
              </MetricCard>
              <MetricCard>
                <div className="metric-value">#2</div>
                <div className="metric-label">Search Engine</div>
                <p className="metric-desc">World's second largest search engine after Google</p>
              </MetricCard>
              <MetricCard accent="#E54848">
                <div className="metric-value">55%</div>
                <div className="metric-label">Revenue Share</div>
                <p className="metric-desc">What creators keep from ad revenue via the Partner Program</p>
              </MetricCard>
              <MetricCard>
                <div className="metric-value">1B+</div>
                <div className="metric-label">TV Screen Hours</div>
                <p className="metric-desc">Hours of YouTube watched daily on living room TV screens</p>
              </MetricCard>
            </MetricGrid>

            <p>
              These numbers illustrate the scale of the opportunity — and the competition. With 500 hours of video uploaded
              every minute, discoverability is everything. The creators who win aren't always the ones producing the
              highest-quality content objectively; they're the ones who best understand how to get that content in front
              of the right viewers at the right time. That understanding starts with knowing how the platform works at a fundamental level.
            </p>

            <h3>Understanding YouTube's Content Categories</h3>
            <p>
              YouTube recognizes different content categories that affect how videos are promoted, monetized, and
              discovered. Understanding your category helps you position content correctly and identify which
              creators you're actually competing against for audience attention.
            </p>

            <VisualCategoryGrid>
              <VisualCategoryCard>
                <i className="bx bx-book-open cat-icon" />
                <div className="cat-name">Educational</div>
                <div className="cat-desc">Tutorials, how-to guides, explainers that teach specific skills</div>
              </VisualCategoryCard>
              <VisualCategoryCard>
                <i className="bx bx-laugh cat-icon" />
                <div className="cat-name">Entertainment</div>
                <div className="cat-desc">Comedy, gaming, music, vlogs designed for enjoyment</div>
              </VisualCategoryCard>
              <VisualCategoryCard>
                <i className="bx bx-news cat-icon" />
                <div className="cat-name">News & Info</div>
                <div className="cat-desc">Current events, analysis, and timely information</div>
              </VisualCategoryCard>
              <VisualCategoryCard>
                <i className="bx bx-heart cat-icon" />
                <div className="cat-name">Lifestyle</div>
                <div className="cat-desc">Fashion, fitness, cooking, and personal lifestyle topics</div>
              </VisualCategoryCard>
              <VisualCategoryCard>
                <i className="bx bx-chip cat-icon" />
                <div className="cat-name">Tech & Reviews</div>
                <div className="cat-desc">Product reviews, tech explanations, consumer guidance</div>
              </VisualCategoryCard>
            </VisualCategoryGrid>

            <p>
              Most successful channels occupy a specific niche within these broader categories rather than trying to
              serve all of them at once. A channel about "Python for data scientists" will outperform a general
              "coding tutorials" channel with the same upload frequency because the algorithm learns exactly who
              to show it to — and those viewers are far more likely to subscribe and watch more.
            </p>

            <ToolCallout
              icon="bx-bar-chart-alt-2"
              toolName="Channel Analyzer"
              description="Study the top channels in your niche — see their upload frequency, average view counts, and which videos performed best so you can model a winning strategy before you commit."
              href="/tools/channel-analyzer"
            />

            <h3>How the Algorithm Decides What to Recommend</h3>
            <p>
              YouTube's recommendation algorithm considers dozens of signals when deciding which videos to
              surface. Understanding the core decision loop helps creators optimize for what actually matters
              rather than chasing surface-level metrics.
            </p>

            <StepFlow>
              <StepFlowItem>
                <div className="step-num">1</div>
                <div className="step-body">
                  <div className="step-title">Impression Generated</div>
                  <p className="step-desc">YouTube shows your thumbnail to a viewer based on their watch history, search patterns, and what similar viewers enjoy. This is the algorithm's first "bet" on your content.</p>
                </div>
              </StepFlowItem>
              <StepFlowItem>
                <div className="step-num">2</div>
                <div className="step-body">
                  <div className="step-title">CTR Evaluated</div>
                  <p className="step-desc">The algorithm measures how many people click your thumbnail. A strong CTR (4–8%+) signals that your title and thumbnail are compelling relative to competing content shown alongside yours.</p>
                </div>
              </StepFlowItem>
              <StepFlowItem>
                <div className="step-num">3</div>
                <div className="step-body">
                  <div className="step-title">Watch Behavior Recorded</div>
                  <p className="step-desc">How long viewers stay, whether they skip ahead, rewind, like, comment, or immediately close the video — these satisfaction signals tell YouTube if your content delivered on its promise.</p>
                </div>
              </StepFlowItem>
              <StepFlowItem>
                <div className="step-num">4</div>
                <div className="step-body">
                  <div className="step-title">Distribution Adjusted</div>
                  <p className="step-desc">Videos with strong CTR + retention are promoted to wider audiences. Videos with weak signals receive fewer impressions. The cycle repeats continuously as new data arrives — every view is a data point.</p>
                </div>
              </StepFlowItem>
            </StepFlow>

            <p>
              This cycle is continuous and self-reinforcing. A video that performs well in the first 48 hours gets
              shown to more people, generating more data, which further sharpens the algorithm's confidence in
              promoting it. This is why the first-hour performance of a video matters so much — early engagement
              from your existing subscribers essentially "vouches" for the video and triggers a wider rollout.
            </p>

            <DefinitionBox>
              <div className="term">YouTube Creator Studio</div>
              <div className="definition">
                The comprehensive dashboard where creators manage their channels, access analytics,
                customize settings, and monitor performance. Creator Studio provides essential tools
                for channel optimization and business management — familiarize yourself with every section before publishing.
              </div>
            </DefinitionBox>

            <h3>Creator Rights vs. Responsibilities</h3>
            <p>
              YouTube creators have specific rights and responsibilities outlined in the platform's Terms of Service
              and Community Guidelines. Understanding both sides helps build sustainable channels and avoid
              costly policy violations.
            </p>

            <SplitBox>
              <SplitPanel>
                <div className="panel-header">
                  <i className="bx bx-shield-check" /> Your Rights
                </div>
                <ul>
                  <li>Ownership of original content you upload</li>
                  <li>Revenue sharing through YouTube Partner Program</li>
                  <li>Access to detailed analytics and audience insights</li>
                  <li>Fair treatment and appeal processes under YouTube policies</li>
                  <li>Copyright protection from infringement by others</li>
                  <li>Channel customization and brand expression</li>
                </ul>
              </SplitPanel>
              <SplitPanel>
                <div className="panel-header">
                  <i className="bx bx-error-circle" /> Your Responsibilities
                </div>
                <ul>
                  <li>Follow Community Guidelines and Terms of Service</li>
                  <li>Respect copyright and intellectual property laws</li>
                  <li>Avoid misleading content and provide accurate information</li>
                  <li>Maintain content appropriate for your chosen audience</li>
                  <li>Disclose sponsorships per FTC legal requirements</li>
                  <li>Protect minors in content featuring children</li>
                </ul>
              </SplitPanel>
            </SplitBox>

            <p>
              Copyright is the most common area where new creators run into trouble. Even unintentional
              infringement — using a few seconds of a song in a background montage, for example — can result
              in a Content ID claim that strips your monetization on that video. When in doubt, use royalty-free
              music from YouTube Audio Library, Epidemic Sound, or similar services.
            </p>

            <h3>Channel Setup Essentials</h3>
            <p>
              Proper channel setup is the foundation of long-term success. Follow these steps to establish
              a professional presence before publishing your first public video.
            </p>

            <StepFlow>
              <StepFlowItem>
                <div className="step-num">1</div>
                <div className="step-body">
                  <div className="step-title">Brand Your Channel</div>
                  <p className="step-desc">Create a channel icon (800×800px), banner art (2560×1440px), and a watermark. Use consistent colors and fonts that you'll maintain across every video thumbnail for recognition.</p>
                </div>
              </StepFlowItem>
              <StepFlowItem>
                <div className="step-num">2</div>
                <div className="step-body">
                  <div className="step-title">Write Your Channel Description</div>
                  <p className="step-desc">Include primary keywords, a clear value proposition, and your upload schedule. The first 100 characters appear in search results — make them compelling and keyword-rich.</p>
                </div>
              </StepFlowItem>
              <StepFlowItem>
                <div className="step-num">3</div>
                <div className="step-body">
                  <div className="step-title">Set Up Channel Sections</div>
                  <p className="step-desc">Organize your channel homepage with featured playlists, a channel trailer for new visitors, and sections that showcase your best content to returning subscribers.</p>
                </div>
              </StepFlowItem>
              <StepFlowItem>
                <div className="step-num">4</div>
                <div className="step-body">
                  <div className="step-title">Configure Default Settings</div>
                  <p className="step-desc">Set up default video descriptions with links, hashtags, and standard disclaimers. Enable auto-chapters, configure notification defaults, and set up your end screen template.</p>
                </div>
              </StepFlowItem>
              <StepFlowItem>
                <div className="step-num">5</div>
                <div className="step-body">
                  <div className="step-title">Link External Platforms</div>
                  <p className="step-desc">Add your website, social media profiles, and Merch shelf if eligible. Cross-platform linking strengthens channel credibility and provides additional traffic sources from day one.</p>
                </div>
              </StepFlowItem>
            </StepFlow>

            <ToolCallout
              icon="bx-chart"
              toolName="Channel Analyzer"
              description="Get comprehensive insights into any YouTube channel's performance, growth patterns, and audience metrics — your own or a competitor's."
              href="/tools/channel-analyzer"
            />
          </ContentSection>
        );

      // ── ANALYTICS ───────────────────────────────────────────────────────────
      case 'analytics':
        return (
          <ContentSection>
            <h2><i className="bx bx-chart"></i>Complete YouTube Analytics Guide</h2>

            <p>
              YouTube Analytics provides creators with detailed insights into content performance, audience
              behavior, and channel growth patterns. Understanding and acting on these metrics is the
              single highest-leverage activity for long-term channel growth.
            </p>

            <h3>Essential Metrics Every Creator Must Track</h3>

            <MetricGrid>
              <MetricCard>
                <div className="metric-value">#1</div>
                <div className="metric-label">Watch Time Signal</div>
                <p className="metric-desc">Total minutes viewed is YouTube's single most important algorithmic signal for promotion</p>
              </MetricCard>
              <MetricCard accent="#E54848">
                <div className="metric-value">2–10%</div>
                <div className="metric-label">Healthy CTR Range</div>
                <p className="metric-desc">Click-through rate on impressions. Above 5% is strong for established channels</p>
              </MetricCard>
              <MetricCard>
                <div className="metric-value">50–60%</div>
                <div className="metric-label">Target Retention</div>
                <p className="metric-desc">Average view duration as % of video length. 50%+ signals great content to the algorithm</p>
              </MetricCard>
              <MetricCard accent="#E54848">
                <div className="metric-value">≥$3</div>
                <div className="metric-label">Healthy RPM Target</div>
                <p className="metric-desc">Revenue per 1,000 views after YouTube's cut — your real earning metric, not CPM</p>
              </MetricCard>
              <MetricCard>
                <div className="metric-value">0.5–2%</div>
                <div className="metric-label">Sub Conversion Rate</div>
                <p className="metric-desc">% of new viewers who subscribe after watching. Strong content consistently converts in this range</p>
              </MetricCard>
            </MetricGrid>

            <p>
              Most creators obsess over subscriber count and total views, but these are vanity metrics —
              they feel good but don't tell you much about content quality or future growth. The five metrics
              above are what actually drive the algorithm and your revenue. Check them weekly at minimum,
              and look at trends over 30-day windows rather than reacting to individual video performance.
            </p>

            <h4>Watch Time and Average View Duration</h4>
            <p>
              Watch time represents the total minutes viewers spend watching your content and is YouTube's most
              important ranking factor. Average view duration shows how engaging your content is by measuring
              what percentage of each video viewers typically watch. A video with 100K views but only 20%
              retention will underperform a video with 10K views and 70% retention in the algorithm.
            </p>

            <KeyTakeaway>
              <i className="bx bx-bulb" />
              <p>
                Industry benchmarks vary by content type, but <strong>maintaining 50–60% average view duration</strong> indicates
                highly engaging content. Educational content often sees higher retention than entertainment due to
                the viewer's intent to learn rather than passively consume.
              </p>
            </KeyTakeaway>

            <DefinitionBox>
              <div className="term">Audience Retention Graph</div>
              <div className="definition">
                A visual representation showing exactly when viewers stop watching your videos.
                The graph identifies "drop-off spikes" — moments where many viewers quit simultaneously —
                and "re-watch bumps" — moments so valuable viewers rewind. Use this to improve your
                hooks and cut underperforming segments in future videos.
              </div>
            </DefinitionBox>

            <h3>Traffic Source Breakdown</h3>
            <p>
              Understanding where your views come from helps optimize your content strategy for different
              discovery methods. These sources have different growth implications — diversify strategically:
            </p>

            <StatBarGroup>
              <StatBar label="YouTube Search" value="High Intent" pct={88} />
              <StatBar label="Browse / Home Feed" value="High Volume" pct={78} />
              <StatBar label="Suggested Videos" value="Algorithmic Growth" pct={72} />
              <StatBar label="External Sources" value="Owned Audience" pct={45} />
              <StatBar label="Playlists" value="Session Builder" pct={38} />
              <StatBar label="Channel Pages" value="Brand Discovery" pct={22} />
            </StatBarGroup>

            <p>
              Search is the most valuable long-term traffic source because it's intent-driven — viewers actively
              looking for your topic. Browse feed is high volume but requires a scroll-stopping thumbnail to
              compete. Suggested video traffic is the hardest to earn but scales exponentially when the algorithm
              starts pairing your content with larger channels in your niche. Aim to grow all three, but early-stage
              channels should focus disproportionately on search.
            </p>

            <ToolCallout
              icon="bx-line-chart"
              toolName="Video Analyzer"
              description="Break down where individual videos get their views, see which traffic sources drive the most watch time, and identify what the algorithm is already pairing with your content."
              href="/tools/video-analyzer"
            />

            <h4>CTR Benchmarks by Traffic Source</h4>
            <p>
              CTR varies significantly by where your video appears. Never compare browse CTR to search CTR —
              they serve audiences with fundamentally different intent levels. Notification CTR is naturally
              highest because those viewers already follow you. Use these ranges as diagnostic tools: if your
              home feed CTR falls below 2%, focus on thumbnails; if search CTR is low, your titles may not
              match search intent well enough.
            </p>

            <StatBarGroup>
              <StatBar label="Notification CTR" value="10–30% healthy" pct={90} />
              <StatBar label="Home Feed CTR" value="2–10% healthy" pct={75} />
              <StatBar label="Search Results CTR" value="5–20% healthy" pct={68} />
              <StatBar label="Suggested Video CTR" value="1–5% healthy" pct={50} />
              <StatBar label="End Screen CTR" value="0.5–3% healthy" pct={28} />
            </StatBarGroup>

            <h3>Audience Demographics and Behavior</h3>
            <p>
              YouTube provides detailed demographic information about your audience including age, gender,
              geographic location, and device usage patterns. This data helps you tailor content to your
              actual audience rather than assumed demographics — many creators are surprised to discover
              who's really watching.
            </p>

            <VisualCategoryGrid>
              <VisualCategoryCard>
                <i className="bx bx-map cat-icon" />
                <div className="cat-name">Geography</div>
                <div className="cat-desc">Know which countries drive your views — US/UK/AU viewers generate 3–5× more RPM than other regions</div>
              </VisualCategoryCard>
              <VisualCategoryCard>
                <i className="bx bx-mobile cat-icon" />
                <div className="cat-name">Device Type</div>
                <div className="cat-desc">Mobile vs. desktop vs. TV affects thumbnail design, text size, and expected viewing context</div>
              </VisualCategoryCard>
              <VisualCategoryCard>
                <i className="bx bx-time cat-icon" />
                <div className="cat-name">Active Hours</div>
                <div className="cat-desc">When your audience watches most — use this to schedule uploads for maximum first-hour traction</div>
              </VisualCategoryCard>
              <VisualCategoryCard>
                <i className="bx bx-intersect cat-icon" />
                <div className="cat-name">Audience Overlap</div>
                <div className="cat-desc">What other channels your viewers watch — reveals collaboration opportunities and content gaps to fill</div>
              </VisualCategoryCard>
            </VisualCategoryGrid>

            <p>
              Geography is one of the most underappreciated analytics dimensions. A channel with 80% of its
              viewers in countries with low ad rates might earn 3–5× less than a channel with the same view
              count but a US-heavy audience. If you want to shift your geographic mix, creating content that
              specifically speaks to US/UK problems, references, or prices will organically attract higher-RPM
              audiences over time.
            </p>

            <ToolCallout
              icon="bx-git-compare"
              toolName="Channel Comparer"
              description="Benchmark your channel against similar creators in your niche — compare retention, CTR, upload frequency, and growth rate side-by-side to see exactly where the gaps are."
              href="/tools/channel-comparer"
            />

            <h3>Revenue Analytics and Monetization Tracking</h3>
            <p>
              For monetized channels, YouTube provides detailed revenue analytics including earnings by
              video, traffic source, and geographic region. Track RPM — it's what you actually earn per
              thousand views after YouTube's cut and includes all revenue streams combined.
            </p>

            <MetricGrid>
              <MetricCard>
                <div className="metric-value">Q4</div>
                <div className="metric-label">Peak CPM Season</div>
                <p className="metric-desc">Oct–Dec sees 50–100% higher CPMs as advertisers spend holiday budgets — your best earning months</p>
              </MetricCard>
              <MetricCard accent="#E54848">
                <div className="metric-value">Q1</div>
                <div className="metric-label">Lowest CPM Season</div>
                <p className="metric-desc">Jan–Feb CPMs drop 30–40% after holiday budgets reset — expect this and plan cash flow accordingly</p>
              </MetricCard>
              <MetricCard>
                <div className="metric-value">7–14d</div>
                <div className="metric-label">Revenue Delay</div>
                <p className="metric-desc">Ad revenue is finalized 7–14 days after the month ends — don't mistake delayed reporting for lost revenue</p>
              </MetricCard>
              <MetricCard accent="#E54848">
                <div className="metric-value">$100</div>
                <div className="metric-label">Payment Threshold</div>
                <p className="metric-desc">YouTube pays out once your balance reaches $100 — payments process monthly via AdSense</p>
              </MetricCard>
            </MetricGrid>

            <KeyTakeaway>
              <i className="bx bx-bulb" />
              <p>
                Track <strong>RPM across different content types</strong> in your catalog.
                This reveals which content delivers the best return on creation investment — often not
                the videos with the most views, but those targeting high-value audience demographics.
              </p>
            </KeyTakeaway>

            <ToolCallout
              icon="bx-chart"
              toolName="Video Analyzer"
              description="Dive deeper into individual video performance — competitor comparisons, retention graphs, and optimization recommendations based on real analytics data."
              href="/tools/video-analyzer"
            />
          </ContentSection>
        );

      // ── OPTIMIZATION ────────────────────────────────────────────────────────
      case 'optimization':
        return (
          <ContentSection>
            <h2><i className="bx bx-trending-up"></i>YouTube Optimization Strategies</h2>

            <p>
              YouTube optimization involves systematically improving every element of your channel and content
              to maximize discovery, engagement, and growth. Effective optimization requires understanding
              both YouTube's technical requirements and the psychology behind viewer decisions.
            </p>

            <h3>Search Engine Optimization for YouTube</h3>
            <p>
              YouTube SEO involves optimizing your content to rank well within YouTube's search system
              and in Google search results. YouTube is the world's second-largest search engine, and
              many YouTube videos also appear in Google results — effectively giving you two chances
              to rank for the same keyword.
            </p>

            <h4>Keyword Research and Implementation</h4>
            <p>
              Effective keyword research identifies terms your target audience actually searches for while
              assessing competition levels. Focus on keywords that balance search volume with realistic
              ranking possibilities for your channel's current authority level.
            </p>

            <VisualCategoryGrid>
              <VisualCategoryCard>
                <i className="bx bx-target-lock cat-icon" />
                <div className="cat-name">Primary Keywords</div>
                <div className="cat-desc">Core terms describing your video's main topic — include in title and first 100 chars of description</div>
              </VisualCategoryCard>
              <VisualCategoryCard>
                <i className="bx bx-git-branch cat-icon" />
                <div className="cat-name">Long-tail Keywords</div>
                <div className="cat-desc">Specific phrases with lower competition and higher intent — easier to rank for early in your channel's life</div>
              </VisualCategoryCard>
              <VisualCategoryCard>
                <i className="bx bx-link-alt cat-icon" />
                <div className="cat-name">Related Keywords</div>
                <div className="cat-desc">Supporting terms providing semantic context — helps YouTube understand your content's full scope</div>
              </VisualCategoryCard>
              <VisualCategoryCard>
                <i className="bx bx-trending-up cat-icon" />
                <div className="cat-name">Trending Keywords</div>
                <div className="cat-desc">Emerging terms with growing search volume — high reward but time-sensitive, act within the first wave</div>
              </VisualCategoryCard>
            </VisualCategoryGrid>

            <p>
              For new channels, long-tail keywords are your highest-leverage starting point. A keyword like
              "how to edit YouTube videos" has millions of competing results, but "how to edit YouTube videos
              on iPhone without losing quality" might have a few hundred. Ranking for twenty long-tail queries
              compounds into a meaningful traffic base far faster than chasing impossible head terms you can't
              yet rank for.
            </p>

            <ToolCallout
              icon="bx-search-alt"
              toolName="Keyword Analyzer"
              description="Research search volumes, competition levels, and related queries in your niche — plus see what keywords top-performing videos in your category are already ranking for."
              href="/tools/keyword-analyzer"
            />

            <DefinitionBox>
              <div className="term">Search Intent Optimization</div>
              <div className="definition">
                Aligning your content with the specific intent behind search queries. Educational intent
                seeks learning, entertainment intent seeks enjoyment, and commercial intent seeks purchasing
                guidance. The #1 mistake: optimizing for high-volume keywords without matching the searcher's
                actual intent — your video won't retain those viewers even if it ranks.
              </div>
            </DefinitionBox>

            <h4>Title, Description & Tag Best Practices</h4>
            <p>
              Video titles serve multiple purposes: they communicate content value to viewers, provide keyword
              signals to search algorithms, and create curiosity that drives clicks. Front-load important keywords
              while keeping titles under 60 characters for full visibility across all devices.
            </p>

            <VisualChecklist>
              <ChecklistItem>
                <i className="bx bx-check-circle" />
                <span className="check-text"><strong>Title Formula</strong> — Lead with your primary keyword, then add a compelling benefit or hook (keep under 60 characters)</span>
              </ChecklistItem>
              <ChecklistItem>
                <i className="bx bx-check-circle" />
                <span className="check-text"><strong>Description First 200 chars</strong> — Treat these like a meta description; include your main keyword naturally in the first sentence</span>
              </ChecklistItem>
              <ChecklistItem>
                <i className="bx bx-check-circle" />
                <span className="check-text"><strong>Tag Strategy</strong> — Use 5–10 highly relevant tags: exact title phrase, broad topic, related terms, and your channel name</span>
              </ChecklistItem>
              <ChecklistItem>
                <i className="bx bx-check-circle" />
                <span className="check-text"><strong>Chapters in Description</strong> — Add timestamps for videos over 3 minutes; chapters appear in search results and improve retention</span>
              </ChecklistItem>
              <ChecklistItem>
                <i className="bx bx-check-circle" />
                <span className="check-text"><strong>Hashtags</strong> — Add 3–5 relevant hashtags; the first 3 appear below the video title on mobile search results</span>
              </ChecklistItem>
            </VisualChecklist>

            <h3>Thumbnail Optimization</h3>
            <p>
              Thumbnail optimization combines design principles with psychological triggers that encourage
              clicks. Your thumbnail must work at 120×68px (mobile search), 246×138px (desktop suggested),
              and remain compelling at full 1280×720px resolution.
            </p>

            <h4>Design Elements That Drive Clicks</h4>

            <VisualChecklist>
              <ChecklistItem>
                <i className="bx bx-check-circle" />
                <span className="check-text"><strong>High Contrast Colors</strong> — Bold colors that stand out against YouTube's dark and light interface themes on any device</span>
              </ChecklistItem>
              <ChecklistItem>
                <i className="bx bx-check-circle" />
                <span className="check-text"><strong>Clear Facial Expressions</strong> — Emotions that convey the video's tone and create an emotional connection with potential viewers</span>
              </ChecklistItem>
              <ChecklistItem>
                <i className="bx bx-check-circle" />
                <span className="check-text"><strong>Readable Text at Small Sizes</strong> — Large, bold text that stays legible at 120px thumbnail width — max 3–5 words maximum</span>
              </ChecklistItem>
              <ChecklistItem>
                <i className="bx bx-check-circle" />
                <span className="check-text"><strong>Clear Visual Hierarchy</strong> — One dominant focal point that guides viewer attention instantly; avoid cluttered layouts</span>
              </ChecklistItem>
              <ChecklistItem>
                <i className="bx bx-check-circle" />
                <span className="check-text"><strong>Brand Consistency</strong> — Recognizable template or color scheme that builds channel recognition — viewers click familiar faces</span>
              </ChecklistItem>
              <ChecklistItem>
                <i className="bx bx-check-circle" />
                <span className="check-text"><strong>The Curiosity Gap</strong> — Show enough to create intrigue, withhold enough to demand a click — thumbnail and title work together</span>
              </ChecklistItem>
            </VisualChecklist>

            <p>
              The most important thumbnail principle is context: your thumbnail doesn't exist in isolation, it
              appears next to other thumbnails. Before finalizing a design, screenshot the YouTube search results
              for your target keyword and paste your thumbnail in — does it stand out, or blend in? Thumbnails
              that create contrast with the surrounding content get disproportionately more clicks. Testing two
              thumbnail versions on the same video is the single best A/B test you can run early on.
            </p>

            <ToolCallout
              icon="bx-photo-album"
              toolName="Thumbnail Tester"
              description="Preview how your thumbnail looks at different sizes across search, home feed, and suggested placements — catch weak designs before they cost you clicks."
              href="/tools/thumbnail-tester"
            />

            <h3>Optimal Upload Timing</h3>
            <p>
              Upload timing affects how much traction your video gains in its critical first 24–48 hours.
              The strongest signal you can send the algorithm is rapid, early engagement from your existing
              subscribers. Use your Analytics → Audience tab to find your specific peak hours.
            </p>

            <StatBarGroup>
              <StatBar label="Your Analytics: Audience Tab" value="Best Source" pct={100} />
              <StatBar label="Thursday–Friday Publishing" value="Strong for most niches" pct={82} />
              <StatBar label="Saturday–Sunday Publishing" value="Entertainment & Gaming" pct={72} />
              <StatBar label="Tuesday–Wednesday" value="Educational & Business" pct={68} />
              <StatBar label="Monday Publishing" value="Lower engagement day" pct={40} />
            </StatBarGroup>

            <p>
              The optimal upload time typically falls 1–3 hours before your audience's peak viewing window —
              giving YouTube enough time to process the video, notify subscribers, and begin its initial
              distribution before the traffic wave hits. Check Creator Studio → Analytics → Audience to see
              exactly when your specific subscribers are online. This data is unique to your channel and far
              more reliable than any general industry guideline.
            </p>

            <h3>Content Structure Optimization</h3>
            <p>
              How you structure your video content significantly impacts viewer retention and algorithmic
              performance. Successful content follows proven patterns that maintain viewer interest while
              delivering promised value efficiently.
            </p>

            <h4>The Hook → Loop → Deliver → CTA Formula</h4>

            <StepFlow>
              <StepFlowItem>
                <div className="step-num">1</div>
                <div className="step-body">
                  <div className="step-title">Hook (0–30 seconds)</div>
                  <p className="step-desc">Immediately grab attention and clearly state the video's value proposition. This is the most critical window — if viewers leave here, the algorithm won't promote your video. Use a pattern interrupt: jump cut, bold claim, or compelling question.</p>
                </div>
              </StepFlowItem>
              <StepFlowItem>
                <div className="step-num">2</div>
                <div className="step-body">
                  <div className="step-title">Open Loop (30–90 seconds)</div>
                  <p className="step-desc">Hint at what's coming later in the video — the "open loop" technique. "Stick around until the end where I'll show you the exact strategy I used to..." This dramatically increases average view duration.</p>
                </div>
              </StepFlowItem>
              <StepFlowItem>
                <div className="step-num">3</div>
                <div className="step-body">
                  <div className="step-title">Deliver (Main Content)</div>
                  <p className="step-desc">Provide the promised value in an organized, engaging manner. Use pattern interrupts (b-roll, graphics, cuts) every 60–90 seconds to maintain retention. Never bait-and-switch — deliver on every promise made in the hook.</p>
                </div>
              </StepFlowItem>
              <StepFlowItem>
                <div className="step-num">4</div>
                <div className="step-body">
                  <div className="step-title">Close & CTA</div>
                  <p className="step-desc">Fulfill every promise from step 2. End with a single clear call-to-action (subscribe, watch next, or comment — choose one). Then immediately recommend your next video to extend their session on YouTube.</p>
                </div>
              </StepFlowItem>
            </StepFlow>

            <KeyTakeaway>
              <i className="bx bx-bulb" />
              <p>
                This formula works because it aligns with both <strong>viewer expectations and algorithmic preferences</strong> —
                viewers get value, the algorithm sees high retention and session continuation, and you build
                a loyal audience simultaneously.
              </p>
            </KeyTakeaway>

            <ToolCallout
              icon="bx-purchase-tag-alt"
              toolName="Tag Generator"
              description="Generate keyword-optimized tags for any video topic instantly — covers primary, secondary, and long-tail variations to maximize your video's discoverability in search."
              href="/tools/tag-generator"
            />
          </ContentSection>
        );

      // ── MONETIZATION ────────────────────────────────────────────────────────
      case 'monetization':
        return (
          <ContentSection>
            <h2><i className="bx bx-dollar-circle"></i>Complete YouTube Monetization Guide</h2>

            <p>
              YouTube monetization encompasses multiple revenue streams that creators can develop to build
              sustainable, profitable businesses. The creators who earn the most aren't necessarily the most
              viewed — they're the most strategically diversified across complementary revenue streams.
            </p>

            <h3>YouTube Partner Program — Key Thresholds</h3>

            <MetricGrid>
              <MetricCard>
                <div className="metric-value">500</div>
                <div className="metric-label">Subs (YPP Lite)</div>
                <p className="metric-desc">Unlocks Super Thanks, Super Chat, and Channel Memberships before full ad monetization</p>
              </MetricCard>
              <MetricCard accent="#E54848">
                <div className="metric-value">1,000</div>
                <div className="metric-label">Subs (Full YPP)</div>
                <p className="metric-desc">Full ad monetization: 1K subs + 4K watch hours OR 10M Shorts views in 12 months</p>
              </MetricCard>
              <MetricCard>
                <div className="metric-value">$2–15</div>
                <div className="metric-label">Typical CPM Range</div>
                <p className="metric-desc">Cost per 1,000 ad impressions — varies dramatically by niche, country, and time of year</p>
              </MetricCard>
              <MetricCard accent="#E54848">
                <div className="metric-value">55%</div>
                <div className="metric-label">Creator Revenue Share</div>
                <p className="metric-desc">Your cut of ad revenue — YouTube retains the remaining 45% of gross ad spend</p>
              </MetricCard>
            </MetricGrid>

            <p>
              The YPP Lite tier (500 subscribers) was introduced in 2023 specifically to let smaller creators
              start earning from direct fan support — Super Thanks, Super Chat during live streams, and Channel
              Memberships — before they hit the ad revenue threshold. If you're close to 500 subscribers,
              prioritize that milestone first. It also keeps creators more motivated to continue posting,
              which benefits the platform's overall content ecosystem.
            </p>

            <ToolCallout
              icon="bx-calculator"
              toolName="YouTube Earnings Calculator"
              description="Model your projected earnings at different subscriber counts, view rates, and niche CPMs — including ad revenue, sponsorship potential, and membership income scenarios side by side."
              href="/tools/youtube-calculator"
            />

            <h3>CPM by Content Niche</h3>
            <p>
              CPM rates vary enormously by content category. Finance and business content commands premium
              rates because advertisers pay more to reach audiences with purchasing intent and spending power.
              These are representative ranges — actual CPMs fluctuate with seasonality (Q4 is always highest).
            </p>

            <MetricGrid>
              <MetricCard>
                <div className="metric-value">$15–50</div>
                <div className="metric-label">Finance & Investing</div>
                <p className="metric-desc">Highest CPM category — financial products, credit cards, and insurance advertisers compete heavily</p>
              </MetricCard>
              <MetricCard accent="#E54848">
                <div className="metric-value">$10–30</div>
                <div className="metric-label">Business & SaaS</div>
                <p className="metric-desc">B2B software, consulting tools, and productivity apps drive strong CPMs in this niche</p>
              </MetricCard>
              <MetricCard>
                <div className="metric-value">$5–20</div>
                <div className="metric-label">Tech & Reviews</div>
                <p className="metric-desc">Consumer electronics and software create solid CPMs, especially for US/UK/AU audiences</p>
              </MetricCard>
              <MetricCard accent="#E54848">
                <div className="metric-value">$1–5</div>
                <div className="metric-label">Gaming & Entertainment</div>
                <p className="metric-desc">Highest view volumes but lowest CPMs — compensate with Memberships, merch, and sponsorships</p>
              </MetricCard>
            </MetricGrid>

            <DefinitionBox>
              <div className="term">RPM vs CPM — The Critical Difference</div>
              <div className="definition">
                CPM (Cost Per Mille) is what advertisers pay per 1,000 ad impressions — it's their cost.
                RPM (Revenue Per Mille) is what you actually earn per 1,000 video views — it's your income.
                RPM is always lower than CPM because not every view shows an ad, and YouTube takes its 45% cut.
                Always reference RPM when discussing your actual earnings potential.
              </div>
            </DefinitionBox>

            <h3>Building Multiple Revenue Streams</h3>

            <p>
              Think of monetization as a pyramid. Ad revenue is the wide base — easy to access, low effort per view,
              but also the lowest margin. As you move up toward products and services, the effort-per-dollar
              increases, but so do the margins and the platform independence. The goal is to ascend that pyramid
              over time while maintaining the base, so no single revenue source represents more than half your income.
            </p>

            <StepFlow>
              <StepFlowItem>
                <div className="step-num">1</div>
                <div className="step-body">
                  <div className="step-title">Ad Revenue (Foundation)</div>
                  <p className="step-desc">Your baseline revenue once in YPP. Stable but volatile — susceptible to algorithm changes, ad seasonality (CPMs drop 30–40% in Q1), and demonetization risks. Treat this as foundation, not ceiling.</p>
                </div>
              </StepFlowItem>
              <StepFlowItem>
                <div className="step-num">2</div>
                <div className="step-body">
                  <div className="step-title">Affiliate Marketing (Early Growth Phase)</div>
                  <p className="step-desc">Commission-based income promoting products relevant to your content. Amazon Associates pays 1–10%, while SaaS affiliate programs typically pay 20–50% recurring commissions. Ideal from day one — no follower threshold required.</p>
                </div>
              </StepFlowItem>
              <StepFlowItem>
                <div className="step-num">3</div>
                <div className="step-body">
                  <div className="step-title">Sponsorships & Brand Deals (10K+ Subscribers)</div>
                  <p className="step-desc">Often the highest per-video revenue for mid-size creators. Industry rates: $100–$500 per 10K views for established niches. Micro-influencers (10K–100K) often earn better rate-per-view than mega channels due to audience trust and engagement.</p>
                </div>
              </StepFlowItem>
              <StepFlowItem>
                <div className="step-num">4</div>
                <div className="step-body">
                  <div className="step-title">Channel Memberships (Community Phase)</div>
                  <p className="step-desc">Recurring monthly income from your most dedicated viewers. At $5/month with 0.5% of subscribers converting, a 100K-subscriber channel earns $2,500+/month in predictable recurring revenue — regardless of monthly view counts.</p>
                </div>
              </StepFlowItem>
              <StepFlowItem>
                <div className="step-num">5</div>
                <div className="step-body">
                  <div className="step-title">Own Products & Services (Scale Phase)</div>
                  <p className="step-desc">Highest profit margins (70–95%) and complete platform independence. Digital products (courses, templates, ebooks), physical merchandise, consulting, or coaching. A 10K-subscriber channel can outperform a 1M-subscriber channel here through superior audience trust.</p>
                </div>
              </StepFlowItem>
            </StepFlow>

            <h3>Channel Membership Perks That Convert</h3>

            <VisualCategoryGrid>
              <VisualCategoryCard>
                <i className="bx bx-video-plus cat-icon" />
                <div className="cat-name">Exclusive Content</div>
                <div className="cat-desc">Members-only videos, extended cuts, behind-the-scenes, and early access before public release</div>
              </VisualCategoryCard>
              <VisualCategoryCard>
                <i className="bx bx-group cat-icon" />
                <div className="cat-name">Community Access</div>
                <div className="cat-desc">Private Discord, member-only live streams, monthly Q&A — the personal access is the real product</div>
              </VisualCategoryCard>
              <VisualCategoryCard>
                <i className="bx bx-badge-check cat-icon" />
                <div className="cat-name">Recognition</div>
                <div className="cat-desc">Custom badges, emoji, shout-outs in videos, and name in credits — status matters to loyal fans</div>
              </VisualCategoryCard>
              <VisualCategoryCard>
                <i className="bx bx-book cat-icon" />
                <div className="cat-name">Downloadable Resources</div>
                <div className="cat-desc">Templates, cheatsheets, resource libraries — high perceived value, zero ongoing delivery cost</div>
              </VisualCategoryCard>
            </VisualCategoryGrid>

            <p>
              Membership pricing is often set too low out of fear. If your content genuinely helps or entertains
              your audience, $9.99/month for your most engaged 0.5% is not unreasonable — that's less than a
              Netflix subscription. Conversely, a well-structured $4.99 tier with clear perks will outperform
              a vague $9.99 tier every time. Be specific about what members get and deliver on it consistently.
            </p>

            <KeyTakeaway>
              <i className="bx bx-bulb" />
              <p>
                <strong>Diversification is the key to financial stability.</strong> Creators who rely solely on
                ad revenue are vulnerable to algorithm changes and advertiser pullbacks. Aim to have at least
                3 revenue streams active simultaneously — target ad revenue below 50% of your total income.
              </p>
            </KeyTakeaway>

            <ToolCallout
              icon="bx-bot"
              toolName="AI Channel Consultant"
              description="Get AI-powered revenue strategy recommendations tailored to your niche, audience size, and content type — actionable advice on which monetization streams to build next."
              href="/tools/channel-consultant"
            />
          </ContentSection>
        );

      // ── ADVANCED ────────────────────────────────────────────────────────────
      case 'advanced':
        return (
          <ContentSection>
            <h2><i className="bx bx-brain"></i>Advanced YouTube Strategies</h2>

            <p>
              Advanced YouTube strategies go beyond basic content creation to encompass sophisticated approaches
              to audience development, competitive positioning, and systematic growth optimization. These
              strategies require deeper platform understanding but can significantly accelerate growth for
              creators ready to implement them systematically.
            </p>

            <h3>Algorithmic Signals — Weighted by Impact</h3>
            <p>
              Understanding the relative weight each signal carries in YouTube's recommendation algorithm
              helps creators prioritize optimization effort. The algorithm optimizes for user satisfaction
              and session duration across these key signals:
            </p>

            <StatBarGroup>
              <StatBar label="Watch Time & Session Duration" value="Critical" pct={95} />
              <StatBar label="Click-Through Rate (CTR)" value="Very High" pct={85} />
              <StatBar label="Audience Retention %" value="Very High" pct={82} />
              <StatBar label="Likes & Engagement Rate" value="High" pct={68} />
              <StatBar label="Shares & External Links" value="Medium-High" pct={60} />
              <StatBar label="Comments & Replies" value="Medium-High" pct={55} />
              <StatBar label="Upload Consistency" value="Medium" pct={45} />
              <StatBar label="Subscriber Count" value="Indirect" pct={30} />
            </StatBarGroup>

            <p>
              Notice that subscriber count ranks last. This surprises most creators — intuitively you'd expect
              a larger subscriber base to mean more promotion. In reality, subscribers matter only insofar as
              they watch your content promptly. A channel with 50K highly engaged subscribers whose videos
              average 60% retention will consistently outperform a channel with 500K subscribers whose videos
              average 20% retention. The algorithm rewards engagement quality, not audience quantity.
            </p>

            <ToolCallout
              icon="bx-git-compare"
              toolName="Channel Comparer"
              description="Measure your algorithmic performance signals against the top channels in your niche — CTR, retention rates, upload frequency, and engagement ratios all in one view."
              href="/tools/channel-comparer"
            />

            <h4>Session Optimization Strategies</h4>
            <p>
              YouTube measures not just how long people watch your videos, but how your videos affect overall
              platform session length. Videos that extend YouTube sessions receive algorithmic favor because
              they directly support YouTube's core business objective.
            </p>

            <VisualChecklist>
              <ChecklistItem>
                <i className="bx bx-check-circle" />
                <span className="check-text"><strong>Strategic End Screens</strong> — Recommend videos that naturally continue your viewer's journey, not just your most popular video</span>
              </ChecklistItem>
              <ChecklistItem>
                <i className="bx bx-check-circle" />
                <span className="check-text"><strong>Playlist Integration</strong> — Build intentional viewing sequences that encourage binge-watching your catalog — organize by topic, not upload date</span>
              </ChecklistItem>
              <ChecklistItem>
                <i className="bx bx-check-circle" />
                <span className="check-text"><strong>Series Development</strong> — Multi-part content that builds anticipation and drives return visits, creating habitual viewer behavior</span>
              </ChecklistItem>
              <ChecklistItem>
                <i className="bx bx-check-circle" />
                <span className="check-text"><strong>Community Posts</strong> — Keep subscribers engaged between uploads to maintain algorithmic momentum and subscriber activity signals</span>
              </ChecklistItem>
              <ChecklistItem>
                <i className="bx bx-check-circle" />
                <span className="check-text"><strong>In-Video References</strong> — Verbally mention other videos ("I covered this in [video]") — viewers who find value will seek out more of your content</span>
              </ChecklistItem>
            </VisualChecklist>

            <h3>Evergreen vs. Trending Content Balance</h3>
            <p>
              The most sustainable channels strategically mix content types. Trending content drives spikes
              of traffic while evergreen content provides compounding, long-tail views. Understanding the
              tradeoffs helps you plan a catalog that performs both immediately and years from now.
            </p>

            <SplitBox>
              <SplitPanel>
                <div className="panel-header">
                  <i className="bx bx-time-five" /> Trending Content
                </div>
                <ul>
                  <li>Drives immediate traffic spikes within 7–14 days</li>
                  <li>High CTR due to widespread interest and search volume</li>
                  <li>Short lifespan — traffic declines rapidly after peak</li>
                  <li>Builds algorithmic momentum and subscriber growth bursts</li>
                  <li>Requires fast production to capitalize on the trend window</li>
                  <li>Risk: being too late kills reach entirely</li>
                </ul>
              </SplitPanel>
              <SplitPanel>
                <div className="panel-header">
                  <i className="bx bx-infinite" /> Evergreen Content
                </div>
                <ul>
                  <li>Slow start but compounds views over months and years</li>
                  <li>Consistently ranks in search for permanent keywords</li>
                  <li>Long lifespan — many videos earn 80% of views after year 1</li>
                  <li>Builds authority and channel depth in your niche</li>
                  <li>Can be produced any time — no urgency premium</li>
                  <li>The foundation of a sustainable catalog strategy</li>
                </ul>
              </SplitPanel>
            </SplitBox>

            <p>
              The ideal mix for most channels is roughly 70% evergreen, 30% trending. Pure evergreen channels
              grow slowly but sustainably — they're essentially building a search-traffic asset that pays
              dividends indefinitely. Pure trending channels ride spikes but struggle to build a returning
              audience since viewers come for the topic, not the creator. The 70/30 blend builds lasting
              authority while staying culturally relevant. As your channel matures, your evergreen backlog
              becomes an increasingly valuable moat that new entrants can't easily replicate.
            </p>

            <h3>Competitive Intelligence and Positioning</h3>
            <p>
              Advanced creators systematically study their competitive landscape to identify opportunities,
              understand audience preferences, and position their content strategically within their niche.
            </p>

            <DefinitionBox>
              <div className="term">Blue Ocean Content Strategy</div>
              <div className="definition">
                Creating content in underserved niches or approaching popular topics from unique angles
                that face less direct competition. Study the top channels in your niche — find the 20%
                of topics that drive 80% of their views, then find the angles they haven't covered.
                That intersection is your competitive edge.
              </div>
            </DefinitionBox>

            <h3>Cross-Platform Audience Development</h3>
            <p>
              Advanced creators develop audiences across multiple platforms while using YouTube as their
              primary content hub. This provides audience diversification, multiple traffic sources,
              and increased monetization opportunities across each platform's native formats.
            </p>

            <PlatformGrid>
              <PlatformCard>
                <i className="bx bxl-twitter platform-icon" />
                <div className="platform-name">X / Twitter</div>
                <div className="platform-use">Real-time commentary, industry hot takes, launch announcements</div>
              </PlatformCard>
              <PlatformCard>
                <i className="bx bxl-linkedin platform-icon" />
                <div className="platform-name">LinkedIn</div>
                <div className="platform-use">Professional insights, B2B content, industry analysis</div>
              </PlatformCard>
              <PlatformCard>
                <i className="bx bxl-instagram platform-icon" />
                <div className="platform-name">Instagram</div>
                <div className="platform-use">Visual content, Reels, behind-the-scenes lifestyle</div>
              </PlatformCard>
              <PlatformCard>
                <i className="bx bxl-tiktok platform-icon" />
                <div className="platform-name">TikTok</div>
                <div className="platform-use">Short-form clips, trending sounds, top-of-funnel discovery</div>
              </PlatformCard>
              <PlatformCard>
                <i className="bx bxl-discord platform-icon" />
                <div className="platform-name">Discord</div>
                <div className="platform-use">Deep community building, direct fan relationships</div>
              </PlatformCard>
              <PlatformCard>
                <i className="bx bx-envelope platform-icon" />
                <div className="platform-name">Email List</div>
                <div className="platform-use">Platform-independent traffic, highest conversion rate</div>
              </PlatformCard>
            </PlatformGrid>

            <p>
              The key to cross-platform distribution is repurposing, not recreating. A 15-minute YouTube video
              contains roughly five 60-second clips for TikTok or Instagram Reels, three Twitter threads worth
              of insights, and one LinkedIn deep-dive post. Tools like CapCut or Descript make this extraction
              fast. The most efficient creators build a content engine where one YouTube video generates a full
              week of content across all platforms without doubling their production time.
            </p>

            <ToolCallout
              icon="bx-link"
              toolName="Subscribe Link Generator"
              description="Create a custom subscribe URL to share across all your social platforms — it takes visitors directly to a pre-prompted subscribe confirmation, boosting conversion from external traffic."
              href="/tools/subscribe-link-generator"
            />

            <h3>Batch Content Production System</h3>
            <p>
              The most consistent creators don't rely on inspiration — they use systematic batch production
              to build a content buffer that absorbs life events, creative slumps, and busy periods without
              breaking upload consistency.
            </p>

            <StepFlow>
              <StepFlowItem>
                <div className="step-num">1</div>
                <div className="step-body">
                  <div className="step-title">Ideation Sprint (Monthly)</div>
                  <p className="step-desc">Set aside 2–3 hours per month to generate 20–30 video ideas using keyword research, audience questions, competitor gaps, and trending topics. Group related ideas into series or themes.</p>
                </div>
              </StepFlowItem>
              <StepFlowItem>
                <div className="step-num">2</div>
                <div className="step-body">
                  <div className="step-title">Scripting Block (Weekly)</div>
                  <p className="step-desc">Write 2–3 scripts or outlines in a single focused session. Batching writing reduces context-switching costs. Use a consistent template: hook → structure → key points → CTA.</p>
                </div>
              </StepFlowItem>
              <StepFlowItem>
                <div className="step-num">3</div>
                <div className="step-body">
                  <div className="step-title">Filming Day</div>
                  <p className="step-desc">Film 3–5 videos in a single session. Change shirt between takes for visual variety if needed. One filming day can produce 3–4 weeks of content — dramatically more efficient than filming one video at a time.</p>
                </div>
              </StepFlowItem>
              <StepFlowItem>
                <div className="step-num">4</div>
                <div className="step-body">
                  <div className="step-title">Edit & Schedule Queue</div>
                  <p className="step-desc">Edit and prepare a full batch, then schedule all videos to publish at optimal times. Maintaining a 2–4 week buffer eliminates the anxiety of weekly deadlines and protects upload consistency through life's disruptions.</p>
                </div>
              </StepFlowItem>
            </StepFlow>

            <p>
              The biggest productivity gain in batch production comes from eliminating the mental overhead of
              "what do I film today?" When that decision is made in advance during an ideation sprint, your
              filming days become purely execution — no wasted time staring at a blank page. Creators who film
              one video at a time spend nearly as much time on mental preparation as on actual production.
              Batching eliminates that overhead and creates a compounding efficiency advantage over time.
            </p>

            <h3>Data-Driven A/B Testing Framework</h3>
            <p>
              Advanced creators use comprehensive data analysis to guide content decisions rather than
              relying on intuition. This systematic testing approach compounds improvements much faster
              than working on instinct alone.
            </p>

            <StepFlow>
              <StepFlowItem>
                <div className="step-num">1</div>
                <div className="step-body">
                  <div className="step-title">Form a Hypothesis</div>
                  <p className="step-desc">Identify one specific variable to test — thumbnail style, title format, video length, or upload time. Write down your prediction before testing to prevent post-hoc rationalization of results.</p>
                </div>
              </StepFlowItem>
              <StepFlowItem>
                <div className="step-num">2</div>
                <div className="step-body">
                  <div className="step-title">Run the Test</div>
                  <p className="step-desc">Create comparable content differing only in the variable being tested. Allow each test at least 2 weeks and 1,000+ impressions before drawing conclusions — early data is always noisy.</p>
                </div>
              </StepFlowItem>
              <StepFlowItem>
                <div className="step-num">3</div>
                <div className="step-body">
                  <div className="step-title">Measure & Document</div>
                  <p className="step-desc">Compare CTR, average view duration, and subscriber conversion rate. Document findings in a running testing log — this becomes your personalized playbook that compounds in value over time.</p>
                </div>
              </StepFlowItem>
              <StepFlowItem>
                <div className="step-num">4</div>
                <div className="step-body">
                  <div className="step-title">Apply and Iterate</div>
                  <p className="step-desc">Apply winning patterns to future content and begin the next test immediately. Creators who test systematically improve far faster than those relying on instinct — the performance gap compounds every month.</p>
                </div>
              </StepFlowItem>
            </StepFlow>

            <KeyTakeaway>
              <i className="bx bx-bulb" />
              <p>
                <strong>Authority building compounds over time.</strong> Consistent, high-quality content that
                provides unique insights leads to increased speaking opportunities, consulting work, and higher
                earning potential across every monetization method — the longer you play, the more the advantages stack.
              </p>
            </KeyTakeaway>

            <ToolCallout
              icon="bx-trophy"
              toolName="Outlier Finder"
              description="Identify which videos in your niche are dramatically outperforming expectations — then reverse-engineer what made them take off to inform your next content decisions."
              href="/tools/outlier-finder"
            />
          </ContentSection>
        );

      default:
        return null;
    }
  };

  return (
    <Container>
      <ContentWrapper>
        <BackButton onClick={() => navigate('/')}>
          <i className="bx bx-arrow-back"></i>
          Back to Home
        </BackButton>

        <Header>
          <Title>YouTube Education Center</Title>
          <Subtitle>
            Comprehensive guides, tutorials, and resources to help you master YouTube creation,
            analytics, optimization, and monetization. Everything you need to build a successful channel.
          </Subtitle>
        </Header>

        <TabNav>
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              <i className={`bx ${tab.icon}`}></i>
              {tab.name}
            </TabButton>
          ))}
        </TabNav>

        {renderContent()}
      </ContentWrapper>
    </Container>
  );
};
