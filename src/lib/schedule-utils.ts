import type { Availability } from "@/types";

// Helper: convert time string to minutes from midnight
export function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

// Helper: convert minutes from midnight to time string
export function minutesToTime(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
}

// Helper: calculate the width percentage for a time range in a day schedule
export function getTimeRangePercentage(start: string, end: string): { left: number; width: number } {
  const dayStart = 6 * 60; // 6:00 AM
  const dayEnd = 22 * 60; // 10:00 PM
  const dayRange = dayEnd - dayStart;
  
  const startMin = timeToMinutes(start);
  const endMin = timeToMinutes(end);
  
  const left = ((startMin - dayStart) / dayRange) * 100;
  const width = ((endMin - startMin) / dayRange) * 100;
  
  return {
    left: Math.max(0, Math.min(100, left)),
    width: Math.max(0, Math.min(100 - left, width)),
  };
}

// Preset schedule templates
export const PRESET_SCHEDULES = [
  { label: "9 AM - 5 PM", start: "09:00", end: "17:00" },
  { label: "10 AM - 6 PM", start: "10:00", end: "18:00" },
  { label: "8 AM - 6 PM", start: "08:00", end: "18:00" },
  { label: "Custom", start: "09:00", end: "17:00" },
];

// Lunch break presets
export const LUNCH_PRESETS = [
  { label: "12 PM - 1 PM", start: "12:00", end: "13:00" },
  { label: "1 PM - 2 PM", start: "13:00", end: "14:00" },
  { label: "12:30 PM - 1:30 PM", start: "12:30", end: "13:30" },
];

// Check if an availability entry is a lunch break
export function isLunchBreak(entry: Availability): boolean {
  if (entry.isBlocked) return false;
  return entry.startTime >= "11:00" && entry.startTime <= "14:00" && entry.endTime <= "15:00";
}

// Get entry type for styling
export function getEntryType(entry: Availability): "availability" | "lunch" | "blocked" {
  if (entry.isBlocked) return "blocked";
  if (isLunchBreak(entry)) return "lunch";
  return "availability";
}
