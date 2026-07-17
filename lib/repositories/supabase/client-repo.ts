import {
  Client,
  ClientFileRef,
  ClientInput,
  ClientRepository,
  RepoError,
} from "@/lib/repositories/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { getCurrentUserId } from "@/lib/repositories/local/session";
import { supabaseStorageRepo } from "@/lib/repositories/supabase/storage-repo";

interface ClientFileRow {
  id: string;
  storage_path: string;
  name: string;
  mime_type: string;
  size: number;
  criado_em: string;
}

interface ClientRow {
  id: string;
  perfil_id: string;
  full_name: string;
  doc_number: string;
  rg: string;
  marital_status: string;
  profession: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  criado_em: string;
  atualizado_em: string;
  cliente_arquivos: ClientFileRow[];
}

const SELECT_WITH_FILES = "*, cliente_arquivos(*)";

function toFileRef(row: ClientFileRow): ClientFileRef {
  return {
    id: row.id,
    fileId: row.storage_path,
    name: row.name,
    mimeType: row.mime_type,
    size: row.size,
    createdAt: row.criado_em,
  };
}

function toClient(row: ClientRow): Client {
  return {
    id: row.id,
    userId: row.perfil_id,
    fullName: row.full_name,
    docNumber: row.doc_number,
    rg: row.rg,
    maritalStatus: row.marital_status as Client["maritalStatus"],
    profession: row.profession,
    phone: row.phone,
    email: row.email,
    address: row.address,
    notes: row.notes,
    files: (row.cliente_arquivos ?? []).map(toFileRef),
    createdAt: row.criado_em,
    updatedAt: row.atualizado_em,
  };
}

class SupabaseClientRepository implements ClientRepository {
  async list(): Promise<Client[]> {
    const supabase = getSupabaseBrowserClient();
    const userId = getCurrentUserId();
    const { data, error } = await supabase
      .from("clientes")
      .select(SELECT_WITH_FILES)
      .eq("perfil_id", userId)
      .order("atualizado_em", { ascending: false });
    if (error) throw new RepoError("supabase_error", error.message);
    return (data as unknown as ClientRow[]).map(toClient);
  }

  async get(id: string): Promise<Client | null> {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.from("clientes").select(SELECT_WITH_FILES).eq("id", id).maybeSingle();
    if (error) throw new RepoError("supabase_error", error.message);
    return data ? toClient(data as unknown as ClientRow) : null;
  }

  async create(input: ClientInput): Promise<Client> {
    const supabase = getSupabaseBrowserClient();
    const userId = getCurrentUserId();
    const { data, error } = await supabase
      .from("clientes")
      .insert({
        perfil_id: userId,
        full_name: input.fullName,
        doc_number: input.docNumber,
        rg: input.rg,
        marital_status: input.maritalStatus,
        profession: input.profession,
        phone: input.phone,
        email: input.email,
        address: input.address,
        notes: input.notes,
      })
      .select(SELECT_WITH_FILES)
      .single();
    // Trigger de limite de plano (supabase/migrations/0002_limites_plano.sql)
    // levanta uma exceção Postgres com mensagem amigável quando o plano
    // Básico atinge 30 clientes/mês — repassa como RepoError dedicado em vez
    // do genérico "supabase_error", pra quem chama poder tratar diferente.
    if (error) {
      if (error.message.includes("Limite do plano")) {
        throw new RepoError("plan_limit", error.message);
      }
      throw new RepoError("supabase_error", error.message);
    }
    return toClient(data as unknown as ClientRow);
  }

  async update(id: string, input: Partial<ClientInput>): Promise<Client> {
    const supabase = getSupabaseBrowserClient();
    const patch: Record<string, unknown> = {};
    if (input.fullName !== undefined) patch.full_name = input.fullName;
    if (input.docNumber !== undefined) patch.doc_number = input.docNumber;
    if (input.rg !== undefined) patch.rg = input.rg;
    if (input.maritalStatus !== undefined) patch.marital_status = input.maritalStatus;
    if (input.profession !== undefined) patch.profession = input.profession;
    if (input.phone !== undefined) patch.phone = input.phone;
    if (input.email !== undefined) patch.email = input.email;
    if (input.address !== undefined) patch.address = input.address;
    if (input.notes !== undefined) patch.notes = input.notes;
    patch.atualizado_em = new Date().toISOString();

    const { data, error } = await supabase
      .from("clientes")
      .update(patch)
      .eq("id", id)
      .select(SELECT_WITH_FILES)
      .maybeSingle();
    if (error) throw new RepoError("supabase_error", error.message);
    if (!data) throw new RepoError("not_found", "Cliente não encontrado.");
    return toClient(data as unknown as ClientRow);
  }

  async remove(id: string): Promise<void> {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from("clientes").delete().eq("id", id);
    if (error) throw new RepoError("supabase_error", error.message);
  }

  async addFile(id: string, file: Omit<ClientFileRef, "id" | "createdAt">): Promise<Client> {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from("cliente_arquivos").insert({
      cliente_id: id,
      storage_path: file.fileId,
      name: file.name,
      mime_type: file.mimeType,
      size: file.size,
    });
    if (error) throw new RepoError("supabase_error", error.message);
    await supabase.from("clientes").update({ atualizado_em: new Date().toISOString() }).eq("id", id);
    const client = await this.get(id);
    if (!client) throw new RepoError("not_found", "Cliente não encontrado.");
    return client;
  }

  // Diferente do modo local (que só removia a referência e deixava o blob
  // órfão no IndexedDB) — aqui apagamos o objeto no Storage de fato, já que
  // um blob esquecido custa dinheiro real num bucket real.
  async removeFile(id: string, fileRefId: string): Promise<Client> {
    const supabase = getSupabaseBrowserClient();
    const { data: fileRow, error: fetchError } = await supabase
      .from("cliente_arquivos")
      .select("storage_path")
      .eq("id", fileRefId)
      .maybeSingle();
    if (fetchError) throw new RepoError("supabase_error", fetchError.message);

    const { error: deleteError } = await supabase.from("cliente_arquivos").delete().eq("id", fileRefId);
    if (deleteError) throw new RepoError("supabase_error", deleteError.message);

    if (fileRow?.storage_path) {
      await supabaseStorageRepo.remove(fileRow.storage_path).catch(() => {
        // Referência já removida do banco; se o objeto no Storage já não
        // existir (ou a chamada falhar), não bloqueia o fluxo do usuário.
      });
    }

    await supabase.from("clientes").update({ atualizado_em: new Date().toISOString() }).eq("id", id);
    const client = await this.get(id);
    if (!client) throw new RepoError("not_found", "Cliente não encontrado.");
    return client;
  }
}

export const supabaseClientRepo = new SupabaseClientRepository();
