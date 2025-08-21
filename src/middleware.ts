import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  try {
    // Get token
    const token = await getToken({
      req,
      secret: process.env.AUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production",
      cookieName:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
    });

    if (!token) {
      // Get tries counter
      const redirectCount = parseInt(
        req.cookies.get("redirect_count")?.value || "0"
      );

      // Create redirection response
      const response = NextResponse.redirect(new URL("/auth/login", req.url));

      // If there is more than 2 tries, redirect with error message
      if (redirectCount >= 2) {
        return NextResponse.redirect(
          new URL("/auth/login?error=three_times", req.url)
        );
      }

      // Increment count with redirections
      response.cookies.set("redirect_count", (redirectCount + 1).toString(), {
        maxAge: 60 * 5, // 5 minutos
        path: "/",
      });

      return response;
    }

    // Clean counter if token is valid
    const response = NextResponse.next();
    response.cookies.delete("redirect_count");

    /* eslint-disable */
    const { data }: any = token;
    /* eslint-enable */
    if (data.role === "admin") {
      return response;
    }

    return NextResponse.redirect(new URL("/403", req.url));
  } catch (error) {
    console.error(error);
    throw new Error("Error in middleware: " + error);
  }
}

export const config = {
  matcher: ["/admin/:path*", "/admin"], // Protected routes
};
