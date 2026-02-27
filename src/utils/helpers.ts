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
