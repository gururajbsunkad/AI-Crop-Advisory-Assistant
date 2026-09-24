import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import profileRouter from "./profile";
import dashboardRouter from "./dashboard";
import advisoriesRouter from "./advisories";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(profileRouter);
router.use(dashboardRouter);
router.use(advisoriesRouter);

export default router;
