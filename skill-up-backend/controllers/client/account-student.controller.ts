import { Request, Response } from "express";
import { Student } from "../../models/student.model";

export const getProfile = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.json({ code: "error", message: "Không tìm thấy thông tin sinh viên" });
    }

    const userProfile = await Student.findById(userId).select("-password");

    if (!userProfile) {
      return res.json({ code: "error", message: "Sinh viên không tồn tại" });
    }

    const profileData: any = userProfile.toObject();
    if (!profileData.avatar) {
      profileData.avatar = "https://ui-avatars.com/api/?name=" + encodeURIComponent(profileData.fullName || "Sinh viên") + "&background=FF6B35&color=fff";
    }

    return res.json({
      code: "success",
      message: "Lấy thông tin sinh viên thành công",
      data: profileData
    });

  } catch (error: any) {
    console.error("Get Student Profile Error:", error);
    return res.json({
      code: "error",
      message: "Đã xảy ra lỗi máy chủ khi lấy thông tin sinh viên.",
    });
  }
};
