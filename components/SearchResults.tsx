"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PostCard } from "@/components/PostCard";
import { PostCardSkeleton } from "@/components/PostCardSkeleton";
import {
  SearchFilters,
  type SearchFiltersValue,
} from "@/components/SearchFilters";
import {
  SEARCH_PAGE_SIZE,
  isSearchDateFilter,
  isSearchSortOption,
  type Post,
} from "@/lib/post-utils";

type SearchResponse = {
  posts: Post[];
  total: number;
  hasMore: boolean;
};

type SearchResultsProps = {
  query: string;
  categories: string[];
  initialCategory?: string;
  initialDate?: string;
  initialSort?: string;
};

function parseFilters(
  category: string | undefined,
  date: string | undefined,
  sort: string | undefined,
): SearchFiltersValue {
  return {
    category: category?.trim() ?? "",
    date: date && isSearchDateFilter(date) ? date : "all",
    sort: sort && isSearchSortOption(sort) ? sort : "newest",
  };
}

function buildSearchUrl(
  query: string,
  filters: SearchFiltersValue,
  offset: number,
) {
  const params = new URLSearchParams({
    q: query,
    offset: String(offset),
    limit: String(SEARCH_PAGE_SIZE),
    date: filters.date,
    sort: filters.sort,
  });
  if (filters.category) {
    params.set("category", filters.category);
  }
  return `/api/posts/search?${params}`;
}

function buildPageUrl(query: string, filters: SearchFiltersValue) {
  const params = new URLSearchParams();
  if (query) {
    params.set("q", query);
  }
  if (filters.category) {
    params.set("categoria", filters.category);
  }
  if (filters.date !== "all") {
    params.set("data", filters.date);
  }
  if (filters.sort !== "newest") {
    params.set("ordem", filters.sort);
  }
  const qs = params.toString();
  return qs ? `/buscar?${qs}` : "/buscar";
}

export function SearchResults({
  query,
  categories,
  initialCategory,
  initialDate,
  initialSort,
}: SearchResultsProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<SearchFiltersValue>(() =>
    parseFilters(initialCategory, initialDate, initialSort),
  );
  const [posts, setPosts] = useState<Post[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const inFlightRef = useRef(false);

  useEffect(() => {
    const parsed = parseFilters(initialCategory, initialDate, initialSort);
    setFilters((current) =>
      current.category === parsed.category &&
      current.date === parsed.date &&
      current.sort === parsed.sort
        ? current
        : parsed,
    );
  }, [initialCategory, initialDate, initialSort, query]);

  useEffect(() => {
    const controller = new AbortController();
    offsetRef.current = 0;
    inFlightRef.current = false;
    setPosts([]);
    setHasMore(true);
    setError(null);
    setInitialLoading(true);
    setLoadingMore(false);

    async function loadInitial() {
      inFlightRef.current = true;
      try {
        const response = await fetch(buildSearchUrl(query, filters, 0), {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Falha ao buscar posts.");
        }
        const data = (await response.json()) as SearchResponse;
        setPosts(data.posts);
        setHasMore(data.hasMore);
        offsetRef.current = data.posts.length;
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }
        setError(err instanceof Error ? err.message : "Falha ao buscar posts.");
        setHasMore(false);
      } finally {
        if (!controller.signal.aborted) {
          setInitialLoading(false);
          inFlightRef.current = false;
        }
      }
    }

    void loadInitial();
    return () => controller.abort();
  }, [query, filters]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || initialLoading || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || inFlightRef.current || !hasMore) {
          return;
        }

        async function loadMore() {
          inFlightRef.current = true;
          setLoadingMore(true);
          setError(null);
          try {
            const response = await fetch(
              buildSearchUrl(query, filters, offsetRef.current),
            );
            if (!response.ok) {
              throw new Error("Falha ao carregar mais posts.");
            }
            const data = (await response.json()) as SearchResponse;
            setPosts((current) => {
              const seen = new Set(current.map((post) => post.id));
              const next = data.posts.filter((post) => !seen.has(post.id));
              return next.length > 0 ? [...current, ...next] : current;
            });
            setHasMore(data.hasMore);
            offsetRef.current += data.posts.length;
          } catch (err) {
            setError(
              err instanceof Error
                ? err.message
                : "Falha ao carregar mais posts.",
            );
          } finally {
            setLoadingMore(false);
            inFlightRef.current = false;
          }
        }

        void loadMore();
      },
      { rootMargin: "240px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [query, filters, initialLoading, hasMore, posts.length]);

  function handleFiltersChange(next: SearchFiltersValue) {
    setFilters(next);
    router.replace(buildPageUrl(query, next), { scroll: false });
  }

  const showSkeletons = initialLoading || loadingMore;
  const skeletonCount = initialLoading ? SEARCH_PAGE_SIZE : 3;
  const emptyMessage =
    query || filters.category || filters.date !== "all"
      ? "Nenhum post encontrado com esses filtros."
      : "Nenhum post encontrado.";

  return (
    <>
      <SearchFilters
        categories={categories}
        value={filters}
        onChange={handleFiltersChange}
      />

      {error ? (
        <div className="mt-8 rounded-lg border border-red-500/40 bg-red-500/10 p-8 text-red-500">
          {error}
        </div>
      ) : null}

      {!initialLoading && !error && posts.length === 0 ? (
        <div className="mt-8 rounded-lg border border-border bg-surface-muted p-8 text-muted">
          {emptyMessage}
        </div>
      ) : null}

      {posts.length > 0 || showSkeletons ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          {showSkeletons
            ? Array.from({ length: skeletonCount }, (_, index) => (
                <PostCardSkeleton key={`skeleton-${index}`} />
              ))
            : null}
        </div>
      ) : null}

      <div ref={sentinelRef} className="h-1 w-full" aria-hidden="true" />
    </>
  );
}
