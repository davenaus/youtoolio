// src/components/GoogleAd/GoogleAd.tsx
import React, { useEffect } from 'react';
import * as S from './styles';
import { trackAdViewed } from '../../utils/googleAnalytics';

interface GoogleAdProps {
  adSlot: string;
  adFormat?: string;
  fullWidthResponsive?: boolean;
  className?: string;
  toolName?: string;
}

export const GoogleAd: React.FC<GoogleAdProps> = ({
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  className,
  toolName
}) => {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});

      // Track ad view
      trackAdViewed(adSlot, toolName);
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, [adSlot, toolName]);

  return (
    <S.AdContainer className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-3983371456556282"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </S.AdContainer>
  );
};
