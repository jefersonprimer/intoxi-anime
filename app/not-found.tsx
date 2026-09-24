import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-background">
      <main className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 px-4 py-16 sm:flex-row sm:gap-12 sm:py-24 xl:px-0">
        <div className="relative w-full max-w-sm shrink-0 overflow-hidden rounded-2xl sm:max-w-md">
          <Image
            src="/404.gif"
            alt="Personagem de anime chorando"
            width={480}
            height={480}
            unoptimized
            priority
            className="h-auto w-full object-cover"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col items-center text-center sm:items-start sm:text-left">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#1e73be]">
            Erro 404
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-foreground sm:text-5xl">
            Página não encontrada
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted sm:text-lg">
            Ops! A página que você procura não existe ou foi movida. Que tal
            voltar às notícias e continuar a intoxicação?
          </p>
          <Link
            href="/noticias"
            className="mt-8 inline-flex items-center justify-center rounded-3xl border border-transparent bg-[#1e73be] px-6 py-3 font-semibold text-category-fg shadow-md transition hover:border-foreground hover:bg-[#1862a3] hover:text-foreground hover:shadow-lg active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e73be] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Ir para notícias
          </Link>
        </div>
      </main>
    </div>
  );
}
