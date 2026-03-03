import { z } from "zod";
import { adminProcedure, router } from "./trpc";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Папка для сохранения загруженных файлов
const UPLOAD_DIR = path.resolve(__dirname, "..", "..", "dist", "public", "uploads");

// Создать директорию, если её нет
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const uploadRouter = router({
  // Загрузка изображения (base64)
  image: adminProcedure
    .input(
      z.object({
        filename: z.string().min(1),
        base64: z.string().min(1),
        category: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Валидация имени файла
        const sanitized = input.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
        const timestamp = Date.now();
        const finalName = `${timestamp}_${sanitized}`;
        const filepath = path.join(UPLOAD_DIR, finalName);

        // Декодировать base64 и сохранить
        const buffer = Buffer.from(input.base64, "base64");
        fs.writeFileSync(filepath, buffer);

        // Вернуть публичный URL
        const publicUrl = `/uploads/${finalName}`;
        return { success: true, url: publicUrl };
      } catch (error) {
        console.error("Upload error:", error);
        throw new Error("Failed to upload image");
      }
    }),
});
