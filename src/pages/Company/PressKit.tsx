// src/pages/Company/PressKit.tsx
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

const Section = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 2rem;
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
    margin: 1.5rem 0 1rem 0;
  }

  p {
    color: ${({ theme }) => theme.colors.text.secondary};
    line-height: 1.7;
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

const LogoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
`;

const LogoCard = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 0;
  overflow: hidden;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }

  a {
    display: block;
    text-decoration: none;
    color: inherit;
  }

  .logo-preview {
    width: 100%;
    height: 200px;
    background: ${({ theme }) => theme.colors.dark2};
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.dark5};

    img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
  }

  h4 {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1.1rem;
    font-weight: 600;
    margin: 1.5rem 0 0.5rem 0;
    padding: 0 1.5rem;
  }

  p {
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: 0.9rem;
    margin: 0 0 1.5rem 0;
    padding: 0 1.5rem;
  }
`;

const DownloadButton = styled.div`
  background: ${({ theme }) => theme.colors.dark4};
  color: ${({ theme }) => theme.colors.text.primary};
  border-top: 1px solid ${({ theme }) => theme.colors.dark5};
  padding: 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background: ${({ theme }) => theme.colors.red4};
    color: white;
  }

  i {
    font-size: 1.1rem;
  }
`;

const FactSheet = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin: 1.5rem 0;
`;

const FactCard = styled.div`
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 1.5rem;
  text-align: center;

  .fact-number {
    font-size: 2rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.red4};
    margin-bottom: 0.5rem;
  }

  .fact-label {
    color: ${({ theme }) => theme.colors.text.muted};
    font-size: 0.9rem;
  }
`;

const ContactSection = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red1}, ${({ theme }) => theme.colors.red2});
  border: 1px solid ${({ theme }) => theme.colors.red3};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 2rem;
  text-align: center;

  h3 {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  p {
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: 1.5rem;
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
  margin: 0 auto;

  &:hover {
    transform: translateY(-2px);
  }
`;

export const PressKit: React.FC = () => {
  const navigate = useNavigate();

  const handleDownload = (type: string) => {
    // In a real implementation, you would provide actual download links
    console.log(`Downloading ${type} logo`);
    // For now, we'll just show an alert since we don't have actual files
    alert(`${type} logo download would start here. Please contact us for actual press materials.`);
  };

  return (
    <Container>
      <ContentWrapper>
        <BackButton onClick={() => navigate('/')}>
          <i className="bx bx-arrow-back"></i>
          Back to Home
        </BackButton>

        <Header>
          <Title>Press Kit</Title>
          <Subtitle>
            Media resources, company information, and brand assets for press and partners.
          </Subtitle>
        </Header>

        <Section>
          <h2>
            <i className="bx bx-info-circle"></i>
            About YouTool
          </h2>
          <p>
            YouTool is a toolkit platform providing professional-grade YouTube analytics and optimization 
            tools to creators of all sizes. Founded by creators for creators, our mission is to 
            democratize access to powerful analytics tools that were previously only available 
            to large channels with significant budgets.
          </p>
          
          <h3>Key Facts</h3>
          <FactSheet>
            <FactCard>
              <div className="fact-number">50K+</div>
              <div className="fact-label">Videos Analyzed</div>
            </FactCard>
            <FactCard>
              <div className="fact-number">1K+</div>
              <div className="fact-label">Creators Helped</div>
            </FactCard>
          </FactSheet>

          <h3>What We Offer</h3>
          <ul>
            <li>Video performance analysis and optimization recommendations</li>
            <li>Channel analytics and growth pattern identification</li>
            <li>Keyword research and SEO optimization tools</li>
            <li>Thumbnail testing and A/B comparison features</li>
            <li>Comment analysis and engagement insights</li>
            <li>Competitor analysis and industry benchmarking</li>
          </ul>
        </Section>

        <Section>
          <h2>
            <i className="bx bx-image"></i>
            Brand Assets
          </h2>
          <p>
            Download our logo and brand assets for use in press articles, partnerships, and promotional materials.
          </p>

          <LogoGrid>
            <LogoCard>
              <a
                href="https://64.media.tumblr.com/e000461398dfaa9247cc9db6eca187a2/0e01452f9f6dd974-6b/s2048x3072/0457337859cea0729cdfee1d7a9407e25f8f5cca.png"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="logo-preview">
                  <img
                    src="https://64.media.tumblr.com/e000461398dfaa9247cc9db6eca187a2/0e01452f9f6dd974-6b/s2048x3072/0457337859cea0729cdfee1d7a9407e25f8f5cca.png"
                    alt="YouTool Logo"
                  />
                </div>
                <h4>YouTool Logo</h4>
                <p>High resolution PNG</p>
                <DownloadButton>
                  <i className="bx bx-download"></i>
                  Open Full Size
                </DownloadButton>
              </a>
            </LogoCard>
          </LogoGrid>
        </Section>

        <ContactSection>
          <h3>Media Contact</h3>
          <p>
            For press inquiries, interviews, additional materials, or questions about YouTool, 
            please reach out to our team. We're happy to provide additional information, 
            quotes, or arrange interviews.
          </p>
          <ContactButton onClick={() => window.open('mailto:youtool.io.business@gmail.com?subject=Press Inquiry')}>
            <i className="bx bx-envelope"></i>
            Contact Press Team
          </ContactButton>
        </ContactSection>
      </ContentWrapper>
    </Container>
  );
};
