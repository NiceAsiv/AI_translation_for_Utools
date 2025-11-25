/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'apple-blue': '#007aff',
        'apple-gray': '#86868b',
        'apple-bg': '#f5f5f7',
      },
      fontFamily: {
        'sf-pro': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'PingFang SC', 'Helvetica Neue', 'sans-serif'],
      },
      backdropBlur: {
        'apple': '20px',
      },
    },
  },
  plugins: [],
}
