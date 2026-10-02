// Tiny IndexedDB wrapper for videos saved on this device.
// Metadata is stored alongside the files so the library works with no network.

export type OfflineVideo = {
  id: string;
  title: string;
  artist: string;
  video: Blob;
  thumbnail: Blob | null;
  size: number;
  savedAt: string;
};

const DB_NAME = "reel-offline";
const STORE = "videos";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "id" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const req = fn(db.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export const offlineDb = {
  list: () => run<OfflineVideo[]>("readonly", (s) => s.getAll()),
  get: (id: string) => run<OfflineVideo | undefined>("readonly", (s) => s.get(id)),
  put: (item: OfflineVideo) => run("readwrite", (s) => s.put(item)),
  remove: (id: string) => run("readwrite", (s) => s.delete(id)),
};
