import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getSessionUser } from "@/lib/auth";

export const metadata = {
  title: "Criar conta - Intoxi Anime",
};

export default async function SignupPage() {
  const user = await getSessionUser();
  if (user) {
    redirect("/");
  }

  return (
    <div className="flex flex-col">
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <AuthForm mode="signup" />
      </main>
    </div>
  );
}
