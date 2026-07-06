import { Router } from "express";
import { accountRoutes } from "./account.route";
import { quizRoutes } from "./quiz.route";
import { courseRoutes } from "./course.route";

const router = Router();

router.use("/account", accountRoutes);
router.use("/quizzes", quizRoutes);
router.use("/courses", courseRoutes);

export const teacherRoutes = router;
