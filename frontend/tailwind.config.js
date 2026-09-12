/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // FasalSetu Design System Tokens
        primary: {
          DEFAULT: '#16A34A', // Farm Green
          dark: '#15803D',
          light: '#22C55E',
          tint: '#DCFCE7', // Soft green background tint for badges
          subtle: '#F0FDF4',
        },
        secondary: {
          DEFAULT: '#D97706', // Amber-600 for contrast
          light: '#F59E0B',
          subtle: '#FEF3C7',
        },
        success: '#15803D', // Safe - high contrast green
        warning: '#B45309', // Monitor - high contrast amber/brown
        urgent: '#DC2626', // High Risk / Danger - clear red
        farmBg: '#F8FAFC', // Clean off-white background
        farmBorder: '#E2E8F0',
        farmText: {
          dark: '#0F172A',
          gray: '#475569',
          muted: '#64748B',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      fontSize: {
        'display-2xl': ['64px', { lineHeight: '1.08', letterSpacing: '-0.025em' }],
        'display-xl': ['52px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['40px', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'hero-sub': ['20px', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
        'screen-title': ['28px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'section-title': ['18px', { lineHeight: '1.35', letterSpacing: '-0.01em' }],
        'card-title': ['16px', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
        'body-regular': ['16px', { lineHeight: '1.6' }],
        'caption': ['13px', { lineHeight: '1.5' }],
      },
      borderRadius: {
        'button': '12px', // Standard button rounding (~12px)
        'card': '16px',
        'badge': '9999px',
      },
      boxShadow: {
        'chip': '0 2px 8px -1px rgba(22, 163, 74, 0.25)',
        'chip-hover': '0 4px 12px -2px rgba(0, 0, 0, 0.08)',
        'cta': '0 4px 14px 0 rgba(22, 163, 74, 0.35)',
      },
    },
  },
  plugins: [],
};
