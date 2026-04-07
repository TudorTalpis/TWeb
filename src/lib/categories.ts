import type { Category } from "@/types";
import { generateId } from "@/lib/storage";

const CATEGORY_COLOR_TOKENS = ["primary", "accent", "info", "success", "warning", "destructive"];
const DEFAULT_CATEGORY_ICON = "Sparkles";
const DEFAULT_CATEGORY_DESCRIPTION = "Custom category";

export function normalizeCategory(value: string) {
  return value.trim().toLowerCase();
}

export function findCategoryByName(categories: Category[], name: string) {
  const normalized = normalizeCategory(name);
  return categories.find((category) => normalizeCategory(category.name) === normalized) ?? null;
}

export function createCategoryFromName(name: string, categories: Category[]): Category {
  const trimmed = name.trim();
  const color = CATEGORY_COLOR_TOKENS[categories.length % CATEGORY_COLOR_TOKENS.length];
  return {
    id: generateId(),
    name: trimmed,
    icon: DEFAULT_CATEGORY_ICON,
    description: DEFAULT_CATEGORY_DESCRIPTION,
    color,
  };
}

export function getCategoryName(categories: Category[], id: string) {
  return categories.find((category) => category.id === id)?.name ?? id;
}

export function getCategoryNames(categories: Category[], ids: string[]) {
  return ids.map((id) => getCategoryName(categories, id)).filter(Boolean);
}
