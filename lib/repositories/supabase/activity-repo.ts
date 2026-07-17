import { ActivityItem, ActivityRepository, ActivityType, RepoError } from "@/lib/repositories/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { getCurrentUserId } from "@/lib/repositories/local/session";

interface ActivityRow {
  id: string;
  perfil_id: string;
  tipo: string;
  mensagem: string;
  entidade_id: string | null;
  criado_em: string;
}

function toActivity(row: ActivityRow): ActivityItem {
  return {
    id: row.id,
    userId: row.perfil_id,
    type: row.tipo as ActivityType,
    message: row.mensagem,
    entityId: row.entidade_id,
    createdAt: row.criado_em,
  };
}

class SupabaseActivityRepository implements ActivityRepository {
  // Sem o cap de 200 itens que o modo local aplicava na escrita — no
  // Postgres não há motivo pra truncar o histórico, um LIMIT na leitura já
  // resolve.
  async list(limit = 10): Promise<ActivityItem[]> {
    const supabase = getSupabaseBrowserClient();
    const userId = getCurrentUserId();
    const { data, error } = await supabase
      .from("atividades")
      .select("*")
      .eq("perfil_id", userId)
      .order("criado_em", { ascending: false })
      .limit(limit);
    if (error) throw new RepoError("supabase_error", error.message);
    return (data as ActivityRow[]).map(toActivity);
  }

  async log(type: ActivityType, message: string, entityId: string | null = null): Promise<ActivityItem> {
    const supabase = getSupabaseBrowserClient();
    const userId = getCurrentUserId();
    const { data, error } = await supabase
      .from("atividades")
      .insert({ perfil_id: userId, tipo: type, mensagem: message, entidade_id: entityId })
      .select("*")
      .single();
    if (error) throw new RepoError("supabase_error", error.message);
    return toActivity(data as ActivityRow);
  }
}

export const supabaseActivityRepo = new SupabaseActivityRepository();
