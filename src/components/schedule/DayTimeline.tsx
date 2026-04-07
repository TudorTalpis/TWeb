import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CalendarOff,
  Utensils,
  Plus,
  Trash2,
  GripVertical,
} from "lucide-react";
import type { Availability } from "@/types";
import {
  getTimeRangePercentage,
  minutesToTime,
  timeToMinutes,
  getEntryType,
} from "@/lib/schedule-utils";

interface DayTimelineProps {
  dayIndex: number;
  dayLabel: string;
  entries: Availability[];
  isSelected: boolean;
  onToggleSelect: () => void;
  onUpdateEntry: (index: number, patch: Partial<Availability>) => void;
  onRemoveEntry: (index: number) => void;
  onAddAvailability: () => void;
  onAddLunch: () => void;
  onAddBlock: () => void;
}

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6 AM to 10 PM

export function DayTimeline({
  dayLabel,
  entries,
  isSelected,
  onToggleSelect,
  onUpdateEntry,
  onRemoveEntry,
  onAddAvailability,
  onAddLunch,
  onAddBlock,
}: DayTimelineProps) {
  const sortedEntries = [...entries].sort((a, b) =>
    timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  return (
    <div
      className={`rounded-xl border-2 p-4 transition-all ${
        isSelected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border bg-card hover:border-primary/50"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onToggleSelect}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div
            className={`h-3 w-3 rounded-full transition-colors ${
              entries.length > 0 ? "bg-green-500" : "bg-muted-foreground/30"
            }`}
          />
          <span className="text-sm font-semibold group-hover:text-primary transition-colors">
            {dayLabel}
          </span>
          {entries.length === 0 && (
            <Badge variant="secondary" className="text-xs">
              Closed
            </Badge>
          )}
        </button>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs hover:bg-green-50 hover:text-green-700 hover:border-green-300 dark:hover:bg-green-950/20 dark:hover:text-green-400"
            onClick={onAddAvailability}
          >
            <Clock className="h-3.5 w-3.5" />
            Hours
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 dark:hover:bg-orange-950/20 dark:hover:text-orange-400"
            onClick={onAddLunch}
          >
            <Utensils className="h-3.5 w-3.5" />
            Lunch
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs hover:bg-red-50 hover:text-red-700 hover:border-red-300 dark:hover:bg-red-950/20 dark:hover:text-red-400"
            onClick={onAddBlock}
          >
            <CalendarOff className="h-3.5 w-3.5" />
            Block
          </Button>
        </div>
      </div>

      {/* Timeline visualization */}
      {entries.length > 0 && (
        <div className="space-y-3">
          {/* Timeline bar */}
          <div className="relative h-12 rounded-lg bg-muted/50 border overflow-hidden">
            {/* Hour markers */}
            <div className="absolute inset-0 flex items-end">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="flex-shrink-0 border-l border-border/30 h-full relative"
                  style={{ width: `${100 / (HOURS.length - 1)}%` }}
                >
                  <span className="absolute -top-0.5 left-0.5 text-[9px] text-muted-foreground/70">
                    {hour > 12 ? hour - 12 : hour}
                    {hour >= 12 ? "pm" : "am"}
                  </span>
                </div>
              ))}
            </div>

            {/* Entry blocks */}
            {sortedEntries.map((entry, idx) => {
              const { left, width } = getTimeRangePercentage(
                entry.startTime,
                entry.endTime
              );
              const entryType = getEntryType(entry);

              return (
                <div
                  key={entry.id}
                  className={`absolute top-2 bottom-0 rounded-md px-2 flex items-center text-xs font-medium transition-all cursor-pointer ${
                    entryType === "blocked"
                      ? "bg-red-200 dark:bg-red-900/40 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700"
                      : entryType === "lunch"
                      ? "bg-orange-200 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200 border border-orange-300 dark:border-orange-700"
                      : "bg-green-200 dark:bg-green-900/40 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700 hover:brightness-95"
                  }`}
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                  }}
                  onClick={() => {
                    // Focus on this entry for editing
                  }}
                >
                  <span className="truncate">
                    {entryType === "blocked"
                      ? "Blocked"
                      : entryType === "lunch"
                      ? "Lunch"
                      : `${entry.startTime}–${entry.endTime}`}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Entry editor rows */}
          <div className="space-y-2">
            {sortedEntries.map((entry, idx) => {
              const originalIndex = entries.findIndex((e) => e.id === entry.id);
              const entryType = getEntryType(entry);

              return (
                <div
                  key={entry.id}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                    entryType === "blocked"
                      ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                      : entryType === "lunch"
                      ? "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800"
                      : "bg-muted/30 border-border"
                  }`}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />

                  {entryType === "blocked" && (
                    <CalendarOff className="h-4 w-4 text-red-600 flex-shrink-0" />
                  )}
                  {entryType === "lunch" && (
                    <Utensils className="h-4 w-4 text-orange-600 flex-shrink-0" />
                  )}

                  <Input
                    type="time"
                    value={entry.startTime}
                    onChange={(e) =>
                      onUpdateEntry(originalIndex, { startTime: e.target.value })
                    }
                    className="h-9 w-28"
                  />

                  <span className="text-sm text-muted-foreground flex-shrink-0">
                    to
                  </span>

                  <Input
                    type="time"
                    value={entry.endTime}
                    onChange={(e) =>
                      onUpdateEntry(originalIndex, { endTime: e.target.value })
                    }
                    className="h-9 w-28"
                  />

                  {entryType === "availability" && (
                    <>
                      <div className="flex items-center gap-2 ml-2">
                        <Input
                          type="number"
                          min={5}
                          step={5}
                          value={entry.slotMinutes}
                          onChange={(e) =>
                            onUpdateEntry(originalIndex, {
                              slotMinutes: Number(e.target.value) || 0,
                            })
                          }
                          className="h-9 w-20"
                          placeholder="Duration"
                        />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          min
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          step={5}
                          value={entry.bufferMinutes}
                          onChange={(e) =>
                            onUpdateEntry(originalIndex, {
                              bufferMinutes: Number(e.target.value) || 0,
                            })
                          }
                          className="h-9 w-20"
                          placeholder="Buffer"
                        />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          buffer
                        </span>
                      </div>
                    </>
                  )}

                  {entryType === "blocked" && (
                    <Badge variant="secondary" className="text-xs ml-2">
                      Blocked
                    </Badge>
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 ml-auto text-muted-foreground hover:text-destructive flex-shrink-0"
                    onClick={() => onRemoveEntry(originalIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {entries.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No hours set</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2 gap-1.5"
            onClick={onAddAvailability}
          >
            <Plus className="h-3.5 w-3.5" />
            Add hours
          </Button>
        </div>
      )}
    </div>
  );
}
