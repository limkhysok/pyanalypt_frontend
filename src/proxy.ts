import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = [
    "/dashboard",
    "/analysis",
    "/clean",
    "/datasets",
    "/insight",
    "/issues",
    "/visualization",
    "/profile",
];

const AUTH_PREFIXES = ["/login", "/register"];
const SESSION_COOKIE = "auth_session";

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const isAuthenticated = !!request.cookies.get(SESSION_COOKIE)?.value;
    const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
    const isAuthPage = AUTH_PREFIXES.some((prefix) => pathname.startsWith(prefix));

    if (isProtected && !isAuthenticated) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
    }
    if (isAuthPage && isAuthenticated) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt).*)", // NOSONAR: String.raw breaks Next.js static analysis of config.matcher
    ],
};