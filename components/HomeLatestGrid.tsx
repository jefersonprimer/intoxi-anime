import Image from "next/image";
import Link from "next/link";
import { PostAuthor } from "@/components/PostAuthor";
import { formatPostDate, getPostPath, type Post } from "@/lib/post-utils";

interface HomeLatestGridProps {
  posts: Post[];
}

export function HomeLatestGrid({ posts }: HomeLatestGridProps) {
  if (!posts || posts.length === 0) {
    return null;
  }

  const mainPost = posts[0];
  const sidePosts = posts.slice(1, 5);

  return (
    <section className="mt-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Post principal à esquerda (maior) */}
        <div className="lg:col-span-6">
          <Link
            href={getPostPath(mainPost)}
            className="group flex flex-col h-full"
          >
            {/* 1. Imagem */}
            <div className="relative aspect-video w-full overflow-hidden lg:rounded-xl">
              {mainPost.bannerImageUrl ? (
                <Image
                  src={mainPost.bannerImageUrl}
                  alt={mainPost.title}
                  fill
                  unoptimized
                  className="object-contain transition duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#164e63,#0f172a_58%,#020617)]" />
              )}
            </div>
            <div className="mt-2 flex flex-col gap-2 px-4 sm:px-0 ">
              {/* 2. Categoria abaixo da imagem */}
              <div>
                <span className="inline-block w-fit rounded-xl bg-[#1e73be] px-2 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#1E1E1E]">
                  {mainPost.category}
                </span>
              </div>
              {/* 3. Título abaixo da categoria */}
              <h2 className="text-xl font-black leading-snug text-white transition group-hover:text-sky-300 sm:text-2xl">
                {mainPost.title}
              </h2>
              {/* 4. Data abaixo do título */}
              <div className="flex flex-col gap-2">
                <p className="shrink-0 text-xs font-normal text-[#a0a0a0]">
                  {formatPostDate(mainPost.createdAt)}
                </p>

                <PostAuthor author={mainPost.author} className="min-w-0" />
              </div>
            </div>
          </Link>
        </div>

        {/* Duas colunas à direita com os últimos 4 posts */}
        <div className="lg:col-span-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {sidePosts.map((post) => (
              <Link
                key={post.id}
                href={getPostPath(post)}
                className="group flex flex-col"
              >
                {/* 1. Imagem */}
                <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                  {post.bannerImageUrl ? (
                    <Image
                      src={post.bannerImageUrl}
                      alt={post.title}
                      fill
                      unoptimized
                      className="object-contain transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#164e63,#0f172a_58%,#020617)]" />
                  )}
                </div>
                <div className="mt-2 flex flex-col gap-1.5  px-4 sm:px-0">
                  {/* 2. Categoria abaixo da imagem */}
                  <div>
                    <span className="inline-block w-fit rounded-xl bg-[#1e73be] px-2 py-0.5 text-xs font-bold uppercase text-[#1E1E1E]">
                      {post.category}
                    </span>
                  </div>
                  {/* 3. Título abaixo da categoria */}
                  <h3 className="line-clamp-2 text-sm font-black leading-snug text-white transition group-hover:text-sky-300 sm:text-base">
                    {post.title}
                  </h3>
                  {/* 4. Data abaixo do título */}
                  <div className="flex flex-col gap-2">
                    <p className="shrink-0 text-xs font-normal text-[#a0a0a0]">
                      {formatPostDate(post.createdAt)}
                    </p>

                    <PostAuthor author={post.author} className="min-w-0" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
