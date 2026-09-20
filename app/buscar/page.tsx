import { PostCard } from "@/components/PostCard";
import { getPosts } from "@/lib/posts";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export const metadata = {
  title: "Buscar posts - Intoxi Anime",
};

export default async function SearchPage({
  searchParams,
}: PageProps<"/buscar">) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const normalizedQuery = normalize(query);
  const posts = await getPosts();
  const results = normalizedQuery
    ? posts.filter((post) =>
        normalize(
          [post.title, post.category, post.summary ?? "", post.contentHtml].join(" "),
        ).includes(normalizedQuery),
      )
    : posts;

  return (
    <div className="min-h-screen bg-[#1E1E1E]">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.26em] text-sky-300">
            busca
          </p>
          <h1 className="mt-2 text-4xl font-black text-white">
            {query ? `Resultados para "${query}"` : "Buscar posts"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            {results.length} {results.length === 1 ? "post encontrado" : "posts encontrados"}
          </p>
        </section>

        {results.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-8 text-slate-300">
            Nenhum post encontrado com esse termo.
          </div>
        )}
      </main>
    </div>
  );
}
