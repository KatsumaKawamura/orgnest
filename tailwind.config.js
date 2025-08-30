/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}", // ← 将来のため（使ってなければ無害）
    "./src/**/*.{js,ts,jsx,tsx}", // ← 同上
    "./constants/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#ece9e5", // ← これで `bg-surface` が使える
        },
      },
    },
  },
  plugins: [],
};
