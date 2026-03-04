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
  AlertCircle,
  CheckCircle,
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

const Dashboard = () => {
  const { state, dispatch } = useAppStore();
  const { t } = useI18n();

  const [reviewModal, setReviewModal] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const userId = state.session.userId;
  const bookings = state.bookings.filter((b) => b.userId === userId);
  const reviews = state.reviews.filter((r) => r.userId === userId);
  const today = new Date().toISOString().split("T")[0];

  const pending = bookings.filter((b) => b.status === "PENDING");
  const upcoming = bookings.filter((b) => b.date >= today && b.status === "CONFIRMED");
  const past = bookings.filter((b) => b.date < today || (b.status !== "CONFIRMED" && b.status !== "PENDING"));
  const completed = bookings.filter((b) => b.status === "COMPLETED");

  const totalSpent = completed.reduce((sum, b) => sum + (state.services.find((s) => s.id === b.serviceId)?.price || 0), 0);
  const uniqueProviders = new Set(bookings.map((b) => b.providerId)).size;

  // Status breakdown
  const statusCounts = {
    PENDING: bookings.filter((b) => b.status === "PENDING").length,
    CONFIRMED: bookings.filter((b) => b.status === "CONFIRMED").length,
    COMPLETED: bookings.filter((b) => b.status === "COMPLETED").length,
    CANCELLED: bookings.filter((b) => b.status === "CANCELLED").length,
  };

  const statusData = [
    { name: "Pending", value: statusCounts.PENDING, fill: "#f59e0b" },
    { name: "Confirmed", value: statusCounts.CONFIRMED, fill: "#3b82f6" },
    { name: "Completed", value: statusCounts.COMPLETED, fill: "#10b981" },
    { name: "Cancelled", value: statusCounts.CANCELLED, fill: "#ef4444" },
  ].filter((s) => s.value > 0);

  // Top providers
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

  const BookingCard = ({ booking, canReview }: { booking: any; canReview?: boolean }) => {
    const provider = state.providerProfiles.find((p) => p.id === booking.providerId);
    const service = state.services.find((s) => s.id === booking.serviceId);
    const hasReview = reviews.some((r) => r.bookingId === booking.id);

    const statusColors = {
      PENDING: "bg-yellow-50 border-yellow-200",
      CONFIRMED: "bg-blue-50 border-blue-200",
      COMPLETED: "bg-green-50 border-green-200",
      CANCELLED: "bg-red-50 border-red-200",
    };

    return (
      <div className={`rounded-xl border-2 ${statusColors[booking.status as keyof typeof statusColors]} p-4 hover:shadow-lg transition-all hover:scale-105 duration-200 cursor-default`}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-bold text-sm text-foreground">{service?.title || "Service"}</h3>
            <p className="text-xs text-muted-foreground font-medium">{provider?.name}</p>
          </div>
          <Badge className="text-[10px] font-bold" variant={booking.status === "COMPLETED" ? "default" : "outline"}>
            {booking.status}
          </Badge>
        </div>
        <div className="space-y-1.5 text-xs text-muted-foreground mb-4 bg-white/50 rounded-lg p-2">
          <p className="flex items-center gap-2 font-medium">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            {formatDate(booking.date)}
          </p>
          <p className="flex items-center gap-2 font-medium">
            <Clock className="h-3.5 w-3.5 text-accent" />
            {booking.startTime} - {booking.endTime}
          </p>
          {provider && (
            <p className="flex items-center gap-2 font-medium">
              <MapPin className="h-3.5 w-3.5 text-success" />
              {provider.location}
            </p>
          )}
        </div>
        <div className="flex gap-2 pt-3 border-t-2 border-current/10">
          <Link to={`/providers/${booking.providerId}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full text-[11px] h-8 font-bold hover:bg-primary/10">
              View Provider
            </Button>
          </Link>
          {booking.status === "CONFIRMED" && (
            <Button
              variant="outline"
              size="sm"
              className="text-[11px] h-8 text-destructive font-bold hover:bg-destructive/10"
              onClick={() => dispatch({ type: "UPDATE_BOOKING", payload: { id: booking.id, status: "CANCELLED" } })}
            >
              Cancel
            </Button>
          )}
          {canReview && booking.status === "COMPLETED" && !hasReview && (
            <Button
              variant="ghost"
              size="sm"
              className="text-[11px] h-8 gap-1 font-bold hover:bg-warning/20"
              onClick={() => setReviewModal(booking.id)}
            >
              <Star className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{t("dashboard.title")}</h1>
            <p className="text-muted-foreground mt-2 font-medium">Manage your bookings, track spending & leave reviews</p>
          </div>
          <Link to="/categories">
            <Button size="lg" className="rounded-full font-bold shadow-lg hover:shadow-xl">
              ✨ {t("dashboard.bookNew")}
            </Button>
          </Link>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <div className="flex justify-between items-start mb-3">
              <p className="text-xs font-bold uppercase opacity-90">Total Bookings</p>
              <CalendarCheck className="h-5 w-5 opacity-80" />
            </div>
            <p className="text-3xl font-black mb-2">{bookings.length}</p>
            <p className="text-sm opacity-90 font-semibold">{upcoming.length} upcoming</p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <div className="flex justify-between items-start mb-3">
              <p className="text-xs font-bold uppercase opacity-90">Total Spent</p>
              <DollarSign className="h-5 w-5 opacity-80" />
            </div>
            <p className="text-3xl font-black mb-2">${totalSpent}</p>
            <p className="text-sm opacity-90 font-semibold">{completed.length} completed</p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <div className="flex justify-between items-start mb-3">
              <p className="text-xs font-bold uppercase opacity-90">Providers</p>
              <Users className="h-5 w-5 opacity-80" />
            </div>
            <p className="text-3xl font-black mb-2">{uniqueProviders}</p>
            <p className="text-sm opacity-90 font-semibold">Unique providers</p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <div className="flex justify-between items-start mb-3">
              <p className="text-xs font-bold uppercase opacity-90">My Reviews</p>
              <Star className="h-5 w-5 opacity-80" />
            </div>
            <p className="text-3xl font-black mb-2">{reviews.length}</p>
            <p className="text-sm opacity-90 font-semibold">Total reviews given</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Booking Status */}
          <div className="rounded-2xl bg-white border-2 border-slate-200 shadow-lg p-6 hover:shadow-xl transition-all">
            <h3 className="font-black text-lg mb-4 text-foreground">📊 Booking Status</h3>
            {statusData.length > 0 ? (
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} booking(s)`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No bookings yet</p>
                </div>
              </div>
            )}
          </div>

          {/* Top Providers */}
          <div className="rounded-2xl bg-white border-2 border-slate-200 shadow-lg p-6 hover:shadow-xl transition-all lg:col-span-2">
            <h3 className="font-black text-lg mb-4 text-foreground">🏆 Top Providers by Spending</h3>
            {topProviders.length > 0 ? (
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProviders} margin={{ bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value) => `$${value}`} />
                    <Bar dataKey="spent" fill="#3b82f6" radius={[12, 12, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No data yet</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bookings Sections */}
        <div className="space-y-6">
          {/* Pending */}
          {pending.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xl font-black text-warning flex items-center gap-2">
                ⏳ Pending Approval <Badge className="ml-2 bg-warning/20 text-warning font-bold">{pending.length}</Badge>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pending.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming */}
          <div className="space-y-3">
            <h2 className="text-xl font-black text-primary flex items-center gap-2">
              📅 Upcoming <Badge className="ml-2 bg-primary/20 text-primary font-bold">{upcoming.length}</Badge>
            </h2>
            {upcoming.length === 0 ? (
              <div className="rounded-2xl border-4 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <Calendar className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                <p className="text-muted-foreground font-bold">{t("dashboard.noUpcoming")}</p>
                <Link to="/categories" className="text-primary hover:underline text-sm mt-3 inline-block font-bold">
                  → {t("dashboard.browseServices")}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcoming.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </div>

          {/* Past */}
          <div className="space-y-3">
            <h2 className="text-xl font-black text-success flex items-center gap-2">
              ✅ Past <Badge className="ml-2 bg-success/20 text-success font-bold">{past.length}</Badge>
            </h2>
            {past.length === 0 ? (
              <div className="rounded-2xl border-4 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <CheckCircle className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                <p className="text-muted-foreground font-bold">{t("dashboard.noPast")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {past.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} canReview />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <Dialog open={!!reviewModal} onOpenChange={() => setReviewModal(null)}>
        <DialogContent className="rounded-2xl sm:max-w-md border-2 border-slate-200 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">⭐ Leave a Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <label className="mb-3 block text-sm font-bold text-foreground">{t("review.rating")}</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-all hover:scale-125"
                  >
                    <Star
                      className={`h-7 w-7 ${star <= rating ? "fill-yellow-400 text-yellow-400 drop-shadow-lg" : "text-muted-foreground/30"}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-foreground">{t("review.comment")}</label>
              <Textarea
                placeholder={t("review.placeholder")}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="rounded-lg border-2 border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/30 text-base font-medium"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReviewModal(null)} className="font-bold">
              {t("book.cancel")}
            </Button>
            <Button
              onClick={() => reviewModal && handleReviewSubmit(reviewModal)}
              className="font-bold shadow-lg hover:shadow-xl"
            >
              {t("review.submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
