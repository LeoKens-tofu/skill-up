import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Student } from "../../models/student.model";
import { Teacher } from "../../models/teacher.model";
import { redisClient } from "../../config/redis.config";

export const registerPost = async (req: Request, res: Response): Promise<any> => {
  try {
    const { fullName, email, password, role, studentId } = req.body;

    let existingUser;
    if (role === "teacher") {
      existingUser = await Teacher.findOne({ email });
    } else {
      existingUser = await Student.findOne({ $or: [{ email }, { studentId }] });
    }

    if (existingUser) {
      return res.json({
        code: "error",
        message: role === "student" ? "Email hoặc Mã sinh viên đã tồn tại." : "Email đã được sử dụng. Vui lòng chọn email khác.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let newUser;
    if (role === "teacher") {
      newUser = new Teacher({
        fullName,
        email,
        password: hashedPassword,
      });
    } else {
      newUser = new Student({
        fullName,
        studentId,
        email,
        password: hashedPassword,
      });
    }

    await newUser.save();

    return res.json({
      code: "success",
      message: "Đăng ký tài khoản thành công!",
      data: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        studentId: role === "student" ? studentId : undefined,
        role,
      },
    });
  } catch (error: any) {
    console.error("Register Error: ", error);
    return res.json({
      code: "error",
      message: "Đã xảy ra lỗi máy chủ trong quá trình đăng ký.",
    });
  }
};

export const loginPost = async (req: Request, res: Response): Promise<any> => {
  try {
    const { loginId, password, role } = req.body;
    
    let existAccount;
    if (role === "teacher") {
      existAccount = await Teacher.findOne({ email: loginId });
    } else {
      existAccount = await Student.findOne({ $or: [{ email: loginId }, { studentId: loginId }] });
    }

    if (!existAccount) {
      return res.json({
        code: "error",
        message: "Tài khoản hoặc mật khẩu không chính xác",
      });
    }

    const isHashedPassword = await bcrypt.compare(password, existAccount.password);
    if (!isHashedPassword) {
      return res.json({
        code: "error",
        message: "Tài khoản hoặc mật khẩu không chính xác",
      });
    }

    if (!existAccount.isActive) {
      return res.json({
        code: "error",
        message: "Tài khoản của bạn không được kích hoạt",
      });
    }

    const tokenVersion = Date.now().toString();

    const token = jwt.sign(
      {
        id: existAccount._id,
        role: role,
        email: existAccount.email,
        tokenVersion: tokenVersion,
      },
      process.env.JWT_SECRET as string || "skillup_secret_key_123",
      {
        expiresIn: "1d",
      }
    );

    // Bỏ qua lỗi redis nếu chưa chạy redis local
    if (redisClient.isOpen) {
      try {
        await redisClient.setEx(
          `auth:session:${existAccount._id}`,
          86400,
          tokenVersion
        );
      } catch(err) {
        console.error("Redis Session Error:", err);
      }
    }

    res.cookie("token", token, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
      domain: process.env.NODE_ENV === "production" ? process.env.COOKIE_DOMAIN : "localhost",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });

    return res.json({
      code: "success",
      message: "Đăng nhập thành công!",
      data: {
        role
      }
    });
  } catch (error: any) {
    console.error("Login Error: ", error);
    return res.json({
      code: "error",
      message: "Đã xảy ra lỗi máy chủ trong quá trình đăng nhập.",
    });
  }
};

export const logout = async (req: Request, res: Response): Promise<any> => {
  try {
    const token = req.cookies.token;

    if (token) {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string || "skillup_secret_key_123");
      if (redisClient.isOpen) {
        try {
          await redisClient.del(`auth:session:${decoded.id}`);
        } catch (err) {
          console.error("Redis Logout Error:", err);
        }
      }
    }
    
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "lax",
      domain: process.env.NODE_ENV === "production" ? process.env.COOKIE_DOMAIN : "localhost",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });
    
    return res.json({
      code: "success",
      message: "Đăng xuất thành công!",
    });
  } catch (error: any) {
    return res.json({
      code: "error",
      message: "Đã xảy ra lỗi máy chủ trong quá trình đăng xuất.",
    });
  }
};
