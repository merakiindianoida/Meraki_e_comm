import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";
import { updateProduct } from "../../actions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    notFound();
  }

  return (
    <div>
      <h1 className="font-serif text-3xl text-[var(--ink)]">Edit Product</h1>
      <ProductForm
        action={updateProduct.bind(null, product.id)}
        submitLabel="Save Changes"
        defaults={{
          name: product.name,
          category: product.category,
          audience: product.audience,
          description: product.description,
          price: product.price.toString(),
          weightGrams: product.weightGrams?.toString() ?? null,
          purity: product.purity,
          sku: product.sku,
          stock: product.stock,
          images: product.images,
          collections: product.collections,
          videoUrl: product.videoUrl,
        }}
      />
    </div>
  );
}
