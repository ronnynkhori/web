/**
 * Portuguese for the Control Room, keyed by the English text.
 * Split by area so each part stays readable; later parts win on duplicates.
 * Legacy `fr` tables are ignored.
 */
import content from "./content";
import live from "./live";
import pages from "./pages";
import shell from "./shell";

export type Catalog = Record<string, string>;
export type CatalogPart = { pt: Catalog; fr?: Catalog };

const parts: CatalogPart[] = [shell, content, live, pages];

export const catalog: { pt: Catalog } = {
  pt: Object.assign({}, ...parts.map((p) => p.pt)),
};
