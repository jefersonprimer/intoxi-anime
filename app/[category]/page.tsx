import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PostCard } from "@/components/PostCard";
import { getPostsByCategory } from "@/lib/posts";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  const posts = await getPostsByCategory(decodedCategory);
  const categoryName = posts[0]?.category ?? decodedCategory;
  return { title: `${categoryName} - Intoxi Anime` };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  const posts = await getPostsByCategory(decodedCategory);
  const categoryName = posts[0]?.category ?? decodedCategory;

  return (
    <div className="min-h-screen bg-[#1E1E1E]">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.26em] text-sky-300">
            categoria
          </p>
          <h1 className="mt-2 text-4xl font-black text-white capitalize">
            {categoryName}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            {posts.length} {posts.length === 1 ? "post encontrado" : "posts encontrados"}
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
            Nenhum post encontrado nesta categoria.
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
