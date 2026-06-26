import { Request, Response } from "express";
import { Quiz } from "../../models/quiz.model";
import { QuizHistory } from "../../models/quiz-history.model";
import { Student } from "../../models/student.model";
import mongoose from "mongoose";

// [GET] /api/client/student/quizzes
export const index = async (req: Request, res: Response): Promise<any> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    const subject = (req.query.subject as string) || "all";

    const query: any = {
      deleted: false,
      status: "public",
    };

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (subject && subject !== "all") {
      query.subject = subject;
    }

    const totalQuizzes = await Quiz.countDocuments(query);
    const totalPages = Math.ceil(totalQuizzes / limit);
    const skip = (page - 1) * limit;

    const quizzes = await Quiz.find(query)
      .populate("teacherId", "fullName avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-questions.correctAnswerIndex -questions.explanation");

    // Lấy thêm thông tin user đã làm bài này chưa
    const studentId = req.user?.id;
    let enrichedQuizzes = quizzes;
    if (studentId) {
      const quizIds = quizzes.map(q => q._id);
      const histories = await QuizHistory.find({
        studentId: studentId,
        quizId: { $in: quizIds }
      }).select("quizId score");

      const historyMap = new Map();
      histories.forEach(h => historyMap.set(h.quizId.toString(), true));

      enrichedQuizzes = quizzes.map(q => {
        const doc: any = q.toObject();
        doc.hasCompleted = historyMap.has(doc._id.toString());
        doc.questionCount = doc.questions ? doc.questions.length : 0;
        return doc;
      }) as any;
    }

    return res.json({
      code: "success",
      message: "Lấy danh sách thành công",
      data: enrichedQuizzes,
      pagination: {
        totalItems: totalQuizzes,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Lỗi get student quizzes:", error);
    return res.json({
      code: "error",
      message: "Lỗi hệ thống",
    });
  }
};

// [GET] /api/client/student/quizzes/history
export const history = async (req: Request, res: Response): Promise<any> => {
  try {
    const studentId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";

    if (!studentId) {
      return res.json({ code: "error", message: "Chưa đăng nhập" });
    }

    let quizIds: mongoose.Types.ObjectId[] = [];
    if (search) {
      const matchingQuizzes = await Quiz.find({
        title: { $regex: search, $options: "i" },
      }).select("_id");
      quizIds = matchingQuizzes.map((q) => q._id as mongoose.Types.ObjectId);
    }

    const query: any = { studentId };
    if (search) {
      query.quizId = { $in: quizIds };
    }

    const totalHistory = await QuizHistory.countDocuments(query);
    const totalPages = Math.ceil(totalHistory / limit);
    const skip = (page - 1) * limit;

    const histories = await QuizHistory.find(query)
      .populate({
        path: "quizId",
        select: "title subject xp",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.json({
      code: "success",
      message: "Lấy lịch sử thành công",
      data: histories,
      pagination: {
        totalItems: totalHistory,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Lỗi get history:", error);
    return res.json({
      code: "error",
      message: "Lỗi hệ thống",
    });
  }
};

// [GET] /api/client/student/quizzes/history/:id
export const historyDetail = async (req: Request, res: Response): Promise<any> => {
  try {
    const studentId = req.user?.id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.json({ code: "error", message: "ID không hợp lệ" });
    }

    const hist = await QuizHistory.findOne({
      _id: id,
      studentId: studentId,
    }).populate("quizId");

    if (!hist) {
      return res.json({ code: "error", message: "Không tìm thấy lịch sử" });
    }

    return res.json({
      code: "success",
      message: "Lấy chi tiết lịch sử thành công",
      data: hist,
    });
  } catch (error) {
    console.error("Lỗi get history detail:", error);
    return res.json({
      code: "error",
      message: "Lỗi hệ thống",
    });
  }
};

// [GET] /api/client/student/quizzes/:id
export const detail = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.json({ code: "error", message: "ID không hợp lệ" });
    }

    const quiz = await Quiz.findOne({
      _id: id,
      deleted: false,
      status: "public",
    }).populate("teacherId", "fullName avatar");

    if (!quiz) {
      return res.json({ code: "error", message: "Không tìm thấy bộ câu hỏi" });
    }

    const quizObj = quiz.toObject();
    quizObj.questions = quizObj.questions.map((q: any) => {
      delete q.correctAnswerIndex;
      delete q.explanation;
      return q;
    });

    return res.json({
      code: "success",
      message: "Lấy chi tiết thành công",
      data: quizObj,
    });
  } catch (error) {
    console.error("Lỗi get quiz detail:", error);
    return res.json({
      code: "error",
      message: "Lỗi hệ thống",
    });
  }
};

// [POST] /api/client/student/quizzes/:id/submit
export const submit = async (req: Request, res: Response): Promise<any> => {
  try {
    const studentId = req.user?.id;
    const { id } = req.params;
    const { answers } = req.body; 

    if (!studentId || !mongoose.Types.ObjectId.isValid(id as string)) {
      return res.json({ code: "error", message: "Yêu cầu không hợp lệ" });
    }

    const quiz = await Quiz.findOne({
      _id: id,
      deleted: false,
      status: "public",
    });

    if (!quiz) {
      return res.json({ code: "error", message: "Không tìm thấy bộ câu hỏi" });
    }

    let correctCount = 0;
    const totalQuestions = quiz.questions.length;
    const processedAnswers = [];

    for (const q of quiz.questions) {
      const qAny = q as any;
      const studentAnswer = answers.find((a: any) => a.questionId === qAny._id.toString());
      const selectedOptionIndex = studentAnswer ? studentAnswer.selectedOptionIndex : -1;
      const isCorrect = selectedOptionIndex === q.correctAnswerIndex;

      if (isCorrect) correctCount++;

      processedAnswers.push({
        questionId: qAny._id,
        selectedOptionIndex,
        isCorrect,
      });
    }

    const score = Math.round((correctCount / totalQuestions) * 10);
    const xpEarned = Math.round((correctCount / totalQuestions) * quiz.xp);

    const historyRecord = new QuizHistory({
      studentId,
      quizId: quiz._id,
      score,
      totalQuestions,
      correctAnswers: correctCount,
      xpEarned,
      answers: processedAnswers,
    });

    await historyRecord.save();

    quiz.plays += 1;
    await quiz.save();

    await Student.updateOne(
      { _id: studentId },
      { $inc: { xp: xpEarned } }
    );

    return res.json({
      code: "success",
      message: "Nộp bài thành công",
      data: {
        score,
        correctAnswers: correctCount,
        totalQuestions,
        xpEarned,
        historyId: historyRecord._id,
        quizResult: quiz
      },
    });
  } catch (error) {
    console.error("Lỗi submit quiz:", error);
    return res.json({
      code: "error",
      message: "Lỗi hệ thống",
    });
  }
};
