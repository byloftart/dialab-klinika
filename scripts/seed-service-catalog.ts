import "dotenv/config";
import mysql from "mysql2/promise";
import { diagnosticsCatalog, laboratoryCatalog } from "../shared/serviceCatalog";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("ERROR: DATABASE_URL environment variable is required");
  process.exit(1);
}

const laboratorySeed = laboratoryCatalog;
const diagnosticsSeed = diagnosticsCatalog;

async function main() {
  const connection = await mysql.createConnection(DATABASE_URL!);

  const [labCountRows] = await connection.execute(
    "SELECT COUNT(*) as count FROM laboratoryAnalysisTypes"
  );
  const [diagCountRows] = await connection.execute(
    "SELECT COUNT(*) as count FROM diagnosticServices"
  );

  const labCount = Number((labCountRows as any[])[0]?.count ?? 0);
  const diagCount = Number((diagCountRows as any[])[0]?.count ?? 0);

  if (labCount > 0 || diagCount > 0) {
    console.log(
      `Skipping seed because services already exist. laboratory=${labCount}, diagnostics=${diagCount}`
    );
    await connection.end();
    return;
  }

  console.log("Seeding laboratory and diagnostic services...");

  await connection.beginTransaction();

  try {
    for (const item of laboratorySeed) {
      const [result] = await connection.execute(
        `INSERT INTO laboratoryAnalysisTypes (titleAz, descriptionAz, imageUrl, icon, \`order\`, createdAt, updatedAt)
         VALUES (?, ?, NULL, ?, ?, NOW(), NOW())`,
        [item.titleAz, item.descriptionAz, item.icon, item.order]
      );
      const analysisTypeId = (result as mysql.ResultSetHeader).insertId;

      for (let index = 0; index < item.subTests.length; index += 1) {
        const [titleAz, descriptionAz] = item.subTests[index];
        await connection.execute(
          `INSERT INTO laboratorySubTests (analysisTypeId, titleAz, descriptionAz, \`order\`, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, NOW(), NOW())`,
          [analysisTypeId, titleAz, descriptionAz, index]
        );
      }
    }

    for (const item of diagnosticsSeed) {
      const [result] = await connection.execute(
        `INSERT INTO diagnosticServices (titleAz, descriptionAz, imageUrl, icon, \`order\`, createdAt, updatedAt)
         VALUES (?, ?, NULL, ?, ?, NOW(), NOW())`,
        [item.titleAz, item.descriptionAz, item.icon, item.order]
      );
      const diagnosticServiceId = (result as mysql.ResultSetHeader).insertId;

      for (let index = 0; index < item.subServices.length; index += 1) {
        await connection.execute(
          `INSERT INTO diagnosticSubServices (diagnosticServiceId, titleAz, descriptionAz, \`order\`, createdAt, updatedAt)
           VALUES (?, ?, NULL, ?, NOW(), NOW())`,
          [diagnosticServiceId, item.subServices[index], index]
        );
      }
    }

    await connection.commit();
    console.log("✓ Service catalog seeded successfully");
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error("Failed to seed service catalog:", error);
  process.exit(1);
});
