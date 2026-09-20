import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
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
    <div className="flex min-h-screen flex-col bg-[#1E1E1E]">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <AuthForm mode="login" />
      </main>
      <Footer />
    </div>
  );
}