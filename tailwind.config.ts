import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-syne)', 'sans-serif'],
        body: ['var(--font-heebo)', 'sans-serif'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Deon Palette
        dark: {
          900: "#151515",
          800: "#1E1E1E",
          700: "#2A2A2A",
        },
        light: {
          50: "#F8F9FA",
          100: "#E9ECEF",
        },
        accent: {
          blue: "#3D5BF5", // Electric blue
          purple: "#7B61FF", // Soft purple
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-gradient": "linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%)",
        "primary-gradient": "linear-gradient(90deg, #3D5BF5 0%, #7B61FF 100%)",
        "deon-gradient": "linear-gradient(135deg, rgb(92, 195, 238) 0%, rgb(94, 94, 240) 50%, rgb(202, 151, 210) 100%)",
      },
      boxShadow: {
        'card': '0 10px 30px -10px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 20px 40px -10px rgba(61, 91, 245, 0.15)',
        'glow': '0 0 20px rgba(123, 97, 255, 0.5)',
      }
    },
  },
  plugins: [],
};
export default config;
