import "server-only";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { Customer } from "@/app/generated/prisma/client";
import type { SavedAddress } from "@/components/CheckoutClient";

// One Customer row per Clerk user, created lazily on whichever action
// needs it first (saving an address, placing an order) and reused after.
// Name/email always come from the verified Clerk session, never from a
// form, so there's no way to drift from the authenticated identity.
export async function getOrCreateCustomer(clerkId: string): Promise<Customer> {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? `${clerkId}@unknown.local`;
  const name = user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || null : null;

  return prisma.customer.upsert({
    where: { clerkId },
    update: {},
    create: { clerkId, email, name },
  });
}

// Used by both checkout entry points (bag and single-item "Buy Now") to
// show the address picker — a signed-in customer with no saved addresses
// yet just gets an empty list, which CheckoutClient falls back on cleanly.
export async function getSavedAddresses(clerkId: string): Promise<SavedAddress[]> {
  const customer = await prisma.customer.findUnique({ where: { clerkId } });
  if (!customer) return [];

  return prisma.address.findMany({
    where: { customerId: customer.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}
