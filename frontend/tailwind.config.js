/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#f0effe',
          100: '#e3e0fd',
          200: '#ccc5fb',
          300: '#ab9ef8',
          400: '#8870f3',
          500: '#7c6cf8',
          600: '#5a3ef0',
          700: '#4b2dd6',
          800: '#3f26b0',
          900: '#36238e',
        },
        dark: {
          900: '#0d0f1a',
          800: '#13162b',
          700: '#1a1e35',
          600: '#1f2440',
          500: '#2a3055',
        },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #7c6cf8 0%, #22d3ee 100%)',
        'gradient-purple': 'linear-gradient(135deg, #7c6cf8, #a78bfa)',
        'gradient-cyan': 'linear-gradient(135deg, #22d3ee, #06b6d4)',
        'gradient-green': 'linear-gradient(135deg, #10b981, #059669)',
        'gradient-orange': 'linear-gradient(135deg, #f59e0b, #d97706)',
        'gradient-red': 'linear-gradient(135deg, #ef4444, #dc2626)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'toast-in': 'toastIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'spin-slow': 'spin 1.2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(24px) scale(0.97)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        toastIn: {
          from: { opacity: '0', transform: 'translateX(100%) scale(0.9)' },
          to: { opacity: '1', transform: 'translateX(0) scale(1)' },
        },
      },
      boxShadow: {
        'glow-purple': '0 0 30px rgba(124, 108, 248, 0.25)',
        'glow-sm': '0 0 16px rgba(124, 108, 248, 0.15)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
