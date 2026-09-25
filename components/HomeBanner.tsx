import Image from "next/image";

const AMAZON_LINK =
  "https://www.amazon.com.br/dp/B078Z6RKBW/ref=as_li_ss_tl?ie=UTF8&sr=8-1";

export function HomeBanner() {
  return (
    <section className="mx-auto w-full max-w-[1300px] pt-1.5 xl:pt-2">
      <a
        href={AMAZON_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex h-[87px] items-center overflow-hidden bg-gradient-to-r from-black via-[#0e2b18] to-black  transition duration-300 "
      >
        <Image
          src="/as_conicas_de_arian_banner.png"
          alt="As Crônicas de Arian: Livro 1 - O Guardião Sem Memórias"
          fill
          priority
          sizes="(min-width: 1300px) 1300px, 100vw"
          className="object-contain"
        />
      </a>
    </section>
  );
}
