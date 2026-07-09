import { Request, Response } from "express";
import mongoose from "mongoose";
import { Course } from "../../models/course.model";
import { Enrollment } from "../../models/enrollment.model";
import { Student } from "../../models/student.model";

// Đếm tổng số bài trong khóa
const countLessons = (course: any): number =>
  (course.chapters || []).reduce(
    (sum: number, ch: any) => sum + (ch.lessons ? ch.lessons.length : 0),
    0
  );

// Tìm 1 bài học theo lessonId trong toàn bộ chapters
const findLesson = (course: any, lessonId: string): any => {
  for (const ch of course.chapters || []) {
    for (const ls of ch.lessons || []) {
      if (ls._id.toString() === lessonId) return ls;
    }
  }
  return null;
};

// [GET] /api/client/student/courses
export const index = async (req: Request, res: Response): Promise<any> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    const category = (req.query.category as string) || "all";

    const query: any = { deleted: false, status: "public" };
    if (search) query.title = { $regex: search, $options: "i" };
    if (category && category !== "all") query.category = category;

    const total = await Course.countDocuments(query);
    const skip = (page - 1) * limit;

    const courses = await Course.find(query)
      .populate("teacherId", "fullName avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Trạng thái tham gia + tiến độ của sinh viên hiện tại
    const studentId = req.user?.id;
    const enrollMap = new Map<string, any>();
    if (studentId) {
      const courseIds = courses.map((c) => c._id);
      const enrollments = await Enrollment.find({
        studentId,
        courseId: { $in: courseIds },
      }).select("courseId progressPercent isCompleted");
      enrollments.forEach((e) =>
        enrollMap.set(e.courseId.toString(), e)
      );
    }

    // Bỏ nội dung nặng khỏi list, chỉ trả thông tin thẻ + số liệu
    const data = courses.map((c) => {
      const obj: any = c.toObject();
      const enroll = enrollMap.get(obj._id.toString());
      const totalLessons = countLessons(obj);
      delete obj.chapters;
      return {
        ...obj,
        totalLessons,
        isEnrolled: !!enroll,
        progressPercent: enroll ? enroll.progressPercent : 0,
        isCompleted: enroll ? enroll.isCompleted : false,
      };
    });

    return res.json({
      code: "success",
      message: "Lấy danh sách khóa học thành công",
      data,
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Student get courses error:", error);
    return res.json({ code: "error", message: "Lỗi hệ thống" });
  }
};

// [GET] /api/client/student/courses/enrolled
export const enrolled = async (req: Request, res: Response): Promise<any> => {
  try {
    const studentId = req.user?.id;
    if (!studentId) return res.json({ code: "error", message: "Chưa đăng nhập" });

    const enrollments = await Enrollment.find({ studentId })
      .populate({
        path: "courseId",
        select:
          "title subtitle category level thumbnail coverColor stripeColor totalXp teacherId chapters",
        populate: { path: "teacherId", select: "fullName avatar" },
      })
      .sort({ updatedAt: -1 });

    const data = enrollments
      .filter((e) => e.courseId) // phòng khóa đã bị xóa
      .map((e) => {
        const course: any = (e.courseId as any).toObject();
        const totalLessons = countLessons(course);
        delete course.chapters;
        return {
          ...course,
          isEnrolled: true,
          progressPercent: e.progressPercent,
          isCompleted: e.isCompleted,
          completedLessons: e.completedLessonIds.length,
          totalLessons,
          lastLessonId: e.lastLessonId,
        };
      });

    return res.json({
      code: "success",
      message: "Lấy khóa học đã tham gia thành công",
      data,
    });
  } catch (error) {
    console.error("Student enrolled courses error:", error);
    return res.json({ code: "error", message: "Lỗi hệ thống" });
  }
};

// [GET] /api/client/student/courses/:id
export const detail = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const studentId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.json({ code: "error", message: "ID không hợp lệ" });
    }

    const course = await Course.findOne({
      _id: id,
      deleted: false,
      status: "public",
    }).populate("teacherId", "fullName avatar title");

    if (!course) {
      return res.json({ code: "error", message: "Không tìm thấy khóa học" });
    }

    const enrollment = studentId
      ? await Enrollment.findOne({ studentId, courseId: course._id })
      : null;
    const isEnrolled = !!enrollment;
    const completedSet = new Set(
      (enrollment?.completedLessonIds || []).map((l) => l.toString())
    );

    const obj: any = course.toObject();

    // Ẩn nội dung bài học nếu chưa tham gia (trừ bài học thử);
    // luôn ẩn đáp án đúng của quiz.
    obj.chapters = (obj.chapters || []).map((ch: any) => ({
      ...ch,
      lessons: (ch.lessons || []).map((ls: any) => {
        const unlocked = isEnrolled || ls.isPreview;
        const base = {
          _id: ls._id,
          title: ls.title,
          type: ls.type,
          order: ls.order,
          isPreview: ls.isPreview,
          xp: ls.xp,
          duration: ls.duration,
          locked: !unlocked,
          completed: completedSet.has(ls._id.toString()),
        };

        if (!unlocked) return base;

        return {
          ...base,
          videoUrl: ls.videoUrl,
          videoSource: ls.videoSource,
          content: ls.content,
          resources: ls.resources,
          // Bài tập: hạn nộp + điểm tối đa để hiển thị & nộp bài
          dueDate: ls.dueDate,
          maxScore: ls.maxScore,
          // Với quiz: gửi câu hỏi + lựa chọn nhưng KHÔNG gửi đáp án đúng
          questions: (ls.questions || []).map((q: any) => ({
            _id: q._id,
            questionText: q.questionText,
            options: q.options,
          })),
        };
      }),
    }));

    obj.totalLessons = countLessons(course);
    obj.isEnrolled = isEnrolled;
    obj.progressPercent = enrollment ? enrollment.progressPercent : 0;
    obj.isCompleted = enrollment ? enrollment.isCompleted : false;
    obj.lastLessonId = enrollment ? enrollment.lastLessonId : null;

    return res.json({
      code: "success",
      message: "Lấy chi tiết khóa học thành công",
      data: obj,
    });
  } catch (error) {
    console.error("Student course detail error:", error);
    return res.json({ code: "error", message: "Lỗi hệ thống" });
  }
};

// [POST] /api/client/student/courses/:id/enroll
export const enroll = async (req: Request, res: Response): Promise<any> => {
  try {
    const studentId = req.user?.id;
    const { id } = req.params;

    if (!studentId || !mongoose.Types.ObjectId.isValid(id as string)) {
      return res.json({ code: "error", message: "Yêu cầu không hợp lệ" });
    }

    const course = await Course.findOne({
      _id: id,
      deleted: false,
      status: "public",
    });
    if (!course) {
      return res.json({ code: "error", message: "Không tìm thấy khóa học" });
    }

    const existing = await Enrollment.findOne({ studentId, courseId: course._id });
    if (existing) {
      return res.json({ code: "error", message: "Bạn đã tham gia khóa học này" });
    }

    const enrollment = new Enrollment({
      studentId,
      courseId: course._id,
      completedLessonIds: [],
      progressPercent: 0,
    });
    await enrollment.save();

    course.enrollmentCount += 1;
    await course.save();

    return res.json({
      code: "success",
      message: "Tham gia khóa học thành công",
      data: enrollment,
    });
  } catch (error: any) {
    // Trùng do unique index (race condition)
    if (error?.code === 11000) {
      return res.json({ code: "error", message: "Bạn đã tham gia khóa học này" });
    }
    console.error("Enroll error:", error);
    return res.json({ code: "error", message: "Lỗi hệ thống" });
  }
};

// [POST] /api/client/student/courses/:id/lessons/:lessonId/complete
export const completeLesson = async (req: Request, res: Response): Promise<any> => {
  try {
    const studentId = req.user?.id;
    const { id, lessonId } = req.params;
    const { answers } = req.body; // chỉ dùng cho bài quiz

    if (
      !studentId ||
      !mongoose.Types.ObjectId.isValid(id as string) ||
      !mongoose.Types.ObjectId.isValid(lessonId as string)
    ) {
      return res.json({ code: "error", message: "Yêu cầu không hợp lệ" });
    }

    const course = await Course.findOne({
      _id: id,
      deleted: false,
      status: "public",
    });
    if (!course) {
      return res.json({ code: "error", message: "Không tìm thấy khóa học" });
    }

    const enrollment = await Enrollment.findOne({ studentId, courseId: course._id });
    if (!enrollment) {
      return res.json({ code: "error", message: "Bạn chưa tham gia khóa học này" });
    }

    const lesson = findLesson(course, lessonId as string);
    if (!lesson) {
      return res.json({ code: "error", message: "Không tìm thấy bài học" });
    }

    const alreadyDone = enrollment.completedLessonIds
      .map((l) => l.toString())
      .includes(lessonId as string);

    // Chấm điểm nếu là bài quiz
    let quizResult: any = null;
    if (lesson.type === "quiz") {
      const totalQ = lesson.questions.length;
      let correctCount = 0;
      const graded = lesson.questions.map((q: any) => {
        const ans = Array.isArray(answers)
          ? answers.find((a: any) => a.questionId === q._id.toString())
          : null;
        const selectedOptionIndex = ans ? ans.selectedOptionIndex : -1;
        const isCorrect = selectedOptionIndex === q.correctAnswerIndex;
        if (isCorrect) correctCount++;
        return {
          questionId: q._id,
          selectedOptionIndex,
          correctAnswerIndex: q.correctAnswerIndex,
          isCorrect,
          explanation: q.explanation,
        };
      });
      quizResult = {
        totalQuestions: totalQ,
        correctAnswers: correctCount,
        score: totalQ > 0 ? Math.round((correctCount / totalQ) * 10) : 0,
        details: graded,
      };
    }

    // Cộng XP: chỉ khi hoàn thành lần đầu
    let xpAwarded = 0;
    if (!alreadyDone) {
      if (lesson.type === "quiz" && quizResult) {
        xpAwarded =
          quizResult.totalQuestions > 0
            ? Math.round(
                (quizResult.correctAnswers / quizResult.totalQuestions) *
                  (lesson.xp || 0)
              )
            : 0;
      } else {
        xpAwarded = lesson.xp || 0;
      }

      enrollment.completedLessonIds.push(lesson._id);
    }

    // Lưu điểm quiz để giáo viên theo dõi (cập nhật theo lần nộp gần nhất)
    if (lesson.type === "quiz" && quizResult) {
      const existing = enrollment.lessonResults.find(
        (r) => r.lessonId.toString() === lesson._id.toString()
      );
      if (existing) {
        existing.score = quizResult.score;
        existing.correctAnswers = quizResult.correctAnswers;
        existing.totalQuestions = quizResult.totalQuestions;
        existing.submittedAt = new Date();
        if (xpAwarded > 0) existing.xpEarned = xpAwarded; // chỉ set khi lần đầu
      } else {
        enrollment.lessonResults.push({
          lessonId: lesson._id,
          score: quizResult.score,
          correctAnswers: quizResult.correctAnswers,
          totalQuestions: quizResult.totalQuestions,
          xpEarned: xpAwarded,
          submittedAt: new Date(),
        } as any);
      }
    }

    enrollment.lastLessonId = lesson._id;

    // Cập nhật tiến độ
    const totalLessons = countLessons(course);
    enrollment.progressPercent =
      totalLessons > 0
        ? Math.round((enrollment.completedLessonIds.length / totalLessons) * 100)
        : 0;

    // Hoàn thành cả khóa → thưởng totalXp (một lần)
    let courseBonus = 0;
    if (
      !enrollment.isCompleted &&
      totalLessons > 0 &&
      enrollment.completedLessonIds.length >= totalLessons
    ) {
      enrollment.isCompleted = true;
      enrollment.completedAt = new Date();
      courseBonus = course.totalXp || 0;
    }

    const totalXpThisCall = xpAwarded + courseBonus;
    enrollment.xpEarned += totalXpThisCall;
    await enrollment.save();

    if (totalXpThisCall > 0) {
      await Student.updateOne(
        { _id: studentId },
        { $inc: { xp: totalXpThisCall } }
      );
    }

    return res.json({
      code: "success",
      message: alreadyDone ? "Bạn đã hoàn thành bài này trước đó" : "Hoàn thành bài học",
      data: {
        lessonId: lesson._id,
        alreadyDone,
        xpEarned: totalXpThisCall,
        progressPercent: enrollment.progressPercent,
        isCompleted: enrollment.isCompleted,
        courseBonus,
        quizResult,
      },
    });
  } catch (error) {
    console.error("Complete lesson error:", error);
    return res.json({ code: "error", message: "Lỗi hệ thống" });
  }
};
