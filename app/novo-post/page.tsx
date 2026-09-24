import { redirect } from "next/navigation";
import { PostForm } from "@/components/PostForm";
import { getSessionUser, isAuthorRole } from "@/lib/auth";

export const metadata = {
  title: "Criar post - Intoxi Anime",
};

export default async function NewPostPage() {
  const user = await getSessionUser();

  if (!isAuthorRole(user?.role)) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <PostForm mode="create" />
      </main>
    </div>
  );
}
