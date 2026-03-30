import type { Availability, Booking, TimeOff } from "@/types";
import { toLocalDateKey } from "@/lib/date";

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
}

function bookingBlocksSlot(slotStart: number, slotEnd: number, booking: Booking): boolean {
  if (booking.status === "CANCELLED") return false;
  const bookingStart = timeToMinutes(booking.startTime);
  const bookingEnd = timeToMinutes(booking.endTime);
  const occupiedEnd = bookingEnd;
  return slotStart < occupiedEnd && slotEnd > bookingStart;
}

export function getDayOfWeek(dateStr: string): number {
  return new Date(dateStr + "T00:00:00").getDay();
}

export function generateSlots(
  date: string,
  availability: Availability[],
  bookings: Booking[],
  timeoffs: TimeOff[],
  requiredMinutes?: number
): TimeSlot[] {
  const dow = getDayOfWeek(date);
  const dayAvail = availability.filter((a) => a.weekday === dow);
  if (dayAvail.length === 0) return [];

  const dayBookings = bookings.filter((b) => b.date === date && b.status !== "CANCELLED");
  const dayTimeoffs = timeoffs.filter((t) => t.date === date);

  const slots: TimeSlot[] = [];

  for (const avail of dayAvail) {
    const start = timeToMinutes(avail.startTime);
    const end = timeToMinutes(avail.endTime);
    const slotSize = Math.max(5, requiredMinutes ?? avail.slotMinutes);
    const step = avail.slotMinutes + avail.bufferMinutes;

    for (let t = start; t + slotSize <= end; t += step) {
      const slotStart = minutesToTime(t);
      const slotEnd = minutesToTime(t + slotSize);

      // Check booking overlap
      const booked = dayBookings.some((b) => bookingBlocksSlot(t, t + slotSize, b));
      if (booked) continue;

      // Check time-off overlap
      const offed = dayTimeoffs.some((to) => {
        const ts = timeToMinutes(to.startTime);
        const te = timeToMinutes(to.endTime);
        return t < te && t + slotSize > ts;
      });
      if (offed) continue;

      slots.push({ startTime: slotStart, endTime: slotEnd });
    }
  }

  return slots;
}

export function isHourOccupied(
  providerId: string,
  date: string,
  startTime: string,
  endTime: string,
  bookings: Booking[],
  excludeBookingId?: string
): boolean {
  const slotStart = timeToMinutes(startTime);
  const slotEnd = timeToMinutes(endTime);
  return bookings.some((b) => {
    if (b.providerId !== providerId || b.date !== date) return false;
    if (excludeBookingId && b.id === excludeBookingId) return false;
    return bookingBlocksSlot(slotStart, slotEnd, b);
  });
}

export function getNext14Days(): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = 1; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    days.push(toLocalDateKey(d));
  }
  return days;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
