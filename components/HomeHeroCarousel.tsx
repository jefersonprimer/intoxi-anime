"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PostAuthor } from "@/components/PostAuthor";
import { formatPostDate, getPostPath, type Post } from "@/lib/post-utils";

const SWIPE_THRESHOLD_PX = 40;
const SWIPE_MEDIA_QUERY = "(max-width: 767px)";

function isSwipeViewport() {
  return window.matchMedia(SWIPE_MEDIA_QUERY).matches;
}

export function HomeHeroCarousel({ posts }: { posts: Post[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const suppressClickRef = useRef(false);
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

  function handleTouchStart(event: React.TouchEvent) {
    if (posts.length < 2 || !isSwipeViewport()) {
      return;
    }
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: React.TouchEvent) {
    if (
      posts.length < 2 ||
      touchStartX.current === null ||
      !isSwipeViewport()
    ) {
      touchStartX.current = null;
      return;
    }

    const endX = event.changedTouches[0]?.clientX;
    if (endX === undefined) {
      touchStartX.current = null;
      return;
    }

    const deltaX = endX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) {
      return;
    }

    suppressClickRef.current = true;
    move(deltaX < 0 ? 1 : -1);
  }

  function handleLinkClick(event: React.MouseEvent) {
    if (suppressClickRef.current) {
      event.preventDefault();
      suppressClickRef.current = false;
    }
  }

  return (
    <section>
      <div className="mx-auto max-w-7xl">
        <div
          className="relative touch-pan-y md:touch-auto"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <Link
            href={getPostPath(activePost)}
            onClick={handleLinkClick}
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
                className="group absolute inset-y-0 left-0 z-10 hidden w-24 items-center justify-center focus:outline-none md:flex"
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
                className="group absolute inset-y-0 right-0 z-10 hidden w-24 items-center justify-center focus:outline-none md:flex"
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
          <span className="inline-block w-fit text-xs font-bold px-2 py-1 uppercase tracking-[0.2em] text-category-fg bg-[#1e73be] rounded-full hover:bg-transparent hover:text-[#1e73be] hover:border-[#1e73be] border">
            {activePost.category}
          </span>
          <h1 className="mt-2 text-xl font-black leading-tight text-foreground transition hover:text-link-hover sm:text-3xl lg:text-4xl">
            {activePost.title}
          </h1>
        </Link>
        <div className="mt-4 px-4 sm:px-0 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-normal text-muted">
          <PostAuthor author={activePost.author} />
          <span className="uppercase">
            {formatPostDate(activePost.createdAt)}
          </span>
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
                    : "h-2 w-2 rounded-full bg-foreground/25 transition hover:bg-foreground/50"
                }
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
