import { z } from "zod";
import { adminProcedure, router } from "./trpc";
import { storagePut } from "../storage";

export const uploadRouter = router({
  image: adminProcedure
    .input(
      z.object({
        filename: z.string().min(1),
        base64: z.string().min(1),
        contentType: z.string().min(1),
        category: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const sanitized = input.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
        const prefix = (input.category || "uploads").replace(/[^a-zA-Z0-9/_-]/g, "_");
        const finalName = `${prefix}/${Date.now()}_${sanitized}`;
        const buffer = Buffer.from(input.base64, "base64");
        const { url } = await storagePut(finalName, buffer, input.contentType);
        return { success: true, url };
      } catch (error) {
        console.error("Upload error:", error);
        throw new Error("Failed to upload image");
      }
    }),
});
