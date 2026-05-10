import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        clinical: {
          blue: "#1f6feb",
          navy: "#102a43",
          ink: "#243b53",
          mist: "#eef6ff",
          line: "#d9e8f6",
          calm: "#6b879f",
          mint: "#dff7ed",
          amber: "#fff3d6",
          rose: "#ffe8e8"
        }
      },
      boxShadow: {
        soft: "0 18px 55px rgba(16, 42, 67, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
