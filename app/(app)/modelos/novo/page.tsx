"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import mammoth from "mammoth";
import { ArrowLeft, UploadCloud, FileText, Loader2 } from "lucide-react";
import { templateRepo, activityRepo } from "@/lib/repositories";
import { TemplateBlock, TemplateCategory, TemplateVariable, VariableType } from "@/lib/repositories/types";
import { TEMPLATE_CATEGORIES } from "@/lib/constants/template";
import { textToBlocks, detectVariablesFromText } from "@/lib/documents/token-detect";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/ui/stepper";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const VARIABLE_TYPES: { value: VariableType; label: string }[] = [
  { value: "text", label: "Texto" },
  { value: "date", label: "Data" },
  { value: "currency", label: "Valor monetário" },
  { value: "cpf", label: "CPF" },
  { value: "cnpj", label: "CNPJ" },
];

const STEPS = ["Enviar documento", "Nome e categoria", "Campos variáveis"];

export default function NovoModeloPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const [parsing, setParsing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [blocks, setBlocks] = React.useState<TemplateBlock[]>([]);
  const [variables, setVariables] = React.useState<TemplateVariable[]>([]);
  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState<string>("contratos");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setParsing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value;
      setBlocks(textToBlocks(text));
      setVariables(detectVariablesFromText(text));
      setFileName(file.name);
      if (!name) setName(file.name.replace(/\.docx?$/i, ""));
      setStep(1);
    } catch {
      toast.error("Não foi possível ler o arquivo. Envie um .docx válido.");
    } finally {
      setParsing(false);
    }
  };

  const updateVariable = (token: string, patch: Partial<TemplateVariable>) => {
    setVariables((prev) => prev.map((v) => (v.token === token ? { ...v, ...patch } : v)));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Informe um nome para o modelo.");
      setStep(1);
      return;
    }
    setSaving(true);
    try {
      const template = await templateRepo.create({
        name: name.trim(),
        category: category as TemplateCategory,
        blocks,
        variables,
      });
      await activityRepo.log("template_created", `Modelo "${template.name}" criado.`, template.id);
      toast.success("Modelo salvo com sucesso.");
      router.push(`/modelos/${template.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível salvar o modelo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Link href="/modelos" className="flex w-fit items-center gap-1.5 text-sm font-medium text-graphite-500 hover:text-navy-900">
        <ArrowLeft className="h-4 w-4" /> Voltar para modelos
      </Link>
      <div>
        <h1 className="font-display text-display font-medium text-navy-900">Adicionar modelo</h1>
        <p className="mt-1 text-sm text-graphite-500">
          Envie um documento .docx com campos no formato <code className="rounded bg-mist-100 px-1 py-0.5">{"{{CAMPO}}"}</code>.
        </p>
      </div>

      <Stepper steps={STEPS} currentStep={step} onStepClick={(i) => i < step && setStep(i)} />

      <Card>
        <CardContent className="p-8">
          {step === 0 && (
            <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-mist-200 bg-ice-100 px-6 py-16 text-center">
              {parsing ? (
                <Loader2 className="h-6 w-6 animate-spin text-navy-800" />
              ) : (
                <UploadCloud className="h-8 w-8 text-navy-800" strokeWidth={1.5} />
              )}
              <div>
                <p className="text-sm font-medium text-navy-900">
                  {parsing ? "Lendo documento..." : "Arraste um arquivo .docx ou clique para enviar"}
                </p>
                <p className="mt-1 text-xs text-graphite-500">
                  Digite os campos variáveis no Word como {"{{NOME_CLIENTE}}"}, {"{{CPF}}"}, {"{{VALOR}}"} etc.
                </p>
              </div>
              <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()} disabled={parsing}>
                Escolher arquivo
              </Button>
              <input
                ref={inputRef}
                type="file"
                accept=".docx"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                  e.target.value = "";
                }}
              />
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-5">
              {fileName && (
                <div className="flex items-center gap-2 rounded-lg bg-ice-100 px-3 py-2 text-sm text-graphite-700">
                  <FileText className="h-4 w-4 text-navy-800" /> {fileName}
                </div>
              )}
              <Field label="Nome do modelo" required>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Contrato de Prestação de Serviços" />
              </Field>
              <Field label="Categoria" required>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <div className="mt-2 flex items-center justify-between">
                <Button type="button" variant="ghost" onClick={() => setStep(0)}>
                  Voltar
                </Button>
                <Button type="button" onClick={() => setStep(2)} disabled={!name.trim()}>
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-5">
              {variables.length === 0 ? (
                <p className="text-sm text-graphite-500">
                  Nenhum campo <code className="rounded bg-mist-100 px-1 py-0.5">{"{{CAMPO}}"}</code> foi detectado no documento.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {variables.map((variable) => (
                    <div key={variable.token} className="flex flex-col gap-3 rounded-xl border border-mist-200 p-4 sm:flex-row sm:items-center">
                      <Badge variant="navy" className="w-fit shrink-0">
                        {"{{" + variable.token + "}}"}
                      </Badge>
                      <Input
                        value={variable.label}
                        onChange={(e) => updateVariable(variable.token, { label: e.target.value })}
                        placeholder="Rótulo amigável"
                        className="sm:flex-1"
                      />
                      <Select value={variable.type} onValueChange={(v) => updateVariable(variable.token, { type: v as VariableType })}>
                        <SelectTrigger className="sm:w-44">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {VARIABLE_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-2 flex items-center justify-between">
                <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                  Voltar
                </Button>
                <Button type="button" onClick={handleSave} loading={saving}>
                  Salvar modelo
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
