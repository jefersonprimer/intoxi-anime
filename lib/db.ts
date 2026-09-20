import postgres from "postgres";

let client: ReturnType<typeof postgres> | null = null;

export function getClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  client ??= postgres(process.env.DATABASE_URL, {
    max: 3,
    idle_timeout: 20,
  });

  return client;
}