"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

const RichTextEditor = dynamic(
  () =>
    import("@/components/RichTextEditor").then((module) => module.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-72 rounded-md border border-white/10 bg-white/[0.04] px-4 py-4" />
    ),
  },
);
import { extractFirstImageUrl, getPostPath, type Post } from "@/lib/post-utils";

const inputClass =
  "h-12 rounded-md border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300";
const labelClass = "text-sm font-bold text-slate-200";

type CreatePostResponse = {
  message?: string;
  post?: Post;
};

function parsePostResponse(value: string): CreatePostResponse {
  if (!value) {
    return {};
  }

  try {
    return JSON.parse(value) as CreatePostResponse;
  } catch {
    return {};
  }
}

type PostFormProps = {
  mode: "create" | "edit";
  initialPost?: Post;
};

export function PostForm({ mode, initialPost }: PostFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const summaryRef = useRef<HTMLTextAreaElement>(null);
  const isEditing = mode === "edit";
  const [step, setStep] = useState<"edit" | "confirm">("edit");
  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [contentHtml, setContentHtml] = useState(
    initialPost?.contentHtml ?? "<p></p>",
  );
  const [bannerImageUrl, setBannerImageUrl] = useState(
    initialPost?.bannerImageUrl ?? "",
  );
  const [category, setCategory] = useState(initialPost?.category ?? "Noticias");
  const [summary, setSummary] = useState(initialPost?.summary ?? "");
  const [isFeatured, setIsFeatured] = useState(
    initialPost?.isFeatured ?? false,
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    function handleSubmitRequest() {
      formRef.current?.requestSubmit();
    }

    window.addEventListener("intoxi:submit-post-form", handleSubmitRequest);
    return () =>
      window.removeEventListener(
        "intoxi:submit-post-form",
        handleSubmitRequest,
      );
  }, []);

  const contentBanner = extractFirstImageUrl(contentHtml);
  const effectiveBanner = bannerImageUrl.trim() || contentBanner;

  function hasContent(): boolean {
    return contentHtml.replace(/<[^>]*>/g, "").trim().length > 0;
  }

  function resizeTitle() {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }

  useEffect(() => {
    resizeTitle();
  }, [step]);

  function resizeSummary() {
    const el = summaryRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, 96)}px`;
  }

  async function publishPost() {
    setMessage("");

    try {
      const response = await fetch("/api/posts", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(isEditing ? { postId: initialPost?.id } : {}),
          title,
          category: category || "Noticias",
          bannerImageUrl,
          summary,
          isFeatured,
          contentHtml,
        }),
      });

      const payload = parsePostResponse(await response.text());

      if (!response.ok || !payload.post) {
        setMessage(payload.message ?? "Nao foi possivel salvar o post.");
        return;
      }

      router.push(getPostPath(payload.post));
      router.refresh();
    } catch {
      setMessage("Nao foi possivel conectar com a API de posts.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (step === "edit") {
      if (!title.trim() || !hasContent()) {
        setMessage("Titulo e conteudo sao obrigatorios.");
        return;
      }

      setMessage("");
      if (!bannerImageUrl.trim() && contentBanner) {
        setBannerImageUrl(contentBanner);
      }
      setStep("confirm");
      return;
    }

    await publishPost();
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {message ? (
        <p className="text-sm font-bold text-red-300">{message}</p>
      ) : null}
      <button type="submit" className="hidden" aria-hidden="true" />

      {step === "edit" ? (
        <section className="grid  p-5">
          <label className="flex flex-col gap-2">
            <textarea
              ref={titleRef}
              value={title}
              rows={1}
              onChange={(event) => {
                setTitle(event.target.value);
                resizeTitle();
              }}
              className="w-full max-h-[190px] resize-none overflow-hidden bg-transparent px-4 py-4 text-[42px] font-normal leading-tight text-slate-100 outline-none transition placeholder:text-[#b3b3b1]"
              placeholder="Titulo"
            />
          </label>

          <RichTextEditor
            value={contentHtml}
            onChange={setContentHtml}
            autofocus={!isEditing}
          />
        </section>
      ) : (
        <section className="grid gap-5 p-5">
          <div>
            <h2 className="text-lg font-black text-white">
              {isEditing ? "Confirmar alteracoes" : "Confirmar publicacao"}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {isEditing
                ? "Preencha os dados finais antes de salvar."
                : "Preencha os dados finais antes de publicar."}
            </p>
          </div>

          <label className="flex flex-col gap-2">
            <span className={labelClass}>URL do banner</span>
            <input
              value={bannerImageUrl}
              onChange={(event) => setBannerImageUrl(event.target.value)}
              type="url"
              className={inputClass}
              placeholder="https://..."
            />
          </label>

          {effectiveBanner ? (
            <img
              src={effectiveBanner}
              alt="Preview do banner"
              className="w-full rounded-md border border-white/10 object-contain"
            />
          ) : (
            <p className="text-xs font-semibold text-slate-400">
              Nenhuma imagem encontrada no conteudo. Informe uma URL de banner
              acima.
            </p>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className={labelClass}>Categoria</span>
              <input
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className={inputClass}
              />
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 sm:mt-7">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(event) => setIsFeatured(event.target.checked)}
                className="h-4 w-4 accent-sky-400"
              />
              <span className="text-sm font-bold text-slate-200">
                Post em destaque
              </span>
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className={labelClass}>Resumo</span>
            <textarea
              ref={summaryRef}
              value={summary}
              onChange={(event) => {
                setSummary(event.target.value);
                resizeSummary();
              }}
              className={`${inputClass} h-auto min-h-[96px] resize-none overflow-hidden py-3 leading-relaxed`}
              rows={3}
              placeholder="Pequeno resumo para cards e destaque"
            />
          </label>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setStep("edit")}
              className="h-12 rounded-md px-6 text-sm font-bold text-slate-300 transition hover:text-white"
            >
              Voltar e editar
            </button>
            <button
              type="submit"
              className="h-12 rounded-md bg-sky-400 px-6 text-sm font-black text-slate-950 transition hover:bg-white"
            >
              {isEditing ? "Salvar alteracoes" : "Confirmar publicacao"}
            </button>
          </div>
        </section>
      )}
    </form>
  );
}
