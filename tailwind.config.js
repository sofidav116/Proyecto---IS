/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Space Grotesk'", "'Sora'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      colors: {
        navyDeep: "#0F1B33",
        navy: "#152449",
        navyCard: "#1B2C55",
        bg: "#F4F6FB",
        border: "#E4E8F1",
        ink: "#131A2C",
        muted: "#64708A",
        faint: "#93A0BD",
        blue: "#2F6FED",
        blueSoft: "#EAF1FF",
        green: "#12946B",
        greenSoft: "#E7F7F1",
        amber: "#C6800A",
        amberSoft: "#FCF1DC",
        red: "#D6414B",
        redSoft: "#FBE9EA",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15,27,51,0.04), 0 8px 24px -12px rgba(15,27,51,0.10)",
      },
    },
  },
  plugins: [],
}

