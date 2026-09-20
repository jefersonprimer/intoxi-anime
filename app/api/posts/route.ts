import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import {
  categoryToSlug,
  extractFirstImageUrl,
  getPostPath,
} from "@/lib/post-utils";
import {
  createPost,
  deletePost,
  getPosts,
  updatePost,
} from "@/lib/posts";

export const runtime = "nodejs";

async function requireAdmin() {
  const user = await getSessionUser();
  if (user?.role !== "admin") {
    return null;
  }
  return user;
}

export async function GET() {
  const posts = await getPosts();
  return Response.json({ posts });
}

export async function POST(request: Request) {
  try {
    const user = await requireAdmin();
    if (!user) {
      return Response.json(
        { message: "Acesso restrito a administradores." },
        { status: 401 },
      );
    }

    const body = await request.json();

    const contentHtml = String(body.contentHtml ?? "").trim();
    const hasBanner = String(body.bannerImageUrl ?? "").trim();

    const post = await createPost({
      title: String(body.title ?? "").trim(),
      category: String(body.category ?? "Noticias").trim(),
      bannerImageUrl: hasBanner || extractFirstImageUrl(contentHtml),
      summary: String(body.summary ?? "").trim(),
      contentHtml,
      isFeatured: Boolean(body.isFeatured),
      authorId: user.id,
    });

    revalidatePath("/");
    revalidatePath(`/${categoryToSlug(post.category)}`);
    revalidatePath(getPostPath(post));

    return Response.json({ post }, { status: 201 });
  } catch (error) {
    console.error("Failed to create post", error);

    return Response.json(
      {
        message:
          "Nao foi possivel salvar o post. Verifique se o banco esta rodando e se as migrations foram aplicadas.",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await requireAdmin())) {
      return Response.json(
        { message: "Acesso restrito a administradores." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const postId = String(body.postId ?? "").trim();

    if (!postId) {
      return Response.json(
        { message: "O post e obrigatorio." },
        { status: 400 },
      );
    }

    const title = String(body.title ?? "").trim();
    const category = String(body.category ?? "Noticias").trim();
    const summary = String(body.summary ?? "").trim();
    const contentHtml = String(body.contentHtml ?? "").trim();

    if (!title || !contentHtml) {
      return Response.json(
        { message: "Titulo e conteudo sao obrigatorios." },
        { status: 400 },
      );
    }

    const hasBanner = String(body.bannerImageUrl ?? "").trim();
    const post = await updatePost(postId, {
      title,
      category: category || "Noticias",
      bannerImageUrl: hasBanner || extractFirstImageUrl(contentHtml),
      summary,
      contentHtml,
      isFeatured: Boolean(body.isFeatured),
    });

    if (!post) {
      return Response.json(
        { message: "Post nao encontrado." },
        { status: 404 },
      );
    }

    revalidatePath("/");
    revalidatePath(`/${categoryToSlug(post.category)}`);
    revalidatePath(getPostPath(post));

    return Response.json({ post });
  } catch (error) {
    console.error("Failed to update post", error);

    return Response.json(
      {
        message:
          "Nao foi possivel atualizar o post. Verifique se o banco esta rodando.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await requireAdmin())) {
      return Response.json(
        { message: "Acesso restrito a administradores." },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const postId = String(body.postId ?? "").trim();

    if (!postId) {
      return Response.json(
        { message: "O post e obrigatorio." },
        { status: 400 },
      );
    }

    const deletedId = await deletePost(postId);
    if (!deletedId) {
      return Response.json(
        { message: "Post nao encontrado." },
        { status: 404 },
      );
    }

    revalidatePath("/");

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete post", error);

    return Response.json(
      {
        message:
          "Nao foi possivel apagar o post. Verifique se o banco esta rodando.",
      },
      { status: 500 },
    );
  }
}
