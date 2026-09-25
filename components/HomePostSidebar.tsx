import Image from "next/image";
import Link from "next/link";
import { PostSidebarBanner } from "@/components/PostSidebarBanner";
import { formatPostDate, getPostPath, type Post } from "@/lib/post-utils";

export function HomePostSidebar({
  posts,
  title = "Destaques",
  bgClass,
  horizontal = false,
  allPostsLabel = "Ver tudo",
}: {
  posts: Post[];
  title?: string;
  bgClass?: string;
  horizontal?: boolean;
  allPostsLabel?: string;
}) {
  const orderedPosts = [...posts].sort(
    (a, b) => Number(b.isFeatured) - Number(a.isFeatured),
  );

  return (
    <aside className="sticky gap-2 top-6 flex flex-col self-start rounded-lg sm:p-5 lg:top-24">
      <div>
        <h1 className="mb-2 text-2xl md:text-3xl font-medium text-foreground">
          {title}
        </h1>

        <div
          aria-hidden="true"
          className="relative, h-1 overflow-hidden bg-[#1e73be]"
        />
      </div>
      <div className={`flex flex-1 flex-col gap-4 ${bgClass ?? ""}`}>
        {orderedPosts.map((post, index) => (
          <Link
            key={post.id}
            href={getPostPath(post)}
            className={`group flex gap-2.5 ${
              horizontal ? "flex-row items-start" : "flex-col"
            } ${
              index < orderedPosts.length - 1
                ? "border-b border-border pb-4"
                : ""
            }`}
          >
            <div
              className={`relative overflow-hidden ${
                horizontal
                  ? "h-[74px] w-[132px] max-h-[74px] max-w-[132px] shrink-0 self-center"
                  : "aspect-video w-full"
              }`}
            >
              {post.bannerImageUrl ? (
                <Image
                  src={post.bannerImageUrl}
                  alt=""
                  fill
                  unoptimized
                  className="object-contain transition duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#164e63,#0f172a_58%,#020617)]" />
              )}
            </div>
            <div className="min-w-0 space-y-1.5">
              <span className="inline-block w-fit text-xs font-bold px-2 uppercase text-category-fg bg-[#1e73be] rounded-full">
                {post.category}
              </span>
              <h3 className="line-clamp-2 text-sm font-bold text-foreground">
                {post.title}
              </h3>
              <div className="flex items-center justify-between gap-2">
                <p className="shrink-0 text-xs font-normal text-muted uppercase">
                  {formatPostDate(post.createdAt)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <Link
        href="http://localhost:3001/noticias"
        className="w-full border border-[#1e73be] px-4 py-2 text-center text-sm font-bold text-[#1e73be] transition hover:bg-[#1e73be] hover:text-white"
      >
        {allPostsLabel}
      </Link>
      <PostSidebarBanner />
    </aside>
  );
}
