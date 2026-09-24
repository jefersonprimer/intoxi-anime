import Image from "next/image";
import Link from "next/link";
import { HeaderAuth } from "@/components/HeaderAuth";
import { HeaderCreatePostButton } from "@/components/HeaderCreatePostButton";
import { HeaderMenu } from "@/components/HeaderMenu";
import { HeaderSearch } from "@/components/HeaderSearch";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getSessionUser, isAuthorRole } from "@/lib/auth";
import { getPostCategories, getSeasonGuidePosts } from "@/lib/posts";
import { categoryToSlug } from "@/lib/post-utils";

export async function Header() {
  const user = await getSessionUser();
  const [seasonGuides, categories] = await Promise.all([
    getSeasonGuidePosts(),
    getPostCategories(),
  ]);
  const navCategories = categories.filter(
    (category) => !categoryToSlug(category).includes("temporada"),
  );

  return (
    <header className="sticky top-0 z-40 bg-header-bg">
      <div className=" mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-2">
        <div className="flex items-center gap-3 md:gap-4">
          <HeaderMenu guides={seasonGuides} categories={navCategories} />
          <Link href="/" className="group flex items-center gap-3">
            <Image
              src="/logo-nome.png"
              alt="Intoxi Anime"
              width={2172}
              height={724}
              className="logo-theme-dark h-14 w-auto object-contain"
              priority
            />
            <Image
              src="/logo-nome-light.png"
              alt="Intoxi Anime"
              width={2172}
              height={724}
              className="logo-theme-light h-14 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        <nav className="flex items-center gap-2">
          {isAuthorRole(user?.role) ? <HeaderCreatePostButton /> : null}

          <span className="hidden sm:block">
            <ThemeToggle />
          </span>
          <HeaderSearch />
          <HeaderAuth user={user} />
        </nav>
      </div>

      {categories.length > 0 ? (
        <nav className="hidden bg-header-bg md:block">
          <div className="mx-auto flex w-full max-w-7xl items-center px-4">
            {navCategories.map((category) => (
              <Link
                key={category}
                href={`/${categoryToSlug(category)}`}
                className="flex-1 rounded-tl-md rounded-tr-md px-3 py-2 text-center text-sm font-bold text-header-fg transition hover:bg-[#1e73be] hover:text-white"
              >
                {category}
              </Link>
            ))}
            <Link
              href="/guias-temporada"
              className="flex-1 rounded-tl-md rounded-tr-md px-3 py-2 text-center text-sm font-bold text-header-fg transition hover:bg-[#1e73be] hover:text-white"
            >
              Guias de Temporada
            </Link>
          </div>
        </nav>
      ) : null}

      <div aria-hidden="true" className="header-border-grooves" />
    </header>
  );
}
