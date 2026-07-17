import {
  DocumentInput,
  DocumentRepository,
  GeneratedDocument,
  RepoError,
} from "@/lib/repositories/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { getCurrentUserId } from "@/lib/repositories/local/session";

interface DocumentRow {
  id: string;
  perfil_id: string;
  cliente_id: string | null;
  cliente_nome: string;
  modelo_id: string | null;
  modelo_nome: string;
  categoria: string;
  status: GeneratedDocument["status"];
  blocks: GeneratedDocument["blocks"];
  field_values: GeneratedDocument["fieldValues"];
  criado_em: string;
  atualizado_em: string;
}

function toDocument(row: DocumentRow): GeneratedDocument {
  return {
    id: row.id,
    userId: row.perfil_id,
    clientId: row.cliente_id,
    clientName: row.cliente_nome,
    templateId: row.modelo_id,
    templateName: row.modelo_nome,
    category: row.categoria as GeneratedDocument["category"],
    status: row.status,
    blocks: row.blocks,
    fieldValues: row.field_values,
    createdAt: row.criado_em,
    updatedAt: row.atualizado_em,
  };
}

class SupabaseDocumentRepository implements DocumentRepository {
  async list(): Promise<GeneratedDocument[]> {
    const supabase = getSupabaseBrowserClient();
    const userId = getCurrentUserId();
    const { data, error } = await supabase
      .from("documentos")
      .select("*")
      .eq("perfil_id", userId)
      .order("atualizado_em", { ascending: false });
    if (error) throw new RepoError("supabase_error", error.message);
    return (data as DocumentRow[]).map(toDocument);
  }

  async get(id: string): Promise<GeneratedDocument | null> {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.from("documentos").select("*").eq("id", id).maybeSingle();
    if (error) throw new RepoError("supabase_error", error.message);
    return data ? toDocument(data as DocumentRow) : null;
  }

  // clientName/templateName são gravados como snapshot no momento da
  // criação (não via join) — igual ao modo local: um documento já gerado
  // não deve mudar de nome se o cliente/modelo original for editado ou
  // removido depois.
  async create(input: DocumentInput): Promise<GeneratedDocument> {
    const supabase = getSupabaseBrowserClient();
    const userId = getCurrentUserId();
    const { data, error } = await supabase
      .from("documentos")
      .insert({
        perfil_id: userId,
        cliente_id: input.clientId,
        cliente_nome: input.clientName,
        modelo_id: input.templateId,
        modelo_nome: input.templateName,
        categoria: input.category,
        status: input.status,
        blocks: input.blocks,
        field_values: input.fieldValues,
      })
      .select("*")
      .single();
    if (error) throw new RepoError("supabase_error", error.message);
    return toDocument(data as DocumentRow);
  }

  async update(id: string, input: Partial<DocumentInput>): Promise<GeneratedDocument> {
    const supabase = getSupabaseBrowserClient();
    const patch: Record<string, unknown> = {};
    if (input.clientId !== undefined) patch.cliente_id = input.clientId;
    if (input.clientName !== undefined) patch.cliente_nome = input.clientName;
    if (input.templateId !== undefined) patch.modelo_id = input.templateId;
    if (input.templateName !== undefined) patch.modelo_nome = input.templateName;
    if (input.category !== undefined) patch.categoria = input.category;
    if (input.status !== undefined) patch.status = input.status;
    if (input.blocks !== undefined) patch.blocks = input.blocks;
    if (input.fieldValues !== undefined) patch.field_values = input.fieldValues;
    patch.atualizado_em = new Date().toISOString();

    const { data, error } = await supabase.from("documentos").update(patch).eq("id", id).select("*").maybeSingle();
    if (error) throw new RepoError("supabase_error", error.message);
    if (!data) throw new RepoError("not_found", "Documento não encontrado.");
    return toDocument(data as DocumentRow);
  }

  async duplicate(id: string): Promise<GeneratedDocument> {
    const source = await this.get(id);
    if (!source) throw new RepoError("not_found", "Documento não encontrado.");
    const supabase = getSupabaseBrowserClient();
    const userId = getCurrentUserId();
    const { data, error } = await supabase
      .from("documentos")
      .insert({
        perfil_id: userId,
        cliente_id: source.clientId,
        cliente_nome: source.clientName,
        modelo_id: source.templateId,
        modelo_nome: source.templateName,
        categoria: source.category,
        // Sempre volta pra rascunho, igual ao modo local, independente do
        // status da fonte.
        status: "rascunho",
        blocks: source.blocks,
        field_values: source.fieldValues,
      })
      .select("*")
      .single();
    if (error) throw new RepoError("supabase_error", error.message);
    return toDocument(data as DocumentRow);
  }

  async remove(id: string): Promise<void> {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from("documentos").delete().eq("id", id);
    if (error) throw new RepoError("supabase_error", error.message);
  }

  async listByClient(clientId: string): Promise<GeneratedDocument[]> {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("documentos")
      .select("*")
      .eq("cliente_id", clientId)
      .order("atualizado_em", { ascending: false });
    if (error) throw new RepoError("supabase_error", error.message);
    return (data as DocumentRow[]).map(toDocument);
  }
}

export const supabaseDocumentRepo = new SupabaseDocumentRepository();
