// src/components/Footer/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
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
  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer>
      <FooterContent>
        <FooterGrid>
          <FooterSection>
            <Logo>
              <img
                src="/images/logo.png"
                alt="YouTool Logo"
                width="1135"
                height="200"
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
              <li><Link to="/tools/video-analyzer">Video Analyzer</Link></li>
              <li><Link to="/tools/channel-analyzer">Channel Analyzer</Link></li>
              <li><Link to="/tools/keyword-analyzer">Keyword Analyzer</Link></li>
              <li><Link to="/tools/tag-generator">Tag Generator</Link></li>
              <li><Link to="/tools/thumbnail-tester">Thumbnail Tester</Link></li>
              <li><Link to="/tools">View All Tools</Link></li>
            </FooterLinks>
          </FooterSection>

          <FooterSection>
            <h4>Resources</h4>
            <FooterLinks>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/education">Education Center</Link></li>
              <li><Link to="/glossary">YouTube Glossary</Link></li>
              <li><Link to="/guides">Creator Guides</Link></li>
              <li><Link to="/help">Help Center</Link></li>
              <li><Link to="/changelog">Changelog</Link></li>
            </FooterLinks>
          </FooterSection>

          <FooterSection>
            <h4>Company</h4>
            <FooterLinks>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/careers">Careers</Link></li>
              <li><Link to="/press">Press Kit</Link></li>
              <li><Link to="/partnerships">Partnerships</Link></li>
              <li><Link to="/login">Sign In</Link></li>
            </FooterLinks>
          </FooterSection>
        </FooterGrid>

        <FooterBottom>
          <Copyright>
            © {currentYear} All rights reserved. Made with ❤️ for creators.
          </Copyright>
          <LegalLinks>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-of-service">Terms of Service</Link>
            <Link to="/cookie-policy">Cookie Policy</Link>
            <Link to="/data-usage">Data Usage</Link>
          </LegalLinks>
        </FooterBottom>
      </FooterContent>
    </FooterContainer>
  );
};