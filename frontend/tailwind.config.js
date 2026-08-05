/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c'
        }
      },
      boxShadow: {
        soft: '0 18px 50px rgba(15, 23, 42, 0.10)'
      }
    }
  },
  plugins: []
};
