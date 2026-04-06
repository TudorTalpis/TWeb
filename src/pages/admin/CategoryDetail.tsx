import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAppStore } from "@/store/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Package } from "lucide-react";
import { AdminPanelLayout } from "@/components/AdminPanelLayout";

const PANEL_CLASS = "rounded-2xl border border-border/60 bg-card p-6 shadow-card";

const AVAILABLE_ICONS = [
  "Wrench", "Scissors", "Hammer", "Brush", "Sparkles", "Home", 
  "Car", "Laptop", "Coffee", "ShoppingCart", "Heart", "Star",
  "Package", "Users", "Book", "Music", "Camera", "Zap"
];

const AVAILABLE_COLORS = [
  "blue", "green", "purple", "orange", "red", "pink", "yellow", "cyan"
];

const AdminCategoryDetail = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useAppStore();
  
  const category = state.categories.find((c) => c.id === categoryId);
  
  const [formData, setFormData] = useState({
    name: category?.name || "",
    description: category?.description || "",
    icon: category?.icon || "Package",
    color: category?.color || "blue"
  });

  if (!category) {
    return (
      <AdminPanelLayout>
        <div className="space-y-4">
          <Link to="/admin/categories">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </Link>
          <div className={PANEL_CLASS}>
            <p className="text-center text-sm text-muted-foreground">Category not found.</p>
          </div>
        </div>
      </AdminPanelLayout>
    );
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert("Name is required!");
      return;
    }

    dispatch({
      type: "UPDATE_CATEGORY",
      payload: {
        id: category.id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        icon: formData.icon,
        color: formData.color
      }
    });

    navigate("/admin/categories");
  };

  return (
    <AdminPanelLayout>
      <div className="animate-fade-in space-y-6">
        <Link to="/admin/categories">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Categories
          </Button>
        </Link>

        <section className="space-y-2">
          <h2 className="font-display text-2xl font-bold">Edit Category</h2>
          <p className="text-sm text-muted-foreground">Modify category details</p>
        </section>

        <section className={PANEL_CLASS}>
          <div className="space-y-4">
            {/* Preview */}
            <div className="rounded-2xl border border-border/60 bg-secondary/30 p-4">
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Preview</h4>
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-${formData.color}-500/10`}>
                  <Package className={`h-6 w-6 text-${formData.color}-500`} />
                </div>
                <div>
                  <h5 className="font-semibold">{formData.name || "Category Name"}</h5>
                  <p className="text-xs text-muted-foreground">{formData.description || "Category description"}</p>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div>
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Category name"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Category description"
                className="mt-1"
                rows={4}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Icon</label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  {AVAILABLE_ICONS.map(icon => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Color</label>
                <select
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  {AVAILABLE_COLORS.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} className="gap-2 rounded-xl">
                <Save className="h-4 w-4" /> Save Changes
              </Button>
              <Button onClick={() => navigate("/admin/categories")} variant="outline" className="rounded-xl">
                Cancel
              </Button>
            </div>
          </div>
        </section>
      </div>
    </AdminPanelLayout>
  );
};

export default AdminCategoryDetail;
