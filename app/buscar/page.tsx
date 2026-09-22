import { HomePostSidebar } from "@/components/HomePostSidebar";
import { SearchResults } from "@/components/SearchResults";
import { getPostCategories, getPosts } from "@/lib/posts";

export const metadata = {
  title: "Buscar posts - Intoxi Anime",
};

export default async function SearchPage({
  searchParams,
}: PageProps<"/buscar">) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const category =
    typeof params.categoria === "string" ? params.categoria.trim() : "";
  const date = typeof params.data === "string" ? params.data : undefined;
  const sort = typeof params.ordem === "string" ? params.ordem : undefined;
  const categories = await getPostCategories();
  const posts = await getPosts();

  return (
    <div className="min-h-screen bg-[#1E1E1E]">
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-3 xl:px-0">
        <section className="min-w-0 lg:col-span-2">
          <h1 className="mt-2 text-2xl font-normal text-white">
            {query ? `Resultados para: "${query}"` : "Buscar posts"}
          </h1>
          <SearchResults
            query={query}
            categories={categories}
            initialCategory={category}
            initialDate={date}
            initialSort={sort}
          />
        </section>
        <HomePostSidebar posts={posts.slice(0, 4)} title="Últimas notícias" />
      </main>
    </div>
  );
}
