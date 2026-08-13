"use client";

import { useCallback, useSyncExternalStore } from "react";

// Client-side only cart - same reasoning as lib/useWishlist.ts: no Clerk
// auth yet, so there's no customer to attach a server-side cart to.
// Backed by localStorage + a module-level store via useSyncExternalStore.
// `maxQuantity` is a soft UI limit only (stock at the time the item was
// added) - the real check happens server-side in POST /api/orders, which
// re-reads current stock from the DB and never trusts anything from here.
export type CartItem = {
  id: string;
  slug: string;
  name: string;
  price: number | string;
  image: string | null;
  category: string;
  quantity: number;
  maxQuantity: number;
};

const STORAGE_KEY = "meraki:cart";

let items: CartItem[] = [];
let hydrated = false;
const listeners = new Set<() => void>();

function readFromStorage(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  items = readFromStorage();
  hydrated = true;
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Private browsing / storage disabled - cart just won't survive a reload.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  hydrate();
  return items;
}

const EMPTY_ITEMS: CartItem[] = [];

function getServerSnapshot(): CartItem[] {
  return EMPTY_ITEMS;
}

// Adding an item already in the bag bumps its quantity instead of
// duplicating the row - this is what makes clicking "Add to Bag" again on
// a product you already have in your bag feel right rather than creating
// two lines for the same design.
function addToCart(item: Omit<CartItem, "quantity">, quantity = 1) {
  hydrate();
  const existing = items.find((i) => i.id === item.id);
  if (existing) {
    existing.quantity = Math.min(existing.quantity + quantity, existing.maxQuantity);
    items = [...items];
  } else {
    items = [...items, { ...item, quantity: Math.min(quantity, item.maxQuantity) }];
  }
  persist();
}

function setCartQuantity(id: string, quantity: number) {
  hydrate();
  if (quantity <= 0) {
    items = items.filter((i) => i.id !== id);
  } else {
    items = items.map((i) =>
      i.id === id ? { ...i, quantity: Math.min(quantity, i.maxQuantity) } : i
    );
  }
  persist();
}

function removeFromCart(id: string) {
  hydrate();
  items = items.filter((i) => i.id !== id);
  persist();
}

function clearCart() {
  hydrate();
  items = [];
  persist();
}

export function useCart() {
  const list = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => addToCart(item, quantity),
    []
  );
  const setQuantity = useCallback(
    (id: string, quantity: number) => setCartQuantity(id, quantity),
    []
  );
  const removeItem = useCallback((id: string) => removeFromCart(id), []);
  const clear = useCallback(() => clearCart(), []);

  const totalCount = list.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = list.reduce((sum, item) => {
    const unit = typeof item.price === "string" ? parseFloat(item.price) : item.price;
    return sum + unit * item.quantity;
  }, 0);

  return { items: list, addItem, setQuantity, removeItem, clear, totalCount, totalPrice };
}
