/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx,css}"],
  theme: {
    extend: {
      colors: {
        'background': '#0f0f0f',
        'primary': '#F9EDCC',
        'secondary': '#8A3033',
        'tertiary': '#BFB8AD',
        'login-button': '#8A3033',
        'login-hover': '#572426',
        'input-border': '#8A3033',
        'input-bg': '#151111',
        'input-placeholder': '#5A4B4B',
        'input': '#998888',
        'error-bg': '#231616',
        'error-text': '#725959',

        // Navbar colours
        'nav-bar-bg': '#0a0a0a/90',
        'nav-bar-border': '#1e1e1e',
        'nav-active-bg': '#1f0d0f',
        'nav-active-text': '#c89090',
        'nav-hover-text': '#aaa',
        'nav-text': '#666',
        'nav-active-border': '#743121', 
        'nav-hover-border': '#333',
        'nav-border': '#222'
      }
    },
  },
  plugins: [],
};
