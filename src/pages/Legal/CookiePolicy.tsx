// src/pages/Legal/CookiePolicy.tsx
import React, { useState } from 'react';
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

const CookieCard = styled.div`
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 1.5rem;
  margin: 1rem 0;
`;

const CookieHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const CookieTitle = styled.h4`
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  font-size: 1.1rem;
`;

const CookieStatus = styled.span<{ status: 'required' | 'optional' }>`
  background: ${props => props.status === 'required' ? '#B91C1C' : '#6C757D'};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const CookieDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0.5rem 0;
  font-size: 0.9rem;
`;

const CookieDetails = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.dark5};
`;

const DetailRow = styled.div`
  display: flex;
  margin-bottom: 0.5rem;
  
  strong {
    min-width: 100px;
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  span {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const ManageButton = styled.button`
  background: ${({ theme }) => theme.colors.red3};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  margin: 1rem 0;
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.red5};
  }
`;

export const CookiePolicy: React.FC = () => {
  const navigate = useNavigate();
  const [showManageOptions, setShowManageOptions] = useState(false);

  const clearAllCookies = () => {
    // Clear localStorage
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    alert('All stored data has been cleared from your browser.');
  };

  return (
    <Container>
      <ContentWrapper>
        <BackButton onClick={() => navigate('/')}>
          <i className="bx bx-arrow-back"></i>
          Back to Home
        </BackButton>

        <Header>
          <Title>Cookie Policy</Title>
          <Subtitle>How we use cookies and similar technologies</Subtitle>
        </Header>

        <LastUpdated>
          <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </LastUpdated>

        <Content>
          <h2>What Are Cookies?</h2>
          <p>
            Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better 
            experience by remembering your preferences and analyzing how you use our service. Similar technologies include local storage, 
            session storage, and other browser storage mechanisms.
          </p>

          <h2>How We Use Cookies</h2>
          <p>
            YouTool.io uses cookies and similar technologies for the following purposes:
          </p>
          <ul>
            <li><strong>Essential Functionality:</strong> To provide core features and maintain your session</li>
            <li><strong>Analytics:</strong> To understand how users interact with our tools</li>
            <li><strong>Preferences:</strong> To remember your settings and search history</li>
            <li><strong>Advertising:</strong> To display relevant advertisements through Google AdSense</li>
            <li><strong>Performance:</strong> To optimize loading times and user experience</li>
          </ul>

          <h2>Types of Cookies We Use</h2>

          <CookieCard>
            <CookieHeader>
              <CookieTitle>Essential Cookies</CookieTitle>
              <CookieStatus status="required">Required</CookieStatus>
            </CookieHeader>
            <CookieDescription>
              These cookies are necessary for the website to function properly. They enable basic features like page navigation and security.
            </CookieDescription>
            <CookieDetails>
              <DetailRow><strong>Purpose:</strong> <span>Session management, security, basic functionality</span></DetailRow>
              <DetailRow><strong>Duration:</strong> <span>Session or until browser is closed</span></DetailRow>
              <DetailRow><strong>Can be disabled:</strong> <span>No - required for site operation</span></DetailRow>
            </CookieDetails>
          </CookieCard>

          <CookieCard>
            <CookieHeader>
              <CookieTitle>Analytics Cookies</CookieTitle>
              <CookieStatus status="optional">Optional</CookieStatus>
            </CookieHeader>
            <CookieDescription>
              These cookies help us understand how visitors interact with our website by collecting anonymous information about usage patterns.
            </CookieDescription>
            <CookieDetails>
              <DetailRow><strong>Purpose:</strong> <span>Google Analytics, Vercel Analytics, usage tracking</span></DetailRow>
              <DetailRow><strong>Duration:</strong> <span>Up to 2 years</span></DetailRow>
              <DetailRow><strong>Can be disabled:</strong> <span>Yes - through browser settings or ad blockers</span></DetailRow>
            </CookieDetails>
          </CookieCard>

          <CookieCard>
            <CookieHeader>
              <CookieTitle>Preference Cookies</CookieTitle>
              <CookieStatus status="optional">Optional</CookieStatus>
            </CookieHeader>
            <CookieDescription>
              These cookies remember your preferences and settings to provide a personalized experience across visits.
            </CookieDescription>
            <CookieDetails>
              <DetailRow><strong>Purpose:</strong> <span>Search history, tool preferences, UI settings</span></DetailRow>
              <DetailRow><strong>Duration:</strong> <span>Persistent until manually cleared</span></DetailRow>
              <DetailRow><strong>Can be disabled:</strong> <span>Yes - through browser settings</span></DetailRow>
            </CookieDetails>
          </CookieCard>

          <CookieCard>
            <CookieHeader>
              <CookieTitle>Advertising Cookies</CookieTitle>
              <CookieStatus status="optional">Optional</CookieStatus>
            </CookieHeader>
            <CookieDescription>
              These cookies are used by Google AdSense to display relevant advertisements and measure ad performance.
            </CookieDescription>
            <CookieDetails>
              <DetailRow><strong>Purpose:</strong> <span>Google AdSense, ad personalization, frequency capping</span></DetailRow>
              <DetailRow><strong>Duration:</strong> <span>Varies (typically 30 days to 2 years)</span></DetailRow>
              <DetailRow><strong>Can be disabled:</strong> <span>Yes - through Google Ad Settings or ad blockers</span></DetailRow>
            </CookieDetails>
          </CookieCard>

          <h2>Local Storage Usage</h2>
          <p>
            In addition to cookies, we use browser local storage for:
          </p>
          <ul>
            <li><strong>Search History:</strong> Your recent searches for convenience</li>
            <li><strong>Tool Preferences:</strong> Settings and filters you've applied</li>
            <li><strong>Session Data:</strong> Temporary data during your visit</li>
            <li><strong>Cache:</strong> Temporary storage to improve performance</li>
          </ul>

          <h2>Third-Party Cookies</h2>
          <p>
            Some cookies on our site are set by third-party services:
          </p>
          <ul>
            <li><strong>Google Analytics:</strong> For website analytics and usage tracking</li>
            <li><strong>Google AdSense:</strong> For advertising and revenue measurement</li>
            <li><strong>Vercel Analytics:</strong> For performance monitoring</li>
            <li><strong>YouTube API:</strong> For accessing video and channel data</li>
          </ul>

          <h2>Managing Your Cookie Preferences</h2>
          
          <h3>Browser Settings</h3>
          <p>
            You can control cookies through your browser settings:
          </p>
          <ul>
            <li><strong>Block All Cookies:</strong> Prevent all cookies from being stored</li>
            <li><strong>Delete Cookies:</strong> Remove existing cookies from your device</li>
            <li><strong>Third-Party Cookies:</strong> Block cookies from external domains</li>
            <li><strong>Session Cookies:</strong> Only allow temporary cookies</li>
          </ul>

          <h3>Google Ad Settings</h3>
          <p>
            For advertising cookies, you can:
          </p>
          <ul>
            <li>Visit <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">Google Ad Settings</a> to manage personalization</li>
            <li>Opt out of personalized ads</li>
            <li>Review and delete ad-related data</li>
            <li>Use the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out Browser Add-on</a></li>
          </ul>

          <h3>Clear YouTool.io Data</h3>
          <ManageButton onClick={() => setShowManageOptions(!showManageOptions)}>
            {showManageOptions ? 'Hide Options' : 'Manage Your Data'}
          </ManageButton>

          {showManageOptions && (
            <div style={{ background: '#242428', padding: '1rem', borderRadius: '8px', margin: '1rem 0' }}>
              <p><strong>Clear Stored Data:</strong></p>
              <p style={{ fontSize: '0.9rem', color: '#9CA3AF' }}>
                This will remove all locally stored data including search history, preferences, and cached information.
              </p>
              <button
                onClick={clearAllCookies}
                style={{
                  background: '#7D0000',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Clear All Data
              </button>
            </div>
          )}

          <h2>Cookie Consent</h2>
          <p>
            By continuing to use our website, you consent to our use of cookies as described in this policy. You can withdraw 
            your consent at any time by adjusting your browser settings or clearing your data.
          </p>

          <h2>Impact of Disabling Cookies</h2>
          <p>
            Disabling certain cookies may affect your experience:
          </p>
          <ul>
            <li><strong>Essential Cookies:</strong> Site may not function properly</li>
            <li><strong>Analytics Cookies:</strong> We can't improve the service based on usage data</li>
            <li><strong>Preference Cookies:</strong> Settings won't be remembered between visits</li>
            <li><strong>Advertising Cookies:</strong> Ads may be less relevant to your interests</li>
          </ul>

          <h2>Updates to This Policy</h2>
          <p>
            We may update this Cookie Policy from time to time to reflect changes in technology, law, or our practices. 
            We will post any updates on this page with a revised "Last Updated" date.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have questions about our use of cookies or this policy:
          </p>
          <ul>
            <li><strong>Email:</strong> youtool.io.business@gmail.com</li>
            <li><strong>Website:</strong> <a href="https://youtool.io">https://youtool.io</a></li>
          </ul>
        </Content>
      </ContentWrapper>
    </Container>
  );
};