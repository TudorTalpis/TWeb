import { useAppStore } from "@/store/AppContext";
import { AdminPanelLayout } from "@/components/AdminPanelLayout";
import { Users, Briefcase, UserCheck, DollarSign, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--warning))",
  "hsl(var(--accent))",
  "hsl(var(--destructive))",
  "hsl(var(--success))",
  "hsl(var(--info, 210 80% 60%))",
];

const AdminDashboard = () => {
  const { state } = useAppStore();

  const providers = state.providerProfiles.filter((p) => !p.blocked);
  const totalProviders = state.providerProfiles.length;
  const totalServices = state.services.length;
  const totalClients = state.users.filter((u) => u.role === "USER").length;
  const totalRevenue = state.bookings
    .filter((b) => b.status === "COMPLETED")
    .reduce((sum, b) => {
      const svc = state.services.find((s) => s.id === b.serviceId);
      return sum + (svc?.price ?? 0);
    }, 0);
  const totalBookings = state.bookings.length;

  // Pie chart: providers per category
  const categoryData = state.categories
    .map((c) => ({
      name: c.name,
      value: providers.filter((p) => p.categoryId === c.id).length,
    }))
    .filter((d) => d.value > 0);

  // Bar chart: bookings per provider
  const bookingsPerProvider = state.providerProfiles.map((p) => ({
    name: p.name.length > 15 ? p.name.slice(0, 15) + "…" : p.name,
    bookings: state.bookings.filter((b) => b.providerId === p.id).length,
    revenue: state.bookings
      .filter((b) => b.providerId === p.id && b.status === "COMPLETED")
      .reduce((sum, b) => {
        const svc = state.services.find((s) => s.id === b.serviceId);
        return sum + (svc?.price ?? 0);
      }, 0),
  }));

  const stats = [
    {
      label: "Total Providers",
      value: totalProviders,
      icon: Users,
      gradient: "from-primary/15 to-primary/5",
      iconBg: "bg-primary/20 text-primary",
      trend: `${providers.length} active`,
    },
    {
      label: "Total Services",
      value: totalServices,
      icon: Briefcase,
      gradient: "from-accent/15 to-accent/5",
      iconBg: "bg-accent/20 text-accent",
      trend: `${(totalServices / Math.max(totalProviders, 1)).toFixed(1)} avg/provider`,
    },
    {
      label: "Total Clients",
      value: totalClients,
      icon: UserCheck,
      gradient: "from-warning/15 to-warning/5",
      iconBg: "bg-warning/20 text-warning",
      trend: `${totalBookings} bookings`,
    },
    {
      label: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      gradient: "from-success/15 to-success/5",
      iconBg: "bg-success/20 text-success",
      trend: `${state.bookings.filter((b) => b.status === "COMPLETED").length} completed`,
    },
  ];

  return (
    <AdminPanelLayout>
      <div className="space-y-8">
        {/* Welcome */}
        <div>
          <h2 className="font-display text-xl font-bold">Hi, Welcome back 👋</h2>
          <p className="text-sm text-muted-foreground mt-1">Here's what's happening with your platform.</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className={`rounded-2xl border bg-gradient-to-br ${s.gradient} p-5 shadow-card transition-all hover:shadow-elevated`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.iconBg}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  <span>{s.trend}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
              <p className="text-2xl font-bold mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie: Providers by Category */}
          <div className="rounded-2xl border bg-card p-6 shadow-card">
            <h3 className="font-semibold text-sm mb-6">Providers by Category</h3>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">No data</p>
            )}
          </div>

          {/* Bar: Bookings & Revenue per Provider */}
          <div className="rounded-2xl border bg-card p-6 shadow-card">
            <h3 className="font-semibold text-sm mb-6">Bookings & Revenue per Provider</h3>
            {bookingsPerProvider.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={bookingsPerProvider}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Bookings" />
                  <Bar dataKey="revenue" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">No data</p>
            )}
          </div>
        </div>

        {/* Recent bookings */}
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <h3 className="font-semibold text-sm mb-4">Recent Bookings</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="pb-3 font-medium">Client</th>
                  <th className="pb-3 font-medium">Provider</th>
                  <th className="pb-3 font-medium">Service</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {state.bookings.slice(0, 10).map((b) => {
                  const svc = state.services.find((s) => s.id === b.serviceId);
                  const prov = state.providerProfiles.find((p) => p.id === b.providerId);
                  return (
                    <tr key={b.id} className="text-xs">
                      <td className="py-3">{b.userName}</td>
                      <td className="py-3">{prov?.name ?? "—"}</td>
                      <td className="py-3">{svc?.title ?? "—"}</td>
                      <td className="py-3">{b.date}</td>
                      <td className="py-3">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          b.status === "COMPLETED" ? "bg-success/15 text-success" :
                          b.status === "CONFIRMED" ? "bg-primary/15 text-primary" :
                          "bg-destructive/15 text-destructive"
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 text-right font-medium">${svc?.price ?? 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {state.bookings.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-8">No bookings yet.</p>
            )}
          </div>
        </div>
      </div>
    </AdminPanelLayout>
  );
};

export default AdminDashboard;
