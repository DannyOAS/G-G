/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['"Work Sans"', 'sans-serif'],
      },
      colors: {
        blush: {
          50: '#fff5f8',
          100: '#ffe6ef',
          200: '#ffbfd6',
          300: '#ff94bb',
          400: '#ff6ca2',
          500: '#ff3b83',
          600: '#db1d6b',
          700: '#a31251',
          800: '#6b0a35',
          900: '#3c021d'
        }
      },
      backgroundImage: {
        'pink-gradient': 'linear-gradient(135deg, #ffe6ef 0%, #ff94bb 50%, #ff3b83 100%)'
      },
      boxShadow: {
        glow: '0 0 40px rgba(255, 107, 162, 0.35)'
      }
    },
  },
  plugins: [],
};
