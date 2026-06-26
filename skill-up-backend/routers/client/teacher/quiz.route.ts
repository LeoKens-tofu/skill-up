import { Router } from "express";
import * as controller from "../../../controllers/client/quizz-teacher.controller";
import { requireAuth } from "../../../middlewares/auth.middleware";
import { quizValidator } from "../../../validators/client/teacher/quiz.validator";

const router = Router();

router.get("/", requireAuth, controller.getQuizzes);
router.post("/", requireAuth, quizValidator, controller.createQuiz);
router.get("/trash", requireAuth, controller.getTrashQuizzes);
router.get("/:id", requireAuth, controller.getQuizDetail);
router.patch("/:id", requireAuth, quizValidator, controller.editQuiz);
router.delete("/:id", requireAuth, controller.deleteQuiz);
router.patch("/restore/:id", requireAuth, controller.restoreQuiz);
router.delete("/hard/:id", requireAuth, controller.hardDeleteQuiz);

export const quizRoutes = router;
