import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          deep: "#050508",
          surface: "#0a0a12",
          elevated: "#0f0f1a",
        },
        border: {
          subtle: "rgba(255, 255, 255, 0.06)",
          glow: "rgba(99, 102, 241, 0.3)",
        },
        text: {
          primary: "#f0f0f5",
          secondary: "#8b8ba3",
          muted: "#5b5b73",
        },
        accent: {
          blue: "#3b82f6",
          violet: "#8b5cf6",
          cyan: "#06b6d4",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
