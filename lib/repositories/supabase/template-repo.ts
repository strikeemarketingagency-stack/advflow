import {
  RepoError,
  Template,
  TemplateInput,
  TemplateRepository,
} from "@/lib/repositories/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { getCurrentUserId } from "@/lib/repositories/local/session";

interface TemplateRow {
  id: string;
  perfil_id: string | null;
  titulo: string;
  categoria: string;
  blocks: Template["blocks"];
  variables: Template["variables"];
  is_favorite: boolean;
  is_modelo_sistema: boolean;
  criado_em: string;
  atualizado_em: string;
}

function toTemplate(row: TemplateRow): Template {
  return {
    id: row.id,
    userId: row.perfil_id ?? "",
    name: row.titulo,
    category: row.categoria as Template["category"],
    blocks: row.blocks,
    variables: row.variables,
    isFavorite: row.is_favorite,
    isBuiltin: row.is_modelo_sistema,
    createdAt: row.criado_em,
    updatedAt: row.atualizado_em,
  };
}

class SupabaseTemplateRepository implements TemplateRepository {
  // RLS já devolve: linhas do próprio usuário + linhas com
  // is_modelo_sistema=true (ver policy modelos_select_sistema) — não precisa
  // filtrar perfil_id explicitamente aqui, a policy faz o "OR" no banco.
  async list(): Promise<Template[]> {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("modelos")
      .select("*")
      .order("atualizado_em", { ascending: false });
    if (error) throw new RepoError("supabase_error", error.message);
    return (data as TemplateRow[]).map(toTemplate);
  }

  async get(id: string): Promise<Template | null> {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.from("modelos").select("*").eq("id", id).maybeSingle();
    if (error) throw new RepoError("supabase_error", error.message);
    return data ? toTemplate(data as TemplateRow) : null;
  }

  async create(input: TemplateInput): Promise<Template> {
    const supabase = getSupabaseBrowserClient();
    const userId = getCurrentUserId();
    const { data, error } = await supabase
      .from("modelos")
      .insert({
        perfil_id: userId,
        titulo: input.name,
        categoria: input.category,
        blocks: input.blocks,
        variables: input.variables,
        is_favorite: false,
        is_modelo_sistema: false,
      })
      .select("*")
      .single();
    if (error) {
      if (error.message.includes("Limite do plano")) {
        throw new RepoError("plan_limit", error.message);
      }
      throw new RepoError("supabase_error", error.message);
    }
    return toTemplate(data as TemplateRow);
  }

  async update(id: string, input: Partial<TemplateInput>): Promise<Template> {
    const supabase = getSupabaseBrowserClient();
    const patch: Record<string, unknown> = {};
    if (input.name !== undefined) patch.titulo = input.name;
    if (input.category !== undefined) patch.categoria = input.category;
    if (input.blocks !== undefined) patch.blocks = input.blocks;
    if (input.variables !== undefined) patch.variables = input.variables;
    patch.atualizado_em = new Date().toISOString();

    const { data, error } = await supabase.from("modelos").update(patch).eq("id", id).select("*").maybeSingle();
    if (error) throw new RepoError("supabase_error", error.message);
    if (!data) throw new RepoError("not_found", "Modelo não encontrado.");
    return toTemplate(data as TemplateRow);
  }

  // Duplicar um modelo de sistema cria uma cópia própria do usuário
  // (perfil_id = auth.uid(), is_modelo_sistema = false) — mesma regra que o
  // modo local já tinha ("duplicate força isBuiltin false"), só que agora
  // também vale pra modelos compartilhados, não só cópias por usuário.
  async duplicate(id: string): Promise<Template> {
    const source = await this.get(id);
    if (!source) throw new RepoError("not_found", "Modelo não encontrado.");
    const supabase = getSupabaseBrowserClient();
    const userId = getCurrentUserId();
    const { data, error } = await supabase
      .from("modelos")
      .insert({
        perfil_id: userId,
        titulo: `${source.name} (cópia)`,
        categoria: source.category,
        blocks: source.blocks,
        variables: source.variables,
        is_favorite: false,
        is_modelo_sistema: false,
      })
      .select("*")
      .single();
    if (error) {
      if (error.message.includes("Limite do plano")) {
        throw new RepoError("plan_limit", error.message);
      }
      throw new RepoError("supabase_error", error.message);
    }
    return toTemplate(data as TemplateRow);
  }

  async remove(id: string): Promise<void> {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from("modelos").delete().eq("id", id);
    if (error) throw new RepoError("supabase_error", error.message);
  }

  async toggleFavorite(id: string): Promise<Template> {
    const current = await this.get(id);
    if (!current) throw new RepoError("not_found", "Modelo não encontrado.");
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("modelos")
      .update({ is_favorite: !current.isFavorite, atualizado_em: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (error) throw new RepoError("supabase_error", error.message);
    if (!data) throw new RepoError("not_found", "Modelo não encontrado.");
    return toTemplate(data as TemplateRow);
  }
}

export const supabaseTemplateRepo = new SupabaseTemplateRepository();
