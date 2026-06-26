import { Router } from "express";
import * as controller from "../../controllers/client/auth.controller";
import * as validator from "../../validators/auth.validator";

const router = Router();

router.post("/register", validator.registerValidator, controller.registerPost);
router.post("/login", validator.loginValidator, controller.loginPost);
router.post("/logout", controller.logout);

export const authRoutes = router;
