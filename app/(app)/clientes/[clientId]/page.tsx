"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft,
  FilePlus2,
  Paperclip,
  Trash2,
  Download,
  FileText,
  Pencil,
  MoreVertical,
} from "lucide-react";
import { clientRepo, documentRepo, activityRepo, storageRepo } from "@/lib/repositories";
import { Client, ClientInput } from "@/lib/repositories/types";
import { useCollection } from "@/lib/hooks/use-collection";
import { maritalStatusLabel } from "@/lib/constants/client";
import { categoryLabel } from "@/lib/constants/template";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientForm } from "@/components/clients/client-form";
import { DocumentStatusBadge } from "@/components/documents/status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]?.toUpperCase()).join("");
}

export default function ClientProfilePage() {
  const params = useParams<{ clientId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "informacoes";

  const { data: client, loading, reload } = useCollection<Client | null>(
    () => clientRepo.get(params.clientId),
    [params.clientId]
  );
  const { data: documents } = useCollection(
    () => documentRepo.listByClient(params.clientId),
    [params.clientId]
  );
  const { data: activity } = useCollection(() => activityRepo.list(100));

  const [editing, setEditing] = React.useState(false);

  const setTab = (value: string) => {
    router.push(`/clientes/${params.clientId}?tab=${value}`);
  };

  const handleUpdate = async (values: ClientInput) => {
    await clientRepo.update(params.clientId, values);
    toast.success("Cliente atualizado.");
    setEditing(false);
    reload();
  };

  const handleRemoveFile = async (fileRefId: string) => {
    await clientRepo.removeFile(params.clientId, fileRefId);
    toast.success("Arquivo removido.");
    reload();
  };

  const handleDownloadFile = async (fileId: string, name: string) => {
    const url = await storageRepo.getUrl(fileId);
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
  };

  const handleDeleteClient = async () => {
    if (!client) return;
    if (!confirm(`Excluir o cliente ${client.fullName}? Esta ação não pode ser desfeita.`)) return;
    await clientRepo.remove(client.id);
    toast.success("Cliente excluído.");
    router.push("/clientes");
  };

  const clientHistory = (activity ?? []).filter(
    (item) => item.entityId === params.clientId || (client && item.message.includes(client.fullName))
  );

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-9 w-80 rounded-xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (!client) {
    return (
      <EmptyState
        icon={FileText}
        title="Cliente não encontrado"
        description="Este cliente pode ter sido removido."
        action={
          <Button asChild>
            <Link href="/clientes">Voltar para clientes</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Link href="/clientes" className="flex w-fit items-center gap-1.5 text-sm font-medium text-graphite-500 hover:text-navy-900">
        <ArrowLeft className="h-4 w-4" /> Voltar para clientes
      </Link>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="text-lg">{initials(client.fullName)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-navy-900">{client.fullName}</h1>
            <p className="text-sm text-graphite-500">{client.docNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href={`/documentos/novo?clientId=${client.id}`}>
              <FilePlus2 className="h-4 w-4" /> Novo documento
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTab("informacoes")}>
                <Pencil className="h-4 w-4" /> Editar informações
              </DropdownMenuItem>
              <DropdownMenuItem destructive onClick={handleDeleteClient}>
                <Trash2 className="h-4 w-4" /> Excluir cliente
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="informacoes">Informações</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="arquivos">Arquivos</TabsTrigger>
          <TabsTrigger value="observacoes">Observações</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="informacoes">
          <Card>
            <CardContent className="p-6">
              {editing ? (
                <ClientForm client={client} onSubmit={handleUpdate} onCancel={() => setEditing(false)} submitLabel="Salvar alterações" />
              ) : (
                <div className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <InfoField label="CPF/CNPJ" value={client.docNumber} />
                    <InfoField label="RG" value={client.rg} />
                    <InfoField label="Estado civil" value={client.maritalStatus ? maritalStatusLabel(client.maritalStatus) : ""} />
                    <InfoField label="Profissão" value={client.profession} />
                    <InfoField label="Telefone" value={client.phone} />
                    <InfoField label="Email" value={client.email} />
                  </div>
                  <InfoField label="Endereço" value={client.address} />
                  <div>
                    <Button variant="secondary" onClick={() => setEditing(true)}>
                      <Pencil className="h-4 w-4" /> Editar informações
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentos">
          {documents && documents.length > 0 ? (
            <Card className="overflow-hidden">
              <ul className="divide-y divide-mist-100">
                {documents.map((doc) => (
                  <li key={doc.id}>
                    <Link
                      href={`/documentos/${doc.id}`}
                      className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-ice-100"
                    >
                      <div>
                        <p className="text-sm font-medium text-navy-900">{doc.templateName}</p>
                        <p className="text-xs text-graphite-500">
                          {categoryLabel(doc.category)} · {format(new Date(doc.updatedAt), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      </div>
                      <DocumentStatusBadge status={doc.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          ) : (
            <EmptyState
              icon={FileText}
              title="Nenhum documento gerado"
              description="Gere o primeiro documento para este cliente."
              action={
                <Button asChild>
                  <Link href={`/documentos/novo?clientId=${client.id}`}>
                    <FilePlus2 className="h-4 w-4" /> Novo documento
                  </Link>
                </Button>
              }
            />
          )}
        </TabsContent>

        <TabsContent value="arquivos">
          {client.files.length > 0 ? (
            <Card>
              <ul className="divide-y divide-mist-100">
                {client.files.map((file) => (
                  <li key={file.id} className="flex items-center justify-between gap-4 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Paperclip className="h-4 w-4 text-graphite-400" />
                      <span className="text-sm font-medium text-graphite-800">{file.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleDownloadFile(file.fileId, file.name)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveFile(file.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          ) : (
            <EmptyState icon={Paperclip} title="Nenhum arquivo anexado" description="Anexe arquivos ao editar as informações do cliente." />
          )}
        </TabsContent>

        <TabsContent value="observacoes">
          <Card>
            <CardContent className="p-6">
              {client.notes ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-graphite-800">{client.notes}</p>
              ) : (
                <EmptyState icon={FileText} title="Nenhuma observação" description="Adicione observações ao editar as informações do cliente." />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historico">
          {clientHistory.length > 0 ? (
            <Card>
              <ul className="divide-y divide-mist-100">
                {clientHistory.map((item) => (
                  <li key={item.id} className="flex items-center justify-between px-6 py-3.5">
                    <span className="text-sm text-graphite-800">{item.message}</span>
                    <span className="text-xs text-graphite-500">
                      {format(new Date(item.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : (
            <EmptyState icon={FileText} title="Nenhum histórico ainda" description="As ações realizadas para este cliente aparecerão aqui." />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-graphite-500">{label}</p>
      <p className="mt-1 text-sm text-graphite-900">{value || "—"}</p>
    </div>
  );
}
