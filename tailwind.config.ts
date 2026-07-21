import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        emerald: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf", // Vibrant turquoise/teal (remplace le violet froid)
          450: "#14b8a6", // Bright teal
          500: "#0d9488", // Deep emerald/teal (boutons dominants)
          600: "#0f766e",
          700: "#115e59",
          800: "#134e4a",
          950: "#042f2e", // Deep dark teal background
        },
        cyan: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24", // Luminous golden amber (le jaune or d'avant)
          455: "#f59e0b", // Vibrant gold
          500: "#d97706", // Electric amber/orange
          600: "#b45309",
          700: "#92400e",
          800: "#78350f",
          950: "#451a03", // Warm dark background accent
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;
