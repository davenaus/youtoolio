// src/hooks/useScrollToTop.ts
import { useCallback } from 'react';

export const useScrollToTop = () => {
  const scrollToTop = useCallback((smooth = false) => {
    try {
      // First try the modern API
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: smooth ? 'smooth' : 'auto'
      });
      
      // Fallback for older browsers
      if (window.pageYOffset > 0) {
        window.scrollTo(0, 0);
      }
      
      // Additional fallback - directly set scroll positions
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // Force a repaint to ensure scroll takes effect
      if (window.pageYOffset > 0) {
        window.requestAnimationFrame(() => {
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        });
      }
    } catch (error) {
      // Final fallback
      window.scrollTo(0, 0);
    }
  }, []);

  return scrollToTop;
};
