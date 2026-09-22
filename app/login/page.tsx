import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getSessionUser } from "@/lib/auth";

export const metadata = {
  title: "Entrar - Intoxi Anime",
};

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) {
    redirect("/");
  }

  return (
    <div className="flex flex-col bg-[#1E1E1E]">
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <AuthForm mode="login" />
      </main>
    </div>
  );
}
