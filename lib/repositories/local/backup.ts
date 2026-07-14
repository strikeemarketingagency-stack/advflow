import { getFilesDb, FILES_STORE, type FileRecord } from "@/lib/repositories/local/idb";
import { blobToDataUrl } from "@/lib/documents/asset-utils";

interface BackupFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  createdAt: string;
  dataUrl: string;
}

interface BackupPayload {
  version: 1;
  exportedAt: string;
  localStorage: Record<string, string>;
  files: BackupFile[];
}

export async function exportBackup(): Promise<string> {
  const localStorageData: Record<string, string> = {};
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (key && key.startsWith("advflow:")) {
      localStorageData[key] = window.localStorage.getItem(key) ?? "";
    }
  }

  const db = await getFilesDb();
  const records = (await db.getAll(FILES_STORE)) as FileRecord[];
  const files: BackupFile[] = await Promise.all(
    records.map(async (r) => ({
      id: r.id,
      name: r.name,
      mimeType: r.mimeType,
      size: r.size,
      createdAt: r.createdAt,
      dataUrl: await blobToDataUrl(r.blob),
    }))
  );

  const payload: BackupPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    localStorage: localStorageData,
    files,
  };

  return JSON.stringify(payload);
}

export async function importBackup(json: string): Promise<void> {
  const payload = JSON.parse(json) as BackupPayload;
  if (payload.version !== 1) throw new Error("Arquivo de backup incompatível.");

  Object.entries(payload.localStorage).forEach(([key, value]) => {
    window.localStorage.setItem(key, value);
  });

  const db = await getFilesDb();
  for (const file of payload.files) {
    const res = await fetch(file.dataUrl);
    const blob = await res.blob();
    const record: FileRecord = {
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      size: file.size,
      blob,
      createdAt: file.createdAt,
    };
    await db.put(FILES_STORE, record);
  }
}
