import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from "@/backend/lib/prisma"
import { signAccessToken, signRefreshToken } from "@/backend/lib/auth/jwt"
import bcrypt from "bcryptjs"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  
  // Catch Supabase OAuth errors passed in the URL
  const errorParam = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  if (errorParam || errorDescription) {
    console.error('OAuth redirect error:', errorParam, errorDescription)
    const desc = (errorDescription || errorParam || '').toLowerCase()
    
    // Supabase returns these when an email exists but linking is disabled
    if (desc.includes('already registered') || desc.includes('different provider') || desc.includes('database error') || desc.includes('user_already_exists')) {
      return NextResponse.redirect(`${origin}/login?error=account_exists`)
    }
    
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorDescription || 'Authentication failed')}`)
  }

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options })
          },
        },
      }
    )
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.session) {
      const sbUser = data.session.user;
      const email = sbUser.email;
      
      if (email) {
        let userProfile = await prisma.user.findUnique({
          where: { email: email.toLowerCase() }
        });

        // Create if doesn't exist
        if (!userProfile) {
          const salt = await bcrypt.genSalt(10);
          const randomPasswordHash = await bcrypt.hash("GOOGLE_AUTH_" + Date.now().toString(), salt);
          
          userProfile = await prisma.user.create({
            data: {
              email: email.toLowerCase(),
              passwordHash: randomPasswordHash,
              role: "student",
              firstName: sbUser.user_metadata?.full_name?.split(" ")[0] || "Google",
              lastName: sbUser.user_metadata?.full_name?.split(" ")[1] || "User",
              fullName: sbUser.user_metadata?.full_name || "Google User",
              isEmailVerified: true, // Google verifies emails
              joinedDate: new Date().toISOString().split("T")[0]
            }
          });
        }

        // Set custom JWT cookies
        const payload = {
          id: userProfile.id,
          email: userProfile.email,
          role: userProfile.role,
          full_name: userProfile.fullName,
          institution: userProfile.institution,
          sessionId: `google-sess-${Date.now()}`
        };

        const newAccessToken = await signAccessToken(payload);
        const newRefreshToken = await signRefreshToken({ id: userProfile.id, email: userProfile.email, role: userProfile.role });

        cookieStore.set("access_token", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 15 * 60,
          path: "/"
        });

        cookieStore.set("refresh_token", newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 3600,
          path: "/"
        });

        cookieStore.set("session", "true", { path: "/" });

        let targetNext = next;
        if (targetNext === '/dashboard') {
          if (userProfile.role === 'admin') {
            targetNext = '/admin';
          } else if (userProfile.role === 'organizer') {
            targetNext = '/organizer/dashboard';
          } else {
            targetNext = '/';
          }
        }

        return NextResponse.redirect(`${origin}${targetNext}`)
      }
    } else {
      console.error('OAuth callback error:', error)
      
      // Handle the specific case where an email already exists in Supabase
      // but isn't linked to the Google identity.
      if (error?.message?.toLowerCase().includes('already registered') || error?.status === 400) {
        return NextResponse.redirect(`${origin}/login?error=account_exists`)
      }
    }
  }

  // If no code and no error in query params, it might be in the URL hash fragment.
  // Next.js server routes cannot read hash fragments, so we return a tiny HTML script to catch it.
  return new NextResponse(`
    <html>
      <body>
        <script>
          var hash = window.location.hash;
          var search = window.location.search;
          if (hash && hash.includes('error=')) {
            var params = new URLSearchParams(hash.substring(1));
            var err = params.get('error_description') || params.get('error') || '';
            var desc = err.toLowerCase();
            
            if (desc.includes('already registered') || desc.includes('different provider') || desc.includes('database error') || desc.includes('user_already_exists')) {
              window.location.href = '/login?error=account_exists';
            } else {
              window.location.href = '/login?error=' + encodeURIComponent(err || 'Authentication failed');
            }
          } else {
            window.location.href = '/login?error=Could not authenticate user';
          }
        </script>
      </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  });
}
