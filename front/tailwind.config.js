/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./public/**/*.html",
    "./src/**/*.{js,jsx,ts,tsx,mdx,mjs,cjs}",
  ],
  theme: {
    extend: {
      colors: {
        grape: "var(--grape)",
      },
    },
  },
  plugins: [],
};
