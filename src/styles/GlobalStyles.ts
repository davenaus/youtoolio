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
  
    
  /* Global 80% scaling - makes everything 20% smaller */
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
  
  /* Global safeguard against sticky ads */
  .adsbygoogle,
  [class*="ad-"],
  [class*="Ad"] {
    position: relative !important;
    top: auto !important;
    left: auto !important;
    right: auto !important;
    bottom: auto !important;
    transform: none !important;
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
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    line-height: 1.2;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  p {
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.colors.text.secondary};
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