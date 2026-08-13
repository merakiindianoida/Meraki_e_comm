import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getSavedAddresses } from "@/lib/customer";
import BagCheckoutClient from "@/components/BagCheckoutClient";

// Server wrapper so saved addresses (which live in the database) can be
// fetched here and handed to the client component — the bag itself only
// exists in localStorage, which is why BagCheckoutClient still has to be
// a Client Component.
export default async function CheckoutPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/checkout");
  }

  const addresses = await getSavedAddresses(userId);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-3xl text-[var(--ink)]">Checkout</h1>

      <div className="mt-8">
        <BagCheckoutClient addresses={addresses} />
      </div>
    </main>
  );
}
