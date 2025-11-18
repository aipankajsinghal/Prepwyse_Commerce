import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body: ['Crimson Pro', 'Georgia', 'serif'],
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        serif: ['Crimson Pro', 'Georgia', 'serif'],
      },
      colors: {
        // Design System Colors using CSS variables
        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          light: 'rgb(var(--primary-light) / <alpha-value>)',
          dark: 'rgb(var(--primary-dark) / <alpha-value>)',
        },
        accent: {
          1: 'rgb(var(--accent-1) / <alpha-value>)',
          '1-light': 'rgb(var(--accent-1-light) / <alpha-value>)',
          '1-dark': 'rgb(var(--accent-1-dark) / <alpha-value>)',
          2: 'rgb(var(--accent-2) / <alpha-value>)',
          '2-light': 'rgb(var(--accent-2-light) / <alpha-value>)',
          '2-dark': 'rgb(var(--accent-2-dark) / <alpha-value>)',
        },
        surface: {
          DEFAULT: 'rgb(var(--surface) / <alpha-value>)',
          elevated: 'rgb(var(--surface-elevated) / <alpha-value>)',
        },
        text: {
          primary: 'rgb(var(--text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
          muted: 'rgb(var(--text-muted) / <alpha-value>)',
        },
        semantic: {
          success: 'rgb(var(--success) / <alpha-value>)',
          warning: 'rgb(var(--warning) / <alpha-value>)',
          error: 'rgb(var(--error) / <alpha-value>)',
          info: 'rgb(var(--info) / <alpha-value>)',
        },
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
      },
      animation: {
        "reveal": "reveal 0.6s cubic-bezier(0.4, 0, 0.2, 1) both",
        "float": "float 4s ease-in-out infinite",
        "pulse-subtle": "pulse-subtle 3s ease-in-out infinite",
        "bloom": "bloom 0.6s ease-out",
        "slide-in-right": "slide-in-right 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-in-bottom": "slide-in-bottom 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        "scale-in": "scale-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      },
      keyframes: {
        reveal: {
          "from": { opacity: "0", transform: "translateY(20px)" },
          "to": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "pulse-subtle": {
          "0%, 100%": { boxShadow: "0 4px 12px rgba(183, 73, 50, 0.3)" },
          "50%": { boxShadow: "0 4px 20px rgba(183, 73, 50, 0.45)" },
        },
        bloom: {
          "0%": { transform: "scale(0)", opacity: "0.8" },
          "100%": { transform: "scale(2)", opacity: "0" },
        },
        "slide-in-right": {
          "from": { transform: "translateX(100%)", opacity: "0" },
          "to": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-bottom": {
          "from": { transform: "translateY(100%)", opacity: "0" },
          "to": { transform: "translateY(0)", opacity: "1" },
        },
        "scale-in": {
          "from": { transform: "scale(0.95)", opacity: "0" },
          "to": { transform: "scale(1)", opacity: "1" },
        },
      },
      backgroundImage: {
        'gradient-warm': 'var(--gradient-warm)',
      },
    },
  },
  plugins: [],
};

export default config;
