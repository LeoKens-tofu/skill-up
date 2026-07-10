import { Router } from "express";
import * as controller from "../../../controllers/client/assessment-teacher.controller";
import { requireAuth } from "../../../middlewares/auth.middleware";

const router = Router();

// Trung tâm đánh giá / chấm bài xuyên suốt mọi lớp
router.get("/overview", requireAuth, controller.getOverview);
router.patch("/submissions/:submissionId/grade", requireAuth, controller.gradeSubmission);

export const assessmentRoutes = router;
