import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Calendar as CalendarIcon, Check, Clock, User, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/store/AppContext";
import { useI18n } from "@/store/I18nContext";
import { generateSlots, formatDate, type TimeSlot } from "@/lib/booking";
import { generateId } from "@/lib/storage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const BookService = () => {
  const { providerId, serviceId } = useParams();
  const { state, dispatch, currentUser } = useAppStore();
  const { t } = useI18n();
  const navigate = useNavigate();

  const provider = state.providerProfiles.find((p) => p.id === providerId);
  const service = state.services.find((s) => s.id === serviceId);
  const providerAvail = state.availability.filter((a) => a.providerId === providerId);
  const providerBookings = state.bookings.filter((b) => b.providerId === providerId);
  const providerTimeoff = state.timeoff.filter((t) => t.providerId === providerId);

  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);


  // Guest form state
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestErrors, setGuestErrors] = useState<Record<string, string>>({});

  const isGuest = !currentUser;
  const bookingUserName = isGuest ? guestName : currentUser.name;
  const bookingUserId = isGuest ? "guest-" + generateId() : currentUser.id;

  const slots = selectedDate
      ? generateSlots(selectedDate, providerAvail, providerBookings, providerTimeoff)
      : [];

  if (!provider || !service) {
    return (
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <p className="text-muted-foreground text-sm">Invalid booking link.</p>
        </div>
    );
  }

  const validateGuest = () => {
    const errors: Record<string, string> = {};
    if (!guestName.trim()) errors.name = "Name is required";
    if (!guestEmail.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim())) errors.email = "Invalid email";
    if (!guestPhone.trim()) errors.phone = "Phone is required";
    else if (guestPhone.trim().length < 6) errors.phone = "Phone too short";
    setGuestErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirm = () => {
    if (!selectedDate || !selectedSlot) return;
    if (isGuest && !validateGuest()) return;

    const finalUserId = isGuest ? bookingUserId : currentUser.id;
    const finalUserName = isGuest ? guestName.trim() : currentUser.name;

    const bookingId = generateId();
    setConfirmedBookingId(bookingId);
    dispatch({
      type: "ADD_BOOKING",
      payload: {
        id: bookingId, userId: finalUserId, providerId: provider.id, serviceId: service.id,
        date: selectedDate, startTime: selectedSlot.startTime, endTime: selectedSlot.endTime,
        status: "PENDING", createdAt: new Date().toISOString(), userName: finalUserName,
        userPhone: isGuest ? guestPhone.trim() : undefined,
      },
    });

    if (!isGuest) {
      dispatch({
        type: "ADD_NOTIFICATION",
        payload: {
          id: generateId(), userId: currentUser.id, type: "booking_success",
          title: "Booking Submitted!", message: `Your ${service.title} with ${provider.name} on ${formatDate(selectedDate)} at ${selectedSlot.startTime} is pending confirmation by the provider.`,
          read: false, createdAt: new Date().toISOString(),
        },
      });
    }

    dispatch({
      type: "ADD_NOTIFICATION",
      payload: {
        id: generateId(), userId: provider.userId, type: "new_booking",
        title: "New Booking Request", message: `${finalUserName} wants to book ${service.title} on ${formatDate(selectedDate)} at ${selectedSlot.startTime}.${isGuest ? ` (Guest: ${guestEmail.trim()}, ${guestPhone.trim()})` : ""}`,
        read: false, createdAt: new Date().toISOString(),
        linkTo: "/provider/bookings",
      },
    });

    setShowConfirmModal(false);
    setConfirmed(true);
  };

  // Calendar helpers
  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfWeek(calYear, calMonth);
  const todayStr = today.toISOString().split("T")[0];

  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 14);

  const isDateSelectable = (day: number) => {
    const d = new Date(calYear, calMonth, day);
    const dStr = d.toISOString().split("T")[0];
    return dStr > todayStr && dStr <= maxDate.toISOString().split("T")[0];
  };

  const toDateStr = (day: number) => {
    const d = new Date(calYear, calMonth, day);
    return d.toISOString().split("T")[0];
  };

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
    else setCalMonth(calMonth - 1);
  };

  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
    else setCalMonth(calMonth + 1);
  };

  const canGoPrev = calYear > today.getFullYear() || (calYear === today.getFullYear() && calMonth > today.getMonth());


  if (confirmed) {
    return (
        <div className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-16 text-center animate-fade-in">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success mb-5">
            <Check className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Booking Submitted!</h1>
          <p className="text-muted-foreground text-sm mb-6 max-w-xs">
            Your booking for {service.title} with {provider.name} on {formatDate(selectedDate!)} at {selectedSlot!.startTime} is awaiting provider confirmation.
          </p>


          <div className="flex gap-3">
            {!isGuest && (
                <Button onClick={() => navigate("/dashboard")} className="rounded-full h-10 px-6">{t("book.viewBookings")}</Button>
            )}
            <Link to={`/providers/${provider.id}`}>
              <Button variant={isGuest ? "default" : "outline"} className="rounded-full h-10 px-6 gap-1.5">
                <User className="h-3.5 w-3.5" /> {t("book.viewProvider")}
              </Button>
            </Link>
          </div>
        </div>
    );
  }

  return (
      <div className="mx-auto max-w-4xl px-4 py-8 animate-fade-in">
        <Link to={`/providers/${provider.id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> {t("book.backTo")} {provider.name}
        </Link>

        {/* Service info card */}
        <div className="rounded-2xl border bg-card p-6 shadow-card mb-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-bold mb-1">{t("book.title")} {service.title}</h1>
              <p className="text-muted-foreground text-sm">${service.price} · {service.duration} {t("common.min")}</p>
            </div>
            <Link to={`/providers/${provider.id}`} className="flex items-center gap-2 rounded-full border bg-secondary/50 px-4 py-2 text-sm font-medium hover:bg-secondary transition-colors">
              <User className="h-4 w-4 text-primary" />
              {provider.name}
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <div className="rounded-2xl border bg-card p-6 shadow-card">
            <h2 className="font-semibold mb-4 flex items-center gap-2 text-sm">
              <CalendarIcon className="h-4 w-4 text-primary" /> {t("book.selectDate")}
            </h2>

            {/* Month nav */}
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="sm" onClick={prevMonth} disabled={!canGoPrev} className="h-8 w-8 p-0">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-semibold">{MONTHS[calMonth]} {calYear}</span>
              <Button variant="ghost" size="sm" onClick={nextMonth} className="h-8 w-8 p-0">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAYS.map((d) => (
                  <div key={d} className="text-center text-[11px] font-medium text-muted-foreground py-1">{d}</div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = toDateStr(day);
                const selectable = isDateSelectable(day);
                const isSelected = selectedDate === dateStr;
                const isToday = dateStr === todayStr;

                return (
                    <button
                        key={day}
                        disabled={!selectable}
                        onClick={() => { setSelectedDate(dateStr); setSelectedSlot(null); }}
                        className={`relative h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                            isSelected
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : selectable
                                    ? "hover:bg-primary/10 text-foreground"
                                    : "text-muted-foreground/30 cursor-not-allowed"
                        } ${isToday && !isSelected ? "ring-1 ring-primary/40" : ""}`}
                    >
                      {day}
                    </button>
                );
              })}
            </div>

            {selectedDate && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    {t("book.selected")}: <span className="font-semibold text-foreground">{formatDate(selectedDate)}</span>
                  </p>
                </div>
            )}
          </div>

          {/* Time slots */}
          <div className="rounded-2xl border bg-card p-6 shadow-card">
            <h2 className="font-semibold mb-4 flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-primary" /> {t("book.selectTime")}
            </h2>

            {!selectedDate ? (
                <div className="flex items-center justify-center py-16 text-center">
                  <p className="text-sm text-muted-foreground">{t("book.pickDate")}</p>
                </div>
            ) : slots.length === 0 ? (
                <div className="flex items-center justify-center py-16 text-center">
                  <p className="text-sm text-muted-foreground">{t("book.noSlots")}<br />{t("book.tryAnother")}</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-2">
                  {slots.map((s) => (
                      <button
                          key={s.startTime}
                          onClick={() => setSelectedSlot(s)}
                          className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 ${
                              selectedSlot?.startTime === s.startTime
                                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                  : "bg-secondary/30 text-foreground hover:border-primary/40 hover:bg-primary/5"
                          }`}
                      >
                        {s.startTime} – {s.endTime}
                      </button>
                  ))}
                </div>
            )}

            {/* Confirm button */}
            {selectedSlot && (
                <div className="mt-6 pt-4 border-t animate-fade-in">
                  <div className="text-xs text-muted-foreground mb-3">
                    {formatDate(selectedDate!)} · {selectedSlot.startTime} – {selectedSlot.endTime} · ${service.price}
                  </div>
                  <Button
                      onClick={() => setShowConfirmModal(true)}
                      className="w-full rounded-xl gradient-primary text-primary-foreground h-11 text-sm font-medium"
                  >
                    {t("book.reviewConfirm")}
                  </Button>
                </div>
            )}
          </div>
        </div>

        {/* Guest contact form + Confirmation modal */}
        <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg">{t("book.confirmTitle")}</DialogTitle>
              <DialogDescription className="text-sm">{isGuest ? "Please fill in your details to complete the booking." : t("book.confirmDesc")}</DialogDescription>
            </DialogHeader>

            {/* Guest contact form */}
            {isGuest && (
                <div className="space-y-3 pb-2">
                  <div>
                    <Label htmlFor="guestName" className="text-xs font-medium">Full Name *</Label>
                    <Input
                        id="guestName"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="John Doe"
                        className="mt-1 h-9 text-sm"
                    />
                    {guestErrors.name && <p className="text-destructive text-xs mt-1">{guestErrors.name}</p>}
                  </div>
                  <div>
                    <Label htmlFor="guestEmail" className="text-xs font-medium">Email *</Label>
                    <Input
                        id="guestEmail"
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="mt-1 h-9 text-sm"
                    />
                    {guestErrors.email && <p className="text-destructive text-xs mt-1">{guestErrors.email}</p>}
                  </div>
                  <div>
                    <Label htmlFor="guestPhone" className="text-xs font-medium">Phone *</Label>
                    <Input
                        id="guestPhone"
                        type="tel"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="+40 712 345 678"
                        className="mt-1 h-9 text-sm"
                    />
                    {guestErrors.phone && <p className="text-destructive text-xs mt-1">{guestErrors.phone}</p>}
                  </div>
                  <div className="border-t pt-2" />
                </div>
            )}

            <div className="space-y-3 py-2">
              <DetailRow label={t("book.service")} value={service.title} />
              <DetailRow label={t("book.provider")} value={provider.name} link={`/providers/${provider.id}`} />
              <DetailRow label={t("book.date")} value={selectedDate ? formatDate(selectedDate) : ""} />
              <DetailRow label={t("book.time")} value={selectedSlot ? `${selectedSlot.startTime} – ${selectedSlot.endTime}` : ""} />
              <DetailRow label={t("book.duration")} value={`${service.duration} ${t("common.min")}`} />
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm font-semibold">{t("book.total")}</span>
                <span className="text-lg font-bold text-primary">${service.price}</span>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="ghost" onClick={() => setShowConfirmModal(false)} className="rounded-xl">{t("book.cancel")}</Button>
              <Button onClick={handleConfirm} className="rounded-xl gradient-primary text-primary-foreground">{t("book.confirm")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
};

function DetailRow({ label, value, link }: { label: string; value: string; link?: string }) {
  return (
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        {link ? (
            <Link to={link} className="font-medium text-primary hover:underline">{value}</Link>
        ) : (
            <span className="font-medium">{value}</span>
        )}
      </div>
  );
}

export default BookService;
