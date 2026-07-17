import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase para uso em Server Components / Server Actions / Route
 * Handlers. Lê/escreve a sessão via cookies do Next.js (cookies() é
 * assíncrono a partir do Next 15+ — este projeto está no Next 16).
 *
 * Cada chamada cria um cliente novo (não é singleton como o de browser) —
 * é o padrão recomendado pelo Supabase para SSR, já que cada request tem seu
 * próprio cookie store; cachear entre requests misturaria sessões.
 */
export async function getSupabaseServerClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // setAll é chamado de um Server Component em alguns casos, onde
          // não é possível escrever cookies — inofensivo se o proxy já
          // está renovando a sessão a cada request (ver proxy.ts).
        }
      },
    },
  });
}
