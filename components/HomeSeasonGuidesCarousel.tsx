"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { PostCard } from "@/components/PostCard";
import type { Post } from "@/lib/post-utils";

export function HomeSeasonGuidesCarousel({ posts }: { posts: Post[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (!posts || posts.length === 0) {
    return null;
  }

  function scrollByCards(direction: number) {
    const track = trackRef.current;
    if (!track) {
      return;
    }
    const card = track.querySelector<HTMLElement>("[data-card]");
    const cardWidth = card ? card.offsetWidth + 20 : 300;
    track.scrollBy({ left: direction * cardWidth, behavior: "smooth" });
  }

  return (
    <section className="mt-8">
      <div>
        <h1 className="mb-2 text-2xl md:text-3xl font-medium text-foreground">
          Guias de Temporada
        </h1>

        <div
          aria-hidden="true"
          className="relative, h-1 overflow-hidden bg-[#1e73be]"
        />
      </div>

      <div className="relative">
        {posts.length > 4 ? (
          <>
            <button
              type="button"
              onClick={() => scrollByCards(-1)}
              aria-label="Guias anteriores"
              className="absolute top-1/2 -left-3 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-foreground hover:text-link-hover transition"
            >
              <ChevronLeft size={34} />
            </button>
            <button
              type="button"
              onClick={() => scrollByCards(1)}
              aria-label="Proximos guias"
              className="absolute top-1/2 -right-3 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-foreground hover:text-link-hover transition"
            >
              <ChevronRight size={34} />
            </button>
          </>
        ) : null}

        <div
          ref={trackRef}
          className="-mx-1 flex snap-x snap-mandatory gap-5 overflow-x-auto px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {posts.map((post) => (
            <div
              key={post.id}
              data-card
              className="w-[calc(100%-1.25rem)] shrink-0 snap-start sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-3.75rem)/4)]"
            >
              <PostCard post={post} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
