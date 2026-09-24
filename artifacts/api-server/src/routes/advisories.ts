import { Router, type IRouter } from "express";
import { and, count, desc, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { db, cropAdvisoriesTable } from "@workspace/db";
import {
  CreateAdvisoryBody,
  CreateAdvisoryResponse,
  DeleteAdvisoryParams,
  GetAdvisoryParams,
  GetAdvisoryResponse,
  ListAdvisoriesQueryParams,
  ListAdvisoriesResponse,
} from "@workspace/api-zod";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth";
import { generateAdvisory } from "../lib/ai";
import { serializeAdvisory, serializeAdvisorySummary } from "../lib/serializers";

const router: IRouter = Router();

router.get(
  "/advisories",
  requireAuth,
  async (req: AuthenticatedRequest, res): Promise<void> => {
    const parsed = ListAdvisoriesQueryParams.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid page, limit, or filter." });
      return;
    }
    const page = parsed.data.page ?? 1;
    const limit = parsed.data.limit ?? 10;
    const filters = [eq(cropAdvisoriesTable.userId, req.userId!)];
    if (parsed.data.crop) filters.push(eq(cropAdvisoriesTable.cropName, parsed.data.crop));
    if (parsed.data.risk) filters.push(eq(cropAdvisoriesTable.riskLevel, parsed.data.risk));
    const where = and(...filters);

    const [totalRow] = await db.select({ value: count() }).from(cropAdvisoriesTable).where(where);
    const rows = await db
      .select()
      .from(cropAdvisoriesTable)
      .where(where)
      .orderBy(desc(cropAdvisoriesTable.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    res.json(
      ListAdvisoriesResponse.parse({
        items: rows.map(serializeAdvisorySummary),
        page,
        limit,
        total: Number(totalRow?.value ?? 0),
      }),
    );
  },
);

router.post(
  "/advisories",
  requireAuth,
  async (req: AuthenticatedRequest, res): Promise<void> => {
    const parsed = CreateAdvisoryBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Please complete the required crop and field details." });
      return;
    }

    const id = randomUUID();
    const input = parsed.data;
    const [created] = await db
      .insert(cropAdvisoriesTable)
      .values({
        id,
        userId: req.userId!,
        cropName: input.cropName.trim(),
        cropVariety: input.cropVariety ?? null,
        location: input.location.trim(),
        soilType: input.soilType ?? null,
        soilPh: input.soilPh === null || input.soilPh === undefined ? null : String(input.soilPh),
        growthStage: input.growthStage ?? null,
        sowingDate: input.sowingDate ?? null,
        irrigationMethod: input.irrigationMethod ?? null,
        irrigationFrequency: input.irrigationFrequency ?? null,
        fertilizerUsage: input.fertilizerUsage ?? null,
        symptoms: input.symptoms ?? null,
        pestObservations: input.pestObservations ?? null,
        diseaseObservations: input.diseaseObservations ?? null,
        weatherConditions: input.weatherConditions ?? null,
        mainConcern: input.mainConcern.trim(),
        additionalNotes: input.additionalNotes ?? null,
        status: "PROCESSING",
      })
      .returning();

    try {
      const generated = await generateAdvisory(input);
      const [updated] = await db
        .update(cropAdvisoriesTable)
        .set({
          status: "COMPLETED",
          riskLevel: generated.result.risk_level,
          confidence: generated.result.confidence,
          advisoryResult: {
            summary: generated.result.summary,
            cropStatus: generated.result.crop_status,
            riskLevel: generated.result.risk_level,
            confidence: generated.result.confidence,
            possibleIssues: generated.result.possible_issues,
            possibleCauses: generated.result.possible_causes,
            immediateActions: generated.result.immediate_actions,
            irrigationRecommendations: generated.result.irrigation_recommendations,
            nutrientRecommendations: generated.result.nutrient_recommendations,
            pestDiseaseRecommendations: generated.result.pest_disease_recommendations,
            preventiveMeasures: generated.result.preventive_measures,
            monitoringChecklist: generated.result.monitoring_checklist,
            warnings: generated.result.warnings,
            followUpQuestions: generated.result.follow_up_questions,
          },
          aiModel: generated.model,
          errorMessage: null,
          updatedAt: new Date(),
        })
        .where(and(eq(cropAdvisoriesTable.id, id), eq(cropAdvisoriesTable.userId, req.userId!)))
        .returning();

      res.status(201).json(CreateAdvisoryResponse.parse(serializeAdvisory(updated)));
    } catch (error) {
      req.log.error({ err: error, advisoryId: id }, "Advisory generation failed");
      const [failed] = await db
        .update(cropAdvisoriesTable)
        .set({
          status: "FAILED",
          errorMessage: "We could not generate an advisory right now.",
          updatedAt: new Date(),
        })
        .where(and(eq(cropAdvisoriesTable.id, id), eq(cropAdvisoriesTable.userId, req.userId!)))
        .returning();
      res.status(502).json({ error: "We could not generate an advisory right now. Please try again." });
      void failed;
    }
  },
);

router.get(
  "/advisories/:id",
  requireAuth,
  async (req: AuthenticatedRequest, res): Promise<void> => {
    const params = GetAdvisoryParams.safeParse(req.params);
    if (!params.success) {
      res.status(404).json({ error: "Advisory not found." });
      return;
    }
    const [advisory] = await db
      .select()
      .from(cropAdvisoriesTable)
      .where(
        and(
          eq(cropAdvisoriesTable.id, params.data.id),
          eq(cropAdvisoriesTable.userId, req.userId!),
        ),
      )
      .limit(1);
    if (!advisory) {
      res.status(404).json({ error: "Advisory not found." });
      return;
    }
    res.json(GetAdvisoryResponse.parse(serializeAdvisory(advisory)));
  },
);

router.delete(
  "/advisories/:id",
  requireAuth,
  async (req: AuthenticatedRequest, res): Promise<void> => {
    const params = DeleteAdvisoryParams.safeParse(req.params);
    if (!params.success) {
      res.status(404).json({ error: "Advisory not found." });
      return;
    }
    const deleted = await db
      .delete(cropAdvisoriesTable)
      .where(
        and(
          eq(cropAdvisoriesTable.id, params.data.id),
          eq(cropAdvisoriesTable.userId, req.userId!),
        ),
      )
      .returning({ id: cropAdvisoriesTable.id });
    if (deleted.length === 0) {
      res.status(404).json({ error: "Advisory not found." });
      return;
    }
    res.sendStatus(204);
  },
);

export default router;