"use server";

import { prisma } from "@/lib/prisma";
import { newsletterFormSchema } from "@/lib/newsletterSchema";
import { RATE_LIMIT_MESSAGE, RATE_RULES, checkRateLimit, clientIp } from "@/lib/rateLimit";

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

  if (!(await checkRateLimit(await clientIp(), RATE_RULES.newsletter))) {
    return { error: RATE_LIMIT_MESSAGE };
  }

  // upsert so re-subscribing doesn't error out
  await prisma.newsletterSubscriber.upsert({
    where: { email: parsed.data.email },
    update: {},
    create: { email: parsed.data.email },
  });

  return { success: true };
}
