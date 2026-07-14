"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, UserPlus, Users, ChevronRight } from "lucide-react";
import { clientRepo } from "@/lib/repositories";
import { useCollection } from "@/lib/hooks/use-collection";
import { maritalStatusLabel, MARITAL_STATUS_OPTIONS } from "@/lib/constants/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]?.toUpperCase()).join("");
}

export default function ClientesPage() {
  const router = useRouter();
  const { data: clients, loading } = useCollection(() => clientRepo.list());
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("todos");

  const filtered = (clients ?? []).filter((c) => {
    const matchesQuery =
      !query ||
      c.fullName.toLowerCase().includes(query.toLowerCase()) ||
      c.docNumber.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === "todos" || c.maritalStatus === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-display font-medium text-navy-900">Clientes</h1>
          <p className="mt-1 text-sm text-graphite-500">Gerencie os clientes do seu escritório.</p>
        </div>
        <Button onClick={() => router.push("/clientes/novo")} size="lg">
          <UserPlus className="h-4 w-4" /> Adicionar cliente
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome ou CPF/CNPJ"
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-56">
            <SelectValue placeholder="Filtrar por estado civil" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os estados civis</SelectItem>
            {MARITAL_STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!loading && filtered.length === 0 && (
        <EmptyState
          icon={Users}
          title={clients && clients.length > 0 ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
          description={
            clients && clients.length > 0
              ? "Ajuste os filtros de busca para encontrar o cliente desejado."
              : "Cadastre seu primeiro cliente para começar a gerar documentos."
          }
          action={
            !clients?.length ? (
              <Button onClick={() => router.push("/clientes/novo")}>
                <UserPlus className="h-4 w-4" /> Adicionar cliente
              </Button>
            ) : undefined
          }
        />
      )}

      {filtered.length > 0 && (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-mist-100">
            {filtered.map((client) => (
              <li key={client.id}>
                <Link
                  href={`/clientes/${client.id}`}
                  className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-ice-100"
                >
                  <div className="flex items-center gap-3.5">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{initials(client.fullName) || "?"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-navy-900">{client.fullName}</p>
                      <p className="text-xs text-graphite-500">
                        {client.docNumber}
                        {client.maritalStatus && ` · ${maritalStatusLabel(client.maritalStatus)}`}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-graphite-400" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {loading && (
        <Card className="overflow-hidden">
          <div className="divide-y divide-mist-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3.5 px-6 py-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
