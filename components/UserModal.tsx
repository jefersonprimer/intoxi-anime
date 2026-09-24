"use client";

import { ChevronDown, LogOut, Pencil } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { SessionUser } from "@/lib/auth";
import { ProfileModal } from "@/components/ProfileModal";
import { ThemeToggle } from "@/components/ThemeToggle";

type UserModalProps = {
  user: SessionUser;
};

export function UserModal({ user }: UserModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const displayName = user.name?.trim() || user.email;
  const initial = (
    user.name?.trim()?.[0] ??
    user.email[0] ??
    "?"
  ).toUpperCase();

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

  async function handleLogout() {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div ref={rootRef} className="relative z-50">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-haspopup="menu"
          title={displayName}
          className="flex items-center gap-1.5 rounded-full p-2 text-sm font-semibold text-header-muted transition hover:text-header-fg"
        >
          {user.avatarUrl?.trim() ? (
            <Image
              src={user.avatarUrl.trim()}
              alt={displayName}
              width={40}
              height={40}
              unoptimized
              className="size-10 rounded-full bg-header-border object-cover"
            />
          ) : (
            <span className="grid size-10 place-items-center rounded-full bg-header-border text-base font-normal text-header-fg">
              {initial}
            </span>
          )}
          <ChevronDown
            size={20}
            className={`text-header-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open ? (
          <div
            role="menu"
            className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-header-border bg-header-bg shadow-xl shadow-black/20"
          >
            <div className="flex items-center justify-between border-b border-header-border px-4 py-3">
              <div className="flex items-center gap-2">
                {user.avatarUrl?.trim() ? (
                  <Image
                    src={user.avatarUrl.trim()}
                    alt={displayName}
                    width={40}
                    height={40}
                    unoptimized
                    className="size-10 rounded-full bg-header-border object-cover"
                  />
                ) : (
                  <span className="grid size-10 place-items-center rounded-full bg-header-border text-base font-normal text-header-fg">
                    {initial}
                  </span>
                )}
                <p className="truncate text-sm font-bold text-header-fg">
                  {displayName}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setProfileOpen(true);
                }}
                className="flex w-fit items-center gap-2 rounded-full p-2 text-sm font-semibold text-header-fg transition hover:bg-header-border"
              >
                <Pencil size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="p-2">
              <button
                type="button"
                onClick={handleLogout}
                disabled={busy}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-header-fg transition disabled:cursor-not-allowed disabled:opacity-60 hover:bg-header-border"
              >
                <LogOut size={16} aria-hidden="true" />
                Sair
              </button>
            </div>
            <div className="border-t border-header-border p-2 sm:hidden">
              <ThemeToggle showLabel />
            </div>
          </div>
        ) : null}
      </div>

      {profileOpen ? (
        <ProfileModal user={user} onClose={() => setProfileOpen(false)} />
      ) : null}
    </>
  );
}
