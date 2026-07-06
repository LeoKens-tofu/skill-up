import { Router } from "express";
import { accountRoutes } from "./account.route";
import { quizRoutes } from "./quizz.route";
import { courseRoutes } from "./course.route";

import { skillRoutes } from "./skill.route";

const router = Router();

router.use("/account", accountRoutes);
router.use("/quizzes", quizRoutes);
router.use("/courses", courseRoutes);
router.use("/skills", skillRoutes);

export const studentRoutes = router;
