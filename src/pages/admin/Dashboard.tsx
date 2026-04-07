import {
  ArrowDownRight,
  ArrowUpRight,
  Briefcase,
  DollarSign,
  Minus,
  UserCheck,
  Users,
} from "lucide-react";
import { AdminPanelLayout } from "@/components/AdminPanelLayout";
import { useAppStore } from "@/store/AppContext";
import type { BookingStatus } from "@/types";
import { cn } from "@/lib/utils";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const PANEL_CLASS = "rounded-2xl border border-border/60 bg-card p-6 shadow-card";
const TOOLTIP_CLASS = "rounded-lg border border-border/70 bg-background/95 px-3 py-2 text-xs shadow-lg backdrop-blur";
const CATEGORY_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--destructive))",
];

const STATUS_META: Record<BookingStatus, { label: string; color: string }> = {
  PENDING: { label: "Pending", color: "hsl(var(--warning))" },
  CONFIRMED: { label: "Confirmed", color: "hsl(var(--primary))" },
  COMPLETED: { label: "Completed", color: "hsl(var(--success))" },
  CANCELLED: { label: "Cancelled", color: "hsl(var(--destructive))" },
};

function createMonthBuckets(monthCount: number) {
  const now = new Date();
  return Array.from({ length: monthCount }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (monthCount - 1 - index), 1);
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: date.toLocaleDateString("en-US", { month: "short" }),
    };
  });
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

const AdminDashboard = () => {
  const { state } = useAppStore();

  const serviceById = new Map(state.services.map((service) => [service.id, service]));
  const activeProviders = state.providerProfiles.filter((provider) => !provider.blocked);
  const totalProviders = state.providerProfiles.length;
  const totalServices = state.services.length;
  const totalClients = state.users.filter((user) => user.role === "USER").length;
  const totalBookings = state.bookings.length;
  const totalRevenue = state.bookings
    .filter((booking) => booking.status === "COMPLETED")
    .reduce((sum, booking) => sum + (serviceById.get(booking.serviceId)?.price ?? 0), 0);

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

    const periodBookings = state.bookings.filter((booking) => {
      const bookingDate = new Date(`${booking.date}T00:00:00`);
      return !Number.isNaN(bookingDate.getTime()) && bookingDate >= start && bookingDate < end;
    });

    return {
      activeProviders: new Set(periodBookings.map((booking) => booking.providerId)).size,
      servicesUsed: new Set(periodBookings.map((booking) => booking.serviceId)).size,
      clientsActive: new Set(periodBookings.map((booking) => booking.userId)).size,
      revenue: periodBookings
        .filter((booking) => booking.status === "COMPLETED")
        .reduce((sum, booking) => sum + (serviceById.get(booking.serviceId)?.price ?? 0), 0),
    };
  });

  const providersSeries = trendWeeks.map((week, index) => ({ point: index, value: week.activeProviders }));
  const servicesSeries = trendWeeks.map((week, index) => ({ point: index, value: week.servicesUsed }));
  const clientsSeries = trendWeeks.map((week, index) => ({ point: index, value: week.clientsActive }));
  const revenueSeries = trendWeeks.map((week, index) => ({ point: index, value: week.revenue }));

  const providersDelta = getTrendDelta(providersSeries.map((item) => item.value));
  const servicesDelta = getTrendDelta(servicesSeries.map((item) => item.value));
  const clientsDelta = getTrendDelta(clientsSeries.map((item) => item.value));
  const revenueDelta = getTrendDelta(revenueSeries.map((item) => item.value));

  const cards = [
    {
      label: "Total providers",
      value: totalProviders.toLocaleString(),
      icon: Users,
      accent: "text-primary bg-primary/15",
      lineColor: "hsl(var(--primary))",
      series: providersSeries,
      delta: providersDelta,
    },
    {
      label: "Total services",
      value: totalServices.toLocaleString(),
      icon: Briefcase,
      accent: "text-accent bg-accent/15",
      lineColor: "hsl(var(--accent))",
      series: servicesSeries,
      delta: servicesDelta,
    },
    {
      label: "Total clients",
      value: totalClients.toLocaleString(),
      icon: UserCheck,
      accent: "text-warning bg-warning/15",
      lineColor: "hsl(var(--warning))",
      series: clientsSeries,
      delta: clientsDelta,
    },
    {
      label: "Platform revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      accent: "text-success bg-success/15",
      lineColor: "hsl(var(--success))",
      series: revenueSeries,
      delta: revenueDelta,
    },
  ];

  const statusSummary = (Object.keys(STATUS_META) as BookingStatus[]).map((status) => ({
    status,
    label: STATUS_META[status].label,
    color: STATUS_META[status].color,
    count: state.bookings.filter((booking) => booking.status === status).length,
  }));
  const statusData = statusSummary.filter((item) => item.count > 0).map((item) => ({ name: item.label, value: item.count, color: item.color }));

  const monthBuckets = createMonthBuckets(6);
  const monthlyPerformance = monthBuckets.map((bucket) => ({
    month: bucket.label,
    bookings: 0,
    completed: 0,
    cancelled: 0,
    revenue: 0,
  }));
  const monthIndex = new Map(monthBuckets.map((bucket, index) => [bucket.key, index]));

  state.bookings.forEach((booking) => {
    const bookingDate = new Date(`${booking.date}T00:00:00`);
    if (Number.isNaN(bookingDate.getTime())) return;

    const key = `${bookingDate.getFullYear()}-${String(bookingDate.getMonth() + 1).padStart(2, "0")}`;
    const index = monthIndex.get(key);
    if (index === undefined) return;

    monthlyPerformance[index].bookings += 1;
    if (booking.status === "COMPLETED") {
      monthlyPerformance[index].completed += 1;
      monthlyPerformance[index].revenue += serviceById.get(booking.serviceId)?.price ?? 0;
    }
    if (booking.status === "CANCELLED") monthlyPerformance[index].cancelled += 1;
  });

  const hasMonthlyActivity = monthlyPerformance.some((entry) => entry.bookings > 0 || entry.revenue > 0);

  const categoryShare = state.categories
    .map((category, index) => {
      const providerCount = activeProviders.filter((provider) => provider.categoryIds.includes(category.id)).length;
      return { name: category.name, value: providerCount, color: CATEGORY_COLORS[index % CATEGORY_COLORS.length] };
    })
    .filter((item) => item.value > 0);

  const topProviders = state.providerProfiles
    .map((provider) => {
      const providerBookings = state.bookings.filter((booking) => booking.providerId === provider.id);
      const revenue = providerBookings
        .filter((booking) => booking.status === "COMPLETED")
        .reduce((sum, booking) => sum + (serviceById.get(booking.serviceId)?.price ?? 0), 0);

      return {
        name: provider.name,
        bookings: providerBookings.length,
        revenue,
      };
    })
    .filter((item) => item.bookings > 0 || item.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue || b.bookings - a.bookings)
    .slice(0, 8);
  return (
    <AdminPanelLayout>
      <div className="animate-fade-in space-y-6">
        <section className="space-y-2">
          <h2 className="font-display text-2xl font-bold">Platform Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Real-time view of provider network growth, booking health, and revenue trends.
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
              <h3 className="text-sm font-semibold">Booking Health</h3>
              <p className="text-xs text-muted-foreground">Current booking status mix</p>
            </div>

            {statusData.length > 0 ? (
              <div className="space-y-4">
                <div className="relative h-[210px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusData} dataKey="value" innerRadius={52} outerRadius={84} paddingAngle={0} stroke="none" strokeWidth={0}>
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
                              <p className="text-muted-foreground">{Number(payload[0].value).toLocaleString()} bookings</p>
                            </div>
                          );
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold tabular-nums">{totalBookings}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  {statusSummary.map((item) => (
                    <div key={item.status} className="flex items-center justify-between rounded-lg border border-border/60 bg-background/25 px-3 py-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-[3px]" style={{ backgroundColor: item.color }} />
                        <span className="text-muted-foreground">{item.label}</span>
                      </div>
                      <span className="font-semibold tabular-nums">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="py-16 text-center text-sm text-muted-foreground">No bookings yet.</p>
            )}
          </div>

          <div className={cn(PANEL_CLASS, "xl:col-span-8")}>
            <div className="mb-4 flex items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold">6-Month Platform Activity</h3>
                <p className="text-xs text-muted-foreground">Bookings volume, outcome trends, and revenue over time</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px] bg-accent/70" />Revenue</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px] bg-primary/60" />Bookings</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px] bg-success" />Completed</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px] bg-destructive" />Cancelled</span>
              </div>
            </div>

            <div className="h-[300px]">
              {hasMonthlyActivity ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthlyPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.35} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className={TOOLTIP_CLASS}>
                            <p className="font-medium">{String(label)}</p>
                          {payload.map((entry) => {
                            const value = Number(entry.value ?? 0);
                            const formatted = entry.dataKey === "revenue" ? `$${value.toLocaleString()}` : value.toLocaleString();
                              return (
                                <p key={`${entry.name}-${entry.dataKey}`} className="text-muted-foreground">
                                  {String(entry.name)}: {formatted}
                                </p>
                              );
                            })}
                        </div>
                      );
                    }}
                  />
                    <Bar yAxisId="left" dataKey="bookings" name="Bookings" fill="hsl(var(--primary) / 0.30)" radius={[8, 8, 0, 0]} maxBarSize={34} />
                    <Line yAxisId="left" type="monotone" dataKey="completed" name="Completed" stroke="hsl(var(--success))" strokeWidth={2.3} dot={false} connectNulls />
                    <Line yAxisId="left" type="monotone" dataKey="cancelled" name="Cancelled" stroke="hsl(var(--destructive))" strokeWidth={2.2} dot={false} connectNulls />
                    <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue" stroke="hsl(var(--accent))" strokeWidth={2.8} dot={false} connectNulls />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <p className="py-20 text-center text-sm text-muted-foreground">No monthly activity data yet.</p>
              )}
            </div>
          </div>

          <div className={cn(PANEL_CLASS, "xl:col-span-5")}>
            <div className="mb-4">
              <h3 className="text-sm font-semibold">Provider Category Share</h3>
              <p className="text-xs text-muted-foreground">Active providers by category</p>
            </div>

            {categoryShare.length > 0 ? (
              <div className="space-y-4">
                <div className="relative h-[210px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryShare} dataKey="value" innerRadius={54} outerRadius={88} paddingAngle={0} stroke="none" strokeWidth={0}>
                        {categoryShare.map((item) => (
                          <Cell key={item.name} fill={item.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          return (
                            <div className={TOOLTIP_CLASS}>
                              <p className="font-medium">{String(payload[0].name)}</p>
                              <p className="text-muted-foreground">{Number(payload[0].value).toLocaleString()} providers</p>
                            </div>
                          );
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold tabular-nums">{activeProviders.length}</p>
                    </div>
                  </div>
                </div>

                <div className="grid max-h-[120px] gap-2 overflow-auto pr-1">
                  {categoryShare.map((item) => (
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
              <p className="py-16 text-center text-sm text-muted-foreground">No active provider categories yet.</p>
            )}
          </div>

          <div className={cn(PANEL_CLASS, "xl:col-span-7")}>
            <div className="mb-4 flex items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold">Top Provider Performance</h3>
                <p className="text-xs text-muted-foreground">Bookings volume and revenue for strongest providers</p>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px] bg-accent/70" />Revenue</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px] bg-primary/60" />Bookings</span>
              </div>
            </div>

            {topProviders.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={topProviders}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.35} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => (String(value).length > 14 ? `${String(value).slice(0, 14)}...` : String(value))}
                    />
                    <YAxis yAxisId="bookings" allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis
                      yAxisId="revenue"
                      orientation="right"
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        const bookingsValue = Number(payload.find((entry) => entry.dataKey === "bookings")?.value ?? 0);
                        const revenueValue = Number(payload.find((entry) => entry.dataKey === "revenue")?.value ?? 0);
                        return (
                          <div className={TOOLTIP_CLASS}>
                            <p className="font-medium">{String(label)}</p>
                            <p className="text-muted-foreground">Bookings: {bookingsValue.toLocaleString()}</p>
                            <p className="text-muted-foreground">Revenue: ${revenueValue.toLocaleString()}</p>
                          </div>
                        );
                      }}
                    />
                    <Bar yAxisId="bookings" dataKey="bookings" name="Bookings" fill="hsl(var(--primary) / 0.65)" radius={[8, 8, 0, 0]} maxBarSize={50} />
                    <Line yAxisId="revenue" dataKey="revenue" name="Revenue" stroke="hsl(var(--accent))" strokeWidth={2.8} dot={{ r: 2.5 }} connectNulls />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-16 text-center text-sm text-muted-foreground">No provider performance data available yet.</p>
            )}
          </div>
        </section>

        <section className={cn(PANEL_CLASS, "p-6")}>
          <h3 className="mb-4 text-sm font-semibold">Recent Bookings</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="pb-3 font-medium">Client</th>
                  <th className="pb-3 font-medium">Provider</th>
                  <th className="pb-3 font-medium">Service</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {state.bookings.slice(0, 10).map((booking) => {
                  const service = serviceById.get(booking.serviceId);
                  const provider = state.providerProfiles.find((item) => item.id === booking.providerId);
                  return (
                    <tr key={booking.id} className="text-xs">
                      <td className="py-3">{booking.userName}</td>
                      <td className="py-3">{provider?.name ?? "-"}</td>
                      <td className="py-3">{service?.title ?? "-"}</td>
                      <td className="py-3">{booking.date}</td>
                      <td className="py-3">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            booking.status === "COMPLETED"
                              ? "bg-success/15 text-success"
                              : booking.status === "CONFIRMED"
                                ? "bg-primary/15 text-primary"
                                : booking.status === "PENDING"
                                  ? "bg-warning/15 text-warning"
                                  : "bg-destructive/15 text-destructive"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-3 text-right font-medium">${service?.price ?? 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {state.bookings.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No bookings yet.</p>}
          </div>
        </section>
      </div>
    </AdminPanelLayout>
  );
};

export default AdminDashboard;
