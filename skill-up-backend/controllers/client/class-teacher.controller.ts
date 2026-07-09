import { Request, Response } from "express";
import mongoose from "mongoose";
import { Course } from "../../models/course.model";
import { Enrollment } from "../../models/enrollment.model";

// Đếm tổng số bài học trong 1 khóa
const countLessons = (course: any): number =>
  (course.chapters || []).reduce(
    (sum: number, ch: any) => sum + (ch.lessons ? ch.lessons.length : 0),
    0
  );

// Làm phẳng toàn bộ bài học kèm tên chương (giữ thứ tự)
const flattenLessons = (course: any): any[] => {
  const out: any[] = [];
  (course.chapters || []).forEach((ch: any) => {
    (ch.lessons || []).forEach((ls: any) => {
      out.push({
        lessonId: ls._id,
        chapterTitle: ch.title,
        title: ls.title,
        type: ls.type,
        xp: ls.xp,
      });
    });
  });
  return out;
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// [GET] /api/client/teacher/classes
// Danh sách "lớp" (mỗi khóa học = 1 lớp) kèm thống kê ghi danh
export const getClasses = async (req: Request, res: Response): Promise<any> => {
  try {
    const teacherId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const search = (req.query.search as string) || "";

    const query: any = { teacherId, deleted: false };
    if (search) query.title = { $regex: search, $options: "i" };

    const total = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const courseIds = courses.map((c) => c._id);
    const weekAgo = new Date(Date.now() - WEEK_MS);

    // Gom thống kê ghi danh theo từng khóa
    const stats = await Enrollment.aggregate([
      { $match: { courseId: { $in: courseIds } } },
      {
        $group: {
          _id: "$courseId",
          totalStudents: { $sum: 1 },
          completedStudents: {
            $sum: { $cond: [{ $eq: ["$isCompleted", true] }, 1, 0] },
          },
          avgProgress: { $avg: "$progressPercent" },
          totalXp: { $sum: "$xpEarned" },
          newThisWeek: {
            $sum: { $cond: [{ $gte: ["$createdAt", weekAgo] }, 1, 0] },
          },
        },
      },
    ]);

    const statMap = new Map<string, any>();
    stats.forEach((s) => statMap.set(s._id.toString(), s));

    const data = courses.map((c) => {
      const obj: any = c.toObject();
      const s = statMap.get(obj._id.toString());
      const totalLessons = countLessons(obj);
      delete obj.chapters;
      return {
        ...obj,
        totalLessons,
        totalStudents: s ? s.totalStudents : 0,
        completedStudents: s ? s.completedStudents : 0,
        avgProgress: s ? Math.round(s.avgProgress) : 0,
        totalXpDistributed: s ? s.totalXp : 0,
        newThisWeek: s ? s.newThisWeek : 0,
      };
    });

    return res.json({
      code: "success",
      message: "Lấy danh sách lớp thành công",
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get Classes Error:", error);
    return res.json({ code: "error", message: "Lỗi máy chủ" });
  }
};

// [GET] /api/client/teacher/classes/:id
// Sổ điểm danh: thông tin lớp + danh sách sinh viên + thống kê tổng hợp
export const getClassDetail = async (req: Request, res: Response): Promise<any> => {
  try {
    const teacherId = req.user?.id;
    const courseId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(courseId as string)) {
      return res.json({ code: "error", message: "ID không hợp lệ" });
    }

    const course = await Course.findOne({
      _id: courseId,
      teacherId,
      deleted: false,
    });
    if (!course) {
      return res.json({ code: "error", message: "Không tìm thấy lớp học" });
    }

    const totalLessons = countLessons(course);

    const enrollments = await Enrollment.find({ courseId: course._id })
      .populate("studentId", "fullName studentId email avatar level title")
      .sort({ updatedAt: -1 });

    const weekAgo = new Date(Date.now() - WEEK_MS);

    let sumProgress = 0;
    let completedStudents = 0;
    let activeThisWeek = 0;
    let totalXpDistributed = 0;
    let quizScoreSum = 0;
    let quizScoreCount = 0;

    const students = enrollments
      .filter((e) => e.studentId) // phòng SV đã bị xóa
      .map((e) => {
        const stu: any = e.studentId;
        sumProgress += e.progressPercent;
        if (e.isCompleted) completedStudents++;
        if (e.updatedAt >= weekAgo) activeThisWeek++;
        totalXpDistributed += e.xpEarned;

        // Điểm quiz trung bình của riêng SV này
        let stuQuizSum = 0;
        (e.lessonResults || []).forEach((r) => {
          stuQuizSum += r.score;
          quizScoreSum += r.score;
          quizScoreCount++;
        });
        const quizCount = (e.lessonResults || []).length;
        const avgQuizScore =
          quizCount > 0 ? Math.round((stuQuizSum / quizCount) * 10) / 10 : null;

        return {
          enrollmentId: e._id,
          student: {
            _id: stu._id,
            fullName: stu.fullName,
            studentId: stu.studentId,
            email: stu.email,
            avatar: stu.avatar,
            level: stu.level,
            title: stu.title,
          },
          enrolledAt: e.createdAt,
          lastActive: e.updatedAt,
          progressPercent: e.progressPercent,
          completedLessons: e.completedLessonIds.length,
          totalLessons,
          isCompleted: e.isCompleted,
          completedAt: e.completedAt,
          xpEarned: e.xpEarned,
          quizCount,
          avgQuizScore,
        };
      });

    const totalStudents = students.length;

    return res.json({
      code: "success",
      message: "Lấy chi tiết lớp thành công",
      data: {
        course: {
          _id: course._id,
          title: course.title,
          subtitle: course.subtitle,
          category: course.category,
          level: course.level,
          status: course.status,
          coverColor: course.coverColor,
          stripeColor: course.stripeColor,
          thumbnail: course.thumbnail,
          totalLessons,
          totalXp: course.totalXp,
          createdAt: course.createdAt,
        },
        summary: {
          totalStudents,
          completedStudents,
          avgProgress: totalStudents > 0 ? Math.round(sumProgress / totalStudents) : 0,
          avgQuizScore:
            quizScoreCount > 0
              ? Math.round((quizScoreSum / quizScoreCount) * 10) / 10
              : null,
          activeThisWeek,
          totalXpDistributed,
        },
        students,
      },
    });
  } catch (error) {
    console.error("Get Class Detail Error:", error);
    return res.json({ code: "error", message: "Lỗi máy chủ" });
  }
};

// [GET] /api/client/teacher/classes/:id/students/:studentId
// Chi tiết tiến độ từng bài của 1 sinh viên trong lớp
export const getStudentDetail = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const teacherId = req.user?.id;
    const { id: courseId, studentId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(courseId as string) ||
      !mongoose.Types.ObjectId.isValid(studentId as string)
    ) {
      return res.json({ code: "error", message: "ID không hợp lệ" });
    }

    const course = await Course.findOne({
      _id: courseId,
      teacherId,
      deleted: false,
    });
    if (!course) {
      return res.json({ code: "error", message: "Không tìm thấy lớp học" });
    }

    const enrollment = await Enrollment.findOne({
      courseId: course._id,
      studentId,
    }).populate("studentId", "fullName studentId email avatar level title");

    if (!enrollment || !enrollment.studentId) {
      return res.json({ code: "error", message: "Sinh viên chưa tham gia lớp này" });
    }

    const completedSet = new Set(
      enrollment.completedLessonIds.map((l) => l.toString())
    );
    const resultMap = new Map<string, any>();
    (enrollment.lessonResults || []).forEach((r) =>
      resultMap.set(r.lessonId.toString(), r)
    );

    // Danh sách bài học kèm trạng thái + điểm quiz (nếu có)
    const lessons = flattenLessons(course).map((ls) => {
      const key = ls.lessonId.toString();
      const result = resultMap.get(key);
      return {
        ...ls,
        completed: completedSet.has(key),
        quizResult:
          ls.type === "quiz" && result
            ? {
                score: result.score,
                correctAnswers: result.correctAnswers,
                totalQuestions: result.totalQuestions,
                submittedAt: result.submittedAt,
              }
            : null,
      };
    });

    const stu: any = enrollment.studentId;

    return res.json({
      code: "success",
      message: "Lấy chi tiết sinh viên thành công",
      data: {
        student: {
          _id: stu._id,
          fullName: stu.fullName,
          studentId: stu.studentId,
          email: stu.email,
          avatar: stu.avatar,
          level: stu.level,
          title: stu.title,
        },
        courseTitle: course.title,
        enrolledAt: enrollment.createdAt,
        lastActive: enrollment.updatedAt,
        progressPercent: enrollment.progressPercent,
        completedLessons: enrollment.completedLessonIds.length,
        totalLessons: countLessons(course),
        isCompleted: enrollment.isCompleted,
        completedAt: enrollment.completedAt,
        xpEarned: enrollment.xpEarned,
        lessons,
      },
    });
  } catch (error) {
    console.error("Get Student Detail Error:", error);
    return res.json({ code: "error", message: "Lỗi máy chủ" });
  }
};
