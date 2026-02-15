import { useAppStore } from "@/store/AppContext";
import { useI18n } from "@/store/I18nContext";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, CalendarCheck, Star, DollarSign, TrendingUp, Users, Briefcase } from "lucide-react";
import { formatDate } from "@/lib/booking";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { generateId } from "@/lib/storage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--warning))",
  "hsl(var(--accent))",
  "hsl(var(--destructive))",
  "hsl(var(--success))",
];

const Dashboard = () => {
  const { state, dispatch } = useAppStore();
  const { t } = useI18n();
  const userId = state.session.userId;
  const bookings = state.bookings.filter((b) => b.userId === userId);
  const today = new Date().toISOString().split("T")[0];
  const pending = bookings.filter((b) => b.status === "PENDING");
  const upcoming = bookings.filter((b) => b.date >= today && b.status === "CONFIRMED");
  const past = bookings.filter((b) => b.date < today || (b.status !== "CONFIRMED" && b.status !== "PENDING"));
  const completed = bookings.filter((b) => b.status === "COMPLETED");

  const [reviewModal, setReviewModal] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const getProvider = (pid: string) => state.providerProfiles.find((p) => p.id === pid);
  const getService = (sid: string) => state.services.find((s) => s.id === sid);
  const hasReview = (bookingId: string) => state.reviews.some((r) => r.bookingId === bookingId);

  // Stats
  const totalSpent = completed.reduce((sum, b) => {
    const svc = getService(b.serviceId);
    return sum + (svc?.price ?? 0);
  }, 0);
  const uniqueProviders = new Set(bookings.map((b) => b.providerId)).size;
  const reviewsGiven = state.reviews.filter((r) => r.userId === userId).length;

  // Pie chart: bookings by status
  const statusData = [
    { name: "Pending", value: pending.length },
    { name: "Confirmed", value: bookings.filter((b) => b.status === "CONFIRMED").length },
    { name: "Completed", value: completed.length },
    { name: "Cancelled", value: bookings.filter((b) => b.status === "CANCELLED").length },
  ].filter((d) => d.value > 0);

  // Bar chart: spending per provider
  const spendingPerProvider = Array.from(new Set(bookings.map((b) => b.providerId))).map((pid) => {
    const prov = getProvider(pid);
    const provBookings = completed.filter((b) => b.providerId === pid);
    const spent = provBookings.reduce((sum, b) => {
      const svc = getService(b.serviceId);
      return sum + (svc?.price ?? 0);
    }, 0);
    return {
      name: (prov?.name ?? "Unknown").length > 12 ? (prov?.name ?? "Unknown").slice(0, 12) + "…" : (prov?.name ?? "Unknown"),
      spent,
      bookings: bookings.filter((b) => b.providerId === pid).length,
    };
  });

  const stats = [
    {
      label: "Total Bookings",
      value: bookings.length,
      icon: CalendarCheck,
      gradient: "from-primary/15 to-primary/5",
      iconBg: "bg-primary/20 text-primary",
      trend: `${pending.length} pending · ${upcoming.length} upcoming`,
    },
    {
      label: "Total Spent",
      value: `$${totalSpent.toLocaleString()}`,
      icon: DollarSign,
      gradient: "from-success/15 to-success/5",
      iconBg: "bg-success/20 text-success",
      trend: `${completed.length} completed`,
    },
    {
      label: "Providers Visited",
      value: uniqueProviders,
      icon: Users,
      gradient: "from-accent/15 to-accent/5",
      iconBg: "bg-accent/20 text-accent",
      trend: `${reviewsGiven} reviews`,
    },
    {
      label: "Services Used",
      value: new Set(bookings.map((b) => b.serviceId)).size,
      icon: Briefcase,
      gradient: "from-warning/15 to-warning/5",
      iconBg: "bg-warning/20 text-warning",
      trend: `$${completed.length > 0 ? Math.round(totalSpent / completed.length) : 0} avg`,
    },
  ];

  const handleSubmitReview = (bookingId: string) => {
    if (!comment.trim()) return;
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    dispatch({
      type: "ADD_REVIEW",
      payload: {
        id: generateId(),
        bookingId,
        providerId: booking.providerId,
        userId: booking.userId,
        rating,
        comment: comment.trim(),
        createdAt: new Date().toISOString(),
        userName: booking.userName,
      },
    });
    setReviewModal(null);
    setComment("");
    setRating(5);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-bold">{t("dashboard.title")}</h1>
        <Link to="/categories">
          <Button variant="outline" size="sm" className="rounded-full text-xs gap-1.5">
            <CalendarCheck className="h-3.5 w-3.5" /> {t("dashboard.bookNew")}
          </Button>
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Pie: Bookings by status */}
        <div className="rounded-2xl border bg-card p-5 shadow-card">
          <h3 className="font-semibold text-sm mb-5">Bookings by Status</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12">No bookings yet</p>
          )}
        </div>

        {/* Bar: Spending per provider */}
        <div className="rounded-2xl border bg-card p-5 shadow-card">
          <h3 className="font-semibold text-sm mb-5">Spending by Provider</h3>
          {spendingPerProvider.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={spendingPerProvider}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="spent" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Spent ($)" />
                <Bar dataKey="bookings" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12">No data yet</p>
          )}
        </div>
      </div>

      {/* Pending bookings */}
      {pending.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-semibold text-warning uppercase tracking-wider mb-4">Pending Approval ({pending.length})</h2>
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
            {pending.map((b) => {
              const prov = getProvider(b.providerId);
              const svc = getService(b.serviceId);
              return (
                <div key={b.id} className="rounded-2xl border border-warning/30 bg-card p-5 shadow-card">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="font-semibold text-sm">{svc?.title || "Service"}</h3>
                    <Badge className="bg-warning/10 text-warning border-0 text-[10px] rounded-full px-2">PENDING</Badge>
                  </div>
                  <Link to={`/providers/${b.providerId}`} className="text-xs text-primary hover:underline mt-1 inline-block">{prov?.name}</Link>
                  <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(b.date)}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{b.startTime} – {b.endTime}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t flex items-center justify-between">
                    <p className="text-[10px] text-warning">Waiting for provider confirmation...</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => dispatch({ type: "UPDATE_BOOKING", payload: { id: b.id, status: "CANCELLED" } })}
                      className="h-7 text-[10px] rounded-full gap-1 px-3 text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/50 hover:bg-destructive/5"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Upcoming bookings */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">{t("dashboard.upcoming")} ({upcoming.length})</h2>
        {upcoming.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-secondary/30 p-8 text-center">
            <p className="text-muted-foreground text-sm">{t("dashboard.noUpcoming")}</p>
            <Link to="/categories" className="text-primary text-sm hover:underline mt-1 inline-block">{t("dashboard.browseServices")}</Link>
          </div>
        ) : (
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
            {upcoming.map((b) => {
              const prov = getProvider(b.providerId);
              const svc = getService(b.serviceId);
              return (
                <div key={b.id} className="rounded-2xl border bg-card p-5 shadow-card transition-all duration-200 hover:shadow-elevated">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="font-semibold text-sm">{svc?.title || "Service"}</h3>
                    <Badge className="bg-success/10 text-success border-0 text-[10px] rounded-full px-2">{t("dashboard.confirmed")}</Badge>
                  </div>
                  <Link to={`/providers/${b.providerId}`} className="text-xs text-primary hover:underline mt-1 inline-block">{prov?.name}</Link>
                  <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(b.date)}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{b.startTime} – {b.endTime}</span>
                    {prov && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{prov.location}</span>}
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <Link to={`/providers/${b.providerId}`}>
                      <Button variant="outline" size="sm" className="h-7 text-[10px] rounded-full gap-1 px-3">
                        {t("dashboard.viewProvider")}
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Past bookings */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">{t("dashboard.past")} ({past.length})</h2>
        {past.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4">{t("dashboard.noPast")}</p>
        ) : (
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
            {past.map((b) => {
              const prov = getProvider(b.providerId);
              const svc = getService(b.serviceId);
              return (
                <div key={b.id} className="rounded-2xl border bg-card p-5 shadow-card opacity-60">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="font-semibold text-sm">{svc?.title || "Service"}</h3>
                    <Badge variant="secondary" className="text-[10px] capitalize rounded-full">{b.status.toLowerCase()}</Badge>
                  </div>
                  <Link to={`/providers/${b.providerId}`} className="text-xs text-primary hover:underline mt-1 inline-block">{prov?.name}</Link>
                  <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(b.date)}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{b.startTime} – {b.endTime}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t flex items-center gap-2">
                    <Link to={`/providers/${b.providerId}`}>
                      <Button variant="outline" size="sm" className="h-7 text-[10px] rounded-full gap-1 px-3">
                        {t("dashboard.viewProvider")}
                      </Button>
                    </Link>
                    {b.status === "COMPLETED" && !hasReview(b.id) && (
                      <Button variant="ghost" size="sm" onClick={() => setReviewModal(b.id)} className="h-7 text-[10px] gap-1 px-2 text-primary">
                        <Star className="h-3 w-3" /> {t("dashboard.leaveReview")}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Review Modal */}
      <Dialog open={!!reviewModal} onOpenChange={() => setReviewModal(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t("review.title")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t("review.rating")}</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRating(r)}
                    className="transition-all duration-200"
                  >
                    <Star className={`h-6 w-6 ${r <= rating ? "fill-warning text-warning" : "text-muted-foreground"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t("review.comment")}</label>
              <Textarea
                placeholder={t("review.placeholder")}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="rounded-xl focus:ring-2 focus:ring-primary/20 min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setReviewModal(null)} className="rounded-xl">{t("book.cancel")}</Button>
            <Button onClick={() => handleSubmitReview(reviewModal!)} className="rounded-xl gradient-primary text-primary-foreground">{t("review.submit")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
