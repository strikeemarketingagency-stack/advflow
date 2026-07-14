"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { officeRepo, activityRepo } from "@/lib/repositories";
import { BRAZILIAN_STATES, LEGAL_SPECIALTIES } from "@/lib/constants/brazil";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/ui/stepper";
import { Logo } from "@/components/ui/logo";
import { FileUploadField } from "@/components/ui/file-upload-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const schema = z.object({
  lawyerName: z.string().min(2, "Informe o nome do advogado(a)."),
  oab: z.string().min(2, "Informe o número da OAB."),
  specialty: z.string().min(1, "Selecione uma especialidade."),
  officeName: z.string().min(2, "Informe o nome do escritório."),
  state: z.string().min(2, "Selecione o estado."),
  city: z.string().min(1, "Informe a cidade."),
  address: z.string().optional(),
  phone: z.string().min(8, "Informe um telefone válido."),
  email: z.string().email("Informe um email válido."),
});

type FormValues = z.infer<typeof schema>;

const STEPS = ["Dados profissionais", "Escritório", "Contato", "Identidade visual"];
const STEP_FIELDS: (keyof FormValues)[][] = [
  ["lawyerName", "oab", "specialty"],
  ["officeName", "state", "city", "address"],
  ["phone", "email"],
  [],
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const [submitting, setSubmitting] = React.useState(false);
  const [logoFileId, setLogoFileId] = React.useState<string | null>(null);
  const [signatureFileId, setSignatureFileId] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { specialty: "", state: "" },
  });

  const next = async () => {
    const valid = await trigger(STEP_FIELDS[step]);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => setStep((s) => Math.max(s - 1, 0));

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await officeRepo.save({
        ...values,
        address: values.address ?? "",
        footerText: "",
        logoFileId,
        signatureFileId,
        onboardingComplete: true,
      });
      await activityRepo.log("office_updated", "Perfil do escritório configurado.");
      toast.success("Escritório configurado com sucesso.");
      router.replace("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setSubmitting(false);
    }
  };

  const specialty = watch("specialty");
  const state = watch("state");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <Logo />
        <div>
          <h1 className="text-xl font-semibold text-navy-900">Vamos configurar seu escritório</h1>
          <p className="text-sm text-graphite-500">
            Essas informações aparecerão nos documentos que você gerar.
          </p>
        </div>
      </div>

      <Stepper steps={STEPS} currentStep={step} onStepClick={setStep} />

      <Card>
        <CardContent className="p-8">
          <form
            onSubmit={(e) => {
              if (step !== STEPS.length - 1) {
                e.preventDefault();
                next();
              } else {
                handleSubmit(onSubmit)(e);
              }
            }}
            className="flex flex-col gap-5"
          >
            {step === 0 && (
              <>
                <Field label="Nome do advogado(a)" htmlFor="lawyerName" error={errors.lawyerName?.message} required>
                  <Input id="lawyerName" placeholder="Dra. Ana Souza" {...register("lawyerName")} />
                </Field>
                <Field label="Número da OAB" htmlFor="oab" error={errors.oab?.message} required>
                  <Input id="oab" placeholder="OAB/SP 123.456" {...register("oab")} />
                </Field>
                <Field label="Especialidade jurídica" error={errors.specialty?.message} required>
                  <Select value={specialty} onValueChange={(v) => setValue("specialty", v, { shouldValidate: true })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEGAL_SPECIALTIES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </>
            )}

            {step === 1 && (
              <>
                <Field label="Nome do escritório" htmlFor="officeName" error={errors.officeName?.message} required>
                  <Input id="officeName" placeholder="Souza Advogados Associados" {...register("officeName")} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Estado" error={errors.state?.message} required>
                    <Select value={state} onValueChange={(v) => setValue("state", v, { shouldValidate: true })}>
                      <SelectTrigger>
                        <SelectValue placeholder="UF" />
                      </SelectTrigger>
                      <SelectContent>
                        {BRAZILIAN_STATES.map((uf) => (
                          <SelectItem key={uf} value={uf}>
                            {uf}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Cidade" htmlFor="city" error={errors.city?.message} required>
                    <Input id="city" placeholder="São Paulo" {...register("city")} />
                  </Field>
                </div>
                <Field label="Endereço" htmlFor="address" hint="Opcional — aparece no rodapé dos documentos.">
                  <Input id="address" placeholder="Av. Paulista, 1000, sala 12" {...register("address")} />
                </Field>
              </>
            )}

            {step === 2 && (
              <>
                <Field label="Telefone" htmlFor="phone" error={errors.phone?.message} required>
                  <Input id="phone" placeholder="(11) 99999-0000" {...register("phone")} />
                </Field>
                <Field label="Email" htmlFor="email" error={errors.email?.message} required>
                  <Input id="email" type="email" placeholder="contato@escritorio.com.br" {...register("email")} />
                </Field>
              </>
            )}

            {step === 3 && (
              <div className="grid grid-cols-2 gap-6">
                <FileUploadField
                  label="Logo do escritório"
                  fileId={logoFileId}
                  onChange={setLogoFileId}
                  hint="PNG ou JPG, aparece no cabeçalho dos documentos."
                />
                <FileUploadField
                  label="Assinatura"
                  fileId={signatureFileId}
                  onChange={setSignatureFileId}
                  hint="Imagem da sua assinatura digitalizada."
                />
              </div>
            )}

            <div className="mt-4 flex items-center justify-between">
              <Button type="button" variant="ghost" onClick={back} disabled={step === 0}>
                Voltar
              </Button>
              {step === STEPS.length - 1 ? (
                <Button type="submit" loading={submitting}>
                  Concluir configuração
                </Button>
              ) : (
                <Button type="submit">Continuar</Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
