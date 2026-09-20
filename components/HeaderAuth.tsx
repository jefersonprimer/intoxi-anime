"use client";

import { User } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { SessionUser } from "@/lib/auth";
import { UserModal } from "@/components/UserModal";

type HeaderAuthProps = {
  user: SessionUser | null;
};

export function HeaderAuth({ user }: HeaderAuthProps) {
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

  if (!user) {
    return (
      <div ref={rootRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-haspopup="menu"
          title="Conta"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-[#434343] text-white transition hover:bg-slate-700"
        >
          <User size={20} aria-hidden="true" />
        </button>

        {open ? (
          <div
            role="menu"
            className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-[#252525] p-2 shadow-xl shadow-black/50"
          >
            <Link
              href="/login"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-bold text-slate-200 transition hover:bg-white/10 hover:text-white"
            >
              Entrar
            </Link>
            <Link
              href="/signup"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-bold text-sky-200 transition hover:bg-sky-400/20"
            >
              Criar conta
            </Link>
          </div>
        ) : null}
      </div>
    );
  }

  return <UserModal user={user} />;
}