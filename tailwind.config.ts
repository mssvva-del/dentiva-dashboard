import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#0A1929", 2: "#0F2440", 3: "#163055", light: "#0F2440" },
        teal: { DEFAULT: "#00897B", light: "#4DB6AC", bg: "#E0F2F1" },
        gold: { DEFAULT: "#C9A961", light: "#E8D9A8", bg: "#FAF0D7" },
        gray: {
          50: "#FAFBFC",
          100: "#F5F7FA",
          200: "#E2E8F0",
          300: "#CBD5E0",
          400: "#A0AEC0",
          500: "#718096",
          700: "#4A5568",
          900: "#1A2027",
        },
        success: { DEFAULT: "#2F855A", bg: "#C6F6D5" },
        warning: { DEFAULT: "#B7791F", bg: "#FEF3C7" },
        danger: { DEFAULT: "#C53030", bg: "#FED7D7" },
        info: { DEFAULT: "#1E40AF", bg: "#DBEAFE" },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        xs: "0 1px 2px rgba(10, 25, 41, 0.04)",
        sm: "0 2px 6px rgba(10, 25, 41, 0.05)",
        "brand-md": "0 4px 12px rgba(10, 25, 41, 0.07)",
        "brand-lg": "0 12px 32px rgba(10, 25, 41, 0.10)",
        glow: "0 0 0 4px rgba(0, 137, 123, 0.12)",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
