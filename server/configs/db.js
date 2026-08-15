import { neon } from "@neondatabase/serverless";

let neonSql = null;
const dbUrl = process.env.DATABASE_URL || "";

if (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://")) {
  try {
    neonSql = neon(dbUrl);
  } catch (err) {
    console.warn("⚠️ Neon DB connection init note:", err.message);
  }
}

// Safe tagged template query wrapper that catches fetch / network errors gracefully
const sql = async (strings, ...values) => {
  if (!neonSql) {
    return [];
  }
  try {
    return await neonSql(strings, ...values);
  } catch (err) {
    console.warn("⚠️ Neon DB Query Note (paused):", err.message);
    return [];
  }
};

export default sql;
