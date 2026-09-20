"use client";

import { Check, ImagePlus, Link2, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import type { SessionUser } from "@/lib/auth";

const PRESET_AVATARS = [
  { id: "sakura", url: "https://api.dicebear.com/9.x/thumbs/svg?seed=intoxi-sakura&backgroundColor=d1495b" },
  { id: "sky", url: "https://api.dicebear.com/9.x/thumbs/svg?seed=intoxi-sky&backgroundColor=1e73be" },
  { id: "midori", url: "https://api.dicebear.com/9.x/thumbs/svg?seed=intoxi-midori&backgroundColor=229954" },
  { id: "yoru", url: "https://api.dicebear.com/9.x/thumbs/svg?seed=intoxi-yoru&backgroundColor=6c3483" },
  { id: "kaki", url: "https://api.dicebear.com/9.x/thumbs/svg?seed=intoxi-kaki&backgroundColor=d35400" },
  { id: "aoi", url: "https://api.dicebear.com/9.x/thumbs/svg?seed=intoxi-aoi&backgroundColor=148f77" },
  { id: "aka", url: "https://api.dicebear.com/9.x/thumbs/svg?seed=intoxi-aka&backgroundColor=c0392b" },
  { id: "sumi", url: "https://api.dicebear.com/9.x/thumbs/svg?seed=intoxi-sumi&backgroundColor=34495e" },
];

const inputClass =
  "h-11 rounded-md border border-white/10 bg-white/[0.04] px-3.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300";
const labelClass = "text-sm font-bold text-slate-200";

type ProfileModalProps = {
  user: SessionUser;
  onClose: () => void;
};

export function ProfileModal({ user, onClose }: ProfileModalProps) {
  const router = useRouter();
  const [name, setName] = useState(user.name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setBusy(true);

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, avatarUrl }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        message?: string;
      };

      if (!response.ok) {
        setMessage(payload.message ?? "Nao foi possivel salvar o perfil.");
        return;
      }

      router.refresh();
      onClose();
    } catch {
      setMessage("Nao foi possivel conectar com o servidor.");
    } finally {
      setBusy(false);
    }
  }

  function handlePresetSelect(presetUrl: string) {
    setAvatarUrl(presetUrl);
  }

  const isPresetSelected = (presetUrl: string) => avatarUrl.trim() === presetUrl;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-white/10 bg-[#252525] shadow-2xl shadow-black/60"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2
            id="profile-modal-title"
            className="text-base font-black text-white"
          >
            Editar perfil
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="grid size-9 place-items-center rounded-md text-zinc-400 transition hover:bg-white/10 hover:text-white"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          <div className="flex items-center gap-4">
            {avatarUrl.trim() ? (
              <Image
                src={avatarUrl.trim()}
                alt={name.trim() || "Avatar"}
                width={64}
                height={64}
                unoptimized
                className="size-16 shrink-0 rounded-full bg-white/10 object-cover"
              />
            ) : (
              <span className="grid size-16 shrink-0 place-items-center rounded-full bg-sky-400/20 text-xl font-black text-sky-200">
                {(name.trim()?.[0] ?? user.email[0] ?? "?").toUpperCase()}
              </span>
            )}
            <p className="text-sm leading-6 text-slate-300">
              O nome e o avatar aparecem nos posts que voce publicar.
            </p>
          </div>

          <label className="flex flex-col gap-2">
            <span className={labelClass}>Nome de escritor</span>
            <input
              autoComplete="off"
              maxLength={80}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={inputClass}
              placeholder="Como voce assina os posts"
            />
          </label>

          <fieldset className="flex flex-col gap-3">
            <legend className={labelClass}>Escolher avatar</legend>
            <div className="grid grid-cols-4 gap-3">
              {PRESET_AVATARS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetSelect(preset.url)}
                  aria-label={`Usar avatar ${preset.id}`}
                  aria-pressed={isPresetSelected(preset.url)}
                  className={`relative grid place-items-center rounded-full p-0.5 transition ${
                    isPresetSelected(preset.url)
                      ? "ring-2 ring-sky-400"
                      : "ring-1 ring-white/15 hover:ring-sky-300/60"
                  }`}
                >
                  <Image
                    src={preset.url}
                    alt=""
                    width={56}
                    height={56}
                    unoptimized
                    className="size-14 rounded-full bg-white/10 object-cover"
                  />
                  {isPresetSelected(preset.url) ? (
                    <span className="absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full bg-sky-400 text-slate-950">
                      <Check size={12} strokeWidth={3} aria-hidden="true" />
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="flex flex-col gap-2">
            <span className={labelClass}>
              <span className="inline-flex items-center gap-1.5">
                <Link2 size={15} aria-hidden="true" />
                URL personalizada
              </span>
            </span>
            <input
              type="url"
              value={avatarUrl}
              onChange={(event) => setAvatarUrl(event.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
          </label>

          {avatarUrl.trim() ? (
            <button
              type="button"
              onClick={() => setAvatarUrl("")}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-400 transition hover:text-white"
            >
              <ImagePlus size={14} aria-hidden="true" />
              Remover avatar (mostrar inicial)
            </button>
          ) : null}

          {message ? (
            <p className="text-sm font-bold text-red-300">{message}</p>
          ) : null}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-sky-400 px-5 text-sm font-black text-slate-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Check size={16} aria-hidden="true" />
              {busy ? "Salvando..." : "Salvar perfil"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="inline-flex h-11 items-center justify-center rounded-md border border-white/10 px-5 text-sm font-bold text-zinc-300 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}