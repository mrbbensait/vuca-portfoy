import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // PRODUCTION MODE: Supabase authentication aktif
  
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Fallback values for build time
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
          })
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // API route'ları middleware'den exclude - kendi auth kontrollerini yapıyorlar
  const isApiRoute = request.nextUrl.pathname.startsWith('/api')
  
  // Sadece landing page ve auth sayfaları herkese açık
  // /explore, /p/, /profile/ artık giriş yapmış kullanıcılara özel
  const isPublicPath = request.nextUrl.pathname === '/' 
    || request.nextUrl.pathname.startsWith('/auth')

  // Admin sayfaları — auth zorunlu (role kontrolü admin layout'ta yapılır)
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin')

  if (!user && !isPublicPath && !isApiRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  if (user && request.nextUrl.pathname.startsWith('/auth')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Admin path için ek koruma: giriş yapmamış kullanıcılar login'e yönlendirilir
  // Role kontrolü middleware'de yapılmaz (DB sorgusu pahalı), layout.tsx'de yapılır
  if (!user && isAdminPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
