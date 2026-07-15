/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: '#F5F6F8',
        surface: '#FFFFFF',
        ink: {
          DEFAULT: '#101828',
          soft: '#475467',
          faint: '#98A2B3',
        },
        navy: {
          50: '#EBF0F5',
          100: '#C7D4E1',
          400: '#3D5A78',
          500: '#16324F',
          600: '#112740',
          700: '#0C1D30',
          900: '#081521',
        },
        brass: {
          50: '#FBF2E4',
          100: '#F3DDB2',
          400: '#D9A441',
          500: '#C98A3E',
          600: '#A66E2E',
        },
        success: { 50: '#E6F4EC', 500: '#2F855A', 600: '#256B48' },
        danger: { 50: '#FBEAE8', 500: '#B42318', 600: '#8E1B12' },
        line: '#E4E7EC',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        card: '10px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,0.06), 0 1px 3px rgba(16,24,40,0.08)',
      },
    },
  },
  plugins: [],
};
