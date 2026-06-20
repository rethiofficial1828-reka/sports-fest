import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", ".dark"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./frontend/**/*.{js,ts,jsx,tsx,mdx}",
    "./backend/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#FF5722",
          secondary: "#1A1A2E",
          accent: "#FFD700",
          surface: "#16213E",
          muted: "#0F3460",
        },
        sport: {
          cricket: "#2ECC71",
          football: "#3498DB",
          basketball: "#E67E22",
          chess: "#9B59B6",
          athletics: "#E74C3C",
          tennis: "#1ABC9C",
          kabaddi: "#F39C12",
          swimming: "#27AEF5",
          badminton: "#1ABC9C",
          volleyball: "#9B59B6",
          "table-tennis": "#E74C3C",
          throwball: "#FF5722",
        },
        status: {
          live: "#00FF88",
          upcoming: "#FFD700",
          closed: "#FF4444",
          online: "#00BFFF",
          offline: "#FF5722",
          hybrid: "#9B59B6",
        },
      },
      fontFamily: {
        display: ["Barlow Condensed", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        card: "12px",
        btn: "8px",
      },
      boxShadow: {
        card: "0 4px 24px rgba(255,87,34,0.15)",
        "card-hover": "0 8px 40px rgba(255,87,34,0.3)",
        glow: "0 0 30px rgba(255,87,34,0.4)",
        "glow-gold": "0 0 30px rgba(255,215,0,0.4)",
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, #1A1A2E 0%, #16213E 40%, #0F3460 70%, #FF5722 100%)",
        "card-gradient": "linear-gradient(145deg, #16213E, #1A1A2E)",
        "orange-gradient": "linear-gradient(135deg, #FF5722, #FF8A50)",
        "gold-gradient": "linear-gradient(135deg, #FFD700, #FFA500)",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 2s infinite",
        "float-slow": "float 8s ease-in-out 4s infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "slide-up": "slide-up 0.3s ease-out",
        "slide-down": "slide-down 0.3s ease-out",
        "fade-in": "fade-in 0.4s ease-out",
        "marquee": "marquee 30s linear infinite",
        "spin-slow": "spin 8s linear infinite",
        "bounce-light": "bounce-light 2s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(255,87,34,0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(255,87,34,0.6)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "bounce-light": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      transitionDuration: {
        hover: "200ms",
        transition: "300ms",
      },
    },
  },
  plugins: [],
};

export default config;
