/**
 * AI CONTEXT:
 * This file is part of the CAPSTONE_SP26_FE_Mobile project.
 * Core React Native utility, navigation, state, or hook logic.
 * Rule: DO NOT modify existing code logic.
 */
import { ClassValue, clsx } from "clsx";
import { format, isValid } from "date-fns";
import { vi } from "date-fns/locale";

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

/**
 * Formats a date string to DD/MM/YYYY.
 * Handles ISO strings and already formatted strings.
 */
export function formatDate(dateStr: string | undefined): string {
  if (!dateStr || dateStr === "N/A" || dateStr === "Chưa rõ") return "—";

  // If it's already in DD/MM/YYYY format, return it as is
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;

  try {
    const date = new Date(dateStr);
    if (!isValid(date)) return "—";
    
    return format(date, "dd/MM/yyyy", { locale: vi });
  } catch {
    return "—";
  }
}

export function formatDistance(km: number | string): string {
  const distance = typeof km === "string" ? parseFloat(km) : km;
  return `${distance} km`;
}

/**
 * Checks if a date (DD/MM/YYYY) is earlier than today.
 * Today is dynamic using the current system date.
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
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return jobDate.getTime() < today.getTime();
  }
  
  // Normal ISO or other formats
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date.getTime() < today.getTime();
}

/**
 * Checks if a date (DD/MM/YYYY) is in the future (after today).
 */
export function isFutureDate(dateStr: string): boolean {
  if (!dateStr || dateStr === "N/A" || dateStr === "Chưa rõ") return false;
  
  let targetDate: Date;
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    targetDate = new Date(year, month, day);
  } else {
    targetDate = new Date(dateStr);
  }

  if (isNaN(targetDate.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return targetDate.getTime() > today.getTime();
}

/**
 * Checks if a date string matches today's date.
 * Supports DD/MM/YYYY and ISO formats.
 */
export function isToday(dateStr: string): boolean {
  if (!dateStr || dateStr === "N/A" || dateStr === "Chưa rõ") return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let targetDate: Date;
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed
    const year = parseInt(parts[2], 10);
    targetDate = new Date(year, month, day);
  } else {
    targetDate = new Date(dateStr);
  }

  if (isNaN(targetDate.getTime())) return false;
  targetDate.setHours(0, 0, 0, 0);

  return targetDate.getTime() === today.getTime();
}

/**
 * Checks if today is present in a list of work dates.
 */
export function isTodayInList(dateList: string[]): boolean {
  if (!dateList || dateList.length === 0) return false;
  return dateList.some(dateStr => isToday(dateStr));
}

/**
 * Checks if the current date is past the end date + a grace period.
 * Example: endDate = March 29. Grace = 1 day. 
 * Remains valid until end of March 30 (23:59).
 * returns true if the grace period has EXPIRED (it is now March 31).
 */
export function isPastEndDateWithGrace(endDateStr: string, graceDays = 1): boolean {
  if (!endDateStr) return false;
  
  let endDate: Date;
  const parts = endDateStr.split("/");
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    endDate = new Date(year, month, day);
  } else {
    endDate = new Date(endDateStr);
  }

  if (isNaN(endDate.getTime())) return false;

  // expirationDate is the FIRST day it becomes invalid.
  // If endDate is March 29 and grace is 1 day, it's valid on 29 and 30.
  // It expires on March 31.
  const expirationDate = new Date(endDate);
  expirationDate.setDate(expirationDate.getDate() + graceDays + 1);
  expirationDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return today.getTime() >= expirationDate.getTime();
}
