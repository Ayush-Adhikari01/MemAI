/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Geist"', '"Outfit"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        heading: ['"Outfit"', '"Geist"', 'sans-serif'],
        mono: ['"Geist Mono"', '"JetBrains Mono"', 'monospace'],
      },
      colors: {
        midnight: {
          950: '#04060a',
          900: '#06080f',
          850: '#090d16',
          800: '#0d121f',
          750: '#111728',
          700: '#172036',
          600: '#1e2945',
        },
        violet: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        },
        indigo: {
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        teal: {
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
        }
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px rgba(139, 92, 246, 0.25)',
        'glow-md': '0 0 25px -4px rgba(139, 92, 246, 0.35)',
        'glow-lg': '0 0 40px -5px rgba(99, 102, 241, 0.4)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.35)',
        'glow-teal': '0 0 25px -5px rgba(20, 184, 166, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'orb-pulse': 'orbPulse 6s ease-in-out infinite',
        'orb-float': 'orbFloat 8s ease-in-out infinite',
        'glow-shimmer': 'shimmer 3s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        orbPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.08)', opacity: '1' },
        },
        orbFloat: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
