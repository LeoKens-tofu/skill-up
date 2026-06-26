import { Router } from "express";
import { accountRoutes } from "./account.route";
import { quizRoutes } from "./quizz.route";

import { skillRoutes } from "./skill.route";

const router = Router();

router.use("/account", accountRoutes);
router.use("/quizzes", quizRoutes);
router.use("/skills", skillRoutes);

export const studentRoutes = router;
