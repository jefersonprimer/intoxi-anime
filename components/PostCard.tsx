import Link from "next/link";
import { Clock3 } from "lucide-react";
import Image from "next/image";
import { PostAuthor } from "@/components/PostAuthor";
import { formatPostDate, getPostPath, type Post } from "@/lib/post-utils";

export function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={getPostPath(post)}
      className="group overflow-hidden transition hover:-translate-y-1"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        {post.bannerImageUrl ? (
          <Image
            src={post.bannerImageUrl}
            alt=""
            fill
            unoptimized
            className="object-contain transition duration-500 group-hover:scale-105"
          />
        ) : null}
      </div>
      <div className="space-y-3 px-4 sm:px-0 sm:pt-4">
        <span className="inline-block w-fit text-xs font-bold px-2 py-1 uppercase tracking-[0.2em] text-category-fg bg-[#1e73be] rounded-full hover:bg-transparent hover:text-[#1e73be] hover:border-[#1e73be] border">
          {post.category}
        </span>
        <h3 className="line-clamp-2 text-lg font-black leading-tight text-foreground">
          {post.title}
        </h3>
        {post.summary ? (
          <p className="line-clamp-2 text-sm leading-6 text-muted">
            {post.summary}
          </p>
        ) : null}
        <div className="flex flex-col gap-2 pt-1 text-muted">
          <span className="shrink-0 text-xs font-normal uppercase">
            {formatPostDate(post.createdAt)}
          </span>
          <PostAuthor author={post.author} className="min-w-0" link={false} />
        </div>
      </div>
    </Link>
  );
}
