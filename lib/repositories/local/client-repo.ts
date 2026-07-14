import {
  Client,
  ClientFileRef,
  ClientInput,
  ClientRepository,
  RepoError,
} from "@/lib/repositories/types";
import { readJson, writeJson, newId, nowIso } from "@/lib/repositories/local/json-store";
import { userKey } from "@/lib/repositories/local/storage-keys";
import { getCurrentUserId } from "@/lib/repositories/local/session";

function key(userId: string) {
  return userKey(userId, "clients");
}

function getAll(userId: string): Client[] {
  return readJson<Client[]>(key(userId), []);
}

function saveAll(userId: string, clients: Client[]) {
  writeJson(key(userId), clients);
}

class LocalClientRepository implements ClientRepository {
  async list(): Promise<Client[]> {
    const userId = getCurrentUserId();
    return getAll(userId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async get(id: string): Promise<Client | null> {
    const userId = getCurrentUserId();
    return getAll(userId).find((c) => c.id === id) ?? null;
  }

  async create(input: ClientInput): Promise<Client> {
    const userId = getCurrentUserId();
    const now = nowIso();
    const client: Client = {
      id: newId(),
      userId,
      files: [],
      createdAt: now,
      updatedAt: now,
      ...input,
    };
    const all = getAll(userId);
    saveAll(userId, [...all, client]);
    return client;
  }

  async update(id: string, input: Partial<ClientInput>): Promise<Client> {
    const userId = getCurrentUserId();
    const all = getAll(userId);
    const index = all.findIndex((c) => c.id === id);
    if (index === -1) throw new RepoError("not_found", "Cliente não encontrado.");
    const updated: Client = { ...all[index], ...input, updatedAt: nowIso() };
    all[index] = updated;
    saveAll(userId, all);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const userId = getCurrentUserId();
    saveAll(userId, getAll(userId).filter((c) => c.id !== id));
  }

  async addFile(id: string, file: Omit<ClientFileRef, "id" | "createdAt">): Promise<Client> {
    const userId = getCurrentUserId();
    const all = getAll(userId);
    const index = all.findIndex((c) => c.id === id);
    if (index === -1) throw new RepoError("not_found", "Cliente não encontrado.");
    const fileRef: ClientFileRef = { ...file, id: newId(), createdAt: nowIso() };
    const updated: Client = {
      ...all[index],
      files: [...all[index].files, fileRef],
      updatedAt: nowIso(),
    };
    all[index] = updated;
    saveAll(userId, all);
    return updated;
  }

  async removeFile(id: string, fileRefId: string): Promise<Client> {
    const userId = getCurrentUserId();
    const all = getAll(userId);
    const index = all.findIndex((c) => c.id === id);
    if (index === -1) throw new RepoError("not_found", "Cliente não encontrado.");
    const updated: Client = {
      ...all[index],
      files: all[index].files.filter((f) => f.id !== fileRefId),
      updatedAt: nowIso(),
    };
    all[index] = updated;
    saveAll(userId, all);
    return updated;
  }
}

export const localClientRepo = new LocalClientRepository();
