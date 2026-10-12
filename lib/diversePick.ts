import { CATEGORIES } from "@/lib/catalog";

export type DiversePickItem = { id: string; category: string };

export function diversePick<T extends DiversePickItem>(
  pool: T[],
  count: number,
  exclude: Set<string> = new Set()
): T[] {
  const available = pool.filter((p) => !exclude.has(p.id));
  const byCategory = new Map<string, T[]>();
  for (const p of available) {
    if (!byCategory.has(p.category)) byCategory.set(p.category, []);
    byCategory.get(p.category)!.push(p);
  }
  const extraCategories = Array.from(byCategory.keys()).filter(
    (c) => !(CATEGORIES as readonly string[]).includes(c)
  );
  const categoryOrder = [...CATEGORIES, ...extraCategories];

  const result: T[] = [];
  for (let round = 0; result.length < count && round < 20; round++) {
    for (const cat of categoryOrder) {
      const group = byCategory.get(cat);
      if (group && group[round]) {
        result.push(group[round]);
        if (result.length >= count) break;
      }
    }
  }
  return result;
}
