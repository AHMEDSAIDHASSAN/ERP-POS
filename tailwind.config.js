/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#111315",
        secondary: "#292C2D",
        light: "white",
        popular: "#FFBC0F",
      },
    },
  },
  plugins: [],
};
