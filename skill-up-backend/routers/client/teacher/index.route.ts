import { Router } from "express";
import { accountRoutes } from "./account.route";
import { quizRoutes } from "./quiz.route";

const router = Router();

router.use("/account", accountRoutes);
router.use("/quizzes", quizRoutes);

export const teacherRoutes = router;
