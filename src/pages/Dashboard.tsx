import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Calendar,
  CalendarCheck,
  DollarSign,
  Users,
  Star,
  Clock,
  MapPin,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/booking";
import { generateId } from "@/lib/storage";
import { useAppStore } from "@/store/AppContext";
import { useI18n } from "@/store/I18nContext";
import { cn } from "@/lib/utils";
import { toLocalDateKey } from "@/lib/date";
import type { Booking } from "@/types";

const PANEL_CLASS = "rounded-3xl border border-border/60 bg-card p-5 shadow-card";
const TOOLTIP_CLASS = "rounded-lg border border-border/70 bg-background/95 px-3 py-2 text-xs shadow-lg backdrop-blur";

const statusStyles: Record<string, string> = {
  PENDING: "bg-warning/10 text-warning",
  CONFIRMED: "bg-primary/10 text-primary",
  COMPLETED: "bg-success/10 text-success",
  CANCELLED: "bg-destructive/10 text-destructive",
};

const statusColors: Record<string, string> = {
  PENDING: "hsl(var(--warning))",
  CONFIRMED: "hsl(var(--primary))",
  COMPLETED: "hsl(var(--success))",
  CANCELLED: "hsl(var(--destructive))",
};

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

const Dashboard = () => {
  const { state, dispatch } = useAppStore();
  const { t } = useI18n();

  const [reviewModal, setReviewModal] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const userId = state.session.userId;
  const bookings = state.bookings.filter((b) => b.userId === userId);
  const reviews = state.reviews.filter((r) => r.userId === userId);
  const today = toLocalDateKey(new Date());

  const pending = bookings.filter((b) => b.status === "PENDING");
  const upcoming = bookings.filter((b) => b.date >= today && b.status === "CONFIRMED");
  const past = bookings.filter((b) => b.date < today || (b.status !== "CONFIRMED" && b.status !== "PENDING"));
  const completed = bookings.filter((b) => b.status === "COMPLETED");

  const totalSpent = completed.reduce((sum, b) => sum + (state.services.find((s) => s.id === b.serviceId)?.price || 0), 0);
  const uniqueProviders = new Set(bookings.map((b) => b.providerId)).size;

  const statusSummary = [
    { status: "PENDING", label: "Pending", count: bookings.filter((b) => b.status === "PENDING").length },
    { status: "CONFIRMED", label: "Confirmed", count: bookings.filter((b) => b.status === "CONFIRMED").length },
    { status: "COMPLETED", label: "Completed", count: bookings.filter((b) => b.status === "COMPLETED").length },
    { status: "CANCELLED", label: "Cancelled", count: bookings.filter((b) => b.status === "CANCELLED").length },
  ];

  const statusData = statusSummary
    .filter((item) => item.count > 0)
    .map((item) => ({ name: item.label, value: item.count, color: statusColors[item.status] }));

  const topProviders = Array.from(new Set(completed.map((b) => b.providerId)))
    .map((pid) => {
      const provider = state.providerProfiles.find((p) => p.id === pid);
      const spent = completed
        .filter((b) => b.providerId === pid)
        .reduce((sum, b) => sum + (state.services.find((s) => s.id === b.serviceId)?.price || 0), 0);
      return { name: provider?.name || "Unknown", spent };
    })
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5);

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

    const periodCompleted = periodBookings.filter((booking) => booking.status === "COMPLETED");
    const periodReviews = reviews.filter((review) => {
      const createdAt = new Date(review.createdAt);
      return !Number.isNaN(createdAt.getTime()) && createdAt >= start && createdAt < end;
    });

    return {
      total: periodBookings.length,
      spent: periodCompleted.reduce((sum, booking) => sum + (state.services.find((s) => s.id === booking.serviceId)?.price || 0), 0),
      providers: new Set(periodBookings.map((booking) => booking.providerId)).size,
      reviews: periodReviews.length,
    };
  });

  const totalSeries = trendWeeks.map((week, index) => ({ point: index, value: week.total }));
  const spentSeries = trendWeeks.map((week, index) => ({ point: index, value: week.spent }));
  const providersSeries = trendWeeks.map((week, index) => ({ point: index, value: week.providers }));
  const reviewsSeries = trendWeeks.map((week, index) => ({ point: index, value: week.reviews }));

  const totalDelta = getTrendDelta(totalSeries.map((item) => item.value));
  const spentDelta = getTrendDelta(spentSeries.map((item) => item.value));
  const providersDelta = getTrendDelta(providersSeries.map((item) => item.value));
  const reviewsDelta = getTrendDelta(reviewsSeries.map((item) => item.value));

  const cards = [
    {
      label: "Total bookings",
      value: bookings.length.toLocaleString(),
      icon: CalendarCheck,
      accent: "text-primary bg-primary/15",
      lineColor: "hsl(var(--primary))",
      series: totalSeries,
      delta: totalDelta,
    },
    {
      label: "Total spent",
      value: `$${totalSpent.toLocaleString()}`,
      icon: DollarSign,
      accent: "text-success bg-success/15",
      lineColor: "hsl(var(--success))",
      series: spentSeries,
      delta: spentDelta,
    },
    {
      label: "Providers",
      value: uniqueProviders.toLocaleString(),
      icon: Users,
      accent: "text-accent bg-accent/15",
      lineColor: "hsl(var(--accent))",
      series: providersSeries,
      delta: providersDelta,
    },
    {
      label: "Reviews",
      value: reviews.length.toLocaleString(),
      icon: Star,
      accent: "text-warning bg-warning/15",
      lineColor: "hsl(var(--warning))",
      series: reviewsSeries,
      delta: reviewsDelta,
    },
  ];

  const handleReviewSubmit = (bookingId: string) => {
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

  const BookingCard = ({ booking, canReview }: { booking: Booking; canReview?: boolean }) => {
    const provider = state.providerProfiles.find((p) => p.id === booking.providerId);
    const service = state.services.find((s) => s.id === booking.serviceId);
    const hasReview = reviews.some((r) => r.bookingId === booking.id);

    return (
      <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">{service?.title || "Service"}</h3>
            <p className="text-xs text-muted-foreground">{provider?.name}</p>
          </div>
          <Badge className={cn("rounded-full border-0 px-2 text-[10px] font-medium", statusStyles[booking.status])}>
            {booking.status}
          </Badge>
        </div>
        <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
          <p className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(booking.date)}
          </p>
          <p className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" />
            {booking.startTime} - {booking.endTime}
          </p>
          {provider && (
            <p className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" />
              {provider.location}
            </p>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2 border-t pt-3">
          <Link to={`/providers/${booking.providerId}`} className="flex-1 min-w-[120px]">
            <Button variant="outline" size="sm" className="w-full h-7 rounded-full text-[10px]">
              {t("dashboard.viewProvider")}
            </Button>
          </Link>
          {booking.status === "CONFIRMED" && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 rounded-full text-[10px] text-destructive border-destructive/30 hover:border-destructive/50 hover:bg-destructive/5"
              onClick={() => dispatch({ type: "UPDATE_BOOKING", payload: { id: booking.id, status: "CANCELLED" } })}
            >
              Cancel
            </Button>
          )}
          {canReview && booking.status === "COMPLETED" && !hasReview && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 rounded-full text-[10px] gap-1 border-warning/30 text-warning hover:border-warning/60 hover:bg-warning/10"
              onClick={() => setReviewModal(booking.id)}
            >
              <Star className="h-3 w-3" />
              {t("dashboard.leaveReview")}
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6">
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">{t("dashboard.title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Manage bookings, track spending, and leave reviews.</p>
        </div>
        <Link to="/categories">
          <Button size="sm" className="rounded-full gap-2">
            <Plus className="h-4 w-4" />
            {t("dashboard.bookNew")}
          </Button>
        </Link>
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
            <h3 className="text-sm font-semibold">Booking Status</h3>
            <p className="text-xs text-muted-foreground">Pending, confirmed, completed, and cancelled</p>
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
                    <p className="text-2xl font-bold tabular-nums">{bookings.length}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                {statusSummary.map((item) => (
                  <div key={item.status} className="flex items-center justify-between rounded-lg border border-border/60 bg-background/25 px-3 py-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-[3px]" style={{ backgroundColor: statusColors[item.status] }} />
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
              <h3 className="text-sm font-semibold">Top Providers by Spending</h3>
              <p className="text-xs text-muted-foreground">Where you spend the most</p>
            </div>
          </div>

          {topProviders.length > 0 ? (
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProviders} margin={{ bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.35} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const value = Number(payload[0].value ?? 0);
                      return (
                        <div className={TOOLTIP_CLASS}>
                          <p className="font-medium">{String(label)}</p>
                          <p className="text-muted-foreground">${value.toLocaleString()}</p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="spent" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} maxBarSize={56} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-16 text-center text-sm text-muted-foreground">No spending data yet.</p>
          )}
        </div>
      </section>

      {pending.length > 0 && (
        <section className={PANEL_CLASS}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold">Pending approval</h3>
              <p className="text-xs text-muted-foreground">Awaiting confirmation from providers</p>
            </div>
            <Badge className="bg-warning/10 text-warning">{pending.length}</Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {pending.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </section>
      )}

      <section className={PANEL_CLASS}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold">Upcoming bookings</h3>
            <p className="text-xs text-muted-foreground">Confirmed appointments ahead</p>
          </div>
          <Badge className="bg-primary/10 text-primary">{upcoming.length}</Badge>
        </div>
        {upcoming.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-background/40 p-8 text-center">
            <p className="text-sm text-muted-foreground">{t("dashboard.noUpcoming")}</p>
            <Link to="/categories" className="mt-3 inline-flex text-xs font-semibold text-primary hover:underline">
              {t("dashboard.browseServices")}
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {upcoming.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </section>

      <section className={PANEL_CLASS}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold">Past bookings</h3>
            <p className="text-xs text-muted-foreground">Completed or cancelled visits</p>
          </div>
          <Badge className="bg-success/10 text-success">{past.length}</Badge>
        </div>
        {past.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-background/40 p-8 text-center">
            <p className="text-sm text-muted-foreground">{t("dashboard.noPast")}</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {past.map((booking) => (
              <BookingCard key={booking.id} booking={booking} canReview />
            ))}
          </div>
        )}
      </section>

      <Dialog open={!!reviewModal} onOpenChange={() => setReviewModal(null)}>
        <DialogContent className="rounded-2xl border border-border/60 shadow-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Leave a Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <label className="mb-3 block text-sm font-semibold text-foreground">{t("review.rating")}</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-all hover:scale-110"
                  >
                    <Star
                      className={`h-7 w-7 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">{t("review.comment")}</label>
              <Textarea
                placeholder={t("review.placeholder")}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="rounded-lg border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/30 text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReviewModal(null)}>
              {t("book.cancel")}
            </Button>
            <Button onClick={() => reviewModal && handleReviewSubmit(reviewModal)}>
              {t("review.submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
