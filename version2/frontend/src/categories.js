export const CATEGORIES = [
  { name: "Food", color: "#e3a21a" },
  { name: "Transport", color: "#1f7a72" },
  { name: "Rent", color: "#16233b" },
  { name: "Utilities", color: "#6b8fb5" },
  { name: "Shopping", color: "#b4372f" },
  { name: "Health", color: "#7a9a4a" },
  { name: "Other", color: "#8b8f98" },
];

export const colorFor = (name) =>
  CATEGORIES.find((c) => c.name === name)?.color || "#8b8f98";

export const money = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n || 0);
