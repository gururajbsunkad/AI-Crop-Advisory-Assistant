import { Router, type IRouter } from "express";
import { and, count, desc, eq, inArray, sql } from "drizzle-orm";
import { db, cropAdvisoriesTable } from "@workspace/db";
import { GetDashboardStatsResponse } from "@workspace/api-zod";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth";
import { serializeAdvisorySummary } from "../lib/serializers";

const router: IRouter = Router();

router.get(
  "/dashboard/stats",
  requireAuth,
  async (req: AuthenticatedRequest, res): Promise<void> => {
    const userId = req.userId!;
    const [totalRow] = await db
      .select({ value: count() })
      .from(cropAdvisoriesTable)
      .where(eq(cropAdvisoriesTable.userId, userId));
    const [highRiskRow] = await db
      .select({ value: count() })
      .from(cropAdvisoriesTable)
      .where(
        and(
          eq(cropAdvisoriesTable.userId, userId),
          inArray(cropAdvisoriesTable.riskLevel, ["HIGH", "CRITICAL"]),
        ),
      );
    const [cropsRow] = await db
      .select({ value: sql<number>`count(distinct ${cropAdvisoriesTable.cropName})` })
      .from(cropAdvisoriesTable)
      .where(eq(cropAdvisoriesTable.userId, userId));
    const recent = await db
      .select()
      .from(cropAdvisoriesTable)
      .where(eq(cropAdvisoriesTable.userId, userId))
      .orderBy(desc(cropAdvisoriesTable.createdAt))
      .limit(5);
    const recentActivity = recent.map(serializeAdvisorySummary);

    res.json(
      GetDashboardStatsResponse.parse({
        totalAdvisories: Number(totalRow?.value ?? 0),
        highRiskCount: Number(highRiskRow?.value ?? 0),
        cropsAnalyzed: Number(cropsRow?.value ?? 0),
        recentAdvisory: recentActivity[0] ?? null,
        recentActivity,
      }),
    );
  },
);

export default router;