import { getClient } from "@/lib/db";
import { calculateReadingTime } from "@/lib/reading-time";
import {
  FALLBACK_AUTHOR_NAME,
  SEARCH_PAGE_SIZE,
  authorToSlug,
  categoryToSlug,
  emptyAuthorLinks,
  normalizeTags,
  type Author,
  type Post,
  type SearchDateFilter,
  type SearchSortOption,
} from "@/lib/post-utils";


type SqlClient = ReturnType<typeof getClient>;

type DbPost = {
  id: string;
  title: string;
  slug: string;
  category: string;
  tags: string[] | null;
  banner_image_url: string | null;
  summary: string | null;
  content_html: string;
  reading_time_minutes: number;
  is_featured: boolean;
  created_at: Date;
  updated_at: Date;
  author_name: string | null;
  author_avatar_url: string | null;
  author_bio: string | null;
  author_x_url: string | null;
  author_instagram_url: string | null;
  author_facebook_url: string | null;
  author_youtube_url: string | null;
  author_tiktok_url: string | null;
  author_website_url: string | null;
};

function postSelect(sql: SqlClient) {
  return sql`
    SELECT
      p.id,
      p.title,
      p.slug,
      p.category,
      p.tags,
      p.banner_image_url,
      p.summary,
      p.content_html,
      p.reading_time_minutes,
      p.is_featured,
      p.created_at,
      p.updated_at,
      u.name AS author_name,
      u.avatar_url AS author_avatar_url,
      u.bio AS author_bio,
      u.x_url AS author_x_url,
      u.instagram_url AS author_instagram_url,
      u.facebook_url AS author_facebook_url,
      u.youtube_url AS author_youtube_url,
      u.tiktok_url AS author_tiktok_url,
      u.website_url AS author_website_url
    FROM posts p
    LEFT JOIN users u ON u.id = p.author_id
  `;
}

const demoPosts: Post[] = [
  {
    id: "demo-majo-to-youhei",
    title:
      "Majo to Youhei - Anime sobre mercenario ajudando bruxa a se salvar ganha trailer",
    slug: "majo-to-youhei-anime-mercenario-bruxa-trailer",
    category: "Noticias",
    tags: ["trailer", "fantasia", "estreia"],
    bannerImageUrl:
      "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&w=1600&q=80",
    summary:
      "A nova previa apresentou o tom de fantasia sombria, dupla principal e primeiros detalhes da producao.",
    contentHtml:
      "<p>A adaptacao ganhou um trailer focado na jornada do mercenario e da bruxa, destacando acao, magia e uma relacao de sobrevivencia.</p>",
    readingTimeMinutes: 4,
    isFeatured: true,
    createdAt: "2026-09-18T12:00:00.000Z",
    updatedAt: "2026-09-18T12:00:00.000Z",
    author: { name: "Redacao Intoxi", avatarUrl: null, bio: null, ...emptyAuthorLinks() },
  },
  {
    id: "demo-season",
    title: "Temporada de outono revela novas estreias de fantasia e acao",
    slug: "temporada-outono-estreias-fantasia-acao",
    category: "Guia",
    tags: ["temporada", "outono", "guia"],
    bannerImageUrl:
      "https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?auto=format&fit=crop&w=1200&q=80",
    summary:
      "Selecionamos os animes que mais chamaram atencao nas primeiras sinopses da temporada.",
    contentHtml:
      "<p>A temporada chega com apostas fortes em fantasia, romances sobrenaturais e series de acao.</p>",
    readingTimeMinutes: 6,
    isFeatured: false,
    createdAt: "2026-09-17T12:00:00.000Z",
    updatedAt: "2026-09-17T12:00:00.000Z",
    author: { name: "Redacao Intoxi", avatarUrl: null, bio: null, ...emptyAuthorLinks() },
  },
  {
    id: "demo-trailer",
    title: "Novo trailer destaca batalhas e visual de anime original",
    slug: "novo-trailer-batalhas-visual-anime-original",
    category: "Trailer",
    tags: ["trailer", "acao", "original"],
    bannerImageUrl:
      "https://images.unsplash.com/photo-1618331835717-801e976710b2?auto=format&fit=crop&w=1200&q=80",
    summary:
      "O projeto original aposta em composicao cinematografica e direcao de arte com tons frios.",
    contentHtml:
      "<p>O video promocional reforca o clima urbano da obra e revela trechos da musica de abertura.</p>",
    readingTimeMinutes: 3,
    isFeatured: false,
    createdAt: "2026-09-16T12:00:00.000Z",
    updatedAt: "2026-09-16T12:00:00.000Z",
    author: { name: "Redacao Intoxi", avatarUrl: null, bio: null, ...emptyAuthorLinks() },
  },
];

function mapAuthor(post: DbPost): Author | null {
  if (!post.author_name) {
    return null;
  }
  return {
    name: post.author_name,
    avatarUrl: post.author_avatar_url,
    bio: post.author_bio,
    xUrl: post.author_x_url,
    instagramUrl: post.author_instagram_url,
    facebookUrl: post.author_facebook_url,
    youtubeUrl: post.author_youtube_url,
    tiktokUrl: post.author_tiktok_url,
    websiteUrl: post.author_website_url,
  };
}

function mapPost(post: DbPost): Post {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    category: post.category,
    tags: normalizeTags(post.tags),
    bannerImageUrl: post.banner_image_url,
    summary: post.summary,
    contentHtml: post.content_html,
    readingTimeMinutes: post.reading_time_minutes,
    isFeatured: post.is_featured,
    createdAt: post.created_at.toISOString(),
    updatedAt: post.updated_at.toISOString(),
    author: mapAuthor(post),
  };
}

export function getDemoPosts() {
  return [...demoPosts].sort(
    (a, b) => Number(b.isFeatured) - Number(a.isFeatured),
  );
}

export async function getPosts() {
  try {
    const sql = getClient();
    const posts = await sql<DbPost[]>`
      ${postSelect(sql)}
      ORDER BY p.is_featured DESC, p.created_at DESC
    `;

    return posts.length > 0 ? posts.map(mapPost) : demoPosts;
  } catch {
    return demoPosts;
  }
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function toSearchResult(post: Post): Post {
  return { ...post, contentHtml: "" };
}

function getDateFilterCutoff(
  dateFilter: SearchDateFilter,
  now = new Date(),
): Date | null {
  switch (dateFilter) {
    case "24h":
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case "week":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "month":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "year":
      return new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
    case "all":
    default:
      return null;
  }
}

export async function getPostCategories() {
  const posts = await getPosts();
  const categories = new Set(posts.map((post) => post.category.trim()).filter(Boolean));
  return [...categories].sort((a, b) =>
    a.localeCompare(b, "pt-BR", { sensitivity: "base" }),
  );
}

export async function searchPosts(options: {
  query?: string;
  category?: string;
  date?: SearchDateFilter;
  sort?: SearchSortOption;
  offset?: number;
  limit?: number;
}) {
  const query = options.query?.trim() ?? "";
  const category = options.category?.trim() ?? "";
  const dateFilter = options.date ?? "all";
  const sort = options.sort ?? "newest";
  const offset = Math.max(0, options.offset ?? 0);
  const limit = Math.min(
    50,
    Math.max(1, options.limit ?? SEARCH_PAGE_SIZE),
  );
  const posts = await getPosts();
  const normalizedQuery = normalizeSearchText(query);
  const categorySlug = category ? categoryToSlug(category) : "";
  const cutoff = getDateFilterCutoff(dateFilter);

  const filtered = posts.filter((post) => {
    if (normalizedQuery) {
      const haystack = normalizeSearchText(
        [post.title, post.category, post.summary ?? "", ...post.tags].join(" "),
      );
      if (!haystack.includes(normalizedQuery)) {
        return false;
      }
    }

    if (categorySlug && categoryToSlug(post.category) !== categorySlug) {
      return false;
    }

    if (cutoff && new Date(post.createdAt) < cutoff) {
      return false;
    }

    return true;
  });

  filtered.sort((a, b) => {
    const delta =
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return sort === "oldest" ? delta : -delta;
  });

  const page = filtered.slice(offset, offset + limit).map(toSearchResult);

  return {
    posts: page,
    total: filtered.length,
    offset,
    limit,
    hasMore: offset + page.length < filtered.length,
  };
}

export async function getPostBySlug(slug: string) {
  try {
    const sql = getClient();
    const posts = await sql<DbPost[]>`
      ${postSelect(sql)}
      WHERE p.slug = ${slug}
      LIMIT 1
    `;

    return posts[0] ? mapPost(posts[0]) : demoPosts.find((post) => post.slug === slug);
  } catch {
    return demoPosts.find((post) => post.slug === slug);
  }
}

export function createSlug(title: string) {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 90);
}

export async function createPost(input: {
  title: string;
  category: string;
  tags?: string[];
  bannerImageUrl?: string;
  summary?: string;
  contentHtml: string;
  isFeatured?: boolean;
  authorId?: string;
}) {
  const sql = getClient();
  const tags = normalizeTags(input.tags);
  const baseSlug = createSlug(input.title);
  const existing = await sql<{ slug: string }[]>`
    SELECT slug
    FROM posts
    WHERE slug LIKE ${`${baseSlug}%`}
  `;
  const used = new Set(existing.map((row) => row.slug));
  let slug = baseSlug;
  let index = 1;
  while (used.has(slug)) {
    index += 1;
    slug = `${baseSlug}-${index}`;
  }
  const posts = await sql<DbPost[]>`
    WITH inserted AS (
      INSERT INTO posts (
        title,
        slug,
        category,
        tags,
        banner_image_url,
        summary,
        content_html,
        reading_time_minutes,
        is_featured,
        author_id
      )
      VALUES (
        ${input.title},
        ${slug},
        ${input.category},
        ${tags},
        ${input.bannerImageUrl || null},
        ${input.summary || null},
        ${input.contentHtml},
        ${calculateReadingTime(input.contentHtml)},
        ${input.isFeatured ?? false},
        ${input.authorId || null}
      )
      RETURNING *
    )
    SELECT
      inserted.*,
      u.name AS author_name,
      u.avatar_url AS author_avatar_url,
      u.bio AS author_bio,
      u.x_url AS author_x_url,
      u.instagram_url AS author_instagram_url,
      u.facebook_url AS author_facebook_url,
      u.youtube_url AS author_youtube_url,
      u.tiktok_url AS author_tiktok_url,
      u.website_url AS author_website_url
    FROM inserted
    LEFT JOIN users u ON u.id = inserted.author_id
  `;

  return mapPost(posts[0]);
}

export async function getPostById(id: string) {
  try {
    const sql = getClient();
    const posts = await sql<DbPost[]>`
      ${postSelect(sql)}
      WHERE p.id = ${id}
      LIMIT 1
    `;

    return posts[0] ? mapPost(posts[0]) : null;
  } catch {
    return null;
  }
}

export async function updatePost(
  id: string,
  input: {
    title: string;
    category: string;
    tags?: string[];
    bannerImageUrl?: string;
    summary?: string;
    contentHtml: string;
    isFeatured?: boolean;
  },
) {
  const sql = getClient();
  const tags = normalizeTags(input.tags);
  const posts = await sql<DbPost[]>`
    WITH updated AS (
      UPDATE posts
      SET
        title = ${input.title},
        category = ${input.category},
        tags = ${tags},
        banner_image_url = ${input.bannerImageUrl || null},
        summary = ${input.summary || null},
        content_html = ${input.contentHtml},
        reading_time_minutes = ${calculateReadingTime(input.contentHtml)},
        is_featured = ${input.isFeatured ?? false}
      WHERE id = ${id}
      RETURNING *
    )
    SELECT
      updated.*,
      u.name AS author_name,
      u.avatar_url AS author_avatar_url,
      u.bio AS author_bio,
      u.x_url AS author_x_url,
      u.instagram_url AS author_instagram_url,
      u.facebook_url AS author_facebook_url,
      u.youtube_url AS author_youtube_url,
      u.tiktok_url AS author_tiktok_url,
      u.website_url AS author_website_url
    FROM updated
    LEFT JOIN users u ON u.id = updated.author_id
  `;

  return posts[0] ? mapPost(posts[0]) : null;
}

export async function deletePost(id: string) {
  const sql = getClient();
  const posts = await sql<{ id: string }[]>`
    DELETE FROM posts
    WHERE id = ${id}
    RETURNING id
  `;

  return posts[0]?.id ?? null;
}

const SEASON_GUIDE_CATEGORY = "Guia";

export function isSeasonGuide(post: Post) {
  const cat = post.category.trim().toLowerCase();
  return (
    cat === "guia" ||
    cat === "guias" ||
    cat.includes("guia") ||
    cat.includes("temporada")
  );
}

export function getPostYear(post: Post) {
  return new Date(post.createdAt).getFullYear();
}

export async function getSeasonGuidePosts() {
  const posts = await getPosts();
  return posts.filter(isSeasonGuide);
}

export function isSpecialArticle(post: Post) {
  const category = post.category.trim().toLowerCase();
  const tags = post.tags.map((tag) => tag.toLowerCase());
  return (
    category === "especial" ||
    category.includes("especial") ||
    tags.includes("especial")
  );
}

export async function getSpecialPosts() {
  const posts = await getPosts();
  return posts.filter(isSpecialArticle);
}

export async function getSeasonGuideYears() {
  const guides = await getSeasonGuidePosts();
  return [...new Set(guides.map(getPostYear))].sort((a, b) => b - a);
}

export function isSeasonGuideCategorySlug(categorySlug: string) {
  const slug = categoryToSlug(categorySlug);
  return slug.includes("guia") || slug.includes("temporada");
}

export async function getPostsByCategory(categorySlug: string) {
  if (isSeasonGuideCategorySlug(categorySlug)) {
    return getSeasonGuidePosts();
  }

  const posts = await getPosts();
  const targetSlug = categoryToSlug(categorySlug);
  return posts.filter(
    (post) => categoryToSlug(post.category) === targetSlug
  );
}

export async function getPostsByAuthor(authorSlug: string) {
  const targetSlug = authorToSlug(authorSlug);
  const posts = await getPosts();
  return posts.filter((post) => {
    const authorName = post.author?.name?.trim() || FALLBACK_AUTHOR_NAME;
    return authorToSlug(authorName) === targetSlug;
  });
}

type DbAuthor = {
  name: string;
  avatar_url: string | null;
  bio: string | null;
  x_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  website_url: string | null;
};

export async function getAuthorBySlug(authorSlug: string): Promise<Author | null> {
  const targetSlug = authorToSlug(authorSlug);
  const sql = getClient();

  try {
    const rows = await sql<DbAuthor[]>`
      SELECT
        name,
        avatar_url,
        bio,
        x_url,
        instagram_url,
        facebook_url,
        youtube_url,
        tiktok_url,
        website_url
      FROM users
      WHERE name IS NOT NULL AND name <> ''
    `;

    const row = rows.find((user) => authorToSlug(user.name) === targetSlug);
    if (!row) {
      return null;
    }

    return {
      name: row.name,
      avatarUrl: row.avatar_url,
      bio: row.bio,
      xUrl: row.x_url,
      instagramUrl: row.instagram_url,
      facebookUrl: row.facebook_url,
      youtubeUrl: row.youtube_url,
      tiktokUrl: row.tiktok_url,
      websiteUrl: row.website_url,
    };
  } catch {
    return null;
  }
}

