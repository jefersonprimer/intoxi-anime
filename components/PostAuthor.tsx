import Image from "next/image";
import Link from "next/link";
import { authorToSlug, type Author } from "@/lib/post-utils";

const FALLBACK_NAME = "Equipe Intoxi Anime";

function getAuthorDisplay(author: Author | null | undefined) {
  const name = author?.name?.trim() || FALLBACK_NAME;
  const avatarUrl = author?.avatarUrl?.trim() || null;
  return { name, avatarUrl, initial: name[0]?.toUpperCase() ?? "?" };
}

type PostAuthorProps = {
  author: Author | null;
  size?: "sm" | "md";
  className?: string;
  link?: boolean;
};

export function PostAuthor({
  author,
  size = "sm",
  className = "",
  link = true,
}: PostAuthorProps) {
  const { name, avatarUrl, initial } = getAuthorDisplay(author);
  const avatarClass = size === "md" ? "size-9 text-sm" : "size-7 text-xs";
  const authorPath = `/autor/${encodeURIComponent(authorToSlug(name))}`;

  const content = (
    <>
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={name}
          width={size === "md" ? 24 : 24}
          height={size === "md" ? 24 : 24}
          unoptimized
          className={`shrink-0 rounded-full bg-white/10 object-cover ${size === "md" ? "size-9" : "size-7"}`}
        />
      ) : (
        <span
          className={`grid shrink-0 place-items-center rounded-full bg-sky-400/20 font-black text-sky-200 ${avatarClass}`}
        >
          {initial}
        </span>
      )}
      <span className="truncate text-sm font-normal hover:underline">
        {name}
      </span>
    </>
  );

  const baseClassName = `inline-flex items-center gap-2 ${className}`;

  if (!link) {
    return (
      <span className={baseClassName} title={name}>
        {content}
      </span>
    );
  }

  return (
    <Link href={authorPath} title={name} className={baseClassName}>
      {content}
    </Link>
  );
}
