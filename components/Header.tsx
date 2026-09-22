import Image from "next/image";
import Link from "next/link";
import { HeaderAuth } from "@/components/HeaderAuth";
import { HeaderCreatePostButton } from "@/components/HeaderCreatePostButton";
import { HeaderMenu } from "@/components/HeaderMenu";
import { HeaderSearch } from "@/components/HeaderSearch";
import { HeaderSeasonGuides } from "@/components/HeaderSeasonGuides";
import { getSessionUser } from "@/lib/auth";
import { getSeasonGuidePosts, getSeasonGuideYears } from "@/lib/posts";

export async function Header() {
  const user = await getSessionUser();
  const [guideYears, seasonGuides] = await Promise.all([
    getSeasonGuideYears(),
    getSeasonGuidePosts(),
  ]);

  return (
    <header className="sticky top-0 z-40 bg-[#1E1E1E]">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-2">
        <div className="flex items-center gap-3 md:gap-4">
          <HeaderMenu years={guideYears} guides={seasonGuides} />
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
    </header>
  );
}
