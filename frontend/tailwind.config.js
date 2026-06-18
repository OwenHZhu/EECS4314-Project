/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx,css}"],
  theme: {
    extend: {
      colors: {
        'background': '#0C0707',
        'primary-text': '#F9EDCC',
        'secondary-text': '#8A3033',
        'tertiary-text': '#BFB8AD',
        'login-button': '#8A3033'
      }
    },
  },
  plugins: [],
};
