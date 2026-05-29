export const brandColors = [
  {
    className: "bg-primary-blue",
    hex: "#2563EB",
    name: "Primary Blue",
  },
  {
    className: "bg-deep-blue",
    hex: "#1E293B",
    name: "Deep Blue",
  },
  {
    className: "bg-light-blue",
    hex: "#60A5FA",
    name: "Light Blue",
  },
  {
    className: "bg-success-green",
    hex: "#10B981",
    name: "Success Green",
  },
] as const;

export const semanticColors = [
  {
    className: "bg-success",
    hex: "#10B981",
    name: "Success",
  },
  {
    className: "bg-warning",
    hex: "#F59E0B",
    name: "Warning",
  },
  {
    className: "bg-reserved",
    hex: "#F97316",
    name: "Reserved",
  },
  {
    className: "bg-out-of-stock",
    hex: "#EF4444",
    name: "Out of Stock",
  },
  {
    className: "bg-info",
    hex: "#3B82F6",
    name: "Info",
  },
] as const;

export const neutralColors = [
  {
    className: "bg-text-primary",
    hex: "#0F172A",
    name: "Text / Primary",
  },
  {
    className: "bg-text-secondary",
    hex: "#334155",
    name: "Text / Secondary",
  },
  {
    className: "bg-border-theme",
    hex: "#E2E8F0",
    name: "Border",
  },
  {
    className: "bg-surface",
    hex: "#F6F7FB",
    name: "Surface",
  },
  {
    className: "bg-background border border-border-theme",
    hex: "#FFFFFF",
    name: "Background",
  },
] as const;

export const colors = {
  background: "#FFFFFF",
  border: "#E2E8F0",
  deepBlue: "#1E293B",
  info: "#3B82F6",
  lightBlue: "#60A5FA",
  outOfStock: "#EF4444",
  primaryBlue: "#2563EB",
  reserved: "#F97316",
  success: "#10B981",
  surface: "#F6F7FB",
  textPrimary: "#0F172A",
  textSecondary: "#334155",
  warning: "#F59E0B",
} as const;
