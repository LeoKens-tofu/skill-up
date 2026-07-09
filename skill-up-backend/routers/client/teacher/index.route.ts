import { Router } from "express";
import { accountRoutes } from "./account.route";
import { quizRoutes } from "./quiz.route";
import { courseRoutes } from "./course.route";
import { classRoutes } from "./class.route";

const router = Router();

router.use("/account", accountRoutes);
router.use("/quizzes", quizRoutes);
router.use("/courses", courseRoutes);
router.use("/classes", classRoutes);

export const teacherRoutes = router;
