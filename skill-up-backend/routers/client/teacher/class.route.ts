import { Router } from "express";
import * as controller from "../../../controllers/client/class-teacher.controller";
import * as submissionController from "../../../controllers/client/submission-teacher.controller";
import { requireAuth } from "../../../middlewares/auth.middleware";

const router = Router();

// Quản lý lớp học phụ trách (mỗi khóa học = 1 lớp)
router.get("/", requireAuth, controller.getClasses);
router.get("/:id", requireAuth, controller.getClassDetail);
router.get("/:id/students/:studentId", requireAuth, controller.getStudentDetail);

// Chấm bài tập
router.get("/:id/submissions", requireAuth, submissionController.getCourseSubmissions);
router.patch("/:id/submissions/:submissionId/grade", requireAuth, submissionController.gradeSubmission);

export const classRoutes = router;
