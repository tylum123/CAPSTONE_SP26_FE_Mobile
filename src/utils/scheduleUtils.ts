/* AI CONTEXT:
 * This file is part of the CAPSTONE_SP26_FE_Mobile project.
 * Helper functions and constants for formatting availability schedules.
 * Rule: DO NOT modify existing code logic.
 */

export const DAYS = [
  { id: "T2", label: "T2" }, { id: "T3", label: "T3" },
  { id: "T4", label: "T4" }, { id: "T5", label: "T5" },
  { id: "T6", label: "T6" }, { id: "T7", label: "T7" },
  { id: "CN", label: "CN" },
];

export const DAYS_ORDER = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export const LABELS_MAP: Record<string, string> = {
  T2: "Thứ 2", T3: "Thứ 3", T4: "Thứ 4", T5: "Thứ 5",
  T6: "Thứ 6", T7: "Thứ 7", CN: "Chủ nhật",
};

export function formatSchedule(schedule: string): string {
  if (!schedule || !schedule.trim()) return "";
  const selectedIds = schedule.split(", ").map(s => s.trim()).filter(id => !!LABELS_MAP[id]);
  if (selectedIds.length === 0) return "";
  if (selectedIds.length === 7) return "Cả tuần";
  const sorted = [...selectedIds].sort((a, b) => DAYS_ORDER.indexOf(a) - DAYS_ORDER.indexOf(b));
  if (sorted.length === 1) return LABELS_MAP[sorted[0]];
  const indices = sorted.map(id => DAYS_ORDER.indexOf(id));
  let consecutive = true;
  for (let i = 1; i < indices.length; i++) {
    if (indices[i] !== indices[i - 1] + 1) { consecutive = false; break; }
  }
  if (consecutive) return `${LABELS_MAP[sorted[0]]} đến ${LABELS_MAP[sorted[sorted.length - 1]].toLowerCase()}`;
  return sorted.map(id => LABELS_MAP[id]).join(", ");
}

export function formatScheduleShort(schedule: string): string {
  if (!schedule || !schedule.trim()) return "";
  const selectedIds = schedule.split(", ").map(s => s.trim()).filter(id => !!LABELS_MAP[id]);
  if (selectedIds.length === 0) return "";
  if (selectedIds.length === 7) return "Cả tuần";
  const sorted = [...selectedIds].sort((a, b) => DAYS_ORDER.indexOf(a) - DAYS_ORDER.indexOf(b));
  if (sorted.length > 1) {
    const indices = sorted.map(id => DAYS_ORDER.indexOf(id));
    let consecutive = true;
    for (let i = 1; i < indices.length; i++) {
      if (indices[i] !== indices[i - 1] + 1) { consecutive = false; break; }
    }
    if (consecutive) return `${sorted[0]} – ${sorted[sorted.length - 1]}`;
  }
  return sorted.join(", ");
}
