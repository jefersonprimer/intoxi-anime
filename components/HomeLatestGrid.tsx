import Image from "next/image";
import Link from "next/link";
import { PostAuthor } from "@/components/PostAuthor";
import { formatPostDate, getPostPath, type Post } from "@/lib/post-utils";

interface HomeLatestGridProps {
  posts: Post[];
}

export function HomeLatestGrid({ posts }: HomeLatestGridProps) {
  if (!posts || posts.length === 0) {
    return null;
  }

  const bigPost = posts[0];
  const smallPosts = posts.slice(1, 4);
  const mediumPosts = posts.slice(4, 7);

  return (
    <section className="mt-8">
      <div className="mb-4">
        <h2 className="mb-2 text-2xl font-medium text-foreground md:text-3xl">
          Últimas notícias
        </h2>
        <div aria-hidden="true" className="h-1 overflow-hidden bg-[#1e73be]" />
      </div>

      {/* Layout em colunas com bordas: apenas em sm+ */}
      <div className="hidden grid-cols-1 gap-6 sm:grid sm:grid-cols-12 sm:gap-0 sm:divide-x sm:divide-border">
        {/* Col 1: card grande */}
        <div className="sm:col-span-5 sm:pr-6">
          <Link
            href={getPostPath(bigPost)}
            className="group flex h-full flex-col"
          >
            <div className="relative aspect-video w-full overflow-hidden">
              {bigPost.bannerImageUrl ? (
                <Image
                  src={bigPost.bannerImageUrl}
                  alt={bigPost.title}
                  fill
                  unoptimized
                  className="object-contain transition duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#164e63,#0f172a_58%,#020617)]" />
              )}
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <div>
                <span className="inline-block w-fit text-xs font-bold px-2 py-1 uppercase tracking-[0.2em] text-category-fg bg-[#1e73be] rounded-full hover:bg-transparent hover:text-[#1e73be] hover:border-[#1e73be] border">
                  {bigPost.category}
                </span>
              </div>
              <h2 className="text-xl font-black leading-snug text-foreground transition group-hover:text-link-hover sm:text-2xl">
                {bigPost.title}
              </h2>
              <div className="flex flex-col gap-2 text-muted">
                <p className="shrink-0 text-xs font-normal uppercase">
                  {formatPostDate(bigPost.createdAt)}
                </p>
                <PostAuthor
                  author={bigPost.author}
                  className="min-w-0"
                  link={false}
                />
              </div>
            </div>
          </Link>
        </div>

        {/* Col 2: cards pequenos em coluna */}
        <div className="sm:col-span-3 sm:px-6">
          <div className="flex flex-col divide-y divide-border">
            {smallPosts.map((post) => (
              <Link
                key={post.id}
                href={getPostPath(post)}
                className="group flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="w-fit rounded-lg bg-[#1e73be] px-1.5 py-0.5 text-[10px] font-bold uppercase text-category-fg">
                    {post.category}
                  </span>
                  <h4 className="line-clamp-2 text-xs font-black leading-snug text-foreground transition group-hover:text-link-hover sm:text-sm">
                    {post.title}
                  </h4>
                  <p className="text-[11px] font-normal text-muted">
                    {formatPostDate(post.createdAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Col 3: cards medios em coluna */}
        <div className="sm:col-span-4 sm:pl-6">
          <div className="flex flex-col gap-5">
            {mediumPosts.map((post) => (
              <Link
                key={post.id}
                href={getPostPath(post)}
                className="group flex flex-col gap-2 sm:flex-row"
              >
                <div className="relative h-24 w-full shrink-0 overflow-hidden sm:h-24 sm:w-36">
                  {post.bannerImageUrl ? (
                    <Image
                      src={post.bannerImageUrl}
                      alt={post.title}
                      fill
                      unoptimized
                      className="object-contain transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#164e63,#0f172a_58%,#020617)]" />
                  )}
                </div>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <div>
                    <span className="inline-block w-fit rounded-xl bg-[#1e73be] px-2 py-0.5 text-xs font-bold uppercase text-category-fg">
                      {post.category}
                    </span>
                  </div>
                  <h4 className="line-clamp-2 text-sm font-black leading-snug text-foreground transition group-hover:text-link-hover">
                    {post.title}
                  </h4>
                  <p className="shrink-0 text-xs font-normal text-muted">
                    {formatPostDate(post.createdAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Layout alternativo para telas menores */}
      <div className="flex flex-col gap-6 sm:hidden">
        <Link href={getPostPath(bigPost)} className="group flex flex-col">
          <div className="relative aspect-video w-full overflow-hidden">
            {bigPost.bannerImageUrl ? (
              <Image
                src={bigPost.bannerImageUrl}
                alt={bigPost.title}
                fill
                unoptimized
                className="object-contain transition duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#164e63,#0f172a_58%,#020617)]" />
            )}
          </div>
          <div className="mt-3 flex flex-col gap-2 px-4 sm:px-0">
            <div>
              <span className="inline-block w-fit rounded-xl bg-[#1e73be] px-2 py-0.5 text-xs font-bold uppercase text-category-fg">
                {bigPost.category}
              </span>
            </div>
            <h2 className="text-xl font-black leading-snug text-foreground transition group-hover:text-link-hover">
              {bigPost.title}
            </h2>
            <div className="flex flex-col gap-2 text-muted">
              <p className="shrink-0 text-xs font-normal uppercase">
                {formatPostDate(bigPost.createdAt)}
              </p>
              <PostAuthor
                author={bigPost.author}
                className="min-w-0"
                link={false}
              />
            </div>
          </div>
        </Link>

        <div className="flex flex-col gap-6">
          {[...smallPosts, ...mediumPosts].map((post) => (
            <Link
              key={post.id}
              href={getPostPath(post)}
              className="group flex flex-col"
            >
              <div className="relative aspect-video w-full overflow-hidden">
                {post.bannerImageUrl ? (
                  <Image
                    src={post.bannerImageUrl}
                    alt={post.title}
                    fill
                    unoptimized
                    className="object-contain transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#164e63,#0f172a_58%,#020617)]" />
                )}
              </div>
              <div className="mt-2 flex flex-col gap-1.5 px-4 sm:px-0">
                <div>
                  <span className="inline-block w-fit rounded-xl bg-[#1e73be] px-2 py-0.5 text-xs font-bold uppercase text-category-fg">
                    {post.category}
                  </span>
                </div>
                <h3 className="line-clamp-2 text-sm font-black leading-snug text-foreground transition group-hover:text-link-hover sm:text-base">
                  {post.title}
                </h3>
                <div className="flex flex-col gap-2 text-muted">
                  <p className="shrink-0 text-xs font-normal">
                    {formatPostDate(post.createdAt)}
                  </p>
                  <PostAuthor
                    author={post.author}
                    className="min-w-0"
                    link={false}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
