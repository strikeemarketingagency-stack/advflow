import { Office, OfficeInput, OfficeRepository, RepoError } from "@/lib/repositories/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { getCurrentUserId } from "@/lib/repositories/local/session";

interface OfficeRow {
  user_id: string;
  lawyer_name: string;
  oab: string;
  specialty: string;
  office_name: string;
  state: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  footer_text: string;
  logo_path: string | null;
  signature_path: string | null;
  onboarding_complete: boolean;
  criado_em: string;
  atualizado_em: string;
}

function toOffice(row: OfficeRow): Office {
  return {
    userId: row.user_id,
    lawyerName: row.lawyer_name,
    oab: row.oab,
    specialty: row.specialty,
    officeName: row.office_name,
    state: row.state,
    city: row.city,
    address: row.address,
    phone: row.phone,
    email: row.email,
    footerText: row.footer_text,
    logoFileId: row.logo_path,
    signatureFileId: row.signature_path,
    onboardingComplete: row.onboarding_complete,
    createdAt: row.criado_em,
    updatedAt: row.atualizado_em,
  };
}

class SupabaseOfficeRepository implements OfficeRepository {
  async get(): Promise<Office | null> {
    const supabase = getSupabaseBrowserClient();
    const userId = getCurrentUserId();
    const { data, error } = await supabase.from("office").select("*").eq("user_id", userId).maybeSingle();
    if (error) throw new RepoError("supabase_error", error.message);
    return data ? toOffice(data as OfficeRow) : null;
  }

  // Replica a semântica de merge parcial do repo local: cada campo ausente
  // em `input` preserva o valor já salvo (não é um upsert cego dos campos
  // recebidos) — busca a linha atual antes de decidir o valor final.
  async save(input: Partial<OfficeInput> & { onboardingComplete?: boolean }): Promise<Office> {
    const supabase = getSupabaseBrowserClient();
    const userId = getCurrentUserId();
    const existing = await this.get();

    const merged = {
      user_id: userId,
      lawyer_name: input.lawyerName ?? existing?.lawyerName ?? "",
      oab: input.oab ?? existing?.oab ?? "",
      specialty: input.specialty ?? existing?.specialty ?? "",
      office_name: input.officeName ?? existing?.officeName ?? "",
      state: input.state ?? existing?.state ?? "",
      city: input.city ?? existing?.city ?? "",
      address: input.address ?? existing?.address ?? "",
      phone: input.phone ?? existing?.phone ?? "",
      email: input.email ?? existing?.email ?? "",
      footer_text: input.footerText ?? existing?.footerText ?? "",
      logo_path: input.logoFileId ?? existing?.logoFileId ?? null,
      signature_path: input.signatureFileId ?? existing?.signatureFileId ?? null,
      onboarding_complete: input.onboardingComplete ?? existing?.onboardingComplete ?? false,
    };

    const { data, error } = await supabase
      .from("office")
      .upsert(merged, { onConflict: "user_id" })
      .select("*")
      .single();
    if (error) throw new RepoError("supabase_error", error.message);
    return toOffice(data as OfficeRow);
  }
}

export const supabaseOfficeRepo = new SupabaseOfficeRepository();
