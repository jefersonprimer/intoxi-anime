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
        className="inline-flex items-center gap-2 rounded-3xl border border-transparent bg-[#1e73be] px-6 py-3 font-semibold text-category-fg shadow-md transition hover:border-foreground hover:bg-[#1862a3] hover:text-foreground hover:shadow-lg active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e73be] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Voltar ao Topo
      </button>
    </div>
  );
}
