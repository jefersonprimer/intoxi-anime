import { HomePostSidebar } from "@/components/HomePostSidebar";
import { PostCard } from "@/components/PostCard";
import { getPosts, getPostsByCategory } from "@/lib/posts";

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
  const [posts, allPosts] = await Promise.all([
    getPostsByCategory(decodedCategory),
    getPosts(),
  ]);
  const categoryName = posts[0]?.category ?? decodedCategory;

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-3 xl:px-0">
        <section className="min-w-0 lg:col-span-2">
          <h1 className="py-5 mb-2 text-2xl md:text-3xl font-medium text-foreground">
            {categoryName}
          </h1>

          {posts.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-surface-muted p-8 text-muted">
              Nenhum post encontrado nesta categoria.
            </div>
          )}
        </section>
        <HomePostSidebar
          posts={allPosts.slice(0, 4)}
          title="Últimas notícias"
          allPostsLabel="Ver todas as notícias"
          horizontal
        />
      </main>
    </div>
  );
}
