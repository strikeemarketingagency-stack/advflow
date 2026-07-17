import {
  AuthRepository,
  AuthSession,
  AuthStateListener,
  RepoError,
} from "@/lib/repositories/types";
import { readJson, writeJson, newId, nowIso } from "@/lib/repositories/local/json-store";
import { USERS_KEY } from "@/lib/repositories/local/storage-keys";
import { getStoredSession, setStoredSession } from "@/lib/repositories/local/session";
import { hashPassword } from "@/lib/repositories/local/hash";

interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

function getUsers(): StoredUser[] {
  return readJson<StoredUser[]>(USERS_KEY, []);
}

function saveUsers(users: StoredUser[]) {
  writeJson(USERS_KEY, users);
}

function toSession(user: StoredUser): AuthSession {
  return { user: { id: user.id, email: user.email, createdAt: user.createdAt } };
}

class LocalAuthRepository implements AuthRepository {
  private listeners = new Set<AuthStateListener>();

  private emit(session: AuthSession | null) {
    this.listeners.forEach((listener) => listener(session));
  }

  async getSession(): Promise<AuthSession | null> {
    const stored = getStoredSession();
    if (!stored) return null;
    const user = getUsers().find((u) => u.id === stored.userId);
    if (!user) return null;
    return toSession(user);
  }

  async signUp(email: string, password: string): Promise<AuthSession> {
    const normalizedEmail = email.trim().toLowerCase();
    const users = getUsers();
    if (users.some((u) => u.email === normalizedEmail)) {
      throw new RepoError("email_taken", "Já existe uma conta com este email.");
    }
    const user: StoredUser = {
      id: newId(),
      email: normalizedEmail,
      passwordHash: await hashPassword(password),
      createdAt: nowIso(),
    };
    saveUsers([...users, user]);
    setStoredSession({ userId: user.id, email: user.email });
    const session = toSession(user);
    this.emit(session);
    return session;
  }

  async signIn(email: string, password: string): Promise<AuthSession> {
    const normalizedEmail = email.trim().toLowerCase();
    const users = getUsers();
    const user = users.find((u) => u.email === normalizedEmail);
    const passwordHash = await hashPassword(password);
    if (!user || user.passwordHash !== passwordHash) {
      throw new RepoError("invalid_credentials", "Email ou senha incorretos.");
    }
    setStoredSession({ userId: user.id, email: user.email });
    const session = toSession(user);
    this.emit(session);
    return session;
  }

  async signOut(): Promise<void> {
    setStoredSession(null);
    this.emit(null);
  }

  onAuthStateChange(listener: AuthStateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async requestPasswordReset(): Promise<void> {
    throw new RepoError(
      "not_implemented",
      "Recuperação de senha não está disponível no modo de demonstração."
    );
  }

  async updatePassword(): Promise<void> {
    throw new RepoError(
      "not_implemented",
      "Recuperação de senha não está disponível no modo de demonstração."
    );
  }
}

export const localAuthRepo = new LocalAuthRepository();
