import { neon } from "@neondatabase/serverless";

let sql;
try {
  const dbUrl = process.env.DATABASE_URL || "";
  if (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://")) {
    sql = neon(dbUrl);
  } else {
    console.warn("⚠️ DATABASE_URL is not set to a valid PostgreSQL connection string (postgresql://...). Database features will be paused.");
    sql = async () => [];
  }
} catch (err) {
  console.warn("⚠️ Neon DB initialization warning:", err.message);
  sql = async () => [];
}

export default sql;
