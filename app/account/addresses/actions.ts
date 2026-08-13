"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateCustomer } from "@/lib/customer";
import { addressFormSchema } from "@/lib/addressSchema";

export type AddressFormState = { error?: string } | undefined;

function parseFormData(formData: FormData) {
  return {
    label: formData.get("label") || undefined,
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    line1: formData.get("line1"),
    line2: formData.get("line2") || undefined,
    city: formData.get("city"),
    state: formData.get("state"),
    pincode: formData.get("pincode"),
    isDefault: formData.get("isDefault") === "on",
  };
}

// Every mutation below re-derives the signed-in customer from the Clerk
// session and checks it against the address's customerId itself, rather
// than trusting an id passed from the client alone - the same
// defense-in-depth pattern used by lib/adminAuth.ts and POST /api/orders.
async function requireOwnedAddress(id: string, customerId: string) {
  const address = await prisma.address.findUnique({ where: { id } });
  if (!address || address.customerId !== customerId) {
    throw new Error("Address not found");
  }
  return address;
}

export async function createAddress(
  _prevState: AddressFormState,
  formData: FormData
): Promise<AddressFormState> {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Please sign in." };
  }

  const parsed = addressFormSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid address" };
  }

  const customer = await getOrCreateCustomer(userId);
  const data = parsed.data;

  await prisma.$transaction(async (tx) => {
    // Only one address can be the default at a time - clear any existing
    // default first rather than trying to enforce it with a DB constraint.
    if (data.isDefault) {
      await tx.address.updateMany({
        where: { customerId: customer.id },
        data: { isDefault: false },
      });
    }
    await tx.address.create({
      data: { ...data, customerId: customer.id },
    });
  });

  revalidatePath("/account/addresses");
  return undefined;
}

export async function updateAddress(
  id: string,
  _prevState: AddressFormState,
  formData: FormData
): Promise<AddressFormState> {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Please sign in." };
  }

  const parsed = addressFormSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid address" };
  }

  const customer = await getOrCreateCustomer(userId);

  try {
    await requireOwnedAddress(id, customer.id);
  } catch {
    return { error: "That address could not be found." };
  }

  const data = parsed.data;

  await prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await tx.address.updateMany({
        where: { customerId: customer.id, NOT: { id } },
        data: { isDefault: false },
      });
    }
    await tx.address.update({ where: { id }, data });
  });

  revalidatePath("/account/addresses");
  return undefined;
}

export async function deleteAddress(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Please sign in.");

  const customer = await getOrCreateCustomer(userId);
  await requireOwnedAddress(id, customer.id);

  await prisma.address.delete({ where: { id } });
  revalidatePath("/account/addresses");
}

export async function setDefaultAddress(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Please sign in.");

  const customer = await getOrCreateCustomer(userId);
  await requireOwnedAddress(id, customer.id);

  await prisma.$transaction([
    prisma.address.updateMany({
      where: { customerId: customer.id },
      data: { isDefault: false },
    }),
    prisma.address.update({ where: { id }, data: { isDefault: true } }),
  ]);

  revalidatePath("/account/addresses");
}
