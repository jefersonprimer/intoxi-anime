"use client";

export function ScrollToTopButton() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="flex justify-center py-12">
      <button
        onClick={scrollToTop}
        type="button"
        className="border border-[#1e73be] px-4 py-2 text-center text-base font-bold text-[#1e73be] transition hover:bg-[#1e73be] hover:text-white"
      >
        Voltar ao Topo
      </button>
    </div>
  );
}
