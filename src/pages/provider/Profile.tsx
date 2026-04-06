import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { CategoryMultiSelect } from "@/components/CategoryMultiSelect";
import { useAppStore } from "@/store/AppContext";
import { Check, Camera, ImagePlus, X, Link as LinkIcon, MapPin, Phone, Upload, Plus, Trash2 } from "lucide-react";
import { ProviderPanelLayout } from "@/components/ProviderPanelLayout";
import { fileToBase64 } from "@/lib/fileToBase64";
import { generateId } from "@/lib/storage";
import { findCategoryByName, normalizeCategory } from "@/lib/categories";
import type { Availability } from "@/types";

const PENDING_CATEGORY_PREFIX = "pending:";

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
  const { state, currentProvider, dispatch } = useAppStore();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: currentProvider?.name || "",
    slug: currentProvider?.slug || "",
    description: currentProvider?.description || "",
    categoryIds: currentProvider?.categoryIds || [] as string[],
    pendingCategoryNames: currentProvider?.pendingCategoryNames || [] as string[],
    phone: currentProvider?.phone || "",
    location: currentProvider?.location || "",
    avatar: currentProvider?.avatar || "",
    coverPhoto: currentProvider?.coverPhoto || "",
    galleryPhotos: currentProvider?.galleryPhotos || [] as string[],
  });
  const [categoryError, setCategoryError] = useState("");
  const [availabilityByDay, setAvailabilityByDay] = useState<Record<number, Availability[]>>(() =>
    currentProvider ? buildAvailabilityMap(state.availability, currentProvider.id) : emptyAvailabilityMap()
  );
  const [timeoffForm, setTimeoffForm] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    startTime: "09:00",
    endTime: "12:00",
    reason: "",
    allDay: false,
  });
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

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
  const categoryOptions = useMemo(() => [...state.categories, ...pendingCategoryOptions], [state.categories, pendingCategoryOptions]);
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

  const slugTaken = form.slug.trim().length > 0 &&
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

  const addAvailabilityEntry = (weekday: number) => {
    if (!currentProvider) return;
    const newEntry: Availability = {
      id: generateId(),
      providerId: currentProvider.id,
      weekday,
      startTime: "09:00",
      endTime: "17:00",
      slotMinutes: 30,
      bufferMinutes: 0,
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
    const nextAvailability = state.availability.filter((entry) => entry.providerId !== currentProvider.id).concat(updatedAvailability);
    dispatch({ type: "SET_AVAILABILITY", payload: nextAvailability });
  };

  const handleScheduleDialogOpenChange = (open: boolean) => {
    setScheduleDialogOpen(open);
    if (!open && currentProvider) {
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

    const existingPending = new Set((currentProvider.pendingCategoryNames ?? []).map((name) => normalizeCategory(name)));
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

    saveSchedule();
    setCategoryError("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const initials = currentProvider.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
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
        value: entries.length > 0
          ? entries.map((entry) => `${entry.startTime} - ${entry.endTime}`).join(", ")
          : "Closed",
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
      const label = index === end
        ? orderedDays[index].label
        : `${orderedDays[index].label}-${orderedDays[end].label}`;
      groups.push({ label, value });
      index = end + 1;
    }
    return groups;
  })();
  const upcomingTimeoff = providerTimeoff
    .map((timeoff) => ({
      ...timeoff,
      dateTime: new Date(`${timeoff.date}T${timeoff.startTime}`),
    }))
    .filter((entry) => !Number.isNaN(entry.dateTime.getTime()))
    .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())
    .slice(0, 3);

  return (
      <ProviderPanelLayout>
        <div className="animate-fade-in max-w-6xl space-y-6">
          {/* Cover Photo Preview */}
          <div className="relative rounded-2xl overflow-hidden border h-40 bg-secondary group cursor-pointer"
               onClick={() => coverInputRef.current?.click()}
          >
            {form.coverPhoto ? (
                <img src={form.coverPhoto} alt="Cover" className="h-full w-full object-cover" />
            ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground/30">
                  <Camera className="h-10 w-10" />
                </div>
            )}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Upload className="h-6 w-6 text-white" />
            </div>
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden"
                   onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "cover")}
            />
            {/* Avatar overlay */}
            <div className="absolute -bottom-8 left-6" onClick={(e) => e.stopPropagation()}>
              <div className="h-20 w-20 rounded-2xl border-4 border-background overflow-hidden bg-card shadow-elevated flex items-center justify-center group/avatar cursor-pointer relative"
                   onClick={() => avatarInputRef.current?.click()}
              >
                {form.avatar ? (
                    <img src={form.avatar} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                    <span className="text-xl font-bold text-muted-foreground/40">{initials}</span>
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload className="h-4 w-4 text-white" />
                </div>
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden"
                       onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "avatar")}
                />
              </div>
            </div>
          </div>

          <div className="pt-10">
            <form onSubmit={handleSave} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-6">
                <div className="rounded-2xl border bg-card p-6 shadow-card space-y-4">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Profile Details</h2>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Business Name</label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                    <LinkIcon className="h-3.5 w-3.5" /> Custom URL Slug
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">mysite.com/</span>
                    <Input
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value.replace(/[^a-zA-Z0-9_-]/g, "") })}
                        className="rounded-xl" maxLength={50}
                    />
                  </div>
                  {slugTaken && <p className="text-xs text-destructive mt-1">This slug is already taken.</p>}
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Description</label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl min-h-[100px]" />
                </div>
                <div>
                  <CategoryMultiSelect
                    label="Categories *"
                    placeholder="Select or propose categories"
                    options={categoryOptions}
                    value={selectedCategoryIds}
                    onChange={handleCategoriesChange}
                    onCreate={handleCreatePendingCategory}
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    New categories stay local until approved by admin.
                  </p>
                  {categoryError && <p className="mt-2 text-xs text-destructive">{categoryError}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Phone</label>
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-xl" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Location</label>
                    <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="rounded-xl" />
                  </div>
                </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl border bg-card p-4 shadow-card space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Working Hours</h2>
                      <p className="text-xs text-muted-foreground">Weekly summary</p>
                    </div>
                    <Button type="button" variant="outline" size="sm" className="h-8 rounded-lg px-3 text-xs" onClick={() => setScheduleDialogOpen(true)}>
                      Edit schedule
                    </Button>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {scheduleSummary.map((item) => (
                      <div key={`${item.label}-${item.value}`} className="flex items-center justify-between gap-2">
                        <span className="font-medium text-foreground">{item.label}</span>
                        <span className="text-muted-foreground">{item.value}</span>
                      </div>
                    ))}
                  </div>
                  {upcomingTimeoff.length > 0 && (
                    <div className="rounded-xl border bg-background/40 px-3 py-2 text-[10px] text-muted-foreground space-y-1">
                      <p className="font-semibold uppercase tracking-wide text-[10px]">Upcoming time off</p>
                      {upcomingTimeoff.map((timeoff) => {
                        const isAllDay = timeoff.startTime === "00:00" && timeoff.endTime === "23:59";
                        return (
                          <div key={timeoff.id} className="flex items-center justify-between gap-2">
                            <span>{format(new Date(`${timeoff.date}T00:00:00`), "EEE, MMM d")}</span>
                            <span>{isAllDay ? "All day" : `${timeoff.startTime} - ${timeoff.endTime}`}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border bg-card p-6 shadow-card space-y-4">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Gallery ({form.galleryPhotos.length}/6)</h2>
                  <div className="grid grid-cols-2 gap-2">
                    {form.galleryPhotos.map((url, i) => (
                      <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden border group">
                        <img src={url} alt={`Gallery ${i + 1}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(i)}
                          className="absolute top-1 right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  {form.galleryPhotos.length < 6 && (
                    <>
                      <Button type="button" variant="outline" size="sm" className="rounded-xl gap-1.5" onClick={() => galleryInputRef.current?.click()}>
                        <ImagePlus className="h-4 w-4" /> Upload Photos
                      </Button>
                      <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden"
                             onChange={(e) => e.target.files && handleGalleryUpload(e.target.files)}
                      />
                    </>
                  )}
                </div>

                <Button type="submit" className="rounded-xl bg-primary text-primary-foreground gap-2 h-11 w-full" disabled={slugTaken}>
                  {saved && <Check className="h-4 w-4" />} {saved ? "Saved!" : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>

        <Dialog open={scheduleDialogOpen} onOpenChange={handleScheduleDialogOpenChange}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Working hours & time off</DialogTitle>
            </DialogHeader>
            <div className="max-h-[70vh] space-y-6 overflow-y-auto pr-1">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Weekly schedule</h3>
                {weekdayLabels.map((label, index) => {
                  const entries = availabilityByDay[index] ?? [];
                  return (
                    <div key={label} className="rounded-xl border bg-background/40 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
                        <Button type="button" variant="outline" size="sm" className="h-7 gap-1 px-2 text-[10px]" onClick={() => addAvailabilityEntry(index)}>
                          <Plus className="h-3 w-3" /> Add slot
                        </Button>
                      </div>
                      <div className="mt-3 space-y-2">
                        {entries.length === 0 ? (
                          <p className="text-xs text-muted-foreground">Closed</p>
                        ) : (
                          entries.map((entry, slotIndex) => (
                            <div key={entry.id} className="rounded-lg border bg-card/70 p-2">
                              <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                                <Input
                                  type="time"
                                  value={entry.startTime}
                                  onChange={(e) => updateAvailabilityEntry(index, slotIndex, { startTime: e.target.value })}
                                  className="h-8 rounded-lg text-xs"
                                />
                                <Input
                                  type="time"
                                  value={entry.endTime}
                                  onChange={(e) => updateAvailabilityEntry(index, slotIndex, { endTime: e.target.value })}
                                  className="h-8 rounded-lg text-xs"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                  onClick={() => removeAvailabilityEntry(index, slotIndex)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                                <Input
                                  type="number"
                                  min={5}
                                  step={5}
                                  value={entry.slotMinutes}
                                  onChange={(e) => updateAvailabilityEntry(index, slotIndex, { slotMinutes: Number(e.target.value) || 0 })}
                                  className="h-8 rounded-lg text-xs"
                                  placeholder="Slot (min)"
                                />
                                <Input
                                  type="number"
                                  min={0}
                                  step={5}
                                  value={entry.bufferMinutes}
                                  onChange={(e) => updateAvailabilityEntry(index, slotIndex, { bufferMinutes: Number(e.target.value) || 0 })}
                                  className="h-8 rounded-lg text-xs"
                                  placeholder="Buffer (min)"
                                />
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-xl border bg-background/40 p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Custom days off</p>
                  <div className="flex flex-wrap gap-2">
                    {freeDays.map((day) => (
                      <span key={day} className="rounded-full border border-border/70 bg-background px-2.5 py-1 text-[10px] text-muted-foreground">
                        {day}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                  <Input
                    type="date"
                    value={timeoffForm.date}
                    onChange={(e) => setTimeoffForm((prev) => ({ ...prev, date: e.target.value }))}
                    className="h-8 rounded-lg text-xs"
                  />
                  <div className="flex items-center gap-2 rounded-lg border bg-card/70 px-2 py-1 text-xs">
                    <Switch
                      checked={timeoffForm.allDay}
                      onCheckedChange={(checked) =>
                        setTimeoffForm((prev) => ({
                          ...prev,
                          allDay: checked,
                          startTime: checked ? "00:00" : (prev.startTime === "00:00" ? "09:00" : prev.startTime),
                          endTime: checked ? "23:59" : (prev.endTime === "23:59" ? "12:00" : prev.endTime),
                        }))
                      }
                    />
                    <span className="text-muted-foreground">All day</span>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    type="time"
                    value={timeoffForm.startTime}
                    onChange={(e) => setTimeoffForm((prev) => ({ ...prev, startTime: e.target.value }))}
                    className="h-8 rounded-lg text-xs"
                    disabled={timeoffForm.allDay}
                  />
                  <Input
                    type="time"
                    value={timeoffForm.endTime}
                    onChange={(e) => setTimeoffForm((prev) => ({ ...prev, endTime: e.target.value }))}
                    className="h-8 rounded-lg text-xs"
                    disabled={timeoffForm.allDay}
                  />
                </div>
                <Input
                  value={timeoffForm.reason}
                  onChange={(e) => setTimeoffForm((prev) => ({ ...prev, reason: e.target.value }))}
                  className="h-8 rounded-lg text-xs"
                  placeholder="Reason (optional)"
                />
                <Button type="button" variant="outline" size="sm" className="h-8 gap-1 text-xs" onClick={handleAddTimeoff}>
                  <Plus className="h-3 w-3" /> Add time off
                </Button>

                <div className="space-y-2 text-xs">
                  {providerTimeoff.length === 0 ? (
                    <p className="text-muted-foreground">No time off scheduled.</p>
                  ) : (
                    providerTimeoff.map((timeoff) => {
                      const isAllDay = timeoff.startTime === "00:00" && timeoff.endTime === "23:59";
                      return (
                        <div key={timeoff.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card/70 px-2.5 py-2">
                          <div>
                            <p className="font-medium text-foreground">
                              {format(new Date(`${timeoff.date}T00:00:00`), "EEE, MMM d")}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{isAllDay ? "All day" : `${timeoff.startTime} - ${timeoff.endTime}`}</p>
                            {timeoff.reason && <p className="text-[10px] text-muted-foreground">{timeoff.reason}</p>}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteTimeoff(timeoff.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
            <DialogFooter className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">Schedule changes are saved when you click Save schedule.</p>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={() => handleScheduleDialogOpenChange(false)}>
                  Close
                </Button>
                <Button type="button" onClick={() => { saveSchedule(); handleScheduleDialogOpenChange(false); }}>
                  Save schedule
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </ProviderPanelLayout>
  );
};

export default ProviderProfilePage;


