import {
  RepoError,
  Template,
  TemplateInput,
  TemplateRepository,
} from "@/lib/repositories/types";
import { readJson, writeJson, newId, nowIso } from "@/lib/repositories/local/json-store";
import { userKey } from "@/lib/repositories/local/storage-keys";
import { getCurrentUserId } from "@/lib/repositories/local/session";
import { builtinTemplates } from "@/lib/seed/templates";

function key(userId: string) {
  return userKey(userId, "templates");
}

function getAll(userId: string): Template[] {
  const existing = readJson<Template[] | null>(key(userId), null);
  if (existing) return existing;
  const seeded = builtinTemplates(userId);
  writeJson(key(userId), seeded);
  return seeded;
}

function saveAll(userId: string, templates: Template[]) {
  writeJson(key(userId), templates);
}

class LocalTemplateRepository implements TemplateRepository {
  async list(): Promise<Template[]> {
    const userId = getCurrentUserId();
    return getAll(userId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async get(id: string): Promise<Template | null> {
    const userId = getCurrentUserId();
    return getAll(userId).find((t) => t.id === id) ?? null;
  }

  async create(input: TemplateInput): Promise<Template> {
    const userId = getCurrentUserId();
    const now = nowIso();
    const template: Template = {
      id: newId(),
      userId,
      isFavorite: false,
      isBuiltin: false,
      createdAt: now,
      updatedAt: now,
      ...input,
    };
    const all = getAll(userId);
    saveAll(userId, [...all, template]);
    return template;
  }

  async update(id: string, input: Partial<TemplateInput>): Promise<Template> {
    const userId = getCurrentUserId();
    const all = getAll(userId);
    const index = all.findIndex((t) => t.id === id);
    if (index === -1) throw new RepoError("not_found", "Modelo não encontrado.");
    const updated: Template = { ...all[index], ...input, updatedAt: nowIso() };
    all[index] = updated;
    saveAll(userId, all);
    return updated;
  }

  async duplicate(id: string): Promise<Template> {
    const userId = getCurrentUserId();
    const all = getAll(userId);
    const source = all.find((t) => t.id === id);
    if (!source) throw new RepoError("not_found", "Modelo não encontrado.");
    const now = nowIso();
    const copy: Template = {
      ...source,
      id: newId(),
      name: `${source.name} (cópia)`,
      isBuiltin: false,
      isFavorite: false,
      createdAt: now,
      updatedAt: now,
    };
    saveAll(userId, [...all, copy]);
    return copy;
  }

  async remove(id: string): Promise<void> {
    const userId = getCurrentUserId();
    saveAll(userId, getAll(userId).filter((t) => t.id !== id));
  }

  async toggleFavorite(id: string): Promise<Template> {
    const userId = getCurrentUserId();
    const all = getAll(userId);
    const index = all.findIndex((t) => t.id === id);
    if (index === -1) throw new RepoError("not_found", "Modelo não encontrado.");
    const updated: Template = {
      ...all[index],
      isFavorite: !all[index].isFavorite,
      updatedAt: nowIso(),
    };
    all[index] = updated;
    saveAll(userId, all);
    return updated;
  }
}

export const localTemplateRepo = new LocalTemplateRepository();
