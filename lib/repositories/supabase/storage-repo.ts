import { RepoError, StorageRepository, StoredFile } from "@/lib/repositories/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { getCurrentUserId } from "@/lib/repositories/local/session";

// Dois buckets (ver supabase/migrations/0003_storage.sql): `escritorio-assets`
// (público — logo/assinatura, baixa sensibilidade, URL pública sem expirar)
// e `clientes-arquivos` (privado — anexos de cliente, signed URL sob
// demanda). O StoredFile.id devolvido pra chamador é uma referência opaca
// "bucket:path" — os outros repos (client-repo) só guardam essa string, sem
// precisar saber o bucket.
const PUBLIC_BUCKET = "escritorio-assets";
const PRIVATE_BUCKET = "clientes-arquivos";
const SIGNED_URL_TTL_SECONDS = 60 * 60;

function encodeFileId(bucket: string, path: string): string {
  return `${bucket}:${path}`;
}

function decodeFileId(fileId: string): { bucket: string; path: string } {
  const idx = fileId.indexOf(":");
  if (idx === -1) {
    throw new RepoError("invalid_file_id", "Referência de arquivo inválida.");
  }
  return { bucket: fileId.slice(0, idx), path: fileId.slice(idx + 1) };
}

class SupabaseStorageRepository implements StorageRepository {
  async upload(
    file: File | Blob,
    name: string,
    mimeType: string,
    visibility: "public" | "private" = "private"
  ): Promise<StoredFile> {
    const supabase = getSupabaseBrowserClient();
    const userId = getCurrentUserId();
    const bucket = visibility === "public" ? PUBLIC_BUCKET : PRIVATE_BUCKET;
    // Nome sempre único (uuid prefixado) — nunca sobrescreve em cima do path
    // anterior. Trocar o logo/assinatura, por exemplo, deixa o objeto antigo
    // órfão no bucket (mesma limitação que o modo local já tinha pros
    // anexos de cliente — ver client-repo.ts local removeFile).
    const safeName = name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${userId}/${crypto.randomUUID()}-${safeName}`;

    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      contentType: mimeType,
      upsert: false,
    });
    if (error) throw new RepoError("supabase_error", error.message);

    return {
      id: encodeFileId(bucket, path),
      name,
      mimeType,
      size: file.size,
      createdAt: new Date().toISOString(),
    };
  }

  async getUrl(fileId: string): Promise<string | null> {
    const { bucket, path } = decodeFileId(fileId);
    const supabase = getSupabaseBrowserClient();
    if (bucket === PUBLIC_BUCKET) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      return data.publicUrl;
    }
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
    if (error) return null;
    return data.signedUrl;
  }

  async getBlob(fileId: string): Promise<Blob | null> {
    const { bucket, path } = decodeFileId(fileId);
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.storage.from(bucket).download(path);
    if (error) return null;
    return data;
  }

  async remove(fileId: string): Promise<void> {
    const { bucket, path } = decodeFileId(fileId);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw new RepoError("supabase_error", error.message);
  }
}

export const supabaseStorageRepo = new SupabaseStorageRepository();
