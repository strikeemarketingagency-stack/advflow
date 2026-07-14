"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft,
  Download,
  FileText,
  Pencil,
  Save,
  Share2,
  UserRoundPlus,
  X,
} from "lucide-react";
import { documentRepo, officeRepo, clientRepo, storageRepo } from "@/lib/repositories";
import { TemplateBlock } from "@/lib/repositories/types";
import { useCollection } from "@/lib/hooks/use-collection";
import { categoryLabel } from "@/lib/constants/template";
import { DocumentPreview } from "@/lib/documents/render-preview";
import { renderDocx } from "@/lib/documents/render-docx";
import { renderPdf } from "@/lib/documents/render-pdf";
import { resolveLetterheadAssets } from "@/lib/documents/letterhead-assets";
import { downloadBlob, slugifyFilename } from "@/lib/utils/download-blob";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DocumentStatusBadge } from "@/components/documents/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DocumentPreviewPage() {
  const params = useParams<{ documentId: string }>();
  const router = useRouter();

  const { data: doc, loading, reload } = useCollection(
    () => documentRepo.get(params.documentId),
    [params.documentId]
  );
  const { data: office } = useCollection(() => officeRepo.get());
  const { data: clients } = useCollection(() => clientRepo.list());

  const [logoUrl, setLogoUrl] = React.useState<string | null>(null);
  const [signatureUrl, setSignatureUrl] = React.useState<string | null>(null);
  const [editing, setEditing] = React.useState(false);
  const [blocks, setBlocks] = React.useState<TemplateBlock[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [exportingPdf, setExportingPdf] = React.useState(false);
  const [exportingDocx, setExportingDocx] = React.useState(false);
  const [linkingClient, setLinkingClient] = React.useState(false);
  const [selectedClientId, setSelectedClientId] = React.useState("");

  React.useEffect(() => {
    if (doc) setBlocks(doc.blocks);
  }, [doc]);

  React.useEffect(() => {
    if (office?.logoFileId) storageRepo.getUrl(office.logoFileId).then(setLogoUrl);
  }, [office?.logoFileId]);

  React.useEffect(() => {
    if (office?.signatureFileId) storageRepo.getUrl(office.signatureFileId).then(setSignatureUrl);
  }, [office?.signatureFileId]);

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await documentRepo.update(params.documentId, { blocks });
      toast.success("Documento atualizado.");
      setEditing(false);
      reload();
    } finally {
      setSaving(false);
    }
  };

  const handleExportPdf = async () => {
    if (!doc) return;
    setExportingPdf(true);
    try {
      const assets = await resolveLetterheadAssets(office ?? null);
      const blob = await renderPdf(doc.blocks, {
        officeName: office?.officeName,
        logoDataUrl: assets.pdfLogoDataUrl,
        signatureDataUrl: assets.pdfSignatureDataUrl,
        footerText: office?.footerText,
      });
      downloadBlob(blob, `${slugifyFilename(doc.templateName)}.pdf`);
      toast.success("PDF gerado.");
    } catch {
      toast.error("Não foi possível gerar o PDF.");
    } finally {
      setExportingPdf(false);
    }
  };

  const handleExportDocx = async () => {
    if (!doc) return;
    setExportingDocx(true);
    try {
      const assets = await resolveLetterheadAssets(office ?? null);
      const blob = await renderDocx(doc.blocks, {
        officeName: office?.officeName,
        footerText: office?.footerText,
        logo: assets.docxLogo,
        signature: assets.docxSignature,
      });
      downloadBlob(blob, `${slugifyFilename(doc.templateName)}.docx`);
      toast.success("DOCX gerado.");
    } catch {
      toast.error("Não foi possível gerar o DOCX.");
    } finally {
      setExportingDocx(false);
    }
  };

  const handleLinkClient = async () => {
    if (!selectedClientId || !clients) return;
    const client = clients.find((c) => c.id === selectedClientId);
    if (!client) return;
    await documentRepo.update(params.documentId, { clientId: client.id, clientName: client.fullName });
    toast.success(`Documento salvo em ${client.fullName}.`);
    setLinkingClient(false);
    reload();
  };

  const handleShare = async () => {
    if (!doc) return;
    const summaryText = doc.blocks
      .map((b) => b.text)
      .filter(Boolean)
      .join("\n");
    try {
      if (navigator.share) {
        await navigator.share({ title: doc.templateName, text: summaryText });
      } else {
        await navigator.clipboard.writeText(summaryText);
        toast.success("Conteúdo copiado para a área de transferência.");
      }
    } catch {
      // usuário cancelou o compartilhamento — não é um erro
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <Skeleton className="h-4 w-40" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-72" />
          <Skeleton className="h-10 w-64" />
        </div>
        <Skeleton className="mx-auto aspect-[1/1.414] w-full max-w-[720px] rounded-lg" />
      </div>
    );
  }

  if (!doc) {
    return (
      <EmptyState
        icon={FileText}
        title="Documento não encontrado"
        action={
          <Button asChild>
            <Link href="/historico">Voltar para histórico</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <Link href="/historico" className="flex w-fit items-center gap-1.5 text-sm font-medium text-graphite-500 hover:text-navy-900">
        <ArrowLeft className="h-4 w-4" /> Voltar para histórico
      </Link>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-navy-900">{doc.templateName}</h1>
            <DocumentStatusBadge status={doc.status} />
          </div>
          <p className="mt-1 text-sm text-graphite-500">
            {categoryLabel(doc.category)} · {doc.clientName} · {format(new Date(doc.updatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!editing && (
            <Button variant="secondary" onClick={() => setEditing(true)}>
              <Pencil className="h-4 w-4" /> Editar
            </Button>
          )}
          <Button variant="secondary" onClick={handleExportPdf} loading={exportingPdf}>
            <Download className="h-4 w-4" /> Gerar PDF
          </Button>
          <Button variant="secondary" onClick={handleExportDocx} loading={exportingDocx}>
            <Download className="h-4 w-4" /> Gerar DOCX
          </Button>
          {!doc.clientId && (
            <Button variant="secondary" onClick={() => setLinkingClient((v) => !v)}>
              <UserRoundPlus className="h-4 w-4" /> Salvar no cliente
            </Button>
          )}
          <Button variant="ghost" onClick={handleShare}>
            <Share2 className="h-4 w-4" /> Compartilhar
          </Button>
        </div>
      </div>

      {linkingClient && (
        <Card>
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger className="sm:w-72">
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
            <Button onClick={handleLinkClient} disabled={!selectedClientId}>
              Vincular
            </Button>
          </CardContent>
        </Card>
      )}

      {editing ? (
        <Card>
          <CardContent className="flex flex-col gap-4 p-7">
            <div className="flex flex-col gap-2">
              {blocks.map((block, index) => (
                <Textarea
                  key={block.id}
                  value={block.text ?? ""}
                  onChange={(e) =>
                    setBlocks((prev) => prev.map((b, i) => (i === index ? { ...b, text: e.target.value } : b)))
                  }
                  className={block.type === "heading" || block.type === "clause" ? "font-semibold" : ""}
                />
              ))}
            </div>
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setBlocks(doc.blocks);
                  setEditing(false);
                }}
              >
                <X className="h-4 w-4" /> Cancelar
              </Button>
              <Button onClick={handleSaveEdit} loading={saving}>
                <Save className="h-4 w-4" /> Salvar alterações
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <DocumentPreview
          blocks={blocks}
          letterhead={{ officeName: office?.officeName, logoUrl, signatureUrl, footerText: office?.footerText }}
        />
      )}
    </div>
  );
}
