/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // 🌿 Xanh lá (chủ đạo) - emerald
        primary: {
          50:  "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",  // primary default
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
        // 🌾 Vàng lúa chín (accent) - golden rice
        rice: {
          50:  "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",  // rice gold default
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        // 🩶 Xám trung tính
        neutral: {
          50:  "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
        },
        // Teal phụ trợ
        teal: {
          50:  "#f0fdfa",
          100: "#ccfbf1",
          400: "#2dd4bf",
          600: "#0d9488",
          700: "#0f766e",
        },
        // Trạng thái
        success:  "#10b981",
        warning:  "#f59e0b",
        error:    "#dc2626",
        info:     "#3b82f6",
      },
      fontFamily: {
        sans: ["System"],
      },
      borderRadius: {
        xs: "6px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "28px",
      },
    },
  },
  plugins: [],
};
