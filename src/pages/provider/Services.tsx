import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAppStore } from "@/store/AppContext";
import { generateId } from "@/lib/storage";
import { getEffectiveServiceBufferMinutes, getProviderDefaultBufferMinutes } from "@/lib/services";
import { Plus, Pencil, Trash2, X, DollarSign, Clock } from "lucide-react";
import type { Service } from "@/types";
import { ProviderPanelLayout } from "@/components/ProviderPanelLayout";

interface ServiceFormState {
  title: string;
  description: string;
  price: string;
  duration: string;
  customBuffer: string;
}

function getInitialFormState(): ServiceFormState {
  return {
    title: "",
    description: "",
    price: "",
    duration: "",
    customBuffer: "",
  };
}

function parseOptionalBuffer(value: string): number | null | "INVALID" {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) return "INVALID";
  return Math.max(0, parsed);
}

const ProviderServices = () => {
  const { state, dispatch, currentProvider } = useAppStore();
  const [editing, setEditing] = useState<Service | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<ServiceFormState>(getInitialFormState());
  const [formError, setFormError] = useState("");
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [settingsError, setSettingsError] = useState("");
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    autoConfirm: currentProvider?.autoConfirm ?? false,
    defaultBufferMinutes: String(getProviderDefaultBufferMinutes(currentProvider)),
  });

  useEffect(() => {
    if (!currentProvider) return;
    setSettingsForm({
      autoConfirm: currentProvider.autoConfirm,
      defaultBufferMinutes: String(getProviderDefaultBufferMinutes(currentProvider)),
    });
    setSettingsError("");
  }, [
    currentProvider,
    currentProvider?.id,
    currentProvider?.autoConfirm,
    currentProvider?.defaultServiceBufferMinutes,
  ]);

  const providerId = currentProvider?.id ?? "";
  const providerDefaultBuffer = getProviderDefaultBufferMinutes(currentProvider);
  const services = useMemo(
    () => state.services.filter((service) => service.providerId === providerId),
    [state.services, providerId],
  );
  const serviceRows = useMemo(
    () =>
      services.map((service) => ({
        service,
        effectiveBuffer: getEffectiveServiceBufferMinutes(service, currentProvider),
        usesDefaultBuffer: service.bufferMinutes === null || service.bufferMinutes === undefined,
      })),
    [services, currentProvider],
  );

  if (!currentProvider) return null;

  const resetForm = () => {
    setForm(getInitialFormState());
    setFormError("");
    setEditing(null);
    setAdding(false);
  };

  const handleSave = () => {
    if (!currentProvider) return;
    if (!form.title.trim() || !form.price || !form.duration) {
      setFormError("Title, price, and duration are required.");
      return;
    }

    const parsedPrice = Number(form.price);
    const parsedDuration = Number(form.duration);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setFormError("Price must be 0 or higher.");
      return;
    }
    if (!Number.isFinite(parsedDuration) || parsedDuration < 5) {
      setFormError("Duration must be at least 5 minutes.");
      return;
    }

    const parsedCustomBuffer = parseOptionalBuffer(form.customBuffer);
    if (parsedCustomBuffer === "INVALID") {
      setFormError("Custom buffer must be 0 or higher.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      price: parsedPrice,
      duration: parsedDuration,
      bufferMinutes: parsedCustomBuffer,
    };

    if (editing) {
      dispatch({ type: "UPDATE_SERVICE", payload: { id: editing.id, ...payload } });
    } else {
      const primaryCategoryId = currentProvider.categoryIds[0] ?? "";
      if (!primaryCategoryId) {
        setFormError("At least one approved category is required before adding services.");
        return;
      }
      dispatch({
        type: "ADD_SERVICE",
        payload: {
          id: generateId(),
          providerId: currentProvider.id,
          categoryId: primaryCategoryId,
          ...payload,
        },
      });
    }

    resetForm();
  };

  const startEdit = (service: Service) => {
    setEditing(service);
    setAdding(true);
    setFormError("");
    setForm({
      title: service.title,
      description: service.description,
      price: String(service.price),
      duration: String(service.duration),
      customBuffer:
        service.bufferMinutes === null || service.bufferMinutes === undefined ? "" : String(service.bufferMinutes),
    });
  };

  const handleSaveSettings = () => {
    if (!currentProvider) return;
    const parsedDefaultBuffer = Number(settingsForm.defaultBufferMinutes);
    if (!Number.isFinite(parsedDefaultBuffer) || parsedDefaultBuffer < 0) {
      setSettingsError("Default buffer must be 0 or higher.");
      return;
    }

    dispatch({
      type: "UPDATE_PROVIDER_PROFILE",
      payload: {
        id: currentProvider.id,
        autoConfirm: settingsForm.autoConfirm,
        defaultServiceBufferMinutes: Math.max(0, parsedDefaultBuffer),
      },
    });

    setSettingsSaved(true);
    setSettingsError("");
    setTimeout(() => setSettingsSaved(false), 1500);
  };

  return (
    <ProviderPanelLayout>
      <div className="animate-fade-in grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,1fr)]">
        <section className="overflow-hidden rounded-3xl border border-border/60 bg-card/95 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-secondary/20 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {services.length} Service{services.length !== 1 ? "s" : ""}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Add custom buffers per service or leave empty to use default settings.
              </p>
            </div>
            {!adding && (
              <Button size="sm" onClick={() => setAdding(true)} className="h-9 gap-1.5 rounded-full px-4 text-xs">
                <Plus className="h-3.5 w-3.5" /> Add Service
              </Button>
            )}
          </div>

          <div className="space-y-4 p-5">
            {adding && (
              <div className="animate-fade-in rounded-2xl border border-border/60 bg-background/60 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{editing ? "Edit Service" : "New Service"}</h3>
                  <button
                    aria-label="Close service form"
                    onClick={resetForm}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  <Input
                    placeholder="Service title"
                    value={form.title}
                    onChange={(event) => setForm({ ...form, title: event.target.value })}
                    className="rounded-xl focus:ring-2 focus:ring-primary/20"
                  />
                  <Textarea
                    placeholder="Description"
                    value={form.description}
                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                    className="rounded-xl focus:ring-2 focus:ring-primary/20"
                  />

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1">
                      <label htmlFor="service-price" className="block text-xs text-muted-foreground">
                        Price ($)
                      </label>
                      <Input
                        id="service-price"
                        type="number"
                        min={0}
                        value={form.price}
                        onChange={(event) => setForm({ ...form, price: event.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="service-duration" className="block text-xs text-muted-foreground">
                        Duration (min)
                      </label>
                      <Input
                        id="service-duration"
                        type="number"
                        min={5}
                        step={5}
                        value={form.duration}
                        onChange={(event) => setForm({ ...form, duration: event.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="service-buffer" className="block text-xs text-muted-foreground">
                        Custom Buffer (min)
                      </label>
                      <Input
                        id="service-buffer"
                        type="number"
                        min={0}
                        step={5}
                        value={form.customBuffer}
                        onChange={(event) => setForm({ ...form, customBuffer: event.target.value })}
                        placeholder={`${providerDefaultBuffer} default`}
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground">
                    Empty custom buffer means this service uses your default buffer.
                  </p>
                  {formError && <p className="text-xs text-destructive">{formError}</p>}

                  <Button onClick={handleSave} className="h-9 rounded-xl bg-primary text-xs text-primary-foreground">
                    {editing ? "Update Service" : "Add Service"}
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {serviceRows.map(({ service, effectiveBuffer, usesDefaultBuffer }) => (
                <div
                  key={service.id}
                  className="group flex items-center justify-between rounded-2xl border border-border/60 bg-background/55 p-4 transition-all duration-200 hover:shadow-card"
                >
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold">{service.title}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {service.price}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {service.duration} min + {effectiveBuffer} min buffer (
                        {usesDefaultBuffer ? "default" : "custom"})
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                    <Button
                      aria-label={`Edit ${service.title}`}
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(service)}
                      className="h-8 w-8 rounded-lg p-0"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      aria-label={`Delete ${service.title}`}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 rounded-lg p-0 text-destructive"
                      onClick={() => setServiceToDelete(service)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              {services.length === 0 && !adding && (
                <div className="rounded-2xl border border-dashed bg-secondary/20 p-8 text-center">
                  <p className="text-sm text-muted-foreground">No services yet. Add your first service above.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <aside className="h-fit rounded-3xl border border-border/60 bg-card/95 p-5 shadow-card xl:sticky xl:top-24">
          <h3 className="text-sm font-semibold">Service Settings</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Configure defaults used by services and booking behavior.
          </p>

          <div className="mt-4 space-y-4">
            <div className="space-y-2 rounded-2xl border border-border/60 bg-background/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Auto Confirm</p>
                  <p className="text-xs text-muted-foreground">Automatically confirm incoming bookings.</p>
                </div>
                <Switch
                  checked={settingsForm.autoConfirm}
                  onCheckedChange={(checked) => setSettingsForm((prev) => ({ ...prev, autoConfirm: checked }))}
                />
              </div>
            </div>

            <div className="space-y-2 rounded-2xl border border-border/60 bg-background/60 p-4">
              <label htmlFor="default-buffer" className="block text-sm font-medium">
                Default Buffer (min)
              </label>
              <Input
                id="default-buffer"
                type="number"
                min={0}
                step={5}
                value={settingsForm.defaultBufferMinutes}
                onChange={(event) => setSettingsForm((prev) => ({ ...prev, defaultBufferMinutes: event.target.value }))}
                className="rounded-xl"
              />
              <p className="text-[11px] text-muted-foreground">Applied when a service has no custom buffer value.</p>
            </div>

            {settingsError && <p className="text-xs text-destructive">{settingsError}</p>}
            {settingsSaved && <p className="text-xs text-success">Settings saved.</p>}

            <Button onClick={handleSaveSettings} className="h-9 w-full rounded-xl text-xs">
              Save Settings
            </Button>
          </div>
        </aside>
      </div>

      <AlertDialog open={Boolean(serviceToDelete)} onOpenChange={(open) => !open && setServiceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete service?</AlertDialogTitle>
            <AlertDialogDescription>
              This action removes the service permanently from your provider profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (!serviceToDelete) return;
                dispatch({ type: "DELETE_SERVICE", payload: serviceToDelete.id });
                setServiceToDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ProviderPanelLayout>
  );
};

export default ProviderServices;
