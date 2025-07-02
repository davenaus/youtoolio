// src/styles/theme.ts
export const theme = {
  colors: {
    // Primary brand colors
    red1: '#2E0404',
    red2: '#520101',
    red3: '#7D0000',
    red4: '#B91C1C', // Brighter red for accents
    red5: '#E54848', // Strong accent red, brighter and more saturated
    red6: '#FF8A8A', // Light red for highlights or background tints
    rose1: '#EDDADA',
    white: '#FFFFFF',

    // Dark mode color system
    dark1: '#0A0A0B',    // Darkest background
    dark2: '#111113',    // Main background
    dark3: '#1A1A1D',    // Card/component background
    dark4: '#242428',    // Elevated surfaces
    dark5: '#2D2D32',    // Borders/dividers

    // Gray scale for dark mode
    gray1: '#F8F9FA',
    gray2: '#E9ECEF',
    gray3: '#DEE2E6',
    gray4: '#CED4DA',
    gray5: '#ADB5BD',
    gray6: '#6C757D',
    gray7: '#495057',
    gray8: '#343A40',
    gray9: '#212529',
    black: '#000000',

    // Dark mode text colors
    text: {
      primary: '#F8F9FA',     // Main text
      secondary: '#D1D5DB',   // Secondary text
      muted: '#9CA3AF',       // Muted text
      inverse: '#1F2937'      // Dark text on light backgrounds
    },

    // Status colors for dark mode
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6'
  },
  fonts: {
    primary: "'Poppins', sans-serif"
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem'
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '50%'
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.6)',
    glow: '0 0 20px rgba(125, 0, 0, 0.3)' // Red glow effect
  }
};

export type Theme = typeof theme;