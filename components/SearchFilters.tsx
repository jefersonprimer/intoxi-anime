"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import {
  SEARCH_DATE_FILTERS,
  SEARCH_SORT_OPTIONS,
  type SearchDateFilter,
  type SearchSortOption,
} from "@/lib/post-utils";

export type SearchFiltersValue = {
  category: string;
  date: SearchDateFilter;
  sort: SearchSortOption;
};

type SearchFiltersProps = {
  categories: string[];
  value: SearchFiltersValue;
  onChange: (next: SearchFiltersValue) => void;
};

type DropdownOption = {
  value: string;
  label: string;
};

function FilterDropdown({
  name,
  value,
  options,
  onChange,
}: {
  name: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((option) => option.value === value);
  const triggerLabel =
    value === "" || value === "all" ? name : (selected?.label ?? name);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative min-w-0 flex-1">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-11 w-full items-center justify-between gap-2 rounded-md border border-border bg-surface px-3.5 text-sm text-foreground transition hover:border-foreground/25 focus:border-[#1e73be] focus:outline-none"
      >
        <span className="truncate">{triggerLabel}</span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={`shrink-0 text-muted transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={name}
          className="absolute left-0 right-0 top-full z-40 mt-1.5 max-h-64 overflow-y-auto rounded-md border border-border bg-surface py-1 shadow-xl shadow-black/20"
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <li key={option.value} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-sm transition ${
                    isSelected
                      ? "bg-surface-muted text-foreground"
                      : "text-muted hover:bg-surface-muted hover:text-foreground"
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected ? (
                    <Check
                      size={16}
                      aria-hidden="true"
                      className="shrink-0 text-[#1e73be]"
                    />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export function SearchFilters({
  categories,
  value,
  onChange,
}: SearchFiltersProps) {
  const categoryOptions: DropdownOption[] = [
    { value: "", label: "Todos" },
    ...categories.map((category) => ({ value: category, label: category })),
  ];

  const dateOptions: DropdownOption[] = SEARCH_DATE_FILTERS.map((option) => ({
    value: option.value,
    label: option.label,
  }));

  const sortOptions: DropdownOption[] = SEARCH_SORT_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
  }));

  return (
    <div className="mt-6 pb-4 flex flex-col gap-3 sm:flex-row sm:items-center border-b border-border">
      <span className="shrink-0 text-base font-bold text-foreground">
        Ordenar por
      </span>
      <FilterDropdown
        name="Ordenar"
        value={value.sort}
        options={sortOptions}
        onChange={(sort) =>
          onChange({ ...value, sort: sort as SearchSortOption })
        }
      />
      <FilterDropdown
        name="Categorias"
        value={value.category}
        options={categoryOptions}
        onChange={(category) => onChange({ ...value, category })}
      />
      <FilterDropdown
        name="Data"
        value={value.date}
        options={dateOptions}
        onChange={(date) =>
          onChange({ ...value, date: date as SearchDateFilter })
        }
      />
    </div>
  );
}
