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
  }
  
  /* Global 90% scaling - makes everything 10% smaller */
  body {
    zoom: 0.9;
    transform-origin: top left;
  }

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