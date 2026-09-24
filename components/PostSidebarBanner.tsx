import Image from "next/image";

const AMAZON_LINK =
  "https://www.amazon.com.br/dp/B078Z6RKBW/ref=as_li_ss_tl?ie=UTF8&sr=8-1";

export function PostSidebarBanner() {
  return (
    <a
      href={AMAZON_LINK}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Comprar o livro As Crônicas de Arian na Amazon"
      className="group relative block overflow-hidden rounded "
    >
      <Image
        src="/ChatGPT%20Image%20Sep%2023,%202026,%2001_31_45%20PM.png"
        alt="As Crônicas de Arian: Livro 1 - O Guardião Sem Memórias"
        width={1541}
        height={1021}
        unoptimized
        className="h-auto w-full object-contain "
      />
    </a>
  );
}
