import { Router } from "express";
import * as controller from "../../../controllers/client/course-teacher.controller";
import { requireAuth } from "../../../middlewares/auth.middleware";
import { courseValidator } from "../../../validators/client/teacher/course.validator";
import { uploadRoutes } from "./upload.route";

const router = Router();

// Upload video/tài liệu/ảnh bìa phục vụ trình soạn khóa học
// => /api/client/teacher/courses/upload/{video,resource,thumbnail}
router.use("/upload", uploadRoutes);

router.get("/", requireAuth, controller.getCourses);
router.post("/", requireAuth, courseValidator, controller.createCourse);
router.get("/trash", requireAuth, controller.getTrashCourses);
router.get("/:id", requireAuth, controller.getCourseDetail);
router.patch("/:id", requireAuth, courseValidator, controller.editCourse);
router.delete("/:id", requireAuth, controller.deleteCourse);
router.patch("/restore/:id", requireAuth, controller.restoreCourse);
router.delete("/hard/:id", requireAuth, controller.hardDeleteCourse);

export const courseRoutes = router;
