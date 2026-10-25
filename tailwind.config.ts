import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        card: "var(--surface)",
        foreground: "var(--foreground)",
        muted: "var(--muted)",
        border: "var(--border)",
        pine: {
          50: "#EAF4EE",
          100: "#D4E8DC",
          200: "#ABD1BC",
          300: "#7FB99C",
          400: "#4EA07B",
          500: "#2A7B5F",
          600: "#1E5C45",
          700: "#174836",
          800: "#103427",
          900: "#092018",
          950: "#04100C",
        },
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          subtle: "var(--primary-subtle)",
          foreground: "var(--primary-foreground)",
        },
        status: {
          amatBaik: "#166534",
          baik: "#1D4ED8",
          cukup: "#B45309",
          pembinaan: "#B91C1C",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "Inter", "system-ui", "-apple-system", "sans-serif"],
        serif: ["Georgia", "serif"],
      },
      borderRadius: {
        control: "8px",
        panel: "14px",
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
