import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { AdminPostActions } from "@/components/AdminPostActions";
import { HomePostSidebar } from "@/components/HomePostSidebar";
import { PostAuthor } from "@/components/PostAuthor";
import { getSessionUser } from "@/lib/auth";
import {
  categoryToSlug,
  formatPostDate,
  getPostPath,
  type Post,
} from "@/lib/post-utils";
import { getPostBySlug, getPosts } from "@/lib/posts";

type PostParams = {
  category: string;
  year: string;
  month: string;
  day: string;
  slug: string;
};

async function resolvePost(params: PostParams): Promise<Post> {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const year = Number(params.year);
  const month = Number(params.month);
  const day = Number(params.day);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    notFound();
  }

  const postDate = new Date(post.createdAt);
  const matchesCanonicalPath =
    params.category === categoryToSlug(post.category) &&
    year === postDate.getUTCFullYear() &&
    month === postDate.getUTCMonth() + 1 &&
    day === postDate.getUTCDate();

  if (!matchesCanonicalPath) {
    redirect(getPostPath(post));
  }

  return post;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PostParams>;
}) {
  const { category, year, month, day, slug } = await params;
  const post = await resolvePost({ category, year, month, day, slug });

  return {
    title: `${post.title} - Intoxi Anime`,
    alternates: { canonical: getPostPath(post) },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<PostParams>;
}) {
  const post = await resolvePost(await params);
  const user = await getSessionUser();
  const isAdmin = user?.role === "admin";
  const allPosts = await getPosts();
  const relatedLimit = 4;
  const categorySlug = categoryToSlug(post.category);
  const otherPosts = allPosts.filter((item) => item.id !== post.id);
  const sameCategory = otherPosts.filter(
    (item) => categoryToSlug(item.category) === categorySlug,
  );
  const relatedPosts = [
    ...sameCategory,
    ...otherPosts.filter(
      (item) => categoryToSlug(item.category) !== categorySlug,
    ),
  ].slice(0, relatedLimit);

  return (
    <div className="min-h-screen bg-[#1E1E1E] px-4 xl:px-0">
      <main>
        <div className="mx-auto grid max-w-7xl gap-8 pt-12 lg:grid-cols-3">
          <article className="min-w-0 lg:col-span-2">
            <section>
              <div>
                <nav aria-label="Breadcrumb" className="mb-4">
                  <ol className="flex items-center gap-2 text-sm font-normal text-white">
                    <li>
                      <Link
                        href="/"
                        className="transition hover:text-[#f2f2f2] hover:underline"
                      >
                        Home
                      </Link>
                    </li>
                    <li aria-hidden="true" className="flex items-center">
                      <ChevronRight size={16} />
                    </li>
                    <li>
                      <Link
                        href={`/${categoryToSlug(post.category)}`}
                        className="transition hover:text-[#f2f2f2] hover:underline"
                      >
                        {post.category}
                      </Link>
                    </li>
                  </ol>
                </nav>

                <Link
                  href={`/${categoryToSlug(post.category)}`}
                  className="inline-block w-fit text-xs font-bold px-2 py-1 uppercase tracking-[0.2em] text-[#1E1E1E] bg-[#1e73be] rounded-2xl hover:bg-transparent hover:text-[#1e73be] hover:border-[#1e73be] border"
                >
                  {post.category}
                </Link>
                <h1 className="mt-4 text-2xl font-bold leading-tight text-white md:text-4xl">
                  {post.title}
                </h1>
                {post.summary ? (
                  <p className="mt-5 text-lg leading-8 text-slate-200">
                    {post.summary}
                  </p>
                ) : null}
                <div className="mt-6 flex flex-wrap items-center whitespace-nowrap gap-x-4 gap-y-2">
                  <PostAuthor author={post.author} size="md" />

                  <div className="flex items-center justify-center gap-2">
                    <span className="text-[#a0a0a0] font-normal">
                      {post.readingTimeMinutes} min de leitura
                    </span>

                    <span
                      aria-hidden="true"
                      className="h-1 w-1 rounded-full bg-[#a0a0a0]"
                    />

                    <span className="text-[#a0a0a0] font-normal">
                      {formatPostDate(post.createdAt)}
                    </span>
                  </div>
                </div>
                {isAdmin ? (
                  <div className="mt-6">
                    <AdminPostActions postId={post.id} postSlug={post.slug} />
                  </div>
                ) : null}
              </div>
            </section>

            <section className="py-8">
              <div
                className="post-content"
                dangerouslySetInnerHTML={{ __html: post.contentHtml }}
              />
            </section>
          </article>

          <HomePostSidebar posts={relatedPosts} title="Artigos Relacionados" />
        </div>
      </main>
    </div>
  );
}
