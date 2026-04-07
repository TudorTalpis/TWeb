import { useId, useMemo, useState } from "react";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import type { Category } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { normalizeCategory } from "@/lib/categories";

interface CategoryMultiSelectProps {
  label?: string;
  placeholder?: string;
  options: Category[];
  suggestions?: Category[];
  value: string[];
  onChange: (next: string[]) => void;
  onCreate?: (name: string) => string | null | undefined;
  getOptionMeta?: (option: Category) => string | number | null;
  disabled?: boolean;
}

export function CategoryMultiSelect({
  label,
  placeholder = "Select categories...",
  options,
  suggestions,
  value,
  onChange,
  onCreate,
  getOptionMeta,
  disabled = false,
}: CategoryMultiSelectProps) {
  const fieldId = useId();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const optionMap = useMemo(() => new Map(options.map((option) => [option.id, option])), [options]);
  const selectedOptions = useMemo(
    () => value.map((id) => optionMap.get(id) ?? ({ id, name: id } as Category)),
    [optionMap, value],
  );

  const normalizedSearch = normalizeCategory(search);
  const searchActive = normalizedSearch.length > 0;
  const baseOptions = searchActive ? options : (suggestions ?? options);
  const filteredOptions = searchActive
    ? baseOptions.filter((option) => normalizeCategory(option.name).includes(normalizedSearch))
    : baseOptions;
  const exactMatch = normalizedSearch
    ? options.find((option) => normalizeCategory(option.name) === normalizedSearch)
    : null;
  const canCreate = Boolean(onCreate) && normalizedSearch.length > 0 && !exactMatch;

  const toggleValue = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((item) => item !== id));
    } else {
      onChange([...value, id]);
    }
  };

  const handleCreate = () => {
    const trimmed = search.trim();
    if (!trimmed || !onCreate) return;
    const existing = exactMatch ?? null;
    const createdId = existing ? existing.id : onCreate(trimmed);
    if (createdId && !value.includes(createdId)) {
      onChange([...value, createdId]);
    }
    setSearch("");
  };

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium">{label}</p>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div
            id={fieldId}
            role="combobox"
            aria-expanded={open}
            aria-controls={`${fieldId}-listbox`}
            aria-disabled={disabled}
            tabIndex={disabled ? -1 : 0}
            onKeyDown={(event) => {
              if (disabled) return;
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setOpen((prev) => !prev);
              }
            }}
            className={cn(
              "flex min-h-10 w-full items-center justify-between gap-2 rounded-xl border border-border/60 bg-background px-3 py-2 text-left text-sm",
              disabled && "cursor-not-allowed opacity-60",
            )}
          >
            <div className="flex flex-1 flex-wrap gap-1">
              {selectedOptions.length > 0 ? (
                selectedOptions.map((option) => (
                  <Badge key={option.id} variant="secondary" className="gap-1">
                    {option.name}
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label={`Remove ${option.name}`}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                      onKeyDown={(event) => {
                        if (event.key !== "Enter" && event.key !== " ") return;
                        event.preventDefault();
                        event.stopPropagation();
                        toggleValue(option.id);
                      }}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        toggleValue(option.id);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </span>
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </PopoverTrigger>
        <PopoverContent id={`${fieldId}-listbox`} align="start" className="w-[--radix-popover-trigger-width] p-0">
          <Command shouldFilter={false}>
            <CommandInput placeholder="Type to search..." value={search} onValueChange={setSearch} />
            <CommandList>
              {filteredOptions.length === 0 && !canCreate && <CommandEmpty>No categories found.</CommandEmpty>}
              <CommandGroup>
                {filteredOptions.map((option) => {
                  const selected = value.includes(option.id);
                  const meta = getOptionMeta ? getOptionMeta(option) : null;
                  return (
                    <CommandItem key={option.id} value={option.name} onSelect={() => toggleValue(option.id)}>
                      <Check className={cn("mr-2 h-4 w-4", selected ? "opacity-100" : "opacity-0")} />
                      <span className="flex-1">{option.name}</span>
                      {meta !== null && meta !== undefined && (
                        <span className="text-xs text-muted-foreground">{meta}</span>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              {canCreate && (
                <CommandGroup>
                  <CommandItem value={`create-${search}`} onSelect={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create "{search.trim()}"
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
            {canCreate && (
              <div className="border-t border-border/60 p-2">
                <Button type="button" variant="secondary" size="sm" className="w-full" onClick={handleCreate}>
                  Create category
                </Button>
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
