import { useState } from "react";
import { useAppStore } from "@/store/AppContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  Calendar,
  Check,
  CheckCircle,
  Clock,
  Minus,
  Phone,
  User,
  XCircle,
} from "lucide-react";
import { formatDate } from "@/lib/booking";
import { generateId } from "@/lib/storage";
import { ProviderPanelLayout } from "@/components/ProviderPanelLayout";
import { cn } from "@/lib/utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toLocalDateKey } from "@/lib/date";

const PANEL_CLASS = "rounded-2xl border border-border/60 bg-card p-6 shadow-card";
const TOOLTIP_CLASS = "rounded-lg border border-border/70 bg-background/95 px-3 py-2 text-xs shadow-lg backdrop-blur";

function getBookingEndMs(date: string, endTime: string): number | null {
  const normalizedTime = /^\d{2}:\d{2}$/.test(endTime) ? `${endTime}:00` : endTime;
  const ms = new Date(`${date}T${normalizedTime}`).getTime();
  return Number.isNaN(ms) ? null : ms;
}

function getMondayStart(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  const mondayOffset = (copy.getDay() + 6) % 7;
  copy.setDate(copy.getDate() - mondayOffset);
  return copy;
}

function getTrendDelta(series: number[]) {
  const current = series.at(-1) ?? 0;
  const previous = series.at(-2) ?? 0;

  if (previous === 0) {
    if (current === 0) return { direction: "flat" as const, percent: 0 };
    return { direction: "up" as const, percent: 100 };
  }

  const percent = ((current - previous) / previous) * 100;
  if (percent > 0) return { direction: "up" as const, percent };
  if (percent < 0) return { direction: "down" as const, percent };
  return { direction: "flat" as const, percent: 0 };
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-warning/10 text-warning",
  CONFIRMED: "bg-primary/10 text-primary",
  CANCELLED: "bg-destructive/10 text-destructive",
  COMPLETED: "bg-success/10 text-success",
};

const statusColors: Record<string, string> = {
  PENDING: "hsl(var(--warning))",
  CONFIRMED: "hsl(var(--primary))",
  COMPLETED: "hsl(var(--success))",
  CANCELLED: "hsl(var(--destructive))",
};

const ProviderBookings = () => {
  const { state, dispatch, currentProvider } = useAppStore();
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  if (!currentProvider) return null;

  const bookings = state.bookings.filter((booking) => booking.providerId === currentProvider.id);
  const getService = (id: string) => state.services.find((service) => service.id === id);
  const today = toLocalDateKey(new Date());

  const pendingCount = bookings.filter((booking) => booking.status === "PENDING").length;
  const confirmedCount = bookings.filter((booking) => booking.status === "CONFIRMED").length;
  const completedCount = bookings.filter((booking) => booking.status === "COMPLETED").length;
  const cancelledCount = bookings.filter((booking) => booking.status === "CANCELLED").length;
  const upcomingCount = bookings.filter((booking) => booking.status === "CONFIRMED" && booking.date >= today).length;

  const statusSummary = [
    { status: "PENDING", label: "Pending", count: pendingCount },
    { status: "CONFIRMED", label: "Confirmed", count: confirmedCount },
    { status: "COMPLETED", label: "Completed", count: completedCount },
    { status: "CANCELLED", label: "Cancelled", count: cancelledCount },
  ];

  const statusData = statusSummary
    .filter((item) => item.count > 0)
    .map((item) => ({ name: item.label, value: item.count, color: statusColors[item.status] }));

  const now = new Date();
  const weekStart = getMondayStart(now);
  const trendWeekStarts = Array.from({ length: 8 }, (_, index) => {
    const start = new Date(weekStart);
    start.setDate(weekStart.getDate() - 7 * (7 - index));
    return start;
  });

  const trendWeeks = trendWeekStarts.map((start) => {
    const end = new Date(start);
    end.setDate(start.getDate() + 7);

    const periodBookings = bookings.filter((booking) => {
      const bookingDate = new Date(`${booking.date}T00:00:00`);
      return !Number.isNaN(bookingDate.getTime()) && bookingDate >= start && bookingDate < end;
    });

    return {
      total: periodBookings.length,
      pending: periodBookings.filter((booking) => booking.status === "PENDING").length,
      confirmed: periodBookings.filter((booking) => booking.status === "CONFIRMED").length,
      completed: periodBookings.filter((booking) => booking.status === "COMPLETED").length,
    };
  });

  const totalSeries = trendWeeks.map((week, index) => ({ point: index, value: week.total }));
  const pendingSeries = trendWeeks.map((week, index) => ({ point: index, value: week.pending }));
  const confirmedSeries = trendWeeks.map((week, index) => ({ point: index, value: week.confirmed }));
  const completedSeries = trendWeeks.map((week, index) => ({ point: index, value: week.completed }));

  const totalDelta = getTrendDelta(totalSeries.map((item) => item.value));
  const pendingDelta = getTrendDelta(pendingSeries.map((item) => item.value));
  const confirmedDelta = getTrendDelta(confirmedSeries.map((item) => item.value));
  const completedDelta = getTrendDelta(completedSeries.map((item) => item.value));

  const cards = [
    {
      label: "Total bookings",
      value: bookings.length.toLocaleString(),
      icon: BookOpen,
      accent: "text-primary bg-primary/15",
      lineColor: "hsl(var(--primary))",
      series: totalSeries,
      delta: totalDelta,
    },
    {
      label: "Pending approval",
      value: pendingCount.toLocaleString(),
      icon: Clock,
      accent: "text-warning bg-warning/15",
      lineColor: "hsl(var(--warning))",
      series: pendingSeries,
      delta: pendingDelta,
    },
    {
      label: "Upcoming confirmed",
      value: upcomingCount.toLocaleString(),
      icon: Calendar,
      accent: "text-accent bg-accent/15",
      lineColor: "hsl(var(--accent))",
      series: confirmedSeries,
      delta: confirmedDelta,
    },
    {
      label: "Completed",
      value: completedCount.toLocaleString(),
      icon: CheckCircle,
      accent: "text-success bg-success/15",
      lineColor: "hsl(var(--success))",
      series: completedSeries,
      delta: completedDelta,
    },
  ];

  const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekLoadData = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    const dateKey = toLocalDateKey(date);

    const dayBookings = bookings.filter((booking) => booking.date === dateKey);

    return {
      day: weekdayLabels[index],
      pending: dayBookings.filter((booking) => booking.status === "PENDING").length,
      confirmed: dayBookings.filter((booking) => booking.status === "CONFIRMED").length,
      completed: dayBookings.filter((booking) => booking.status === "COMPLETED").length,
      cancelled: dayBookings.filter((booking) => booking.status === "CANCELLED").length,
    };
  });

  const hasWeekLoad = weekLoadData.some(
    (day) => day.pending > 0 || day.confirmed > 0 || day.completed > 0 || day.cancelled > 0,
  );

  const handleAccept = (bookingId: string) => {
    const booking = bookings.find((item) => item.id === bookingId);
    if (!booking) return;
    const service = getService(booking.serviceId);

    dispatch({ type: "UPDATE_BOOKING", payload: { id: bookingId, status: "CONFIRMED" } });

    if (!booking.userId.startsWith("guest-")) {
      dispatch({
        type: "ADD_NOTIFICATION",
        payload: {
          id: generateId(),
          userId: booking.userId,
          type: "booking_success",
          title: "Booking Confirmed!",
          message: `${currentProvider.name} accepted your ${service?.title ?? "service"} booking on ${formatDate(booking.date)} at ${booking.startTime}.`,
          read: false,
          createdAt: new Date().toISOString(),
          linkTo: "/dashboard",
        },
      });
    }
  };

  const handleCancel = (bookingId: string) => {
    const booking = bookings.find((item) => item.id === bookingId);
    if (!booking || booking.status === "CANCELLED" || booking.status === "COMPLETED") return;
    const service = getService(booking.serviceId);

    dispatch({ type: "UPDATE_BOOKING", payload: { id: bookingId, status: "CANCELLED" } });

    if (!booking.userId.startsWith("guest-")) {
      dispatch({
        type: "ADD_NOTIFICATION",
        payload: {
          id: generateId(),
          userId: booking.userId,
          type: "booking_success",
          title: "Booking Cancelled",
          message: `${currentProvider.name} cancelled your ${service?.title ?? "service"} booking on ${formatDate(booking.date)} at ${booking.startTime}.`,
          read: false,
          createdAt: new Date().toISOString(),
          linkTo: "/dashboard",
        },
      });
    }
  };

  const handleMarkComplete = (bookingId: string) => {
    const booking = bookings.find((item) => item.id === bookingId);
    if (!booking) return;
    const bookingEndMs = getBookingEndMs(booking.date, booking.endTime);
    if (bookingEndMs === null || Date.now() < bookingEndMs) return;
    const service = getService(booking.serviceId);

    dispatch({ type: "UPDATE_BOOKING", payload: { id: bookingId, status: "COMPLETED" } });

    if (!booking.userId.startsWith("guest-")) {
      dispatch({
        type: "ADD_NOTIFICATION",
        payload: {
          id: generateId(),
          userId: booking.userId,
          type: "review_request",
          title: "How was your experience?",
          message: `Your ${service?.title ?? "service"} with ${currentProvider.name} is completed. Tap to leave a review!`,
          read: false,
          createdAt: new Date().toISOString(),
          linkTo: `/review/${bookingId}`,
        },
      });
    }
  };

  const sortedBookings = [...bookings].sort((a, b) => {
    const order: Record<string, number> = { PENDING: 0, CONFIRMED: 1, COMPLETED: 2, CANCELLED: 3 };
    const statusSort = (order[a.status] ?? 9) - (order[b.status] ?? 9);
    if (statusSort !== 0) return statusSort;
    return `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`);
  });

  return (
    <ProviderPanelLayout>
      <div className="animate-fade-in space-y-6">
        <section className="space-y-2">
          <h2 className="font-display text-2xl font-bold">Bookings Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Manage confirmations, completion, and cancellations from one place.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className={PANEL_CLASS}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${card.accent}`}>
                  <card.icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold tabular-nums">{card.value}</p>
              <div className="mt-2 h-12 rounded-xl bg-background/30 px-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={card.series}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={card.lineColor}
                      strokeWidth={2.2}
                      dot={false}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p
                className={cn(
                  "mt-2 flex items-center gap-1 text-[11px] font-medium",
                  card.delta.direction === "up"
                    ? "text-success"
                    : card.delta.direction === "down"
                      ? "text-destructive"
                      : "text-muted-foreground",
                )}
              >
                {card.delta.direction === "up" && <ArrowUpRight className="h-3.5 w-3.5" />}
                {card.delta.direction === "down" && <ArrowDownRight className="h-3.5 w-3.5" />}
                {card.delta.direction === "flat" && <Minus className="h-3.5 w-3.5" />}
                <span>{Math.abs(card.delta.percent).toFixed(0)}% vs last week</span>
              </p>
            </div>
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-12">
          <div className={cn(PANEL_CLASS, "xl:col-span-4")}>
            <div className="mb-4">
              <h3 className="text-sm font-semibold">Status Mix</h3>
              <p className="text-xs text-muted-foreground">Current booking distribution</p>
            </div>

            {statusData.length > 0 ? (
              <div className="space-y-4">
                <div className="relative h-[210px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="value"
                        innerRadius={52}
                        outerRadius={84}
                        paddingAngle={0}
                        stroke="none"
                        strokeWidth={0}
                      >
                        {statusData.map((item) => (
                          <Cell key={item.name} fill={item.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          return (
                            <div className={TOOLTIP_CLASS}>
                              <p className="font-medium">{String(payload[0].name)}</p>
                              <p className="text-muted-foreground">
                                {Number(payload[0].value).toLocaleString()} bookings
                              </p>
                            </div>
                          );
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold tabular-nums">{bookings.length}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  {statusSummary.map((item) => (
                    <div
                      key={item.status}
                      className="flex items-center justify-between rounded-lg border border-border/60 bg-background/25 px-3 py-2 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-[3px]"
                          style={{ backgroundColor: statusColors[item.status] }}
                        />
                        <span className="text-muted-foreground">{item.label}</span>
                      </div>
                      <span className="font-semibold tabular-nums">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="py-16 text-center text-sm text-muted-foreground">No booking data yet.</p>
            )}
          </div>

          <div className={cn(PANEL_CLASS, "xl:col-span-8")}>
            <div className="mb-4 flex items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold">This Week Load</h3>
                <p className="text-xs text-muted-foreground">Bookings per day by status</p>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-[3px] bg-warning" />
                  Pending
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-[3px] bg-primary" />
                  Confirmed
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-[3px] bg-success" />
                  Completed
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-[3px] bg-destructive" />
                  Cancelled
                </span>
              </div>
            </div>

            {hasWeekLoad ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weekLoadData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.35} />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className={TOOLTIP_CLASS}>
                            <p className="font-medium">{String(label)}</p>
                            {payload.map((entry) => (
                              <p key={`${entry.name}-${entry.dataKey}`} className="text-muted-foreground">
                                {String(entry.name)}: {Number(entry.value ?? 0).toLocaleString()}
                              </p>
                            ))}
                          </div>
                        );
                      }}
                    />
                    <Bar
                      dataKey="pending"
                      stackId="status"
                      name="Pending"
                      fill="hsl(var(--warning))"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="confirmed"
                      stackId="status"
                      name="Confirmed"
                      fill="hsl(var(--primary))"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="completed"
                      stackId="status"
                      name="Completed"
                      fill="hsl(var(--success))"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="cancelled"
                      stackId="status"
                      name="Cancelled"
                      fill="hsl(var(--destructive))"
                      radius={[0, 0, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-20 text-center text-sm text-muted-foreground">No bookings in the current week.</p>
            )}
          </div>
        </section>

        <section className={PANEL_CLASS}>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {bookings.length} Booking{bookings.length !== 1 ? "s" : ""}
          </h3>

          {bookings.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-secondary/30 p-8 text-center">
              <p className="text-sm text-muted-foreground">No bookings yet. Share your services to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedBookings.map((booking) => {
                const service = getService(booking.serviceId);
                const bookingEndMs = getBookingEndMs(booking.date, booking.endTime);
                const completeDisabled = bookingEndMs === null || Date.now() < bookingEndMs;
                return (
                  <div
                    key={booking.id}
                    className={cn(
                      "rounded-2xl border bg-card p-5 shadow-card transition-all duration-200 hover:shadow-elevated",
                      booking.status === "PENDING" && "border-warning/30",
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold">{service?.title || "Service"}</h4>
                      <Badge className={`rounded-full border-0 px-2 text-[10px] ${statusStyles[booking.status]}`}>
                        {booking.status}
                      </Badge>
                    </div>

                    <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <User className="h-3 w-3" />
                        {booking.userName}
                      </span>
                      {booking.userPhone && (
                        <a
                          href={`tel:${booking.userPhone}`}
                          className="flex items-center gap-1.5 transition-colors hover:text-foreground"
                        >
                          <Phone className="h-3 w-3" />
                          {booking.userPhone}
                        </a>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        {formatDate(booking.date)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {booking.startTime} - {booking.endTime}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 border-t pt-3">
                      {booking.status === "PENDING" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAccept(booking.id)}
                          className="h-7 gap-1 rounded-full border-success/30 px-3 text-[10px] text-success hover:border-success/50 hover:bg-success/5 hover:text-success"
                        >
                          <Check className="h-3 w-3" /> Accept
                        </Button>
                      )}
                      {booking.status === "CONFIRMED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkComplete(booking.id)}
                          disabled={completeDisabled}
                          title={`Can be completed at ${booking.endTime} or later`}
                          className="h-7 gap-1 rounded-full border-success/30 px-3 text-[10px] text-success hover:border-success/50 hover:bg-success/5 hover:text-success"
                        >
                          <CheckCircle className="h-3 w-3" /> Mark as Completed
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setBookingToCancel(booking.id)}
                        disabled={booking.status === "CANCELLED" || booking.status === "COMPLETED"}
                        className="h-7 gap-1 rounded-full border-destructive/30 px-3 text-[10px] text-destructive hover:border-destructive/50 hover:bg-destructive/5 hover:text-destructive"
                      >
                        <XCircle className="h-3 w-3" /> Cancel
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <AlertDialog open={Boolean(bookingToCancel)} onOpenChange={(open) => !open && setBookingToCancel(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel booking?</AlertDialogTitle>
              <AlertDialogDescription>
                This action notifies the client and marks this booking as cancelled.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep booking</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  if (!bookingToCancel) return;
                  handleCancel(bookingToCancel);
                  setBookingToCancel(null);
                }}
              >
                Cancel booking
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProviderPanelLayout>
  );
};

export default ProviderBookings;
