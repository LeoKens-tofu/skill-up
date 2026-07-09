import { Request, Response } from "express";
import mongoose from "mongoose";
import { StudyEvent } from "../../models/study-event.model";
import { Enrollment } from "../../models/enrollment.model";
import { Course } from "../../models/course.model";
import { Submission } from "../../models/submission.model";

const toDateStr = (d: Date): string => new Date(d).toISOString().slice(0, 10);

// Kiểm tra 1 lessonId có nằm trong khóa không
const lessonExists = (course: any, lessonId: string): boolean => {
  for (const ch of course.chapters || []) {
    for (const ls of ch.lessons || []) {
      if (ls._id.toString() === lessonId) return true;
    }
  }
  return false;
};

// Chỉ nhận các field hợp lệ khi tạo/sửa
const pickFields = (body: any) => {
  const out: any = {};
  if (body.title !== undefined) out.title = body.title;
  if (body.description !== undefined) out.description = body.description;
  if (body.type !== undefined) out.type = body.type;
  if (body.date !== undefined) out.date = body.date;
  if (body.startTime !== undefined) out.startTime = body.startTime;
  if (body.endTime !== undefined) out.endTime = body.endTime;
  if (body.isDone !== undefined) out.isDone = body.isDone;
  return out;
};

// Xác thực liên kết khóa/bài (nếu có). Trả { ok, message?, courseId?, lessonId? }
const validateLink = async (
  studentId: string,
  courseId: any,
  lessonId: any
): Promise<{ ok: boolean; message?: string }> => {
  if (!courseId) return { ok: true };

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return { ok: false, message: "Khóa học không hợp lệ" };
  }
  const enrolled = await Enrollment.findOne({ studentId, courseId });
  if (!enrolled) {
    return { ok: false, message: "Bạn chưa ghi danh khóa học này" };
  }

  if (lessonId) {
    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return { ok: false, message: "Bài học không hợp lệ" };
    }
    const course = await Course.findById(courseId);
    if (!course || !lessonExists(course, lessonId.toString())) {
      return { ok: false, message: "Bài học không thuộc khóa đã chọn" };
    }
  }
  return { ok: true };
};

// [GET] /api/client/student/schedule?from=YYYY-MM-DD&to=YYYY-MM-DD
// Sự kiện SV tạo trong khoảng + mốc tự sinh (ghi danh / hoàn thành khóa)
export const index = async (req: Request, res: Response): Promise<any> => {
  try {
    const studentId = req.user?.id;
    if (!studentId) return res.json({ code: "error", message: "Chưa đăng nhập" });

    const from = req.query.from as string;
    const to = req.query.to as string;

    const query: any = { studentId };
    if (from && to) query.date = { $gte: from, $lte: to };

    const events = await StudyEvent.find(query)
      .populate("courseId", "title coverColor")
      .sort({ date: 1, startTime: 1 });

    const userEvents = events.map((e) => {
      const obj: any = e.toObject();
      const course = obj.courseId;
      return {
        _id: obj._id,
        title: obj.title,
        description: obj.description,
        type: obj.type,
        date: obj.date,
        startTime: obj.startTime,
        endTime: obj.endTime,
        courseId: course ? course._id : null,
        courseTitle: course ? course.title : null,
        lessonId: obj.lessonId || null,
        isDone: obj.isDone,
        editable: true,
      };
    });

    // Mốc tự sinh từ Enrollment (chỉ đọc)
    const enrollments = await Enrollment.find({ studentId }).populate(
      "courseId",
      "title coverColor chapters deleted"
    );

    const milestones: any[] = [];
    enrollments.forEach((en: any) => {
      const course = en.courseId;
      if (!course) return;

      const enrollDate = toDateStr(en.createdAt);
      if (!from || !to || (enrollDate >= from && enrollDate <= to)) {
        milestones.push({
          _id: `ms-enroll-${en._id}`,
          title: `Ghi danh: ${course.title}`,
          type: "milestone",
          date: enrollDate,
          courseId: course._id,
          courseTitle: course.title,
          isDone: true,
          editable: false,
        });
      }

      if (en.isCompleted && en.completedAt) {
        const doneDate = toDateStr(en.completedAt);
        if (!from || !to || (doneDate >= from && doneDate <= to)) {
          milestones.push({
            _id: `ms-done-${en._id}`,
            title: `Hoàn thành: ${course.title}`,
            type: "milestone",
            date: doneDate,
            courseId: course._id,
            courseTitle: course.title,
            isDone: true,
            editable: false,
          });
        }
      }
    });

    // Deadline bài tập tự sinh từ các khóa đã ghi danh (chỉ đọc)
    const submissions = await Submission.find({ studentId });
    const subMap = new Map<string, any>();
    submissions.forEach((s) => subMap.set(s.lessonId.toString(), s));

    const pad = (n: number) => String(n).padStart(2, "0");
    const deadlines: any[] = [];
    enrollments.forEach((en: any) => {
      const course = en.courseId;
      if (!course || course.deleted) return;

      (course.chapters || []).forEach((ch: any) => {
        (ch.lessons || []).forEach((ls: any) => {
          if (ls.type !== "assignment" || !ls.dueDate) return;
          const d = new Date(ls.dueDate);
          const dateStr = toDateStr(d);
          if (from && to && (dateStr < from || dateStr > to)) return;

          const sub = subMap.get(ls._id.toString());
          deadlines.push({
            _id: `deadline-${ls._id}`,
            title: `Hạn nộp: ${ls.title}`,
            type: "deadline",
            date: dateStr,
            startTime: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
            courseId: course._id,
            courseTitle: course.title,
            lessonId: ls._id,
            isDone: !!sub, // đã nộp thì coi như xong
            editable: false,
          });
        });
      });
    });

    return res.json({
      code: "success",
      message: "Lấy lịch học thành công",
      data: [...userEvents, ...milestones, ...deadlines],
    });
  } catch (error) {
    console.error("Get schedule error:", error);
    return res.json({ code: "error", message: "Lỗi hệ thống" });
  }
};

// [POST] /api/client/student/schedule
export const create = async (req: Request, res: Response): Promise<any> => {
  try {
    const studentId = req.user?.id;
    if (!studentId) return res.json({ code: "error", message: "Chưa đăng nhập" });

    const { title, date, courseId, lessonId } = req.body;
    if (!title || !title.trim()) {
      return res.json({ code: "error", message: "Vui lòng nhập tiêu đề" });
    }
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.json({ code: "error", message: "Ngày không hợp lệ" });
    }

    const link = await validateLink(studentId, courseId, lessonId);
    if (!link.ok) return res.json({ code: "error", message: link.message });

    const event = new StudyEvent({
      ...pickFields(req.body),
      studentId,
      courseId: courseId || undefined,
      lessonId: courseId && lessonId ? lessonId : undefined,
    });
    await event.save();

    return res.json({
      code: "success",
      message: "Đã thêm sự kiện",
      data: event,
    });
  } catch (error) {
    console.error("Create schedule error:", error);
    return res.json({ code: "error", message: "Lỗi hệ thống" });
  }
};

// [PATCH] /api/client/student/schedule/:id
export const update = async (req: Request, res: Response): Promise<any> => {
  try {
    const studentId = req.user?.id;
    const { id } = req.params;

    if (!studentId || !mongoose.Types.ObjectId.isValid(id as string)) {
      return res.json({ code: "error", message: "Yêu cầu không hợp lệ" });
    }

    const event = await StudyEvent.findOne({ _id: id, studentId });
    if (!event) {
      return res.json({ code: "error", message: "Không tìm thấy sự kiện" });
    }

    // Nếu đổi liên kết khóa/bài thì xác thực lại
    const hasCourseKey = Object.prototype.hasOwnProperty.call(req.body, "courseId");
    if (hasCourseKey) {
      const { courseId, lessonId } = req.body;
      if (courseId) {
        const link = await validateLink(studentId, courseId, lessonId);
        if (!link.ok) return res.json({ code: "error", message: link.message });
        event.courseId = courseId;
        event.lessonId = lessonId || undefined;
      } else {
        event.courseId = undefined;
        event.lessonId = undefined;
      }
    }

    Object.assign(event, pickFields(req.body));
    if (req.body.date && !/^\d{4}-\d{2}-\d{2}$/.test(req.body.date)) {
      return res.json({ code: "error", message: "Ngày không hợp lệ" });
    }
    await event.save();

    return res.json({
      code: "success",
      message: "Đã cập nhật sự kiện",
      data: event,
    });
  } catch (error) {
    console.error("Update schedule error:", error);
    return res.json({ code: "error", message: "Lỗi hệ thống" });
  }
};

// [DELETE] /api/client/student/schedule/:id
export const remove = async (req: Request, res: Response): Promise<any> => {
  try {
    const studentId = req.user?.id;
    const { id } = req.params;

    if (!studentId || !mongoose.Types.ObjectId.isValid(id as string)) {
      return res.json({ code: "error", message: "Yêu cầu không hợp lệ" });
    }

    const result = await StudyEvent.deleteOne({ _id: id, studentId });
    if (result.deletedCount === 0) {
      return res.json({ code: "error", message: "Không tìm thấy sự kiện" });
    }

    return res.json({ code: "success", message: "Đã xóa sự kiện" });
  } catch (error) {
    console.error("Delete schedule error:", error);
    return res.json({ code: "error", message: "Lỗi hệ thống" });
  }
};
