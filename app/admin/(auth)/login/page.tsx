import { SignIn } from "@clerk/nextjs";

// Deliberately not linked from anywhere in the customer-facing nav - this
// is a separate entry point from customer sign-in, even though both run on
// the same underlying Clerk instance. Role checking (see proxy.ts and
// lib/adminAuth.ts) is what actually enforces the boundary, not obscurity:
// anyone can sign up via Clerk, but only an account with publicMetadata.role
// === "admin" (set manually in the Clerk dashboard) ever gets past proxy.ts.
export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4">
      <h1 className="font-serif text-2xl text-[var(--ink)]">Admin Login</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">Meraki staff only.</p>

      {error === "unauthorized" && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          That account doesn&apos;t have admin access.
        </p>
      )}

      <div className="mt-6">
        <SignIn routing="hash" forceRedirectUrl="/admin" signUpUrl="/sign-up" />
      </div>
    </main>
  );
}
