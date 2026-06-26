import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Lấy token từ cookie
  const token = request.cookies.get('token')?.value;

  // Kiểm tra route
  const isStudentRoute = request.nextUrl.pathname.startsWith('/student');
  const isTeacherRoute = request.nextUrl.pathname.startsWith('/teacher');

  // Nếu truy cập vào các trang bảo vệ mà chưa có token -> đẩy về login
  if (isStudentRoute || isTeacherRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/student/:path*', '/teacher/:path*'],
};
