import {
  DocumentInput,
  DocumentRepository,
  GeneratedDocument,
  RepoError,
} from "@/lib/repositories/types";
import { readJson, writeJson, newId, nowIso } from "@/lib/repositories/local/json-store";
import { userKey } from "@/lib/repositories/local/storage-keys";
import { getCurrentUserId } from "@/lib/repositories/local/session";

function key(userId: string) {
  return userKey(userId, "documents");
}

function getAll(userId: string): GeneratedDocument[] {
  return readJson<GeneratedDocument[]>(key(userId), []);
}

function saveAll(userId: string, docs: GeneratedDocument[]) {
  writeJson(key(userId), docs);
}

class LocalDocumentRepository implements DocumentRepository {
  async list(): Promise<GeneratedDocument[]> {
    const userId = getCurrentUserId();
    return getAll(userId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async get(id: string): Promise<GeneratedDocument | null> {
    const userId = getCurrentUserId();
    return getAll(userId).find((d) => d.id === id) ?? null;
  }

  async create(input: DocumentInput): Promise<GeneratedDocument> {
    const userId = getCurrentUserId();
    const now = nowIso();
    const doc: GeneratedDocument = {
      id: newId(),
      userId,
      createdAt: now,
      updatedAt: now,
      ...input,
    };
    const all = getAll(userId);
    saveAll(userId, [...all, doc]);
    return doc;
  }

  async update(id: string, input: Partial<DocumentInput>): Promise<GeneratedDocument> {
    const userId = getCurrentUserId();
    const all = getAll(userId);
    const index = all.findIndex((d) => d.id === id);
    if (index === -1) throw new RepoError("not_found", "Documento não encontrado.");
    const updated: GeneratedDocument = { ...all[index], ...input, updatedAt: nowIso() };
    all[index] = updated;
    saveAll(userId, all);
    return updated;
  }

  async duplicate(id: string): Promise<GeneratedDocument> {
    const userId = getCurrentUserId();
    const all = getAll(userId);
    const source = all.find((d) => d.id === id);
    if (!source) throw new RepoError("not_found", "Documento não encontrado.");
    const now = nowIso();
    const copy: GeneratedDocument = {
      ...source,
      id: newId(),
      status: "rascunho",
      createdAt: now,
      updatedAt: now,
    };
    saveAll(userId, [...all, copy]);
    return copy;
  }

  async remove(id: string): Promise<void> {
    const userId = getCurrentUserId();
    saveAll(userId, getAll(userId).filter((d) => d.id !== id));
  }

  async listByClient(clientId: string): Promise<GeneratedDocument[]> {
    const userId = getCurrentUserId();
    return getAll(userId)
      .filter((d) => d.clientId === clientId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
}

export const localDocumentRepo = new LocalDocumentRepository();
