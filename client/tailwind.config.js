/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Oficial SIGIU - Iteraciones 3, 4 y 5 (Municipio de Oaxaca de Juárez)
        charcoal: {
          DEFAULT: '#151719',
          50: '#f6f7f7',
          100: '#e5e7e8',
          200: '#cbcfd1',
          300: '#a7aeb1',
          400: '#7d8589',
          500: '#5c6468',
          600: '#464d50',
          700: '#383d40',
          800: '#26292b',
          900: '#151719',
          950: '#0c0d0e',
        },
        slateGray: {
          DEFAULT: '#3F4B48',
          50: '#f5f7f6',
          100: '#e6ebe9',
          200: '#ced7d4',
          300: '#a9b8b3',
          400: '#7e948d',
          500: '#61766f',
          600: '#4c5d57',
          700: '#3F4B48',
          800: '#343f3c',
          900: '#2b3432',
        },
        mediumGray: {
          DEFAULT: '#7D8181',
          300: '#a8abab',
          400: '#929696',
          500: '#7D8181',
          600: '#686c6c',
          700: '#555858',
        },
        softSlate: {
          DEFAULT: '#A9AFB2',
          50: '#fafbfb',
          100: '#f3f5f5',
          200: '#e7eaeb',
          300: '#d5dadc',
          400: '#bdc4c7',
          500: '#A9AFB2',
          600: '#8e969a',
          700: '#737b7f',
        },
        lotusWhite: {
          DEFAULT: '#D0D4D7',
          50: '#ffffff',
          100: '#f7f8f9',
          200: '#edf0f1',
          300: '#dfe3e5',
          400: '#D0D4D7',
          500: '#b8bec2',
          600: '#9fa6ab',
        },

        // Mapeo retrocompatible con la nueva paleta oficial
        royal: {
          DEFAULT: '#151719', // Charcoal Dark
          50: '#f6f7f7',
          100: '#e5e7e8',
          200: '#cbcfd1',
          300: '#a7aeb1',
          400: '#7d8589',
          500: '#5c6468',
          600: '#464d50',
          700: '#383d40',
          800: '#26292b',
          900: '#151719',
          950: '#0c0d0e',
        },
        sapphire: {
          DEFAULT: '#3F4B48', // Slate Gray
          50: '#f5f7f6',
          100: '#e6ebe9',
          200: '#ced7d4',
          300: '#a9b8b3',
          400: '#7e948d',
          500: '#61766f',
          600: '#4c5d57',
          700: '#3F4B48',
          800: '#343f3c',
          900: '#2b3432',
        },
        quicksand: {
          DEFAULT: '#7D8181', // Medium Gray accent
          50: '#fbfcfc',
          100: '#f4f5f5',
          200: '#e8eaec',
          300: '#d7dbdd',
          400: '#A9AFB2',
          500: '#7D8181',
          600: '#676b6b',
          700: '#545858',
          800: '#3F4B48',
          900: '#151719',
        },
        swan: {
          DEFAULT: '#D0D4D7', // Lotus White
          50: '#ffffff',
          100: '#f7f8f9',
          200: '#edf0f1',
          300: '#dfe3e5',
          400: '#D0D4D7',
          500: '#b8bec2',
        },
        shellstone: {
          DEFAULT: '#A9AFB2', // Soft Slate
          100: '#f3f5f5',
          200: '#e7eaeb',
          300: '#A9AFB2',
          400: '#8e969a',
          500: '#737b7f',
          600: '#5d6468',
          700: '#4a5054',
          800: '#393e41',
          900: '#2a2e30',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'sigiu-card': '0 4px 20px -2px rgba(21, 23, 25, 0.08), 0 2px 6px -1px rgba(21, 23, 25, 0.04)',
        'sigiu-elevated': '0 10px 30px -5px rgba(21, 23, 25, 0.22)',
        'sigiu-glow': '0 0 15px rgba(63, 75, 72, 0.35)',
        'oaxaca-card': '0 4px 20px -2px rgba(21, 23, 25, 0.08), 0 2px 6px -1px rgba(21, 23, 25, 0.04)',
        'oaxaca-gold': '0 4px 25px -4px rgba(125, 129, 129, 0.45)',
        'oaxaca-deep': '0 10px 30px -5px rgba(21, 23, 25, 0.30)',
      }
    },
  },
  plugins: [],
}
