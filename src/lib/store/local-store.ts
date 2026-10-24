import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { AuditEntry, Collection, Store, StoredDoc, UploadTarget } from "./types";

interface FileShape {
  collections: Partial<Record<Collection, Record<string, StoredDoc>>>;
  audit: AuditEntry[];
}

// Literal paths only: a computed path makes the build trace the whole project.
export const LOCAL_DATA_DIR =
  process.env.E2E_STORE === "1" ? path.join(process.cwd(), ".data-e2e") : path.join(process.cwd(), ".data");
const FILE = path.join(LOCAL_DATA_DIR, "store.json");
const AUDIT_LIMIT = 2000;

let queue: Promise<unknown> = Promise.resolve();

async function load(): Promise<FileShape> {
  try {
    return JSON.parse(await readFile(FILE, "utf8")) as FileShape;
  } catch {
    return { collections: {}, audit: [] };
  }
}

/** Serialises writes so concurrent saves in one process never clobber each other. */
function mutate(fn: (data: FileShape) => void): Promise<void> {
  const next = queue.then(async () => {
    const data = await load();
    fn(data);
    await mkdir(LOCAL_DATA_DIR, { recursive: true });
    await writeFile(FILE, JSON.stringify(data, null, 2), "utf8");
  });
  queue = next.catch(() => undefined);
  return next;
}

const sorted = <T extends StoredDoc>(items: Record<string, StoredDoc>) =>
  (Object.values(items) as T[]).sort((a, b) => (a._order ?? 0) - (b._order ?? 0));

/** Development store: a JSON file in .data/. Uploads land in .data/uploads and are served from /uploads. */
export class LocalStore implements Store {
  readonly kind = "local" as const;
  readonly writable = !process.env.VERCEL;

  async list<T extends StoredDoc>(collection: Collection): Promise<T[] | null> {
    const items = (await load()).collections[collection];
    return items ? sorted<T>(items) : null;
  }

  async get<T extends StoredDoc>(collection: Collection, id: string): Promise<T | null> {
    return ((await load()).collections[collection]?.[id] as T | undefined) ?? null;
  }

  put<T extends StoredDoc>(collection: Collection, doc: T, actor: string): Promise<void> {
    return mutate((data) => {
      const items = (data.collections[collection] ??= {});
      items[doc.id] = { ...doc, _updatedAt: new Date().toISOString(), _updatedBy: actor };
    });
  }

  remove(collection: Collection, id: string): Promise<void> {
    return mutate((data) => {
      delete data.collections[collection]?.[id];
    });
  }

  replaceAll<T extends StoredDoc>(collection: Collection, docs: T[], actor: string): Promise<void> {
    const at = new Date().toISOString();
    return mutate((data) => {
      data.collections[collection] = Object.fromEntries(
        docs.map((d, i) => [d.id, { ...d, _order: d._order ?? i, _updatedAt: at, _updatedBy: actor }]),
      );
    });
  }

  audit(entry: Omit<AuditEntry, "at">): Promise<void> {
    return mutate((data) => {
      data.audit.unshift({ ...entry, at: new Date().toISOString() });
      data.audit.length = Math.min(data.audit.length, AUDIT_LIMIT);
    });
  }

  async listAudit(limit: number): Promise<AuditEntry[]> {
    return (await load()).audit.slice(0, limit);
  }

  async prepareUpload(filePath: string): Promise<UploadTarget> {
    return { kind: "local", endpoint: "/api/admin/upload", path: filePath, publicUrl: `/uploads/${filePath}` };
  }
}
