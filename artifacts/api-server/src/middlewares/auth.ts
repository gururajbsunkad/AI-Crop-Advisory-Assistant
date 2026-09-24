import { getAuth } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db, farmerProfilesTable, usersTable } from "@workspace/db";

export type AuthenticatedRequest = Request & {
  userId?: string;
  userEmail?: string | null;
  userName?: string | null;
};

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  const claims = auth.sessionClaims as
    | { email?: string; name?: string }
    | undefined;
  const userEmail = claims?.email ?? null;
  const userName = claims?.name ?? null;

  try {
    await db
      .insert(usersTable)
      .values({
        id: userId,
        email: userEmail,
        name: userName,
      })
      .onConflictDoUpdate({
        target: usersTable.id,
        set: { email: userEmail, name: userName, updatedAt: new Date() },
      });
    req.userId = userId;
    req.userEmail = userEmail;
    req.userName = userName;
    next();
  } catch (error) {
    req.log.error({ err: error }, "Failed to provision signed-in user");
    res.status(500).json({ error: "Unable to prepare your account." });
  }
}

export async function ensureProfile(userId: string, name?: string | null) {
  const [existing] = await db
    .select()
    .from(farmerProfilesTable)
    .where(eq(farmerProfilesTable.userId, userId))
    .limit(1);
  if (existing) return existing;

  const [profile] = await db
    .insert(farmerProfilesTable)
    .values({
      id: randomUUID(),
      userId,
      fullName: name?.trim() || "Farmer",
      country: "India",
      preferredLanguage: "English",
    })
    .returning();
  return profile;
}