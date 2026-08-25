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
          deep: "#09090b",
          surface: "#111114",
          elevated: "#18181c",
        },
        border: {
          subtle: "rgba(255, 255, 255, 0.08)",
          hover: "rgba(255, 255, 255, 0.16)",
        },
        text: {
          primary: "#f4f4f6",
          secondary: "#a1a1aa",
          muted: "#71717a",
        },
        accent: {
          DEFAULT: "#3b82f6",
          hover: "#2563eb",
          muted: "rgba(59, 130, 246, 0.12)",
        },
        // shadcn-style semantic tokens used across dashboard pages
        background: "#09090b",
        foreground: "#f4f4f6",
        muted: "rgba(255, 255, 255, 0.06)",
        "muted-foreground": "#a1a1aa",
        destructive: "#ef4444",
        "destructive-foreground": "#fecaca",
        success: "#34d399",
        warning: "#fbbf24",
        primary: {
          DEFAULT: "#3b82f6",
          foreground: "#ffffff",
        },
        input: "rgba(255, 255, 255, 0.12)",
        ring: "#3b82f6",
      },
      fontFamily: {
        sans: ["var(--font-body-face, Inter)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        display: ["var(--font-display-face, 'Space Grotesk')", "Inter", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius, 0.75rem)",
        md: "calc(var(--radius, 0.75rem) - 2px)",
        sm: "calc(var(--radius, 0.75rem) - 4px)",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.23, 1, 0.32, 1)",
        "in-out": "cubic-bezier(0.77, 0, 0.175, 1)",
      },
      transitionDuration: {
        fast: "120ms",
        normal: "200ms",
        slow: "350ms",
      },
    },
  },
  plugins: [],
};

export default config;
