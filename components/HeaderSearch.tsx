"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

export function HeaderSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery = query.trim();
    setOpen(false);
    router.push(
      nextQuery ? `/buscar?q=${encodeURIComponent(nextQuery)}` : "/buscar",
    );
  }

  function handleClearOrClose() {
    if (query) {
      setQuery("");
      inputRef.current?.focus();
    } else {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="static">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Buscar posts"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full  text-zinc-300 transition hover:border-white/20 hover:text-white"
      >
        {open ? (
          <X size={24} aria-hidden="true" />
        ) : (
          <Search size={24} aria-hidden="true" />
        )}
      </button>

      {open ? (
        <div
          role="search"
          className="absolute inset-x-0 top-full z-50 w-full border-b border-white/10 bg-[#1E1E1E] py-5 shadow-2xl shadow-black/80"
        >
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <form
              onSubmit={handleSubmit}
              className="relative flex w-full items-center"
            >
              <Search
                size={24}
                aria-hidden="true"
                className="pointer-events-none absolute left-0 text-zinc-400"
              />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Digite sua busca e pressione Enter..."
                className="w-full border-b-2 border-white/20 bg-transparent py-3 pl-8 pr-10 text-base md:text-2xl font-medium text-white outline-none transition-colors duration-200 placeholder:text-zinc-500 focus:border-[#1e73be]"
              />
              <button
                type="button"
                onClick={handleClearOrClose}
                className="absolute right-0 p-1 text-zinc-400 transition hover:text-white"
                title={query ? "Limpar busca" : "Fechar busca"}
              >
                <X size={24} aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
