import { getSessionUser, updateUserProfile } from "@/lib/auth";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return Response.json(
        { message: "Voce precisa estar logado." },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const name = String(body.name ?? "").trim() || null;
    const avatarUrl = String(body.avatarUrl ?? "").trim() || null;

    if (name && name.length > 80) {
      return Response.json(
        { message: "O nome deve ter no maximo 80 caracteres." },
        { status: 400 },
      );
    }

    const updated = await updateUserProfile(user.id, { name, avatarUrl });

    return Response.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: updated.name,
        avatarUrl: updated.avatar_url,
      },
    });
  } catch (error) {
    console.error("Failed to update profile", error);

    return Response.json(
      { message: "Nao foi possivel atualizar o perfil." },
      { status: 500 },
    );
  }
}