export const COLORS = {
  emerald: {
    50: "#ecfdf5",
    100: "#d1fae5",
    500: "#10b981",
    600: "#059669",
    700: "#047857",
  },
  teal: {
    400: "#2dd4bf",
    600: "#0d9488",
    700: "#0f766e",
  },
  gray: {
    50: "#f9fafb",
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
  white: "#ffffff",
  amber: {
    50: "#fffbeb",
    100: "#fef3c7",
    300: "#fcd34d",
    400: "#fbbf24",
    600: "#d97706",
  },
  rose: {
    500: "#f43f5e",
  },
  pink: {
    500: "#ec4899",
  },
  red: {
    50: "#fef2f2",
    600: "#dc2626",
  },
  blue: {
    50: "#eff6ff",
    600: "#2563eb",
    800: "#1e40af",
    900: "#1e3a8a",
  },
  slate: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
  },
};

export const SPACING = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
};

export const TYPOGRAPHY = {
  h1: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: COLORS.slate[900],
  },
  h2: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: COLORS.slate[900],
  },
  title: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: COLORS.slate[900],
  },
  subtitle1: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: COLORS.slate[800],
  },
  subtitle2: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: COLORS.slate[700],
  },
  body1: {
    fontSize: 15,
    fontWeight: "400" as const,
    color: COLORS.slate[600],
    lineHeight: 22,
  },
  body2: {
    fontSize: 14,
    fontWeight: "400" as const,
    color: COLORS.slate[600],
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: COLORS.slate[500],
  },
};
