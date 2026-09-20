"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react";

const inputClass =
  "h-12 w-full rounded-md border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300";
const labelClass = "text-sm font-bold text-slate-200";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const isLogin = mode === "login";
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setBusy(true);

    try {
      const formData = new FormData(event.currentTarget);
      const response = await fetch(`/api/auth/${isLogin ? "login" : "signup"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
          ...(isLogin ? {} : { name: formData.get("name"), avatarUrl: formData.get("avatarUrl") }),
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        message?: string;
      };

      if (!response.ok) {
        setMessage(payload.message ?? "Algo deu errado, tente novamente.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setMessage("Nao foi possivel conectar com o servidor.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-md rounded-lg border border-white/10 bg-white/[0.035] p-6 sm:p-8"
    >
      <div className="mb-6 flex flex-col items-center gap-2 text-center">
        <span className="grid size-12 place-items-center rounded-md border border-sky-300/35 bg-sky-400/10 text-sky-100">
          {isLogin ? <LogIn size={22} aria-hidden="true" /> : <UserPlus size={22} aria-hidden="true" />}
        </span>
        <h1 className="text-2xl font-black text-white">
          {isLogin ? "Entrar" : "Criar conta"}
        </h1>
        <p className="text-sm text-slate-400">
          {isLogin
            ? "Acesse a sua conta do Intoxi Anime."
            : "Crie uma conta para acompanhar o Intoxi Anime."}
        </p>
      </div>

      <div className="space-y-4">
        {!isLogin ? (
          <>
            <label className="flex flex-col gap-2">
              <span className={labelClass}>
                Nome de escritor <span className="font-normal text-slate-500">(opcional)</span>
              </span>
              <input
                name="name"
                autoComplete="name"
                className={inputClass}
                placeholder="Como voce assina os posts"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className={labelClass}>
                URL do avatar <span className="font-normal text-slate-500">(opcional)</span>
              </span>
              <input
                name="avatarUrl"
                type="url"
                className={inputClass}
                placeholder="https://..."
              />
            </label>
          </>
        ) : null}

        <label className="flex flex-col gap-2">
          <span className={labelClass}>Email</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            className={inputClass}
            placeholder="voce@exemplo.com"
            required
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className={labelClass}>Senha</span>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={isLogin ? "current-password" : "new-password"}
              minLength={8}
              className={`${inputClass} pr-12`}
              placeholder={isLogin ? "Sua senha" : "Minimo de 8 caracteres"}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((shown) => !shown)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              className="absolute inset-y-0 right-0 grid w-12 place-items-center text-slate-400 transition hover:text-sky-200"
            >
              {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
            </button>
          </div>
        </label>
      </div>

      {message ? (
        <p className="mt-4 text-sm font-bold text-red-300">{message}</p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-sky-400 px-5 text-sm font-black text-slate-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? "Aguarde..." : isLogin ? "Entrar" : "Criar conta"}
      </button>

      <p className="mt-5 text-center text-sm text-slate-400">
        {isLogin ? (
          <>
            Ainda nao tem conta?{" "}
            <Link href="/signup" className="font-bold text-sky-300 hover:text-sky-200">
              Criar conta
            </Link>
          </>
        ) : (
          <>
            Ja tem conta?{" "}
            <Link href="/login" className="font-bold text-sky-300 hover:text-sky-200">
              Entrar
            </Link>
          </>
        )}
      </p>
    </form>
  );
}