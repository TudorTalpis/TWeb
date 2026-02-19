import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { format, addDays, startOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAppStore } from "@/store/AppContext";
import { generateId } from "@/lib/storage";
import type { Service } from "@/types";
import { Trash2, Plus, Clock, User, CalendarIcon, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProviderPanelLayout } from "@/components/ProviderPanelLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useIsMobile } from "@/hooks/use-mobile";

// Apple Calendar-like pastel colors with matching left-border accents
const BOOKING_COLORS = [
  { bg: "#E8F5E9", border: "#43A047", text: "#1B5E20" },
  { bg: "#E3F2FD", border: "#1E88E5", text: "#0D47A1" },
  { bg: "#FFF3E0", border: "#FB8C00", text: "#E65100" },
  { bg: "#F3E5F5", border: "#AB47BC", text: "#4A148C" },
  { bg: "#FCE4EC", border: "#EC407A", text: "#880E4F" },
  { bg: "#E0F7FA", border: "#00ACC1", text: "#006064" },
  { bg: "#FFF8E1", border: "#FFB300", text: "#FF6F00" },
];

function getBookingColor(index: number) {
  return BOOKING_COLORS[index % BOOKING_COLORS.length];
}

const ProviderSchedule = () => {
  const { state, dispatch, currentProvider } = useAppStore();
  const isMobile = useIsMobile();
  const calendarRef = useRef<FullCalendar>(null);

  // Booking dialog & add booking state
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [newBooking, setNewBooking] = useState({ clientName: "", clientPhone: "", serviceId: "", date: "", startTime: "09:00", duration: 60 });
  const [showAddBooking, setShowAddBooking] = useState(false);
  const [useCustomService, setUseCustomService] = useState(false);
  const [customService, setCustomService] = useState({ title: "", price: 0, duration: 60 });

  const providerId = currentProvider?.id || "";
  const bookings = state.bookings.filter((b) => b.providerId === providerId);
  const timeoffs = state.timeoff.filter((t) => t.providerId === providerId);

  // Convert bookings to FullCalendar events
  const calendarEvents = useMemo(() => {
    return bookings.map((b, i) => {
      const svc = state.services.find((s) => s.id === b.serviceId);
      const color = getBookingColor(i);
      return {
        id: b.id,
        title: `${b.userName}\n${svc?.title || "Service"}`,
        start: `${b.date}T${b.startTime}:00`,
        end: `${b.date}T${b.endTime}:00`,
        backgroundColor: color.bg,
        borderColor: color.border,
        textColor: color.text,
        extendedProps: {
          userName: b.userName,
          userPhone: b.userPhone || "",
          serviceName: svc?.title || "Service",
          status: b.status,
          startTime: b.startTime,
          endTime: b.endTime,
        },
      };
    });
  }, [bookings, state.services]);

  // Time off as background events (red)
  const timeoffEvents = useMemo(() => {
    return timeoffs.map((t) => ({
      id: `timeoff-${t.id}`,
      start: `${t.date}T${t.startTime}:00`,
      end: `${t.date}T${t.endTime}:00`,
      display: "background" as const,
      backgroundColor: "hsl(var(--destructive) / 0.1)",
    }));
  }, [timeoffs]);

  const allEvents = [...calendarEvents, ...timeoffEvents];

  if (!currentProvider) return null;

  // Handle event click - delete booking
  const handleEventClick = (info: any) => {
    if (info.event.display === "background") return;
    setSelectedEventId(info.event.id);
    setShowBookingDialog(true);
  };

  // Delete booking
  const deleteBooking = () => {
    if (!selectedEventId) return;
    dispatch({ type: "DELETE_BOOKING", payload: selectedEventId });
    setShowBookingDialog(false);
    setSelectedEventId(null);
  };

  // Compute end time from start + duration
  const computeEndTime = (start: string, durationMin: number): string => {
    const [h, m] = start.split(":").map(Number);
    const total = h * 60 + m + durationMin;
    const eh = Math.floor(total / 60) % 24;
    const em = total % 60;
    return `${eh.toString().padStart(2, "0")}:${em.toString().padStart(2, "0")}`;
  };

  // When service changes, update duration automatically
  const handleServiceChange = (serviceId: string) => {
    const svc = providerServices.find((s) => s.id === serviceId);
    setNewBooking((prev) => ({
      ...prev,
      serviceId,
      duration: svc?.duration || prev.duration,
    }));
    setUseCustomService(false);
  };

  const handleCustomServiceToggle = () => {
    setUseCustomService(true);
    setNewBooking((prev) => ({ ...prev, serviceId: "" }));
  };

  // Add new booking
  const addBooking = () => {
    if (!newBooking.clientName || !newBooking.date) return;
    if (!useCustomService && !newBooking.serviceId) return;

    let serviceId = newBooking.serviceId;

    // If custom service, create it first
    if (useCustomService) {
      if (!customService.title) return;
      const newSvc: Service = {
        id: generateId(),
        providerId: currentProvider.id,
        title: customService.title,
        description: "",
        price: customService.price,
        duration: customService.duration,
        categoryId: currentProvider.categoryId || "",
      };
      dispatch({ type: "ADD_SERVICE", payload: newSvc });
      serviceId = newSvc.id;
    }

    const endTime = computeEndTime(newBooking.startTime, newBooking.duration);

    const booking = {
      id: generateId(),
      providerId: currentProvider.id,
      userId: `user-${generateId()}`,
      userName: newBooking.clientName,
      userPhone: newBooking.clientPhone || undefined,
      serviceId,
      date: newBooking.date,
      startTime: newBooking.startTime,
      endTime,
      status: "CONFIRMED" as const,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: "ADD_BOOKING", payload: booking });
    setNewBooking({ clientName: "", clientPhone: "", serviceId: "", date: "", startTime: "09:00", duration: 60 });
    setCustomService({ title: "", price: 0, duration: 60 });
    setUseCustomService(false);
    setShowAddBooking(false);
  };

  // Get current provider's services
  const providerServices = state.services.filter((s) => s.providerId === currentProvider.id);
  const selectedBooking = bookings.find((b) => b.id === selectedEventId);

  return (
      <ProviderPanelLayout>
        <div className="flex flex-col h-[calc(100vh-5rem)]">
          {/* Add Booking Button */}
          <div className="flex-shrink-0 mb-3">
            <Button onClick={() => setShowAddBooking(true)} className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Add Booking
            </Button>
          </div>

          {/* Calendar View — fills remaining space */}
          <div className="rounded-2xl border bg-card shadow-card provider-calendar overflow-hidden flex-1 min-h-0">
            <FullCalendar
                ref={calendarRef}
                plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
                initialView={isMobile ? "timeGrid" : "timeGridWeek"}
                headerToolbar={isMobile ? {
                  left: "prev,next",
                  center: "title",
                  right: "today",
                } : {
                  left: "today prev,next",
                  center: "title",
                  right: "timeGridWeek,timeGridDay",
                }}
                views={isMobile ? {
                  timeGrid: {
                    type: "timeGrid",
                    duration: { days: 3 },
                  }
                } : undefined}
                events={allEvents}
                eventClick={handleEventClick}
                slotMinTime="07:00:00"
                slotMaxTime="21:00:00"
                allDaySlot={false}
                slotDuration={isMobile ? "01:00:00" : "00:30:00"}
                height="100%"
                expandRows
                nowIndicator
                dayHeaderFormat={isMobile ? { weekday: "short", day: "numeric" } : { weekday: "short", day: "numeric" }}
                slotLabelFormat={{ hour: "numeric", minute: "2-digit", hour12: true }}
                eventContent={(arg) => {
                  const props = arg.event.extendedProps;
                  if (arg.event.display === "background") return null;
                  return (
                      <div
                          className="px-2 py-1.5 overflow-hidden h-full flex flex-col cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handleEventClick({ event: arg.event })}
                          role="button"
                          tabIndex={0}
                      >
                        <p className="text-[10px] font-medium leading-tight opacity-70">
                          {props.startTime} – {props.endTime}
                        </p>
                        <p className="text-[11px] font-semibold leading-tight mt-0.5 truncate">{props.userName}</p>
                        {props.userPhone && (
                            <p className="text-[10px] leading-tight truncate opacity-70 mt-0.5">📞 {props.userPhone}</p>
                        )}
                        <p className="text-[10px] leading-tight truncate opacity-60 mt-auto">{props.serviceName}</p>
                      </div>
                  );
                }}
            />
          </div>

          {/* Delete Booking Dialog */}
          <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Booking Details</DialogTitle>
              </DialogHeader>
              {selectedBooking && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Client</p>
                      <p className="font-semibold flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {selectedBooking.userName}
                      </p>
                      {selectedBooking.userPhone && (
                          <a href={`tel:${selectedBooking.userPhone}`} className="text-sm text-muted-foreground flex items-center gap-2 hover:text-foreground transition-colors">
                            <Phone className="h-4 w-4" />
                            {selectedBooking.userPhone}
                          </a>
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="font-semibold flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {selectedBooking.date} · {selectedBooking.startTime} – {selectedBooking.endTime}
                      </p>
                    </div>
                  </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowBookingDialog(false)}>
                  Close
                </Button>
                <Button variant="destructive" onClick={deleteBooking} className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Booking
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add Booking Dialog */}
          <Dialog open={showAddBooking} onOpenChange={setShowAddBooking}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Booking</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Client Name</Label>
                  <Input
                      placeholder="Enter client name"
                      value={newBooking.clientName}
                      onChange={(e) => setNewBooking({ ...newBooking, clientName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                      type="tel"
                      placeholder="+40 712 345 678"
                      value={newBooking.clientPhone}
                      onChange={(e) => setNewBooking({ ...newBooking, clientPhone: e.target.value })}
                  />
                </div>

                {/* Service selection or custom */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Service</Label>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-xs h-auto py-1 px-2"
                        onClick={() => useCustomService ? setUseCustomService(false) : handleCustomServiceToggle()}
                    >
                      {useCustomService ? "Choose existing" : "+ Custom service"}
                    </Button>
                  </div>
                  {!useCustomService ? (
                      <Select value={newBooking.serviceId} onValueChange={handleServiceChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border shadow-floating z-50">
                          {providerServices.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.title} ({s.duration} min – {s.price} lei)
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                  ) : (
                      <div className="space-y-3 rounded-lg border p-3 bg-muted/30">
                        <Input
                            placeholder="Service name"
                            value={customService.title}
                            onChange={(e) => setCustomService({ ...customService, title: e.target.value })}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs">Price (lei)</Label>
                            <Input
                                type="number"
                                min={0}
                                value={customService.price}
                                onChange={(e) => setCustomService({ ...customService, price: Number(e.target.value) })}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Duration (min)</Label>
                            <Input
                                type="number"
                                min={5}
                                step={5}
                                value={customService.duration}
                                onChange={(e) => {
                                  const dur = Number(e.target.value);
                                  setCustomService({ ...customService, duration: dur });
                                  setNewBooking((prev) => ({ ...prev, duration: dur }));
                                }}
                            />
                          </div>
                        </div>
                      </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Date</Label>
                  <div className="flex gap-2 mb-2">
                    {[0, 1, 2].map((offset) => {
                      const d = addDays(new Date(), offset);
                      const dateStr = format(d, "yyyy-MM-dd");
                      const label = offset === 0 ? "Today" : offset === 1 ? "Tomorrow" : format(d, "EEE, d MMM");
                      return (
                          <Button
                              key={offset}
                              type="button"
                              variant={newBooking.date === dateStr ? "default" : "outline"}
                              size="sm"
                              className="text-xs flex-1"
                              onClick={() => setNewBooking({ ...newBooking, date: dateStr })}
                          >
                            {label}
                          </Button>
                      );
                    })}
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                          variant="outline"
                          className={cn(
                              "w-full justify-start text-left font-normal",
                              !newBooking.date && "text-muted-foreground"
                          )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newBooking.date ? format(new Date(newBooking.date + "T00:00:00"), "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                          mode="single"
                          selected={newBooking.date ? new Date(newBooking.date + "T00:00:00") : undefined}
                          onSelect={(d) => d && setNewBooking({ ...newBooking, date: format(d, "yyyy-MM-dd") })}
                          disabled={(date) => date < startOfDay(new Date())}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input
                        type="time"
                        value={newBooking.startTime}
                        onChange={(e) => setNewBooking({ ...newBooking, startTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (min)</Label>
                    <Input
                        type="number"
                        min={5}
                        step={5}
                        value={newBooking.duration}
                        onChange={(e) => setNewBooking({ ...newBooking, duration: Number(e.target.value) })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Ends at {computeEndTime(newBooking.startTime, newBooking.duration)}
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddBooking(false)}>
                  Cancel
                </Button>
                <Button
                    onClick={addBooking}
                    disabled={!newBooking.clientName || !newBooking.date || (!useCustomService && !newBooking.serviceId) || (useCustomService && !customService.title)}
                >
                  Add Booking
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </ProviderPanelLayout>
  );
};

export default ProviderSchedule;
