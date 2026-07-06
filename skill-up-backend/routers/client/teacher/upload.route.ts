import { Router, Request, Response, NextFunction, RequestHandler } from "express";
import * as controller from "../../../controllers/client/upload.controller";
import { requireAuth } from "../../../middlewares/auth.middleware";
import {
  uploadVideo,
  uploadResource,
  uploadThumbnail,
} from "../../../config/upload.config";

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
  "/video",
  requireAuth,
  runUpload(uploadVideo.single("file")),
  controller.uploadVideoFile
);

router.post(
  "/resource",
  requireAuth,
  runUpload(uploadResource.single("file")),
  controller.uploadResourceFile
);

router.post(
  "/thumbnail",
  requireAuth,
  runUpload(uploadThumbnail.single("file")),
  controller.uploadThumbnailFile
);

export const uploadRoutes = router;
