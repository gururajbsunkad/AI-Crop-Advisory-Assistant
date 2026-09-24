import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, farmerProfilesTable } from "@workspace/db";
import {
  GetProfileResponse,
  UpdateProfileBody,
  UpdateProfileResponse,
} from "@workspace/api-zod";
import { ensureProfile, requireAuth, type AuthenticatedRequest } from "../middlewares/auth";
import { serializeProfile } from "../lib/serializers";

const router: IRouter = Router();

router.get(
  "/profile",
  requireAuth,
  async (req: AuthenticatedRequest, res): Promise<void> => {
    const profile = await ensureProfile(req.userId!, req.userName);
    res.json(GetProfileResponse.parse(serializeProfile(profile)));
  },
);

router.put(
  "/profile",
  requireAuth,
  async (req: AuthenticatedRequest, res): Promise<void> => {
    const parsed = UpdateProfileBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Please check the profile fields and try again." });
      return;
    }

    const profile = await ensureProfile(req.userId!, req.userName);
    const [updated] = await db
      .update(farmerProfilesTable)
      .set({
        fullName: parsed.data.fullName,
        phone: parsed.data.phone ?? null,
        village: parsed.data.village ?? null,
        district: parsed.data.district ?? null,
        state: parsed.data.state ?? null,
        country: parsed.data.country ?? "India",
        farmingType: parsed.data.farmingType ?? null,
        farmSizeAcres:
          parsed.data.farmSizeAcres === null || parsed.data.farmSizeAcres === undefined
            ? null
            : String(parsed.data.farmSizeAcres),
        preferredLanguage: parsed.data.preferredLanguage ?? "English",
        updatedAt: new Date(),
      })
      .where(eq(farmerProfilesTable.id, profile.id))
      .returning();

    res.json(UpdateProfileResponse.parse(serializeProfile(updated)));
  },
);

export default router;