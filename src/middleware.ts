import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const session = request.cookies.get("session")?.value;

    const { pathname } = request.nextUrl;

    // Protected routes
    const protectedPaths = ["/dashboard", "/settings", "/api/user"];
    const isProtectedPath = protectedPaths.some((path) =>
        pathname.startsWith(path)
    );

    // Auth pages
    const authPaths = ["/login", "/signup"];
    const isAuthPath = authPaths.some((path) =>
        pathname.startsWith(path)
    );

    if (isProtectedPath && !session) {
        const url = new URL("/login", request.url);
        url.searchParams.set("redirectTo", pathname);
        return NextResponse.redirect(url);
    }

    if (isAuthPath && session) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
