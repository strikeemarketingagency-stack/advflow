import { RepoError } from "@/lib/repositories/types";
import { readJson, writeJson, removeJson } from "@/lib/repositories/local/json-store";
import { SESSION_KEY } from "@/lib/repositories/local/storage-keys";

export interface StoredSession {
  userId: string;
  email: string;
}

export function getStoredSession(): StoredSession | null {
  return readJson<StoredSession | null>(SESSION_KEY, null);
}

export function setStoredSession(session: StoredSession | null) {
  if (session) writeJson(SESSION_KEY, session);
  else removeJson(SESSION_KEY);
}

export function getCurrentUserId(): string {
  const session = getStoredSession();
  if (!session) {
    throw new RepoError("unauthenticated", "Nenhuma sessão ativa encontrada.");
  }
  return session.userId;
}
