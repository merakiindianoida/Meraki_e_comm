import "server-only";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { Customer, Prisma } from "@/app/generated/prisma/client";
import type { SavedAddress } from "@/components/CheckoutClient";

type Db = Prisma.TransactionClient;

export async function upsertCustomerByClerk(
  db: Db,
  { clerkId, email, name }: { clerkId: string; email: string; name: string | null }
): Promise<Customer> {
  const byClerkId = await db.customer.findUnique({ where: { clerkId } });
  if (byClerkId) return byClerkId;

  const byEmail = await db.customer.findUnique({ where: { email } });
  if (byEmail) {
    return db.customer.update({
      where: { id: byEmail.id },
      data: { clerkId, name: byEmail.name ?? name },
    });
  }

  return db.customer.create({ data: { clerkId, email, name } });
}

export async function getOrCreateCustomer(clerkId: string): Promise<Customer> {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? `${clerkId}@unknown.local`;
  const name = user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || null : null;

  return upsertCustomerByClerk(prisma, { clerkId, email, name });
}

export async function getSavedAddresses(clerkId: string): Promise<SavedAddress[]> {
  const customer = await prisma.customer.findUnique({ where: { clerkId } });
  if (!customer) return [];

  return prisma.address.findMany({
    where: { customerId: customer.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}