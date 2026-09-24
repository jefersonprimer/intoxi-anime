"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { categoryToSlug, getPostPath, type Post } from "@/lib/post-utils";

type HeaderMenuProps = {
  guides?: Post[];
  categories?: string[];
};

export function HeaderMenu({
  guides = [],
  categories = [],
}: HeaderMenuProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const recentGuides = guides.slice(0, 5);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Abrir menu de navegacao"
        aria-expanded={open}
        aria-haspopup="dialog"
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-header-muted transition hover:text-header-fg md:hidden"
      >
        {open ? (
          <X size={24} aria-hidden="true" />
        ) : (
          <Menu size={24} aria-hidden="true" />
        )}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 md:hidden"
        >
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 flex h-140 w-72 flex-col overflow-y-auto border-r border-header-border bg-header-bg shadow-2xl shadow-black/40">
            <div className="flex items-start justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
                className="inline-flex items-center justify-center rounded-md p-4 text-header-muted transition hover:text-header-fg"
              >
                <X size={24} aria-hidden="true" />
              </button>
            </div>

            <nav className="flex-1 p-3">
              {categories.length > 0 ? (
                <>
                  <p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted">
                    Categorias
                  </p>
                  <ul className="space-y-0.5">
                    {categories.map((category) => (
                      <li key={category}>
                        <Link
                          href={`/${categoryToSlug(category)}`}
                          onClick={() => setOpen(false)}
                          className="block w-full truncate rounded-md px-3 py-2 text-sm font-normal text-header-muted transition hover:bg-surface-muted hover:text-header-fg"
                        >
                          {category}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}

              <p className="mt-4 px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted">
                Guias de Temporada
              </p>
              <Link
                href="/guias-temporada"
                onClick={() => setOpen(false)}
                className="block w-full rounded-md px-3 py-2 text-sm font-bold text-header-fg transition hover:bg-surface-muted"
              >
                Ver todos os guias
              </Link>
              {recentGuides.length > 0 ? (
                <ul className="space-y-0.5">
                  {recentGuides.map((guide) => (
                    <li key={guide.id}>
                      <Link
                        href={getPostPath(guide)}
                        onClick={() => setOpen(false)}
                        className="block w-full truncate rounded-md px-3 py-2 text-sm font-normal text-header-muted transition hover:bg-surface-muted hover:text-header-fg"
                        title={guide.title}
                      >
                        {guide.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-3 py-2 text-sm text-muted">
                  Nenhum guia disponivel.
                </p>
              )}
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
