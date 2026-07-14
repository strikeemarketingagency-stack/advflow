import { openDB, type IDBPDatabase } from "idb";

export interface FileRecord {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  blob: Blob;
  createdAt: string;
}

const DB_NAME = "advflow-files";
const STORE_NAME = "files";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

export function getFilesDb(): Promise<IDBPDatabase> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("IndexedDB unavailable on the server"));
  }
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
}

export const FILES_STORE = STORE_NAME;
