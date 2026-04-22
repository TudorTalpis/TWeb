import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CategoryMultiSelect } from "@/components/CategoryMultiSelect";
import { useAppStore } from "@/store/AppContext";
import {
  Check,
  Camera,
  ImagePlus,
  X,
  Link as LinkIcon,
  MapPin,
  Phone,
  Plus,
  Trash2,
  Clock,
  CalendarOff,
  Store,
  Image as ImageIcon,
  Save,
  Utensils,
  Pencil,
} from "lucide-react";
import { ProviderPanelLayout } from "@/components/ProviderPanelLayout";
import { ScheduleDialog } from "@/components/schedule/ScheduleDialog";
import { fileToBase64 } from "@/lib/fileToBase64";
import { generateId } from "@/lib/storage";
import { findCategoryByName, normalizeCategory } from "@/lib/categories";
import type { Availability } from "@/types";

const PENDING_CATEGORY_PREFIX = "pending:";
const WEEKEND_DAYS = [6, 0];
const ALL_DAYS = [1, 2, 3, 4, 5, 6, 0];

const emptyAvailabilityMap = (): Record<number, Availability[]> => ({
  0: [],
  1: [],
  2: [],
  3: [],
  4: [],
  5: [],
  6: [],
});

const buildAvailabilityMap = (availability: Availability[], providerId: string) => {
  const map = emptyAvailabilityMap();
  availability
    .filter((entry) => entry.providerId === providerId)
    .sort((a, b) => `${a.startTime}`.localeCompare(`${b.startTime}`))
    .forEach((entry) => {
      map[entry.weekday] = [...map[entry.weekday], entry];
    });
  return map;
};

const ProviderProfilePage = () => {
  const {state, currentProvider, dispatch } = useAppStore();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: currentProvider?.name || "",
    slug: currentProvider?.slug || "",
    description: currentProvider?.description || "",
    categoryIds: currentProvider?.categoryIds || ([] as string[]),
    pendingCategoryNames: currentProvider?.pendingCategoryNames || ([] as string[]),
    phone: currentProvider?.phone || "",
    location: currentProvider?.location || "",
    avatar: currentProvider?.avatar || "",
    coverPhoto: currentProvider?.coverPhoto || "",
    galleryPhotos: currentProvider?.galleryPhotos || ([] as string[]),
  });
  const [categoryError, setCategoryError] = useState("");
  const [availabilityByDay, setAvailabilityByDay] = useState<Record<number, Availability[]>>(() =>
    currentProvider ? buildAvailabilityMap(state.availability, currentProvider.id) : emptyAvailabilityMap(),
  );
  const [timeoffForm, setTimeoffForm] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    startTime: "09:00",
    endTime: "12:00",
    reason: "",
    allDay: false,
  });
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduleViewMode, _setScheduleViewMode] = useState<"daily" | "weekly">("weekly");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!currentProvider) return;
    setAvailabilityByDay(buildAvailabilityMap(state.availability, currentProvider.id));
  }, [state.availability, currentProvider]);

  const pendingCategoryOptions = useMemo(
    () =>
      form.pendingCategoryNames.map((name) => ({
        id: `${PENDING_CATEGORY_PREFIX}${normalizeCategory(name)}`,
        name,
        icon: "Sparkles",
        description: "Pending admin approval",
        color: "primary",
      })),
    [form.pendingCategoryNames],
  );
  const categoryOptions = useMemo(
    () => [...state.categories, ...pendingCategoryOptions],
    [state.categories, pendingCategoryOptions],
  );
  const selectedCategoryIds = useMemo(
    () => [...form.categoryIds, ...pendingCategoryOptions.map((option) => option.id)],
    [form.categoryIds, pendingCategoryOptions],
  );

  if (!currentProvider) return <p className="p-8 text-center text-muted-foreground">No provider profile found.</p>;

  const handleCreatePendingCategory = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return null;
    const existing = findCategoryByName(state.categories, trimmed);
    if (existing) return existing.id;
    const normalized = normalizeCategory(trimmed);
    const pendingId = `${PENDING_CATEGORY_PREFIX}${normalized}`;
    const alreadyPending = form.pendingCategoryNames.some((item) => normalizeCategory(item) === normalized);
    if (!alreadyPending) {
      setForm((prev) => ({ ...prev, pendingCategoryNames: [...prev.pendingCategoryNames, trimmed] }));
    }
    return pendingId;
  };

  const handleCategoriesChange = (nextIds: string[]) => {
    const approvedIds = nextIds.filter((id) => !id.startsWith(PENDING_CATEGORY_PREFIX));
    const pendingNames = nextIds
      .filter((id) => id.startsWith(PENDING_CATEGORY_PREFIX))
      .map((id) => {
        const existingOptionName = pendingCategoryOptions.find((option) => option.id === id)?.name;
        if (existingOptionName) return existingOptionName;
        const normalized = id.slice(PENDING_CATEGORY_PREFIX.length);
        return form.pendingCategoryNames.find((name) => normalizeCategory(name) === normalized) ?? normalized;
      })
      .filter(Boolean);
    setForm((prev) => ({ ...prev, categoryIds: approvedIds, pendingCategoryNames: pendingNames }));
    if (approvedIds.length > 0 || pendingNames.length > 0) {
      setCategoryError("");
    }
  };

  const slugTaken =
    form.slug.trim().length > 0 &&
    form.slug.trim().toLowerCase() !== currentProvider.slug.toLowerCase() &&
    state.providerProfiles.some((p) => p.slug.toLowerCase() === form.slug.trim().toLowerCase());

  const handleFileUpload = async (file: File, target: "avatar" | "cover") => {
    const base64 = await fileToBase64(file);
    setForm((prev) => ({ ...prev, [target === "avatar" ? "avatar" : "coverPhoto"]: base64 }));
  };

  const handleGalleryUpload = async (files: FileList) => {
    const remaining = 6 - form.galleryPhotos.length;
    const toProcess = Array.from(files).slice(0, remaining);
    const base64s = await Promise.all(toProcess.map(fileToBase64));
    setForm((prev) => ({ ...prev, galleryPhotos: [...prev.galleryPhotos, ...base64s] }));
  };

  const handleRemovePhoto = (index: number) => {
    setForm({ ...form, galleryPhotos: form.galleryPhotos.filter((_, i) => i !== index) });
  };

  const updateAvailabilityEntry = (weekday: number, index: number, patch: Partial<Availability>) => {
    setAvailabilityByDay((prev) => {
      const dayEntries = [...(prev[weekday] ?? [])];
      const entry = dayEntries[index];
      if (!entry) return prev;
      dayEntries[index] = { ...entry, ...patch };
      return { ...prev, [weekday]: dayEntries };
    });
  };

  const addAvailabilityEntry = (weekday: number, isBlocked = false) => {
    if (!currentProvider) return;
    const newEntry: Availability = {
      id: generateId(),
      providerId: currentProvider.id,
      weekday,
      startTime: isBlocked ? "12:00" : "09:00",
      endTime: isBlocked ? "13:00" : "17:00",
      slotMinutes: 30,
      bufferMinutes: 0,
      isBlocked,
    };
    setAvailabilityByDay((prev) => ({
      ...prev,
      [weekday]: [...(prev[weekday] ?? []), newEntry],
    }));
  };

  const removeAvailabilityEntry = (weekday: number, index: number) => {
    setAvailabilityByDay((prev) => ({
      ...prev,
      [weekday]: (prev[weekday] ?? []).filter((_, i) => i !== index),
    }));
  };

  const handleAddTimeoff = () => {
    if (!currentProvider) return;
    if (!timeoffForm.date || !timeoffForm.startTime || !timeoffForm.endTime) return;
    const startTime = timeoffForm.allDay ? "00:00" : timeoffForm.startTime;
    const endTime = timeoffForm.allDay ? "23:59" : timeoffForm.endTime;
    dispatch({
      type: "ADD_TIMEOFF",
      payload: {
        id: generateId(),
        providerId: currentProvider.id,
        date: timeoffForm.date,
        startTime,
        endTime,
        reason: timeoffForm.reason.trim() || undefined,
      },
    });
    setTimeoffForm({
      date: format(new Date(), "yyyy-MM-dd"),
      startTime: "09:00",
      endTime: "12:00",
      reason: "",
      allDay: false,
    });
  };

  const handleDeleteTimeoff = (timeoffId: string) => {
    dispatch({ type: "DELETE_TIMEOFF", payload: timeoffId });
  };

  const saveSchedule = () => {
    const updatedAvailability = Object.values(availabilityByDay).flat();
    const nextAvailability = state.availability
      .filter((entry) => entry.providerId !== currentProvider.id)
      .concat(updatedAvailability);
    dispatch({ type: "SET_AVAILABILITY", payload: nextAvailability });
  };

  const handleScheduleDialogOpenChange = (open: boolean) => {
    setScheduleDialogOpen(open);
    if (!open && currentProvider) {
      saveSchedule();
      setAvailabilityByDay(buildAvailabilityMap(state.availability, currentProvider.id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (slugTaken) return;
    if (form.categoryIds.length === 0 && form.pendingCategoryNames.length === 0) {
      setCategoryError("Add at least one category.");
      return;
    }

    const existingPending = new Set(
      (currentProvider.pendingCategoryNames ?? []).map((name) => normalizeCategory(name)),
    );
    const newlyProposed = form.pendingCategoryNames.filter((name) => !existingPending.has(normalizeCategory(name)));

    dispatch({ type: "UPDATE_PROVIDER_PROFILE", payload: { id: currentProvider.id, ...form } });

    if (newlyProposed.length > 0) {
      state.users
        .filter((user) => user.role === "ADMIN")
        .forEach((admin) => {
          dispatch({
            type: "ADD_NOTIFICATION",
            payload: {
              id: generateId(),
              userId: admin.id,
              type: "application_submitted",
              title: "Provider category approval needed",
              message: `${currentProvider.name} proposed categories: ${newlyProposed.join(", ")}`,
              read: false,
              createdAt: new Date().toISOString(),
              linkTo: `/admin/providers/${currentProvider.id}`,
            },
          });
        });
    }

    setCategoryError("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const initials = currentProvider.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const weekdayLabels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const weekdayShortLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekdayOrder = [1, 2, 3, 4, 5, 6, 0];
  const providerTimeoff = state.timeoff.filter((timeoff) => timeoff.providerId === currentProvider.id);
  const freeDays = weekdayLabels.filter((_, index) => (availabilityByDay[index] ?? []).length === 0);
  const scheduleSummary = (() => {
    const orderedDays = weekdayOrder.map((weekday) => {
      const entries = availabilityByDay[weekday] ?? [];
      return {
        label: weekdayShortLabels[weekday],
        value:
          entries.length > 0 ? entries.map((entry) => `${entry.startTime} - ${entry.endTime}`).join(", ") : "Closed",
      };
    });
    const groups: { label: string; value: string }[] = [];
    let index = 0;
    while (index < orderedDays.length) {
      const value = orderedDays[index].value;
      let end = index;
      while (end + 1 < orderedDays.length && orderedDays[end + 1].value === value) {
        end += 1;
      }
      const label = index === end ? orderedDays[index].label : `${orderedDays[index].label}-${orderedDays[end].label}`;
      groups.push({ label, value });
      index = end + 1;
    }
    return groups;
  })();

  // Helper to add lunch break to a day
  const addLunchBreak = (weekday: number) => {
    const dayEntries = availabilityByDay[weekday] ?? [];
    if (dayEntries.length === 0) {
      // Add default work hours first
      const workEntry: Availability = {
        id: generateId(),
        providerId: currentProvider!.id,
        weekday,
        startTime: "09:00",
        endTime: "17:00",
        slotMinutes: 30,
        bufferMinutes: 0,
        isBlocked: false,
      };
      setAvailabilityByDay((prev) => ({
        ...prev,
        [weekday]: [workEntry],
      }));
    }

    // Add lunch break (12:00 - 13:00 by default)
    const lunchEntry: Availability = {
      id: generateId(),
      providerId: currentProvider!.id,
      weekday,
      startTime: "12:00",
      endTime: "13:00",
      slotMinutes: 30,
      bufferMinutes: 0,
      isBlocked: true,
    };

    setAvailabilityByDay((prev) => ({
      ...prev,
      [weekday]: [...(prev[weekday] ?? []), lunchEntry],
    }));
  };

  // Copy schedule from one day to multiple days
  const _copyDayToSelectedDays = (sourceDay: number) => {
    const sourceEntries = availabilityByDay[sourceDay] ?? [];
    setAvailabilityByDay((prev) => {
      const next = { ...prev };
      selectedDays.forEach((targetDay) => {
        if (targetDay !== sourceDay) {
          next[targetDay] = sourceEntries.map((entry) => ({
            ...entry,
            id: generateId(),
            weekday: targetDay,
          }));
        }
      });
      return next;
    });
  };

  // Copy workday schedule to all weekdays
  const _copyToAllWeekdays = () => {
    if (selectedDays.length === 0) return;
    const sourceDay = selectedDays[0];
    const sourceEntries = availabilityByDay[sourceDay] ?? [];
    setAvailabilityByDay((prev) => {
      const next = { ...prev };
      ALL_DAYS.forEach((targetDay) => {
        next[targetDay] = sourceEntries.map((entry) => ({
          ...entry,
          id: generateId(),
          weekday: targetDay,
        }));
      });
      return next;
    });
    setSelectedDays(ALL_DAYS);
  };

  // Copy workdays to weekend or vice versa
  const _copyWorkdaysToWeekend = () => {
    // Use Monday as source
    const sourceEntries = availabilityByDay[1] ?? [];
    setAvailabilityByDay((prev) => {
      const next = { ...prev };
      WEEKEND_DAYS.forEach((targetDay) => {
        next[targetDay] = sourceEntries.map((entry) => ({
          ...entry,
          id: generateId(),
          weekday: targetDay,
        }));
      });
      return next;
    });
  };

  const _setWeekendClosed = () => {
    setAvailabilityByDay((prev) => ({
      ...prev,
      6: [],
      0: [],
    }));
  };

  const toggleDaySelection = (day: number) => {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const _renderDaySchedule = (dayIndex: number, showDayLabel = true) => {
    const entries = availabilityByDay[dayIndex] ?? [];
    const isSelected = selectedDays.includes(dayIndex);

    return (
      <div
        key={dayIndex}
        className={`rounded-lg border p-4 space-y-3 transition-colors ${isSelected ? "border-primary bg-primary/5" : ""}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {scheduleViewMode === "weekly" && (
              <Checkbox checked={isSelected} onCheckedChange={() => toggleDaySelection(dayIndex)} />
            )}
            <div
              className={`h-2 w-2 rounded-full ${entries.length === 0 ? "bg-muted-foreground/30" : "bg-green-500"}`}
            />
            {showDayLabel && <p className="text-sm font-semibold">{weekdayLabels[dayIndex]}</p>}
            {entries.length === 0 && (
              <Badge variant="secondary" className="text-xs">
                Closed
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => addAvailabilityEntry(dayIndex, true)}
            >
              <CalendarOff className="h-3.5 w-3.5" />
              Add Block
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => addLunchBreak(dayIndex)}
            >
              <Utensils className="h-3.5 w-3.5" />
              Add Lunch
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => addAvailabilityEntry(dayIndex, false)}
            >
              <Plus className="h-3.5 w-3.5" />
              Add Slot
            </Button>
          </div>
        </div>

        {entries.length > 0 && (
          <div className="space-y-2">
            {entries.map((entry, slotIndex) => {
              const isBlocked = entry.isBlocked === true;
              const isLunch =
                !isBlocked && entry.startTime >= "11:00" && entry.startTime <= "14:00" && entry.endTime <= "15:00";
              return (
                <div
                  key={entry.id}
                  className={`flex items-center gap-2 p-3 rounded-md ${isBlocked ? "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800" : isLunch ? "bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800" : "bg-muted/50"}`}
                >
                  {isBlocked && <CalendarOff className="h-4 w-4 text-red-600" />}
                  {isLunch && <Utensils className="h-4 w-4 text-orange-600" />}
                  <Input
                    type="time"
                    value={entry.startTime}
                    onChange={(e) => updateAvailabilityEntry(dayIndex, slotIndex, { startTime: e.target.value })}
                    className="h-9"
                  />
                  <span className="text-sm text-muted-foreground">to</span>
                  <Input
                    type="time"
                    value={entry.endTime}
                    onChange={(e) => updateAvailabilityEntry(dayIndex, slotIndex, { endTime: e.target.value })}
                    className="h-9"
                  />
                  {!isBlocked && (
                    <div className="flex items-center gap-2 ml-2">
                      <Input
                        type="number"
                        min={5}
                        step={5}
                        value={entry.slotMinutes}
                        onChange={(e) =>
                          updateAvailabilityEntry(dayIndex, slotIndex, { slotMinutes: Number(e.target.value) || 0 })
                        }
                        className="h-9 w-20"
                        placeholder="Duration"
                      />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">min</span>
                    </div>
                  )}
                  {isBlocked && (
                    <Badge variant="secondary" className="text-xs ml-2">
                      Blocked
                    </Badge>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 ml-auto text-muted-foreground hover:text-destructive"
                    onClick={() => removeAvailabilityEntry(dayIndex, slotIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <ProviderPanelLayout>
      <div className="animate-fade-in space-y-6">
        {/* Header with Cover and Avatar */}
        <div className="relative">
          <button
            type="button"
            className="relative h-48 w-full overflow-hidden rounded-xl border bg-muted group cursor-pointer"
            onClick={() => coverInputRef.current?.click()}
          >
            {form.coverPhoto ? (
              <img
                src={form.coverPhoto}
                alt="Cover"
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center">
                <Camera className="h-12 w-12 text-muted-foreground/30" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-white">
                <Camera className="h-5 w-5" />
                <span className="text-sm font-medium">Change Cover</span>
              </div>
            </div>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "cover")}
            />
          </button>

          {/* Avatar */}
          <div className="absolute -bottom-12 left-6">
            <button
              type="button"
              className="h-24 w-24 rounded-xl border-4 border-background bg-muted overflow-hidden shadow-lg group/avatar cursor-pointer relative block"
              onClick={() => avatarInputRef.current?.click()}
            >
              {form.avatar ? (
                <img src={form.avatar} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <span className="text-2xl font-bold text-muted-foreground/60">{initials}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover/avatar:bg-black/30 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                  <Camera className="h-5 w-5 text-white" />
                </div>
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "avatar")}
              />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="pt-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{form.name || "Business Name"}</h1>
              <p className="text-sm text-muted-foreground">Manage your provider profile and settings</p>
            </div>
            <Button onClick={handleSave} disabled={slugTaken} className="gap-2">
              {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {saved ? "Saved!" : "Save Changes"}
            </Button>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
              <TabsTrigger value="profile" className="gap-2">
                <Store className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="schedule" className="gap-2">
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">Schedule</span>
              </TabsTrigger>
              <TabsTrigger value="gallery" className="gap-2">
                <ImageIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Gallery</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <form onSubmit={handleSave}>
                <Card>
                  <CardHeader>
                    <CardTitle>Business Information</CardTitle>
                    <CardDescription>Update your business details and contact information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="business-name">Business Name</Label>
                      <Input
                        id="business-name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Enter your business name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="slug" className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4" />
                        Custom URL Slug
                      </Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">mysite.com/</span>
                        <Input
                          id="slug"
                          value={form.slug}
                          onChange={(e) => setForm({ ...form, slug: e.target.value.replace(/[^a-zA-Z0-9_-]/g, "") })}
                          placeholder="your-business"
                          className="flex-1"
                          maxLength={50}
                        />
                      </div>
                      {slugTaken && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <X className="h-3 w-3" />
                          This slug is already taken.
                        </p>
                      )}
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Describe your business..."
                        className="min-h-[120px] resize-y"
                      />
                    </div>

                    <div className="space-y-2">
                      <CategoryMultiSelect
                        label="Categories"
                        placeholder="Select or propose categories"
                        options={categoryOptions}
                        value={selectedCategoryIds}
                        onChange={handleCategoriesChange}
                        onCreate={handleCreatePendingCategory}
                      />
                      <p className="text-xs text-muted-foreground">
                        Select at least one category. New categories require admin approval.
                      </p>
                      {categoryError && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {categoryError}
                        </p>
                      )}
                    </div>

                    <Separator />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Phone
                        </Label>
                        <Input
                          id="phone"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location" className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Location
                        </Label>
                        <Input
                          id="location"
                          value={form.location}
                          onChange={(e) => setForm({ ...form, location: e.target.value })}
                          placeholder="City, State"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </form>
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value="schedule">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Working Hours</CardTitle>
                        <CardDescription>Set your weekly availability and time off</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setScheduleDialogOpen(true)} className="gap-2">
                        <Pencil className="h-4 w-4" />
                        Edit Hours
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {scheduleSummary.map((item) => (
                        <div
                          key={`${item.label}-${item.value}`}
                          className="flex items-center justify-between py-2 border-b last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-2 w-2 rounded-full ${item.value === "Closed" ? "bg-muted-foreground/30" : "bg-green-500"}`}
                            />
                            <span className="text-sm font-medium">{item.label}</span>
                          </div>
                          <span
                            className={`text-sm ${item.value === "Closed" ? "text-muted-foreground" : "text-foreground"}`}
                          >
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {freeDays.length > 0 && freeDays.length < 7 && (
                      <div className="mt-4 p-3 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Days off:</span> {freeDays.join(", ")}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <CalendarOff className="h-5 w-5" />
                          Time Off
                        </CardTitle>
                        <CardDescription>Manage your upcoming time off</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Time Off Form */}
                      <div className="p-4 rounded-lg border bg-muted/30 space-y-4">
                        <h4 className="text-sm font-medium">Add Time Off</h4>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="timeoff-date">Date</Label>
                            <Input
                              id="timeoff-date"
                              type="date"
                              value={timeoffForm.date}
                              onChange={(e) => setTimeoffForm({ ...timeoffForm, date: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Switch
                                id="all-day"
                                checked={timeoffForm.allDay}
                                onCheckedChange={(checked) => setTimeoffForm({ ...timeoffForm, allDay: checked })}
                              />
                              <Label htmlFor="all-day">All day</Label>
                            </div>
                          </div>
                        </div>
                        {!timeoffForm.allDay && (
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="start-time">Start Time</Label>
                              <Input
                                id="start-time"
                                type="time"
                                value={timeoffForm.startTime}
                                onChange={(e) => setTimeoffForm({ ...timeoffForm, startTime: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="end-time">End Time</Label>
                              <Input
                                id="end-time"
                                type="time"
                                value={timeoffForm.endTime}
                                onChange={(e) => setTimeoffForm({ ...timeoffForm, endTime: e.target.value })}
                              />
                            </div>
                          </div>
                        )}
                        <div className="space-y-2">
                          <Label htmlFor="reason">Reason (optional)</Label>
                          <Input
                            id="reason"
                            value={timeoffForm.reason}
                            onChange={(e) => setTimeoffForm({ ...timeoffForm, reason: e.target.value })}
                            placeholder="e.g., Vacation, Holiday"
                          />
                        </div>
                        <Button onClick={handleAddTimeoff} className="w-full gap-2">
                          <Plus className="h-4 w-4" />
                          Add Time Off
                        </Button>
                      </div>

                      {/* Time Off List */}
                      {providerTimeoff.length > 0 ? (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-muted-foreground">Upcoming Time Off</h4>
                          {providerTimeoff
                            .map((timeoff) => ({
                              ...timeoff,
                              dateTime: new Date(`${timeoff.date}T${timeoff.startTime}`),
                            }))
                            .filter((entry) => !Number.isNaN(entry.dateTime.getTime()))
                            .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())
                            .map((timeoff) => {
                              const isAllDay = timeoff.startTime === "00:00" && timeoff.endTime === "23:59";
                              return (
                                <div
                                  key={timeoff.id}
                                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                      <CalendarOff className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">
                                        {format(new Date(`${timeoff.date}T00:00:00`), "EEEE, MMM d, yyyy")}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {isAllDay ? "All day" : `${timeoff.startTime} - ${timeoff.endTime}`}
                                        {timeoff.reason && ` • ${timeoff.reason}`}
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteTimeoff(timeoff.id)}
                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              );
                            })}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <CalendarOff className="h-10 w-10 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No time off scheduled</p>
                          <p className="text-xs text-muted-foreground/70 mt-1">Add dates when you'll be unavailable</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Gallery Tab */}
            <TabsContent value="gallery">
              <Card>
                <CardHeader>
                  <CardTitle>Photo Gallery</CardTitle>
                  <CardDescription>Showcase your business with up to 6 photos</CardDescription>
                </CardHeader>
                <CardContent>
                  {form.galleryPhotos.length > 0 && (
                    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 mb-6">
                      {form.galleryPhotos.map((url, i) => (
                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden border group">
                          <img
                            src={url}
                            alt={`Gallery ${i + 1}`}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(i)}
                            className="absolute top-2 right-2 h-7 w-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {form.galleryPhotos.length < 6 ? (
                    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
                      <ImageIcon className="h-12 w-12 text-muted-foreground/30 mb-3" />
                      <h3 className="text-sm font-medium mb-1">
                        {form.galleryPhotos.length === 0
                          ? "No photos yet"
                          : `Add ${6 - form.galleryPhotos.length} more photo${6 - form.galleryPhotos.length > 1 ? "s" : ""}`}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-4">Upload high-quality photos of your business</p>
                      <Button variant="outline" className="gap-2" onClick={() => galleryInputRef.current?.click()}>
                        <ImagePlus className="h-4 w-4" />
                        Upload Photos
                      </Button>
                      <input
                        ref={galleryInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => e.target.files && handleGalleryUpload(e.target.files)}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-4 rounded-lg bg-muted/50">
                      <Check className="h-5 w-5 text-green-600 mr-2" />
                      <p className="text-sm text-muted-foreground">Gallery is full (6/6 photos)</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Schedule Dialog */}
      <ScheduleDialog
        open={scheduleDialogOpen}
        onOpenChange={handleScheduleDialogOpenChange}
        availabilityByDay={availabilityByDay}
        onAvailabilityChange={(newAvailability) => setAvailabilityByDay(newAvailability)}
        providerId={currentProvider.id}
        onSave={saveSchedule}
      />
    </ProviderPanelLayout>
  );
};

export default ProviderProfilePage;
