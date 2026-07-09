import { Router, Request, Response, NextFunction, RequestHandler } from "express";
import * as controller from "../../../controllers/client/submission-student.controller";
import { requireAuth } from "../../../middlewares/auth.middleware";
import { uploadSubmission } from "../../../config/upload.config";

const router = Router();

// Chạy multer và chuyển mọi lỗi (định dạng, quá dung lượng...) thành JSON {code, message}
const runUpload =
  (mw: RequestHandler) =>
  (req: Request, res: Response, next: NextFunction): void => {
    mw(req, res, (err: any) => {
      if (err) {
        res.json({ code: "error", message: err.message || "Lỗi tải file" });
        return;
      }
      next();
    });
  };

router.post(
  "/upload",
  requireAuth,
  runUpload(uploadSubmission.single("file")),
  controller.uploadFile
);
router.post("/", requireAuth, controller.submit);
router.get("/:lessonId", requireAuth, controller.getMySubmission);

export const submissionRoutes = router;
