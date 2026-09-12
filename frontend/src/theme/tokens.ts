/**
 * FasalSetu Design System Tokens
 * Reusable across all farmer and government command center screens.
 */
export const theme = {
  colors: {
    primary: '#16A34A',      // Farm Green - Brand, CTAs, active states
    primaryDark: '#15803D',
    primaryLight: '#22C55E',
    primaryTint: '#DCFCE7',  // Soft green badge tint
    primarySubtle: '#F0FDF4',

    secondary: '#D97706',    // Amber
    success: '#15803D',      // Safe
    warning: '#B45309',      // Monitor
    urgent: '#DC2626',       // High Risk / Danger

    background: '#F8FAFC',   // Clean off-white background
    border: '#E2E8F0',       // Light slate border

    text: {
      dark: '#0F172A',       // Slate-900 main dark text
      gray: '#475569',       // Slate-600 subtitles / captions (contrast > 7:1)
      muted: '#64748B',      // Slate-500 muted text (contrast > 4.6:1 WCAG AA)
      white: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
    headings: {
      hero: '32px',
      title: '24px',
      section: '20px',
      label: '16px',
    },
    body: {
      regular: '16px',
      secondary: '14px',
      caption: '12px',
    },
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
  },
  radius: {
    button: '12px',          // ~12px corners for buttons
    card: '16px',
    pill: '9999px',
  },
  touch: {
    minHeight: '44px',       // Minimum 44px for accessibility
    chipHeight: '48px',      // ~48px height for language chips
    ctaHeight: '52px',       // ~52px height for primary CTA
  },
} as const;

export type ThemeTokens = typeof theme;
