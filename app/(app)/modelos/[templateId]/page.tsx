"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, FilePlus2, Star, Pencil, Copy, Trash2, Save, X, FileText } from "lucide-react";
import { templateRepo, officeRepo, storageRepo } from "@/lib/repositories";
import { TemplateBlock, TemplateCategory, TemplateVariable, VariableType } from "@/lib/repositories/types";
import { useCollection } from "@/lib/hooks/use-collection";
import { TEMPLATE_CATEGORIES, categoryLabel } from "@/lib/constants/template";
import { DocumentPreview } from "@/lib/documents/render-preview";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
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

export default function TemplateDetailPage() {
  const params = useParams<{ templateId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editing = searchParams.get("edit") === "1";

  const { data: template, loading, reload } = useCollection(
    () => templateRepo.get(params.templateId),
    [params.templateId]
  );
  const { data: office } = useCollection(() => officeRepo.get());

  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [blocks, setBlocks] = React.useState<TemplateBlock[]>([]);
  const [variables, setVariables] = React.useState<TemplateVariable[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null);
  const [signatureUrl, setSignatureUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (template) {
      setName(template.name);
      setCategory(template.category);
      setBlocks(template.blocks);
      setVariables(template.variables);
    }
  }, [template]);

  React.useEffect(() => {
    if (office?.logoFileId) storageRepo.getUrl(office.logoFileId).then(setLogoUrl);
  }, [office?.logoFileId]);

  React.useEffect(() => {
    if (office?.signatureFileId) storageRepo.getUrl(office.signatureFileId).then(setSignatureUrl);
  }, [office?.signatureFileId]);

  const setEditMode = (value: boolean) => {
    router.push(`/modelos/${params.templateId}${value ? "?edit=1" : ""}`);
  };

  const handleToggleFavorite = async () => {
    await templateRepo.toggleFavorite(params.templateId);
    reload();
  };

  const handleDuplicate = async () => {
    const copy = await templateRepo.duplicate(params.templateId);
    toast.success(`Modelo duplicado como "${copy.name}".`);
    router.push(`/modelos/${copy.id}`);
  };

  const handleDelete = async () => {
    if (!confirm("Excluir este modelo?")) return;
    await templateRepo.remove(params.templateId);
    toast.success("Modelo excluído.");
    router.push("/modelos");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await templateRepo.update(params.templateId, {
        name,
        category: category as TemplateCategory,
        blocks,
        variables,
      });
      toast.success("Modelo atualizado.");
      setEditMode(false);
      reload();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="aspect-[1/1.414] w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <EmptyState
        icon={FileText}
        title="Modelo não encontrado"
        action={
          <Button asChild>
            <Link href="/modelos">Voltar para modelos</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <Link href="/modelos" className="flex w-fit items-center gap-1.5 text-sm font-medium text-graphite-500 hover:text-navy-900">
        <ArrowLeft className="h-4 w-4" /> Voltar para modelos
      </Link>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-navy-900">{template.name}</h1>
            <Badge variant="navy">{categoryLabel(template.category)}</Badge>
          </div>
          <p className="mt-1 text-sm text-graphite-500">{template.variables.length} campos inteligentes</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href={`/documentos/novo?templateId=${template.id}`}>
              <FilePlus2 className="h-4 w-4" /> Usar este modelo
            </Link>
          </Button>
          <Button variant="secondary" size="icon" onClick={handleToggleFavorite}>
            <Star className={template.isFavorite ? "h-4 w-4 fill-gold-500 text-gold-500" : "h-4 w-4"} />
          </Button>
          {!template.isBuiltin && !editing && (
            <Button variant="secondary" size="icon" onClick={() => setEditMode(true)}>
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          <Button variant="secondary" size="icon" onClick={handleDuplicate}>
            <Copy className="h-4 w-4" />
          </Button>
          {!template.isBuiltin && (
            <Button variant="danger" size="icon" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          {editing ? (
            <Card>
              <CardContent className="flex flex-col gap-4 p-6">
                <Field label="Nome do modelo">
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </Field>
                <Field label="Categoria">
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

                <p className="mt-2 text-sm font-medium text-graphite-700">Conteúdo do documento</p>
                <div className="flex flex-col gap-2">
                  {blocks.map((block, index) => (
                    <Textarea
                      key={block.id}
                      value={block.text ?? ""}
                      onChange={(e) =>
                        setBlocks((prev) =>
                          prev.map((b, i) => (i === index ? { ...b, text: e.target.value } : b))
                        )
                      }
                      className={block.type === "heading" || block.type === "clause" ? "font-semibold" : ""}
                    />
                  ))}
                </div>

                {variables.length > 0 && (
                  <>
                    <p className="mt-2 text-sm font-medium text-graphite-700">Campos variáveis</p>
                    <div className="flex flex-col gap-2">
                      {variables.map((variable, index) => (
                        <div key={variable.token} className="flex items-center gap-2">
                          <Badge variant="navy" className="w-fit shrink-0">
                            {"{{" + variable.token + "}}"}
                          </Badge>
                          <Input
                            value={variable.label}
                            onChange={(e) =>
                              setVariables((prev) =>
                                prev.map((v, i) => (i === index ? { ...v, label: e.target.value } : v))
                              )
                            }
                            className="flex-1"
                          />
                          <Select
                            value={variable.type}
                            onValueChange={(v) =>
                              setVariables((prev) =>
                                prev.map((item, i) => (i === index ? { ...item, type: v as VariableType } : item))
                              )
                            }
                          >
                            <SelectTrigger className="w-40">
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
                  </>
                )}

                <div className="mt-4 flex items-center justify-end gap-3">
                  <Button variant="ghost" onClick={() => setEditMode(false)}>
                    <X className="h-4 w-4" /> Cancelar
                  </Button>
                  <Button onClick={handleSave} loading={saving}>
                    <Save className="h-4 w-4" /> Salvar alterações
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6">
                <p className="mb-3 text-sm font-medium text-graphite-700">Campos variáveis</p>
                {template.variables.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {template.variables.map((v) => (
                      <Badge key={v.token} variant="neutral">
                        {v.label}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-graphite-500">Este modelo não possui campos variáveis.</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-graphite-700">Pré-visualização</p>
          <DocumentPreview
            blocks={editing ? blocks : template.blocks}
            letterhead={{ officeName: office?.officeName, logoUrl, signatureUrl, footerText: office?.footerText }}
          />
        </div>
      </div>
    </div>
  );
}
