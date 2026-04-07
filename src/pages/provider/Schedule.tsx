import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { addDays, addMinutes, format, isBefore, startOfDay } from "date-fns";
import type { EventClickArg, EventContentArg, EventDropArg, EventMountArg } from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { AlertCircle, CalendarDays, Check, CircleCheck, Clock3, Phone, Plus, User, XCircle } from "lucide-react";
import { ProviderPanelLayout } from "@/components/ProviderPanelLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { isHourOccupied } from "@/lib/booking";
import { getEffectiveServiceBufferMinutes } from "@/lib/services";
import { generateId } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/AppContext";
import type { Booking, BookingStatus, Service } from "@/types";

type CalendarFilter = "ALL" | "PENDING" | "CONFIRMED" | "COMPLETED";

interface AddBookingFormState {
  clientName: string;
  clientPhone: string;
  serviceId: string;
  date: string;
  startTime: string;
  duration: number;
}

interface CustomServiceState {
  title: string;
  price: number;
  duration: number;
}

interface EditBookingFormState {
  clientName: string;
  clientPhone: string;
  serviceId: string;
  date: string;
  startTime: string;
  duration: number;
}

interface BookingEventData {
  bookingId: string;
  userName: string;
  serviceName: string;
  status: BookingStatus;
}

const STATUS_BADGE_CLASS: Record<BookingStatus, string> = {
  PENDING: "bg-warning/15 text-warning border-warning/30",
  CONFIRMED: "bg-primary/15 text-primary border-primary/30",
  COMPLETED: "bg-success/15 text-success border-success/30",
  CANCELLED: "bg-destructive/15 text-destructive border-destructive/30",
};

const FILTERS: Array<{ value: CalendarFilter; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "COMPLETED", label: "Completed" },
];

function parseTime(value: string): { hours: number; minutes: number; seconds: number } | null {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3] ?? "0");

  if (!Number.isInteger(hours) || !Number.isInteger(minutes) || !Number.isInteger(seconds)) return null;
  if (hours < 0 || hours > 24) return null;
  if (minutes < 0 || minutes > 59) return null;
  if (seconds < 0 || seconds > 59) return null;
  if (hours === 24 && (minutes !== 0 || seconds !== 0)) return null;

  return { hours, minutes, seconds };
}

function toMinutesSafe(value: string): number | null {
  const parsed = parseTime(value);
  if (!parsed) return null;
  return parsed.hours * 60 + parsed.minutes;
}

function toIsoTime(value: string): string | null {
  const parsed = parseTime(value);
  if (!parsed) return null;

  return `${parsed.hours.toString().padStart(2, "0")}:${parsed.minutes
    .toString()
    .padStart(2, "0")}:${parsed.seconds.toString().padStart(2, "0")}`;
}

function toIsoDate(value: string): string | null {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return format(parsed, "yyyy-MM-dd");
}

function timeToMinutes(value: string): number {
  return toMinutesSafe(value) ?? 0;
}

function toDateTimeMs(date: string, time: string): number | null {
  const normalizedDate = toIsoDate(date);
  const normalizedTime = toIsoTime(time);
  if (!normalizedDate || !normalizedTime) return null;

  const ms = new Date(`${normalizedDate}T${normalizedTime}`).getTime();
  return Number.isNaN(ms) ? null : ms;
}

function minutesToTime(value: number): string {
  const clamped = Math.max(0, Math.min(value, 24 * 60));
  const hours = Math.floor(clamped / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (clamped % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function getEndTime(startTime: string, duration: number) {
  const totalMinutes = timeToMinutes(startTime) + duration;
  return {
    endTime: minutesToTime(totalMinutes % (24 * 60)),
    crossesMidnight: totalMinutes >= 24 * 60,
  };
}

function getDurationMinutes(startTime: string, endTime: string) {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  if (end >= start) return end - start;
  return end + 24 * 60 - start;
}

function rangesOverlap(startA: string, endA: string, startB: string, endB: string) {
  const aStart = timeToMinutes(startA);
  const aEnd = timeToMinutes(endA);
  const bStart = timeToMinutes(startB);
  const bEnd = timeToMinutes(endB);
  return aStart < bEnd && aEnd > bStart;
}

function formatDateLabel(date: string) {
  return format(new Date(`${date}T00:00:00`), "EEEE, MMMM d");
}

const ProviderSchedule = () => {
  const { state, dispatch, currentProvider } = useAppStore();
  const isMobile = useIsMobile();
  const todayKey = format(new Date(), "yyyy-MM-dd");
  const providerId = currentProvider?.id ?? "";
  const primaryCategoryId = currentProvider?.categoryIds?.[0] ?? "";
  const calendarRef = useRef<FullCalendar | null>(null);
  const selectionStepMinutes = 30;
  const [selectionPreview, setSelectionPreview] = useState<{ start: Date; end: Date } | null>(null);
  const selectionPreviewRef = useRef<{ start: Date; end: Date } | null>(null);
  const selectingRef = useRef(false);
  const selectionStartRef = useRef<{ date: string; dateTime: Date } | null>(null);

  const initialSelectedDate = (() => {
    const relevantBookings = state.bookings
      .filter((booking) => booking.providerId === providerId && booking.status !== "CANCELLED")
      .sort((first, second) => {
        const firstTime = toDateTimeMs(first.date, first.startTime) ?? Number.MAX_SAFE_INTEGER;
        const secondTime = toDateTimeMs(second.date, second.startTime) ?? Number.MAX_SAFE_INTEGER;
        return firstTime - secondTime;
      });

    const now = Date.now();
    const upcoming = relevantBookings.find((booking) => {
      const bookingTime = toDateTimeMs(booking.date, booking.startTime);
      return bookingTime !== null && bookingTime >= now;
    });
    const upcomingDate = upcoming ? toIsoDate(upcoming.date) : null;
    const firstKnownDate = relevantBookings[0] ? toIsoDate(relevantBookings[0].date) : null;
    return upcomingDate ?? firstKnownDate ?? todayKey;
  })();

  const [selectedDate, setSelectedDate] = useState(initialSelectedDate);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [calendarFilter, setCalendarFilter] = useState<CalendarFilter>("ALL");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [useCustomService, setUseCustomService] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [moveError, setMoveError] = useState<string | null>(null);
  const [pendingMove, setPendingMove] = useState<{
    bookingId: string;
    date: string;
    startTime: string;
    endTime: string;
  } | null>(null);
  const [bookingForm, setBookingForm] = useState<AddBookingFormState>({
    clientName: "",
    clientPhone: "",
    serviceId: "",
    date: todayKey,
    startTime: "09:00",
    duration: 60,
  });
  const [customService, setCustomService] = useState<CustomServiceState>({
    title: "",
    price: 0,
    duration: 60,
  });
  const [editForm, setEditForm] = useState<EditBookingFormState>({
    clientName: "",
    clientPhone: "",
    serviceId: "",
    date: todayKey,
    startTime: "09:00",
    duration: 60,
  });

  const providerBookings = useMemo(
    () => state.bookings.filter((booking) => booking.providerId === providerId),
    [state.bookings, providerId],
  );
  const providerServices = useMemo(
    () => state.services.filter((service) => service.providerId === providerId),
    [state.services, providerId],
  );
  const providerAvailability = useMemo(
    () => state.availability.filter((availability) => availability.providerId === providerId),
    [state.availability, providerId],
  );
  const providerTimeoff = useMemo(
    () => state.timeoff.filter((timeoff) => timeoff.providerId === providerId),
    [state.timeoff, providerId],
  );
  const servicesById = useMemo(
    () => new Map(providerServices.map((service) => [service.id, service])),
    [providerServices],
  );

  const activeBookings = useMemo(
    () => providerBookings.filter((booking) => booking.status !== "CANCELLED"),
    [providerBookings],
  );

  const filteredBookings = useMemo(() => {
    if (calendarFilter === "ALL") {
      return activeBookings;
    }
    return activeBookings.filter((booking) => booking.status === calendarFilter);
  }, [activeBookings, calendarFilter]);

  const selectedDateBookings = useMemo(() => {
    return activeBookings
      .filter((booking) => toIsoDate(booking.date) === selectedDate)
      .sort((first, second) => (toMinutesSafe(first.startTime) ?? 0) - (toMinutesSafe(second.startTime) ?? 0));
  }, [activeBookings, selectedDate]);

  const selectedBooking = useMemo(() => {
    if (!selectedBookingId) return null;
    return providerBookings.find((booking) => booking.id === selectedBookingId) ?? null;
  }, [providerBookings, selectedBookingId]);

  const pendingCount = providerBookings.filter((booking) => booking.status === "PENDING").length;
  const confirmedCount = providerBookings.filter((booking) => booking.status === "CONFIRMED").length;
  const todayCount = activeBookings.filter((booking) => toIsoDate(booking.date) === todayKey).length;

  const nextUpcomingBooking = useMemo(() => {
    return activeBookings
      .filter((booking) => booking.status === "PENDING" || booking.status === "CONFIRMED")
      .map((booking) => ({
        booking,
        dateTime: toDateTimeMs(booking.date, booking.startTime),
      }))
      .filter((item) => item.dateTime !== null && item.dateTime >= Date.now())
      .sort((first, second) => (first.dateTime as number) - (second.dateTime as number))[0]?.booking;
  }, [activeBookings]);

  const calendarHourRange = useMemo(() => {
    const starts = [
      ...providerAvailability.map((availability) => toMinutesSafe(availability.startTime)),
      ...activeBookings.map((booking) => toMinutesSafe(booking.startTime)),
      ...providerTimeoff.map((timeoff) => toMinutesSafe(timeoff.startTime)),
    ].filter((minutes): minutes is number => minutes !== null);

    const ends = [
      ...providerAvailability.map((availability) => toMinutesSafe(availability.endTime)),
      ...activeBookings.map((booking) => toMinutesSafe(booking.endTime)),
      ...providerTimeoff.map((timeoff) => toMinutesSafe(timeoff.endTime)),
    ];
    const validEnds = ends.filter((minutes): minutes is number => minutes !== null);

    const fallbackStart = 8 * 60;
    const fallbackEnd = 19 * 60;
    const min = starts.length ? Math.min(...starts) : fallbackStart;
    const max = validEnds.length ? Math.max(...validEnds) : fallbackEnd;
    const paddedStart = Math.max(0, min - 60);
    const paddedEnd = Math.min(24 * 60, max + 60);
    const roundedStart = Math.floor(paddedStart / 60) * 60;
    const roundedEnd = Math.ceil(paddedEnd / 60) * 60;
    const safeEnd = roundedEnd <= roundedStart ? roundedStart + 60 : roundedEnd;

    return {
      min: `${minutesToTime(roundedStart)}:00`,
      max: `${minutesToTime(safeEnd)}:00`,
    };
  }, [providerAvailability, activeBookings, providerTimeoff]);

  const calendarEvents = useMemo(() => {
    return filteredBookings.flatMap((booking) => {
      const normalizedDate = toIsoDate(booking.date);
      const normalizedStart = toIsoTime(booking.startTime);
      const normalizedEnd = toIsoTime(booking.endTime);
      if (!normalizedDate || !normalizedStart || !normalizedEnd) return [];

      const serviceName = servicesById.get(booking.serviceId)?.title ?? "Service";
      return [
        {
          id: booking.id,
          title: booking.userName,
          start: `${normalizedDate}T${normalizedStart}`,
          end: `${normalizedDate}T${normalizedEnd}`,
          classNames: ["schedule-event", `schedule-event-${booking.status.toLowerCase()}`],
          extendedProps: {
            bookingId: booking.id,
            userName: booking.userName,
            serviceName,
            status: booking.status,
          } satisfies BookingEventData,
        },
      ];
    });
  }, [filteredBookings, servicesById]);

  const timeoffEvents = useMemo(() => {
    return providerTimeoff.flatMap((timeoff) => {
      const normalizedDate = toIsoDate(timeoff.date);
      const normalizedStart = toIsoTime(timeoff.startTime);
      const normalizedEnd = toIsoTime(timeoff.endTime);
      if (!normalizedDate || !normalizedStart || !normalizedEnd) return [];

      return [
        {
          id: `timeoff-${timeoff.id}`,
          title: "Time off",
          start: `${normalizedDate}T${normalizedStart}`,
          end: `${normalizedDate}T${normalizedEnd}`,
          display: "background" as const,
          classNames: ["schedule-timeoff"],
        },
      ];
    });
  }, [providerTimeoff]);

  const updateSelectionPreview = useCallback((value: { start: Date; end: Date } | null) => {
    selectionPreviewRef.current = value;
    setSelectionPreview(value);
  }, []);

  const selectionEvents = selectionPreview
    ? [
        {
          id: "selection-preview",
          start: selectionPreview.start,
          end: selectionPreview.end,
          display: "background" as const,
          classNames: ["schedule-selection"],
        },
      ]
    : [];

  const allEvents = [...calendarEvents, ...timeoffEvents, ...selectionEvents];
  const hiddenBookingsCount = Math.max(0, filteredBookings.length - calendarEvents.length);

  const openAddDialog = useCallback(
    (preset?: Partial<Pick<AddBookingFormState, "date" | "startTime" | "duration">>) => {
      const fallbackService = providerServices[0];
      const useCustom = providerServices.length === 0;
      const fallbackDuration = fallbackService
        ? fallbackService.duration + getEffectiveServiceBufferMinutes(fallbackService, currentProvider)
        : 60;
      const duration = preset?.duration ?? fallbackDuration;

      setUseCustomService(useCustom);
      setBookingForm({
        clientName: "",
        clientPhone: "",
        serviceId: "",
        date: preset?.date ?? selectedDate,
        startTime: preset?.startTime ?? "09:00",
        duration,
      });
      setCustomService({
        title: "",
        price: 0,
        duration,
      });
      setAddError(null);
      setShowAddDialog(true);
    },
    [providerServices, currentProvider, selectedDate],
  );

  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (!api) return;
    api.gotoDate(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    const calendarEl = calendarRef.current?.el as HTMLElement | null;
    if (!calendarEl) return;

    const getSlotInfo = (clientX: number, clientY: number) => {
      const slotsTable = calendarEl.querySelector(".fc-timegrid-slots") as HTMLElement | null;
      const slotCell = slotsTable?.querySelector(".fc-timegrid-slot") as HTMLElement | null;
      if (!slotsTable || !slotCell) return null;

      const slotsRect = slotsTable.getBoundingClientRect();
      const slotHeight = slotCell.getBoundingClientRect().height || 1;
      const offsetY = Math.max(0, Math.min(clientY - slotsRect.top, slotsRect.height - 1));
      const slotIndex = Math.floor(offsetY / slotHeight);

      const slotStartMinutes = toMinutesSafe(calendarHourRange.min) ?? 0;
      const minutesFromStart = slotIndex * selectionStepMinutes;
      const timeMinutes = slotStartMinutes + minutesFromStart;
      const time = minutesToTime(timeMinutes);

      const columns = Array.from(calendarEl.querySelectorAll(".fc-timegrid-col")) as HTMLElement[];
      const column = columns.find((col) => {
        const rect = col.getBoundingClientRect();
        return clientX >= rect.left && clientX <= rect.right;
      });
      const date = column?.getAttribute("data-date");
      if (!date) return null;

      const dateTime = new Date(`${date}T${time}:00`);
      if (Number.isNaN(dateTime.getTime())) return null;
      return { date, dateTime };
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest(".fc-event")) return;
      const slotInfo = getSlotInfo(event.clientX, event.clientY);
      if (!slotInfo) return;

      selectingRef.current = true;
      selectionStartRef.current = slotInfo;
      updateSelectionPreview({
        start: slotInfo.dateTime,
        end: addMinutes(slotInfo.dateTime, selectionStepMinutes),
      });
      calendarEl.setPointerCapture?.(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!selectingRef.current || !selectionStartRef.current) return;
      const slotInfo = getSlotInfo(event.clientX, event.clientY);
      if (!slotInfo || slotInfo.date !== selectionStartRef.current.date) return;

      const start = selectionStartRef.current.dateTime;
      const end =
        slotInfo.dateTime >= start
          ? addMinutes(slotInfo.dateTime, selectionStepMinutes)
          : addMinutes(start, selectionStepMinutes);

      updateSelectionPreview({ start, end });
    };

    const onPointerUp = () => {
      if (!selectingRef.current || !selectionStartRef.current) return;

      selectingRef.current = false;
      const startInfo = selectionStartRef.current;
      const preview = selectionPreviewRef.current;
      selectionStartRef.current = null;

      if (!preview) {
        updateSelectionPreview(null);
        return;
      }

      const duration = Math.round((preview.end.getTime() - preview.start.getTime()) / (1000 * 60));
      if (duration < selectionStepMinutes) {
        updateSelectionPreview(null);
        return;
      }

      setSelectedDate(startInfo.date);
      openAddDialog({
        date: startInfo.date,
        startTime: format(preview.start, "HH:mm"),
        duration,
      });
    };

    calendarEl.addEventListener("pointerdown", onPointerDown);
    calendarEl.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      calendarEl.removeEventListener("pointerdown", onPointerDown);
      calendarEl.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [calendarHourRange.min, openAddDialog, selectionStepMinutes, updateSelectionPreview]);

  const resetEditDialog = (booking: Booking) => {
    const duration = Math.max(5, getDurationMinutes(booking.startTime, booking.endTime));
    setEditForm({
      clientName: booking.userName,
      clientPhone: booking.userPhone ?? "",
      serviceId: booking.serviceId,
      date: booking.date,
      startTime: booking.startTime,
      duration,
    });
    setEditError(null);
  };

  const openEditDialog = (booking: Booking) => {
    resetEditDialog(booking);
    setShowEditDialog(true);
  };

  const handleEventClick = (click: EventClickArg) => {
    if (click.event.display === "background") return;
    setSelectedBookingId(click.event.id);
    if (click.event.start) {
      setSelectedDate(format(click.event.start, "yyyy-MM-dd"));
    }
  };

  const handleEventDrop = (dropInfo: EventDropArg) => {
    if (dropInfo.event.display === "background") {
      dropInfo.revert();
      return;
    }

    const booking = providerBookings.find((item) => item.id === dropInfo.event.id);
    if (!booking || booking.status === "CANCELLED" || booking.status === "COMPLETED") {
      dropInfo.revert();
      return;
    }

    const start = dropInfo.event.start;
    const end = dropInfo.event.end;
    if (!start || !end) {
      dropInfo.revert();
      return;
    }

    const date = format(start, "yyyy-MM-dd");
    const startTime = format(start, "HH:mm");
    const endTime = format(end, "HH:mm");
    const endDate = format(end, "yyyy-MM-dd");

    const validationError = validateBookingMove(booking, date, startTime, endTime, endDate);
    if (validationError) {
      setMoveError(validationError);
      dropInfo.revert();
      return;
    }

    dropInfo.revert();
    setMoveError(null);
    setPendingMove({ bookingId: booking.id, date, startTime, endTime });
  };

  const handleEventMount = (arg: EventMountArg) => {
    if (arg.event.display === "background") return;
    const el = arg.el as HTMLElement;
    const parent = el.closest(".fc-timegrid-event-harness, .fc-timegrid-event-harness-inset");

    const onEnter = () => {
      el.classList.add("schedule-event-hovered");
      parent?.classList.add("schedule-event-harness-hovered");
    };
    const onLeave = () => {
      el.classList.remove("schedule-event-hovered");
      parent?.classList.remove("schedule-event-harness-hovered");
    };

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    (
      el as HTMLElement & { __scheduleHoverHandlers?: { onEnter: () => void; onLeave: () => void } }
    ).__scheduleHoverHandlers = {
      onEnter,
      onLeave,
    };
  };

  const handleEventUnmount = (arg: EventMountArg) => {
    const el = arg.el as HTMLElement & { __scheduleHoverHandlers?: { onEnter: () => void; onLeave: () => void } };
    const handlers = el.__scheduleHoverHandlers;
    if (!handlers) return;
    el.removeEventListener("mouseenter", handlers.onEnter);
    el.removeEventListener("mouseleave", handlers.onLeave);
    delete el.__scheduleHoverHandlers;
  };

  const validateAddBooking = () => {
    if (!bookingForm.clientName.trim()) return "Client name is required.";
    if (!bookingForm.date) return "Date is required.";
    if (isBefore(new Date(`${bookingForm.date}T00:00:00`), startOfDay(new Date()))) {
      return "Past dates are not allowed.";
    }
    if (!bookingForm.startTime) return "Start time is required.";
    if (bookingForm.duration < 5) return "Duration must be at least 5 minutes.";

    const computed = getEndTime(bookingForm.startTime, bookingForm.duration);
    if (computed.crossesMidnight) return "Bookings cannot cross midnight.";

    if (useCustomService) {
      if (!customService.title.trim()) return "Custom service title is required.";
      if (customService.duration < 5) return "Custom service duration must be at least 5 minutes.";
    } else if (!bookingForm.serviceId) {
      return "Select a service or switch to custom service.";
    }

    const overlapWithBooking = isHourOccupied(
      providerId,
      bookingForm.date,
      bookingForm.startTime,
      computed.endTime,
      state.bookings,
    );

    if (overlapWithBooking) {
      return "This slot overlaps with an existing booking.";
    }

    const overlapWithTimeoff = providerTimeoff.some((timeoff) => {
      if (timeoff.date !== bookingForm.date) return false;
      return rangesOverlap(bookingForm.startTime, computed.endTime, timeoff.startTime, timeoff.endTime);
    });

    if (overlapWithTimeoff) {
      return "This slot overlaps with a time-off block.";
    }

    return null;
  };

  const handleEditServiceChange = (serviceId: string) => {
    const service = providerServices.find((item) => item.id === serviceId);
    setEditForm((prev) => ({
      ...prev,
      serviceId,
      duration: service ? service.duration + getEffectiveServiceBufferMinutes(service, currentProvider) : prev.duration,
    }));
    setEditError(null);
  };

  const validateEditBooking = (booking: Booking) => {
    if (!editForm.clientName.trim()) return "Client name is required.";
    if (!editForm.date) return "Date is required.";
    if (isBefore(new Date(`${editForm.date}T00:00:00`), startOfDay(new Date()))) {
      return "Past dates are not allowed.";
    }
    if (!editForm.startTime) return "Start time is required.";
    if (editForm.duration < 5) return "Duration must be at least 5 minutes.";
    if (!editForm.serviceId) return "Select a service.";

    const computed = getEndTime(editForm.startTime, editForm.duration);
    if (computed.crossesMidnight) return "Bookings cannot cross midnight.";

    const overlapWithBooking = isHourOccupied(
      providerId,
      editForm.date,
      editForm.startTime,
      computed.endTime,
      state.bookings,
      booking.id,
    );

    if (overlapWithBooking) {
      return "This slot overlaps with an existing booking.";
    }

    const overlapWithTimeoff = providerTimeoff.some((timeoff) => {
      if (timeoff.date !== editForm.date) return false;
      return rangesOverlap(editForm.startTime, computed.endTime, timeoff.startTime, timeoff.endTime);
    });

    if (overlapWithTimeoff) {
      return "This slot overlaps with a time-off block.";
    }

    return null;
  };

  const validateBookingMove = (booking: Booking, date: string, startTime: string, endTime: string, endDate: string) => {
    if (isBefore(new Date(`${date}T00:00:00`), startOfDay(new Date()))) {
      return "Past dates are not allowed.";
    }

    if (endDate !== date) {
      return "Bookings cannot cross midnight.";
    }

    const overlapWithBooking = isHourOccupied(providerId, date, startTime, endTime, state.bookings, booking.id);

    if (overlapWithBooking) {
      return "This slot overlaps with an existing booking.";
    }

    const overlapWithTimeoff = providerTimeoff.some((timeoff) => {
      if (timeoff.date !== date) return false;
      return rangesOverlap(startTime, endTime, timeoff.startTime, timeoff.endTime);
    });

    if (overlapWithTimeoff) {
      return "This slot overlaps with a time-off block.";
    }

    return null;
  };

  const handleServiceChange = (serviceId: string) => {
    const service = providerServices.find((item) => item.id === serviceId);
    setBookingForm((prev) => ({
      ...prev,
      serviceId,
      duration: service ? service.duration + getEffectiveServiceBufferMinutes(service, currentProvider) : prev.duration,
    }));
    setUseCustomService(false);
    setAddError(null);
  };

  const addManualBooking = () => {
    if (!currentProvider) return;

    const validationError = validateAddBooking();
    if (validationError) {
      setAddError(validationError);
      return;
    }

    const duration = useCustomService ? customService.duration : bookingForm.duration;
    const { endTime } = getEndTime(bookingForm.startTime, duration);
    let serviceId = bookingForm.serviceId;

    if (useCustomService) {
      const newService: Service = {
        id: generateId(),
        providerId: currentProvider.id,
        title: customService.title.trim(),
        description: "",
        price: Number.isFinite(customService.price) ? customService.price : 0,
        duration,
        bufferMinutes: null,
        categoryId: primaryCategoryId,
      };
      dispatch({ type: "ADD_SERVICE", payload: newService });
      serviceId = newService.id;
    }

    const createdBooking: Booking = {
      id: generateId(),
      providerId: currentProvider.id,
      userId: `manual-${generateId()}`,
      userName: bookingForm.clientName.trim(),
      userPhone: bookingForm.clientPhone.trim() || undefined,
      serviceId,
      date: bookingForm.date,
      startTime: bookingForm.startTime,
      endTime,
      status: "CONFIRMED",
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: "ADD_BOOKING", payload: createdBooking });
    setSelectedDate(bookingForm.date);
    setSelectedBookingId(createdBooking.id);
    setShowAddDialog(false);
    resetAddDialog({ date: bookingForm.date });
  };

  const confirmSelectedBooking = () => {
    if (!selectedBooking || selectedBooking.status !== "PENDING" || !currentProvider) return;

    dispatch({ type: "UPDATE_BOOKING", payload: { id: selectedBooking.id, status: "CONFIRMED" } });

    if (!selectedBooking.userId.startsWith("guest-")) {
      const serviceName = servicesById.get(selectedBooking.serviceId)?.title ?? "service";
      dispatch({
        type: "ADD_NOTIFICATION",
        payload: {
          id: generateId(),
          userId: selectedBooking.userId,
          type: "booking_success",
          title: "Booking Confirmed",
          message: `${currentProvider.name} confirmed your ${serviceName} booking on ${formatDateLabel(selectedBooking.date)} at ${selectedBooking.startTime}.`,
          read: false,
          createdAt: new Date().toISOString(),
          linkTo: "/dashboard",
        },
      });
    }
  };

  const completeSelectedBooking = () => {
    if (!selectedBooking || selectedBooking.status !== "CONFIRMED" || !currentProvider) return;
    const bookingEndMs = toDateTimeMs(selectedBooking.date, selectedBooking.endTime);
    if (bookingEndMs === null || Date.now() < bookingEndMs) return;

    dispatch({ type: "UPDATE_BOOKING", payload: { id: selectedBooking.id, status: "COMPLETED" } });

    if (!selectedBooking.userId.startsWith("guest-")) {
      const serviceName = servicesById.get(selectedBooking.serviceId)?.title ?? "service";
      dispatch({
        type: "ADD_NOTIFICATION",
        payload: {
          id: generateId(),
          userId: selectedBooking.userId,
          type: "review_request",
          title: "Your Service Is Completed",
          message: `Your ${serviceName} session with ${currentProvider.name} was marked complete. Tap to leave a review.`,
          read: false,
          createdAt: new Date().toISOString(),
          linkTo: `/review/${selectedBooking.id}`,
        },
      });
    }
  };

  const cancelSelectedBooking = () => {
    if (
      !selectedBooking ||
      selectedBooking.status === "CANCELLED" ||
      selectedBooking.status === "COMPLETED" ||
      !currentProvider
    )
      return;

    dispatch({ type: "UPDATE_BOOKING", payload: { id: selectedBooking.id, status: "CANCELLED" } });

    if (!selectedBooking.userId.startsWith("guest-")) {
      const serviceName = servicesById.get(selectedBooking.serviceId)?.title ?? "service";
      dispatch({
        type: "ADD_NOTIFICATION",
        payload: {
          id: generateId(),
          userId: selectedBooking.userId,
          type: "booking_success",
          title: "Booking Cancelled",
          message: `${currentProvider.name} marked your ${serviceName} booking on ${formatDateLabel(selectedBooking.date)} at ${selectedBooking.startTime} as not taking place.`,
          read: false,
          createdAt: new Date().toISOString(),
          linkTo: "/dashboard",
        },
      });
    }
  };

  const saveEditedBooking = () => {
    if (!selectedBooking) return;
    if (selectedBooking.status === "CANCELLED" || selectedBooking.status === "COMPLETED") return;

    const validationError = validateEditBooking(selectedBooking);
    if (validationError) {
      setEditError(validationError);
      return;
    }

    const { endTime } = getEndTime(editForm.startTime, editForm.duration);

    dispatch({
      type: "UPDATE_BOOKING",
      payload: {
        id: selectedBooking.id,
        userName: editForm.clientName.trim(),
        userPhone: editForm.clientPhone.trim() || undefined,
        serviceId: editForm.serviceId,
        date: editForm.date,
        startTime: editForm.startTime,
        endTime,
      },
    });

    setSelectedDate(editForm.date);
    setShowEditDialog(false);
    setEditError(null);
  };

  const { endTime: previewEndTime, crossesMidnight: previewCrossesMidnight } = getEndTime(
    bookingForm.startTime,
    bookingForm.duration,
  );
  const { endTime: editPreviewEndTime, crossesMidnight: editPreviewCrossesMidnight } = getEndTime(
    editForm.startTime,
    editForm.duration,
  );
  const canMarkSelectedComplete = (() => {
    if (!selectedBooking || selectedBooking.status !== "CONFIRMED") return false;
    const bookingEndMs = toDateTimeMs(selectedBooking.date, selectedBooking.endTime);
    return bookingEndMs !== null && Date.now() >= bookingEndMs;
  })();

  if (!currentProvider) return null;

  return (
    <ProviderPanelLayout>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold">Schedule</h2>
            <p className="text-sm text-muted-foreground">
              Click a slot to add a booking. Click a booking to manage it.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button className="gap-2" onClick={() => openAddDialog()}>
              <Plus className="h-4 w-4" />
              Add Booking
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border bg-card px-4 py-3 shadow-card">
            <p className="text-xs text-muted-foreground">Today</p>
            <p className="mt-1 text-xl font-semibold">{todayCount}</p>
          </div>
          <div className="rounded-2xl border bg-card px-4 py-3 shadow-card">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="mt-1 text-xl font-semibold">{pendingCount}</p>
          </div>
          <div className="rounded-2xl border bg-card px-4 py-3 shadow-card">
            <p className="text-xs text-muted-foreground">Confirmed</p>
            <p className="mt-1 text-xl font-semibold">{confirmedCount}</p>
          </div>
          <div className="rounded-2xl border bg-card px-4 py-3 shadow-card">
            <p className="text-xs text-muted-foreground">Next Booking</p>
            <p className="mt-1 text-sm font-semibold">
              {nextUpcomingBooking
                ? `${formatDateLabel(nextUpcomingBooking.date)} at ${nextUpcomingBooking.startTime}`
                : "No upcoming bookings"}
            </p>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-3 rounded-2xl border bg-card p-3 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <div className="flex flex-wrap items-center gap-2">
                {FILTERS.map((filter) => (
                  <Button
                    key={filter.value}
                    size="sm"
                    variant={calendarFilter === filter.value ? "default" : "outline"}
                    className="h-8 rounded-full px-3 text-xs"
                    onClick={() => setCalendarFilter(filter.value)}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {calendarEvents.length} booking{calendarEvents.length === 1 ? "" : "s"} shown
              </p>
            </div>
            {hiddenBookingsCount > 0 && (
              <div className="mx-1 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">
                {hiddenBookingsCount} booking{hiddenBookingsCount === 1 ? "" : "s"} hidden due invalid date/time format.
              </div>
            )}
            {moveError && (
              <div className="mx-1 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{moveError}</span>
              </div>
            )}

            <div className="provider-calendar min-h-[540px] overflow-visible rounded-xl border">
              <FullCalendar
                ref={calendarRef}
                plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
                initialView={isMobile ? "timeGridDay" : "timeGridWeek"}
                headerToolbar={
                  isMobile
                    ? { left: "prev,next", center: "title", right: "" }
                    : { left: "prev,next today", center: "title", right: "timeGridDay,timeGridWeek" }
                }
                views={
                  isMobile
                    ? {
                        timeGrid: {
                          type: "timeGrid",
                          duration: { days: 1 },
                        },
                      }
                    : undefined
                }
                events={allEvents}
                selectable={false}
                eventClick={handleEventClick}
                eventDrop={handleEventDrop}
                eventDidMount={handleEventMount}
                eventWillUnmount={handleEventUnmount}
                editable
                eventStartEditable
                eventDurationEditable={false}
                slotMinTime={calendarHourRange.min}
                slotMaxTime={calendarHourRange.max}
                scrollTime={calendarHourRange.min}
                allDaySlot={false}
                slotDuration="00:30:00"
                slotLabelInterval="01:00:00"
                snapDuration="00:30:00"
                dayHeaderFormat={{ weekday: "short", day: "numeric" }}
                eventTimeFormat={{ hour: "numeric", minute: "2-digit", meridiem: "short" }}
                slotLabelFormat={{ hour: "numeric", minute: "2-digit", hour12: true }}
                nowIndicator
                height="auto"
                contentHeight="auto"
                eventContent={(arg: EventContentArg) => {
                  if (arg.event.display === "background") return null;
                  const data = arg.event.extendedProps as BookingEventData;
                  return (
                    <div className="schedule-event-card">
                      <p className="schedule-event-title">{data.userName}</p>
                      <p className="schedule-event-subtitle">{data.serviceName}</p>
                      <p className="schedule-event-time">{arg.timeText || "Time not set"}</p>
                      <p className="schedule-event-status">{data.status}</p>
                    </div>
                  );
                }}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border bg-card p-4 shadow-card">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">Day Agenda</h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatDateLabel(selectedDate)}
                </div>
              </div>
              <div className="mt-3 max-h-[320px] space-y-2 overflow-y-auto pr-1">
                {selectedDateBookings.length === 0 ? (
                  <p className="rounded-xl border border-dashed px-3 py-5 text-center text-xs text-muted-foreground">
                    No bookings for this date.
                  </p>
                ) : (
                  selectedDateBookings.map((booking) => {
                    const serviceName = servicesById.get(booking.serviceId)?.title ?? "Service";
                    const isSelected = booking.id === selectedBookingId;
                    return (
                      <button
                        key={booking.id}
                        type="button"
                        onClick={() => setSelectedBookingId(booking.id)}
                        className={cn(
                          "w-full rounded-xl border px-3 py-2 text-left transition-colors",
                          isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/40",
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-medium">{booking.userName}</p>
                          <Badge className={cn("text-[10px] font-semibold", STATUS_BADGE_CLASS[booking.status])}>
                            {booking.status}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {booking.startTime} - {booking.endTime} | {serviceName}
                        </p>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-4 shadow-card">
              <h3 className="text-sm font-semibold">Booking Details</h3>
              {!selectedBooking ? (
                <p className="mt-3 rounded-xl border border-dashed px-3 py-5 text-center text-xs text-muted-foreground">
                  Select a booking from the calendar or day agenda.
                </p>
              ) : (
                <div className="mt-3 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{selectedBooking.userName}</p>
                    <Badge className={cn("text-[10px] font-semibold", STATUS_BADGE_CLASS[selectedBooking.status])}>
                      {selectedBooking.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-xs text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <Clock3 className="h-3.5 w-3.5" />
                      {formatDateLabel(selectedBooking.date)} at {selectedBooking.startTime} - {selectedBooking.endTime}
                    </p>
                    <p className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5" />
                      {servicesById.get(selectedBooking.serviceId)?.title ?? "Service"}
                    </p>
                    {selectedBooking.userPhone && (
                      <a
                        href={`tel:${selectedBooking.userPhone}`}
                        className="flex items-center gap-2 hover:text-foreground"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        {selectedBooking.userPhone}
                      </a>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {selectedBooking.status !== "CANCELLED" && selectedBooking.status !== "COMPLETED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        onClick={() => openEditDialog(selectedBooking)}
                      >
                        Edit
                      </Button>
                    )}
                    {selectedBooking.status === "PENDING" && (
                      <Button size="sm" className="gap-1.5" onClick={confirmSelectedBooking}>
                        <Check className="h-3.5 w-3.5" />
                        Confirm
                      </Button>
                    )}
                    {selectedBooking.status === "CONFIRMED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 border-success/40 text-success hover:bg-success/10 hover:text-success"
                        onClick={completeSelectedBooking}
                        disabled={!canMarkSelectedComplete}
                        title={`Can be completed at ${selectedBooking.endTime} or later`}
                      >
                        <CircleCheck className="h-3.5 w-3.5" />
                        Mark Completed
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={cancelSelectedBooking}
                      disabled={selectedBooking.status === "CANCELLED" || selectedBooking.status === "COMPLETED"}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={showAddDialog}
        onOpenChange={(open) => {
          setShowAddDialog(open);
          if (!open) setAddError(null);
          if (!open) {
            updateSelectionPreview(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Add Booking</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Client Name</Label>
              <Input
                value={bookingForm.clientName}
                placeholder="Client name"
                onChange={(event) => setBookingForm((prev) => ({ ...prev, clientName: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                type="tel"
                value={bookingForm.clientPhone}
                placeholder="+40 700 000 000"
                onChange={(event) => setBookingForm((prev) => ({ ...prev, clientPhone: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label>Service</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  disabled={providerServices.length === 0}
                  onClick={() => {
                    if (providerServices.length === 0) return;
                    setUseCustomService((prev) => !prev);
                    setAddError(null);
                  }}
                >
                  {providerServices.length === 0
                    ? "Custom Service"
                    : useCustomService
                      ? "Use Existing Service"
                      : "Use Custom Service"}
                </Button>
              </div>

              {!useCustomService ? (
                <Select value={bookingForm.serviceId} onValueChange={handleServiceChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {providerServices.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.title} ({service.duration} min +{" "}
                        {getEffectiveServiceBufferMinutes(service, currentProvider)} min buffer)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="space-y-2 rounded-xl border bg-muted/30 p-3">
                  <Input
                    value={customService.title}
                    placeholder="Custom service title"
                    onChange={(event) => setCustomService((prev) => ({ ...prev, title: event.target.value }))}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      min={0}
                      value={customService.price}
                      onChange={(event) =>
                        setCustomService((prev) => ({ ...prev, price: Number(event.target.value) || 0 }))
                      }
                      placeholder="Price"
                    />
                    <Input
                      type="number"
                      min={5}
                      step={5}
                      value={customService.duration}
                      onChange={(event) => {
                        const next = Number(event.target.value) || 5;
                        setCustomService((prev) => ({ ...prev, duration: next }));
                        setBookingForm((prev) => ({ ...prev, duration: next }));
                      }}
                      placeholder="Duration"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <div className="flex gap-2">
                {[0, 1, 2].map((offset) => {
                  const date = addDays(new Date(), offset);
                  const key = format(date, "yyyy-MM-dd");
                  const label = offset === 0 ? "Today" : offset === 1 ? "Tomorrow" : format(date, "EEE d MMM");
                  return (
                    <Button
                      key={key}
                      type="button"
                      size="sm"
                      variant={bookingForm.date === key ? "default" : "outline"}
                      className="flex-1 text-xs"
                      onClick={() => setBookingForm((prev) => ({ ...prev, date: key }))}
                    >
                      {label}
                    </Button>
                  );
                })}
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {bookingForm.date ? format(new Date(`${bookingForm.date}T00:00:00`), "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={bookingForm.date ? new Date(`${bookingForm.date}T00:00:00`) : undefined}
                    onSelect={(date) => {
                      if (!date) return;
                      setBookingForm((prev) => ({ ...prev, date: format(date, "yyyy-MM-dd") }));
                    }}
                    disabled={(date) => isBefore(date, startOfDay(new Date()))}
                    initialFocus
                    className={cn("p-3")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={bookingForm.startTime}
                  onChange={(event) => setBookingForm((prev) => ({ ...prev, startTime: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Duration (min)</Label>
                <Input
                  type="number"
                  min={5}
                  step={5}
                  value={bookingForm.duration}
                  onChange={(event) =>
                    setBookingForm((prev) => ({ ...prev, duration: Number(event.target.value) || 5 }))
                  }
                />
              </div>
            </div>

            <div className="rounded-xl border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              Ends at {previewEndTime}
              {previewCrossesMidnight ? " (next day - not allowed)" : ""}
            </div>

            {addError && (
              <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{addError}</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={addManualBooking}>Save Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showEditDialog}
        onOpenChange={(open) => {
          setShowEditDialog(open);
          if (!open) setEditError(null);
        }}
      >
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Client Name</Label>
              <Input
                value={editForm.clientName}
                placeholder="Client name"
                onChange={(event) => setEditForm((prev) => ({ ...prev, clientName: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                type="tel"
                value={editForm.clientPhone}
                placeholder="+40 700 000 000"
                onChange={(event) => setEditForm((prev) => ({ ...prev, clientPhone: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Service</Label>
              {providerServices.length > 0 ? (
                <Select value={editForm.serviceId} onValueChange={handleEditServiceChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {providerServices.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.title} ({service.duration} min +{" "}
                        {getEffectiveServiceBufferMinutes(service, currentProvider)} min buffer)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="rounded-xl border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                  No services available to select.
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <div className="flex gap-2">
                {[0, 1, 2].map((offset) => {
                  const date = addDays(new Date(), offset);
                  const key = format(date, "yyyy-MM-dd");
                  const label = offset === 0 ? "Today" : offset === 1 ? "Tomorrow" : format(date, "EEE d MMM");
                  return (
                    <Button
                      key={key}
                      type="button"
                      size="sm"
                      variant={editForm.date === key ? "default" : "outline"}
                      className="flex-1 text-xs"
                      onClick={() => setEditForm((prev) => ({ ...prev, date: key }))}
                    >
                      {label}
                    </Button>
                  );
                })}
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {editForm.date ? format(new Date(`${editForm.date}T00:00:00`), "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={editForm.date ? new Date(`${editForm.date}T00:00:00`) : undefined}
                    onSelect={(date) => {
                      if (!date) return;
                      setEditForm((prev) => ({ ...prev, date: format(date, "yyyy-MM-dd") }));
                    }}
                    disabled={(date) => isBefore(date, startOfDay(new Date()))}
                    initialFocus
                    className={cn("p-3")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={editForm.startTime}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, startTime: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Duration (min)</Label>
                <Input
                  type="number"
                  min={5}
                  step={5}
                  value={editForm.duration}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, duration: Number(event.target.value) || 5 }))}
                />
              </div>
            </div>

            <div className="rounded-xl border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              Ends at {editPreviewEndTime}
              {editPreviewCrossesMidnight ? " (next day - not allowed)" : ""}
            </div>

            {editError && (
              <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveEditedBooking}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!pendingMove}
        onOpenChange={(open) => {
          if (!open) setPendingMove(null);
        }}
      >
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Confirm Time Change</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Do you want to update this booking to the new time?</p>
            {pendingMove && (
              <div className="rounded-xl border bg-muted/30 px-3 py-2 text-xs text-foreground">
                <p className="font-medium">New schedule</p>
                <p className="mt-1">
                  {formatDateLabel(pendingMove.date)} · {pendingMove.startTime} - {pendingMove.endTime}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingMove(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!pendingMove) return;
                dispatch({
                  type: "UPDATE_BOOKING",
                  payload: {
                    id: pendingMove.bookingId,
                    date: pendingMove.date,
                    startTime: pendingMove.startTime,
                    endTime: pendingMove.endTime,
                  },
                });
                setSelectedDate(pendingMove.date);
                setSelectedBookingId(pendingMove.bookingId);
                setPendingMove(null);
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProviderPanelLayout>
  );
};

export default ProviderSchedule;
