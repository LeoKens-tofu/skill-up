'use client';
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Users, Loader2, LogIn, ArrowLeft, Check, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "@/lib/socket";

const SHADOW = "6px 6px 0px 0px rgba(0,0,0,1)";
const SHADOW_SM = "4px 4px 0px 0px rgba(0,0,0,1)";

const initials = (name: string) =>
  (name || "?").trim().split(/\s+/).slice(-2).map((w) => w[0]).join("").toUpperCase();

type Preview = {
  _id: string;
  name: string;
  subject: string;
  description: string;
  color: string;
  memberCount: number;
  inviteCode: string;
  alreadyMember: boolean;
};

export default function JoinGroupPage() {
  const params = useParams();
  const router = useRouter();
  const code = String(params.code || "").toUpperCase();

  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(`${API_URL}/client/student/groups/invite/${code}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        if (d.code === "success") setPreview(d.data);
        else setError(d.message || "Link mời không hợp lệ");
      })
      .catch(() => alive && setError("Lỗi kết nối máy chủ"))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [code]);

  const join = async () => {
    if (!preview) return;
    setJoining(true);
    try {
      const res = await fetch(`${API_URL}/client/student/groups/join`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.code === "success") {
        toast.success(data.message || "Đã tham gia nhóm");
        router.push(`/student/groups?g=${data.data._id}`);
      } else {
        toast.error(data.message || "Không tham gia được");
        setJoining(false);
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ");
      setJoining(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-10">
      <div className="w-full max-w-md">
        <button
          onClick={() => router.push("/student/groups")}
          className="mb-4 inline-flex items-center gap-1.5 font-sans text-sm text-[#0A1628]/60 hover:text-[#FF6B35] transition-colors"
          style={{ fontWeight: 600 }}
        >
          <ArrowLeft size={16} /> Về danh sách nhóm
        </button>

        <div className="border-[4px] border-black bg-[#FFF8F0]" style={{ boxShadow: SHADOW }}>
          <div className="px-5 py-3.5 border-b-[3px] border-black bg-[#FF6B35] flex items-center gap-2">
            <Users size={20} className="text-white" />
            <h1 className="font-serif text-white" style={{ fontWeight: 800, fontSize: "1.15rem" }}>Lời mời tham gia nhóm</h1>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-[#0A1628]/50">
              <Loader2 size={28} className="animate-spin" />
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 border-[4px] border-black bg-[#FFD166] flex items-center justify-center mx-auto mb-4 rotate-[-4deg]" style={{ boxShadow: SHADOW_SM }}>
                <AlertTriangle size={30} className="text-[#0A1628]" />
              </div>
              <p className="font-serif text-[#0A1628] mb-1" style={{ fontWeight: 800, fontSize: "1.1rem" }}>Không mở được lời mời</p>
              <p className="font-sans text-sm text-[#0A1628]/60 mb-5" style={{ fontWeight: 500 }}>{error}</p>
              <button
                onClick={() => router.push("/student/groups")}
                className="border-[3px] border-black bg-[#FF6B35] text-white px-4 py-2.5 font-sans text-sm hover:-translate-y-0.5 transition-transform"
                style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}
              >
                Về danh sách nhóm
              </button>
            </div>
          ) : preview ? (
            <div className="p-6">
              <div className="flex flex-col items-center text-center">
                <div
                  className="w-20 h-20 border-[4px] border-black flex items-center justify-center font-serif text-white mb-3"
                  style={{ backgroundColor: preview.color, fontWeight: 800, fontSize: "1.6rem", boxShadow: SHADOW_SM }}
                >
                  {initials(preview.name)}
                </div>
                <h2 className="font-serif text-[#0A1628]" style={{ fontWeight: 800, fontSize: "1.4rem" }}>{preview.name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  {preview.subject && (
                    <span className="font-sans text-xs px-2 py-0.5 border-[2px] border-black bg-[#FFD166] text-[#0A1628]" style={{ fontWeight: 700 }}>
                      {preview.subject}
                    </span>
                  )}
                  <span className="font-sans text-xs text-[#0A1628]/60" style={{ fontWeight: 600 }}>
                    {preview.memberCount} thành viên
                  </span>
                </div>
                {preview.description && (
                  <p className="font-sans text-sm text-[#0A1628]/70 mt-3" style={{ fontWeight: 500 }}>{preview.description}</p>
                )}
              </div>

              <button
                onClick={join}
                disabled={joining}
                className="mt-6 w-full flex items-center justify-center gap-2 border-[3px] border-black bg-[#FF6B35] text-white py-3 font-sans hover:-translate-y-0.5 active:translate-y-0.5 transition-transform disabled:opacity-60"
                style={{ boxShadow: SHADOW_SM, fontWeight: 700 }}
              >
                {joining ? <Loader2 size={18} className="animate-spin" /> : preview.alreadyMember ? <Check size={18} /> : <LogIn size={18} />}
                {preview.alreadyMember ? "Vào nhóm" : "Tham gia nhóm"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
