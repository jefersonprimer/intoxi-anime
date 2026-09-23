import Image from "next/image";
import Link from "next/link";
import { formatPostDate, getPostPath, type Post } from "@/lib/post-utils";

export function HomePostSidebar({
  posts,
  title = "Destaques",
}: {
  posts: Post[];
  title?: string;
}) {
  const orderedPosts = [...posts].sort(
    (a, b) => Number(b.isFeatured) - Number(a.isFeatured),
  );

  return (
    <aside className="sticky top-6 flex flex-col self-start rounded-lg  p-5 lg:top-24">
      <p className="mb-4 text-2xl md:text-4xl font-bold text-white">{title}</p>
      <div className="flex flex-1 flex-col gap-4">
        {orderedPosts.map((post, index) => (
          <Link
            key={post.id}
            href={getPostPath(post)}
            className={`group flex gap-4 ${
              index < orderedPosts.length - 1
                ? "border-b border-white/5 pb-4"
                : ""
            }`}
          >
            <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-md sm:w-40">
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
              <span className="inline-block w-fit text-xs font-bold px-2 uppercase text-[#1E1E1E] bg-[#1e73be] rounded-xl">
                {post.category}
              </span>
              <h3 className="line-clamp-2 text-sm font-bold text-white">
                {post.title}
              </h3>
              <div className="flex items-center justify-between gap-2">
                <p className="shrink-0 text-[10px] font-normal text-[#a0a0a0]">
                  {formatPostDate(post.createdAt)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
}
