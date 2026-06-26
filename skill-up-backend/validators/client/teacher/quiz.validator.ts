import { Request, Response, NextFunction } from "express";

export const quizValidator = (req: Request, res: Response, next: NextFunction): any => {
  const { title, subject, status, questions, xp } = req.body;

  if (!title || typeof title !== "string" || title.trim() === "") {
    return res.json({ code: "error", message: "Vui lòng nhập tiêu đề bộ câu hỏi" });
  }

  if (!subject || typeof subject !== "string" || subject.trim() === "") {
    return res.json({ code: "error", message: "Vui lòng chọn môn học" });
  }

  if (status && !["draft", "public"].includes(status)) {
    return res.json({ code: "error", message: "Trạng thái không hợp lệ" });
  }

  if (xp && (typeof xp !== "number" || xp < 0)) {
    return res.json({ code: "error", message: "Điểm XP không hợp lệ" });
  }

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return res.json({ code: "error", message: "Phải có ít nhất 1 câu hỏi" });
  }

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!q.questionText || typeof q.questionText !== "string" || q.questionText.trim() === "") {
      return res.json({ code: "error", message: `Câu hỏi thứ ${i + 1} không được để trống tiêu đề` });
    }
    if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
      return res.json({ code: "error", message: `Câu hỏi thứ ${i + 1} phải có ít nhất 2 lựa chọn` });
    }
    if (q.correctAnswerIndex === undefined || q.correctAnswerIndex === null || typeof q.correctAnswerIndex !== "number") {
      return res.json({ code: "error", message: `Câu hỏi thứ ${i + 1} chưa có đáp án đúng` });
    }
    if (q.correctAnswerIndex < 0 || q.correctAnswerIndex >= q.options.length) {
      return res.json({ code: "error", message: `Đáp án đúng của câu hỏi thứ ${i + 1} không hợp lệ` });
    }
    
    // Check for empty options
    for (let j = 0; j < q.options.length; j++) {
      if (!q.options[j] || typeof q.options[j] !== "string" || q.options[j].trim() === "") {
        return res.json({ code: "error", message: `Lựa chọn thứ ${j + 1} của câu hỏi ${i + 1} không được để trống` });
      }
    }
  }

  next();
};
