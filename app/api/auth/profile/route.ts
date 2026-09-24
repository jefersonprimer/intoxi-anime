import { getSessionUser, updateUserProfile } from "@/lib/auth";

export const runtime = "nodejs";

const LINK_FIELDS = [
  "xUrl",
  "instagramUrl",
  "facebookUrl",
  "youtubeUrl",
  "tiktokUrl",
  "websiteUrl",
] as const;

function normalizeUrl(value: unknown): string | null {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) {
    return null;
  }
  return trimmed;
}

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
    const bio = String(body.bio ?? "").trim() || null;

    if (name && name.length > 80) {
      return Response.json(
        { message: "O nome deve ter no maximo 80 caracteres." },
        { status: 400 },
      );
    }

    if (bio && bio.length > 500) {
      return Response.json(
        { message: "A descricao deve ter no maximo 500 caracteres." },
        { status: 400 },
      );
    }

    const links: Partial<Record<(typeof LINK_FIELDS)[number], string | null>> = {};
    for (const field of LINK_FIELDS) {
      links[field] = normalizeUrl(body[field]);
    }

    const updated = await updateUserProfile(user.id, {
      name,
      avatarUrl,
      bio,
      xUrl: links.xUrl ?? null,
      instagramUrl: links.instagramUrl ?? null,
      facebookUrl: links.facebookUrl ?? null,
      youtubeUrl: links.youtubeUrl ?? null,
      tiktokUrl: links.tiktokUrl ?? null,
      websiteUrl: links.websiteUrl ?? null,
    });

    return Response.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: updated.name,
        avatarUrl: updated.avatar_url,
        bio: updated.bio,
        xUrl: updated.x_url,
        instagramUrl: updated.instagram_url,
        facebookUrl: updated.facebook_url,
        youtubeUrl: updated.youtube_url,
        tiktokUrl: updated.tiktok_url,
        websiteUrl: updated.website_url,
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