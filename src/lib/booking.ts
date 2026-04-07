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
  serviceDuration: number,
  serviceBuffer: number
): TimeSlot[] {
  const dow = getDayOfWeek(date);
  const dayAvail = availability.filter((a) => a.weekday === dow && !a.isBlocked);
  if (dayAvail.length === 0) return [];

  const dayBookings = bookings.filter((b) => b.date === date && b.status !== "CANCELLED");
  const dayTimeoffs = timeoffs.filter((t) => t.date === date);
  const dayBlocked = availability.filter((a) => a.weekday === dow && a.isBlocked);

  const slots: TimeSlot[] = [];

  for (const avail of dayAvail) {
    const availStart = timeToMinutes(avail.startTime);
    const availEnd = timeToMinutes(avail.endTime);

    // Sort blocked ranges for this availability window
    const blockedRanges = dayBlocked
      .filter((b) => b.startTime < avail.endTime && b.endTime > avail.startTime)
      .map((b) => ({ start: timeToMinutes(b.startTime), end: timeToMinutes(b.endTime) }))
      .sort((a, b) => a.start - b.start);

    // Also get time-off blocks for this date
    const timeoffRanges = dayTimeoffs
      .filter((to) => {
        const ts = timeToMinutes(to.startTime);
        const te = timeToMinutes(to.endTime);
        return ts < availEnd && te > availStart;
      })
      .map((to) => ({ start: timeToMinutes(to.startTime), end: timeToMinutes(to.endTime) }));

    // Combine all blocked ranges
    const allBlocked = [...blockedRanges, ...timeoffRanges].sort((a, b) => a.start - b.start);

    // Start at the beginning of availability range
    let currentTime = availStart;

    while (currentTime + serviceDuration <= availEnd) {
      const slotEnd = currentTime + serviceDuration;

      // Check if this slot overlaps with any blocked range
      const overlapsBlocked = allBlocked.some((block) => currentTime < block.end && slotEnd > block.start);
      
      // Check if this slot overlaps with any booking
      const overlapsBooking = dayBookings.some((b) => bookingBlocksSlot(currentTime, slotEnd, b));

      // Only add slot if no overlaps
      if (!overlapsBlocked && !overlapsBooking) {
        slots.push({
          startTime: minutesToTime(currentTime),
          endTime: minutesToTime(slotEnd),
        });
      }

      // Increment by (duration + buffer)
      currentTime += serviceDuration + serviceBuffer;
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
