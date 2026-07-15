import {
  ActivityRepository,
  AuthRepository,
  ClientRepository,
  DocumentRepository,
  OfficeRepository,
  StorageRepository,
  TemplateRepository,
} from "@/lib/repositories/types";
import { localAuthRepo } from "@/lib/repositories/local/auth-repo";
import { localOfficeRepo } from "@/lib/repositories/local/office-repo";
import { localClientRepo } from "@/lib/repositories/local/client-repo";
import { localTemplateRepo } from "@/lib/repositories/local/template-repo";
import { localDocumentRepo } from "@/lib/repositories/local/document-repo";
import { localActivityRepo } from "@/lib/repositories/local/activity-repo";
import { localStorageRepo } from "@/lib/repositories/local/storage-repo";
import { supabaseAuthRepo } from "@/lib/repositories/supabase/auth-repo";

// Single swap point. NEXT_PUBLIC_DATA_BACKEND=supabase today only swaps
// `authRepo` for the real Supabase-backed implementation (needed so accounts
// created server-side by the Lastlink webhook can actually log in) — the
// other repositories still live in the browser (localStorage/IndexedDB)
// until they get their own Supabase implementation in
// lib/repositories/supabase/not-implemented.ts. Every other file in the app
// imports repos from here, never from local/ or supabase/ directly, so each
// future swap requires no call-site changes.
const BACKEND = process.env.NEXT_PUBLIC_DATA_BACKEND ?? "mock";
const useSupabaseAuth = BACKEND === "supabase";

export const authRepo: AuthRepository = useSupabaseAuth ? supabaseAuthRepo : localAuthRepo;
export const officeRepo: OfficeRepository = localOfficeRepo;
export const clientRepo: ClientRepository = localClientRepo;
export const templateRepo: TemplateRepository = localTemplateRepo;
export const documentRepo: DocumentRepository = localDocumentRepo;
export const activityRepo: ActivityRepository = localActivityRepo;
export const storageRepo: StorageRepository = localStorageRepo;

export * from "@/lib/repositories/types";
