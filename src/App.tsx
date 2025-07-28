// src/App.tsx
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { Analytics } from '@vercel/analytics/react';
import { GlobalStyles } from './styles/GlobalStyles';
import { theme } from './styles/theme';
import { AppRoutes } from './routes/AppRoutes';
import { Footer } from './components/Footer/Footer';
import { CookieConsentBanner } from './components/CookieConsent/CookieConsentBanner';
import { ScrollToTop } from './components/ScrollToTop';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Router>
        <ScrollToTop />
        <AppRoutes />
        <Footer />
        <CookieConsentBanner />
      </Router>
      <Analytics />
    </ThemeProvider>
  );
}

export default App;