import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// This project's Next.js version renamed `middleware.ts` to `proxy.ts` (see
// node_modules/next/dist/docs/.../file-conventions/proxy.md) — Clerk's own
// setup docs already account for this rename, same underlying mechanism.
//
// Two gates live here:
//  1. /admin/* requires a signed-in Clerk user with publicMetadata.role ===
//     "admin" — separate from customer auth entirely (no shared login UI,
//     no link to it anywhere in the customer-facing nav).
//  2. Checkout and order history require a signed-in user of any kind —
//     browsing, wishlist, and the bag stay completely public, matching a
//     normal storefront (Amazon/Myntra-style: only buying and viewing your
//     own past orders require an account).
//
// This is an *optimistic* check (fast, cookie/JWT-only, no DB calls) —
// every admin Server Action independently re-verifies the same role via
// lib/adminAuth.ts, since proxy matcher changes or a moved route could
// otherwise silently drop coverage. See Next's Data Security guide.
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isAdminLoginRoute = createRouteMatcher(["/admin/login(.*)"]);
const isAuthRequiredRoute = createRouteMatcher([
  "/checkout(.*)",
  "/products/(.*)/checkout(.*)",
  "/orders(.*)",
  "/account(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  if (isAdminRoute(req) && !isAdminLoginRoute(req)) {
    if (!userId) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    if (sessionClaims?.metadata?.role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login?error=unauthorized", req.url));
    }
  }

  if (isAuthRequiredRoute(req) && !userId) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip static assets and Next internals; run on everything else,
    // including API routes (Clerk's own recommended default pattern).
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
    "/(api|trpc)(.*)",
  ],
};
