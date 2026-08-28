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

  // upsert so re-subscribing doesn't error out
  await prisma.newsletterSubscriber.upsert({
    where: { email: parsed.data.email },
    update: {},
    create: { email: parsed.data.email },
  });

  return { success: true };
}
