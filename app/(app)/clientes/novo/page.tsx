"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { clientRepo, activityRepo, storageRepo } from "@/lib/repositories";
import { ClientInput } from "@/lib/repositories/types";
import { ClientForm } from "@/components/clients/client-form";
import { Card, CardContent } from "@/components/ui/card";

export default function NovoClientePage() {
  const router = useRouter();

  const handleSubmit = async (values: ClientInput, files: File[]) => {
    try {
      const client = await clientRepo.create(values);
      for (const file of files) {
        const stored = await storageRepo.upload(file, file.name, file.type);
        await clientRepo.addFile(client.id, { fileId: stored.id, name: stored.name, mimeType: stored.mimeType, size: stored.size });
      }
      await activityRepo.log("client_created", `Cliente ${client.fullName} cadastrado.`, client.id);
      toast.success("Cliente cadastrado com sucesso.");
      router.push(`/clientes/${client.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível cadastrar o cliente.");
    }
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Link href="/clientes" className="flex w-fit items-center gap-1.5 text-sm font-medium text-graphite-500 hover:text-navy-900">
        <ArrowLeft className="h-4 w-4" /> Voltar para clientes
      </Link>
      <div>
        <h1 className="font-display text-display font-medium text-navy-900">Adicionar cliente</h1>
        <p className="mt-1 text-sm text-graphite-500">Preencha os dados do cliente para cadastrá-lo.</p>
      </div>
      <Card>
        <CardContent className="p-8">
          <ClientForm onSubmit={handleSubmit} onCancel={() => router.push("/clientes")} />
        </CardContent>
      </Card>
    </div>
  );
}
