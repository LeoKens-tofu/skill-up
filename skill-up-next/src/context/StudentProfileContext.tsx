'use client';
import { createContext, useContext, useEffect, useState } from "react";

export type StudentProfile = {
  _id?: string;
  fullName?: string;
  avatar?: string;
  studentId?: string;
  level?: number;
  xp?: number;
  title?: string;
  [key: string]: unknown;
};

type Ctx = { profile: StudentProfile | null; loading: boolean };

const StudentProfileContext = createContext<Ctx>({ profile: null, loading: true });

export const useStudentProfile = () => useContext(StudentProfileContext);

// Fetch hồ sơ 1 lần cho toàn khu vực student; chia sẻ qua context để header + các trang cùng dùng
export function StudentProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    // Tự thử lại khi backend tạm mất kết nối (nodemon restart / cold start)
    const load = async (attempt = 0) => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/client/student/account/profile`,
          { credentials: "include", signal: controller.signal }
        );
        const data = await res.json();
        if (cancelled) return;
        if (data.code === "success") setProfile(data.data);
        setLoading(false);
      } catch (err) {
        if (cancelled || controller.signal.aborted) return;
        if (attempt < 3) {
          setTimeout(() => load(attempt + 1), 1500 * (attempt + 1));
        } else {
          console.error("Failed to fetch profile", err);
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  return (
    <StudentProfileContext.Provider value={{ profile, loading }}>
      {children}
    </StudentProfileContext.Provider>
  );
}
