"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { productFormSchema, slugify } from "@/lib/productSchema";

export type ProductFormState = { error?: string } | undefined;

// Shared between create and update — pulls the same shape out of a
// <form>'s FormData regardless of which action consumes it.
function parseFormData(formData: FormData) {
  const imagesRaw = formData.get("images");
  const images =
    typeof imagesRaw === "string"
      ? imagesRaw
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
      : [];

  const collections = formData
    .getAll("collections")
    .filter((value): value is string => typeof value === "string");

  return {
    name: formData.get("name"),
    category: formData.get("category"),
    audience: formData.get("audience") || undefined,
    description: formData.get("description") || undefined,
    price: formData.get("price"),
    weightGrams: formData.get("weightGrams") || undefined,
    purity: formData.get("purity") || undefined,
    sku: formData.get("sku") || undefined,
    stock: formData.get("stock"),
    images,
    collections,
    videoUrl: formData.get("videoUrl") || undefined,
  };
}

// Loops rather than trusting the first guess — "fine-box-chain" might
// already exist from the seed data, so this walks -2, -3, ... until it
// finds one that's free.
async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = base || "product";
  let suffix = 2;
  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
}

export async function createProduct(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();

  const parsed = productFormSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid product" };
  }

  const data = parsed.data;
  const slug = await uniqueSlug(slugify(data.name));
  let productId: string;

  try {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        category: data.category,
        audience: data.audience,
        description: data.description,
        price: data.price,
        weightGrams: data.weightGrams,
        purity: data.purity || undefined,
        sku: data.sku || undefined,
        stock: data.stock,
        images: data.images,
        collections: data.collections ?? [],
        videoUrl: data.videoUrl || undefined,
      },
    });
    productId = product.id;
  } catch (error) {
    console.error("Error creating product:", error);
    return { error: "Couldn't create the product — check the SKU isn't already in use." };
  }

  revalidatePath("/admin/products");
  redirect(`/admin/products/${productId}/edit`);
}

export async function updateProduct(
  id: string,
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();

  const parsed = productFormSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid product" };
  }

  const data = parsed.data;

  try {
    await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        category: data.category,
        audience: data.audience,
        description: data.description,
        price: data.price,
        weightGrams: data.weightGrams ?? null,
        purity: data.purity || undefined,
        sku: data.sku || null,
        stock: data.stock,
        images: data.images,
        collections: data.collections ?? [],
        videoUrl: data.videoUrl || null,
      },
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return { error: "Couldn't save changes — check the SKU isn't already in use." };
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}/edit`);
  return undefined;
}

export async function toggleProductActive(id: string, isActive: boolean) {
  await requireAdmin();
  await prisma.product.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/products");
}

export type DeleteProductState = { error?: string } | undefined;

// A real delete, not just deactivate — but only when it's actually safe:
// Prisma throws on the foreign-key constraint if any OrderItem still
// references this product (no onDelete: Cascade on that relation, on
// purpose — an order's line items should never silently disappear because
// someone deleted the product later). Deactivating stays the right move
// for anything with order history; this is for the rest.
export async function deleteProduct(id: string): Promise<DeleteProductState> {
  await requireAdmin();

  try {
    await prisma.product.delete({ where: { id } });
  } catch (error) {
    console.error("Error deleting product:", error);
    return {
      error: "Couldn't delete — this product has order history. Deactivate it instead.",
    };
  }

  revalidatePath("/admin/products");
  return undefined;
}
