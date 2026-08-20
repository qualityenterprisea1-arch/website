import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./content/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        kraft: "#C69C6D",
        "kraft-lt": "#E3D3BC",
        "kraft-dp": "#8B6740",
        ink: "#1A1613",
        "ink-soft": "#4A4038",
        ultra: "#1D3FBF",
        paper: "#F7F4EF",
      },
      borderRadius: { brand: "18px" },
      boxShadow: { hard: "6px 6px 0 #8B6740" },
    },
  },
  plugins: [],
};

export default config;
