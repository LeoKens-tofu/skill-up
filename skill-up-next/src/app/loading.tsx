import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] space-y-4 w-full h-full">
      <div className="border-[4px] border-black bg-[#FFD166] p-4 flex items-center justify-center animate-spin" style={{ boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)" }}>
        <Loader2 className="w-10 h-10 text-black" strokeWidth={3} />
      </div>
      <p className="font-sans font-bold text-xl text-black bg-white border-[3px] border-black px-6 py-3" style={{ boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)" }}>
        Đang tải dữ liệu...
      </p>
    </div>
  );
}
