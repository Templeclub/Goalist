import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/** POST only (SameSite=Lax cookies keep it from being triggered cross-site). */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/', request.nextUrl.origin), { status: 303 })
}
