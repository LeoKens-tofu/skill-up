import Link from "next/link";
import { ArrowRight, BookOpen, Trophy, Target, Users, Zap, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  const SHADOW_SM = "4px 4px 0px 0px rgba(0,0,0,1)";
  const SHADOW_MD = "6px 6px 0px 0px rgba(0,0,0,1)";
  const SHADOW_LG = "8px 8px 0px 0px rgba(0,0,0,1)";

  return (
    <div className="min-h-screen bg-[#FFF8F0] text-[#0A1628] font-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-[#FFF8F0] border-b-[4px] border-black z-50 flex items-center justify-between px-6 py-4 md:px-12">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#FF6B35] border-[3px] border-black flex items-center justify-center">
            <Zap size={24} className="text-white" />
          </div>
          <span className="font-serif text-2xl font-black tracking-tight">Skill Up</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 font-bold">
          <a href="#features" className="hover:-translate-y-1 transition-transform">Tính năng</a>
          <a href="#roles" className="hover:-translate-y-1 transition-transform">Dành cho ai</a>
          <a href="#contact" className="hover:-translate-y-1 transition-transform">Liên hệ</a>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            href="/login"
            className="hidden md:flex font-bold px-6 py-2 border-[3px] border-black bg-white hover:-translate-y-1 transition-transform"
            style={{ boxShadow: SHADOW_SM }}
          >
            Đăng nhập
          </Link>
          <Link 
            href="/register"
            className="font-bold px-6 py-2 border-[3px] border-black bg-[#FF6B35] text-white hover:-translate-y-1 transition-transform"
            style={{ boxShadow: SHADOW_SM }}
          >
            Đăng ký
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 md:px-12 md:pt-40 md:pb-32 flex flex-col lg:flex-row items-center gap-12 max-w-7xl mx-auto">
        <div className="flex-1 space-y-8 relative z-10">
          <div className="inline-block px-4 py-1 border-[3px] border-black bg-[#FFD166] font-bold text-sm transform -rotate-2">
            🚀 Nền tảng học tập thế hệ mới
          </div>
          <h1 className="font-serif text-5xl md:text-7xl font-black leading-[1.1]">
            Biến việc học thành <br/>
            <span className="text-white relative inline-block">
              <span className="relative z-10 px-2">trò chơi thú vị</span>
              <span className="absolute inset-0 bg-[#0A1628] border-[4px] border-black transform rotate-1" style={{ boxShadow: SHADOW_SM }}></span>
            </span>
          </h1>
          <p className="text-lg md:text-xl font-medium text-[#0A1628]/80 max-w-xl">
            Skill Up kết hợp phương pháp học tập tương tác với cơ chế trò chơi (Gamification). Tích lũy XP, leo rank, hoàn thành nhiệm vụ và thống trị bảng xếp hạng!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link 
              href="/register"
              className="flex items-center justify-center gap-2 font-bold text-lg px-8 py-4 border-[4px] border-black bg-[#FF6B35] text-white hover:-translate-y-1 hover:-translate-x-1 active:translate-y-1 active:translate-x-1 transition-all"
              style={{ boxShadow: SHADOW_MD }}
            >
              Bắt đầu hành trình <ArrowRight size={24} />
            </Link>
            <Link 
              href="/login"
              className="flex items-center justify-center gap-2 font-bold text-lg px-8 py-4 border-[4px] border-black bg-white hover:-translate-y-1 hover:-translate-x-1 active:translate-y-1 active:translate-x-1 transition-all"
              style={{ boxShadow: SHADOW_MD }}
            >
              Trải nghiệm Demo
            </Link>
          </div>
        </div>

        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-[#16A34A] border-[4px] border-black translate-x-4 translate-y-4"></div>
          <div className="relative border-[4px] border-black bg-white overflow-hidden" style={{ boxShadow: SHADOW_MD }}>
            <img src="/imports/image-3.png" alt="Students Learning" className="w-full h-auto object-cover aspect-[4/3] grayscale-[20%] hover:grayscale-0 transition-all duration-500" />
            
            {/* Floating Badges */}
            <div className="absolute top-6 left-6 border-[3px] border-black bg-[#FFD166] px-4 py-2 font-bold flex items-center gap-2 transform -rotate-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-bounce">
              <Trophy size={20} /> +500 XP
            </div>
            <div className="absolute bottom-6 right-6 border-[3px] border-black bg-white px-4 py-2 font-bold flex items-center gap-2 transform rotate-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Target size={20} className="text-[#FF6B35]"/> Nhiệm vụ hoàn thành
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-[#FFD166] border-y-[4px] border-black">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
            <h2 className="font-serif text-4xl md:text-5xl font-black">Tại sao chọn Skill Up?</h2>
            <p className="text-lg font-medium">Hệ thống được thiết kế theo chuẩn Neo-brutalism, loại bỏ sự nhàm chán của các nền tảng giáo dục truyền thống.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="border-[4px] border-black bg-white p-8 hover:-translate-y-2 transition-transform duration-300" style={{ boxShadow: SHADOW_LG }}>
              <div className="w-16 h-16 border-[3px] border-black bg-[#FF6B35] flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Trophy size={32} className="text-white" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-4">Gamification</h3>
              <p className="font-medium text-[#0A1628]/80 leading-relaxed">
                Hệ thống cấp độ (Level), điểm kinh nghiệm (XP) và bảng xếp hạng giúp sinh viên có thêm động lực ganh đua và học tập mỗi ngày.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="border-[4px] border-black bg-[#FFF8F0] p-8 hover:-translate-y-2 transition-transform duration-300" style={{ boxShadow: SHADOW_LG }}>
              <div className="w-16 h-16 border-[3px] border-black bg-[#16A34A] flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <BookOpen size={32} className="text-white" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-4">Khóa học & Quizzes</h3>
              <p className="font-medium text-[#0A1628]/80 leading-relaxed">
                Hệ thống trắc nghiệm phong phú, quản lý khóa học thông minh dành cho giảng viên, dễ dàng khởi tạo và chia sẻ đến sinh viên.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="border-[4px] border-black bg-white p-8 hover:-translate-y-2 transition-transform duration-300" style={{ boxShadow: SHADOW_LG }}>
              <div className="w-16 h-16 border-[3px] border-black bg-[#0A1628] flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Users size={32} className="text-white" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-4">Nhóm học tập</h3>
              <p className="font-medium text-[#0A1628]/80 leading-relaxed">
                Thành lập party, cùng nhau làm bài tập nhóm, thảo luận kỹ năng và vượt qua các deadline "khó nhằn" từ giảng viên.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" className="py-24 max-w-7xl mx-auto px-6 md:px-12">
        <h2 className="font-serif text-4xl md:text-5xl font-black text-center mb-16">Phù hợp cho cả 2 vai trò</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* For Student */}
          <div className="relative">
            <div className="absolute inset-0 bg-[#FF6B35] border-[4px] border-black translate-x-3 translate-y-3"></div>
            <div className="relative border-[4px] border-black bg-white p-10 flex flex-col h-full" style={{ boxShadow: SHADOW_MD }}>
              <h3 className="font-serif text-3xl font-black mb-6 flex items-center gap-4">
                👨‍🎓 Dành cho Sinh viên
              </h3>
              <ul className="space-y-4 mb-8 flex-1">
                {['Theo dõi lộ trình học tập, lịch học, deadline', 'Tham gia các bài thi kỹ năng (Quizzes) để nhận XP', 'Mua sắm vật phẩm ảo bằng XP trong Cửa hàng', 'Giao lưu, làm việc nhóm và hỏi đáp AI hỗ trợ'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 font-medium text-lg">
                    <CheckCircle2 className="text-[#16A34A] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link 
                href="/register?role=student"
                className="inline-block text-center font-bold px-6 py-3 border-[3px] border-black bg-[#FFD166] hover:-translate-y-1 transition-transform"
                style={{ boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)" }}
              >
                Tạo tài khoản Sinh viên
              </Link>
            </div>
          </div>

          {/* For Teacher */}
          <div className="relative">
            <div className="absolute inset-0 bg-[#0A1628] border-[4px] border-black translate-x-3 translate-y-3"></div>
            <div className="relative border-[4px] border-black bg-white p-10 flex flex-col h-full" style={{ boxShadow: SHADOW_MD }}>
              <h3 className="font-serif text-3xl font-black mb-6 flex items-center gap-4">
                👩‍🏫 Dành cho Giảng viên
              </h3>
              <ul className="space-y-4 mb-8 flex-1">
                {['Tạo và quản lý các ngân hàng câu hỏi, bài kiểm tra', 'Theo dõi điểm số, phân tích năng lực sinh viên', 'Tạo thông báo, giao bài tập (deadline) cho lớp', 'Theo dõi tiến độ hoàn thành bài của cả nhóm'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 font-medium text-lg">
                    <CheckCircle2 className="text-[#FF6B35] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link 
                href="/register?role=teacher"
                className="inline-block text-center font-bold px-6 py-3 border-[3px] border-black bg-white hover:-translate-y-1 transition-transform"
                style={{ boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)" }}
              >
                Đăng ký dành cho Giảng viên
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t-[4px] border-black bg-[#FF6B35] text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-serif text-4xl md:text-5xl font-black mb-8 leading-tight">Bạn đã sẵn sàng để <br/> nâng cấp bản thân chưa?</h2>
          <Link 
            href="/register"
            className="inline-flex items-center gap-2 font-bold text-xl px-10 py-5 border-[4px] border-black bg-[#FFF8F0] text-[#0A1628] hover:-translate-y-1 hover:-translate-x-1 active:translate-y-1 active:translate-x-1 transition-all"
            style={{ boxShadow: SHADOW_LG }}
          >
            Đăng ký tham gia ngay <ArrowRight size={24} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-[4px] border-black bg-white py-8 text-center font-bold">
        <p className="text-[#0A1628]/60">© 2026 Skill Up. FPT University Project.</p>
      </footer>
    </div>
  );
}
