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
          className="group flex flex-col items-center gap-3 rounded-2xl border border-border/60 bg-card p-5 shadow-card card-hover relative overflow-hidden"
      >
        {/* Subtle glow background on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl" />

        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-border/60 bg-secondary text-muted-foreground transition-all duration-300 group-hover:gradient-primary group-hover:border-transparent group-hover:text-white group-hover:shadow-glow group-hover:scale-110">
          <Icon className="h-5 w-5" />
        </div>
        <div className="relative text-center">
          <h3 className="font-display font-semibold text-card-foreground text-sm group-hover:text-primary transition-colors duration-200">{category.name}</h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">{category.description}</p>
        </div>
      </Link>
  );
}
