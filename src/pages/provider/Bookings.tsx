import { useAppStore } from "@/store/AppContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, CheckCircle, XCircle, Check, Phone } from "lucide-react";
import { formatDate } from "@/lib/booking";
import { generateId } from "@/lib/storage";
import { ProviderPanelLayout } from "@/components/ProviderPanelLayout";

const ProviderBookings = () => {
  const { state, dispatch, currentProvider } = useAppStore();
  if (!currentProvider) return null;

  const bookings = state.bookings.filter((b) => b.providerId === currentProvider.id);
  const getService = (id: string) => state.services.find((s) => s.id === id);

  const statusStyles: Record<string, string> = {
    PENDING: "bg-warning/10 text-warning",
    CONFIRMED: "bg-success/10 text-success",
    CANCELLED: "bg-destructive/10 text-destructive",
    COMPLETED: "bg-muted text-muted-foreground",
  };

  const handleAccept = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;
    const svc = getService(booking.serviceId);

    dispatch({ type: "UPDATE_BOOKING", payload: { id: bookingId, status: "CONFIRMED" } });

    if (!booking.userId.startsWith("guest-")) {
      dispatch({
        type: "ADD_NOTIFICATION",
        payload: {
          id: generateId(),
          userId: booking.userId,
          type: "booking_success",
          title: "Booking Confirmed!",
          message: `${currentProvider.name} accepted your ${svc?.title ?? "service"} booking on ${formatDate(booking.date)} at ${booking.startTime}.`,
          read: false,
          createdAt: new Date().toISOString(),
          linkTo: "/dashboard",
        },
      });
    }
  };

  const handleReject = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;
    const svc = getService(booking.serviceId);

    dispatch({ type: "UPDATE_BOOKING", payload: { id: bookingId, status: "CANCELLED" } });

    if (!booking.userId.startsWith("guest-")) {
      dispatch({
        type: "ADD_NOTIFICATION",
        payload: {
          id: generateId(),
          userId: booking.userId,
          type: "booking_success",
          title: "Booking Declined",
          message: `${currentProvider.name} was unable to accept your ${svc?.title ?? "service"} booking on ${formatDate(booking.date)}. Please try another time.`,
          read: false,
          createdAt: new Date().toISOString(),
          linkTo: "/dashboard",
        },
      });
    }
  };

  const handleMarkComplete = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;
    const svc = getService(booking.serviceId);

    dispatch({ type: "UPDATE_BOOKING", payload: { id: bookingId, status: "COMPLETED" } });

    if (!booking.userId.startsWith("guest-")) {
      dispatch({
        type: "ADD_NOTIFICATION",
        payload: {
          id: generateId(),
          userId: booking.userId,
          type: "review_request",
          title: "How was your experience?",
          message: `Your ${svc?.title ?? "service"} with ${currentProvider.name} is completed. Tap to leave a review!`,
          read: false,
          createdAt: new Date().toISOString(),
          linkTo: `/review/${bookingId}`,
        },
      });
    }
  };

  // Sort: PENDING first, then CONFIRMED, then rest
  const sortedBookings = [...bookings].sort((a, b) => {
    const order: Record<string, number> = { PENDING: 0, CONFIRMED: 1, COMPLETED: 2, CANCELLED: 3 };
    return (order[a.status] ?? 9) - (order[b.status] ?? 9);
  });

  return (
      <ProviderPanelLayout>
        <div className="max-w-2xl">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            {bookings.length} Booking{bookings.length !== 1 ? "s" : ""}
          </h2>

          {bookings.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-secondary/30 p-8 text-center">
                <p className="text-muted-foreground text-sm">No bookings yet. Share your services to get started!</p>
              </div>
          ) : (
              <div className="space-y-2">
                {sortedBookings.map((b) => {
                  const svc = getService(b.serviceId);
                  return (
                      <div key={b.id} className={`rounded-2xl border bg-card p-5 shadow-card transition-all duration-200 hover:shadow-elevated ${b.status === "PENDING" ? "border-warning/30" : ""}`}>
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <h3 className="font-semibold text-sm">{svc?.title || "Service"}</h3>
                          <Badge className={`border-0 text-[10px] rounded-full px-2 ${statusStyles[b.status]}`}>{b.status}</Badge>
                        </div>
                        <div className="mt-2.5 flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1.5"><User className="h-3 w-3" />{b.userName}</span>
                          {b.userPhone && (
                              <a href={`tel:${b.userPhone}`} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                                <Phone className="h-3 w-3" />{b.userPhone}
                              </a>
                          )}
                          <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" />{formatDate(b.date)}</span>
                          <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" />{b.startTime} – {b.endTime}</span>
                        </div>

                        {b.status === "PENDING" && (
                            <div className="mt-3 pt-3 border-t flex gap-2">
                              <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAccept(b.id)}
                                  className="h-7 text-[10px] rounded-full gap-1 px-3 text-success hover:text-success border-success/30 hover:border-success/50 hover:bg-success/5"
                              >
                                <Check className="h-3 w-3" /> Accept
                              </Button>
                              <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleReject(b.id)}
                                  className="h-7 text-[10px] rounded-full gap-1 px-3 text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/50 hover:bg-destructive/5"
                              >
                                <XCircle className="h-3 w-3" /> Decline
                              </Button>
                            </div>
                        )}

                        {b.status === "CONFIRMED" && (
                            <div className="mt-3 pt-3 border-t">
                              <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleMarkComplete(b.id)}
                                  className="h-7 text-[10px] rounded-full gap-1 px-3 text-success hover:text-success"
                              >
                                <CheckCircle className="h-3 w-3" /> Mark as Completed
                              </Button>
                            </div>
                        )}
                      </div>
                  );
                })}
              </div>
          )}
        </div>
      </ProviderPanelLayout>
  );
};

export default ProviderBookings;
