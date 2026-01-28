import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDiagnosticServices, getDiagnosticServiceById, getDiagnosticSubServices, getLaboratoryAnalysisTypes, getLaboratoryAnalysisTypeById, getLaboratorySubTests } from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  cms: router({
    diagnostics: router({
      list: publicProcedure.query(async () => getDiagnosticServices()),
      getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
        const service = await getDiagnosticServiceById(input.id);
        const subServices = await getDiagnosticSubServices(input.id);
        return { service, subServices };
      }),
    }),
    laboratory: router({
      list: publicProcedure.query(async () => getLaboratoryAnalysisTypes()),
      getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
        const analysisType = await getLaboratoryAnalysisTypeById(input.id);
        const subTests = await getLaboratorySubTests(input.id);
        return { analysisType, subTests };
      }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
