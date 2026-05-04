import "dotenv/config";
import mysql from "mysql2/promise";
import { doctorsCatalog } from "../shared/doctorsCatalog";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("ERROR: DATABASE_URL environment variable is required");
  process.exit(1);
}

async function upsertDoctorsCatalog(connection: mysql.Connection) {
  await connection.execute("UPDATE doctors SET isActive = 0, updatedAt = NOW()");

  for (const item of doctorsCatalog) {
    const [existingRows] = await connection.execute(
      "SELECT id FROM doctors WHERE nameAz = ? LIMIT 1",
      [item.nameAz]
    );

    const existingId = (existingRows as Array<{ id: number }>)[0]?.id;

    if (existingId) {
      const fields = [
        "specialtyAz = ?",
        "`order` = ?",
        "isActive = ?",
        "updatedAt = NOW()",
      ];
      const values: Array<string | number | boolean | null> = [
        item.specialtyAz,
        item.order,
        item.isActive,
      ];

      if (item.bioAz != null) {
        fields.unshift("bioAz = ?");
        values.unshift(item.bioAz);
      }

      if (item.photoUrl != null) {
        fields.unshift("photoUrl = ?");
        values.unshift(item.photoUrl);
      }

      if (item.whatsappUrl != null) {
        fields.unshift("whatsappUrl = ?");
        values.unshift(item.whatsappUrl);
      }

      if (item.telegramUrl != null) {
        fields.unshift("telegramUrl = ?");
        values.unshift(item.telegramUrl);
      }

      if (item.instagramUrl != null) {
        fields.unshift("instagramUrl = ?");
        values.unshift(item.instagramUrl);
      }

      if (item.experienceYears != null) {
        fields.unshift("experienceYears = ?");
        values.unshift(item.experienceYears);
      }

      values.push(existingId);

      await connection.execute(
        `UPDATE doctors SET ${fields.join(", ")} WHERE id = ?`,
        values
      );
    } else {
      await connection.execute(
        `INSERT INTO doctors (nameAz, specialtyAz, bioAz, photoUrl, whatsappUrl, telegramUrl, instagramUrl, experienceYears, \`order\`, isActive, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          item.nameAz,
          item.specialtyAz,
          item.bioAz ?? null,
          item.photoUrl ?? null,
          item.whatsappUrl ?? null,
          item.telegramUrl ?? null,
          item.instagramUrl ?? null,
          item.experienceYears ?? 0,
          item.order,
          item.isActive,
        ]
      );
    }
  }
}

async function main() {
  const connection = await mysql.createConnection(DATABASE_URL!);

  console.log("Syncing doctors catalog...");
  await connection.beginTransaction();

  try {
    await upsertDoctorsCatalog(connection);
    await connection.commit();
    console.log("✓ Doctors catalog synced successfully");
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error("Fatal error while syncing doctors catalog:", error);
  process.exit(1);
});
