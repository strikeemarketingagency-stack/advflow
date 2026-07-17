import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Cliente Supabase para uso no navegador (chave anônima, respeita RLS).
 * Usa createBrowserClient (@supabase/ssr) em vez do createClient puro do
 * supabase-js — a sessão passa a ser persistida em cookies (não só em
 * memória/localStorage), que é o que proxy.ts e o cliente de servidor
 * (lib/supabase/server-client.ts) precisam para ler a mesma sessão no SSR.
 * Só é construído quando efetivamente chamado — nunca no carregamento do
 * módulo — para que a build funcione mesmo sem as variáveis configuradas
 * (modo mock continua sendo o padrão sem essas credenciais).
 */
export function getSupabaseBrowserClient(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  client = createBrowserClient(url, anonKey);
  return client;
}
