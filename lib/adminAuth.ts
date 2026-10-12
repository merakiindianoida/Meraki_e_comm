import "server-only";
import { auth } from "@clerk/nextjs/server";

// Every admin Server Action checks this independently of proxy.ts.
export async function isAdmin(): Promise<boolean> {
  const { sessionClaims } = await auth();
  return sessionClaims?.metadata?.role === "admin";
}

export async function requireAdmin() {
  if (!(await isAdmin())) {
    throw new Error("Not authorized");
  }
}
