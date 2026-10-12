import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isAdminLoginRoute = createRouteMatcher(["/admin/login(.*)"]);
const isAuthRequiredRoute = createRouteMatcher([
  "/checkout(.*)",
  "/products/(.*)/checkout(.*)",
  "/orders(.*)",
  "/account(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req) && !isAdminLoginRoute(req)) {
    const { userId, sessionClaims } = await auth();
    if (!userId) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    if (sessionClaims?.metadata?.role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login?error=unauthorized", req.url));
    }
    return NextResponse.next();
  }

  if (isAuthRequiredRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.nextUrl.pathname + req.nextUrl.search);
      return NextResponse.redirect(signInUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
    "/(api|trpc)(.*)",
  ],
};
