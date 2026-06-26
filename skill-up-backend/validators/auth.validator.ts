import Joi from "joi";
import { Request, Response, NextFunction } from "express";

export const registerValidator = (req: Request, res: Response, next: NextFunction): any => {
  const schema = Joi.object({
    fullName: Joi.string().required().messages({
      "string.empty": "Họ và tên không được để trống",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Email không hợp lệ",
      "string.empty": "Email không được để trống",
    }),
    password: Joi.string().min(6).required().messages({
      "string.min": "Mật khẩu phải có ít nhất 6 ký tự",
      "string.empty": "Mật khẩu không được để trống",
    }),
    studentId: Joi.string().when('role', {
      is: 'student',
      then: Joi.required().messages({
        "any.required": "Mã sinh viên không được để trống",
        "string.empty": "Mã sinh viên không được để trống",
      }),
      otherwise: Joi.forbidden()
    }),
    role: Joi.string().valid("student", "teacher").required().messages({
      "any.only": "Vai trò không hợp lệ",
    })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.json({ code: "error", message: error.details[0].message });
  }
  next();
};

export const loginValidator = (req: Request, res: Response, next: NextFunction): any => {
  const schema = Joi.object({
    loginId: Joi.string().required().messages({
      "string.empty": "Tài khoản không được để trống",
    }),
    password: Joi.string().required().messages({
      "string.empty": "Mật khẩu không được để trống",
    }),
    role: Joi.string().valid("student", "teacher").required().messages({
      "any.only": "Vai trò không hợp lệ",
    })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.json({ code: "error", message: error.details[0].message });
  }
  next();
};
