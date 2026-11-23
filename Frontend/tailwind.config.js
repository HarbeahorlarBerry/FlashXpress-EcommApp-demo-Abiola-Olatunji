/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        primary: "#ff6a00",
        secondary: "#ff3c00",
        dark: "#0f172a",
        light: "#f8fafc",
      },

      boxShadow: {
        premium:
          "0 10px 30px rgba(0,0,0,0.1)",
      },
    },
  },

  plugins: [],
};