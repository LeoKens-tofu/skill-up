import { Router } from "express";
import { authRoutes } from "./auth.route";
import { studentRoutes } from "./student/index.route";
import { teacherRoutes } from "./teacher/index.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/student", studentRoutes);
router.use("/teacher", teacherRoutes);

export const clientRoutes = router;
