/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm Ivory + Dark Chocolate + Warm Taupe Figma Color System
        chocolate: {
          DEFAULT: '#603719', // Primary Chocolate
          deep: '#442514',    // Deep Chocolate
          dark: '#2E180D',
          light: '#8C5329',
          50: '#F9F5F0',
          100: '#F0E5D8',
          200: '#DFCBB5',
          300: '#C7A88A',
          400: '#A47D5A',
          500: '#7E4E29',
          600: '#603719',
          700: '#442514',
          800: '#2E180D',
          900: '#1F1008',
        },
        ivory: {
          DEFAULT: '#F3EFE7',
          cream: '#FAF7F1',
          border: '#E5DED3',
        },
        charcoal: {
          DEFAULT: '#292D32',
          50: '#F5F5F6',
          100: '#E5E6E8',
          200: '#CBCDD1',
          300: '#9DA1A8',
          400: '#6B7075', // Secondary Text
          500: '#484E55',
          600: '#373C42',
          700: '#2E3339',
          800: '#292D32', // Primary Charcoal & Primary Text
          900: '#1F2226',
          950: '#141618',
        },
        taupe: {
          DEFAULT: '#B9A58A', // Secondary Accent
          50: '#FAF8F5',
          100: '#F3EFE7', // Main Background
          200: '#ECE7DE', // Muted Surface
          300: '#E5E0D7', // Borders
          400: '#CBBBA5',
          500: '#B9A58A', // Secondary Accent
          600: '#A48E72',
          700: '#87735B',
          800: '#6B5B49',
          900: '#524639',
        },
        brand: {
          50: '#FAF8F5',
          100: '#F3EFE7', // Main Background
          200: '#ECE7DE', // Muted Surface
          300: '#E5E0D7', // Borders
          400: '#CBBBA5',
          500: '#B9A58A', // Secondary Accent
          600: '#292D32', // Primary Charcoal
          700: '#1F2226',
          800: '#181A1D',
          900: '#121416',
          950: '#0A0B0C',
        },
        surface: {
          bg: '#F3EFE7', // Main Background
          card: '#FFFFFF', // Card Background
          subtle: '#ECE7DE', // Muted Surface
          muted: '#ECE7DE',
          border: '#E5E0D7', // Borders
          primary: '#292D32', // Primary Text
          secondary: '#6B7075', // Secondary Text
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(41, 45, 50, 0.04), 0 1px 2px 0 rgba(41, 45, 50, 0.02)',
        card: '0 4px 14px 0 rgba(41, 45, 50, 0.06), 0 1px 3px 0 rgba(41, 45, 50, 0.03)',
        'card-hover': '0 14px 28px -4px rgba(41, 45, 50, 0.09), 0 8px 16px -4px rgba(185, 165, 138, 0.12)',
        glass: '0 8px 32px 0 rgba(41, 45, 50, 0.08)',
        glow: '0 0 25px -4px rgba(185, 165, 138, 0.35)',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'float-reverse': 'float-reverse 7s ease-in-out infinite',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'float-reverse': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(8px)' },
        }
      }
    },
  },
  plugins: [],
}
