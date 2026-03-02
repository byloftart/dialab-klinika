/**
 * Migration and seed script for Railway deployment.
 * Run: npx tsx scripts/migrate-and-seed.ts
 * 
 * This script:
 * 1. Applies all pending database migrations
 * 2. Creates the first admin user if none exists
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("ERROR: DATABASE_URL environment variable is required");
  process.exit(1);
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@dialab.az";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "dialab2024admin";
const ADMIN_NAME = process.env.ADMIN_NAME || "Dialab Admin";

async function main() {
  console.log("Connecting to database...");
  
  const connection = await mysql.createConnection(DATABASE_URL!);
  const db = drizzle(connection);

  console.log("Running migrations...");
  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("✓ Migrations applied successfully");
  } catch (error) {
    console.error("Migration error:", error);
    // Continue even if migrations fail (tables may already exist)
  }

  // Check if any admin user exists
  console.log("Checking for existing admin users...");
  const [rows] = await connection.execute(
    "SELECT COUNT(*) as count FROM users WHERE role = 'admin'"
  );
  const count = (rows as any)[0].count;
  
  if (count > 0) {
    console.log(`✓ Admin user already exists (${count} admin(s) found). Skipping seed.`);
  } else {
    console.log("Creating initial admin user...");
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    const openId = `local_${Date.now()}_admin`;
    
    await connection.execute(
      `INSERT INTO users (openId, name, email, passwordHash, loginMethod, role, lastSignedIn, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, 'local', 'admin', NOW(), NOW(), NOW())`,
      [openId, ADMIN_NAME, ADMIN_EMAIL, passwordHash]
    );
    
    console.log("✓ Admin user created:");
    console.log(`  Email: ${ADMIN_EMAIL}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
    console.log("  ⚠️  Please change the password after first login!");
  }

  await connection.end();
  console.log("Done!");
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
