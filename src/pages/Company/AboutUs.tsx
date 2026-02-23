// src/pages/Company/AboutUs.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { SEO } from '../../components/SEO/SEO';

const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.dark2};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 2rem 0 4rem;
`;

const ContentWrapper = styled.div`
  max-width: 900px;
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

  i {
    font-size: 1.2rem;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
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
  line-height: 1.6;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 2.5rem;
  margin-bottom: 2rem;

  h2 {
    color: ${({ theme }) => theme.colors.red4};
    font-size: 1.8rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    i {
      font-size: 1.5rem;
    }
  }

  h3 {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1.3rem;
    font-weight: 600;
    margin: 1.5rem 0 0.75rem;
  }

  p {
    color: ${({ theme }) => theme.colors.text.secondary};
    line-height: 1.8;
    margin-bottom: 1.25rem;
    font-size: 1.05rem;
  }

  ul {
    color: ${({ theme }) => theme.colors.text.secondary};
    line-height: 1.8;
    margin-bottom: 1.5rem;
    padding-left: 1.5rem;

    li {
      margin-bottom: 0.5rem;
    }
  }

  strong {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

// Founder profile card
const FounderCard = styled.div`
  display: flex;
  gap: 2rem;
  align-items: flex-start;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`;

const FounderImageWrapper = styled.div`
  flex-shrink: 0;
`;

const FounderImage = styled.img`
  width: 140px;
  height: 140px;
  border-radius: 50%;
  border: 3px solid ${({ theme }) => theme.colors.red4};
  object-fit: cover;
  display: block;

  @media (max-width: 640px) {
    width: 120px;
    height: 120px;
  }
`;

const FounderInfo = styled.div`
  flex: 1;
`;

const FounderName = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 0.25rem;
`;

const FounderRole = styled.p`
  color: ${({ theme }) => theme.colors.red4};
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem !important;
`;

const FounderBio = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.8;
  margin-bottom: 1rem !important;
  font-size: 1.05rem;
`;

const FounderLinks = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    justify-content: center;
  }
`;

const FounderLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 0.5rem 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.2s ease;

  i {
    font-size: 1.1rem;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.dark5};
    color: ${({ theme }) => theme.colors.text.primary};
    border-color: ${({ theme }) => theme.colors.red4};
  }
`;

const MissionBox = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red1}, ${({ theme }) => theme.colors.red2});
  border: 1px solid ${({ theme }) => theme.colors.red3};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 2rem;
  margin: 2rem 0;
  text-align: center;

  h3 {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1.5rem;
    margin-bottom: 1rem !important;
  }

  p {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1.1rem;
    line-height: 1.6;
    margin: 0 !important;
  }
`;

const BeliefsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
  margin: 1.5rem 0;
`;

const BeliefCard = styled.div`
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;

  i {
    font-size: 1.75rem;
    color: ${({ theme }) => theme.colors.red4};
    margin-bottom: 0.75rem;
    display: block;
  }

  h4 {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  p {
    color: ${({ theme }) => theme.colors.text.muted};
    font-size: 0.9rem;
    line-height: 1.6;
    margin: 0 !important;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
  margin: 1.5rem 0;
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;
  text-align: center;

  .stat-number {
    font-size: 2rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.red4};
    margin-bottom: 0.5rem;
  }

  .stat-label {
    color: ${({ theme }) => theme.colors.text.muted};
    font-size: 0.9rem;
  }
`;

const FreeBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
  color: white;
  padding: 0.5rem 1.25rem;
  border-radius: 30px;
  font-size: 0.9rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
`;

const ContactButton = styled.a`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  text-decoration: none;
  font-size: 1rem;

  &:hover {
    transform: translateY(-2px);
    opacity: 0.95;
  }

  i {
    font-size: 1.1rem;
  }
`;

export const AboutUs: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <SEO
        title="About YouTool.io — Built by a Creator, for Creators"
        description="YouTool.io was built by Austin Davenport, a creator and developer who wanted practical, data-driven tools to grow on YouTube without expensive subscriptions."
        canonical="https://youtool.io/about"
        schemaData={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Organization',
              'name': 'YouTool.io',
              'url': 'https://youtool.io',
              'description': 'Free YouTube analytics and optimization tools for creators of all sizes.',
              'founder': {
                '@type': 'Person',
                'name': 'Austin Davenport',
                'url': 'https://www.youtube.com/@AustinDavenport',
                'image': 'https://yt3.ggpht.com/BpSR5v0Op_iCKxtF-x-Nm8RZH1QGhNfkkredcl-nklbn6VJiEdTji7mRv2fZROJ2yLQib_6ZCA=s800-c-k-c0x00ffffff-no-rj',
                'sameAs': ['https://www.youtube.com/@AustinDavenport']
              }
            },
            {
              '@type': 'Person',
              'name': 'Austin Davenport',
              'url': 'https://www.youtube.com/@AustinDavenport',
              'image': 'https://yt3.ggpht.com/BpSR5v0Op_iCKxtF-x-Nm8RZH1QGhNfkkredcl-nklbn6VJiEdTji7mRv2fZROJ2yLQib_6ZCA=s800-c-k-c0x00ffffff-no-rj',
              'jobTitle': 'Founder',
              'worksFor': {
                '@type': 'Organization',
                'name': 'YouTool.io',
                'url': 'https://youtool.io'
              },
              'description': 'Creator, builder, and founder of YouTool.io. YouTube content creator turned developer who builds data-driven tools for YouTube growth.',
              'sameAs': ['https://www.youtube.com/@AustinDavenport']
            }
          ]
        }}
      />
      <ContentWrapper>
        <BackButton onClick={() => navigate('/')}>
          <i className="bx bx-arrow-back"></i>
          Back to Home
        </BackButton>

        <Header>
          <Title>About YouTool</Title>
          <Subtitle>
            Built by a creator who got tired of guessing. Designed for creators who want real answers.
          </Subtitle>
        </Header>

        {/* Founder Section */}
        <Card>
          <h2>
            <i className="bx bx-user"></i>
            Meet the Founder
          </h2>
          <FounderCard>
            <FounderImageWrapper>
              <FounderImage
                src="https://yt3.ggpht.com/BpSR5v0Op_iCKxtF-x-Nm8RZH1QGhNfkkredcl-nklbn6VJiEdTji7mRv2fZROJ2yLQib_6ZCA=s800-c-k-c0x00ffffff-no-rj"
                alt="Austin Davenport — Founder of YouTool.io"
                loading="lazy"
              />
            </FounderImageWrapper>
            <FounderInfo>
              <FounderName>Austin Davenport</FounderName>
              <FounderRole>Founder & Builder, YouTool.io</FounderRole>
              <FounderBio>
                I am Austin Davenport, a creator, builder, and the person behind YouTool.io.
              </FounderBio>
              <FounderBio>
                I did not start out trying to build software. I started as a YouTube creator who was curious
                about why some videos performed well and others did not. Over time, that curiosity turned into
                spreadsheets, experiments, pattern tracking, and eventually small tools I built for myself
                to better understand performance, packaging, and growth.
              </FounderBio>
              <FounderBio>
                YouTool.io grew out of that process. It was not designed in a boardroom. It came from the
                same frustrations most creators have: figuring out what is actually working in a niche, how
                to improve titles and thumbnails, and how to make better decisions without guessing. I wanted
                something practical and data driven, but simple enough to use consistently.
              </FounderBio>
              <FounderBio>
                My background includes video editing, analytics, and web development, and I try to combine
                all three when building tools. I care about clarity — not just more data, but useful insight
                that creators can apply immediately.
              </FounderBio>
              <FounderBio>
                I am still learning, testing, and refining the tools as I go. YouTool reflects that process.
                It is built step by step, shaped by real use, and focused on solving specific problems creators
                face every day.
              </FounderBio>
              <FounderLinks>
                <FounderLink
                  href="https://www.youtube.com/@AustinDavenport"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="bx bxl-youtube"></i>
                  YouTube Channel
                </FounderLink>
                <FounderLink
                  href="mailto:youtool.io.business@gmail.com"
                >
                  <i className="bx bx-envelope"></i>
                  Get in Touch
                </FounderLink>
              </FounderLinks>
            </FounderInfo>
          </FounderCard>
        </Card>

        {/* Mission Section */}
        <Card>
          <h2>
            <i className="bx bx-target-lock"></i>
            Our Mission
          </h2>
          <p>
            Great content creators should not be held back by expensive tools or lack of data insights.
            YouTool exists to give every creator — from brand-new channels to established ones — access
            to the kind of analysis that used to require a paid subscription or a data background.
          </p>

          <MissionBox>
            <h3>What We Stand For</h3>
            <p>
              Practical, data-driven tools that every YouTube creator can use right now — for free,
              without creating an account, and without needing to be a data scientist.
            </p>
          </MissionBox>

          <BeliefsGrid>
            <BeliefCard>
              <i className="bx bx-check-shield"></i>
              <h4>100% Free</h4>
              <p>Every tool on YouTool is completely free. No subscriptions, no paywalls, no upsells.</p>
            </BeliefCard>
            <BeliefCard>
              <i className="bx bx-user-x"></i>
              <h4>No Account Needed</h4>
              <p>Just paste your YouTube URL and get results. No sign-up, no login, no email required.</p>
            </BeliefCard>
            <BeliefCard>
              <i className="bx bx-lock"></i>
              <h4>Privacy-Focused</h4>
              <p>We use the public YouTube Data API. We do not store your channel data or personal information.</p>
            </BeliefCard>
            <BeliefCard>
              <i className="bx bx-cog"></i>
              <h4>Creator-First Design</h4>
              <p>Built from real creator frustrations, not theoretical features. Every tool solves a specific problem.</p>
            </BeliefCard>
          </BeliefsGrid>
        </Card>

        {/* How It Works / Data Section */}
        <Card>
          <h2>
            <i className="bx bx-data"></i>
            How YouTool Works
          </h2>
          <p>
            All of YouTool's tools are powered by the official <strong>YouTube Data API v3</strong>.
            This means the data you see — view counts, subscriber counts, video metadata, thumbnails,
            channel banners — comes directly from YouTube's own systems, the same API used by major platforms.
          </p>
          <p>
            We do not scrape YouTube. We do not store your channel data on our servers. When you
            analyze a video or channel, your request goes directly to YouTube's API, the result is
            displayed to you, and nothing is retained beyond your browser session.
          </p>
          <h3>Is This Compliant with YouTube's Terms of Service?</h3>
          <p>
            Yes. All tools use the official YouTube Data API v3 under Google's standard API terms.
            No scraping, no unauthorized data collection, no circumvention of YouTube's systems.
            The tools surface publicly available data — the same information visible on YouTube's own pages.
          </p>
        </Card>

        {/* Impact Section */}
        <Card>
          <h2>
            <i className="bx bx-bar-chart-alt-2"></i>
            Our Impact
          </h2>
          <p>
            YouTool started as a personal project and grew because creators kept sharing it. The tools
            work because they solve real, specific problems — not because of marketing.
          </p>

          <StatsGrid>
            <StatCard>
              <div className="stat-number">15+</div>
              <div className="stat-label">Free Tools</div>
            </StatCard>
            <StatCard>
              <div className="stat-number">50K+</div>
              <div className="stat-label">Videos Analyzed</div>
            </StatCard>
            <StatCard>
              <div className="stat-number">1K+</div>
              <div className="stat-label">Creators Helped</div>
            </StatCard>
          </StatsGrid>

          <FreeBadge>
            <i className="bx bx-check-circle"></i>
            Free for every creator — no sign-up required
          </FreeBadge>

          <p>
            Whether you are analyzing your first video or managing a channel with hundreds of uploads,
            YouTool gives you the same tools regardless of your size. There is no premium tier.
            Everything is free.
          </p>
        </Card>

        {/* Contact Section */}
        <Card>
          <h2>
            <i className="bx bx-envelope"></i>
            Get in Touch
          </h2>
          <p>
            Have a tool idea? Found a bug? Just want to say hello? I read every message.
            YouTool is shaped by creator feedback, and the best improvements have come from
            people who use the tools every day.
          </p>
          <p>
            You can also watch my YouTube channel to see how I use these tools in my own
            content strategy and channel growth process.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <ContactButton href="mailto:youtool.io.business@gmail.com?subject=Hello from a Fellow Creator">
              <i className="bx bx-envelope"></i>
              Email Austin
            </ContactButton>
            <ContactButton
              href="https://www.youtube.com/@AustinDavenport"
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: 'linear-gradient(135deg, #c00, #900)' }}
            >
              <i className="bx bxl-youtube"></i>
              Watch on YouTube
            </ContactButton>
          </div>
        </Card>
      </ContentWrapper>
    </Container>
  );
};
