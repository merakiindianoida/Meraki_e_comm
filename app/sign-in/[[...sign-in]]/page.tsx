import { SignIn } from "@clerk/nextjs";

// Catch-all route ([[...sign-in]]) — Clerk's own internal steps (password
// reset, verification codes, etc.) navigate within this same route rather
// than needing separate pages for each.
export default function SignInPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col items-center justify-center px-4">
      <SignIn signUpUrl="/sign-up" />
    </main>
  );
}
