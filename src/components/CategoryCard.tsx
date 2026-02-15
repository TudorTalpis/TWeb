import { Link } from "react-router-dom";
import { Sparkles, Dumbbell, Camera, BookOpen, Heart, Wrench } from "lucide-react";
import type { Category } from "@/types";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles, Dumbbell, Camera, BookOpen, Heart, Wrench,
};

export function CategoryCard({ category }: { category: Category }) {
  const Icon = iconMap[category.icon] || Sparkles;
  return (
    <Link
      to={`/categories?cat=${category.id}`}
      className="group flex flex-col items-center gap-3 rounded-2xl border bg-card p-5 shadow-card transition-all duration-200 hover:shadow-elevated hover:-translate-y-0.5"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/8 text-primary transition-all duration-200 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110">
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-card-foreground text-sm">{category.name}</h3>
        <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">{category.description}</p>
      </div>
    </Link>
  );
}
