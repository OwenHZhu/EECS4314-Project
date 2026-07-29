/**
 * ./tailwind.config.js
 * 
 * Tailwind CSS configuration file.
 *
 * - Specifies which files Tailwind should scan for class names.
 * - Extends the default theme with a large set of custom colors
 *   used throughout the application (global UI, auth pages, navbar,
 *   profile pages, and logout modal).
 * - Uses Tailwind's JIT engine to generate only the classes actually used.
 */

/** @type {import('tailwindcss').Config} */
export default {
  // Files Tailwind should scan for utility class usage
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx,css}"],

  theme: {
    extend: {
      colors: {
        // Global application colours
        'background': '#070303',
        'primary': '#F9EDCC',
        'secondary': '#8A3033',
        'tertiary': '#BFB8AD',
        'caption': '#444',

        // Generic Button colours
        'generic-button-text': '#F9EDCC',
        'generic-button-text-hover': '#C6C1B3',

        'generic-button-primary-fill': '#8A3033',
        'generic-button-primary-fill-hover': '#6A282A',

        'generic-button-secondary-fill': '#697672',
        'generic-button-secondary-fill-hover': '#5A6260',

        'generic-button-ghost-border': '#5A4B4B',
        'generic-button-ghost-border-hover': '#7E7272',
        'generic-button-ghost-fill-hover': '#302D2D',

        'generic-button-spoilers-fill': '#350E0E',
        'generic-button-spoilers-border': '#E51D27',
        'generic-button-spoilers-text': '#F9CACC',

        'generic-button-questions-fill': '#1E3C36',
        'generic-button-questions-border': '#22C9A8',
        'generic-button-questions-text': '#CFE8ED',


        'generic-button-theories-fill': '#103019',
        'generic-button-theories-border': '#2CD532',
        'generic-button-theories-text': '#CCEED6',

        // Login & registration page colours
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
        'nav-border': '#222',

        // Profile page colours
        'bio': '#666',
        'edit-profile': '#8A3033',
        'edit-profile-hover': '#661A1C',
        'view-posts': '#5A4B4B',
        'view-posts-hover': '#413333',
        'stat-card-fill': '#151111',
        'stat-card-border': '#3A2A2A',

        // Logout confirmation card colours
        'card-fill': '#1E1615',
        'card-stroke': '#4A2422',
        'cancel-stroke': '#5A4B4B',
        'logout-hover': '#661A1C',

        // Edit profile form colours
        'container-fill': '#151111',
        'input-stroke': '#3A2A2A',

        // Book details modal colours
        'book-rating': '#F4C542',
        'book-rating-empty': '#766F5D',
        'book-favourite': '#DC264A',
        'book-status-read': '#10B981',
        "book-action": "#E51D27",
        "book-action-hover": "#B91620",
      }
    },
  },

  // No additional Tailwind plugins used
  plugins: [],
};
