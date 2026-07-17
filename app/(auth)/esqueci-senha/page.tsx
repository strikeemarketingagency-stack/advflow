"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/auth-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

const schema = z.object({
  email: z.string().email("Informe um email válido."),
});

type FormValues = z.infer<typeof schema>;

export default function EsqueciSenhaPage() {
  const { requestPasswordReset } = useAuth();
  const [submitting, setSubmitting] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await requestPasswordReset(values.email);
      setSent(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível enviar o email.");
    } finally {
      setSubmitting(false);
    }
  };

  const labelClassName = "text-mist-100";
  const inputClassName = "border-white/10 bg-white/5 text-white placeholder:text-mist-300/60";

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <Logo iconClassName="h-10 w-10" wordmarkClassName="text-2xl text-white" />
        <p className="max-w-xs text-sm text-mist-200">
          Informe seu email e enviaremos um link para redefinir sua senha.
        </p>
      </div>

      <Card className="w-full border-gold-500/20 bg-white/[0.03] shadow-[0_0_0_1px_rgba(182,130,53,0.15),0_24px_64px_-16px_rgba(182,130,53,0.35)] backdrop-blur-xl">
        <CardContent className="p-8">
          {sent ? (
            <p className="text-center text-sm text-mist-100">
              Se existir uma conta com esse email, enviamos um link de redefinição de senha. Confira sua
              caixa de entrada (e o spam).
            </p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Field label="Email" htmlFor="email" error={errors.email?.message} labelClassName={labelClassName}>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="voce@escritorio.com.br"
                  className={inputClassName}
                  {...register("email")}
                />
              </Field>
              <Button type="submit" size="lg" variant="gold" className="mt-2" loading={submitting}>
                Enviar link de redefinição
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <p className="text-sm text-mist-300">
        Lembrou a senha?{" "}
        <Link href="/login" className="font-medium text-gold-400 hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
