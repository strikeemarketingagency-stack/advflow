"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Plus, X, FilePlus2 } from "lucide-react";
import {
  templateRepo,
  clientRepo,
  documentRepo,
  officeRepo,
  activityRepo,
  storageRepo,
} from "@/lib/repositories";
import { TemplateBlock } from "@/lib/repositories/types";
import { useCollection } from "@/lib/hooks/use-collection";
import { fillBlocks } from "@/lib/documents/block-model";
import { buildAutofillValues } from "@/lib/documents/autofill";
import { DocumentPreview } from "@/lib/documents/render-preview";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/ui/stepper";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { FieldInput } from "@/components/documents/field-input";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LibraryBig } from "lucide-react";

const STEPS = [
  "Partes envolvidas",
  "Informações do contrato",
  "Valores e datas",
  "Cláusulas adicionais",
  "Revisão final",
];

type CustomItemType = "campo" | "clausula" | "observacao";

export default function NovoDocumentoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTemplateId = searchParams.get("templateId");
  const initialClientId = searchParams.get("clientId");

  const { data: templates } = useCollection(() => templateRepo.list());
  const { data: clients } = useCollection(() => clientRepo.list());
  const { data: office } = useCollection(() => officeRepo.get());

  const [step, setStep] = React.useState(0);
  const [templateId, setTemplateId] = React.useState(initialTemplateId ?? "");
  const [clientId, setClientId] = React.useState(initialClientId ?? "");
  const [fieldValues, setFieldValues] = React.useState<Record<string, string>>({});
  const [customBlocks, setCustomBlocks] = React.useState<TemplateBlock[]>([]);
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null);
  const [signatureUrl, setSignatureUrl] = React.useState<string | null>(null);
  const [generating, setGenerating] = React.useState(false);
  const [autofilled, setAutofilled] = React.useState(false);

  const [customType, setCustomType] = React.useState<CustomItemType>("clausula");
  const [customTitle, setCustomTitle] = React.useState("");
  const [customText, setCustomText] = React.useState("");

  const template = templates?.find((t) => t.id === templateId) ?? null;
  const client = clients?.find((c) => c.id === clientId) ?? null;

  React.useEffect(() => {
    if (office?.logoFileId) storageRepo.getUrl(office.logoFileId).then(setLogoUrl);
  }, [office?.logoFileId]);

  React.useEffect(() => {
    if (office?.signatureFileId) storageRepo.getUrl(office.signatureFileId).then(setSignatureUrl);
  }, [office?.signatureFileId]);

  React.useEffect(() => {
    if (template && !autofilled) {
      setFieldValues((prev) => ({ ...buildAutofillValues(template.variables, client, office ?? null), ...prev }));
      setAutofilled(true);
    }
  }, [template, client, office, autofilled]);

  const grouped = React.useMemo(() => {
    const vars = template?.variables ?? [];
    return {
      partes: vars.filter((v) => v.group === "partes"),
      informacoes: vars.filter((v) => v.group === "informacoes"),
      valores: vars.filter((v) => v.group === "valores"),
      outros: vars.filter((v) => v.group === "outros"),
    };
  }, [template]);

  const setFieldValue = (token: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [token]: value }));
  };

  const addCustomBlock = () => {
    if (customType === "clausula") {
      if (!customTitle.trim() && !customText.trim()) return;
      const blocks: TemplateBlock[] = [];
      if (customTitle.trim()) blocks.push({ id: crypto.randomUUID(), type: "clause", text: customTitle.trim(), bold: true });
      if (customText.trim()) blocks.push({ id: crypto.randomUUID(), type: "paragraph", text: customText.trim() });
      setCustomBlocks((prev) => [...prev, ...blocks]);
    } else if (customType === "campo") {
      if (!customTitle.trim() || !customText.trim()) return;
      setCustomBlocks((prev) => [
        ...prev,
        { id: crypto.randomUUID(), type: "paragraph", text: `${customTitle.trim()}: ${customText.trim()}` },
      ]);
    } else {
      if (!customText.trim()) return;
      setCustomBlocks((prev) => [...prev, { id: crypto.randomUUID(), type: "paragraph", text: customText.trim() }]);
    }
    setCustomTitle("");
    setCustomText("");
  };

  const removeCustomBlock = (id: string) => {
    setCustomBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const finalBlocks = React.useMemo(() => {
    if (!template) return [];
    const filled = fillBlocks(template.blocks, fieldValues);
    const signatureIndex = filled.findIndex((b) => b.type === "signatureLine");
    if (signatureIndex === -1) return [...filled, ...customBlocks];
    return [...filled.slice(0, signatureIndex), ...customBlocks, ...filled.slice(signatureIndex)];
  }, [template, fieldValues, customBlocks]);

  const canProceedStep0 = Boolean(templateId);

  const handleGenerate = async () => {
    if (!template) return;
    setGenerating(true);
    const toastId = toast.loading("Preparando documento...");
    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      const doc = await documentRepo.create({
        clientId: client?.id ?? null,
        clientName: client?.fullName ?? "Sem cliente vinculado",
        templateId: template.id,
        templateName: template.name,
        category: template.category,
        status: "concluido",
        blocks: finalBlocks,
        fieldValues,
      });
      await activityRepo.log(
        "document_generated",
        `Documento "${template.name}" gerado para ${client?.fullName ?? "cliente não vinculado"}.`,
        doc.id
      );
      toast.success("Documento criado com sucesso.", { id: toastId });
      router.push(`/documentos/${doc.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível gerar o documento.", { id: toastId });
    } finally {
      setGenerating(false);
    }
  };

  if (templates && templates.length === 0) {
    return (
      <EmptyState
        icon={LibraryBig}
        title="Nenhum modelo disponível"
        description="Crie um modelo antes de gerar um documento."
        action={
          <Button asChild>
            <Link href="/modelos/novo">Criar modelo</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-graphite-500 hover:text-navy-900"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </button>

      <div>
        <h1 className="font-display text-display font-medium text-navy-900">Gerar documento</h1>
        <p className="mt-1 text-sm text-graphite-500">Siga as etapas para gerar um documento personalizado.</p>
      </div>

      <Stepper steps={STEPS} currentStep={step} onStepClick={(i) => i < step && setStep(i)} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="flex flex-col gap-5 p-7">
              {step === 0 && (
                <>
                  <Field label="Modelo" required>
                    <Select
                      value={templateId}
                      onValueChange={(v) => {
                        setTemplateId(v);
                        setAutofilled(false);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um modelo" />
                      </SelectTrigger>
                      <SelectContent>
                        {(templates ?? []).map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Cliente" hint="Opcional — vincula o documento a um cliente cadastrado.">
                    <Select value={clientId} onValueChange={(v) => { setClientId(v); setAutofilled(false); }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {(clients ?? []).map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  {grouped.partes.map((variable) => (
                    <FieldInput
                      key={variable.token}
                      variable={variable}
                      value={fieldValues[variable.token] ?? ""}
                      onChange={(v) => setFieldValue(variable.token, v)}
                    />
                  ))}
                  {template && grouped.partes.length === 0 && (
                    <p className="text-sm text-graphite-500">Este modelo não possui campos de partes envolvidas.</p>
                  )}
                </>
              )}

              {step === 1 && (
                <>
                  {grouped.informacoes.length > 0 ? (
                    grouped.informacoes.map((variable) => (
                      <FieldInput
                        key={variable.token}
                        variable={variable}
                        value={fieldValues[variable.token] ?? ""}
                        onChange={(v) => setFieldValue(variable.token, v)}
                      />
                    ))
                  ) : (
                    <p className="text-sm text-graphite-500">Nenhuma informação adicional necessária.</p>
                  )}
                </>
              )}

              {step === 2 && (
                <>
                  {grouped.valores.length > 0 ? (
                    grouped.valores.map((variable) => (
                      <FieldInput
                        key={variable.token}
                        variable={variable}
                        value={fieldValues[variable.token] ?? ""}
                        onChange={(v) => setFieldValue(variable.token, v)}
                      />
                    ))
                  ) : (
                    <p className="text-sm text-graphite-500">Nenhum valor ou data necessário.</p>
                  )}
                </>
              )}

              {step === 3 && (
                <>
                  {grouped.outros.map((variable) => (
                    <FieldInput
                      key={variable.token}
                      variable={variable}
                      value={fieldValues[variable.token] ?? ""}
                      onChange={(v) => setFieldValue(variable.token, v)}
                    />
                  ))}

                  <div className="rounded-xl border border-mist-200 p-4">
                    <p className="mb-3 text-sm font-medium text-graphite-700">Adicionar item personalizado</p>
                    <div className="flex flex-col gap-3">
                      <Select value={customType} onValueChange={(v) => setCustomType(v as CustomItemType)}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="clausula">Cláusula</SelectItem>
                          <SelectItem value="campo">Campo</SelectItem>
                          <SelectItem value="observacao">Observação</SelectItem>
                        </SelectContent>
                      </Select>
                      {customType !== "observacao" && (
                        <Input
                          value={customTitle}
                          onChange={(e) => setCustomTitle(e.target.value)}
                          placeholder={customType === "clausula" ? "Título da cláusula" : "Rótulo do campo"}
                        />
                      )}
                      <Textarea
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        placeholder={customType === "campo" ? "Valor do campo" : "Texto"}
                      />
                      <Button type="button" variant="secondary" className="w-fit" onClick={addCustomBlock}>
                        <Plus className="h-4 w-4" /> Adicionar
                      </Button>
                    </div>

                    {customBlocks.length > 0 && (
                      <ul className="mt-4 flex flex-col gap-2">
                        {customBlocks.map((block) => (
                          <li key={block.id} className="flex items-start justify-between gap-2 rounded-lg bg-ice-100 px-3 py-2 text-sm text-graphite-700">
                            <span className={block.type === "clause" ? "font-semibold" : ""}>{block.text}</span>
                            <button onClick={() => removeCustomBlock(block.id)} className="text-graphite-400 hover:text-red-600">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </>
              )}

              {step === 4 && (
                <div className="flex flex-col gap-4">
                  <p className="text-sm text-graphite-600">
                    Revise o documento antes de gerar. Você pode voltar para qualquer etapa para ajustar as informações.
                  </p>
                  <dl className="grid grid-cols-2 gap-3 rounded-xl bg-ice-100 p-4 text-sm">
                    <div>
                      <dt className="text-xs text-graphite-500">Modelo</dt>
                      <dd className="font-medium text-graphite-900">{template?.name}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-graphite-500">Cliente</dt>
                      <dd className="font-medium text-graphite-900">{client?.fullName ?? "Não vinculado"}</dd>
                    </div>
                  </dl>
                </div>
              )}

              <div className="mt-2 flex items-center justify-between">
                <Button type="button" variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
                  Voltar
                </Button>
                {step < STEPS.length - 1 ? (
                  <Button type="button" onClick={() => setStep((s) => s + 1)} disabled={step === 0 && !canProceedStep0}>
                    Continuar
                  </Button>
                ) : (
                  <Button type="button" onClick={handleGenerate} loading={generating}>
                    <FilePlus2 className="h-4 w-4" /> Gerar documento
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <p className="mb-3 text-sm font-medium text-graphite-700">Pré-visualização</p>
          {template ? (
            <DocumentPreview
              blocks={finalBlocks}
              letterhead={{ officeName: office?.officeName, logoUrl, signatureUrl, footerText: office?.footerText }}
            />
          ) : (
            <EmptyState icon={LibraryBig} title="Selecione um modelo" description="A pré-visualização aparecerá aqui." />
          )}
        </div>
      </div>
    </div>
  );
}
