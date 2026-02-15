import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/store/AppContext";
import { generateId } from "@/lib/storage";
import { Plus, Pencil, Trash2, X, DollarSign, Clock } from "lucide-react";
import type { Service } from "@/types";
import { ProviderPanelLayout } from "@/components/ProviderPanelLayout";

const ProviderServices = () => {
  const { state, dispatch, currentProvider } = useAppStore();
  const [editing, setEditing] = useState<Service | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", price: "", duration: "" });

  if (!currentProvider) return null;
  const services = state.services.filter((s) => s.providerId === currentProvider.id);

  const resetForm = () => { setForm({ title: "", description: "", price: "", duration: "" }); setEditing(null); setAdding(false); };

  const handleSave = () => {
    if (!form.title || !form.price || !form.duration) return;
    if (editing) {
      dispatch({ type: "UPDATE_SERVICE", payload: { id: editing.id, title: form.title, description: form.description, price: Number(form.price), duration: Number(form.duration) } });
    } else {
      dispatch({
        type: "ADD_SERVICE",
        payload: { id: generateId(), providerId: currentProvider.id, title: form.title, description: form.description, price: Number(form.price), duration: Number(form.duration), categoryId: currentProvider.categoryId },
      });
    }
    resetForm();
  };

  const startEdit = (s: Service) => {
    setEditing(s);
    setAdding(true);
    setForm({ title: s.title, description: s.description, price: String(s.price), duration: String(s.duration) });
  };

  return (
    <ProviderPanelLayout>
      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{services.length} Service{services.length !== 1 ? "s" : ""}</h2>
          {!adding && (
            <Button size="sm" onClick={() => setAdding(true)} className="gap-1.5 rounded-full h-8 px-4 text-xs">
              <Plus className="h-3.5 w-3.5" /> Add Service
            </Button>
          )}
        </div>

        {adding && (
          <div className="rounded-2xl border bg-card p-5 shadow-card mb-5 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">{editing ? "Edit Service" : "New Service"}</h3>
              <button onClick={resetForm} className="text-muted-foreground hover:text-foreground transition-colors"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <Input placeholder="Service title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-xl focus:ring-2 focus:ring-primary/20" />
              <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl focus:ring-2 focus:ring-primary/20" />
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Price ($)</label>
                  <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="rounded-xl" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Duration (min)</label>
                  <Input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="rounded-xl" />
                </div>
              </div>
              <Button onClick={handleSave} className="rounded-xl gradient-primary text-primary-foreground h-9 text-xs">{editing ? "Update Service" : "Add Service"}</Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {services.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-2xl border bg-card p-4 shadow-card transition-all duration-200 hover:shadow-elevated group">
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{s.title}</h3>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{s.price}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{s.duration} min</span>
                </div>
              </div>
              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" onClick={() => startEdit(s)} className="h-8 w-8 p-0 rounded-lg"><Pencil className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-destructive" onClick={() => dispatch({ type: "DELETE_SERVICE", payload: s.id })}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          ))}
          {services.length === 0 && !adding && (
            <div className="rounded-2xl border border-dashed bg-secondary/30 p-8 text-center">
              <p className="text-muted-foreground text-sm">No services yet. Add your first service above.</p>
            </div>
          )}
        </div>
      </div>
    </ProviderPanelLayout>
  );
};

export default ProviderServices;
