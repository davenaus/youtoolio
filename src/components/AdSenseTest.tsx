// Test AdSense Implementation
// This file can be used to verify AdSense setup

import React, { useEffect } from 'react';

const AdSenseTest: React.FC = () => {
  const clientId = process.env.REACT_APP_ADSENSE_CLIENT_ID;
  const slotId = process.env.REACT_APP_ADSENSE_SLOT_HEADER;

  useEffect(() => {
    try {
      if (window.adsbygoogle && clientId && slotId) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        console.log('AdSense ad loaded successfully');
      } else {
        console.log('AdSense not loaded - missing client ID or slot ID');
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, [clientId, slotId]);

  if (!clientId || !slotId) {
    return (
      <div style={{ 
        padding: '20px', 
        background: '#f0f0f0', 
        textAlign: 'center',
        border: '2px dashed #ccc',
        margin: '20px 0'
      }}>
        <p>AdSense Test - Missing Configuration</p>
        <small>Client ID: {clientId || 'Missing'}</small><br/>
        <small>Slot ID: {slotId || 'Missing'}</small>
      </div>
    );
  }

  return (
    <div style={{ margin: '20px 0' }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdSenseTest;