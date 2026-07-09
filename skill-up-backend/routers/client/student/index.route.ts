import { Router } from "express";
import { accountRoutes } from "./account.route";
import { quizRoutes } from "./quizz.route";
import { courseRoutes } from "./course.route";
import { scheduleRoutes } from "./schedule.route";
import { submissionRoutes } from "./submission.route";
import { assignmentRoutes } from "./assignment.route";

import { skillRoutes } from "./skill.route";

const router = Router();

router.use("/account", accountRoutes);
router.use("/quizzes", quizRoutes);
router.use("/courses", courseRoutes);
router.use("/schedule", scheduleRoutes);
router.use("/submissions", submissionRoutes);
router.use("/assignments", assignmentRoutes);
router.use("/skills", skillRoutes);

export const studentRoutes = router;
