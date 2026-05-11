import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          500: "#3a5187",
          600: "#263c6e",
          700: "#1B2A54",
          800: "#132043",
          900: "#0E1830",
        },
        red: {
          50: "#F4E4E4",
          400: "#C37374",
          500: "#A85658",
          600: "#944547",
        },
        beige: {
          50: "#FAF6EF",
          100: "#F4ECDD",
          200: "#ECE0C7",
          300: "#DDCDA9",
        },
        brown: {
          400: "#A68E71",
          500: "#8A745A",
          600: "#6F5A44",
          700: "#5A4632",
          900: "#3B2E22",
        },
        ink: {
          300: "#B8A58A",
          400: "#8A745A",
          500: "#6F5A44",
          700: "#3B2E22",
          900: "#1A1410",
        },
        stroke: {
          DEFAULT: "#E4D9C2",
          strong: "#CBB994",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "Menlo", "monospace"],
      },
      boxShadow: {
        sm: "0 1px 0 rgba(27,24,18,0.04), 0 1px 2px rgba(27,24,18,0.04)",
        md: "0 2px 4px rgba(27,24,18,0.06), 0 8px 20px -6px rgba(27,24,18,0.08)",
        lg: "0 12px 30px -8px rgba(27,24,18,0.18), 0 4px 10px rgba(27,24,18,0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
