// src/pages/Legal/PrivacyPolicy.tsx
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
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
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

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const LastUpdated = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 1rem;
  margin-bottom: 2rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Content = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 2rem;
  line-height: 1.7;

  h2 {
    color: ${({ theme }) => theme.colors.red4};
    font-size: 1.5rem;
    margin: 2rem 0 1rem 0;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid ${({ theme }) => theme.colors.dark5};

    &:first-child {
      margin-top: 0;
    }
  }

  h3 {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1.2rem;
    margin: 1.5rem 0 0.75rem 0;
  }

  p {
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-bottom: 1rem;
  }

  ul, ol {
    margin: 1rem 0 1rem 1.5rem;
    
    li {
      color: ${({ theme }) => theme.colors.text.secondary};
      margin-bottom: 0.5rem;
    }
  }

  strong {
    color: ${({ theme }) => theme.colors.text.primary};
  }

  a {
    color: ${({ theme }) => theme.colors.red4};
    text-decoration: underline;

    &:hover {
      color: ${({ theme }) => theme.colors.red5};
    }
  }
`;

export const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <ContentWrapper>
        <BackButton onClick={() => navigate('/')}>
          <i className="bx bx-arrow-back"></i>
          Back to Home
        </BackButton>

        <Header>
          <Title>Privacy Policy</Title>
          <Subtitle>How we collect, use, and protect your information</Subtitle>
        </Header>

        <LastUpdated>
          <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </LastUpdated>

        <Content>
          <h2>Introduction</h2>
          <p>
            Welcome to YouTool.io ("we," "our," or "us"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our YouTube analytics tools. We are committed to protecting your privacy and ensuring transparency about our data practices.
          </p>

          <h2>Information We Collect</h2>
          
          <h3>Information You Provide Directly</h3>
          <ul>
            <li><strong>YouTube URLs and IDs:</strong> When you use our tools, you provide YouTube video URLs, channel URLs, or IDs for analysis</li>
            <li><strong>Search Queries:</strong> Keywords and search terms you enter into our tools</li>
            <li><strong>Tool Usage Data:</strong> Information about which tools you use and how you interact with them</li>
          </ul>

          <h3>Information Collected Automatically</h3>
          <ul>
            <li><strong>Device Information:</strong> Browser type, operating system, screen resolution, and device identifiers</li>
            <li><strong>Usage Analytics:</strong> Pages visited, time spent on site, click patterns, and feature usage</li>
            <li><strong>Technical Data:</strong> IP address, user agent, referral URLs, and session information</li>
            <li><strong>Cookies and Local Storage:</strong> Preferences, session data, and analytics information</li>
          </ul>

          <h3>Third-Party Data</h3>
          <ul>
            <li><strong>YouTube API Data:</strong> Public information retrieved from YouTube's API including video metadata, channel statistics, and public comments</li>
            <li><strong>Analytics Services:</strong> Data from Google Analytics, Vercel Analytics, and other measurement tools</li>
          </ul>

          <h2>How We Use Your Information</h2>
          
          <h3>Tool Functionality</h3>
          <ul>
            <li>Analyze YouTube videos, channels, and playlists you request</li>
            <li>Generate SEO insights, tags, and optimization recommendations</li>
            <li>Provide analytics and performance metrics</li>
            <li>Save your search history for convenience (stored locally)</li>
          </ul>

          <h3>Service Improvement</h3>
          <ul>
            <li>Monitor and analyze usage patterns to improve our tools</li>
            <li>Identify and fix technical issues</li>
            <li>Develop new features based on user behavior</li>
            <li>Optimize website performance and user experience</li>
          </ul>

          <h3>Communication</h3>
          <ul>
            <li>Respond to user inquiries and support requests</li>
            <li>Send important service updates and announcements</li>
            <li>Provide technical support and troubleshooting</li>
          </ul>

          <h2>Data Sharing and Disclosure</h2>
          
          <p>We do not sell, trade, or rent your personal information to third parties. We may share information in the following limited circumstances:</p>

          <h3>Service Providers</h3>
          <ul>
            <li><strong>YouTube API:</strong> We use YouTube's API to retrieve public data for analysis</li>
            <li><strong>Analytics Providers:</strong> Google Analytics, Vercel Analytics for usage statistics</li>
            <li><strong>Hosting Services:</strong> Vercel for website hosting and performance</li>
          </ul>

          <h3>Legal Requirements</h3>
          <p>We may disclose information if required by law, court order, or government request, or to protect our rights, property, or safety.</p>

          <h2>Data Retention</h2>
          <ul>
            <li><strong>Search History:</strong> Stored locally in your browser and can be cleared at any time</li>
            <li><strong>Analytics Data:</strong> Aggregated usage data retained for service improvement</li>
            <li><strong>YouTube API Data:</strong> Not permanently stored; retrieved in real-time for analysis</li>
            <li><strong>Session Data:</strong> Cleared when you close your browser or end your session</li>
          </ul>

          <h2>Your Rights and Choices</h2>
          
          <h3>Access and Control</h3>
          <ul>
            <li>Clear your local search history through browser settings</li>
            <li>Disable cookies through your browser preferences</li>
            <li>Opt out of analytics tracking using browser extensions</li>
            <li>Contact us to request information about data we may have collected</li>
          </ul>



          <h2>Security Measures</h2>
          <p>
            We implement appropriate technical and organizational security measures to protect your information, including:
          </p>
          <ul>
            <li>HTTPS encryption for all data transmission</li>
            <li>Secure hosting infrastructure with Vercel</li>
            <li>Regular security updates and monitoring</li>
            <li>Limited data collection and retention practices</li>
            <li>No storage of sensitive personal information</li>
          </ul>

          <h2>Third-Party Services</h2>
          
          <h3>YouTube API Services</h3>
          <p>
            Our use of YouTube API Services is governed by the <a href="https://developers.google.com/youtube/terms/api-services-terms-of-service" target="_blank" rel="noopener noreferrer">YouTube API Services Terms of Service</a>. 
            We only access publicly available data and do not store personal information from YouTube.
          </p>

          <h3>Google Services</h3>
          <p>
            We use Google Analytics for website analytics. This service is governed by Google's Privacy Policy. 
            You can learn more about how Google uses data at <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a>.
          </p>

          <h2>Children's Privacy</h2>
          <p>
            Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. 
            If you become aware that a child has provided us with personal information, please contact us so we can delete such information.
          </p>

          <h2>International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws 
            and implement appropriate safeguards to protect your information.
          </p>

          <h2>Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and 
            updating the "Last Updated" date. Your continued use of our service after changes constitutes acceptance of the updated policy.
          </p>

          <h2>Contact Information</h2>
          <p>
            If you have any questions about this Privacy Policy or our data practices, please contact us at:
          </p>
          <ul>
            <li><strong>Email:</strong> youtool.io.business@gmail.com</li>
            <li><strong>Website:</strong> <a href="https://youtool.io">https://youtool.io</a></li>
          </ul>

          <h2>California Privacy Rights</h2>
          <p>
            If you are a California resident, you may have additional rights under the California Consumer Privacy Act (CCPA), including the right to 
            know what personal information we collect, the right to delete personal information, and the right to opt-out of the sale of personal information. 
            We do not sell personal information.
          </p>

          <h2>European Union Rights</h2>
          <p>
            If you are in the European Union, you may have additional rights under the General Data Protection Regulation (GDPR), including the right to 
            access, rectify, erase, restrict processing, and data portability. To exercise these rights, please contact us using the information provided above.
          </p>
        </Content>
      </ContentWrapper>
    </Container>
  );
};