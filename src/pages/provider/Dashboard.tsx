import { useAppStore } from "@/store/AppContext";
import { ProviderPanelLayout } from "@/components/ProviderPanelLayout";
import { Users, DollarSign, CheckCircle, Briefcase, TrendingUp, Clock } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  AreaChart, Area,
} from "recharts";

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--warning))",
  "hsl(var(--accent))",
  "hsl(var(--destructive))",
  "hsl(var(--success))",
  "hsl(var(--info, 210 80% 60%))",
];

const ProviderDashboard = () => {
  const { state, currentProvider } = useAppStore();
  if (!currentProvider) return null;

  const bookings = state.bookings.filter((b) => b.providerId === currentProvider.id);
  const services = state.services.filter((s) => s.providerId === currentProvider.id);

  const completedBookings = bookings.filter((b) => b.status === "COMPLETED");
  const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED");

  const totalRevenue = completedBookings.reduce((sum, b) => {
    const svc = services.find((s) => s.id === b.serviceId);
    return sum + (svc?.price ?? 0);
  }, 0);

  const uniqueClients = new Set(bookings.map((b) => b.userId)).size;

  // Stats cards
  const stats = [
    {
      label: "Total Clients",
      value: uniqueClients,
      icon: Users,
      gradient: "from-primary/15 to-primary/5",
      iconBg: "bg-primary/20 text-primary",
      trend: `${confirmedBookings.length} upcoming`,
    },
    {
      label: "Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      gradient: "from-success/15 to-success/5",
      iconBg: "bg-success/20 text-success",
      trend: `${completedBookings.length} completed`,
    },
    {
      label: "Services",
      value: services.length,
      icon: Briefcase,
      gradient: "from-accent/15 to-accent/5",
      iconBg: "bg-accent/20 text-accent",
      trend: `${bookings.length} total bookings`,
    },
    {
      label: "Completed",
      value: completedBookings.length,
      icon: CheckCircle,
      gradient: "from-warning/15 to-warning/5",
      iconBg: "bg-warning/20 text-warning",
      trend: `${((completedBookings.length / Math.max(bookings.length, 1)) * 100).toFixed(0)}% rate`,
    },
  ];

  // Pie chart: bookings per service
  const bookingsPerService = services.map((s) => ({
    name: s.title.length > 18 ? s.title.slice(0, 18) + "…" : s.title,
    value: bookings.filter((b) => b.serviceId === s.id).length,
  })).filter((d) => d.value > 0);

  // Bar chart: revenue per service
  const revenuePerService = services.map((s) => ({
    name: s.title.length > 12 ? s.title.slice(0, 12) + "…" : s.title,
    revenue: completedBookings
      .filter((b) => b.serviceId === s.id)
      .reduce((sum) => sum + s.price, 0),
    bookings: bookings.filter((b) => b.serviceId === s.id).length,
  }));

  // Area chart: bookings over time (last 7 dates with bookings)
  const dateMap = new Map<string, number>();
  bookings.forEach((b) => {
    dateMap.set(b.date, (dateMap.get(b.date) || 0) + 1);
  });
  const bookingsOverTime = Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([date, count]) => ({
      date: new Date(date).toLocaleDateString("en", { month: "short", day: "numeric" }),
      bookings: count,
    }));

  return (
    <ProviderPanelLayout>
      <div className="space-y-8">
        {/* Welcome */}
        <div>
          <h2 className="font-display text-xl font-bold">Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">Overview of your business performance.</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className={`rounded-2xl border bg-gradient-to-br ${s.gradient} p-4 shadow-card transition-all hover:shadow-elevated`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${s.iconBg}`}>
                  <s.icon className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  <span>{s.trend}</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium">{s.label}</p>
              <p className="text-xl font-bold mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Area: Bookings over time */}
          <div className="rounded-2xl border bg-card p-5 shadow-card">
            <h3 className="font-semibold text-sm mb-5">Bookings Over Time</h3>
            {bookingsOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={bookingsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="bookings"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary) / 0.15)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">No booking data yet</p>
            )}
          </div>

          {/* Pie: Bookings per service */}
          <div className="rounded-2xl border bg-card p-5 shadow-card">
            <h3 className="font-semibold text-sm mb-5">Bookings by Service</h3>
            {bookingsPerService.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={bookingsPerService}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {bookingsPerService.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">No data</p>
            )}
          </div>

          {/* Bar: Revenue per service */}
          <div className="rounded-2xl border bg-card p-5 shadow-card lg:col-span-2">
            <h3 className="font-semibold text-sm mb-5">Revenue & Bookings per Service</h3>
            {revenuePerService.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={revenuePerService}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Bookings" />
                  <Bar dataKey="revenue" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">No services yet</p>
            )}
          </div>
        </div>

        {/* Recent bookings */}
        <div className="rounded-2xl border bg-card p-5 shadow-card">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Recent Bookings
          </h3>
          {bookings.length > 0 ? (
            <div className="space-y-2">
              {bookings.slice(0, 5).map((b) => {
                const svc = services.find((s) => s.id === b.serviceId);
                return (
                  <div key={b.id} className="flex items-center justify-between text-xs border-b last:border-0 pb-2 last:pb-0">
                    <div>
                      <span className="font-medium">{svc?.title ?? "Service"}</span>
                      <span className="text-muted-foreground ml-2">{b.userName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">{b.date}</span>
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        b.status === "COMPLETED" ? "bg-success/15 text-success" :
                        b.status === "CONFIRMED" ? "bg-primary/15 text-primary" :
                        "bg-destructive/15 text-destructive"
                      }`}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">No bookings yet</p>
          )}
        </div>
      </div>
    </ProviderPanelLayout>
  );
};

export default ProviderDashboard;
