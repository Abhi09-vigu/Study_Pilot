/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          900: '#0b0c0d',
          800: '#111213',
          700: '#17181a',
          600: '#1d1f22',
          500: '#22252a',
        },
        chalk: '#f5f7fa',
      },
      boxShadow: {
        chalk: '0 0 0 1px rgba(255,255,255,0.08) inset, 0 2px 8px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
};
