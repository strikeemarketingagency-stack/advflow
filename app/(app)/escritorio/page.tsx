"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { officeRepo, activityRepo, Office } from "@/lib/repositories";
import { useCollection } from "@/lib/hooks/use-collection";
import { BRAZILIAN_STATES, LEGAL_SPECIALTIES } from "@/lib/constants/brazil";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { FileUploadField } from "@/components/ui/file-upload-field";
import { Skeleton } from "@/components/ui/skeleton";
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
  footerText: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function EscritorioPage() {
  const { data: office, loading, reload } = useCollection(() => officeRepo.get());

  if (loading) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Card>
          <CardContent className="flex flex-col gap-5 p-8">
            <div className="grid grid-cols-2 gap-6">
              <Skeleton className="h-28 w-28 rounded-2xl" />
              <Skeleton className="h-28 w-28 rounded-2xl" />
            </div>
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="font-display text-display font-medium text-navy-900">Meu Escritório</h1>
        <p className="mt-1 text-sm text-graphite-500">
          Essas informações aparecem nos documentos gerados pelo AdvFlow.
        </p>
      </div>

      <EscritorioForm key={office?.updatedAt ?? "new"} office={office ?? null} onSaved={reload} />
    </div>
  );
}

function EscritorioForm({ office, onSaved }: { office: Office | null; onSaved: () => void }) {
  const [submitting, setSubmitting] = React.useState(false);
  const [logoFileId, setLogoFileId] = React.useState<string | null>(office?.logoFileId ?? null);
  const [signatureFileId, setSignatureFileId] = React.useState<string | null>(office?.signatureFileId ?? null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      lawyerName: office?.lawyerName ?? "",
      oab: office?.oab ?? "",
      specialty: office?.specialty ?? "",
      officeName: office?.officeName ?? "",
      state: office?.state ?? "",
      city: office?.city ?? "",
      address: office?.address ?? "",
      phone: office?.phone ?? "",
      email: office?.email ?? "",
      footerText: office?.footerText ?? "",
    },
  });

  const specialty = watch("specialty");
  const state = watch("state");

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await officeRepo.save({
        ...values,
        address: values.address ?? "",
        footerText: values.footerText ?? "",
        logoFileId,
        signatureFileId,
      });
      await activityRepo.log("office_updated", "Informações do escritório atualizadas.");
      toast.success("Escritório atualizado com sucesso.");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FileUploadField label="Logo do escritório" fileId={logoFileId} onChange={setLogoFileId} hint="Aparece no cabeçalho dos documentos." />
            <FileUploadField label="Assinatura" fileId={signatureFileId} onChange={setSignatureFileId} hint="Imagem da assinatura digitalizada." />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nome do advogado(a)" htmlFor="lawyerName" error={errors.lawyerName?.message} required>
              <Input id="lawyerName" {...register("lawyerName")} />
            </Field>
            <Field label="Número da OAB" htmlFor="oab" error={errors.oab?.message} required>
              <Input id="oab" {...register("oab")} />
            </Field>
          </div>

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

          <Field label="Nome do escritório" htmlFor="officeName" error={errors.officeName?.message} required>
            <Input id="officeName" {...register("officeName")} />
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
              <Input id="city" {...register("city")} />
            </Field>
          </div>

          <Field label="Endereço" htmlFor="address">
            <Input id="address" {...register("address")} />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Telefone" htmlFor="phone" error={errors.phone?.message} required>
              <Input id="phone" {...register("phone")} />
            </Field>
            <Field label="Email" htmlFor="email" error={errors.email?.message} required>
              <Input id="email" type="email" {...register("email")} />
            </Field>
          </div>

          <Field label="Rodapé padrão" htmlFor="footerText" hint="Texto exibido no rodapé dos documentos gerados.">
            <Textarea id="footerText" placeholder="Ex.: Este documento foi gerado eletronicamente pelo escritório." {...register("footerText")} />
          </Field>

          <div className="mt-2 flex items-center justify-end">
            <Button type="submit" loading={submitting}>
              <Save className="h-4 w-4" /> Salvar alterações
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
