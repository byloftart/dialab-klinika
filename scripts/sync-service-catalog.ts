import "dotenv/config";
import mysql from "mysql2/promise";
import { diagnosticsCatalog, laboratoryCatalog } from "../shared/serviceCatalog";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("ERROR: DATABASE_URL environment variable is required");
  process.exit(1);
}

async function upsertLaboratoryCatalog(connection: mysql.Connection) {
  for (const item of laboratoryCatalog) {
    const [existingRows] = await connection.execute(
      "SELECT id FROM laboratoryAnalysisTypes WHERE titleAz = ? LIMIT 1",
      [item.titleAz]
    );
    const existingId = (existingRows as Array<{ id: number }>)[0]?.id;

    let analysisTypeId = existingId;

    if (analysisTypeId) {
      await connection.execute(
        `UPDATE laboratoryAnalysisTypes
         SET descriptionAz = ?, icon = ?, \`order\` = ?, isActive = 1, updatedAt = NOW()
         WHERE id = ?`,
        [item.descriptionAz, item.icon, item.order, analysisTypeId]
      );
      await connection.execute(
        "DELETE FROM laboratorySubTests WHERE analysisTypeId = ?",
        [analysisTypeId]
      );
    } else {
      const [result] = await connection.execute(
        `INSERT INTO laboratoryAnalysisTypes (titleAz, descriptionAz, imageUrl, icon, \`order\`, isActive, createdAt, updatedAt)
         VALUES (?, ?, NULL, ?, ?, 1, NOW(), NOW())`,
        [item.titleAz, item.descriptionAz, item.icon, item.order]
      );
      analysisTypeId = (result as mysql.ResultSetHeader).insertId;
    }

    for (let index = 0; index < item.subTests.length; index += 1) {
      const [titleAz, descriptionAz] = item.subTests[index];
      await connection.execute(
        `INSERT INTO laboratorySubTests (analysisTypeId, titleAz, descriptionAz, \`order\`, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, NOW(), NOW())`,
        [analysisTypeId, titleAz, descriptionAz, index]
      );
    }
  }
}

async function upsertDiagnosticsCatalog(connection: mysql.Connection) {
  for (const item of diagnosticsCatalog) {
    const [existingRows] = await connection.execute(
      "SELECT id FROM diagnosticServices WHERE titleAz = ? LIMIT 1",
      [item.titleAz]
    );
    const existingId = (existingRows as Array<{ id: number }>)[0]?.id;

    let diagnosticServiceId = existingId;

    if (diagnosticServiceId) {
      await connection.execute(
        `UPDATE diagnosticServices
         SET descriptionAz = ?, icon = ?, \`order\` = ?, isActive = 1, updatedAt = NOW()
         WHERE id = ?`,
        [item.descriptionAz, item.icon, item.order, diagnosticServiceId]
      );
      await connection.execute(
        "DELETE FROM diagnosticSubServices WHERE diagnosticServiceId = ?",
        [diagnosticServiceId]
      );
    } else {
      const [result] = await connection.execute(
        `INSERT INTO diagnosticServices (titleAz, descriptionAz, imageUrl, icon, \`order\`, isActive, createdAt, updatedAt)
         VALUES (?, ?, NULL, ?, ?, 1, NOW(), NOW())`,
        [item.titleAz, item.descriptionAz, item.icon, item.order]
      );
      diagnosticServiceId = (result as mysql.ResultSetHeader).insertId;
    }

    for (let index = 0; index < item.subServices.length; index += 1) {
      await connection.execute(
        `INSERT INTO diagnosticSubServices (diagnosticServiceId, titleAz, descriptionAz, \`order\`, createdAt, updatedAt)
         VALUES (?, ?, NULL, ?, NOW(), NOW())`,
        [diagnosticServiceId, item.subServices[index], index]
      );
    }
  }
}

async function main() {
  const connection = await mysql.createConnection(DATABASE_URL!);

  console.log("Syncing laboratory and diagnostics catalog...");
  await connection.beginTransaction();

  try {
    await connection.execute("UPDATE laboratoryAnalysisTypes SET isActive = 0, updatedAt = NOW()");
    await connection.execute("UPDATE diagnosticServices SET isActive = 0, updatedAt = NOW()");
    await upsertLaboratoryCatalog(connection);
    await upsertDiagnosticsCatalog(connection);
    await connection.commit();
    console.log("✓ Service catalog synced successfully");
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error("Fatal error while syncing service catalog:", error);
  process.exit(1);
});
