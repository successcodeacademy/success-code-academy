import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // API handlers own their response status, cookies, and redirects. In
  // particular, the public-to-console logout chain must never be rewritten to
  // an /admin page by the clean console URL rules below.
  if (pathname === '/api' || pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Check if maintenance mode is enabled in the environment
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true'

  // If maintenance mode is active, rewrite all matching traffic to the maintenance page
  if (isMaintenanceMode) {
    // If the request is already for /maintenance, let it pass normally
    if (request.nextUrl.pathname === '/maintenance') {
      return NextResponse.next()
    }
    
    // Rewrite all other requests to the maintenance page
    // Using rewrite keeps the original URL in the browser (better for UX and returning visitors)
    return NextResponse.rewrite(new URL('/maintenance', request.url))
  }

  // If maintenance mode is OFF, but someone manually tries to access /maintenance, redirect to home
  if (request.nextUrl.pathname === '/maintenance') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  const host = request.headers.get('host') || ''
  const hostname =
    request.nextUrl.hostname.toLowerCase().replace(/\.$/, '') ||
    host.split(':')[0].toLowerCase()

  // Root-scoped browser assets must not enter the clean console rewrite. On
  // console.successcodeacademy.in, rewriting /sw.js to /admin/sw.js causes
  // Next to serve the app's HTML 404 page instead of the worker script.
  if (pathname === '/sw.js' || pathname === '/manifest.webmanifest') {
    return NextResponse.next()
  }

  // Check if request is accessing via console subdomain (production or local test)
  const isConsoleSubdomain =
    hostname === 'console.successcodeacademy.in' ||
    hostname === 'console.localhost' ||
    hostname.startsWith('console.')

  if (isConsoleSubdomain) {
    // If on console subdomain and URL has redundant /admin prefix, redirect to clean path
    if (pathname === '/admin' || pathname.startsWith('/admin/')) {
      const cleanPath = pathname.replace(/^\/admin/, '') || '/'
      return NextResponse.redirect(
        new URL(`${cleanPath}${request.nextUrl.search}`, request.url)
      )
    }

    // Rewrite console subdomain routes to /admin internally while preserving clean browser URL
    const rewriteUrl = request.nextUrl.clone()
    rewriteUrl.pathname = pathname === '/' ? '/admin' : `/admin${pathname}`
    return NextResponse.rewrite(rewriteUrl)
  }

  // If accessed on main domain (successcodeacademy.in or www.successcodeacademy.in)
  // in production, redirect /admin to console.successcodeacademy.in
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    hostname.includes('successcodeacademy.in')

  if (isProduction && (pathname === '/admin' || pathname.startsWith('/admin/'))) {
    const cleanPath = pathname.replace(/^\/admin/, '') || '/'
    const target = new URL(`https://console.successcodeacademy.in${cleanPath}${request.nextUrl.search}`)
    return NextResponse.redirect(target, 307)
  }

  return NextResponse.next()
}

export const config = {
  // Apply middleware to all routes except API, Next.js static assets, images, and favicons
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg).*)',
  ],
}
