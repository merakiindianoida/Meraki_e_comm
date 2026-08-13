import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col items-center justify-center px-4">
      <SignUp signInUrl="/sign-in" />
    </main>
  );
}
