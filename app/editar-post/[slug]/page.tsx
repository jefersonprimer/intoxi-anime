import { notFound, redirect } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getSessionUser } from "@/lib/auth";
import { getPostBySlug } from "@/lib/posts";
import { PostForm } from "@/components/PostForm";

export const metadata = {
  title: "Editar post - Intoxi Anime",
};

export default async function EditPostPage({
  params,
}: PageProps<"/editar-post/[slug]">) {
  const user = await getSessionUser();

  if (user?.role !== "admin") {
    redirect("/login");
  }

  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#1E1E1E]">
      <Header />
      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <PostForm mode="edit" initialPost={post} />
      </main>
      <Footer />
    </div>
  );
}
