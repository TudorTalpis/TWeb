import { Link } from "react-router-dom";
import { Sparkles, Dumbbell, Camera, BookOpen, Heart, Wrench } from "lucide-react";
import type { Category } from "@/types";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  Dumbbell,
  Camera,
  BookOpen,
  Heart,
  Wrench,
};

export function CategoryCard({ category }: { category: Category }) {
  const Icon = iconMap[category.icon] || Sparkles;
  return (
    <Link
      to={`/categories?cat=${category.id}`}
      className="group flex min-h-[10.5rem] flex-col items-center gap-3 rounded-2xl border border-border/60 bg-card p-6 shadow-card card-hover relative overflow-hidden"
    >
      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-border/60 bg-secondary text-muted-foreground transition-all duration-300 group-hover:border-primary/50 group-hover:bg-primary/10 group-hover:text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <div className="relative text-center">
        <h3 className="font-display font-semibold text-card-foreground text-sm leading-snug group-hover:text-primary transition-colors duration-200">
          {category.name}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-3">{category.description}</p>
      </div>
    </Link>
  );
}
