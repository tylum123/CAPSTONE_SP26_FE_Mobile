import { ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number | string): string {
  const num =
    typeof amount === "string" ? parseFloat(amount.replace(/,/g, "")) : amount;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  })
    .format(num)
    .replace("₫", "đ");
}

export function formatDistance(km: number | string): string {
  const distance = typeof km === "string" ? parseFloat(km) : km;
  return `${distance} km`;
}

/**
 * Checks if a date (DD/MM/YYYY) is earlier than today.
 * For demo purposes, "today" is set to March 23, 2026.
 */
export function isPastDate(dateStr: string): boolean {
  if (!dateStr) return false;
  // Handle DD/MM/YYYY
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed
    const year = parseInt(parts[2], 10);
    const jobDate = new Date(year, month, day);
    
    // For demo context, fix Today to 2026-03-23
    const today = new Date(2026, 2, 23); // March is 2
    return jobDate.getTime() < today.getTime();
  }
  
  // Normal ISO or other formats
  const date = new Date(dateStr);
  const today = new Date(2026, 2, 23);
  return date.getTime() < today.getTime();
}
