// src/components/CookieConsent/CookieConsentBanner.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const BannerContainer = styled.div<{ isVisible: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.dark3};
  border-top: 2px solid ${({ theme }) => theme.colors.red3};
  padding: 1.5rem;
  z-index: 1000;
  transform: translateY(${props => props.isVisible ? '0' : '100%'});
  transition: transform 0.3s ease-in-out;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const BannerContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const BannerText = styled.div`
  flex: 1;
`;

const BannerTitle = styled.h4`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
`;

const BannerDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;

  a {
    color: ${({ theme }) => theme.colors.red4};
    text-decoration: underline;
    cursor: pointer;

    &:hover {
      color: ${({ theme }) => theme.colors.red5};
    }
  }
`;

const BannerActions = styled.div`
  display: flex;
  gap: 1rem;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: none;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.variant === 'primary' ? `
    background: ${props.theme.colors.red3};
    color: white;
    
    &:hover {
      background: ${props.theme.colors.red5};
    }
  ` : `
    background: transparent;
    color: ${props.theme.colors.text.muted};
    border: 1px solid ${props.theme.colors.dark5};
    
    &:hover {
      background: ${props.theme.colors.dark4};
      color: ${props.theme.colors.text.primary};
    }
  `}

  @media (max-width: 768px) {
    flex: 1;
  }
`;

const PreferencesModal = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  margin-bottom: 1.5rem;

  h3 {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1.3rem;
    margin: 0 0 0.5rem 0;
  }

  p {
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: 0.9rem;
    margin: 0;
  }
`;

const CookieOption = styled.div`
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 1rem;
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const OptionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;

  h4 {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1rem;
    margin: 0;
  }
`;

const OptionDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.85rem;
  line-height: 1.4;
  margin: 0;
`;

const Toggle = styled.label<{ disabled?: boolean }>`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${({ theme }) => theme.colors.dark5};
    transition: 0.3s;
    border-radius: 24px;

    &:before {
      position: absolute;
      content: '';
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
    }
  }

  input:checked + span {
    background-color: ${({ theme }) => theme.colors.red3};
  }

  input:checked + span:before {
    transform: translateX(20px);
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: flex-end;
`;

interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  preferences: boolean;
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export const CookieConsentBanner: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [consent, setConsent] = useState<CookieConsent>({
    necessary: true,
    analytics: false,
    preferences: false
  });

  useEffect(() => {
    const hasConsent = localStorage.getItem('youtool-cookie-consent');
    if (!hasConsent) {
      setIsVisible(true);
    }
  }, []);

  const saveConsent = (consentData: CookieConsent) => {
    localStorage.setItem('youtool-cookie-consent', JSON.stringify(consentData));
    localStorage.setItem('youtool-cookie-consent-date', new Date().toISOString());
    setIsVisible(false);
    setShowPreferences(false);

    // Trigger Google Analytics consent update if available
    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: consentData.analytics ? 'granted' : 'denied',
      });
    }
  };

  const acceptAll = () => {
    const allConsent = {
      necessary: true,
      analytics: true,
      preferences: true
    };
    saveConsent(allConsent);
  };

  const acceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      analytics: false,
      preferences: false
    };
    saveConsent(necessaryOnly);
  };

  const savePreferences = () => {
    saveConsent(consent);
  };

  const handleToggle = (type: keyof CookieConsent) => {
    if (type === 'necessary') return; // Can't disable necessary cookies
    
    setConsent(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  return (
    <>
      <BannerContainer isVisible={isVisible}>
        <BannerContent>
          <BannerText>
            <BannerTitle>🍪 We use cookies to improve your experience</BannerTitle>
            <BannerDescription>
              We use cookies and similar technologies to provide essential functionality 
              and analyze usage. You can manage your preferences anytime. 
              See our <a onClick={() => navigate('/cookie-policy')}>Cookie Policy</a> for details.
            </BannerDescription>
          </BannerText>
          <BannerActions>
            <Button variant="secondary" onClick={() => setShowPreferences(true)}>
              Manage Preferences
            </Button>
            <Button variant="secondary" onClick={acceptNecessary}>
              Necessary Only
            </Button>
            <Button variant="primary" onClick={acceptAll}>
              Accept All
            </Button>
          </BannerActions>
        </BannerContent>
      </BannerContainer>

      <PreferencesModal isOpen={showPreferences}>
        <ModalContent>
          <ModalHeader>
            <h3>Cookie Preferences</h3>
            <p>Choose which cookies you want to allow. You can change these settings anytime.</p>
          </ModalHeader>

          <CookieOption>
            <OptionHeader>
              <h4>Necessary Cookies</h4>
              <Toggle disabled>
                <input type="checkbox" checked={true} disabled />
                <span></span>
              </Toggle>
            </OptionHeader>
            <OptionDescription>
              Essential for basic website functionality, security, and remembering your preferences.
              These cannot be disabled.
            </OptionDescription>
          </CookieOption>

          <CookieOption>
            <OptionHeader>
              <h4>Analytics Cookies</h4>
              <Toggle>
                <input 
                  type="checkbox" 
                  checked={consent.analytics}
                  onChange={() => handleToggle('analytics')}
                />
                <span></span>
              </Toggle>
            </OptionHeader>
            <OptionDescription>
              Help us understand how you use our site so we can improve the user experience.
              Data is anonymous and aggregated.
            </OptionDescription>
          </CookieOption>


          <CookieOption>
            <OptionHeader>
              <h4>Preference Cookies</h4>
              <Toggle>
                <input 
                  type="checkbox" 
                  checked={consent.preferences}
                  onChange={() => handleToggle('preferences')}
                />
                <span></span>
              </Toggle>
            </OptionHeader>
            <OptionDescription>
              Remember your settings and preferences to provide a personalized experience
              across visits.
            </OptionDescription>
          </CookieOption>

          <ModalActions>
            <Button variant="secondary" onClick={() => setShowPreferences(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={savePreferences}>
              Save Preferences
            </Button>
          </ModalActions>
        </ModalContent>
      </PreferencesModal>
    </>
  );
};

export default CookieConsentBanner;