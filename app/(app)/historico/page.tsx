"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  History,
  MoreVertical,
  ExternalLink,
  Copy,
  Pencil,
  Download,
  FilePlus2,
  Search,
} from "lucide-react";
import { documentRepo, officeRepo } from "@/lib/repositories";
import { useCollection } from "@/lib/hooks/use-collection";
import { categoryLabel } from "@/lib/constants/template";
import { renderDocx } from "@/lib/documents/render-docx";
import { renderPdf } from "@/lib/documents/render-pdf";
import { resolveLetterheadAssets } from "@/lib/documents/letterhead-assets";
import { downloadBlob, slugifyFilename } from "@/lib/utils/download-blob";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { DocumentStatusBadge } from "@/components/documents/status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function HistoricoPage() {
  const router = useRouter();
  const { data: documents, loading } = useCollection(() => documentRepo.list());
  const { data: office } = useCollection(() => officeRepo.get());
  const [query, setQuery] = React.useState("");

  const filtered = (documents ?? []).filter(
    (d) =>
      !query ||
      d.templateName.toLowerCase().includes(query.toLowerCase()) ||
      d.clientName.toLowerCase().includes(query.toLowerCase())
  );

  const handleDuplicate = async (id: string) => {
    const copy = await documentRepo.duplicate(id);
    toast.success("Documento duplicado.");
    router.push(`/documentos/${copy.id}`);
  };

  const handleRedownload = async (id: string, kind: "pdf" | "docx") => {
    const doc = await documentRepo.get(id);
    if (!doc) return;
    const toastId = toast.loading("Preparando documento...");
    try {
      const assets = await resolveLetterheadAssets(office ?? null);
      if (kind === "pdf") {
        const blob = await renderPdf(doc.blocks, {
          officeName: office?.officeName,
          logoDataUrl: assets.pdfLogoDataUrl,
          signatureDataUrl: assets.pdfSignatureDataUrl,
          footerText: office?.footerText,
        });
        downloadBlob(blob, `${slugifyFilename(doc.templateName)}.pdf`);
      } else {
        const blob = await renderDocx(doc.blocks, {
          officeName: office?.officeName,
          footerText: office?.footerText,
          logo: assets.docxLogo,
          signature: assets.docxSignature,
        });
        downloadBlob(blob, `${slugifyFilename(doc.templateName)}.docx`);
      }
      toast.success("Documento pronto para download.", { id: toastId });
    } catch {
      toast.error("Não foi possível gerar o arquivo.", { id: toastId });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-display font-medium text-navy-900">Histórico</h1>
          <p className="mt-1 text-sm text-graphite-500">Todos os documentos gerados pelo seu escritório.</p>
        </div>
        <Button size="lg" onClick={() => router.push("/documentos/novo")}>
          <FilePlus2 className="h-4 w-4" /> Novo documento
        </Button>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por cliente ou tipo de documento"
          className="pl-10"
        />
      </div>

      {loading && (
        <Card className="overflow-hidden">
          <div className="divide-y divide-mist-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-6 px-6 py-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="ml-auto h-5 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </Card>
      )}

      {!loading && filtered.length === 0 && (
        <EmptyState
          icon={History}
          title="Nenhum documento no histórico"
          description="Os documentos que você gerar aparecerão aqui."
          action={
            <Button onClick={() => router.push("/documentos/novo")}>
              <FilePlus2 className="h-4 w-4" /> Gerar documento
            </Button>
          }
        />
      )}

      {filtered.length > 0 && (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-mist-100 text-xs uppercase tracking-wide text-graphite-500">
                <th className="px-6 py-3 font-medium">Cliente</th>
                <th className="px-6 py-3 font-medium">Tipo de documento</th>
                <th className="px-6 py-3 font-medium">Data</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mist-100">
              {filtered.map((doc) => (
                <tr key={doc.id} className="hover:bg-ice-100">
                  <td className="px-6 py-4 font-medium text-navy-900">{doc.clientName}</td>
                  <td className="px-6 py-4 text-graphite-700">
                    {doc.templateName}
                    <span className="ml-2 text-xs text-graphite-400">{categoryLabel(doc.category)}</span>
                  </td>
                  <td className="px-6 py-4 text-graphite-500">
                    {format(new Date(doc.updatedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </td>
                  <td className="px-6 py-4">
                    <DocumentStatusBadge status={doc.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="rounded-lg p-1.5 text-graphite-400 hover:bg-mist-100 hover:text-navy-900">
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/documentos/${doc.id}`} className="flex items-center gap-2">
                            <ExternalLink className="h-4 w-4" /> Abrir
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/documentos/${doc.id}`} className="flex items-center gap-2">
                            <Pencil className="h-4 w-4" /> Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(doc.id)} className="flex items-center gap-2">
                          <Copy className="h-4 w-4" /> Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRedownload(doc.id, "pdf")} className="flex items-center gap-2">
                          <Download className="h-4 w-4" /> Baixar PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRedownload(doc.id, "docx")} className="flex items-center gap-2">
                          <Download className="h-4 w-4" /> Baixar DOCX
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
