"use client";

import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type AdminPostActionsProps = {
  postId: string;
  postSlug: string;
};

export function AdminPostActions({ postId, postSlug }: AdminPostActionsProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (!window.confirm("Tem certeza que deseja apagar este post?")) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/posts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        message?: string;
      };

      if (!response.ok) {
        setError(payload.message ?? "Nao foi possivel apagar o post.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Nao foi possivel conectar com a API de posts.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link
        href={`/editar-post/${postSlug}`}
        className="inline-flex h-10 items-center gap-2 rounded-md border border-sky-300/40 bg-sky-400/10 px-4 text-sm font-bold text-sky-200 transition hover:bg-sky-400/20"
      >
        <Pencil size={16} aria-hidden="true" />
        Editar
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        disabled={busy}
        className="inline-flex h-10 items-center gap-2 rounded-md border border-red-300/30 px-4 text-sm font-bold text-red-200 transition hover:bg-red-400 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Trash2 size={16} aria-hidden="true" />
        {busy ? "Apagando..." : "Apagar"}
      </button>
      {error ? <span className="text-sm font-bold text-red-300">{error}</span> : null}
    </div>
  );
}