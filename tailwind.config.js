/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          main: '#0C0D12',
          card: '#14161F',
          elevated: '#1D202D',
          hover: '#25293A',
          border: '#2C3142',
        },
        brand: {
          amber: '#F59E0B',
          'amber-hover': '#D97706',
          sky: '#38BDF8',
          green: '#10B981',
          rose: '#F43F5E',
        },
        slate: {
          main: '#F8FAFC',
          muted: '#94A3B8',
          subtle: '#64748B',
        }
      },
      keyframes: {
        pulseSlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        }
      },
      animation: {
        'pulse-slow': 'pulseSlow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
