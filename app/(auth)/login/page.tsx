"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-provider";
import { enterDemoMode } from "@/lib/seed/demo";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

const schema = z.object({
  email: z.string().email("Informe um email válido."),
  password: z.string().min(1, "Informe sua senha."),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { signIn, status } = useAuth();
  const [submitting, setSubmitting] = React.useState(false);
  const [loadingDemo, setLoadingDemo] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  React.useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await signIn(values.email, values.password);
      router.replace("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível entrar.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemo = async () => {
    setLoadingDemo(true);
    try {
      await enterDemoMode();
      toast.success("Ambiente de demonstração pronto.");
      router.replace("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível carregar a demonstração.");
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <Logo iconClassName="h-10 w-10" wordmarkClassName="text-2xl text-white" />
        <p className="max-w-xs text-sm text-mist-200">
          Organize seu escritório jurídico em um único fluxo.
        </p>
      </div>

      <Card className="w-full border-gold-500/20 bg-white/[0.03] shadow-[0_0_0_1px_rgba(182,130,53,0.15),0_24px_64px_-16px_rgba(182,130,53,0.35)] backdrop-blur-xl">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Field label="Email" htmlFor="email" error={errors.email?.message} labelClassName="text-mist-100">
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="voce@escritorio.com.br"
                className="border-white/10 bg-white/5 text-white placeholder:text-mist-300/60"
                {...register("email")}
              />
            </Field>
            <Field label="Senha" htmlFor="password" error={errors.password?.message} labelClassName="text-mist-100">
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="border-white/10 bg-white/5 text-white placeholder:text-mist-300/60"
                {...register("password")}
              />
            </Field>
            <Button type="submit" size="lg" variant="gold" className="mt-2" loading={submitting}>
              Entrar
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs uppercase tracking-wider text-mist-300/70">ou</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="w-full border-white/10 bg-white/5 text-mist-100 hover:bg-white/10"
            loading={loadingDemo}
            onClick={handleDemo}
          >
            <Sparkles className="h-4 w-4 text-gold-400" />
            Ver demonstração
          </Button>
        </CardContent>
      </Card>

      <p className="text-sm text-mist-300">
        Ainda não tem uma conta?{" "}
        <Link href="/signup" className="font-medium text-gold-400 hover:underline">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
