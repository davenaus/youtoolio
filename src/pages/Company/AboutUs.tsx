// src/pages/Company/AboutUs.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.dark2};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 2rem 0;
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

const Content = styled.div`
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
    margin: 0rem 0 0rem 0;
  }

  p {
    color: ${({ theme }) => theme.colors.text.secondary};
    line-height: 1.7;
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
  }

  ul {
    color: ${({ theme }) => theme.colors.text.secondary};
    line-height: 1.7;
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
    margin-bottom: 1rem;
  }

  p {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1.1rem;
    line-height: 1.6;
    margin: 0;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
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

const ContactButton = styled.button`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 2rem auto 0 auto;

  &:hover {
    transform: translateY(-2px);
  }
`;

export const AboutUs: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <ContentWrapper>
        <BackButton onClick={() => navigate('/')}>
          <i className="bx bx-arrow-back"></i>
          Back to Home
        </BackButton>

        <Header>
          <Title>About YouTool</Title>
          <Subtitle>
            A small team with a big mission: making professional YouTube analytics accessible to every creator.
          </Subtitle>
        </Header>

        <Content>
          <h2>
            <i className="bx bx-heart"></i>
            Our Story
          </h2>
          <p>
            YouTool was born from a simple observation: the best YouTube analytics tools were either 
            expensive, complicated, or locked behind paywalls. As creators ourselves, we knew there 
            had to be a better way.
          </p>
          <p>
            We started as a small team of developers and YouTube enthusiasts who believed that 
            <strong> every creator deserves access to professional-grade analytics</strong>, regardless 
            of their budget or subscriber count. What began as a side project quickly grew into 
            something much bigger when we realized how many creators were struggling with the same challenges.
          </p>

          <MissionBox>
            <h3>Our Mission</h3>
            <p>
              To democratize YouTube analytics by providing powerful, professional-grade tools 
              that are accessible to creators of all sizes.
            </p>
          </MissionBox>

          <h3>What We Believe</h3>
          <p>We believe that great content creators shouldn't be held back by expensive tools or lack of data insights. That's why we've committed to keeping YouTool:</p>
          <ul>
            <li><strong>Easy to Use:</strong> Professional tools shouldn't require a degree to understand</li>
            <li><strong>Privacy-Focused:</strong> Your data belongs to you, not to us</li>
            <li><strong>Creator-First:</strong> Built by creators, for creators</li>
          </ul>

          <h3>Our Impact</h3>
          <p>
            Since launching, we've helped thousands of creators understand their performance, 
            optimize their content, and grow their channels. From first-time YouTubers to 
            established creators, our tools are used by people who are serious about growing 
            their audience and improving their craft.
          </p>

          <StatsGrid>
            <StatCard>
              <div className="stat-number">50K+</div>
              <div className="stat-label">Videos Analyzed</div>
            </StatCard>
            <StatCard>
              <div className="stat-number">1K+</div>
              <div className="stat-label">Creators Helped</div>
            </StatCard>
          </StatsGrid>

          <h3>Looking Forward</h3>
          <p>
            We're constantly working on new features, tools, and improvements based on feedback 
            from our community. Our roadmap is driven by what creators actually need, not what 
            we think they should want.
          </p>
          <p>
            If you have ideas, feedback, or just want to say hello, we'd love to hear from you. 
            After all, YouTool exists because of creators like you.
          </p>

          <ContactButton onClick={() => window.open('mailto:youtool.io.business@gmail.com?subject=Hello from a Fellow Creator')}>
            <i className="bx bx-envelope"></i>
            Get in Touch
          </ContactButton>
        </Content>
      </ContentWrapper>
    </Container>
  );
};
