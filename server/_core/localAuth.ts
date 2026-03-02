import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Express, Request, Response } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";

const JWT_SECRET = ENV.cookieSecret || "dialab-fallback-secret-key-2024";

export interface JwtPayload {
  openId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export function createJwtToken(openId: string, email: string, role: string): string {
  return jwt.sign(
    { openId, email, role },
    JWT_SECRET,
    { expiresIn: "365d" }
  );
}

export function verifyJwtToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function registerLocalAuthRoutes(app: Express) {
  // Login endpoint
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    try {
      const user = await db.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      // Update last signed in
      await db.updateUserLastSignedIn(user.openId);

      const token = createJwtToken(user.openId, user.email || "", user.role);
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      });
    } catch (error) {
      console.error("[Auth] Login failed", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, cookieOptions);
    res.json({ success: true });
  });

  // Get current user
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const payload = verifyJwtToken(token);
    if (!payload) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    try {
      const user = await db.getUserByOpenId(payload.openId);
      if (!user) {
        res.status(401).json({ error: "User not found" });
        return;
      }
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // Register (only for initial setup or admin creation)
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    const { email, password, name, adminSecret } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: "Email, password and name are required" });
      return;
    }

    // Check if any users exist - first user becomes admin automatically
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    const userCount = await db.getUserCount();
    const isFirstUser = userCount === 0;
    const isAdminSecret = adminSecret === (ENV.cookieSecret + "_admin");

    if (!isFirstUser && !isAdminSecret) {
      res.status(403).json({ error: "Registration is restricted" });
      return;
    }

    try {
      const passwordHash = await hashPassword(password);
      const openId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await db.upsertUser({
        openId,
        name,
        email,
        passwordHash,
        loginMethod: "local",
        role: isFirstUser ? "admin" : "user",
        lastSignedIn: new Date(),
      });

      const user = await db.getUserByEmail(email);
      if (!user) throw new Error("User creation failed");

      const token = createJwtToken(user.openId, user.email || "", user.role);
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      });
    } catch (error) {
      console.error("[Auth] Registration failed", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });
}
