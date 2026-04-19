import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "bk-blue": "#0F172A",
        "bk-blue-dk": "#0B1121",
        "bk-blue-700": "#1E293B",
        "bk-cta": "#4F46E5",
        "bk-cta-hover": "#4338CA",
        "bk-cta-active": "#3730A3",
        "bk-cta-soft": "#EEF2FF",
        "bk-amber": "#F59E0B",
        "bk-amber-soft": "#FEF3C7",
        "bk-green": "#10B981",
        "bk-green-soft": "#D1FAE5",
        "bk-red": "#EF4444",
        "bk-red-soft": "#FEE2E2",
        "bk-star": "#FBBF24",
        bg: "#F8FAFC",
        feature: "#F1F5F9",
        heading: "#0F172A",
        body: "#334155",
        muted: "#64748B",
        "muted-2": "#94A3B8",
        border: "#E2E8F0",
        "border-dk": "#CBD5E1",
      },
      fontFamily: {
        sans: [
          "var(--font-jakarta)",
          "Plus Jakarta Sans",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      borderRadius: {
        sm: "8px",
        md: "16px",
        lg: "24px",
        pill: "999px",
      },
      boxShadow: {
        sm: "0 1px 3px rgba(15, 23, 42, 0.08)",
        DEFAULT: "0 4px 15px rgba(15, 23, 42, 0.05)",
        md: "0 10px 20px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.04)",
        lg: "0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 10px 10px -5px rgba(15, 23, 42, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
