import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { COOKIE_NAME } from "@shared/const";
import { verifyJwtToken } from "./localAuth";
import * as db from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  try {
    const cookies = opts.req.cookies as Record<string, string> | undefined;
    const token = cookies?.[COOKIE_NAME];
    if (token) {
      const payload = verifyJwtToken(token);
      if (payload) {
        const found = await db.getUserByOpenId(payload.openId);
        if (found) {
          user = found;
        }
      }
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
