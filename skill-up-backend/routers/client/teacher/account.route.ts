import { Router } from "express";
import * as controller from "../../../controllers/client/account-teacher.controller";
import { requireAuth } from "../../../middlewares/auth.middleware";

const router = Router();

router.get("/profile", requireAuth, controller.getProfile);

export const accountRoutes = router;
