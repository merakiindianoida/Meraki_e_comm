"use server";

import { contactFormSchema } from "@/lib/contactSchema";
import { sendContactEmail } from "@/lib/email";
import { RATE_LIMIT_MESSAGE, RATE_RULES, checkRateLimit, clientIp } from "@/lib/rateLimit";

export type ContactFormState = { error?: string; success?: boolean } | undefined;

export async function submitContact(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const parsed = contactFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
    company: formData.get("company"),
  });

  if (!parsed.success) {
    // The honeypot ("company") is the only field a real visitor never
    // fills, so a failure there gets the same generic message as any
    // other - no reason to tip off a bot that it got caught.
    return { error: parsed.error.issues[0]?.message ?? "Please check your details." };
  }

  const allowed = await checkRateLimit(
    await clientIp(),
    RATE_RULES.contactShort,
    RATE_RULES.contactDaily
  );
  if (!allowed) {
    return { error: RATE_LIMIT_MESSAGE };
  }

  await sendContactEmail(parsed.data);
  return { success: true };
}
