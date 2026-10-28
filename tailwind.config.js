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
          main: '#0B1020',
          card: '#151C30',
          elevated: '#1D2740',
          hover: '#24304F',
          border: '#29344D',
        },
        brand: {
          purple: '#8B5CF6',
          'purple-hover': '#7C3AED',
          cyan: '#22D3EE',
          'cyan-hover': '#06B6D4',
          green: '#34D399',
          rose: '#FB7185',
        },
        slate: {
          main: '#F1F5F9',
          muted: '#94A3B8',
          subtle: '#64748B',
        }
      },
      boxShadow: {
        'glow-purple': '0 0 20px -3px rgba(139, 92, 246, 0.25)',
        'glow-cyan': '0 0 20px -3px rgba(34, 211, 238, 0.25)',
        'glow-green': '0 0 20px -3px rgba(52, 211, 153, 0.25)',
        'glow-rose': '0 0 20px -3px rgba(251, 113, 133, 0.25)',
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
