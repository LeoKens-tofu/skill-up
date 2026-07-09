import { Request, Response } from "express";
import mongoose from "mongoose";
import { Course } from "../../models/course.model";
import { Enrollment } from "../../models/enrollment.model";
import { Submission } from "../../models/submission.model";
import { Student } from "../../models/student.model";

// Chuyển số byte sang chuỗi dễ đọc: "2.4 MB"
const humanSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

// Đếm tổng số bài trong khóa
const countLessons = (course: any): number =>
  (course.chapters || []).reduce(
    (sum: number, ch: any) => sum + (ch.lessons ? ch.lessons.length : 0),
    0
  );

// Tìm bài tập theo lessonId, trả kèm tên chương
const findAssignment = (
  course: any,
  lessonId: string
): { lesson: any; chapterTitle: string } | null => {
  for (const ch of course.chapters || []) {
    for (const ls of ch.lessons || []) {
      if (ls._id.toString() === lessonId) {
        return { lesson: ls, chapterTitle: ch.title };
      }
    }
  }
  return null;
};

// Trạng thái tổng hợp của 1 bài tập với sinh viên
const deriveStatus = (
  sub: any,
  dueDate?: Date
): "todo" | "submitted" | "graded" | "late" => {
  if (sub) return sub.status === "graded" ? "graded" : "submitted";
  if (dueDate && new Date() > new Date(dueDate)) return "late";
  return "todo";
};

// [POST] /api/client/student/submissions/upload  (multer single "file")
export const uploadFile = (req: Request, res: Response): any => {
  if (!req.file) {
    return res.json({ code: "error", message: "Không nhận được file" });
  }
  return res.json({
    code: "success",
    message: "Tải lên thành công",
    data: {
      url: `/uploads/submissions/${req.file.filename}`,
      name: req.file.originalname,
      size: humanSize(req.file.size),
    },
  });
};

// [GET] /api/client/student/assignments
// Tổng hợp mọi bài tập từ các khóa đã ghi danh + trạng thái nộp của SV
export const getAssignments = async (req: Request, res: Response): Promise<any> => {
  try {
    const studentId = req.user?.id;
    if (!studentId) return res.json({ code: "error", message: "Chưa đăng nhập" });

    const enrollments = await Enrollment.find({ studentId }).populate({
      path: "courseId",
      select: "title coverColor chapters deleted",
    });

    // Map bài nộp theo lessonId
    const submissions = await Submission.find({ studentId });
    const subMap = new Map<string, any>();
    submissions.forEach((s) => subMap.set(s.lessonId.toString(), s));

    const assignments: any[] = [];
    enrollments.forEach((en: any) => {
      const course = en.courseId;
      if (!course || course.deleted) return;

      (course.chapters || []).forEach((ch: any) => {
        (ch.lessons || []).forEach((ls: any) => {
          if (ls.type !== "assignment") return;
          const sub = subMap.get(ls._id.toString());
          assignments.push({
            lessonId: ls._id,
            courseId: course._id,
            courseTitle: course.title,
            courseColor: course.coverColor,
            chapterTitle: ch.title,
            title: ls.title,
            instructions: ls.content || "",
            resources: ls.resources || [],
            dueDate: ls.dueDate || null,
            maxScore: ls.maxScore ?? 10,
            xp: ls.xp ?? 0,
            status: deriveStatus(sub, ls.dueDate),
            submission: sub
              ? {
                  files: sub.files,
                  note: sub.note,
                  status: sub.status,
                  score: sub.score,
                  feedback: sub.feedback,
                  xpEarned: sub.xpEarned,
                  submittedAt: sub.submittedAt,
                  gradedAt: sub.gradedAt,
                }
              : null,
          });
        });
      });
    });

    // Sắp: chưa có hạn xuống cuối, còn lại theo hạn tăng dần
    assignments.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    return res.json({
      code: "success",
      message: "Lấy danh sách bài tập thành công",
      data: assignments,
    });
  } catch (error) {
    console.error("Get assignments error:", error);
    return res.json({ code: "error", message: "Lỗi hệ thống" });
  }
};

// [GET] /api/client/student/submissions/:lessonId  (bài nộp của SV cho 1 bài tập)
export const getMySubmission = async (req: Request, res: Response): Promise<any> => {
  try {
    const studentId = req.user?.id;
    const { lessonId } = req.params;
    if (!studentId || !mongoose.Types.ObjectId.isValid(lessonId as string)) {
      return res.json({ code: "error", message: "Yêu cầu không hợp lệ" });
    }

    const sub = await Submission.findOne({ studentId, lessonId });
    return res.json({
      code: "success",
      message: "Lấy bài nộp thành công",
      data: sub,
    });
  } catch (error) {
    console.error("Get my submission error:", error);
    return res.json({ code: "error", message: "Lỗi hệ thống" });
  }
};

// [POST] /api/client/student/submissions
// body: { courseId, lessonId, files: [{name,url,size}], note }
export const submit = async (req: Request, res: Response): Promise<any> => {
  try {
    const studentId = req.user?.id;
    const { courseId, lessonId, files, note } = req.body;

    if (
      !studentId ||
      !mongoose.Types.ObjectId.isValid(courseId as string) ||
      !mongoose.Types.ObjectId.isValid(lessonId as string)
    ) {
      return res.json({ code: "error", message: "Yêu cầu không hợp lệ" });
    }
    if (!Array.isArray(files) || files.length === 0) {
      return res.json({ code: "error", message: "Vui lòng nộp ít nhất 1 file" });
    }

    const enrollment = await Enrollment.findOne({ studentId, courseId });
    if (!enrollment) {
      return res.json({ code: "error", message: "Bạn chưa tham gia khóa học này" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.json({ code: "error", message: "Không tìm thấy khóa học" });
    }

    const found = findAssignment(course, lessonId as string);
    if (!found || found.lesson.type !== "assignment") {
      return res.json({ code: "error", message: "Không tìm thấy bài tập" });
    }
    const lesson = found.lesson;

    // Quá hạn → không cho nộp
    if (lesson.dueDate && new Date() > new Date(lesson.dueDate)) {
      return res.json({ code: "error", message: "Đã quá hạn nộp bài" });
    }

    // Chỉ nhận field file hợp lệ
    const cleanFiles = files
      .filter((f: any) => f && f.url && f.name)
      .map((f: any) => ({ name: f.name, url: f.url, size: f.size || "" }));
    if (cleanFiles.length === 0) {
      return res.json({ code: "error", message: "File nộp không hợp lệ" });
    }

    let sub = await Submission.findOne({ studentId, lessonId });
    if (sub) {
      // Đã chấm thì khóa, không cho nộp lại
      if (sub.status === "graded") {
        return res.json({ code: "error", message: "Bài đã được chấm, không thể nộp lại" });
      }
      sub.files = cleanFiles as any;
      sub.note = note || "";
      sub.submittedAt = new Date();
      await sub.save();
    } else {
      sub = new Submission({
        studentId,
        courseId,
        lessonId,
        files: cleanFiles,
        note: note || "",
        status: "submitted",
        submittedAt: new Date(),
      });
      await sub.save();
    }

    // Nộp bài lần đầu → tính là hoàn thành bài (tiến độ tăng). XP chờ GV chấm.
    const alreadyDone = enrollment.completedLessonIds
      .map((l) => l.toString())
      .includes(lessonId as string);

    let courseBonus = 0;
    if (!alreadyDone) {
      enrollment.completedLessonIds.push(lesson._id);
      enrollment.lastLessonId = lesson._id;

      const totalLessons = countLessons(course);
      enrollment.progressPercent =
        totalLessons > 0
          ? Math.round((enrollment.completedLessonIds.length / totalLessons) * 100)
          : 0;

      if (
        !enrollment.isCompleted &&
        totalLessons > 0 &&
        enrollment.completedLessonIds.length >= totalLessons
      ) {
        enrollment.isCompleted = true;
        enrollment.completedAt = new Date();
        courseBonus = course.totalXp || 0;
        enrollment.xpEarned += courseBonus;
      }
      await enrollment.save();

      if (courseBonus > 0) {
        await Student.updateOne({ _id: studentId }, { $inc: { xp: courseBonus } });
      }
    }

    return res.json({
      code: "success",
      message: "Nộp bài thành công",
      data: {
        submission: sub,
        progressPercent: enrollment.progressPercent,
        isCompleted: enrollment.isCompleted,
        courseBonus,
      },
    });
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.json({ code: "error", message: "Bạn đã nộp bài này rồi" });
    }
    console.error("Submit error:", error);
    return res.json({ code: "error", message: "Lỗi hệ thống" });
  }
};
