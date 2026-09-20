import { getClient } from "@/lib/db";
import { calculateReadingTime } from "@/lib/reading-time";
import { categoryToSlug, type Post } from "@/lib/post-utils";


type SqlClient = ReturnType<typeof getClient>;

type DbPost = {
  id: string;
  title: string;
  slug: string;
  category: string;
  banner_image_url: string | null;
  summary: string | null;
  content_html: string;
  reading_time_minutes: number;
  is_featured: boolean;
  created_at: Date;
  updated_at: Date;
  author_name: string | null;
  author_avatar_url: string | null;
};

function postSelect(sql: SqlClient) {
  return sql`
    SELECT
      p.id,
      p.title,
      p.slug,
      p.category,
      p.banner_image_url,
      p.summary,
      p.content_html,
      p.reading_time_minutes,
      p.is_featured,
      p.created_at,
      p.updated_at,
      u.name AS author_name,
      u.avatar_url AS author_avatar_url
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
    author: { name: "Redacao Intoxi", avatarUrl: null },
  },
  {
    id: "demo-season",
    title: "Temporada de outono revela novas estreias de fantasia e acao",
    slug: "temporada-outono-estreias-fantasia-acao",
    category: "Guia",
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
    author: { name: "Redacao Intoxi", avatarUrl: null },
  },
  {
    id: "demo-trailer",
    title: "Novo trailer destaca batalhas e visual de anime original",
    slug: "novo-trailer-batalhas-visual-anime-original",
    category: "Trailer",
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
    author: { name: "Redacao Intoxi", avatarUrl: null },
  },
];

function mapPost(post: DbPost): Post {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    category: post.category,
    bannerImageUrl: post.banner_image_url,
    summary: post.summary,
    contentHtml: post.content_html,
    readingTimeMinutes: post.reading_time_minutes,
    isFeatured: post.is_featured,
    createdAt: post.created_at.toISOString(),
    updatedAt: post.updated_at.toISOString(),
    author: post.author_name
      ? { name: post.author_name, avatarUrl: post.author_avatar_url }
      : null,
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
  bannerImageUrl?: string;
  summary?: string;
  contentHtml: string;
  isFeatured?: boolean;
  authorId?: string;
}) {
  const sql = getClient();
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
      u.avatar_url AS author_avatar_url
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
    bannerImageUrl?: string;
    summary?: string;
    contentHtml: string;
    isFeatured?: boolean;
  },
) {
  const sql = getClient();
  const posts = await sql<DbPost[]>`
    WITH updated AS (
      UPDATE posts
      SET
        title = ${input.title},
        category = ${input.category},
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
      u.avatar_url AS author_avatar_url
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

export async function getSeasonGuideYears() {
  const guides = await getSeasonGuidePosts();
  return [...new Set(guides.map(getPostYear))].sort((a, b) => b - a);
}

export async function getPostsByCategory(categorySlug: string) {
  const posts = await getPosts();
  const targetSlug = categoryToSlug(categorySlug);
  return posts.filter(
    (post) => categoryToSlug(post.category) === targetSlug
  );
}

