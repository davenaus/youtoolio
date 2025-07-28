// src/pages/Legal/TermsOfService.tsx
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

const WarningBox = styled.div`
  background: ${({ theme }) => theme.colors.red1};
  border: 1px solid ${({ theme }) => theme.colors.red3};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 1rem;
  margin: 1rem 0;
  
  p {
    color: ${({ theme }) => theme.colors.text.primary};
    margin: 0;
  }
`;

export const TermsOfService: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <ContentWrapper>
        <BackButton onClick={() => navigate('/')}>
          <i className="bx bx-arrow-back"></i>
          Back to Home
        </BackButton>

        <Header>
          <Title>Terms of Service</Title>
          <Subtitle>Terms and conditions for using YouTool.io</Subtitle>
        </Header>

        <LastUpdated>
          <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </LastUpdated>

        <Content>
          <h2>Acceptance of Terms</h2>
          <p>
            By accessing and using YouTool.io ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. 
            These Terms of Service ("Terms") constitute a legally binding agreement between you and YouTool.io ("we," "us," or "our").
          </p>

          <WarningBox>
            <p>
              <strong>Important:</strong> By using our service, you acknowledge that you understand and agree to comply with YouTube's Terms of Service 
              and our usage guidelines. Misuse of our tools may result in immediate termination of service.
            </p>
          </WarningBox>

          <h2>Description of Service</h2>
          <p>
            YouTool.io provides analytics and research tools for YouTube content creators. Our service includes:
          </p>
          <ul>
            <li>Video and channel analytics tools</li>
            <li>SEO research and keyword analysis</li>
            <li>Content optimization recommendations</li>
            <li>Performance tracking and insights</li>
            <li>Educational resources for content creators</li>
          </ul>

          <h2>Acceptable Use Policy</h2>
          
          <h3>Permitted Uses</h3>
          <ul>
            <li><strong>Educational Purpose:</strong> Using our tools to learn about YouTube analytics and SEO</li>
            <li><strong>Content Research:</strong> Analyzing public data to understand content performance</li>
            <li><strong>Strategic Planning:</strong> Using insights to improve your own content strategy</li>
            <li><strong>Competitive Analysis:</strong> Studying public metrics for market research</li>
          </ul>

          <h3>Prohibited Uses</h3>
          <ul>
            <li><strong>Spam or Harassment:</strong> Using our tools to spam, harass, or abuse other users</li>
            <li><strong>Copyright Infringement:</strong> Using downloaded content without proper authorization</li>
            <li><strong>API Abuse:</strong> Excessive requests that may violate YouTube's rate limits</li>
            <li><strong>Commercial Redistribution:</strong> Selling or redistributing data obtained through our tools</li>
            <li><strong>Automated Scraping:</strong> Using bots or automated systems to abuse our service</li>
            <li><strong>Malicious Intent:</strong> Using our tools for illegal or harmful purposes</li>
          </ul>

          <h2>YouTube API Compliance</h2>
          <p>
            Our service uses YouTube's API and is bound by YouTube's Terms of Service. By using our service, you agree to:
          </p>
          <ul>
            <li>Comply with the <a href="https://developers.google.com/youtube/terms/api-services-terms-of-service" target="_blank" rel="noopener noreferrer">YouTube API Services Terms of Service</a></li>
            <li>Only access publicly available information</li>
            <li>Respect content creators' rights and privacy</li>
            <li>Use data responsibly and ethically</li>
          </ul>

          <h2>User Responsibilities</h2>
          
          <h3>Account Security</h3>
          <ul>
            <li>You are responsible for maintaining the security of your access to our service</li>
            <li>Report any unauthorized use immediately</li>
            <li>Keep your browser and security software updated</li>
          </ul>

          <h3>Content Usage</h3>
          <ul>
            <li>Ensure you have proper rights to analyze any content you submit</li>
            <li>Respect intellectual property rights of content creators</li>
            <li>Use downloaded data in compliance with applicable laws</li>
            <li>Verify accuracy of any data before making business decisions</li>
          </ul>

          <h2>Data and Privacy</h2>
          <p>
            Your privacy is important to us. Our data practices are governed by our Privacy Policy. Key points:
          </p>
          <ul>
            <li>We only collect data necessary for service functionality</li>
            <li>We do not store personal YouTube account information</li>
            <li>Search history is stored locally in your browser</li>
            <li>We use analytics to improve our service</li>
          </ul>

          <h2>Intellectual Property</h2>
          
          <h3>Our Content</h3>
          <ul>
            <li>YouTool.io design, code, and documentation are our intellectual property</li>
            <li>You may not copy, modify, or redistribute our source code</li>
            <li>Our brand name and logo are protected trademarks</li>
          </ul>

          <h3>Third-Party Content</h3>
          <ul>
            <li>YouTube data remains property of respective content creators</li>
            <li>We provide analysis tools, not content ownership</li>
            <li>Users must respect all applicable copyright laws</li>
          </ul>

          <h2>Service Availability</h2>
          <p>
            We strive to maintain high service availability, but cannot guarantee uninterrupted access:
          </p>
          <ul>
            <li>Service may be temporarily unavailable for maintenance</li>
            <li>YouTube API rate limits may affect tool functionality</li>
            <li>We reserve the right to modify or discontinue features</li>
            <li>Emergency maintenance may occur without notice</li>
          </ul>

          <h2>Disclaimers and Limitations</h2>
          
          <h3>Service Disclaimer</h3>
          <ul>
            <li>Our service is provided "as is" without warranties</li>
            <li>We do not guarantee accuracy of analytics data</li>
            <li>Results may vary based on YouTube's data availability</li>
            <li>Tools are for educational and research purposes</li>
          </ul>

          <h3>Limitation of Liability</h3>
          <ul>
            <li>We are not liable for any business decisions made using our data</li>
            <li>Maximum liability is limited to the amount paid for services (currently $0)</li>
            <li>We are not responsible for third-party actions or content</li>
            <li>Users assume all risks associated with data usage</li>
          </ul>

          <h2>Termination</h2>
          
          <h3>User Termination</h3>
          <p>You may stop using our service at any time by ceasing to access our website.</p>

          <h3>Service Termination</h3>
          <p>We may terminate or restrict access to our service for:</p>
          <ul>
            <li>Violation of these terms</li>
            <li>Abuse of our service or systems</li>
            <li>Legal or regulatory requirements</li>
            <li>Business reasons with reasonable notice</li>
          </ul>

          <h2>Advertising and Third-Party Services</h2>
          <p>
            Our service includes advertising and third-party integrations:
          </p>
          <ul>
            <li>Google AdSense displays relevant advertisements</li>
            <li>We are not responsible for third-party ad content</li>
            <li>External links lead to third-party websites</li>
            <li>Third-party services have their own terms and privacy policies</li>
          </ul>

          <h2>Modifications to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time:
          </p>
          <ul>
            <li>Material changes will be posted with reasonable notice</li>
            <li>Continued use constitutes acceptance of updated terms</li>
            <li>Users are responsible for reviewing terms periodically</li>
          </ul>

          <h2>Governing Law</h2>
          <p>
            These Terms are governed by applicable laws. Any disputes will be resolved through appropriate legal channels 
            in the jurisdiction where YouTool.io operates.
          </p>

          <h2>Contact Information</h2>
          <p>
            For questions about these Terms or our service:
          </p>
          <ul>
            <li><strong>Email:</strong> youtool.io.business@gmail.com</li>
            <li><strong>Website:</strong> <a href="https://youtool.io">https://youtool.io</a></li>
          </ul>

          <h2>Severability</h2>
          <p>
            If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.
          </p>

          <h2>Entire Agreement</h2>
          <p>
            These Terms, together with our Privacy Policy, constitute the entire agreement between you and YouTool.io regarding our service.
          </p>
        </Content>
      </ContentWrapper>
    </Container>
  );
};