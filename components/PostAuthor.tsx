import Image from "next/image";
import type { Author } from "@/lib/post-utils";

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
};

export function PostAuthor({
  author,
  size = "sm",
  className = "",
}: PostAuthorProps) {
  const { name, avatarUrl, initial } = getAuthorDisplay(author);
  const avatarClass = size === "md" ? "size-9 text-sm" : "size-7 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-2 ${className}`}
      title={name}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={name}
          width={size === "md" ? 36 : 28}
          height={size === "md" ? 36 : 28}
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
      <span className="truncate text-base font-normal text-white">
        {name}
      </span>
    </span>
  );
}
