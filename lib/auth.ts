import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { getClient } from "@/lib/db";

const SESSION_COOKIE = "intoxi_session";
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

export type UserRole = "admin" | "user";

export type SessionUser = {
  id: string;
  email: string;
  role: UserRole;
  name: string | null;
  avatarUrl: string | null;
};

type DbUserRow = {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  name: string | null;
  avatar_url: string | null;
};

function mapUser(row: Omit<DbUserRow, "password_hash"> | DbUserRow): SessionUser {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    name: row.name,
    avatarUrl: row.avatar_url,
  };
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, expectedHash] = storedHash.split(":");
  if (!salt || !expectedHash) {
    return false;
  }

  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHash, "hex");

  return (
    candidate.length === expected.length && timingSafeEqual(candidate, expected)
  );
}

export async function findUserByEmail(email: string) {
  const sql = getClient();
  const rows = await sql<DbUserRow[]>`
    SELECT id, email, password_hash, role, name, avatar_url
    FROM users
    WHERE email = ${email}
    LIMIT 1
  `;

  return rows[0] ?? null;
}

export async function createSession(userId: string) {
  const sql = getClient();
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await sql`
    INSERT INTO sessions (token, user_id, expires_at)
    VALUES (${token}, ${userId}, ${expiresAt})
  `;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });

  return token;
}

export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  try {
    const sql = getClient();
    const rows = await sql<{ id: string; email: string; role: UserRole; name: string | null; avatar_url: string | null }[]>`
      SELECT u.id, u.email, u.role, u.name, u.avatar_url
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.token = ${token}
        AND s.expires_at > now()
      LIMIT 1
    `;

    return rows[0] ? mapUser(rows[0]) : null;
  } catch {
    return null;
  }
});

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    try {
      const sql = getClient();
      await sql`DELETE FROM sessions WHERE token = ${token}`;
    } catch {
      // ignore session cleanup failures
    }
  }

  cookieStore.delete(SESSION_COOKIE);
}

export async function updateUserProfile(
  userId: string,
  input: { name: string | null; avatarUrl: string | null },
) {
  const sql = getClient();
  const rows = await sql<{ id: string; name: string | null; avatar_url: string | null }[]>`
    UPDATE users
    SET name = ${input.name}, avatar_url = ${input.avatarUrl}
    WHERE id = ${userId}
    RETURNING id, name, avatar_url
  `;

  return rows[0] ?? null;
}