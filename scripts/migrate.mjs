import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { readdir } from "node:fs/promises";
import postgres from "postgres";

const databaseUrl =
  process.env.DATABASE_URL ??
  "postgres://intoxi:intoxi_dev_password@localhost:5432/intoxi_anime";

const sql = postgres(databaseUrl, { max: 1 });
try {
  const migrationDirectory = join(process.cwd(), "migrations");
  const migrationFiles = (await readdir(migrationDirectory))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const migrationFile of migrationFiles) {
    const migration = await readFile(join(migrationDirectory, migrationFile), "utf8");
    await sql.unsafe(migration);
  }

  console.log("Migrations applied successfully.");
} finally {
  await sql.end();
}
