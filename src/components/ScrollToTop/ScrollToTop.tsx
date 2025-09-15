// src/components/ScrollToTop/ScrollToTop.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useScrollToTop } from '../../hooks/useScrollToTop';

export const ScrollToTop: React.FC = () => {
  const { pathname, hash } = useLocation();
  const scrollToTop = useScrollToTop();

  // Disable browser's automatic scroll restoration
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    // Handle hash navigation (e.g., #section)
    if (hash) {
      const element = document.getElementById(hash.substring(1));
      if (element) {
        // Small delay to ensure the page has rendered
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        return;
      }
    }
    
    // For regular page navigation, scroll to top immediately
    scrollToTop(false);
    
    // Also execute after a small delay to handle any async rendering
    const timeoutId = setTimeout(() => {
      scrollToTop(false);
    }, 50);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [pathname, hash, scrollToTop]);

  return null;
};
