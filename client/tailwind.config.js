/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
      },
      colors: {
        memorial: {
          DEFAULT: '#F8FAFC',
          ink: '#0F172A',
          muted: '#64748B',
          accent: '#4F46E5',
          line: '#E2E8F0',
          card: '#FFFFFF',
        },
      },
      maxWidth: {
        // Allow `sm:` styles to activate on laptops/desktops.
        // Previously capped at 480px, which kept the app in "mobile" layout mode.
        'app': '720px'
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
