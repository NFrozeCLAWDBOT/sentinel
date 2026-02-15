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
        background: "#1A1614",
        surface: "#2D2825",
        "surface-elevated": "#3B3432",
        border: "#4A4040",
        primary: "#D4691A",
        "primary-bright": "#FBBF24",
        accent: "#B8520F",
        danger: "#DC2626",
        warning: "#EA580C",
        medium: "#D97706",
        low: "#44403C",
        "text-primary": "#F5F0EB",
        "text-secondary": "#A8A29E",
        "text-muted": "#78716C",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "monospace"],
        sans: ["Space Grotesk", "sans-serif"],
      },
    },
  },
  plugins: [],
}
