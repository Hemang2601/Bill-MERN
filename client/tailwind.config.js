/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#F7F8FC',
        surface: '#FFFFFF',
        border: '#E8ECF3',
        'border-hover': '#D4DCED',
        text: {
          primary: '#111827',
          secondary: '#64748B',
          muted: '#94A3B8',
        },
        brand: {
          blue: '#2563EB',
          'blue-hover': '#1D4ED8',
          'blue-light': '#EFF6FF',
          navy: '#172554',
          electric: '#0EA5E9',
          violet: '#7C3AED',
          emerald: '#10B981',
          amber: '#F59E0B',
          coral: '#F97316',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'premium': '0 4px 20px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.03)',
        'elevated': '0 12px 32px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04)',
      },
    },
  },
  plugins: [],
};
