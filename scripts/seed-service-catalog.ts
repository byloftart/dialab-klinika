import "dotenv/config";
import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("ERROR: DATABASE_URL environment variable is required");
  process.exit(1);
}

const laboratorySeed = [
  {
    titleAz: "Kliniki Analizlər",
    descriptionAz:
      "Qanın ümumi analizi, hemoglobin, trombositlər və digər əsas göstəricilərin tədqiqi.",
    icon: "blood",
    order: 0,
    subTests: [
      ["Qanın ümumi analizi", "26 göstərici və leykoformula"],
      ["Hemoglobin, Trombositlər, Leykositlər", "Əsas hüceyrə sayları"],
      ["Sidiyin ümumi analizi", "Sidik göstəriciləri"],
      ["Nəcisin ümumi analizi", "Nəcis göstəriciləri"],
      ["Spermogramma", "Sperma analizi"],
      ["Qan qrupu və rezus-faktor", "Qan qrupu təyini"],
    ],
  },
  {
    titleAz: "Bakterioloji və Hormonların Tədqiqi",
    descriptionAz:
      "Bakterial enfeksiyaların müəyyən edilməsi və hormon səviyyələrinin tədqiqi.",
    icon: "microscope",
    order: 1,
    subTests: [
      ["Boğaz sürüşməsi", "Streptokkok və digər patogenlərin aşkarlanması"],
      ["Sidik kültürü", "Sidik yolu enfeksiyalarının diaqnostikası"],
      ["Qan kültürü", "Sepsis və qan enfeksiyalarının müəyyən edilməsi"],
      ["Tiroid hormonları (TSH, T3, T4)", "Tiroid funksiyasının qiymətləndirilməsi"],
      ["Seks hormonları", "Estrogen, Progesteron, Testosteron"],
      ["Adrenal hormonları", "Kortizol və digər adrenal hormonları"],
    ],
  },
  {
    titleAz: "Seroloji və İmmunoloji Testlər",
    descriptionAz:
      "Viral və bakteri enfeksiyalarına qarşı antitestlərin aşkarlanması.",
    icon: "immune",
    order: 2,
    subTests: [
      ["HIV testi", "Ən müasir metodlarla HIV aşkarlanması"],
      ["Hepatit testləri (A, B, C)", "Hepatit viruslarına qarşı antitestlər"],
      ["Sifiliz testi (RPR/VDRL)", "Treponema pallidum antitestləri"],
      ["Rubella antitestləri", "Rubella virusuna qarşı IgG və IgM"],
      ["Toxoplasmoz testləri", "Toxoplasma gondii antitestləri"],
      ["CMV antitestləri", "Sitomegalovirusa qarşı antitestlər"],
    ],
  },
  {
    titleAz: "Biokimyəvi Analizlər",
    descriptionAz:
      "Metabolik proseslərin qiymətləndirilməsi və orqan funksiyasının müəyyən edilməsi.",
    icon: "biochemical",
    order: 3,
    subTests: [
      ["Qlükoza", "Qan şəkərinin səviyyəsi"],
      ["Lipid profili", "Xolesterol, triqliseridlər, HDL, LDL"],
      ["Qaraciyər funksiyası", "ALT, AST, Bilirubin, Albumin"],
      ["Böyrək funksiyası", "Kreatinin, Üreya, Urik asid"],
      ["Elektrolit balansı", "Natrium, Kalium, Kalsium, Fosfat"],
      ["Amilaza və Lipaza", "Pankreas enzimləri"],
    ],
  },
  {
    titleAz: "Vitamin və Minerallar",
    descriptionAz:
      "Vital vitamin və mineral səviyyələrinin tədqiqi və defisit müəyyən edilməsi.",
    icon: "vitamin",
    order: 4,
    subTests: [
      ["Vitamin D", "25-OH Vitamin D səviyyəsi"],
      ["Vitamin B12 və Folat", "B12 və folik asid səviyyələri"],
      ["Demir (Ferritin, Serum Iron)", "Demir ehtiyatlarının qiymətləndirilməsi"],
      ["Kalsium və Fosfat", "Sümük metabolizmi göstəriciləri"],
      ["Maqnezium", "Serum maqnezium səviyyəsi"],
      ["Sink və Mis", "Trace elementlərin tədqiqi"],
    ],
  },
  {
    titleAz: "Onkoloji və Genetik Testlər",
    descriptionAz:
      "Tumor markerləri və genetik mutasyonların aşkarlanması.",
    icon: "genetics",
    order: 5,
    subTests: [
      ["PSA (Prostat Spesifik Antigen)", "Prostat xərçəngi markerı"],
      ["CEA (Karsinoembrionik Antigen)", "Kolorektal xərçəngi markerı"],
      ["CA 19-9", "Pankreas xərçəngi markerı"],
      ["BRCA1/BRCA2 mutasyonları", "Meme xərçəngi genetik riski"],
      ["Herediter xərçəngi sendromları", "Lynch sendromu və digərləri"],
      ["Mikrosatellit instabilliyi", "Genetik xərçəngi predispozisiyası"],
    ],
  },
];

const diagnosticsSeed = [
  {
    titleAz: "Ultrasəs Müayinəsi (USM)",
    descriptionAz:
      "Ən müasir USM cihazları ilə daxili orqanların, kiçik çanaq üzvlərinin və hamiləliyin müayinəsi.",
    icon: "activity",
    order: 0,
    subServices: [
      "Daxili orqanların USM-i",
      "Kiçik çanaq üzvlərinin USM-i",
      "Hamiləliyin USM-i və Doppleroqrafiya",
      "Damarların Doppleroqrafiyası",
      "Digər USM müayinələri",
    ],
  },
  {
    titleAz: "Kardioloji Diaqnostika",
    descriptionAz:
      "Ürək-damar sisteminin hərtərəfli müayinəsi və diaqnostikası.",
    icon: "cardio",
    order: 1,
    subServices: [
      "Elektrokardioqramma (EKQ)",
      "Holter EKQ monitorinqi",
      "Exokardioqrafiya (EXO-KQ)",
      "Stress testi",
      "Kardioloji konsultasiya",
    ],
  },
  {
    titleAz: "Nevroloji Müayinə",
    descriptionAz:
      "Sinir sisteminin müayinəsi və nevroloji xəstəliklərin diaqnostikası.",
    icon: "neuro",
    order: 2,
    subServices: [
      "Elektroensefaloqramma (EEQ)",
      "Nevroloji müayinə",
      "Baş ağrılarının diaqnostikası",
      "Yuxu pozğunluqları müayinəsi",
      "Nevropatoloq konsultasiyası",
    ],
  },
  {
    titleAz: "Ginekoloji Müayinə",
    descriptionAz:
      "Qadın sağlamlığı üçün hərtərəfli ginekoloji müayinə və diaqnostika.",
    icon: "gyneco",
    order: 3,
    subServices: [
      "Kolposkopiya",
      "Ginekoloji USM",
      "Hamiləlik müayinəsi",
      "Hormonal müayinə",
      "Ginekoloq konsultasiyası",
    ],
  },
  {
    titleAz: "LOR Müayinəsi",
    descriptionAz:
      "Qulaq, burun və boğaz xəstəliklərinin müayinəsi və müalicəsi.",
    icon: "ent",
    order: 4,
    subServices: [
      "Endoskopik müayinə",
      "Audiometriya",
      "Rinoskopiya",
      "Laringoskopiya",
      "LOR konsultasiyası",
    ],
  },
  {
    titleAz: "Ümumi Həkim Məsləhəti",
    descriptionAz:
      "Təcrübəli mütəxəssislərdən fərdi yanaşma və peşəkar məsləhət.",
    icon: "doctor",
    order: 5,
    subServices: [
      "Terapevt konsultasiyası",
      "Pediatr konsultasiyası",
      "Endokrinoloq konsultasiyası",
      "Dermatoveneroloq konsultasiyası",
      "Reabilitoloq və Fizioterapiya",
    ],
  },
];

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
