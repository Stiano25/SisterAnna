/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'serif': ['Tahoma', 'Arial', 'sans-serif'],
        'sans': ['Tahoma', 'Arial', 'sans-serif'],
      },
      colors: {
        memorial: {
          DEFAULT: '#FDFAF6',
          ink: '#1A1510',
          muted: '#7A6F5F',
          accent: '#8B6B3D',
          line: '#E8E0D0',
          card: '#FFFFFF',
        },
      },
      maxWidth: {
        'app': '480px'
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
      }
    },
  },
  plugins: [],
}
