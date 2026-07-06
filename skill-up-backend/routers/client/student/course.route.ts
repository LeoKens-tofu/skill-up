import { Router } from "express";
import * as controller from "../../../controllers/client/course-student.controller";
import { requireAuth } from "../../../middlewares/auth.middleware";

const router = Router();

router.get("/", requireAuth, controller.index);
router.get("/enrolled", requireAuth, controller.enrolled);
router.get("/:id", requireAuth, controller.detail);
router.post("/:id/enroll", requireAuth, controller.enroll);
router.post("/:id/lessons/:lessonId/complete", requireAuth, controller.completeLesson);

export const courseRoutes = router;
