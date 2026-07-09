import { Router } from "express";
import * as controller from "../../../controllers/client/schedule-student.controller";
import { requireAuth } from "../../../middlewares/auth.middleware";

const router = Router();

// Lịch học cá nhân của sinh viên
router.get("/", requireAuth, controller.index);
router.post("/", requireAuth, controller.create);
router.patch("/:id", requireAuth, controller.update);
router.delete("/:id", requireAuth, controller.remove);

export const scheduleRoutes = router;
