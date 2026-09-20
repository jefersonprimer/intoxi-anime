"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getPostPath, type Post } from "@/lib/post-utils";

type HeaderSeasonGuidesProps = {
  years: number[];
  guides?: Post[];
};

export function HeaderSeasonGuides({
  years,
  guides = [],
}: HeaderSeasonGuidesProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

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

  const recentGuides = guides.slice(0, 5);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex h-10 items-center gap-1.5 rounded-md px-3 text-sm font-normal text-zinc-200 transition hover:text-white"
      >
        Guias de Temporada
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute left-0 top-full z-50 mt-2 w-72 max-h-[80vh] overflow-y-auto rounded-xl border border-white/10 bg-[#252525] p-1.5 shadow-xl shadow-black/50"
        >
          {recentGuides.length > 0 ? (
            <div>
              {recentGuides.map((guide) => (
                <Link
                  key={guide.id}
                  href={getPostPath(guide)}
                  onClick={() => setOpen(false)}
                  className="block w-full truncate rounded-md px-3 py-2 text-sm font-normal text-zinc-200 transition hover:bg-white/10 hover:text-white"
                  title={guide.title}
                >
                  {guide.title}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
