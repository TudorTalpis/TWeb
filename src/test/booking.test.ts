import { describe, it, expect } from "vitest";
import { generateSlots } from "@/lib/booking";
import type { Availability, Booking, TimeOff } from "@/types";

describe("generateSlots with blocked ranges", () => {
  const baseAvailability: Availability[] = [
    {
      id: "avail1",
      providerId: "provider1",
      weekday: 1, // Monday
      startTime: "09:00",
      endTime: "17:00",
      slotMinutes: 60,
      bufferMinutes: 0,
      isBlocked: false,
    },
  ];

  const baseBookings: Booking[] = [];
  const baseTimeoffs: TimeOff[] = [];

  // Helper to get date string for a specific weekday (Monday = 1)
  function getDateForWeekday(weekday: number): string {
    // 2026-04-06 is a Monday
    const baseDate = new Date("2026-04-06");
    const diff = weekday - baseDate.getDay();
    const targetDate = new Date(baseDate);
    targetDate.setDate(baseDate.getDate() + diff);
    return targetDate.toISOString().split("T")[0];
  }

  it("should generate slots without blocked ranges", () => {
    const date = getDateForWeekday(1);
    const slots = generateSlots(
      date,
      baseAvailability,
      baseBookings,
      baseTimeoffs,
      60, // service duration: 60 min
      0, // service buffer: 0 min
    );

    // From 09:00 to 17:00 with 60-min slots = 8 slots
    expect(slots.length).toBe(8);
    expect(slots[0]).toEqual({ startTime: "09:00", endTime: "10:00" });
    expect(slots[7]).toEqual({ startTime: "16:00", endTime: "17:00" });
  });

  it("should skip blocked ranges when generating slots", () => {
    const availability: Availability[] = [
      ...baseAvailability,
      {
        id: "blocked1",
        providerId: "provider1",
        weekday: 1,
        startTime: "12:00",
        endTime: "13:00",
        slotMinutes: 60,
        bufferMinutes: 0,
        isBlocked: true, // Lunch break
      },
    ];

    const date = getDateForWeekday(1);
    const slots = generateSlots(date, availability, baseBookings, baseTimeoffs, 60, 0);

    // Should generate slots from 09:00-12:00 and 13:00-17:00
    // But slots that overlap with 12:00-13:00 should be skipped
    expect(
      slots.every((slot) => {
        const slotStart = slot.startTime;
        const slotEnd = slot.endTime;
        // No slot should overlap with 12:00-13:00
        const overlapsLunch = slotStart < "13:00" && slotEnd > "12:00";
        return !overlapsLunch;
      }),
    ).toBe(true);
  });

  it("should handle multiple blocked ranges", () => {
    const availability: Availability[] = [
      {
        id: "avail1",
        providerId: "provider1",
        weekday: 1,
        startTime: "08:00",
        endTime: "18:00",
        slotMinutes: 60,
        bufferMinutes: 0,
        isBlocked: false,
      },
      {
        id: "blocked1",
        providerId: "provider1",
        weekday: 1,
        startTime: "12:00",
        endTime: "13:00",
        slotMinutes: 60,
        bufferMinutes: 0,
        isBlocked: true, // Lunch
      },
      {
        id: "blocked2",
        providerId: "provider1",
        weekday: 1,
        startTime: "15:00",
        endTime: "15:30",
        slotMinutes: 60,
        bufferMinutes: 0,
        isBlocked: true, // Break
      },
    ];

    const date = getDateForWeekday(1);
    const slots = generateSlots(date, availability, baseBookings, baseTimeoffs, 60, 0);

    // Slots should not overlap with 12:00-13:00 or 15:00-15:30
    expect(
      slots.every((slot) => {
        const overlapsLunch = slot.startTime < "13:00" && slot.endTime > "12:00";
        const overlapsBreak = slot.startTime < "15:30" && slot.endTime > "15:00";
        return !overlapsLunch && !overlapsBreak;
      }),
    ).toBe(true);
  });

  it("should increment by (duration + buffer)", () => {
    const date = getDateForWeekday(1);
    const slots = generateSlots(
      date,
      baseAvailability,
      baseBookings,
      baseTimeoffs,
      60, // service duration: 60 min
      15, // service buffer: 15 min
    );

    // Slots should start at 09:00, then 10:15, 11:30, etc.
    expect(slots[0].startTime).toBe("09:00");
    expect(slots[1].startTime).toBe("10:15");
    expect(slots[2].startTime).toBe("11:30");
  });

  it("should not exceed availability end time", () => {
    const availability: Availability[] = [
      {
        id: "avail1",
        providerId: "provider1",
        weekday: 1,
        startTime: "09:00",
        endTime: "12:00",
        slotMinutes: 60,
        bufferMinutes: 0,
        isBlocked: false,
      },
    ];

    const date = getDateForWeekday(1);
    const slots = generateSlots(
      date,
      availability,
      baseBookings,
      baseTimeoffs,
      90, // 90-min service
      0,
    );

    // Only one slot: 09:00-10:30 (next would be 10:30-12:00, but that fits)
    expect(slots.length).toBe(2);
    expect(slots[0]).toEqual({ startTime: "09:00", endTime: "10:30" });
    expect(slots[1]).toEqual({ startTime: "10:30", endTime: "12:00" });
  });

  it("should handle service duration longer than availability", () => {
    const availability: Availability[] = [
      {
        id: "avail1",
        providerId: "provider1",
        weekday: 1,
        startTime: "09:00",
        endTime: "10:00",
        slotMinutes: 60,
        bufferMinutes: 0,
        isBlocked: false,
      },
    ];

    const date = getDateForWeekday(1);
    const slots = generateSlots(
      date,
      availability,
      baseBookings,
      baseTimeoffs,
      120, // 2-hour service in 1-hour window
      0,
    );

    expect(slots.length).toBe(0);
  });

  it("should skip slots that overlap with bookings", () => {
    const bookings: Booking[] = [
      {
        id: "booking1",
        userId: "user1",
        providerId: "provider1",
        serviceId: "service1",
        date: getDateForWeekday(1),
        startTime: "10:00",
        endTime: "11:00",
        status: "CONFIRMED",
        createdAt: new Date().toISOString(),
        userName: "Test User",
      },
    ];

    const date = getDateForWeekday(1);
    const slots = generateSlots(date, baseAvailability, bookings, baseTimeoffs, 60, 0);

    // No slot should overlap with 10:00-11:00
    expect(
      slots.every((slot) => {
        const overlapsBooking = slot.startTime < "11:00" && slot.endTime > "10:00";
        return !overlapsBooking;
      }),
    ).toBe(true);
  });

  it("should skip slots that overlap with time-off", () => {
    const timeoffs: TimeOff[] = [
      {
        id: "timeoff1",
        providerId: "provider1",
        date: getDateForWeekday(1),
        startTime: "14:00",
        endTime: "15:00",
        reason: "Appointment",
      },
    ];

    const date = getDateForWeekday(1);
    const slots = generateSlots(date, baseAvailability, baseBookings, timeoffs, 60, 0);

    // No slot should overlap with 14:00-15:00
    expect(
      slots.every((slot) => {
        const overlapsTimeoff = slot.startTime < "15:00" && slot.endTime > "14:00";
        return !overlapsTimeoff;
      }),
    ).toBe(true);
  });

  it("should handle multiple availability ranges in one day", () => {
    const availability: Availability[] = [
      {
        id: "avail1",
        providerId: "provider1",
        weekday: 1,
        startTime: "09:00",
        endTime: "12:00",
        slotMinutes: 60,
        bufferMinutes: 0,
        isBlocked: false,
      },
      {
        id: "avail2",
        providerId: "provider1",
        weekday: 1,
        startTime: "14:00",
        endTime: "17:00",
        slotMinutes: 60,
        bufferMinutes: 0,
        isBlocked: false,
      },
    ];

    const date = getDateForWeekday(1);
    const slots = generateSlots(date, availability, baseBookings, baseTimeoffs, 60, 0);

    // Should have 3 slots in morning (09:00-12:00) and 3 in afternoon (14:00-17:00)
    expect(slots.length).toBe(6);
    expect(slots[0]).toEqual({ startTime: "09:00", endTime: "10:00" });
    expect(slots[2]).toEqual({ startTime: "11:00", endTime: "12:00" });
    expect(slots[3]).toEqual({ startTime: "14:00", endTime: "15:00" });
    expect(slots[5]).toEqual({ startTime: "16:00", endTime: "17:00" });
  });
});
