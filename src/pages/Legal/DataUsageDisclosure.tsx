// src/pages/Legal/DataUsageDisclosure.tsx
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

const DataFlowCard = styled.div`
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 1.5rem;
  margin: 1rem 0;
`;

const FlowStep = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const StepNumber = styled.div`
  background: ${({ theme }) => theme.colors.red3};
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
  margin-right: 1rem;
  flex-shrink: 0;
`;

const StepDescription = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const HighlightBox = styled.div`
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

const DataTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  background: ${({ theme }) => theme.colors.dark4};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: hidden;

  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.dark5};
  }

  th {
    background: ${({ theme }) => theme.colors.dark3};
    color: ${({ theme }) => theme.colors.text.primary};
    font-weight: 600;
  }

  td {
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  tr:last-child td {
    border-bottom: none;
  }
`;

export const DataUsageDisclosure: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <ContentWrapper>
        <BackButton onClick={() => navigate('/')}>
          <i className="bx bx-arrow-back"></i>
          Back to Home
        </BackButton>

        <Header>
          <Title>Data Usage Disclosure</Title>
          <Subtitle>Transparent information about how we handle your data</Subtitle>
        </Header>

        <LastUpdated>
          <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </LastUpdated>

        <Content>
          <h2>Our Commitment to Transparency</h2>
          <p>
            At YouTool.io, we believe in complete transparency about how we collect, use, and protect your data. 
            This disclosure provides detailed information about our data practices, going beyond our Privacy Policy 
            to give you a comprehensive understanding of our operations.
          </p>

          <HighlightBox>
            <p>
              <strong>Key Principle:</strong> We collect the minimum data necessary to provide our service and never 
              sell your personal information to third parties.
            </p>
          </HighlightBox>

          <h2>Data Collection Overview</h2>
          
          <h3>What We Collect</h3>
          <DataTable>
            <thead>
              <tr>
                <th>Data Type</th>
                <th>Source</th>
                <th>Purpose</th>
                <th>Retention</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>YouTube URLs/IDs</td>
                <td>User Input</td>
                <td>Tool Functionality</td>
                <td>Not Stored</td>
              </tr>
              <tr>
                <td>Search Queries</td>
                <td>User Input</td>
                <td>Service Provision</td>
                <td>Local Storage Only</td>
              </tr>
              <tr>
                <td>Usage Analytics</td>
                <td>Automatic Collection</td>
                <td>Service Improvement</td>
                <td>Aggregated Only</td>
              </tr>
              <tr>
                <td>Device Information</td>
                <td>Browser</td>
                <td>Compatibility</td>
                <td>Anonymous</td>
              </tr>
              <tr>
                <td>Public YouTube Data</td>
                <td>YouTube API</td>
                <td>Analysis</td>
                <td>Real-time Only</td>
              </tr>
            </tbody>
          </DataTable>

          <h3>What We Don't Collect</h3>
          <ul>
            <li><strong>Personal YouTube Account Data:</strong> We never access your private YouTube information</li>
            <li><strong>Login Credentials:</strong> No passwords or authentication tokens are stored</li>
            <li><strong>Private Videos:</strong> Only publicly available content is analyzed</li>
            <li><strong>Personal Communications:</strong> No emails, messages, or private data</li>
            <li><strong>Financial Information:</strong> No payment or banking details</li>
            <li><strong>Location Tracking:</strong> No precise geolocation data</li>
          </ul>

          <h2>Data Flow Process</h2>
          
          <DataFlowCard>
            <h3 style={{ margin: '0 0 1rem 0', color: '#F8F9FA' }}>How Your Data Moves Through Our System</h3>
            
            <FlowStep>
              <StepNumber>1</StepNumber>
              <StepDescription>
                <strong>Input:</strong> You provide a YouTube URL or search query through our interface
              </StepDescription>
            </FlowStep>
            
            <FlowStep>
              <StepNumber>2</StepNumber>
              <StepDescription>
                <strong>Processing:</strong> We extract the video/channel ID and validate the input
              </StepDescription>
            </FlowStep>
            
            <FlowStep>
              <StepNumber>3</StepNumber>
              <StepDescription>
                <strong>API Request:</strong> We query YouTube's public API for the requested data
              </StepDescription>
            </FlowStep>
            
            <FlowStep>
              <StepNumber>4</StepNumber>
              <StepDescription>
                <strong>Analysis:</strong> Our algorithms process the public data to generate insights
              </StepDescription>
            </FlowStep>
            
            <FlowStep>
              <StepNumber>5</StepNumber>
              <StepDescription>
                <strong>Display:</strong> Results are shown to you in real-time
              </StepDescription>
            </FlowStep>
            
            <FlowStep>
              <StepNumber>6</StepNumber>
              <StepDescription>
                <strong>Storage:</strong> Only your search history is saved locally in your browser
              </StepDescription>
            </FlowStep>
          </DataFlowCard>

          <h2>YouTube API Data Usage</h2>
          
          <h3>Compliance with YouTube Terms</h3>
          <p>
            Our use of YouTube data is strictly governed by the <a href="https://developers.google.com/youtube/terms/api-services-terms-of-service" target="_blank" rel="noopener noreferrer">YouTube API Services Terms of Service</a>:
          </p>
          <ul>
            <li>We only access publicly available information</li>
            <li>No private or restricted content is accessed</li>
            <li>Data is used solely for analytics and insights</li>
            <li>We comply with all YouTube API quotas and rate limits</li>
            <li>No data is cached beyond the session duration</li>
          </ul>

          <h3>Types of YouTube Data Accessed</h3>
          <ul>
            <li><strong>Video Metadata:</strong> Titles, descriptions, thumbnails, publish dates</li>
            <li><strong>Public Statistics:</strong> View counts, like counts, comment counts</li>
            <li><strong>Channel Information:</strong> Names, subscriber counts, creation dates</li>
            <li><strong>Public Comments:</strong> Text content of publicly visible comments</li>
            <li><strong>Playlist Data:</strong> Public playlist contents and metadata</li>
          </ul>

          <h2>Analytics and Tracking</h2>
          
          <h3>Google Analytics</h3>
          <p>
            We use Google Analytics to understand how users interact with our service:
          </p>
          <ul>
            <li><strong>Page Views:</strong> Which tools are most popular</li>
            <li><strong>User Journey:</strong> How users navigate through our site</li>
            <li><strong>Performance Metrics:</strong> Loading times and error rates</li>
            <li><strong>Demographics:</strong> General geographic and device information</li>
            <li><strong>Anonymization:</strong> IP addresses are anonymized</li>
          </ul>

          <h3>Vercel Analytics</h3>
          <p>
            Our hosting provider collects performance data:
          </p>
          <ul>
            <li>Page load speeds and performance metrics</li>
            <li>Error rates and availability monitoring</li>
            <li>General usage patterns for optimization</li>
            <li>No personal identification data is collected</li>
          </ul>

          <h2>Local Storage Usage</h2>
          
          <h3>Browser Storage</h3>
          <p>
            We use your browser's local storage for:
          </p>
          <ul>
            <li><strong>Search History:</strong> Your recent searches for quick access</li>
            <li><strong>Tool Preferences:</strong> Filter settings and display options</li>
            <li><strong>Session Data:</strong> Temporary data during your visit</li>
            <li><strong>Performance Cache:</strong> Improved loading times</li>
          </ul>

          <h3>Control Over Local Data</h3>
          <ul>
            <li>You can clear your search history at any time</li>
            <li>Browser settings allow you to disable local storage</li>
            <li>Private/incognito browsing prevents data storage</li>
            <li>Data is specific to your device and browser</li>
          </ul>

          <h2>Third-Party Services</h2>
          
          <h3>Google AdSense</h3>
          <p>
            We use Google AdSense to display relevant advertisements:
          </p>
          <ul>
            <li>Ads are based on page content and general demographics</li>
            <li>Personal targeting can be disabled through Google settings</li>
            <li>We don't control ad content or targeting beyond basic preferences</li>
            <li>Ad blockers can prevent all advertising cookies</li>
          </ul>

          <h3>External Fonts and Assets</h3>
          <ul>
            <li><strong>Google Fonts:</strong> Typography assets loaded from Google's CDN</li>
            <li><strong>Boxicons:</strong> Icon library from external CDN</li>
            <li><strong>Image Hosting:</strong> Some images served from Tumblr CDN</li>
          </ul>

          <h2>Data Security Measures</h2>
          
          <h3>Technical Safeguards</h3>
          <ul>
            <li><strong>HTTPS Encryption:</strong> All data transmission is encrypted</li>
            <li><strong>Secure Hosting:</strong> Infrastructure provided by Vercel with enterprise security</li>
            <li><strong>API Security:</strong> YouTube API keys are properly secured</li>
            <li><strong>No Database:</strong> We don't maintain a database of user information</li>
          </ul>

          <h3>Access Controls</h3>
          <ul>
            <li>Limited access to production systems</li>
            <li>Regular security updates and monitoring</li>
            <li>Principle of least privilege for all services</li>
            <li>Automated security scanning and alerts</li>
          </ul>

          <h2>Your Rights and Controls</h2>
          
          <h3>Data Access Rights</h3>
          <ul>
            <li><strong>Transparency:</strong> This disclosure provides complete visibility</li>
            <li><strong>Local Access:</strong> You can view all locally stored data through browser tools</li>
            <li><strong>Limited Collection:</strong> We minimize data collection to essential functions</li>
          </ul>

          <h3>Control Options</h3>
          <ul>
            <li><strong>Browser Settings:</strong> Control cookies and local storage</li>
            <li><strong>Ad Preferences:</strong> Manage advertising personalization through Google</li>
            <li><strong>Analytics Opt-out:</strong> Use browser extensions to block tracking</li>
            <li><strong>Service Discontinuation:</strong> Stop using our service at any time</li>
          </ul>

          <h2>Data Retention Policies</h2>
          
          <h3>What We Keep</h3>
          <ul>
            <li><strong>Analytics Data:</strong> Aggregated usage statistics for service improvement</li>
            <li><strong>Error Logs:</strong> Technical logs for debugging and performance monitoring</li>
            <li><strong>Security Logs:</strong> Access logs for security monitoring</li>
          </ul>

          <h3>What We Delete</h3>
          <ul>
            <li><strong>Individual Requests:</strong> Not stored beyond the session</li>
            <li><strong>Personal Identifiers:</strong> No permanent storage of personal data</li>
            <li><strong>YouTube Data:</strong> Retrieved in real-time, not cached</li>
          </ul>

          <h2>International Data Transfers</h2>
          <p>
            Our service operates globally with appropriate safeguards:
          </p>
          <ul>
            <li><strong>Hosting:</strong> Vercel provides global CDN with data protection compliance</li>
            <li><strong>Google Services:</strong> Subject to Google's international data transfer policies</li>
            <li><strong>Legal Compliance:</strong> We comply with applicable data protection laws</li>
          </ul>

          <h2>Changes and Updates</h2>
          <p>
            We may update our data practices to improve our service or comply with legal requirements:
          </p>
          <ul>
            <li>Material changes will be communicated through this page</li>
            <li>We'll update the "Last Updated" date for any modifications</li>
            <li>Significant changes may be announced on our website</li>
            <li>Continued use constitutes acceptance of updated practices</li>
          </ul>

          <h2>Contact and Questions</h2>
          <p>
            For specific questions about our data usage or to exercise your rights:
          </p>
          <ul>
            <li><strong>Data Protection Email:</strong> youtool.io.business@gmail.com</li>
            <li><strong>General Contact:</strong> youtool.io.business@gmail.com</li>
            <li><strong>Website:</strong> <a href="https://youtool.io">https://youtool.io</a></li>
          </ul>

          <h2>Regulatory Compliance</h2>
          <p>
            Our data practices are designed to comply with:
          </p>
          <ul>
            <li><strong>GDPR:</strong> European General Data Protection Regulation</li>
            <li><strong>CCPA:</strong> California Consumer Privacy Act</li>
            <li><strong>COPPA:</strong> Children's Online Privacy Protection Act</li>
            <li><strong>YouTube API Policies:</strong> Google's developer terms and policies</li>
          </ul>
        </Content>
      </ContentWrapper>
    </Container>
  );
};