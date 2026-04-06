import { ProviderPanelLayout } from "@/components/ProviderPanelLayout";
import { useAppStore } from "@/store/AppContext";
import { ArrowDownRight, ArrowUpRight, BookOpen, DollarSign, Minus, Star, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toMinutes(value: string): number | null {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (Number.isNaN(hours) || Number.isNaN(minutes) || hours < 0 || hours > 24 || minutes < 0 || minutes > 59) return null;
  if (hours === 24 && minutes !== 0) return null;

  return hours * 60 + minutes;
}

function durationMinutes(startTime: string, endTime: string): number {
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);
  if (start === null || end === null) return 0;
  if (end >= start) return end - start;
  return 24 * 60 - start + end;
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

const PANEL_CLASS =
  "rounded-2xl border border-border/60 bg-card p-6 shadow-card";

const tooltipClass = "rounded-lg border border-border/70 bg-background/95 px-3 py-2 text-xs shadow-lg backdrop-blur";

const ProviderDashboard = () => {
  const { state, currentProvider } = useAppStore();
  if (!currentProvider) return null;

  const providerServices = state.services.filter((service) => service.providerId === currentProvider.id);
  const providerBookings = state.bookings.filter((booking) => booking.providerId === currentProvider.id);
  const providerAvailability = state.availability.filter((entry) => entry.providerId === currentProvider.id);
  const serviceById = new Map(state.services.map((service) => [service.id, service]));

  const totalClients = new Set(providerBookings.map((booking) => booking.userId)).size;
  const totalBookings = providerBookings.length;
  const totalReviews = state.reviews.filter((review) => review.providerId === currentProvider.id).length;
  const profits = providerBookings
    .filter((booking) => booking.status === "COMPLETED")
    .reduce((sum, booking) => sum + (serviceById.get(booking.serviceId)?.price ?? 0), 0);

  const bookingsPerClient = providerBookings.reduce((map, booking) => {
    map.set(booking.userId, (map.get(booking.userId) ?? 0) + 1);
    return map;
  }, new Map<string, number>());
  const newClients = Array.from(bookingsPerClient.values()).filter((count) => count === 1).length;
  const returningClients = Array.from(bookingsPerClient.values()).filter((count) => count > 1).length;
  const clientMixData = [
    { name: "New clients", value: newClients, color: "hsl(var(--primary))" },
    { name: "Coming back clients", value: returningClients, color: "hsl(var(--success))" },
  ].filter((item) => item.value > 0);

  const now = new Date();
  const weekStart = getMondayStart(now);
  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const weekCapacityData = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);

    const dateKey = formatDateKey(date);
    const weekday = date.getDay();
    const label = weekdayLabels[weekday];

    const plannedMinutes = providerAvailability
      .filter((entry) => entry.weekday === weekday)
      .reduce((sum, entry) => sum + durationMinutes(entry.startTime, entry.endTime), 0);

    const rawBookedMinutes = providerBookings
      .filter((booking) => booking.date === dateKey && booking.status !== "CANCELLED")
      .reduce((sum, booking) => sum + durationMinutes(booking.startTime, booking.endTime), 0);

    const bookedMinutes = Math.min(rawBookedMinutes, plannedMinutes);
    const freeMinutes = Math.max(plannedMinutes - bookedMinutes, 0);

    return {
      day: label,
      bookedHours: Number((bookedMinutes / 60).toFixed(1)),
      freeHours: Number((freeMinutes / 60).toFixed(1)),
      plannedHours: Number((plannedMinutes / 60).toFixed(1)),
    };
  });
  const hasWeekCapacity = weekCapacityData.some((item) => item.plannedHours > 0 || item.bookedHours > 0);

  const serviceBookingsData = providerServices
    .map((service) => ({
      service: service.title,
      bookings: providerBookings.filter((booking) => booking.serviceId === service.id && booking.status !== "CANCELLED").length,
    }))
    .sort((a, b) => b.bookings - a.bookings);
  const hasServices = providerServices.length > 0;

  const trendWeekStarts = Array.from({ length: 8 }, (_, index) => {
    const start = new Date(weekStart);
    start.setDate(weekStart.getDate() - (7 * (7 - index)));
    return start;
  });
  const trendWeeks = trendWeekStarts.map((start) => {
    const end = new Date(start);
    end.setDate(start.getDate() + 7);

    const periodBookings = providerBookings.filter((booking) => {
      const bookingDate = new Date(`${booking.date}T00:00:00`);
      return !Number.isNaN(bookingDate.getTime()) && bookingDate >= start && bookingDate < end;
    });
    const periodReviews = state.reviews.filter((review) => {
      if (review.providerId !== currentProvider.id) return false;
      const createdAt = new Date(review.createdAt);
      return !Number.isNaN(createdAt.getTime()) && createdAt >= start && createdAt < end;
    });

    return {
      clients: new Set(periodBookings.map((booking) => booking.userId)).size,
      bookings: periodBookings.filter((booking) => booking.status !== "CANCELLED").length,
      profits: periodBookings
        .filter((booking) => booking.status === "COMPLETED")
        .reduce((sum, booking) => sum + (serviceById.get(booking.serviceId)?.price ?? 0), 0),
      reviews: periodReviews.length,
    };
  });

  const clientsSeries = trendWeeks.map((week, index) => ({ point: index, value: week.clients }));
  const bookingsSeries = trendWeeks.map((week, index) => ({ point: index, value: week.bookings }));
  const profitsSeries = trendWeeks.map((week, index) => ({ point: index, value: week.profits }));
  const reviewsSeries = trendWeeks.map((week, index) => ({ point: index, value: week.reviews }));

  const clientsDelta = getTrendDelta(clientsSeries.map((item) => item.value));
  const bookingsDelta = getTrendDelta(bookingsSeries.map((item) => item.value));
  const profitsDelta = getTrendDelta(profitsSeries.map((item) => item.value));
  const reviewsDelta = getTrendDelta(reviewsSeries.map((item) => item.value));

  const cards = [
    {
      label: "Total clients",
      value: totalClients.toLocaleString(),
      icon: Users,
      accent: "text-primary bg-primary/15",
      lineColor: "hsl(var(--primary))",
      series: clientsSeries,
      delta: clientsDelta,
    },
    {
      label: "Total bookings",
      value: totalBookings.toLocaleString(),
      icon: BookOpen,
      accent: "text-accent bg-accent/15",
      lineColor: "hsl(var(--accent))",
      series: bookingsSeries,
      delta: bookingsDelta,
    },
    {
      label: "Profits",
      value: `$${profits.toLocaleString()}`,
      icon: DollarSign,
      accent: "text-success bg-success/15",
      lineColor: "hsl(var(--success))",
      series: profitsSeries,
      delta: profitsDelta,
    },
    {
      label: "Total reviews",
      value: totalReviews.toLocaleString(),
      icon: Star,
      accent: "text-warning bg-warning/15",
      lineColor: "hsl(var(--warning))",
      series: reviewsSeries,
      delta: reviewsDelta,
    },
  ];

  return (
    <ProviderPanelLayout>
      <div className="animate-fade-in space-y-6">
        <section className="space-y-2">
          <h2 className="font-display text-2xl font-bold">Business Dashboard</h2>
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
                    <Line type="monotone" dataKey="value" stroke={card.lineColor} strokeWidth={2.2} dot={false} connectNulls />
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
              <h3 className="text-sm font-semibold">Client Mix</h3>
              <p className="text-xs text-muted-foreground">New vs coming back clients</p>
            </div>

            {clientMixData.length > 0 ? (
              <div className="space-y-4">
                <div className="relative h-[210px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={clientMixData}
                        dataKey="value"
                        innerRadius={52}
                        outerRadius={84}
                        paddingAngle={0}
                        stroke="none"
                        strokeWidth={0}
                      >
                        {clientMixData.map((item) => (
                          <Cell key={item.name} fill={item.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          return (
                            <div className={tooltipClass}>
                              <p className="font-medium">{String(payload[0].name)}</p>
                              <p className="text-muted-foreground">{Number(payload[0].value).toLocaleString()} clients</p>
                            </div>
                          );
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold tabular-nums">{totalClients}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  {clientMixData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between rounded-lg border border-border/60 bg-background/25 px-3 py-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-[3px]" style={{ backgroundColor: item.color }} />
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="font-semibold tabular-nums">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="py-16 text-center text-sm text-muted-foreground">No client data yet.</p>
            )}
          </div>

          <div className={cn(PANEL_CLASS, "xl:col-span-8")}>
            <div className="mb-4 flex items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold">Week Capacity</h3>
                <p className="text-xs text-muted-foreground">Booked time vs free time (current week)</p>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px] bg-primary" />Booked</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px] bg-muted-foreground/40" />Free</span>
              </div>
            </div>

            {hasWeekCapacity ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weekCapacityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.35} />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(value) => `${value}h`} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        const booked = Number(payload.find((item) => item.dataKey === "bookedHours")?.value ?? 0);
                        const free = Number(payload.find((item) => item.dataKey === "freeHours")?.value ?? 0);
                        return (
                          <div className={tooltipClass}>
                            <p className="font-medium">{String(label)}</p>
                            <p className="text-muted-foreground">Booked: {booked.toFixed(1)}h</p>
                            <p className="text-muted-foreground">Free: {free.toFixed(1)}h</p>
                            <p className="text-muted-foreground">Total: {(booked + free).toFixed(1)}h</p>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="bookedHours" name="Booked" stackId="time" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="freeHours" name="Free" stackId="time" fill="hsl(var(--muted-foreground) / 0.35)" radius={[0, 0, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-20 text-center text-sm text-muted-foreground">No weekly capacity data yet.</p>
            )}
          </div>

          <div className={cn(PANEL_CLASS, "xl:col-span-12")}>
            <div className="mb-4">
              <h3 className="text-sm font-semibold">Bookings per Service</h3>
              <p className="text-xs text-muted-foreground">How many times each service was booked</p>
            </div>

            {!hasServices ? (
              <p className="py-16 text-center text-sm text-muted-foreground">No services added yet.</p>
            ) : (
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={serviceBookingsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.35} />
                    <XAxis
                      dataKey="service"
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => (String(value).length > 18 ? `${String(value).slice(0, 18)}...` : String(value))}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        const count = Number(payload[0].value ?? 0);
                        return (
                          <div className={tooltipClass}>
                            <p className="font-medium">{String(label)}</p>
                            <p className="text-muted-foreground">{count.toLocaleString()} bookings</p>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="bookings" name="Bookings" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} maxBarSize={56} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </section>
      </div>
    </ProviderPanelLayout>
  );
};

export default ProviderDashboard;
