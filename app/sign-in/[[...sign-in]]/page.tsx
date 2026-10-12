import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col items-center justify-center px-4">
      <SignIn signUpUrl="/sign-up" />
    </main>
  );
}
