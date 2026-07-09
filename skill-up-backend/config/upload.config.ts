import multer from "multer";
import path from "path";
import fs from "fs";

// Thư mục gốc lưu file. Dev: <backend>/uploads, Docker: /app/uploads
// (được mount ra host qua volume để không mất khi redeploy)
export const UPLOAD_ROOT =
  process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");

const VIDEO_DIR = path.join(UPLOAD_ROOT, "videos");
const RESOURCE_DIR = path.join(UPLOAD_ROOT, "resources");
const THUMBNAIL_DIR = path.join(UPLOAD_ROOT, "thumbnails");
const SUBMISSION_DIR = path.join(UPLOAD_ROOT, "submissions");

// Tạo sẵn thư mục khi khởi động
[UPLOAD_ROOT, VIDEO_DIR, RESOURCE_DIR, THUMBNAIL_DIR, SUBMISSION_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Sinh tên file an toàn, tránh trùng
const makeFilename = (originalname: string) => {
  const ext = path.extname(originalname).toLowerCase();
  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  return `${unique}${ext}`;
};

const storage = (dir: string) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dir),
    filename: (_req, file, cb) => cb(null, makeFilename(file.originalname)),
  });

const MB = 1024 * 1024;

const VIDEO_MIMES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
const IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const RESOURCE_MIMES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "text/plain",
  ...IMAGE_MIMES,
];

const fileFilter =
  (allowed: string[]) =>
  (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Định dạng file không được hỗ trợ"));
    }
  };

// Video: tối đa 500MB
export const uploadVideo = multer({
  storage: storage(VIDEO_DIR),
  limits: { fileSize: 500 * MB },
  fileFilter: fileFilter(VIDEO_MIMES),
});

// Tài liệu: tối đa 50MB
export const uploadResource = multer({
  storage: storage(RESOURCE_DIR),
  limits: { fileSize: 50 * MB },
  fileFilter: fileFilter(RESOURCE_MIMES),
});

// Ảnh bìa: tối đa 5MB
export const uploadThumbnail = multer({
  storage: storage(THUMBNAIL_DIR),
  limits: { fileSize: 5 * MB },
  fileFilter: fileFilter(IMAGE_MIMES),
});

// Bài sinh viên nộp: chấp nhận các định dạng tài liệu phổ biến, tối đa 50MB
export const uploadSubmission = multer({
  storage: storage(SUBMISSION_DIR),
  limits: { fileSize: 50 * MB },
  fileFilter: fileFilter(RESOURCE_MIMES),
});
