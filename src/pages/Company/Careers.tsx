// src/pages/Company/Careers.tsx
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
  max-width: 700px;
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

const StatusCard = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 3rem;
  text-align: center;
  margin-bottom: 2rem;

  .status-icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
    border-radius: ${({ theme }) => theme.borderRadius.full};
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 2rem auto;
    color: white;
    font-size: 2rem;
  }

  h2 {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1.8rem;
    margin-bottom: 1rem;
  }

  p {
    color: ${({ theme }) => theme.colors.text.secondary};
    line-height: 1.6;
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
  }
`;

const FutureSection = styled.div`
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 2rem;
  margin: 2rem 0;

  h3 {
    color: ${({ theme }) => theme.colors.red4};
    font-size: 1.5rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    i {
      font-size: 1.3rem;
    }
  }

  p {
    color: ${({ theme }) => theme.colors.text.secondary};
    line-height: 1.6;
    margin-bottom: 1rem;
  }

  ul {
    color: ${({ theme }) => theme.colors.text.secondary};
    line-height: 1.6;
    padding-left: 1.5rem;
    margin-bottom: 1rem;

    li {
      margin-bottom: 0.5rem;
    }
  }
`;

const ValuesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
`;

const ValueCard = styled.div`
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;
  text-align: center;

  .value-icon {
    width: 50px;
    height: 50px;
    background: ${({ theme }) => theme.colors.red3};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem auto;
    color: white;
    font-size: 1.2rem;
  }

  h4 {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }

  p {
    color: ${({ theme }) => theme.colors.text.muted};
    font-size: 0.9rem;
    line-height: 1.5;
    margin: 0;
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

export const Careers: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <ContentWrapper>
        <BackButton onClick={() => navigate('/')}>
          <i className="bx bx-arrow-back"></i>
          Back to Home
        </BackButton>

        <Header>
          <Title>Careers</Title>
          <Subtitle>
            Join our mission to democratize YouTube analytics for creators worldwide.
          </Subtitle>
        </Header>

        <StatusCard>
          <div className="status-icon">
            <i className="bx bx-briefcase"></i>
          </div>
          
          <h2>No Open Positions</h2>
          <p>
            We're currently a small, focused team and don't have any open positions at this time. 
            However, we're always interested in connecting with talented people who share our passion 
            for helping creators succeed.
          </p>
          <p>
            <strong>Interested in future opportunities?</strong> Send us your information and we'll 
            keep you in mind as we grow!
          </p>
        </StatusCard>

        <FutureSection>
          <h3>
            <i className="bx bx-rocket"></i>
            What We're Looking For (Future)
          </h3>
          <p>
            As YouTool grows, we're always thinking about the kind of people we'd love to work with. 
            Here are the types of roles and skills we value:
          </p>
          <ul>
            <li><strong>Frontend Developers:</strong> React, TypeScript, modern web technologies</li>
            <li><strong>Backend Engineers:</strong> API development, data processing, scalability</li>
            <li><strong>Data Scientists:</strong> YouTube analytics, machine learning, insights generation</li>
            <li><strong>Product Designers:</strong> UX/UI design for creator tools and analytics dashboards</li>
            <li><strong>Developer Relations:</strong> Community building, technical content creation</li>
          </ul>
        </FutureSection>





        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <p style={{ color: '#9CA3AF', marginBottom: '1rem' }}>
            Even if we don't have open positions, we'd love to hear from passionate people 
            who want to help creators succeed.
          </p>
          
          <ContactButton onClick={() => window.open('mailto:youtool.io.business@gmail.com?subject=Future Career Opportunities')}>
            <i className="bx bx-envelope"></i>
            Stay in Touch
          </ContactButton>
        </div>
      </ContentWrapper>
    </Container>
  );
};
