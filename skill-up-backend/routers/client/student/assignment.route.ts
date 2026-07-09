import { Router } from "express";
import * as controller from "../../../controllers/client/submission-student.controller";
import { requireAuth } from "../../../middlewares/auth.middleware";

const router = Router();

// Tổng hợp bài tập từ các khóa đã ghi danh (dùng cho trang Deadline & Lịch học)
router.get("/", requireAuth, controller.getAssignments);

export const assignmentRoutes = router;
