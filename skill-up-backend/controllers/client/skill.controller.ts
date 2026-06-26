import { Request, Response } from "express";
import { SkillHistory } from "../../models/skill-history.model";
import Groq from "groq-sdk";
import Tesseract from "tesseract.js";

const getGroqClient = () => {
  return new Groq({ apiKey: process.env.GROQ_API_KEY || "dummy_key_to_prevent_crash" });
};

// [POST] /api/client/student/skills/analyze
export const analyze = async (req: Request, res: Response): Promise<any> => {
  try {
    const studentId = req.user?.id;
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.json({ code: "error", message: "Không tìm thấy ảnh" });
    }

    const groq = getGroqClient();
    if (!process.env.GROQ_API_KEY) {
      return res.json({ code: "error", message: "Thiếu GROQ_API_KEY trong biến môi trường" });
    }

    // 1. Run OCR using Tesseract.js
    const { data: { text } } = await Tesseract.recognize(
      imageBase64,
      'eng'
    );

    // 2. Use Groq text model to parse the OCR text
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Đây là văn bản được trích xuất (OCR) từ một ảnh bảng điểm:\n"${text}"\n\nHãy tìm tất cả các tên kỹ năng (ví dụ: Speed, Memory, Attention, Flexibility...) và con số nguyên tương ứng thuộc về nó. Nếu một kỹ năng xuất hiện nhưng không có con số rõ ràng đi kèm (ví dụ: bị trống hoặc ký tự lạ), hãy gán giá trị rawValue là 10.\nTrả về ĐÚNG MỘT JSON ARRAY chứa các kỹ năng. KHÔNG kèm theo bất kỳ chữ nào khác. Ví dụ format: [ {"skill": "Speed", "rawValue": 10}, {"skill": "Memory", "rawValue": 1505} ]. Chỉ trả về JSON array hợp lệ.`
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0,
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "[]";
    let parsedData = [];
    let skillsData = [];
    try {
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        const jsonString = jsonMatch ? jsonMatch[0] : responseText;
        parsedData = JSON.parse(jsonString);
        
        // Scale values mathematically in JS to guarantee precision
        const maxExpected = 1600; // Define a logical max or compute it
        skillsData = parsedData.map((s: any) => {
            const raw = typeof s.rawValue === 'number' ? s.rawValue : parseFloat(s.rawValue) || 10;
            // scale it to 100
            let percentage = Math.round((raw / maxExpected) * 100);
            if (percentage > 100) percentage = 100;
            if (percentage < 0) percentage = 0;
            return {
                skill: s.skill,
                value: percentage
            };
        });
    } catch (e) {
        return res.json({ code: "error", message: "Lỗi phân tích từ AI", data: responseText });
    }

    // Save to database
    const historyRecord = new SkillHistory({
      studentId,
      skills: skillsData
    });
    await historyRecord.save();

    return res.json({
      code: "success",
      message: "Phân tích và cập nhật dữ liệu thành công",
      data: skillsData
    });

  } catch (error) {
    console.error("Lỗi analyze skill:", error);
    return res.json({
      code: "error",
      message: "Lỗi hệ thống",
    });
  }
};

// [GET] /api/client/student/skills
export const current = async (req: Request, res: Response): Promise<any> => {
  try {
    const studentId = req.user?.id;
    const latest = await SkillHistory.findOne({ studentId }).sort({
      createdAt: -1,
    });
    if (latest) {
      return res.json({ code: "success", data: latest.skills });
    } else {
      return res.json({
        code: "success",
        data: [
          { skill: "Lập trình", value: 50 },
          { skill: "Cơ sở dữ liệu", value: 50 },
          { skill: "Giao tiếp", value: 50 },
          { skill: "Tư duy logic", value: 50 },
          { skill: "Thiết kế UI", value: 50 },
          { skill: "Học thuật", value: 50 },
        ],
      });
    }
  } catch (error) {
    return res.json({ code: "error", message: "Lỗi hệ thống" });
  }
};

// [GET] /api/client/student/skills/history
export const history = async (req: Request, res: Response): Promise<any> => {
  try {
    const studentId = req.user?.id;
    const records = await SkillHistory.find({ studentId }).sort({
      createdAt: -1,
    });
    return res.json({ code: "success", data: records });
  } catch (error) {
    return res.json({ code: "error", message: "Lỗi hệ thống" });
  }
};
