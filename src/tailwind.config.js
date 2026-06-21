// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "primary-dark": "#0D0D0D",
        primary: "#1A1A1A",
        "primary-light": "#2D2D2D",
        accent: "#C9A84C",
        "accent-light": "#E8D5A3",
        "accent-hover": "#B8962E",
        text: "#F5F5F5",
        "text-secondary": "#D4D4D4",
        "text-muted": "#8A8A8A",
        border: "#3D3D3D",
        "border-light": "#4A4A4A",
      },
      fontFamily: {
        serif: ["Playfair Display", "serif"],
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        gold: "0 0 30px rgba(201, 168, 76, 0.15)",
        "gold-lg": "0 0 60px rgba(201, 168, 76, 0.25)",
      },
      backgroundImage: {
        "gradient-gold":
          "linear-gradient(135deg, #C9A84C 0%, #E8D5A3 50%, #C9A84C 100%)",
        "gradient-dark": "linear-gradient(180deg, #1A1A1A 0%, #0D0D0D 100%)",
      },
    },
  },
  plugins: [],
};
