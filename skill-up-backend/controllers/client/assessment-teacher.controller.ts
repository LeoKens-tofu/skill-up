import { Request, Response } from "express";
import mongoose from "mongoose";
import { Course } from "../../models/course.model";
import { Submission } from "../../models/submission.model";
import { Student } from "../../models/student.model";
import { Enrollment } from "../../models/enrollment.model";
import { Quiz } from "../../models/quiz.model";
import { QuizHistory } from "../../models/quiz-history.model";

// Tìm 1 bài học theo lessonId trong toàn bộ chapters
const findLesson = (course: any, lessonId: string): any => {
  for (const ch of course.chapters || []) {
    for (const ls of ch.lessons || []) {
      if (ls._id.toString() === lessonId) return ls;
    }
  }
  return null;
};

// [GET] /api/client/teacher/assessments/overview
// Trung tâm chấm bài & kết quả xuyên suốt mọi lớp của giáo viên
export const getOverview = async (req: Request, res: Response): Promise<any> => {
  try {
    const teacherId = req.user?.id;
    if (!teacherId) return res.json({ code: "error", message: "Chưa đăng nhập" });

    // Các khóa GV phụ trách
    const courses = await Course.find({ teacherId, deleted: false }).select(
      "title coverColor chapters"
    );

    // Bản đồ bài tập: lessonId -> thông tin
    const assignmentMap = new Map<string, any>();
    const courseFilter: { _id: string; title: string }[] = [];
    courses.forEach((course: any) => {
      courseFilter.push({ _id: course._id.toString(), title: course.title });
      (course.chapters || []).forEach((ch: any) => {
        (ch.lessons || []).forEach((ls: any) => {
          if (ls.type !== "assignment") return;
          assignmentMap.set(ls._id.toString(), {
            courseId: course._id,
            courseTitle: course.title,
            coverColor: course.coverColor,
            chapterTitle: ch.title,
            assignmentTitle: ls.title,
            maxScore: ls.maxScore ?? 10,
            dueDate: ls.dueDate || null,
            xp: ls.xp ?? 0,
          });
        });
      });
    });

    const courseIds = courses.map((c: any) => c._id);

    // Tất cả bài nộp của các khóa này
    const submissions = await Submission.find({ courseId: { $in: courseIds } })
      .populate("studentId", "fullName studentId avatar email")
      .sort({ submittedAt: -1 });

    let gradedCount = 0;
    let pendingCount = 0;
    let scorePercentSum = 0; // tổng % điểm (score/maxScore*100) của bài đã chấm
    let passCount = 0; // số bài đạt (>= 50% điểm tối đa)

    const pending: any[] = [];
    const recentGraded: any[] = [];

    submissions.forEach((s: any) => {
      const meta = assignmentMap.get(s.lessonId.toString());
      if (!meta) return; // bài tập đã bị xóa khỏi khóa
      const stu = s.studentId || {};
      const base = {
        _id: s._id,
        student: {
          _id: stu._id,
          fullName: stu.fullName,
          studentId: stu.studentId,
          avatar: stu.avatar,
          email: stu.email,
        },
        courseId: meta.courseId,
        courseTitle: meta.courseTitle,
        coverColor: meta.coverColor,
        chapterTitle: meta.chapterTitle,
        assignmentTitle: meta.assignmentTitle,
        lessonId: s.lessonId,
        maxScore: meta.maxScore,
        xp: meta.xp,
        dueDate: meta.dueDate,
        files: s.files,
        note: s.note,
        submittedAt: s.submittedAt,
      };

      if (s.status === "graded") {
        gradedCount++;
        const pct = meta.maxScore > 0 ? (Number(s.score) / meta.maxScore) * 100 : 0;
        scorePercentSum += pct;
        if (Number(s.score) >= meta.maxScore / 2) passCount++;
        recentGraded.push({
          ...base,
          score: s.score,
          feedback: s.feedback,
          xpEarned: s.xpEarned,
          gradedAt: s.gradedAt,
        });
      } else {
        pendingCount++;
        pending.push(base);
      }
    });

    // Cần chấm: ưu tiên bài nộp sớm nhất (chờ lâu nhất)
    pending.sort(
      (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
    );
    // Đã chấm gần đây
    recentGraded.sort(
      (a, b) => new Date(b.gradedAt).getTime() - new Date(a.gradedAt).getTime()
    );

    // Kết quả quiz gần đây (từ các quiz GV sở hữu)
    const quizzes = await Quiz.find({ teacherId, deleted: false }).select("title subject");
    const quizMap = new Map<string, any>();
    quizzes.forEach((q: any) => quizMap.set(q._id.toString(), q));
    const quizIds = quizzes.map((q: any) => q._id);

    const histories = await QuizHistory.find({ quizId: { $in: quizIds } })
      .populate("studentId", "fullName studentId avatar")
      .sort({ createdAt: -1 })
      .limit(10);

    const recentQuiz = histories.map((h: any) => {
      const quiz = quizMap.get(h.quizId.toString());
      const stu = h.studentId || {};
      const pct =
        h.totalQuestions > 0
          ? Math.round((h.correctAnswers / h.totalQuestions) * 100)
          : 0;
      return {
        _id: h._id,
        student: {
          _id: stu._id,
          fullName: stu.fullName,
          studentId: stu.studentId,
          avatar: stu.avatar,
        },
        quizTitle: quiz ? quiz.title : "Quiz đã xóa",
        subject: quiz ? quiz.subject : "",
        score: h.score,
        totalQuestions: h.totalQuestions,
        correctAnswers: h.correctAnswers,
        percentage: pct,
        xpEarned: h.xpEarned,
        createdAt: h.createdAt,
      };
    });

    const stats = {
      courses: courses.length,
      assignments: assignmentMap.size,
      totalSubmissions: gradedCount + pendingCount,
      pendingCount,
      gradedCount,
      avgScorePercent: gradedCount > 0 ? Math.round(scorePercentSum / gradedCount) : 0,
      passRatePercent: gradedCount > 0 ? Math.round((passCount / gradedCount) * 100) : 0,
      quizAttempts: histories.length,
    };

    return res.json({
      code: "success",
      message: "Lấy dữ liệu đánh giá thành công",
      data: { stats, pending, recentGraded, recentQuiz, courses: courseFilter },
    });
  } catch (error) {
    console.error("Get assessments overview error:", error);
    return res.json({ code: "error", message: "Lỗi máy chủ" });
  }
};

// [PATCH] /api/client/teacher/assessments/submissions/:submissionId/grade
// body: { score, feedback } — chấm trực tiếp, tự tìm khóa từ bài nộp
export const gradeSubmission = async (req: Request, res: Response): Promise<any> => {
  try {
    const teacherId = req.user?.id;
    const { submissionId } = req.params;
    const { score, feedback } = req.body;

    if (!mongoose.Types.ObjectId.isValid(submissionId as string)) {
      return res.json({ code: "error", message: "ID không hợp lệ" });
    }

    const sub = await Submission.findById(submissionId);
    if (!sub) {
      return res.json({ code: "error", message: "Không tìm thấy bài nộp" });
    }

    // Xác thực GV sở hữu khóa của bài nộp
    const course = await Course.findOne({
      _id: sub.courseId,
      teacherId,
      deleted: false,
    });
    if (!course) {
      return res.json({ code: "error", message: "Bạn không có quyền chấm bài này" });
    }

    const lesson = findLesson(course, sub.lessonId.toString());
    if (!lesson || lesson.type !== "assignment") {
      return res.json({ code: "error", message: "Bài tập không tồn tại" });
    }

    const maxScore = lesson.maxScore ?? 10;
    const numScore = Number(score);
    if (isNaN(numScore) || numScore < 0 || numScore > maxScore) {
      return res.json({ code: "error", message: `Điểm phải từ 0 đến ${maxScore}` });
    }

    sub.score = numScore;
    sub.feedback = feedback || "";
    sub.status = "graded";
    sub.gradedAt = new Date();

    // Cộng XP nếu đạt (>= 50% điểm tối đa) và chưa từng cộng
    const passThreshold = maxScore / 2;
    let xpAwarded = 0;
    if (numScore >= passThreshold && sub.xpEarned === 0) {
      xpAwarded = lesson.xp || 0;
      sub.xpEarned = xpAwarded;
    }
    await sub.save();

    if (xpAwarded > 0) {
      await Enrollment.updateOne(
        { studentId: sub.studentId, courseId: course._id },
        { $inc: { xpEarned: xpAwarded } }
      );
      await Student.updateOne({ _id: sub.studentId }, { $inc: { xp: xpAwarded } });
    }

    return res.json({
      code: "success",
      message: "Đã chấm điểm bài nộp",
      data: { submission: sub, xpAwarded },
    });
  } catch (error) {
    console.error("Grade submission (assessments) error:", error);
    return res.json({ code: "error", message: "Lỗi máy chủ" });
  }
};
