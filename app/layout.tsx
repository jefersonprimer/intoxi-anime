import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Intoxi Anime - Tudo sobre animes, tops, light novels",
  description: "Noticias, trailers e guias de temporada sobre animes.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full bg-[#1E1E1E] text-white">{children}</body>
    </html>
  );
}
