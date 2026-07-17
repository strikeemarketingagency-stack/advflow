import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Rotas do painel logado (app/(app) e app/(onboarding)) — exigem sessão.
// app/(auth) (login/signup/reset), /vendas e "/" ficam de fora de propósito.
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/clientes",
  "/documentos",
  "/modelos",
  "/escritorio",
  "/historico",
  "/configuracoes",
  "/onboarding",
];

/**
 * Renova o token de sessão do Supabase a cada request e redireciona pra
 * /login quem tentar acessar uma rota do painel sem sessão ativa — isso
 * roda antes de qualquer render, então evita o "flash" de conteúdo
 * protegido que o AuthGuard client-side (components/layout/auth-guard.tsx)
 * sozinho não consegue evitar. AuthGuard continua existindo e cobrindo a
 * checagem de onboarding completo, que este proxy não replica (evita
 * uma consulta a mais ao banco em todo request só por essa flag).
 *
 * Next.js 16 renomeou "middleware" para "proxy" (arquivo, função e convenção)
 * — este arquivo já segue o nome/convenção atuais, não o antigo middleware.ts.
 *
 * Sem NEXT_PUBLIC_SUPABASE_URL/ANON_KEY configuradas (modo mock, o padrão
 * hoje), este proxy não faz nada — deixa passar tudo, exatamente como antes
 * de existir.
 */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtected = PROTECTED_PREFIXES.some((prefix) => request.nextUrl.pathname.startsWith(prefix));

  if (isProtected && !user) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Roda em tudo, exceto assets estáticos e imagens do Next — mesmo
     * padrão recomendado pela documentação do Supabase para Next.js.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
