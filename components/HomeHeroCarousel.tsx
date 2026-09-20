"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PostAuthor } from "@/components/PostAuthor";
import { formatPostDate, getPostPath, type Post } from "@/lib/post-utils";

export function HomeHeroCarousel({ posts }: { posts: Post[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activePost = posts[activeIndex];

  useEffect(() => {
    if (posts.length < 2) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % posts.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, [posts.length]);

  if (!activePost) {
    return null;
  }

  function move(direction: number) {
    setActiveIndex(
      (current) => (current + direction + posts.length) % posts.length,
    );
  }

  return (
    <section>
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="relative">
          <Link
            href={getPostPath(activePost)}
            className="relative block aspect-video overflow-hidden cursor-pointer group sm:rounded-xl lg:rounded-2xl"
          >
            {activePost.bannerImageUrl ? (
              <Image
                src={activePost.bannerImageUrl}
                alt=""
                fill
                priority
                unoptimized
                className="object-contain transition-transform duration-300 group-hover:scale-[1.01]"
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#164e63,#0f172a_58%,#020617)]" />
            )}
          </Link>

          {posts.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => move(-1)}
                className="group absolute inset-y-0 left-0 z-10 flex w-16 items-center justify-center focus:outline-none sm:w-24"
                aria-label="Post anterior"
              >
                <ChevronLeft
                  size={48}
                  className="text-white/75 transition-all duration-300 drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] group-hover:-translate-x-1 group-hover:scale-115 group-hover:text-white"
                />
              </button>
              <button
                type="button"
                onClick={() => move(1)}
                className="group absolute inset-y-0 right-0 z-10 flex w-16 items-center justify-center focus:outline-none sm:w-24"
                aria-label="Proximo post"
              >
                <ChevronRight
                  size={48}
                  className="text-white/75 transition-all duration-300 drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] group-hover:translate-x-1 group-hover:scale-115 group-hover:text-white"
                />
              </button>
            </>
          ) : null}
        </div>

        <Link
          href={getPostPath(activePost)}
          className="block mt-2 px-4 sm:px-0"
        >
          <span className="inline-block w-fit text-xs font-bold px-2 py-1 uppercase tracking-[0.2em] text-[#1E1E1E] bg-[#1e73be] rounded-xl">
            {activePost.category}
          </span>
          <h1 className="mt-2 text-2xl font-black leading-tight text-white transition hover:text-sky-300 sm:text-3xl lg:text-4xl">
            {activePost.title}
          </h1>
        </Link>
        <div className="mt-4  px-4 sm:px-0 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-normal text-[#a0a0a0]">
          <PostAuthor author={activePost.author} />
          <span>{formatPostDate(activePost.createdAt)}</span>
        </div>

        {posts.length > 1 ? (
          <div className="mt-5 flex items-center gap-2  px-4 sm:px-0">
            {posts.map((post, index) => (
              <button
                key={post.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Ver post ${index + 1}`}
                className={
                  index === activeIndex
                    ? "h-2 w-6 rounded-full bg-sky-400"
                    : "h-2 w-2 rounded-full bg-white/25 transition hover:bg-white/50"
                }
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
