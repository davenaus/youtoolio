// src/App.tsx
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { GlobalStyles } from './styles/GlobalStyles';
import { theme } from './styles/theme';
import { AppRoutes } from './routes/AppRoutes';
import { Footer } from './components/Footer/Footer';
import { CookieConsentBanner } from './components/CookieConsent/CookieConsentBanner';
import { ScrollToTop } from './components/ScrollToTop';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Router>
        <AuthProvider>
          <ScrollToTop />
          <AppRoutes />
          <Footer />
          <CookieConsentBanner />
        </AuthProvider>
      </Router>
      <Analytics />
      <SpeedInsights />
    </ThemeProvider>
  );
}

export default App;
