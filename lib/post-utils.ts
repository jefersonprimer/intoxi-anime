export type Author = {
  name: string;
  avatarUrl: string | null;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  category: string;
  bannerImageUrl: string | null;
  summary: string | null;
  contentHtml: string;
  readingTimeMinutes: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  author: Author | null;
};

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

