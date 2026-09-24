import { HomeBanner } from "@/components/HomeBanner";
import { HomeHeroCarousel } from "@/components/HomeHeroCarousel";
import { HomeLatestGrid } from "@/components/HomeLatestGrid";
import { HomePostSidebar } from "@/components/HomePostSidebar";
import { HomeSeasonGuidesCarousel } from "@/components/HomeSeasonGuidesCarousel";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { getPosts, getSeasonGuidePosts } from "@/lib/posts";

export default async function Home() {
  const posts = await getPosts();
  const seasonGuides = await getSeasonGuidePosts();

  return (
    <div className="min-h-screen bg-background">
      <main>
        <HomeBanner />
        <div className="mx-auto grid w-full max-w-7xl lg:grid-cols-3 gap-4 xl:gap-8 py-2 px-4 xl:px-0">
          <div className="min-w-0 lg:col-span-2">
            <HomeHeroCarousel posts={posts.slice(0, 6)} />
            <HomeLatestGrid posts={posts} />
            <HomeSeasonGuidesCarousel posts={seasonGuides} />

            <ScrollToTopButton />
          </div>
          <HomePostSidebar posts={posts.slice(0, 4)} />
        </div>
      </main>
    </div>
  );
}
