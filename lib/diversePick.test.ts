import { describe, it, expect } from "vitest";
import { diversePick } from "./diversePick";

function item(id: string, category: string) {
  return { id, category };
}

describe("diversePick", () => {
  it("round-robins across categories instead of taking one category first", () => {
    const pool = [
      item("n1", "Necklace"),
      item("n2", "Necklace"),
      item("n3", "Necklace"),
      item("b1", "Bracelet"),
      item("r1", "Ring"),
    ];
    // CATEGORIES order is Nazariya, Bracelet, Bangle, Stud, Nose Pin,
    // Pendant, Chain, Anklet, Ring, Toe Ring, Necklace, Earrings — so
    // Bracelet and Ring should each get picked before a second Necklace.
    const picked = diversePick(pool, 3);
    expect(picked.map((p) => p.id)).toEqual(["b1", "r1", "n1"]);
  });

  it("excludes ids already spoken for", () => {
    const pool = [item("a", "Ring"), item("b", "Ring"), item("c", "Ring")];
    const picked = diversePick(pool, 2, new Set(["a"]));
    expect(picked.map((p) => p.id)).toEqual(["b", "c"]);
  });

  it("returns fewer than count if the pool runs out", () => {
    const pool = [item("a", "Ring")];
    expect(diversePick(pool, 5)).toHaveLength(1);
  });

  it("returns an empty array for an empty pool", () => {
    expect(diversePick([], 4)).toEqual([]);
  });

  it("falls back to a stable category order for categories outside the known taxonomy", () => {
    const pool = [item("x", "Brooch"), item("y", "Brooch"), item("z", "Anklet")];
    const picked = diversePick(pool, 3);
    // Anklet is in CATEGORIES, Brooch isn't — Anklet's single item comes
    // first, then the unknown category fills in after.
    expect(picked[0].id).toBe("z");
    expect(picked).toHaveLength(3);
  });
});
