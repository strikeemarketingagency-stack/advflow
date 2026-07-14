import {
  ActivityRepository,
  AuthRepository,
  ClientRepository,
  DocumentRepository,
  OfficeRepository,
  RepoError,
  StorageRepository,
  TemplateRepository,
} from "@/lib/repositories/types";

// Stubs for the future Supabase-backed implementation. Swapping the mock
// data layer for real Supabase auth/DB/storage means implementing these
// classes against `@supabase/supabase-js` and flipping
// NEXT_PUBLIC_DATA_BACKEND=supabase in lib/repositories/index.ts — no
// call site elsewhere in the app should need to change.

function notImplemented(): never {
  throw new RepoError("not_implemented", "Backend Supabase ainda não configurado.");
}

export class SupabaseAuthRepository implements AuthRepository {
  getSession(): Promise<never> { return notImplemented(); }
  signUp(): Promise<never> { return notImplemented(); }
  signIn(): Promise<never> { return notImplemented(); }
  signOut(): Promise<never> { return notImplemented(); }
  onAuthStateChange(): () => void { return notImplemented(); }
}

export class SupabaseOfficeRepository implements OfficeRepository {
  get(): Promise<never> { return notImplemented(); }
  save(): Promise<never> { return notImplemented(); }
}

export class SupabaseClientRepository implements ClientRepository {
  list(): Promise<never> { return notImplemented(); }
  get(): Promise<never> { return notImplemented(); }
  create(): Promise<never> { return notImplemented(); }
  update(): Promise<never> { return notImplemented(); }
  remove(): Promise<never> { return notImplemented(); }
  addFile(): Promise<never> { return notImplemented(); }
  removeFile(): Promise<never> { return notImplemented(); }
}

export class SupabaseTemplateRepository implements TemplateRepository {
  list(): Promise<never> { return notImplemented(); }
  get(): Promise<never> { return notImplemented(); }
  create(): Promise<never> { return notImplemented(); }
  update(): Promise<never> { return notImplemented(); }
  duplicate(): Promise<never> { return notImplemented(); }
  remove(): Promise<never> { return notImplemented(); }
  toggleFavorite(): Promise<never> { return notImplemented(); }
}

export class SupabaseDocumentRepository implements DocumentRepository {
  list(): Promise<never> { return notImplemented(); }
  get(): Promise<never> { return notImplemented(); }
  create(): Promise<never> { return notImplemented(); }
  update(): Promise<never> { return notImplemented(); }
  duplicate(): Promise<never> { return notImplemented(); }
  remove(): Promise<never> { return notImplemented(); }
  listByClient(): Promise<never> { return notImplemented(); }
}

export class SupabaseActivityRepository implements ActivityRepository {
  list(): Promise<never> { return notImplemented(); }
  log(): Promise<never> { return notImplemented(); }
}

export class SupabaseStorageRepository implements StorageRepository {
  upload(): Promise<never> { return notImplemented(); }
  getUrl(): Promise<never> { return notImplemented(); }
  getBlob(): Promise<never> { return notImplemented(); }
  remove(): Promise<never> { return notImplemented(); }
}
