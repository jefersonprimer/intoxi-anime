import { createSession, findUserByEmail, hashPassword } from "@/lib/auth";
import { getClient } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email.includes("@") || email.length > 254) {
      return Response.json({ message: "Email invalido." }, { status: 400 });
    }

    if (password.length < 8) {
      return Response.json(
        { message: "A senha deve ter pelo menos 8 caracteres." },
        { status: 400 },
      );
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return Response.json(
        { message: "Ja existe uma conta com esse email." },
        { status: 409 },
      );
    }

    const isAdminEmail = email === process.env.ADMIN_EMAIL;
    const isAdmin = isAdminEmail && password === process.env.ADMIN_PASSWORD;

    if (isAdminEmail && !isAdmin) {
      return Response.json(
        { message: "Nao foi possivel criar a conta com esse email." },
        { status: 401 },
      );
    }

    const role = isAdmin ? "admin" : "user";

    const name = String(body.name ?? "").trim() || null;
    const avatarUrl = String(body.avatarUrl ?? "").trim() || null;

    const sql = getClient();
    const rows = await sql<{ id: string }[]>`
      INSERT INTO users (email, password_hash, role, name, avatar_url)
      VALUES (${email}, ${hashPassword(password)}, ${role}, ${name}, ${avatarUrl})
      RETURNING id
    `;

    const user = { id: rows[0].id, email, role, name, avatarUrl };
    await createSession(user.id);

    return Response.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Failed to signup", error);

    return Response.json(
      { message: "Nao foi possivel criar a conta." },
      { status: 500 },
    );
  }
}