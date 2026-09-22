"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ComponentProps, FormEvent, ReactNode, useState } from "react";
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react";

type FloatingFieldProps = ComponentProps<"input"> & {
  label: string;
  rightSlot?: ReactNode;
};

function FloatingField({
  label,
  rightSlot,
  className = "",
  ...inputProps
}: FloatingFieldProps) {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState("");
  const float = focused || value.length > 0;

  return (
    <div className="relative">
      <input
        {...inputProps}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onFocus={(event) => {
          setFocused(true);
          inputProps.onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          inputProps.onBlur?.(event);
        }}
        className={`h-12 w-full rounded-md border border-white/10 bg-white/[0.04] px-4 pb-2 pt-6 text-sm text-white outline-none transition focus:border-sky-300 ${className}`}
      />
      <span
        className={`pointer-events-none absolute z-10 transition-all duration-200 ${
          float
            ? "left-4 top-0 -translate-y-1/2 bg-[#1E1E1E] px-2 text-xs text-slate-300"
            : "left-4 top-1/2 -translate-y-1/2 text-sm text-slate-500"
        }`}
      >
        {label}
      </span>
      {rightSlot}
    </div>
  );
}

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
      const response = await fetch(
        `/api/auth/${isLogin ? "login" : "signup"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.get("email"),
            password: formData.get("password"),
            ...(isLogin
              ? {}
              : {
                  name: formData.get("name"),
                  avatarUrl: formData.get("avatarUrl"),
                }),
          }),
        },
      );

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
    <form onSubmit={handleSubmit} className="mx-auto w-full md:max-w-md">
      <div className="mb-6 flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl md:text-3xl font-medium text-white">
          {isLogin ? "Entrar" : "Criar conta"}
        </h1>
      </div>

      <div className="space-y-4">
        {!isLogin ? (
          <>
            <FloatingField label="Nome" name="name" autoComplete="name" />
          </>
        ) : null}

        <FloatingField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />

        <FloatingField
          label="Senha"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete={isLogin ? "current-password" : "new-password"}
          minLength={8}
          className="pr-12"
          required
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword((shown) => !shown)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              className="absolute inset-y-0 right-0 grid w-12 place-items-center text-slate-400 transition hover:text-sky-200"
            >
              {showPassword ? (
                <EyeOff size={18} aria-hidden="true" />
              ) : (
                <Eye size={18} aria-hidden="true" />
              )}
            </button>
          }
        />
      </div>

      {message ? (
        <p className="mt-4 text-sm font-bold text-red-300">{message}</p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-black text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? "Aguarde..." : isLogin ? "Entrar" : "Criar conta"}
      </button>

      <p className="mt-5 text-center text-sm text-slate-400">
        {isLogin ? (
          <>
            Ainda nao tem conta?{" "}
            <Link
              href="/signup"
              className="font-bold text-slate-300 hover:text-white"
            >
              Criar conta
            </Link>
          </>
        ) : (
          <>
            Ja tem conta?{" "}
            <Link
              href="/login"
              className="font-bold text-slate-300 hover:text-white"
            >
              Entrar
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
