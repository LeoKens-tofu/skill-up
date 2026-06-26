import { Router } from "express";
import * as controller from "../../../controllers/client/skill.controller";
import { requireAuth } from "../../../middlewares/auth.middleware";

const router = Router();

router.post("/analyze", requireAuth, controller.analyze);
router.get("/", requireAuth, controller.current);
router.get("/history", requireAuth, controller.history);

export const skillRoutes = router;
