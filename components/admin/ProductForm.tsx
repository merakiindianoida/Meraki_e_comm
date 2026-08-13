"use client";

import { useActionState } from "react";
import { CATEGORIES, AUDIENCES, COLLECTIONS } from "@/lib/catalog";
import type { ProductFormState } from "@/app/admin/(dashboard)/products/actions";

// Shared by both /admin/products/new and /admin/products/[id]/edit — same
// fields either way, only the bound Server Action and the pre-filled
// values differ between create and edit.
export type ProductDefaults = {
  name?: string;
  category?: string;
  audience?: string | null;
  description?: string | null;
  price?: string;
  weightGrams?: string | null;
  purity?: string | null;
  sku?: string | null;
  stock?: number;
  images?: string[];
  collections?: string[];
  videoUrl?: string | null;
};

export default function ProductForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (state: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  defaults?: ProductDefaults;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="mt-6 max-w-2xl space-y-5">
      <div>
        <label htmlFor="name" className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={defaults?.name}
          className="mt-1 w-full border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--ink)] outline-none transition duration-300 focus:border-[var(--accent)]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
            Category
          </label>
          <select
            id="category"
            name="category"
            required
            defaultValue={defaults?.category ?? ""}
            className="mt-1 w-full border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--ink)] outline-none transition duration-300 focus:border-[var(--accent)]"
          >
            <option value="" disabled>
              Choose a category
            </option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="audience" className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
            Audience
          </label>
          <select
            id="audience"
            name="audience"
            defaultValue={defaults?.audience ?? ""}
            className="mt-1 w-full border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--ink)] outline-none transition duration-300 focus:border-[var(--accent)]"
          >
            <option value="">Unisex (default)</option>
            {AUDIENCES.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="description" className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={defaults?.description ?? ""}
          className="mt-1 w-full border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--ink)] outline-none transition duration-300 focus:border-[var(--accent)]"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="price" className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
            Price (₹)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={defaults?.price}
            className="mt-1 w-full border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--ink)] outline-none transition duration-300 focus:border-[var(--accent)]"
          />
        </div>
        <div>
          <label htmlFor="weightGrams" className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
            Weight (g)
          </label>
          <input
            id="weightGrams"
            name="weightGrams"
            type="number"
            step="0.01"
            min="0"
            defaultValue={defaults?.weightGrams ?? ""}
            className="mt-1 w-full border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--ink)] outline-none transition duration-300 focus:border-[var(--accent)]"
          />
        </div>
        <div>
          <label htmlFor="stock" className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
            Stock
          </label>
          <input
            id="stock"
            name="stock"
            type="number"
            step="1"
            min="0"
            required
            defaultValue={defaults?.stock ?? 0}
            className="mt-1 w-full border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--ink)] outline-none transition duration-300 focus:border-[var(--accent)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="purity" className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
            Purity
          </label>
          <input
            id="purity"
            name="purity"
            placeholder="925 Silver"
            defaultValue={defaults?.purity ?? ""}
            className="mt-1 w-full border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--ink)] outline-none transition duration-300 focus:border-[var(--accent)]"
          />
        </div>
        <div>
          <label htmlFor="sku" className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
            SKU
          </label>
          <input
            id="sku"
            name="sku"
            defaultValue={defaults?.sku ?? ""}
            className="mt-1 w-full border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--ink)] outline-none transition duration-300 focus:border-[var(--accent)]"
          />
        </div>
      </div>

      <div>
        <label htmlFor="images" className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
          Image URLs (one per line, first is the main photo)
        </label>
        <textarea
          id="images"
          name="images"
          rows={4}
          placeholder={"https://res.cloudinary.com/.../photo-1.jpg\nhttps://res.cloudinary.com/.../photo-2.jpg"}
          defaultValue={defaults?.images?.join("\n") ?? ""}
          className="mt-1 w-full border border-[var(--border)] bg-white px-3 py-2.5 font-mono text-xs text-[var(--ink)] outline-none transition duration-300 focus:border-[var(--accent)]"
        />
      </div>

      <div>
        <label htmlFor="videoUrl" className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
          Shoppable video URL (optional)
        </label>
        <input
          id="videoUrl"
          name="videoUrl"
          placeholder="https://res.cloudinary.com/.../reel.mp4"
          defaultValue={defaults?.videoUrl ?? ""}
          className="mt-1 w-full border border-[var(--border)] bg-white px-3 py-2.5 font-mono text-xs text-[var(--ink)] outline-none transition duration-300 focus:border-[var(--accent)]"
        />
      </div>

      <div>
        <span className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">Collections</span>
        <div className="mt-2 flex flex-wrap gap-4">
          {COLLECTIONS.map((c) => (
            <label key={c} className="flex items-center gap-2 text-sm text-[var(--ink)]">
              <input
                type="checkbox"
                name="collections"
                value={c}
                defaultChecked={defaults?.collections?.includes(c)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              {c}
            </label>
          ))}
        </div>
      </div>

      {state?.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[var(--accent)] px-8 py-3 text-sm uppercase tracking-[0.15em] text-white transition duration-500 hover:bg-[var(--accent)]/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
