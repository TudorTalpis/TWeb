import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Clock, Check, X, Copy, CalendarOff, ChevronRight } from "lucide-react";
import type { Availability } from "@/types";
import { generateId } from "@/lib/storage";

const WEEKDAY_LABELS: Record<number, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  0: "Sunday",
};
const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const ALL_DAYS = [1, 2, 3, 4, 5, 6, 0];
const HOURS = Array.from({ length: 24 }, (_, i) => i); // 0:00 to 23:00

const formatHour = (hour: number): string => {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
};

interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availabilityByDay: Record<number, Availability[]>;
  onAvailabilityChange: (availability: Record<number, Availability[]>) => void;
  providerId: string;
  onSave: () => void;
}

export function ScheduleDialog({
  open,
  onOpenChange,
  availabilityByDay,
  onAvailabilityChange,
  providerId,
  onSave,
}: ScheduleDialogProps) {
  const [selectedDay, setSelectedDay] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragType, setDragType] = useState<"available" | "blocked">("available");

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
      setDragStart(null);
    };
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  const getDayEntries = useCallback((day: number) => availabilityByDay[day] || [], [availabilityByDay]);

  const setDayEntries = useCallback(
    (day: number, entries: Availability[]) => {
      onAvailabilityChange({ ...availabilityByDay, [day]: entries });
    },
    [availabilityByDay, onAvailabilityChange],
  );

  const mergeAdjacentEntries = (entries: Availability[], type: "available" | "blocked"): Availability[] => {
    const filtered = entries.filter((e) => e.isBlocked === (type === "blocked"));
    const others = entries.filter((e) => e.isBlocked !== (type === "blocked"));

    filtered.sort((a, b) => {
      const aHour = parseInt(a.startTime.split(":")[0]);
      const bHour = parseInt(b.startTime.split(":")[0]);
      return aHour - bHour;
    });

    const merged: Availability[] = [];
    let current: Availability | null = null;

    for (const entry of filtered) {
      const startHour = parseInt(entry.startTime.split(":")[0]);
      if (!current) {
        current = { ...entry };
      } else {
        const currentEnd = parseInt(current.endTime.split(":")[0]);
        if (startHour === currentEnd) {
          current = { ...current, endTime: entry.endTime };
        } else {
          merged.push(current);
          current = { ...entry };
        }
      }
    }
    if (current) merged.push(current);

    return [...merged, ...others];
  };

  const isHourMarked = useCallback(
    (day: number, hour: number): "available" | "blocked" | null => {
      const entries = getDayEntries(day);
      const availEntries = entries.filter((e) => !e.isBlocked);
      const blockedEntries = entries.filter((e) => e.isBlocked);

      if (
        blockedEntries.some((e) => {
          const s = parseInt(e.startTime.split(":")[0]);
          const en = parseInt(e.endTime.split(":")[0]);
          return hour >= s && hour < en;
        })
      )
        return "blocked";

      if (
        availEntries.some((e) => {
          const s = parseInt(e.startTime.split(":")[0]);
          const en = parseInt(e.endTime.split(":")[0]);
          return hour >= s && hour < en;
        })
      )
        return "available";

      return null;
    },
    [getDayEntries],
  );

  const toggleHour = useCallback(
    (day: number, hour: number, type: "available" | "blocked") => {
      const entries = getDayEntries(day);
      const currentStatus = isHourMarked(day, hour);

      if (currentStatus === type) {
        // Remove this hour
        const newEntries = entries
          .map((entry) => {
            const s = parseInt(entry.startTime.split(":")[0]);
            const en = parseInt(entry.endTime.split(":")[0]);
            if (hour >= s && hour < en) {
              // Split this entry
              if (entry.isBlocked === (type === "blocked")) {
                const newEntries: Availability[] = [];
                if (s < hour) {
                  newEntries.push({
                    ...entry,
                    endTime: `${hour.toString().padStart(2, "0")}:00`,
                  });
                }
                if (en > hour + 1) {
                  newEntries.push({
                    ...entry,
                    id: generateId(),
                    startTime: `${(hour + 1).toString().padStart(2, "0")}:00`,
                  });
                }
                return newEntries;
              }
            }
            return [entry];
          })
          .flat();
        setDayEntries(day, newEntries);
      } else {
        // Add this hour
        const newEntry: Availability = {
          id: generateId(),
          providerId,
          weekday: day,
          startTime: `${hour.toString().padStart(2, "0")}:00`,
          endTime: `${(hour + 1).toString().padStart(2, "0")}:00`,
          slotMinutes: 30,
          bufferMinutes: 0,
          isBlocked: type === "blocked",
        };
        setDayEntries(day, mergeAdjacentEntries([...entries, newEntry], type));
      }
    },
    [getDayEntries, isHourMarked, providerId, setDayEntries],
  );

  const handleMouseDown = (hour: number, type: "available" | "blocked") => {
    setIsDragging(true);
    setDragStart(hour);
    setDragType(type);
    toggleHour(selectedDay, hour, type);
  };

  const handleMouseEnter = (hour: number) => {
    if (isDragging && dragStart !== null) {
      const start = Math.min(dragStart, hour);
      const end = Math.max(dragStart, hour);
      for (let h = start; h <= end; h++) {
        const current = isHourMarked(selectedDay, h);
        if (current !== dragType) {
          toggleHour(selectedDay, h, dragType);
        }
      }
    }
  };

  const applyPreset = (preset: "9-5" | "9-5-lunch" | "10-6" | "8-6" | "closed") => {
    const entries: Availability[] = [];
    const baseId = generateId();

    if (preset === "9-5") {
      entries.push({
        id: `${baseId}-1`,
        providerId,
        weekday: selectedDay,
        startTime: "09:00",
        endTime: "17:00",
        slotMinutes: 30,
        bufferMinutes: 0,
      });
    } else if (preset === "9-5-lunch") {
      entries.push(
        {
          id: `${baseId}-1`,
          providerId,
          weekday: selectedDay,
          startTime: "09:00",
          endTime: "12:00",
          slotMinutes: 30,
          bufferMinutes: 0,
        },
        {
          id: `${baseId}-2`,
          providerId,
          weekday: selectedDay,
          startTime: "12:00",
          endTime: "13:00",
          slotMinutes: 30,
          bufferMinutes: 0,
          isBlocked: true,
        },
        {
          id: `${baseId}-3`,
          providerId,
          weekday: selectedDay,
          startTime: "13:00",
          endTime: "17:00",
          slotMinutes: 30,
          bufferMinutes: 0,
        },
      );
    } else if (preset === "10-6") {
      entries.push({
        id: `${baseId}-1`,
        providerId,
        weekday: selectedDay,
        startTime: "10:00",
        endTime: "18:00",
        slotMinutes: 30,
        bufferMinutes: 0,
      });
    } else if (preset === "8-6") {
      entries.push({
        id: `${baseId}-1`,
        providerId,
        weekday: selectedDay,
        startTime: "08:00",
        endTime: "18:00",
        slotMinutes: 30,
        bufferMinutes: 0,
      });
    }
    setDayEntries(selectedDay, entries);
  };

  const copyToAllDays = () => {
    const sourceEntries = getDayEntries(selectedDay);
    const updated: Record<number, Availability[]> = {};
    ALL_DAYS.forEach((day) => {
      if (day !== selectedDay) {
        updated[day] = sourceEntries.map((entry) => ({
          ...entry,
          id: generateId(),
          weekday: day,
        }));
      } else {
        updated[day] = sourceEntries;
      }
    });
    onAvailabilityChange({ ...availabilityByDay, ...updated });
  };

  const clearDay = (day: number) => {
    setDayEntries(day, []);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 flex flex-col overflow-hidden animate-fade-in">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60 bg-card">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="font-display text-xl font-bold flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Set Your Hours
              </DialogTitle>
              <DialogDescription className="text-sm mt-1">
                Click hours to set availability. Left-click for open hours, right-click for blocked time.
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 rounded-full text-xs border-border/60"
              onClick={copyToAllDays}
            >
              <Copy className="h-3.5 w-3.5" />
              Copy to All Days
            </Button>
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Day Selector */}
          <div className="w-40 border-r border-border/50 bg-muted/30 p-3 space-y-1">
            {WEEKDAY_ORDER.map((day) => {
              const entries = getDayEntries(day);
              const isSelected = selectedDay === day;
              const hasAvailability = entries.some((e) => !e.isBlocked);

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all duration-200 ${
                    isSelected
                      ? "bg-primary/12 text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                  }`}
                >
                  <span className="text-xs font-medium">{WEEKDAY_LABELS[day]}</span>
                  <div
                    className={`h-2 w-2 rounded-full ${hasAvailability ? "bg-success" : "bg-muted-foreground/30"}`}
                  />
                </button>
              );
            })}
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Quick Presets */}
            <div className="px-6 py-3 border-b border-border/60 bg-muted/20">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Quick set:</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 rounded-full border-success/30 px-3 text-[10px] text-success hover:border-success/50 hover:bg-success/5 hover:text-success"
                  onClick={() => applyPreset("9-5-lunch")}
                >
                  <Check className="h-3 w-3" />
                  Mon-Fri 9-5 + Lunch
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 rounded-full border-primary/30 px-3 text-[10px] text-primary hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                  onClick={() => applyPreset("9-5")}
                >
                  <Clock className="h-3 w-3" />9 AM - 5 PM
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 rounded-full border-primary/30 px-3 text-[10px] text-primary hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                  onClick={() => applyPreset("8-6")}
                >
                  <Clock className="h-3 w-3" />8 AM - 6 PM
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 rounded-full border-primary/30 px-3 text-[10px] text-primary hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                  onClick={() => applyPreset("10-6")}
                >
                  <Clock className="h-3 w-3" />
                  10 AM - 6 PM
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 rounded-full border-destructive/30 px-3 text-[10px] text-destructive hover:border-destructive/50 hover:bg-destructive/5 hover:text-destructive ml-auto"
                  onClick={() => clearDay(selectedDay)}
                >
                  <X className="h-3 w-3" />
                  Clear
                </Button>
              </div>
            </div>

            {/* Scrollable Content */}
            <ScrollArea className="flex-1">
              <div className="p-6 space-y-6">
                {/* Hour Grid */}
                <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-primary" />
                      {WEEKDAY_LABELS[selectedDay]}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-sm bg-success/20 border border-success/40" />
                        <span>Available</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-sm bg-destructive/20 border border-destructive/40" />
                        <span>Blocked</span>
                      </div>
                    </div>
                  </div>

                  {/* Hour blocks - 24 hours */}
                  <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(12, minmax(0, 1fr))" }}>
                    {HOURS.map((hour) => {
                      const status = isHourMarked(selectedDay, hour);

                      return (
                        <div key={hour} className="flex flex-col items-center">
                          <span className="text-[10px] font-medium text-muted-foreground mb-1.5 truncate w-full text-center">
                            {formatHour(hour)}
                          </span>
                          <button
                            className={`w-full h-14 rounded-xl border-2 transition-all duration-200 select-none ${
                              status === "available"
                                ? "bg-success/20 border-success/40 hover:bg-success/30 hover:border-success/60"
                                : status === "blocked"
                                  ? "bg-destructive/20 border-destructive/40 hover:bg-destructive/30 hover:border-destructive/60"
                                  : "bg-secondary/30 border-border/60 hover:border-primary/40 hover:bg-primary/5"
                            }`}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleMouseDown(hour, "available");
                            }}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              handleMouseDown(hour, "blocked");
                            }}
                            onMouseEnter={() => handleMouseEnter(hour)}
                          >
                            {status === "available" && <Check className="h-3.5 w-3.5 text-success mx-auto" />}
                            {status === "blocked" && <CalendarOff className="h-3.5 w-3.5 text-destructive mx-auto" />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/60 bg-card flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>Left-click: Add availability</span>
            <Separator orientation="vertical" className="h-4" />
            <span>Right-click: Add blocked time</span>
            <Separator orientation="vertical" className="h-4" />
            <span>Drag to select multiple hours</span>
          </div>
          <Button
            onClick={() => {
              onSave();
              onOpenChange(false);
            }}
            className="rounded-full h-10 px-6 gap-2"
          >
            <Check className="h-4 w-4" />
            Save Schedule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
