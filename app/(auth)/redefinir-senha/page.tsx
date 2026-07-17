"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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

const schema = z
  .object({
    password: z.string().min(6, "A senha deve ter ao menos 6 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

/**
 * Página de destino do link enviado por requestPasswordReset (ver
 * esqueci-senha/page.tsx). O Supabase já autentica o usuário numa sessão de
 * "recovery" temporária ao seguir o link — updatePassword só é válido dentro
 * dela.
 */
export default function RedefinirSenhaPage() {
  const router = useRouter();
  const { updatePassword } = useAuth();
  const [submitting, setSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await updatePassword(values.password);
      toast.success("Senha redefinida com sucesso.");
      router.replace("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível redefinir a senha.");
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
        <p className="max-w-xs text-sm text-mist-200">Escolha uma nova senha para sua conta.</p>
      </div>

      <Card className="w-full border-gold-500/20 bg-white/[0.03] shadow-[0_0_0_1px_rgba(182,130,53,0.15),0_24px_64px_-16px_rgba(182,130,53,0.35)] backdrop-blur-xl">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Field label="Nova senha" htmlFor="password" error={errors.password?.message} labelClassName={labelClassName}>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                className={inputClassName}
                {...register("password")}
              />
            </Field>
            <Field
              label="Confirmar nova senha"
              htmlFor="confirmPassword"
              error={errors.confirmPassword?.message}
              labelClassName={labelClassName}
            >
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                className={inputClassName}
                {...register("confirmPassword")}
              />
            </Field>
            <Button type="submit" size="lg" variant="gold" className="mt-2" loading={submitting}>
              Redefinir senha
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
