import Image from "next/image";
import { notFound } from "next/navigation";
import { HomePostSidebar } from "@/components/HomePostSidebar";
import { PostCard } from "@/components/PostCard";
import { SocialLinks } from "@/components/SocialLinks";
import { hasAuthorBio, hasAuthorLinks, type Author } from "@/lib/post-utils";
import { getAuthorBySlug, getPosts, getPostsByAuthor } from "@/lib/posts";

function getAuthorDisplay(posts: Awaited<ReturnType<typeof getPostsByAuthor>>) {
  const name = posts[0]?.author?.name?.trim() || null;
  const avatarUrl = posts[0]?.author?.avatarUrl ?? null;
  const count = posts.length;
  return { name, avatarUrl, count, author: posts[0]?.author ?? null };
}

function resolveAuthor(
  posts: Awaited<ReturnType<typeof getPostsByAuthor>>,
  authorBySlug: Author | null,
): Author | null {
  const postAuthor = posts[0]?.author;
  if (!postAuthor) {
    return null;
  }

  if (authorBySlug && authorToSlugMatches(authorBySlug.name, postAuthor.name)) {
    return authorBySlug;
  }

  return {
    name: postAuthor.name,
    avatarUrl: postAuthor.avatarUrl,
    bio: postAuthor.bio ?? null,
    ...{
      xUrl: postAuthor.xUrl,
      instagramUrl: postAuthor.instagramUrl,
      facebookUrl: postAuthor.facebookUrl,
      youtubeUrl: postAuthor.youtubeUrl,
      tiktokUrl: postAuthor.tiktokUrl,
      websiteUrl: postAuthor.websiteUrl,
    },
  };
}

function authorToSlugMatches(left: string, right: string) {
  return (
    left.trim().toLowerCase() === right.trim().toLowerCase() ||
    left.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() ===
      right.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ nome: string }>;
}) {
  const { nome } = await params;
  const decodedName = decodeURIComponent(nome);
  const posts = await getPostsByAuthor(decodedName);
  const { name } = getAuthorDisplay(posts);
  if (!name) return { title: "Autor - Intoxi Anime" };
  return { title: `${name} - Intoxi Anime` };
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ nome: string }>;
}) {
  const { nome } = await params;
  const decodedName = decodeURIComponent(nome);
  const [posts, allPosts, authorBySlug] = await Promise.all([
    getPostsByAuthor(decodedName),
    getPosts(),
    getAuthorBySlug(decodedName),
  ]);
  const { name, avatarUrl, count } = getAuthorDisplay(posts);
  const author = resolveAuthor(posts, authorBySlug);
  if (!name || !posts[0]?.author) {
    notFound();
  }

  const initial = name[0]?.toUpperCase() ?? "?";
  const showBio = hasAuthorBio(author);
  const showLinks = hasAuthorLinks(author);

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-3 xl:px-0">
        <section className="min-w-0 lg:col-span-2">
          <header className="mb-10 flex flex-wrap items-start gap-5">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={name}
                width={80}
                height={80}
                unoptimized
                className="size-20 shrink-0 rounded-full bg-white/10 object-cover"
              />
            ) : (
              <span className="grid size-20 shrink-0 place-items-center rounded-full bg-sky-400/20 text-3xl font-black text-sky-200">
                {initial}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-black text-foreground md:text-4xl">
                {name}
              </h1>
              {showBio ? (
                <p className="mt-3 max-w-2xl rounded-md border border-border bg-surface-muted px-4 py-3 text-[15px] leading-relaxed text-foreground">
                  {author?.bio}
                </p>
              ) : null}
              <p className="mt-3 text-sm font-normal text-muted">
                {count} {count === 1 ? "artigo publicado" : "artigos publicados"}
              </p>
              {showLinks ? (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="text-sm font-bold text-muted">Siga em:</span>
                  <SocialLinks author={author} itemClassName="size-9" />
                </div>
              ) : null}
            </div>
          </header>

          {posts.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-surface-muted p-8 text-muted">
              Nenhum post encontrado para este autor.
            </div>
          )}
        </section>
        <HomePostSidebar posts={allPosts.slice(0, 4)} title="Últimas notícias" />
      </main>
    </div>
  );
}