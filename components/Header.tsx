import Image from "next/image";
import Link from "next/link";
import { HeaderAuth } from "@/components/HeaderAuth";
import { HeaderCreatePostButton } from "@/components/HeaderCreatePostButton";
import { HeaderMenu } from "@/components/HeaderMenu";
import { HeaderSearch } from "@/components/HeaderSearch";
import { HeaderSeasonGuides } from "@/components/HeaderSeasonGuides";
import { getSessionUser } from "@/lib/auth";
import {
  getPostCategories,
  getSeasonGuidePosts,
  getSeasonGuideYears,
} from "@/lib/posts";
import { categoryToSlug } from "@/lib/post-utils";

export async function Header() {
  const user = await getSessionUser();
  const [guideYears, seasonGuides, categories] = await Promise.all([
    getSeasonGuideYears(),
    getSeasonGuidePosts(),
    getPostCategories(),
  ]);

  return (
    <header className="sticky top-0 z-40 bg-[#1E1E1E]">
      <div className=" mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-2">
        <div className="flex items-center gap-3 md:gap-4">
          <HeaderMenu
            years={guideYears}
            guides={seasonGuides}
            categories={categories}
          />
          <Link href="/" className="group flex items-center gap-3">
            <Image
              src="/logo-nome.png"
              alt="Intoxi Anime"
              width={2172}
              height={724}
              className="h-14 w-auto object-contain"
              priority
            />
          </Link>
          <div className="hidden md:block">
            <HeaderSeasonGuides years={guideYears} guides={seasonGuides} />
          </div>
        </div>

        <nav className="flex items-center gap-2">
          {user?.role === "admin" ? <HeaderCreatePostButton /> : null}

          <HeaderSearch />
          <HeaderAuth user={user} />
        </nav>
      </div>

      {categories.length > 0 ? (
        <nav className="hidden bg-[#1E1E1E] md:block">
          <div className="mx-auto flex w-full max-w-7xl items-center px-4">
            {categories.map((category) => (
              <Link
                key={category}
                href={`/${categoryToSlug(category)}`}
                className="flex-1 rounded-tl-md rounded-tr-md px-3 py-2 text-center text-sm font-bold text-white transition hover:bg-[#1e73be] hover:text-white"
              >
                {category}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}

      <div aria-hidden="true" className="relative h-1.5 w-full overflow-hidden">
        <div className="absolute inset-0 bg-[#1e73be]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-white/90 via-white/40 to-white/90" />
      </div>
    </header>
  );
}
