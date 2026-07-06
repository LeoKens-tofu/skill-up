import { Request, Response } from "express";
import { Course } from "../../models/course.model";

// Các field cho phép giáo viên set khi tạo/sửa khóa học
const pickCourseFields = (body: any) => ({
  title: body.title,
  subtitle: body.subtitle,
  description: body.description,
  category: body.category,
  level: body.level,
  status: body.status,
  thumbnail: body.thumbnail,
  coverColor: body.coverColor,
  stripeColor: body.stripeColor,
  whatYouWillLearn: body.whatYouWillLearn,
  requirements: body.requirements,
  tags: body.tags,
  totalXp: body.totalXp,
  chapters: body.chapters,
});

// [GET] /api/client/teacher/courses
export const getCourses = async (req: Request, res: Response): Promise<any> => {
  try {
    const teacherId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const status = req.query.status as string;
    const category = req.query.category as string;

    const query: any = { teacherId, deleted: false };

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    if (status && status !== "all") {
      query.status = status;
    }
    if (category && category !== "all") {
      query.category = category;
    }

    const total = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.json({
      code: "success",
      data: courses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get Courses Error:", error);
    return res.json({ code: "error", message: "Lỗi máy chủ" });
  }
};

// [POST] /api/client/teacher/courses
export const createCourse = async (req: Request, res: Response): Promise<any> => {
  try {
    const teacherId = req.user?.id;
    const fields = pickCourseFields(req.body);

    const newCourse = new Course({
      ...fields,
      teacherId,
      status: fields.status || "draft",
    });

    await newCourse.save();

    return res.json({
      code: "success",
      message: "Tạo khóa học thành công",
      data: newCourse,
    });
  } catch (error) {
    console.error("Create Course Error:", error);
    return res.json({ code: "error", message: "Lỗi máy chủ" });
  }
};

// [GET] /api/client/teacher/courses/:id
export const getCourseDetail = async (req: Request, res: Response): Promise<any> => {
  try {
    const teacherId = req.user?.id;
    const courseId = req.params.id;

    const course = await Course.findOne({
      _id: courseId,
      teacherId,
      deleted: false,
    });

    if (!course) {
      return res.json({ code: "error", message: "Không tìm thấy khóa học" });
    }

    return res.json({ code: "success", data: course });
  } catch (error) {
    return res.json({ code: "error", message: "Lỗi máy chủ" });
  }
};

// [PATCH] /api/client/teacher/courses/:id
export const editCourse = async (req: Request, res: Response): Promise<any> => {
  try {
    const teacherId = req.user?.id;
    const courseId = req.params.id;

    const course = await Course.findOne({
      _id: courseId,
      teacherId,
      deleted: false,
    });

    if (!course) {
      return res.json({ code: "error", message: "Không tìm thấy khóa học" });
    }

    const fields = pickCourseFields(req.body);
    // Chỉ gán các field được gửi lên (tránh ghi đè bằng undefined)
    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined) {
        (course as any)[key] = value;
      }
    });

    await course.save();

    return res.json({
      code: "success",
      message: "Cập nhật khóa học thành công",
      data: course,
    });
  } catch (error) {
    console.error("Edit Course Error:", error);
    return res.json({ code: "error", message: "Lỗi máy chủ" });
  }
};

// [DELETE] /api/client/teacher/courses/:id
export const deleteCourse = async (req: Request, res: Response): Promise<any> => {
  try {
    const teacherId = req.user?.id;
    const courseId = req.params.id;

    const course = await Course.findOne({
      _id: courseId,
      teacherId,
      deleted: false,
    });

    if (!course) {
      return res.json({ code: "error", message: "Không tìm thấy khóa học" });
    }

    course.deleted = true;
    course.deletedAt = new Date();
    await course.save();

    return res.json({
      code: "success",
      message: "Đã chuyển khóa học vào thùng rác",
    });
  } catch (error) {
    return res.json({ code: "error", message: "Lỗi máy chủ" });
  }
};

// [GET] /api/client/teacher/courses/trash
export const getTrashCourses = async (req: Request, res: Response): Promise<any> => {
  try {
    const teacherId = req.user?.id;
    const courses = await Course.find({ teacherId, deleted: true }).sort({
      deletedAt: -1,
    });

    return res.json({ code: "success", data: courses });
  } catch (error) {
    return res.json({ code: "error", message: "Lỗi máy chủ" });
  }
};

// [PATCH] /api/client/teacher/courses/restore/:id
export const restoreCourse = async (req: Request, res: Response): Promise<any> => {
  try {
    const teacherId = req.user?.id;
    const courseId = req.params.id;

    const course = await Course.findOne({
      _id: courseId,
      teacherId,
      deleted: true,
    });

    if (!course) {
      return res.json({ code: "error", message: "Không tìm thấy khóa học" });
    }

    course.deleted = false;
    course.deletedAt = undefined;
    await course.save();

    return res.json({
      code: "success",
      message: "Khôi phục khóa học thành công",
    });
  } catch (error) {
    return res.json({ code: "error", message: "Lỗi máy chủ" });
  }
};

// [DELETE] /api/client/teacher/courses/hard/:id
export const hardDeleteCourse = async (req: Request, res: Response): Promise<any> => {
  try {
    const teacherId = req.user?.id;
    const courseId = req.params.id;

    const result = await Course.deleteOne({
      _id: courseId,
      teacherId,
      deleted: true,
    });

    if (result.deletedCount === 0) {
      return res.json({ code: "error", message: "Không tìm thấy khóa học" });
    }

    return res.json({
      code: "success",
      message: "Đã xóa vĩnh viễn khóa học",
    });
  } catch (error) {
    return res.json({ code: "error", message: "Lỗi máy chủ" });
  }
};
