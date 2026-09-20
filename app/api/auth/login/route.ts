import { createSession, findUserByEmail, verifyPassword } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return Response.json(
        { message: "Email e senha sao obrigatorios." },
        { status: 400 },
      );
    }

    const user = await findUserByEmail(email);
    if (!user || !verifyPassword(password, user.password_hash)) {
      return Response.json(
        { message: "Email ou senha invalidos." },
        { status: 401 },
      );
    }

    await createSession(user.id);

    return Response.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        avatarUrl: user.avatar_url,
      },
    });
  } catch (error) {
    console.error("Failed to login", error);

    return Response.json(
      { message: "Nao foi possivel entrar no momento." },
      { status: 500 },
    );
  }
}