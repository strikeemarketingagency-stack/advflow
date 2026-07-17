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
import { supabaseOfficeRepo } from "@/lib/repositories/supabase/office-repo";
import { supabaseClientRepo } from "@/lib/repositories/supabase/client-repo";
import { supabaseTemplateRepo } from "@/lib/repositories/supabase/template-repo";
import { supabaseDocumentRepo } from "@/lib/repositories/supabase/document-repo";
import { supabaseActivityRepo } from "@/lib/repositories/supabase/activity-repo";
import { supabaseStorageRepo } from "@/lib/repositories/supabase/storage-repo";

// Single swap point. NEXT_PUBLIC_DATA_BACKEND=supabase swaps every repo for
// its real Postgres/Storage-backed implementation at once — auth, office,
// clientes, modelos, documentos, atividade e storage. Default ("mock", or
// the var unset) keeps everything on the browser (localStorage/IndexedDB),
// exactly as before this repo existed. Every other file in the app imports
// repos from here, never from local/ or supabase/ directly, so this is the
// only place a future change to how backends are selected needs to happen.
//
// Note: this project previously had a Lastlink payment webhook
// (app/api/webhooks/lastlink/route.ts) that auto-created a Supabase account
// on purchase via admin.auth.admin.inviteUserByEmail. That flow has been
// discontinued and the route removed — post-purchase account access will be
// handled by a separate membership-area platform (out of scope for this
// repo for now). This authRepo swap point is unrelated infra and stays.
const BACKEND = process.env.NEXT_PUBLIC_DATA_BACKEND ?? "mock";
const useSupabase = BACKEND === "supabase";

export const authRepo: AuthRepository = useSupabase ? supabaseAuthRepo : localAuthRepo;
export const officeRepo: OfficeRepository = useSupabase ? supabaseOfficeRepo : localOfficeRepo;
export const clientRepo: ClientRepository = useSupabase ? supabaseClientRepo : localClientRepo;
export const templateRepo: TemplateRepository = useSupabase ? supabaseTemplateRepo : localTemplateRepo;
export const documentRepo: DocumentRepository = useSupabase ? supabaseDocumentRepo : localDocumentRepo;
export const activityRepo: ActivityRepository = useSupabase ? supabaseActivityRepo : localActivityRepo;
export const storageRepo: StorageRepository = useSupabase ? supabaseStorageRepo : localStorageRepo;

export * from "@/lib/repositories/types";
