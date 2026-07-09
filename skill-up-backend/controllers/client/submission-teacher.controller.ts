import { Request, Response } from "express";
import mongoose from "mongoose";
import { Course } from "../../models/course.model";
import { Enrollment } from "../../models/enrollment.model";
import { Submission } from "../../models/submission.model";
import { Student } from "../../models/student.model";

// Tìm 1 bài học theo lessonId trong toàn bộ chapters
const findLesson = (course: any, lessonId: string): any => {
  for (const ch of course.chapters || []) {
    for (const ls of ch.lessons || []) {
      if (ls._id.toString() === lessonId) return ls;
    }
  }
  return null;
};

// [GET] /api/client/teacher/classes/:id/submissions
// Danh sách bài tập của lớp + các bài nộp theo từng bài tập
export const getCourseSubmissions = async (req: Request, res: Response): Promise<any> => {
  try {
    const teacherId = req.user?.id;
    const courseId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(courseId as string)) {
      return res.json({ code: "error", message: "ID không hợp lệ" });
    }

    const course = await Course.findOne({ _id: courseId, teacherId, deleted: false });
    if (!course) {
      return res.json({ code: "error", message: "Không tìm thấy lớp học" });
    }

    const totalStudents = await Enrollment.countDocuments({ courseId: course._id });

    // Gom bài nộp theo lessonId
    const submissions = await Submission.find({ courseId: course._id })
      .populate("studentId", "fullName studentId avatar email")
      .sort({ submittedAt: -1 });

    const byLesson = new Map<string, any[]>();
    submissions.forEach((s: any) => {
      const key = s.lessonId.toString();
      if (!byLesson.has(key)) byLesson.set(key, []);
      const stu = s.studentId || {};
      byLesson.get(key)!.push({
        _id: s._id,
        student: {
          _id: stu._id,
          fullName: stu.fullName,
          studentId: stu.studentId,
          avatar: stu.avatar,
          email: stu.email,
        },
        files: s.files,
        note: s.note,
        status: s.status,
        score: s.score,
        feedback: s.feedback,
        xpEarned: s.xpEarned,
        submittedAt: s.submittedAt,
        gradedAt: s.gradedAt,
      });
    });

    // Duyệt các bài tập trong khóa
    const assignments: any[] = [];
    (course.chapters || []).forEach((ch: any) => {
      (ch.lessons || []).forEach((ls: any) => {
        if (ls.type !== "assignment") return;
        const subs = byLesson.get(ls._id.toString()) || [];
        const gradedCount = subs.filter((x) => x.status === "graded").length;
        assignments.push({
          lessonId: ls._id,
          chapterTitle: ch.title,
          title: ls.title,
          instructions: ls.content || "",
          resources: ls.resources || [],
          dueDate: ls.dueDate || null,
          maxScore: ls.maxScore ?? 10,
          xp: ls.xp ?? 0,
          totalStudents,
          submittedCount: subs.length,
          gradedCount,
          pendingCount: subs.length - gradedCount,
          submissions: subs,
        });
      });
    });

    return res.json({
      code: "success",
      message: "Lấy danh sách bài nộp thành công",
      data: { assignments, totalStudents },
    });
  } catch (error) {
    console.error("Get course submissions error:", error);
    return res.json({ code: "error", message: "Lỗi máy chủ" });
  }
};

// [PATCH] /api/client/teacher/classes/:id/submissions/:submissionId/grade
// body: { score, feedback }
export const gradeSubmission = async (req: Request, res: Response): Promise<any> => {
  try {
    const teacherId = req.user?.id;
    const { id: courseId, submissionId } = req.params;
    const { score, feedback } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(courseId as string) ||
      !mongoose.Types.ObjectId.isValid(submissionId as string)
    ) {
      return res.json({ code: "error", message: "ID không hợp lệ" });
    }

    const course = await Course.findOne({ _id: courseId, teacherId, deleted: false });
    if (!course) {
      return res.json({ code: "error", message: "Không tìm thấy lớp học" });
    }

    const sub = await Submission.findOne({ _id: submissionId, courseId: course._id });
    if (!sub) {
      return res.json({ code: "error", message: "Không tìm thấy bài nộp" });
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
    console.error("Grade submission error:", error);
    return res.json({ code: "error", message: "Lỗi máy chủ" });
  }
};
