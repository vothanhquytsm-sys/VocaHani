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
        primary: 'var(--primary-color, #4f46e5)',
        success: 'var(--success-color, #10b981)',
        warning: 'var(--warning-color, #f59e0b)',
        danger: 'var(--danger-color, #ef4444)',
      },
      animation: {
        slideIn: 'slideIn 0.3s ease-out forwards',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        }
      }
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
}
