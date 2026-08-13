import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import AddressManager from "@/components/AddressManager";

// Requires a signed-in Clerk user - same pattern as app/orders/page.tsx.
export default async function AddressesPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/account/addresses");
  }

  const customer = await prisma.customer.findUnique({ where: { clerkId: userId } });

  // No Customer row yet just means this account has never saved an address
  // or placed an order - an empty list, not an error.
  const addresses = customer
    ? await prisma.address.findMany({
        where: { customerId: customer.id },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      })
    : [];

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-3xl text-[var(--ink)]">Saved Addresses</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Manage the addresses you can choose from at checkout.
      </p>
      <AddressManager addresses={addresses} />
    </main>
  );
}
