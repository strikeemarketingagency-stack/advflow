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
import {
  SupabaseAuthRepository,
  SupabaseOfficeRepository,
  SupabaseClientRepository,
  SupabaseTemplateRepository,
  SupabaseDocumentRepository,
  SupabaseActivityRepository,
  SupabaseStorageRepository,
} from "@/lib/repositories/supabase/not-implemented";

// Single swap point: set NEXT_PUBLIC_DATA_BACKEND=supabase once a real
// Supabase project is wired up in lib/repositories/supabase/. Every other
// file in the app imports repos from here, never from local/ or supabase/
// directly, so the swap requires no call-site changes.
const BACKEND = process.env.NEXT_PUBLIC_DATA_BACKEND ?? "mock";
const useSupabase = BACKEND === "supabase";

export const authRepo: AuthRepository = useSupabase ? new SupabaseAuthRepository() : localAuthRepo;
export const officeRepo: OfficeRepository = useSupabase ? new SupabaseOfficeRepository() : localOfficeRepo;
export const clientRepo: ClientRepository = useSupabase ? new SupabaseClientRepository() : localClientRepo;
export const templateRepo: TemplateRepository = useSupabase ? new SupabaseTemplateRepository() : localTemplateRepo;
export const documentRepo: DocumentRepository = useSupabase ? new SupabaseDocumentRepository() : localDocumentRepo;
export const activityRepo: ActivityRepository = useSupabase ? new SupabaseActivityRepository() : localActivityRepo;
export const storageRepo: StorageRepository = useSupabase ? new SupabaseStorageRepository() : localStorageRepo;

export * from "@/lib/repositories/types";
