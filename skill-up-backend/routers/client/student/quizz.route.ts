import { Router } from "express";
import * as controller from "../../../controllers/client/quizz-student.controller";
import { requireAuth } from "../../../middlewares/auth.middleware";

const router = Router();

router.get("/", requireAuth, controller.index);
router.get("/history", requireAuth, controller.history);
router.get("/history/:id", requireAuth, controller.historyDetail);
router.get("/:id", requireAuth, controller.detail);
router.post("/:id/submit", requireAuth, controller.submit);

export const quizRoutes = router;
