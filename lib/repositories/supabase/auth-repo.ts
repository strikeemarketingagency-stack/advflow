import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { setStoredSession } from "@/lib/repositories/local/session";
import {
  AuthRepository,
  AuthSession,
  AuthStateListener,
  RepoError,
} from "@/lib/repositories/types";

function toAuthSession(user: User): AuthSession {
  return {
    user: {
      id: user.id,
      email: user.email ?? "",
      createdAt: user.created_at,
    },
  };
}

// Espelha a sessão do Supabase na mesma chave localStorage que os
// repositórios locais (clientes, modelos, documentos, escritório) já leem
// via getCurrentUserId() — assim eles continuam funcionando sem alteração,
// só a autenticação passa a ser real.
function mirrorSession(session: Session | null) {
  setStoredSession(session ? { userId: session.user.id, email: session.user.email ?? "" } : null);
}

export class SupabaseAuthRepository implements AuthRepository {
  async getSession(): Promise<AuthSession | null> {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.auth.getSession();
    if (error) throw new RepoError("supabase_error", error.message);
    mirrorSession(data.session);
    return data.session ? toAuthSession(data.session.user) : null;
  }

  async signUp(email: string, password: string): Promise<AuthSession> {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw new RepoError("supabase_error", error.message);
    if (!data.session || !data.user) {
      throw new RepoError(
        "confirmation_required",
        "Verifique seu email para confirmar a conta antes de entrar."
      );
    }
    // Cria a linha em `perfis` (extensão do usuário: plano/assinatura) logo
    // após o signUp ter sucesso — RLS em `perfis` já permite isso porque a
    // sessão do usuário recém-criado está ativa neste ponto (auth.uid()
    // bate com o id que está sendo inserido). Nome/OAB/etc do escritório são
    // coletados depois no onboarding (tabela `office`), não aqui.
    const { error: perfilError } = await supabase
      .from("perfis")
      .insert({ id: data.user.id, plano: "basico" });
    if (perfilError) throw new RepoError("supabase_error", perfilError.message);
    mirrorSession(data.session);
    return toAuthSession(data.user);
  }

  async signIn(email: string, password: string): Promise<AuthSession> {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new RepoError("invalid_credentials", "Email ou senha incorretos.");
    mirrorSession(data.session);
    return toAuthSession(data.user);
  }

  async signOut(): Promise<void> {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw new RepoError("supabase_error", error.message);
    mirrorSession(null);
  }

  onAuthStateChange(listener: AuthStateListener): () => void {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      mirrorSession(session);
      listener(session ? toAuthSession(session.user) : null);
    });
    return () => subscription.unsubscribe();
  }

  async requestPasswordReset(email: string): Promise<void> {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    if (error) throw new RepoError("supabase_error", error.message);
  }

  async updatePassword(newPassword: string): Promise<void> {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new RepoError("supabase_error", error.message);
  }
}

export const supabaseAuthRepo = new SupabaseAuthRepository();
