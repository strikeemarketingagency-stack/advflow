"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Paperclip, X } from "lucide-react";
import { Client, ClientInput } from "@/lib/repositories/types";
import { MARITAL_STATUS_OPTIONS } from "@/lib/constants/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const schema = z.object({
  fullName: z.string().min(2, "Informe o nome completo."),
  docNumber: z.string().min(5, "Informe um CPF/CNPJ válido."),
  rg: z.string().optional(),
  maritalStatus: z.string().optional(),
  profession: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Informe um email válido.").or(z.literal("")).optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export type ClientFormValues = z.infer<typeof schema>;

interface ClientFormProps {
  client?: Client | null;
  onSubmit: (values: ClientInput, files: File[]) => Promise<void>;
  submitLabel?: string;
  onCancel?: () => void;
}

export function ClientForm({ client, onSubmit, submitLabel = "Salvar cliente", onCancel }: ClientFormProps) {
  const [submitting, setSubmitting] = React.useState(false);
  const [stagedFiles, setStagedFiles] = React.useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: client?.fullName ?? "",
      docNumber: client?.docNumber ?? "",
      rg: client?.rg ?? "",
      maritalStatus: client?.maritalStatus ?? "",
      profession: client?.profession ?? "",
      phone: client?.phone ?? "",
      email: client?.email ?? "",
      address: client?.address ?? "",
      notes: client?.notes ?? "",
    },
  });

  const maritalStatus = watch("maritalStatus");

  const submit = async (values: ClientFormValues) => {
    setSubmitting(true);
    try {
      await onSubmit(
        {
          fullName: values.fullName,
          docNumber: values.docNumber,
          rg: values.rg ?? "",
          maritalStatus: (values.maritalStatus ?? "") as ClientInput["maritalStatus"],
          profession: values.profession ?? "",
          phone: values.phone ?? "",
          email: values.email ?? "",
          address: values.address ?? "",
          notes: values.notes ?? "",
        },
        stagedFiles
      );
      setStagedFiles([]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-5">
      <Field label="Nome completo" htmlFor="fullName" error={errors.fullName?.message} required>
        <Input id="fullName" placeholder="João da Silva" {...register("fullName")} />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="CPF/CNPJ" htmlFor="docNumber" error={errors.docNumber?.message} required>
          <Input id="docNumber" placeholder="000.000.000-00" {...register("docNumber")} />
        </Field>
        <Field label="RG" htmlFor="rg">
          <Input id="rg" placeholder="00.000.000-0" {...register("rg")} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Estado civil">
          <Select value={maritalStatus} onValueChange={(v) => setValue("maritalStatus", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {MARITAL_STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Profissão" htmlFor="profession">
          <Input id="profession" placeholder="Engenheiro(a)" {...register("profession")} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Telefone" htmlFor="phone">
          <Input id="phone" placeholder="(11) 99999-0000" {...register("phone")} />
        </Field>
        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" placeholder="cliente@email.com" {...register("email")} />
        </Field>
      </div>

      <Field label="Endereço" htmlFor="address">
        <Input id="address" placeholder="Rua Exemplo, 123, Bairro, Cidade/UF" {...register("address")} />
      </Field>

      <Field label="Observações" htmlFor="notes">
        <Textarea id="notes" placeholder="Anotações internas sobre o cliente" {...register("notes")} />
      </Field>

      <Field label="Arquivos anexados">
        <div className="flex flex-col gap-2">
          {client?.files && client.files.length > 0 && (
            <ul className="flex flex-col gap-1.5">
              {client.files.map((f) => (
                <li key={f.id} className="flex items-center gap-2 text-sm text-graphite-700">
                  <Paperclip className="h-3.5 w-3.5 text-graphite-400" />
                  {f.name}
                </li>
              ))}
            </ul>
          )}
          {stagedFiles.map((f, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border border-mist-200 bg-ice-100 px-3 py-2 text-sm">
              <span className="flex items-center gap-2 text-graphite-700">
                <Paperclip className="h-3.5 w-3.5 text-graphite-400" />
                {f.name}
              </span>
              <button
                type="button"
                onClick={() => setStagedFiles((prev) => prev.filter((_, idx) => idx !== i))}
                className="text-graphite-400 hover:text-red-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              setStagedFiles((prev) => [...prev, ...files]);
              e.target.value = "";
            }}
          />
          <Button type="button" variant="secondary" size="sm" className="w-fit" onClick={() => fileInputRef.current?.click()}>
            <Paperclip className="h-3.5 w-3.5" /> Anexar arquivo
          </Button>
        </div>
      </Field>

      <div className="mt-2 flex items-center justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
