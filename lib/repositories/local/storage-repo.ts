import { StorageRepository, StoredFile } from "@/lib/repositories/types";
import { newId, nowIso } from "@/lib/repositories/local/json-store";
import { getFilesDb, FILES_STORE, type FileRecord } from "@/lib/repositories/local/idb";

class LocalStorageRepository implements StorageRepository {
  async upload(file: File | Blob, name: string, mimeType: string): Promise<StoredFile> {
    const db = await getFilesDb();
    const record: FileRecord = {
      id: newId(),
      name,
      mimeType,
      size: file.size,
      blob: file,
      createdAt: nowIso(),
    };
    await db.put(FILES_STORE, record);
    return { id: record.id, name: record.name, mimeType: record.mimeType, size: record.size, createdAt: record.createdAt };
  }

  async getUrl(fileId: string): Promise<string | null> {
    const blob = await this.getBlob(fileId);
    if (!blob) return null;
    return URL.createObjectURL(blob);
  }

  async getBlob(fileId: string): Promise<Blob | null> {
    const db = await getFilesDb();
    const record = (await db.get(FILES_STORE, fileId)) as FileRecord | undefined;
    return record?.blob ?? null;
  }

  async remove(fileId: string): Promise<void> {
    const db = await getFilesDb();
    await db.delete(FILES_STORE, fileId);
  }
}

export const localStorageRepo = new LocalStorageRepository();
