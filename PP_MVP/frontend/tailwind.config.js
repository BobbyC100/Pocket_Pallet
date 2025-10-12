/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Wine-inspired palette - earthy, warm, confident
        wine: {
          50: '#fdf8f6',
          100: '#f7ede8',
          200: '#eddad0',
          300: '#e0bfad',
          400: '#cf9d87',
          500: '#c17d66',
          600: '#a85d4a',
          700: '#8b4839',
          800: '#733d31',
          900: '#5f352b',
        },
        clay: {
          50: '#f9f7f4',
          100: '#f0ebe3',
          200: '#e0d5c5',
          300: '#ccb9a2',
          400: '#b69a7d',
          500: '#9f7f60',
          600: '#8a6a4f',
          700: '#715542',
          800: '#5d4739',
          900: '#4c3b30',
        },
        sage: {
          50: '#f6f7f4',
          100: '#e8ebe3',
          200: '#d1d7c7',
          300: '#b2bda2',
          400: '#8f9d78',
          500: '#728259',
          600: '#5a6744',
          700: '#475238',
          800: '#3a4230',
          900: '#30372a',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
      // Text colors optimized for contrast on light backgrounds (WCAG AA compliant)
      textColor: {
        // Use these on wine-50, clay-50, sage-50, or any light background
        'body': '#374151',      // gray-700 equivalent - minimum for body text
        'heading': '#111827',   // gray-900 equivalent - for headings
        'muted': '#4B5563',     // gray-600 equivalent - only on white backgrounds
      },
    },
  },
  plugins: [],
}

