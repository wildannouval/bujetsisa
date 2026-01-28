// lib/supabase/proxy.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Cek apakah Environment Variables sudah terpasang
  if (!hasEnvVars) {
    return supabaseResponse;
  }

  // 1. Inisialisasi Supabase Client di sisi Server (Middleware)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // 2. Refresh Sesi Auth
  // getUser() lebih aman daripada getSession() atau getClaims() karena melakukan validasi ke server Supabase
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 3. LOGIKA REDIRECT (PROTEKSI HALAMAN)

  // A. Jika USER BELUM LOGIN dan mencoba mengakses halaman selain login/register/auth
  if (!user && !request.nextUrl.pathname.startsWith("/auth")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // B. Jika USER SUDAH LOGIN dan mencoba mengakses halaman auth (login/sign-up)
  // Kita lempar balik ke Dashboard agar tidak login dua kali
  if (user && request.nextUrl.pathname.startsWith("/auth")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Penting: Selalu kembalikan objek supabaseResponse agar cookie tetap sinkron
  return supabaseResponse;
}
