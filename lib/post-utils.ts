export const SEARCH_PAGE_SIZE = 20;

export const SEASON_GUIDES_CATEGORY = "Guias de Temporada";
export const SEASON_GUIDES_SLUG = categoryToSlug(SEASON_GUIDES_CATEGORY);

export const SEARCH_DATE_FILTERS = [
  { value: "all", label: "Todos" },
  { value: "24h", label: "Ultimas 24 horas" },
  { value: "week", label: "Ultima semana" },
  { value: "month", label: "Ultimo mes" },
  { value: "year", label: "Esse ano" },
] as const;

export const SEARCH_SORT_OPTIONS = [
  { value: "newest", label: "Novos para os ultimos" },
  { value: "oldest", label: "Ultimos para os novos" },
] as const;

export type SearchDateFilter = (typeof SEARCH_DATE_FILTERS)[number]["value"];
export type SearchSortOption = (typeof SEARCH_SORT_OPTIONS)[number]["value"];

export function isSearchDateFilter(value: string): value is SearchDateFilter {
  return SEARCH_DATE_FILTERS.some((option) => option.value === value);
}

export function isSearchSortOption(value: string): value is SearchSortOption {
  return SEARCH_SORT_OPTIONS.some((option) => option.value === value);
}

export type Author = {
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  xUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  youtubeUrl: string | null;
  tiktokUrl: string | null;
  websiteUrl: string | null;
};

export const AUTHOR_LINK_FIELDS = [
  "xUrl",
  "instagramUrl",
  "facebookUrl",
  "youtubeUrl",
  "tiktokUrl",
  "websiteUrl",
] as const;

export type AuthorLinkField = (typeof AUTHOR_LINK_FIELDS)[number];

export function emptyAuthorLinks(): Pick<Author, AuthorLinkField> {
  return {
    xUrl: null,
    instagramUrl: null,
    facebookUrl: null,
    youtubeUrl: null,
    tiktokUrl: null,
    websiteUrl: null,
  };
}

export function hasAuthorLinks(author: Pick<Author, AuthorLinkField> | null) {
  if (!author) {
    return false;
  }
  return AUTHOR_LINK_FIELDS.some((field) => Boolean(author[field]?.trim()));
}

export function hasAuthorBio(author: Author | null | undefined) {
  return Boolean(author?.bio?.trim());
}

export type Post = {
  id: string;
  title: string;
  slug: string;
  category: string;
  tags: string[];
  bannerImageUrl: string | null;
  summary: string | null;
  contentHtml: string;
  readingTimeMinutes: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  author: Author | null;
};

export function normalizeTags(value: unknown): string[] {
  const raw = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/[,;]/)
      : [];

  const seen = new Set<string>();
  const tags: string[] = [];

  for (const item of raw) {
    const tag = String(item ?? "")
      .trim()
      .replace(/\s+/g, " ");
    if (!tag) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    tags.push(tag.slice(0, 40));
  }

  return tags.slice(0, 12);
}

export function extractFirstImageUrl(html: string): string {
  const match = /<img[^>]+src=["']([^"']+)["']/i.exec(html);
  return match?.[1] ?? "";
}

export function formatPostDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export const FALLBACK_AUTHOR_NAME = "Equipe Intoxi Anime";

export function authorToSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function categoryToSlug(category: string): string {
  return category
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getPostPath(
  post: Pick<Post, "category" | "slug" | "createdAt">,
) {
  const date = new Date(post.createdAt);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  return `/${categoryToSlug(post.category)}/${year}/${month}/${day}/${post.slug}`;
}

