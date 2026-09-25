import { HomeBanner } from "@/components/HomeBanner";
import { HomeHeroCarousel } from "@/components/HomeHeroCarousel";
import { HomeLatestGrid } from "@/components/HomeLatestGrid";
import { HomePostSidebar } from "@/components/HomePostSidebar";
import { HomeSeasonGuidesCarousel } from "@/components/HomeSeasonGuidesCarousel";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { getPosts, getSeasonGuidePosts, getSpecialPosts } from "@/lib/posts";

export default async function Home() {
  const posts = await getPosts();
  const seasonGuides = await getSeasonGuidePosts();
  const specialPosts = await getSpecialPosts();

  return (
    <div className="min-h-screen bg-background">
      <main>
        <HomeBanner />
        <div className="mx-auto w-full max-w-7xl px-4 xl:px-0">
          <div className="grid grid-cols-1 py-2 lg:grid-cols-14">
            <div className="order-2 min-w-0 lg:order-none lg:col-span-4">
              <HomePostSidebar
                title="Últimas Notícias"
                posts={posts.slice(0, 4)}
                bgClass="bg-[#1e73be33] p-2"
                allPostsLabel="Ver todas as notícias"
              />
            </div>
            <div className="order-1 min-w-0 lg:order-none lg:col-span-6">
              <HomeHeroCarousel posts={posts.slice(0, 6)} />
            </div>
            <div className="order-3 min-w-0 lg:order-none lg:col-span-4">
              <HomePostSidebar
                title="Artigos Especiais"
                posts={specialPosts.slice(0, 4)}
                allPostsLabel="Ver todos os artigos"
              />
            </div>
          </div>

          <div className="w-full">
            <HomeLatestGrid posts={posts} />
            <HomeSeasonGuidesCarousel posts={seasonGuides} />

            <ScrollToTopButton />
          </div>
        </div>
      </main>
    </div>
  );
}
