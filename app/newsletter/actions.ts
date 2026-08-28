"use server";

import { prisma } from "@/lib/prisma";
import { newsletterFormSchema } from "@/lib/newsletterSchema";

export type NewsletterFormState = { error?: string; success?: boolean } | undefined;

export async function subscribeToNewsletter(
  _prevState: NewsletterFormState,
  formData: FormData
): Promise<NewsletterFormState> {
  const parsed = newsletterFormSchema.safeParse({
    email: formData.get("email"),
    company: formData.get("company"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your email." };
  }

  // Already on the list is still a success from the visitor's side - there's
  // no reason to surface a "you already signed up" error for a footer form.
  await prisma.newsletterSubscriber.upsert({
    where: { email: parsed.data.email },
    update: {},
    create: { email: parsed.data.email },
  });

  return { success: true };
}
