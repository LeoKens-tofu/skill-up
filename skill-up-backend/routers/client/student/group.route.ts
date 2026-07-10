import { Router, Request, Response, NextFunction, RequestHandler } from "express";
import * as controller from "../../../controllers/client/group-student.controller";
import { requireAuth } from "../../../middlewares/auth.middleware";
import { uploadGroupChat } from "../../../config/upload.config";

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

// Lưu ý thứ tự: các route tĩnh (/invite, /join) đặt TRƯỚC /:id để không bị nuốt
router.get("/", requireAuth, controller.listMyGroups);
router.post("/", requireAuth, controller.createGroup);
router.get("/invite/:code", requireAuth, controller.getGroupByInvite);
router.post("/join", requireAuth, controller.joinGroup);

router.get("/:id", requireAuth, controller.getGroupDetail);
router.get("/:id/messages", requireAuth, controller.getMessages);
router.post("/:id/leave", requireAuth, controller.leaveGroup);
router.post(
  "/:id/upload",
  requireAuth,
  runUpload(uploadGroupChat.single("file")),
  controller.uploadAttachment
);

export const groupRoutes = router;
