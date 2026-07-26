import { normalizeSearchText } from "@/lib/search-utils";

/** Gera um slug (`nome-do-exercicio`) a partir de um nome livre. */
export function slugify(name: string): string {
  return normalizeSearchText(name)
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
