"use client";

import { ChevronDown, LogOut, Pencil } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { SessionUser } from "@/lib/auth";
import { ProfileModal } from "@/components/ProfileModal";

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
  const initial = (user.name?.trim()?.[0] ?? user.email[0] ?? "?").toUpperCase();

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
      <div ref={rootRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-haspopup="menu"
          title={displayName}
          className="flex items-center gap-1.5 rounded-full p-2 text-sm font-semibold text-zinc-200 transition hover:opacity-80"
        >
          {user.avatarUrl?.trim() ? (
            <Image
              src={user.avatarUrl.trim()}
              alt={displayName}
              width={40}
              height={40}
              unoptimized
              className="size-10 rounded-full bg-white/10 object-cover"
            />
          ) : (
            <span className="grid size-10 place-items-center rounded-full bg-white/10 text-base font-normal text-white">
              {initial}
            </span>
          )}
          <ChevronDown
            size={16}
            className={`text-zinc-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open ? (
          <div
            role="menu"
            className="absolute right-0 top-full mt-2 w-72 overflow-hidden rounded-xl border border-white/10 bg-[#252525] shadow-xl shadow-black/50"
          >
            <div className="border-b border-white/10 px-4 py-3">
              <p className="truncate text-sm font-bold text-white">
                {displayName}
              </p>
              <p className="mt-0.5 truncate text-xs font-normal text-zinc-500">
                {user.email}
              </p>
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                {user.role}
              </p>
            </div>
            <div className="p-2">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setProfileOpen(true);
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-white/10 hover:text-white"
              >
                <Pencil size={16} aria-hidden="true" />
                Editar perfil
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={busy}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-zinc-200 transition disabled:cursor-not-allowed disabled:opacity-60 hover:bg-white/10 hover:text-white"
              >
                <LogOut size={16} aria-hidden="true" />
                Sair
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {profileOpen ? (
        <ProfileModal
          user={user}
          onClose={() => setProfileOpen(false)}
        />
      ) : null}
    </>
  );
}