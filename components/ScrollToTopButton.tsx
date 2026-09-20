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
        className="inline-flex items-center gap-2 rounded-3xl bg-[#1e73be] px-6 py-3 font-semibold text-black transition hover:border-white border hover:opacity-90 active:scale-95 shadow-md"
      >
        Voltar ao Topo
      </button>
    </div>
  );
}
