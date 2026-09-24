import { Router, type IRouter } from "express";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth";
import { GetCurrentUserResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/auth/me", requireAuth, (req: AuthenticatedRequest, res): void => {
  res.json(
    GetCurrentUserResponse.parse({
      id: req.userId,
      email: req.userEmail ?? null,
      name: req.userName ?? null,
    }),
  );
});

export default router;