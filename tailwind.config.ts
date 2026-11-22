import type { Config } from "tailwindcss";

// Colours are CSS variables (app/globals.css), so light and dark mode share one set of class names.
const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        page: v("page"),
        card: v("card"),
        ink: v("ink"),
        muted: v("muted"),
        line: v("line"),
        gold: v("gold"),
        "gold-soft": v("gold-soft"),
        accent: v("accent"),
      },
      fontFamily: {
        ui: ["var(--font-nunito)", "system-ui", "sans-serif"],
        read: ["Iowan Old Style", "Palatino Linotype", "Book Antiqua", "Georgia", "serif"],
        tamil: ["var(--font-tamil)", "Noto Sans Tamil", "Latha", "Nirmala UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
