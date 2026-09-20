"use client";

import { Plus, Save } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function HeaderCreatePostButton() {
  const pathname = usePathname();
  const isNewPostPage = pathname === "/novo-post";
  const isEditPage = pathname.startsWith("/editar-post/");
  const isFormPage = isNewPostPage || isEditPage;

  const className =
    "inline-flex h-10 w-10 shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full bg-[#434343] px-0 text-sm font-bold text-white transition hover:bg-slate-700 sm:w-auto sm:px-4";

  if (!isFormPage) {
    return (
      <Link href="/novo-post" className={className}>
        <Plus size={20} aria-hidden="true" />
        <span className="hidden sm:inline">Criar Post</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("intoxi:submit-post-form"))}
      className={className}
      title={isNewPostPage ? "Publicar post" : "Salvar alteracoes"}
    >
      <span className="hidden sm:inline">
        {isNewPostPage ? "Publicar post" : "Salvar alteracoes"}
      </span>
    </button>
  );
}
