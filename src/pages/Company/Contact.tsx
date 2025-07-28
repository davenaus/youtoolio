// src/pages/Company/Contact.tsx
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
  max-width: 600px;
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

const ContactCard = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 3rem;
  text-align: center;
  margin-bottom: 2rem;

  .contact-icon {
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
    margin-bottom: 2rem;
  }
`;

const EmailButton = styled.button`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
  color: white;
  border: none;
  padding: 1.25rem 2.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 auto;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(185, 28, 28, 0.4);
  }

  i {
    font-size: 1.3rem;
  }
`;

const EmailDisplay = styled.div`
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 1rem;
  margin: 1.5rem 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  .email-text {
    color: ${({ theme }) => theme.colors.text.primary};
    font-family: monospace;
    font-size: 1.1rem;
  }

  .copy-button {
    background: ${({ theme }) => theme.colors.red4};
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 0.2s ease;

    &:hover {
      background: ${({ theme }) => theme.colors.red5};
    }
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const InfoCard = styled.div`
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;
  text-align: center;

  .info-icon {
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

  h3 {
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

export const Contact: React.FC = () => {
  const navigate = useNavigate();
  const emailAddress = 'youtool.io.business@gmail.com';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(emailAddress);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  };

  const openEmailClient = () => {
    window.open(`mailto:${emailAddress}?subject=Hello from YouTool`);
  };

  return (
    <Container>
      <ContentWrapper>
        <BackButton onClick={() => navigate('/')}>
          <i className="bx bx-arrow-back"></i>
          Back to Home
        </BackButton>

        <Header>
          <Title>Contact Us</Title>
          <Subtitle>
            Have a question, suggestion, or just want to say hello? We'd love to hear from you!
          </Subtitle>
        </Header>

        <ContactCard>
          <div className="contact-icon">
            <i className="bx bx-envelope"></i>
          </div>
          
          <h2>Get in Touch</h2>
          <p>
            We're here to help! Whether you have technical questions, feature requests, 
            feedback, or just want to chat about YouTube analytics, feel free to reach out.
          </p>

          <EmailDisplay>
            <span className="email-text">{emailAddress}</span>
            <button className="copy-button" onClick={copyToClipboard}>
              Copy
            </button>
          </EmailDisplay>

          <EmailButton onClick={openEmailClient}>
            <i className="bx bx-send"></i>
            Open Email Client
          </EmailButton>
        </ContactCard>

        <InfoGrid>
          <InfoCard>
            <div className="info-icon">
              <i className="bx bx-time-five"></i>
            </div>
            <h3>Response Time</h3>
            <p>We typically respond within 24-48 hours during business days.</p>
          </InfoCard>

          <InfoCard>
            <div className="info-icon">
              <i className="bx bx-support"></i>
            </div>
            <h3>Support Hours</h3>
            <p>Monday - Friday, 9 AM - 6 PM EST. We're a small team but we care about every message!</p>
          </InfoCard>

          <InfoCard>
            <div className="info-icon">
              <i className="bx bx-chat"></i>
            </div>
            <h3>What to Include</h3>
            <p>Include your browser, the tool you were using, and any error messages for faster support.</p>
          </InfoCard>

          <InfoCard>
            <div className="info-icon">
              <i className="bx bx-bulb"></i>
            </div>
            <h3>Feature Requests</h3>
            <p>Got an idea for a new tool or feature? We love hearing from creators about what they need!</p>
          </InfoCard>
        </InfoGrid>
      </ContentWrapper>
    </Container>
  );
};
