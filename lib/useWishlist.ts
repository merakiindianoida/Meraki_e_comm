"use client";

import { useCallback, useSyncExternalStore } from "react";

// Client-side only wishlist - no Clerk auth wired up yet, so there's no
// customer to attach a server-side wishlist to. Backed by localStorage and
// a module-level store (via useSyncExternalStore) so every mounted
// component - header badge, product card hearts, the /wishlist page -
// stays in sync without prop drilling or a context provider.
export type WishlistItem = {
  id: string;
  slug: string;
  name: string;
  price: number | string;
  image: string | null;
  category: string;
};

const STORAGE_KEY = "meraki:wishlist";

let items: WishlistItem[] = [];
let hydrated = false;
const listeners = new Set<() => void>();

function readFromStorage(): WishlistItem[] {
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
    // Private browsing / storage disabled - wishlist just won't survive a reload.
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

const EMPTY_ITEMS: WishlistItem[] = [];

function getServerSnapshot(): WishlistItem[] {
  return EMPTY_ITEMS;
}

function toggleWishlist(item: WishlistItem) {
  hydrate();
  const exists = items.some((i) => i.id === item.id);
  items = exists ? items.filter((i) => i.id !== item.id) : [...items, item];
  persist();
}

export function useWishlist() {
  const list = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const toggle = useCallback((item: WishlistItem) => toggleWishlist(item), []);
  const has = useCallback((id: string) => list.some((item) => item.id === id), [list]);
  return { items: list, toggle, has };
}
