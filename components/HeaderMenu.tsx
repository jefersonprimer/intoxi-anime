"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { categoryToSlug, getPostPath, type Post } from "@/lib/post-utils";

type HeaderMenuProps = {
  years: number[];
  guides?: Post[];
  categories?: string[];
};

export function HeaderMenu({
  years,
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
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-zinc-200 transition hover:text-white md:hidden"
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
          <div className="absolute inset-y-0 left-0 flex w-72 h-140 flex-col overflow-y-auto border-r border-white/10 bg-[#1E1E1E] shadow-2xl shadow-black/60">
            <div className="flex items-start justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
                className="inline-flex p-4 items-center justify-center rounded-md text-zinc-200 transition hover:text-white"
              >
                <X size={24} aria-hidden="true" />
              </button>
            </div>

            <nav className="flex-1 p-3">
              {categories.length > 0 ? (
                <>
                  <p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Categorias
                  </p>
                  <ul className="space-y-0.5">
                    {categories.map((category) => (
                      <li key={category}>
                        <Link
                          href={`/${categoryToSlug(category)}`}
                          onClick={() => setOpen(false)}
                          className="block w-full truncate rounded-md px-3 py-2 text-sm font-normal text-zinc-200 transition hover:bg-white/10 hover:text-white"
                        >
                          {category}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}

              <p className="mt-4 px-3 py-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
                Guias de Temporada
              </p>
              {recentGuides.length > 0 ? (
                <ul className="space-y-0.5">
                  {recentGuides.map((guide) => (
                    <li key={guide.id}>
                      <Link
                        href={getPostPath(guide)}
                        onClick={() => setOpen(false)}
                        className="block w-full truncate rounded-md px-3 py-2 text-sm font-normal text-zinc-200 transition hover:bg-white/10 hover:text-white"
                        title={guide.title}
                      >
                        {guide.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-3 py-2 text-sm text-zinc-500">
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
