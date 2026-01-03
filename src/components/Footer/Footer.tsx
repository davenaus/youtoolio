// src/components/Footer/Footer.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background: ${({ theme }) => theme.colors.dark1};
  border-top: 1px solid ${({ theme }) => theme.colors.dark5};
  padding: 3rem 0 1rem 0;
  margin-top: 4rem;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 3rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const FooterSection = styled.div`
  h4 {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  p {
    color: ${({ theme }) => theme.colors.text.muted};
    line-height: 1.6;
    margin-bottom: 1rem;
  }
`;

const FooterLinks = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    margin-bottom: 0.5rem;
  }

  a {
    color: ${({ theme }) => theme.colors.text.muted};
    text-decoration: none;
    transition: color 0.2s ease;
    cursor: pointer;
    display: inline-block;
    padding: 0.375rem 0;
    min-height: 44px;
    display: flex;
    align-items: center;

    &:hover {
      color: ${({ theme }) => theme.colors.red4};
    }
  }

  @media (max-width: 768px) {
    li {
      margin-bottom: 0.75rem;
    }
  }
`;



const FooterBottom = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.dark5};
  padding-top: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const Copyright = styled.div`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.9rem;
  flex: 1;
`;

const LegalLinks = styled.div`
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: center;
    gap: 1.5rem;
  }

  @media (max-width: 480px) {
    gap: 1rem;
    flex-direction: column;
    align-items: center;
  }

  a {
    color: ${({ theme }) => theme.colors.text.muted};
    text-decoration: none;
    font-size: 0.9rem;
    transition: color 0.2s ease;
    cursor: pointer;
    padding: 0.5rem 0;
    min-height: 44px;
    display: flex;
    align-items: center;

    &:hover {
      color: ${({ theme }) => theme.colors.red4};
    }
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;

  img {
    height: 32px;
    width: auto;
  }
`;

export const Footer: React.FC = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer>
      <FooterContent>
        <FooterGrid>
          <FooterSection>
            <Logo>
              <img
                src="https://64.media.tumblr.com/e000461398dfaa9247cc9db6eca187a2/0e01452f9f6dd974-6b/s2048x3072/0457337859cea0729cdfee1d7a9407e25f8f5cca.png"
                alt="YouTool Logo"
              />
            </Logo>
            <p>
              Professional-grade YouTube analytics and optimization tools to help creators 
              understand their performance, grow their audience, and succeed on the platform.
            </p>

          </FooterSection>

          <FooterSection>
            <h4>Tools</h4>
            <FooterLinks>
              <li><a onClick={() => navigate('/tools/video-analyzer')}>Video Analyzer</a></li>
              <li><a onClick={() => navigate('/tools/channel-analyzer')}>Channel Analyzer</a></li>
              <li><a onClick={() => navigate('/tools/keyword-analyzer')}>Keyword Analyzer</a></li>
              <li><a onClick={() => navigate('/tools/tag-generator')}>Tag Generator</a></li>
              <li><a onClick={() => navigate('/tools/thumbnail-tester')}>Thumbnail Tester</a></li>
              <li><a onClick={() => navigate('/tools')}>View All Tools</a></li>
            </FooterLinks>
          </FooterSection>

          <FooterSection>
            <h4>Resources</h4>
            <FooterLinks>
              <li><a onClick={() => navigate('/blog')}>Blog</a></li>
              <li><a onClick={() => navigate('/education')}>Education Center</a></li>
              <li><a onClick={() => navigate('/glossary')}>YouTube Glossary</a></li>
              <li><a onClick={() => navigate('/guides')}>Creator Guides</a></li>
              <li><a onClick={() => navigate('/help')}>Help Center</a></li>
              <li><a onClick={() => navigate('/changelog')}>Changelog</a></li>
            </FooterLinks>
          </FooterSection>

          <FooterSection>
            <h4>Company</h4>
            <FooterLinks>
              <li><a onClick={() => navigate('/about')}>About Us</a></li>
              <li><a href="mailto:youtool.io.business@gmail.com">Contact</a></li>
              <li><a onClick={() => navigate('/careers')}>Careers</a></li>
              <li><a onClick={() => navigate('/press')}>Press Kit</a></li>
              <li><a onClick={() => navigate('/partnerships')}>Partnerships</a></li>
            </FooterLinks>
          </FooterSection>
        </FooterGrid>

        <FooterBottom>
          <Copyright>
            © {currentYear} All rights reserved. Made with ❤️ for creators.
          </Copyright>
          <LegalLinks>
            <a onClick={() => navigate('/privacy-policy')}>Privacy Policy</a>
            <a onClick={() => navigate('/terms-of-service')}>Terms of Service</a>
            <a onClick={() => navigate('/cookie-policy')}>Cookie Policy</a>
            <a onClick={() => navigate('/data-usage')}>Data Usage</a>
          </LegalLinks>
        </FooterBottom>
      </FooterContent>
    </FooterContainer>
  );
};