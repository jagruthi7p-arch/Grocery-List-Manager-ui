const path = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    path.resolve(__dirname, 'index.html'),
    path.resolve(__dirname, 'src/**/*.{js,jsx}'),
  ],
  theme: {
    extend: {
      fontFamily: { sans: ['Outfit', 'system-ui', 'sans-serif'] },
      colors: {
        cream:  '#F7F3EC',
        paper:  '#FBF8F2',
        ink:    '#1A1A1A',
        forest: '#1F3D2C',
        sage:   '#7B9B7A',
        terra:  '#D97757',
        butter: '#F4D58D',
        muted:  '#6B6B6B',
        line:   '#E8E2D5',
        'cream-light': '#FBF8F2',
        'cream-dark':  '#EFE9DC',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(26,26,26,0.04), 0 8px 24px rgba(26,26,26,0.06)',
        lift: '0 4px 12px rgba(26,26,26,0.08), 0 24px 48px rgba(26,26,26,0.10)',
      },
      animation: {
        'fade-up':  'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'pop':      'pop 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
        'slide-in': 'slideIn 0.4s cubic-bezier(0.16,1,0.3,1) both',
        'toast-in': 'toastIn 0.4s cubic-bezier(0.16,1,0.3,1) both',
        'float':    'float 6s ease-in-out infinite',
        'shimmer':  'shimmer 2s linear infinite',
        'spin-slow':'spin 18s linear infinite',
      },
      keyframes: {
        fadeUp:  { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        pop:     { '0%': { opacity: '0', transform: 'scale(0.92)' },     '100%': { opacity: '1', transform: 'scale(1)' } },
        slideIn: { '0%': { opacity: '0', transform: 'translateX(-12px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        toastIn: { '0%': { opacity: '0', transform: 'translateY(20px) scale(0.95)' }, '100%': { opacity: '1', transform: 'translateY(0) scale(1)' } },
        float:   { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-12px)' } },
        shimmer: { '0%': { backgroundPosition: '-1000px 0' }, '100%': { backgroundPosition: '1000px 0' } },
      },
    },
  },
  plugins: [],
};
