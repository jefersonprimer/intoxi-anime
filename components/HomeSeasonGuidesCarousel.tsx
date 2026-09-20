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
    <section className="mt-8 sm:px-6 lg:px-8">
      <div className="mb-4">
        <h2 className="mt-2 text-2xl font-black text-white">
          Guias de Temporada
        </h2>
      </div>

      <div className="relative">
        {posts.length > 3 ? (
          <>
            <button
              type="button"
              onClick={() => scrollByCards(-1)}
              aria-label="Guias anteriores"
              className="absolute top-1/2 -left-3 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center  text-white hover:text-[#f2f2f2]  transition "
            >
              <ChevronLeft size={34} />
            </button>
            <button
              type="button"
              onClick={() => scrollByCards(1)}
              aria-label="Proximos guias"
              className="absolute top-1/2 -right-3 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center  text-white  hover:text-[#f2f2f2] transition"
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
              className="w-[calc(100%-1.25rem)] shrink-0 snap-start sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]"
            >
              <PostCard post={post} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
