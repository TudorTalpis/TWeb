import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppStore } from "@/store/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Package, Search } from "lucide-react";
import { AdminPanelLayout } from "@/components/AdminPanelLayout";
import { generateId } from "@/lib/storage";
import { normalizeCategory } from "@/lib/categories";
import type { Category } from "@/types";

const PANEL_CLASS = "rounded-2xl border border-border/60 bg-card p-6 shadow-card";

const AVAILABLE_ICONS = [
  "Wrench", "Scissors", "Hammer", "Brush", "Sparkles", "Home", 
  "Car", "Laptop", "Coffee", "ShoppingCart", "Heart", "Star",
  "Package", "Users", "Book", "Music", "Camera", "Zap"
];

const AVAILABLE_COLORS = [
  "blue", "green", "purple", "orange", "red", "pink", "yellow", "cyan"
];

const AdminCategories = () => {
  const { state, dispatch } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: "",
    description: "",
    icon: "Package",
    color: "blue"
  });

  const filteredCategories = state.categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    if (!newCategory.name?.trim()) return;
    
    const normalized = normalizeCategory(newCategory.name);
    const exists = state.categories.some(cat => normalizeCategory(cat.name) === normalized);
    
    if (exists) {
      alert("O categorie cu acest nume există deja!");
      return;
    }

    const category: Category = {
      id: generateId(),
      name: newCategory.name.trim(),
      description: newCategory.description?.trim() || "",
      icon: newCategory.icon || "Package",
      color: newCategory.color || "blue"
    };

    dispatch({ type: "ADD_CATEGORY", payload: category });
    setNewCategory({ name: "", description: "", icon: "Package", color: "blue" });
    setShowCreateForm(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Sigur vrei să ștergi categoria "${name}"?`)) {
      dispatch({ type: "DELETE_CATEGORY", payload: id });
    }
  };

  return (
    <AdminPanelLayout>
      <div className="animate-fade-in space-y-6">
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold">Categories</h2>
              <p className="text-sm text-muted-foreground">Manage service categories</p>
            </div>
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="gap-2 rounded-xl bg-primary text-white"
            >
              <Plus className="h-4 w-4" /> Add Category
            </Button>
          </div>
        </section>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <section className={PANEL_CLASS}>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Create New Category</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={newCategory.name || ""}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="Category name"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newCategory.description || ""}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  placeholder="Category description"
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Icon</label>
                <select
                  value={newCategory.icon || "Package"}
                  onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
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
                  value={newCategory.color || "blue"}
                  onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  {AVAILABLE_COLORS.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreate} className="gap-2 rounded-xl">
                  <Plus className="h-4 w-4" /> Create
                </Button>
                <Button onClick={() => setShowCreateForm(false)} variant="outline" className="rounded-xl">
                  Cancel
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Categories List */}
        <section className={PANEL_CLASS}>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            All Categories ({filteredCategories.length})
          </h3>

          {filteredCategories.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-secondary/30 p-8 text-center">
              <p className="text-sm text-muted-foreground">No categories found.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="rounded-2xl border border-border/60 bg-background/40 p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-${category.color}-500/10`}>
                        <Package className={`h-5 w-5 text-${category.color}-500`} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold">{category.name}</h4>
                        <Badge variant="outline" className="mt-1 text-[10px]">
                          {category.color}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                    {category.description}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Link to={`/admin/categories/${category.id}`}>
                      <Button size="sm" variant="outline" className="h-8 gap-1 rounded-full px-3 text-xs">
                        <Edit2 className="h-3 w-3" /> Edit
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(category.id, category.name)}
                      className="h-8 gap-1 rounded-full px-3 text-xs text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AdminPanelLayout>
  );
};

export default AdminCategories;
