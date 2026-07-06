import { Request, Response } from "express";

// Chuyển số byte sang chuỗi dễ đọc: "2.4 MB"
const humanSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
};

// Trả về URL tương đối (/uploads/...) — frontend ghép với NEXT_PUBLIC_API_URL
const respondWithFile = (
  req: Request,
  res: Response,
  subdir: string
): any => {
  if (!req.file) {
    return res.json({ code: "error", message: "Không nhận được file" });
  }

  const url = `/uploads/${subdir}/${req.file.filename}`;

  return res.json({
    code: "success",
    message: "Tải lên thành công",
    data: {
      url,
      name: req.file.originalname,
      size: humanSize(req.file.size),
    },
  });
};

// [POST] /api/client/teacher/courses/upload/video
export const uploadVideoFile = (req: Request, res: Response): any =>
  respondWithFile(req, res, "videos");

// [POST] /api/client/teacher/courses/upload/resource
export const uploadResourceFile = (req: Request, res: Response): any =>
  respondWithFile(req, res, "resources");

// [POST] /api/client/teacher/courses/upload/thumbnail
export const uploadThumbnailFile = (req: Request, res: Response): any =>
  respondWithFile(req, res, "thumbnails");
