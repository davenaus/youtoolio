// src/styles/GlobalStyles.ts
import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    height: 100%;
    font-family: ${({ theme }) => theme.fonts.primary};
    background-color: ${({ theme }) => theme.colors.dark2};
    color: ${({ theme }) => theme.colors.text.primary};
    line-height: 1.6;
    overflow-x: hidden;
    scroll-behavior: auto; /* Disable smooth scrolling for route changes */
    -webkit-text-size-adjust: 100%; /* Prevent iOS text size adjustment */
    -moz-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
    text-size-adjust: 100%;

    /* Better mobile scrolling */
    @media (max-width: 768px) {
      -webkit-overflow-scrolling: touch;
    }
  }

  /* Removed global zoom scaling for better cross-device compatibility */

  /* Ensure consistent scroll behavior */
  html {
    scroll-behavior: auto;
  }
  
  /* Prevent any conflicting scroll behaviors */
  * {
    scroll-behavior: auto !important;
  }
  
  /* Ensure body and html don't have conflicting positioning */
  body {
    position: relative;
  }
  
  /* Reset any potential scroll restoration interference */
  @media (prefers-reduced-motion: no-preference) {
    html {
      scroll-behavior: auto;
    }
  }

  #root {
    min-height: 100%;
    overflow-x: hidden;

    /* Prevent horizontal scroll on mobile */
    @media (max-width: 768px) {
      max-width: 100vw;
    }
  }

  /* Prevent all elements from causing horizontal scroll */
  * {
    max-width: 100%;
  }

  /* Exception for fixed/absolute positioned elements */
  *[class*="Modal"],
  *[class*="Dropdown"],
  *[class*="Overlay"] {
    max-width: none;
  }

  /* Ensure images don't overflow */
  img {
    max-width: 100%;
    height: auto;
  }

  /* Prevent pre and code blocks from overflowing */
  pre, code {
    max-width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  button {
    font-family: inherit;
    cursor: pointer;
    min-height: 44px; /* Touch target size */

    @media (max-width: 480px) {
      padding: 0.75rem 1rem;
    }
  }

  /* Prevent iOS zoom on input focus - CRITICAL for mobile UX */
  input,
  textarea,
  select {
    font-size: 16px; /* Minimum 16px prevents iOS auto-zoom */

    @media (max-width: 768px) {
      font-size: 16px !important; /* Force 16px on mobile to prevent zoom */
    }
  }

  /* Better touch targets for mobile */
  input,
  textarea,
  select,
  button,
  a {
    -webkit-tap-highlight-color: rgba(125, 0, 0, 0.2);
    touch-action: manipulation; /* Prevents double-tap zoom */

    @media (max-width: 768px) {
      min-height: 44px; /* Apple's recommended minimum touch target */
    }
  }

  /* Better mobile button feedback */
  button {
    @media (max-width: 768px) {
      &:active {
        transform: scale(0.98);
        opacity: 0.9;
      }
    }
  }

  /* Improve link tappability */
  a {
    @media (max-width: 768px) {
      display: inline-block;
      min-height: 24px;
    }
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    line-height: 1.2;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  /* Mobile font scaling for native HTML elements */
  h1 {
    @media (max-width: 768px) {
      font-size: 1.75rem;
    }
    
    @media (max-width: 480px) {
      font-size: 1.5rem;
    }
  }

  h2 {
    @media (max-width: 768px) {
      font-size: 1.5rem;
    }
    
    @media (max-width: 480px) {
      font-size: 1.3rem;
    }
  }

  h3 {
    @media (max-width: 768px) {
      font-size: 1.3rem;
    }
    
    @media (max-width: 480px) {
      font-size: 1.15rem;
    }
  }

  h4 {
    @media (max-width: 768px) {
      font-size: 1.15rem;
    }
    
    @media (max-width: 480px) {
      font-size: 1.05rem;
    }
  }

  h5 {
    @media (max-width: 768px) {
      font-size: 1.05rem;
    }
    
    @media (max-width: 480px) {
      font-size: 0.95rem;
    }
  }

  h6 {
    @media (max-width: 768px) {
      font-size: 1rem;
    }
    
    @media (max-width: 480px) {
      font-size: 0.9rem;
    }
  }

  p {
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    
    @media (max-width: 768px) {
      font-size: 1rem;
    }
    
    @media (max-width: 480px) {
      font-size: 0.95rem;
    }
  }

  /* Enhanced scrollbar for dark mode */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.dark3};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.dark5};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.red3};
  }

  /* Selection colors */
  ::selection {
    background: ${({ theme }) => theme.colors.red3};
    color: ${({ theme }) => theme.colors.white};
  }

  ::-moz-selection {
    background: ${({ theme }) => theme.colors.red3};
    color: ${({ theme }) => theme.colors.white};
  }
`;