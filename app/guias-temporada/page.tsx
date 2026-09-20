import { PostCard } from "@/components/PostCard";
import { getSeasonGuidePosts } from "@/lib/posts";

export const metadata = {
  title: "Guias de Temporada - Intoxi Anime",
};

export default async function SeasonGuidesPage() {
  const posts = await getSeasonGuidePosts();

  return (
    <div className="min-h-screen bg-[#1E1E1E]">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.26em] text-sky-300">
            guias de temporada
          </p>
          <h1 className="mt-2 text-4xl font-black text-white">
            Guias de Temporada
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            {posts.length} {posts.length === 1 ? "guia publicado" : "guias publicados"}
          </p>
        </section>

        {posts.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-8 text-slate-300">
            Nenhum guia de temporada publicado ainda.
          </div>
        )}
      </main>
    </div>
  );
}