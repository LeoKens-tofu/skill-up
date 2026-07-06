import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { redisClient } from "../config/redis.config";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.json({ code: "error", message: "Vui lòng đăng nhập" });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string || "skillup_secret_key_123");
    
    if (redisClient.isOpen) {
      const activeVersion = await redisClient.get(`auth:session:${decoded.id}`);
      
      if (!activeVersion || decoded.tokenVersion !== activeVersion) {
        res.clearCookie("token", {
          httpOnly: true,
          sameSite: "none",
          domain: process.env.COOKIE_DOMAIN || undefined,
          path: "/",
          secure: true,
        });
        return res.json({
          code: "error",
          message: "Tài khoản của bạn đã được đăng nhập ở một thiết bị khác.",
        });
      }
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "none",
      domain: process.env.COOKIE_DOMAIN || undefined,
      path: "/",
      secure: true,
    });
    return res.json({
      code: "error",
      message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn",
    });
  }
};
