import ProductForm from "@/components/admin/ProductForm";
import { createProduct } from "../actions";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl text-[var(--ink)]">Add Product</h1>
      <ProductForm action={createProduct} submitLabel="Create Product" />
    </div>
  );
}
