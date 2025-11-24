/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#D97706", // amber-600
        "background-light": "#FFF7ED", // orange-50
        "background-dark": "#1F2937", // gray-800
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        sans: ["Poppins", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "1rem",
        xl: "1.5rem",
      },
    },
  },
  plugins: [],
}
