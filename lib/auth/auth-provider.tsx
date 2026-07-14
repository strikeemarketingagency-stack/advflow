"use client";

import * as React from "react";
import { authRepo, AuthSession } from "@/lib/repositories";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  session: AuthSession | null;
  status: AuthStatus;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<AuthSession | null>(null);
  const [status, setStatus] = React.useState<AuthStatus>("loading");

  React.useEffect(() => {
    let mounted = true;
    authRepo.getSession().then((s) => {
      if (!mounted) return;
      setSession(s);
      setStatus(s ? "authenticated" : "unauthenticated");
    });
    const unsubscribe = authRepo.onAuthStateChange((s) => {
      setSession(s);
      setStatus(s ? "authenticated" : "unauthenticated");
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const signIn = React.useCallback(async (email: string, password: string) => {
    await authRepo.signIn(email, password);
  }, []);

  const signUp = React.useCallback(async (email: string, password: string) => {
    await authRepo.signUp(email, password);
  }, []);

  const signOut = React.useCallback(async () => {
    await authRepo.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{ session, status, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de um AuthProvider.");
  return ctx;
}
