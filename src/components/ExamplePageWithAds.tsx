// Example of how to add AdSense ads to any page
// Copy this pattern to add ads to your pages

import React from 'react';
import { AdSense } from '../components/AdSense/AdSense';

const ExamplePageWithAds: React.FC = () => {
  return (
    <div>
      {/* Page Header */}
      <header>
        <h1>Your Page Title</h1>
      </header>

      {/* Header Ad - Horizontal */}
      <AdSense 
        slot={process.env.REACT_APP_ADSENSE_SLOT_HEADER || ''}
        format="horizontal"
        style={{ margin: '2rem 0' }}
      />

      {/* Main Content */}
      <main>
        <section>
          <h2>Your Content Here</h2>
          <p>Your main content...</p>
        </section>

        {/* Content Ad - Square/Rectangle */}
        <AdSense 
          slot={process.env.REACT_APP_ADSENSE_SLOT_CONTENT || ''}
          format="rectangle"
          style={{ margin: '2rem auto', display: 'block' }}
        />

        <section>
          <h2>More Content</h2>
          <p>Additional content...</p>
        </section>
      </main>

      {/* Sidebar (if applicable) */}
      <aside style={{ width: '300px', float: 'right' }}>
        {/* Sidebar Ad - Vertical */}
        <AdSense 
          slot={process.env.REACT_APP_ADSENSE_SLOT_SIDEBAR || ''}
          format="vertical"
          style={{ margin: '1rem 0' }}
        />
      </aside>

      {/* Bottom Ad - Horizontal */}
      <AdSense 
        slot={process.env.REACT_APP_ADSENSE_SLOT_BOTTOM || ''}
        format="horizontal"
        style={{ margin: '2rem 0' }}
      />
    </div>
  );
};

export default ExamplePageWithAds;