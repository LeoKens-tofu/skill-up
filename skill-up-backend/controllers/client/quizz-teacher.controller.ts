import { Request, Response } from "express";
import { Quiz } from "../../models/quiz.model";

// [GET] /api/client/teacher/quizzes
export const getQuizzes = async (req: Request, res: Response): Promise<any> => {
  try {
    const teacherId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const status = req.query.status as string;
    const subject = req.query.subject as string;

    const query: any = { teacherId, deleted: false };

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    if (status && status !== "all") {
      query.status = status;
    }
    if (subject && subject !== "all") {
      query.subject = subject;
    }

    const total = await Quiz.countDocuments(query);
    const quizzes = await Quiz.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.json({
      code: "success",
      data: quizzes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Get Quizzes Error:", error);
    return res.json({ code: "error", message: "Lỗi máy chủ" });
  }
};

// [POST] /api/client/teacher/quizzes
export const createQuiz = async (req: Request, res: Response): Promise<any> => {
  try {
    const teacherId = req.user?.id;
    const { title, subject, status, questions, xp } = req.body;

    const newQuiz = new Quiz({
      title,
      subject,
      teacherId,
      status: status || "draft",
      questions,
      xp: xp || 50
    });

    await newQuiz.save();

    return res.json({
      code: "success",
      message: "Tạo bộ câu hỏi thành công",
      data: newQuiz
    });
  } catch (error) {
    console.error("Create Quiz Error:", error);
    return res.json({ code: "error", message: "Lỗi máy chủ" });
  }
};

// [GET] /api/client/teacher/quizzes/:id
export const getQuizDetail = async (req: Request, res: Response): Promise<any> => {
  try {
    const teacherId = req.user?.id;
    const quizId = req.params.id;

    const quiz = await Quiz.findOne({ _id: quizId, teacherId, deleted: false });

    if (!quiz) {
      return res.json({ code: "error", message: "Không tìm thấy bộ câu hỏi" });
    }

    return res.json({
      code: "success",
      data: quiz
    });
  } catch (error) {
    return res.json({ code: "error", message: "Lỗi máy chủ" });
  }
};

// [PATCH] /api/client/teacher/quizzes/:id
export const editQuiz = async (req: Request, res: Response): Promise<any> => {
  try {
    const teacherId = req.user?.id;
    const quizId = req.params.id;
    const { title, subject, status, questions, xp } = req.body;

    const quiz = await Quiz.findOne({ _id: quizId, teacherId, deleted: false });

    if (!quiz) {
      return res.json({ code: "error", message: "Không tìm thấy bộ câu hỏi" });
    }

    quiz.title = title;
    quiz.subject = subject;
    quiz.status = status;
    quiz.questions = questions;
    if (xp) quiz.xp = xp;

    await quiz.save();

    return res.json({
      code: "success",
      message: "Cập nhật bộ câu hỏi thành công",
      data: quiz
    });
  } catch (error) {
    console.error("Edit Quiz Error:", error);
    return res.json({ code: "error", message: "Lỗi máy chủ" });
  }
};

// [DELETE] /api/client/teacher/quizzes/:id
export const deleteQuiz = async (req: Request, res: Response): Promise<any> => {
  try {
    const teacherId = req.user?.id;
    const quizId = req.params.id;

    const quiz = await Quiz.findOne({ _id: quizId, teacherId, deleted: false });

    if (!quiz) {
      return res.json({ code: "error", message: "Không tìm thấy bộ câu hỏi" });
    }

    quiz.deleted = true;
    quiz.deletedAt = new Date();
    await quiz.save();

    return res.json({
      code: "success",
      message: "Đã chuyển bộ câu hỏi vào thùng rác"
    });
  } catch (error) {
    return res.json({ code: "error", message: "Lỗi máy chủ" });
  }
};

// [GET] /api/client/teacher/quizzes/trash
export const getTrashQuizzes = async (req: Request, res: Response): Promise<any> => {
  try {
    const teacherId = req.user?.id;
    const quizzes = await Quiz.find({ teacherId, deleted: true }).sort({ deletedAt: -1 });

    return res.json({
      code: "success",
      data: quizzes
    });
  } catch (error) {
    return res.json({ code: "error", message: "Lỗi máy chủ" });
  }
};

// [PATCH] /api/client/teacher/quizzes/restore/:id
export const restoreQuiz = async (req: Request, res: Response): Promise<any> => {
  try {
    const teacherId = req.user?.id;
    const quizId = req.params.id;

    const quiz = await Quiz.findOne({ _id: quizId, teacherId, deleted: true });

    if (!quiz) {
      return res.json({ code: "error", message: "Không tìm thấy bộ câu hỏi" });
    }

    quiz.deleted = false;
    quiz.deletedAt = undefined;
    await quiz.save();

    return res.json({
      code: "success",
      message: "Khôi phục bộ câu hỏi thành công"
    });
  } catch (error) {
    return res.json({ code: "error", message: "Lỗi máy chủ" });
  }
};

// [DELETE] /api/client/teacher/quizzes/hard/:id
export const hardDeleteQuiz = async (req: Request, res: Response): Promise<any> => {
  try {
    const teacherId = req.user?.id;
    const quizId = req.params.id;

    const result = await Quiz.deleteOne({ _id: quizId, teacherId, deleted: true });

    if (result.deletedCount === 0) {
      return res.json({ code: "error", message: "Không tìm thấy bộ câu hỏi" });
    }

    return res.json({
      code: "success",
      message: "Đã xóa vĩnh viễn bộ câu hỏi"
    });
  } catch (error) {
    return res.json({ code: "error", message: "Lỗi máy chủ" });
  }
};
