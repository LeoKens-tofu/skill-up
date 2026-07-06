import { Request, Response, NextFunction } from "express";

const LEVELS = ["Cơ bản", "Trung cấp", "Nâng cao"];
const LESSON_TYPES = ["video", "article", "resource", "quiz"];

export const courseValidator = (
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  const { title, category, level, status, chapters } = req.body;

  if (!title || typeof title !== "string" || title.trim() === "") {
    return res.json({ code: "error", message: "Vui lòng nhập tên khóa học" });
  }

  if (!category || typeof category !== "string" || category.trim() === "") {
    return res.json({ code: "error", message: "Vui lòng chọn danh mục khóa học" });
  }

  if (level && !LEVELS.includes(level)) {
    return res.json({ code: "error", message: "Trình độ không hợp lệ" });
  }

  if (status && !["draft", "public"].includes(status)) {
    return res.json({ code: "error", message: "Trạng thái không hợp lệ" });
  }

  // chapters không bắt buộc khi lưu nháp, nhưng nếu có thì phải hợp lệ
  if (chapters !== undefined) {
    if (!Array.isArray(chapters)) {
      return res.json({ code: "error", message: "Danh sách chương không hợp lệ" });
    }

    for (let i = 0; i < chapters.length; i++) {
      const ch = chapters[i];
      if (!ch.title || typeof ch.title !== "string" || ch.title.trim() === "") {
        return res.json({
          code: "error",
          message: `Chương ${i + 1} chưa có tiêu đề`,
        });
      }

      if (ch.lessons !== undefined && !Array.isArray(ch.lessons)) {
        return res.json({
          code: "error",
          message: `Danh sách bài học của chương ${i + 1} không hợp lệ`,
        });
      }

      const lessons = ch.lessons || [];
      for (let j = 0; j < lessons.length; j++) {
        const ls = lessons[j];
        const where = `Bài ${j + 1} (chương ${i + 1})`;

        if (!ls.title || typeof ls.title !== "string" || ls.title.trim() === "") {
          return res.json({ code: "error", message: `${where} chưa có tiêu đề` });
        }

        if (!ls.type || !LESSON_TYPES.includes(ls.type)) {
          return res.json({
            code: "error",
            message: `${where} có loại bài học không hợp lệ`,
          });
        }

        if (ls.type === "video") {
          if (!ls.videoUrl || typeof ls.videoUrl !== "string" || ls.videoUrl.trim() === "") {
            return res.json({
              code: "error",
              message: `${where} chưa có video (tải lên hoặc dán link)`,
            });
          }
        }

        if (ls.type === "article") {
          if (!ls.content || typeof ls.content !== "string" || ls.content.trim() === "") {
            return res.json({
              code: "error",
              message: `${where} chưa có nội dung bài viết`,
            });
          }
        }

        if (ls.type === "resource") {
          if (!Array.isArray(ls.resources) || ls.resources.length === 0) {
            return res.json({
              code: "error",
              message: `${where} cần ít nhất 1 tài liệu`,
            });
          }
        }

        if (ls.type === "quiz") {
          if (!Array.isArray(ls.questions) || ls.questions.length === 0) {
            return res.json({
              code: "error",
              message: `${where} cần ít nhất 1 câu hỏi`,
            });
          }
          for (let k = 0; k < ls.questions.length; k++) {
            const q = ls.questions[k];
            if (!q.questionText || typeof q.questionText !== "string" || q.questionText.trim() === "") {
              return res.json({
                code: "error",
                message: `${where}: câu hỏi ${k + 1} chưa có nội dung`,
              });
            }
            if (!Array.isArray(q.options) || q.options.length < 2) {
              return res.json({
                code: "error",
                message: `${where}: câu hỏi ${k + 1} phải có ít nhất 2 lựa chọn`,
              });
            }
            for (let m = 0; m < q.options.length; m++) {
              if (!q.options[m] || typeof q.options[m] !== "string" || q.options[m].trim() === "") {
                return res.json({
                  code: "error",
                  message: `${where}: lựa chọn ${m + 1} của câu hỏi ${k + 1} không được để trống`,
                });
              }
            }
            if (
              q.correctAnswerIndex === undefined ||
              q.correctAnswerIndex === null ||
              typeof q.correctAnswerIndex !== "number" ||
              q.correctAnswerIndex < 0 ||
              q.correctAnswerIndex >= q.options.length
            ) {
              return res.json({
                code: "error",
                message: `${where}: câu hỏi ${k + 1} chưa chọn đáp án đúng hợp lệ`,
              });
            }
          }
        }
      }
    }
  }

  next();
};
