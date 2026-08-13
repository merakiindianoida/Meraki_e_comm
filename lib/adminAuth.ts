import "server-only";
import { auth } from "@clerk/nextjs/server";

// Admin access is a role check on a real Clerk user (publicMetadata.role
// === "admin"), not a separate credential system — see proxy.ts for the
// page-level gate. This file is the second, independent check: every admin
// Server Action calls requireAdmin() itself rather than trusting that
// proxy.ts already caught an unauthorized request, since a matcher change
// or a moved route could otherwise silently drop coverage.
export async function isAdmin(): Promise<boolean> {
  const { sessionClaims } = await auth();
  return sessionClaims?.metadata?.role === "admin";
}

export async function requireAdmin() {
  if (!(await isAdmin())) {
    throw new Error("Not authorized");
  }
}
