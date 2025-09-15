// src/components/AdSense/AdSense.tsx
import React, { useEffect } from 'react';
import styled from 'styled-components';

interface AdSenseProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  style?: React.CSSProperties;
  className?: string;
}

const AdContainer = styled.div<{ format?: string }>`
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1rem;
  margin: 1rem 0;
  position: relative; /* Ensure ads are not fixed */
  min-height: ${({ format }) => {
    switch (format) {
      case 'vertical':
        return '600px';
      case 'horizontal':
        return '120px';
      case 'rectangle':
        return '250px';
      default:
        return '200px';
    }
  }};
  
  /* Responsive sizing */
  @media (max-width: 768px) {
    min-height: ${({ format }) => format === 'vertical' ? '300px' : '100px'};
    padding: 0.5rem;
  }
  
  /* Prevent any fixed/sticky positioning that could cause scroll issues */
  &, & > * {
    position: relative;
  }
  
  /* Ensure AdSense elements stay within normal document flow */
  ins.adsbygoogle {
    position: relative !important;
    display: block !important;
  }
`;

const AdPlaceholder = styled.div`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.9rem;
  text-align: center;
  opacity: 0.7;
`;

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export const AdSense: React.FC<AdSenseProps> = ({ 
  slot, 
  format = 'auto', 
  style = {}, 
  className = '' 
}) => {
  const clientId = process.env.REACT_APP_ADSENSE_CLIENT_ID;
  
  useEffect(() => {
    try {
      if (window.adsbygoogle && clientId) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, [clientId]);

  // Don't render ads in development or if no client ID
  if (!clientId || process.env.NODE_ENV === 'development') {
    return (
      <AdContainer format={format} className={className} style={style}>
        <AdPlaceholder>
          <i className="bx bx-image" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}></i>
          Advertisement Placeholder
          <br />
          <small>Ads will appear here in production</small>
        </AdPlaceholder>
      </AdContainer>
    );
  }

  return (
    <AdContainer format={format} className={className} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </AdContainer>
  );
};