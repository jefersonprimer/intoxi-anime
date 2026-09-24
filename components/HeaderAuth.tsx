"use client";

import { User } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { SessionUser } from "@/lib/auth";
import { UserModal } from "@/components/UserModal";
import { ThemeToggle } from "@/components/ThemeToggle";

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
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-header-muted transition hover:text-header-fg"
        >
          <User size={24} aria-hidden="true" />
        </button>

        {open ? (
          <div
            role="menu"
            className="absolute right-0 top-full z-10 mt-2 w-56 overflow-hidden rounded-xl border border-header-border bg-header-bg p-2 shadow-xl shadow-black/20"
          >
            <Link
              href="/login"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-normal text-header-fg transition hover:bg-header-border"
            >
              Entrar
            </Link>
            <Link
              href="/signup"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-normal text-header-fg transition hover:bg-header-border"
            >
              Criar conta
            </Link>
            <div className="border-t border-header-border sm:hidden">
              <ThemeToggle showLabel />
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return <UserModal user={user} />;
}
