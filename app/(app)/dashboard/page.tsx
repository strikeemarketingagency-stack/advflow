"use client";

import * as React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Users, LibraryBig, FileText, ArrowUpRight, FilePlus2 } from "lucide-react";
import { clientRepo, documentRepo, templateRepo, activityRepo, officeRepo } from "@/lib/repositories";
import { useCollection } from "@/lib/hooks/use-collection";
import { timeGreeting } from "@/lib/utils/greeting";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

const ACTIVITY_ICON_LABEL: Record<string, string> = {
  client_created: "Cliente cadastrado",
  template_created: "Modelo criado",
  document_generated: "Documento gerado",
  office_updated: "Escritório atualizado",
};

export default function DashboardPage() {
  const { data: office } = useCollection(() => officeRepo.get());
  const { data: clients } = useCollection(() => clientRepo.list());
  const { data: documents } = useCollection(() => documentRepo.list());
  const { data: templates } = useCollection(() => templateRepo.list());
  const { data: activity } = useCollection(() => activityRepo.list(8));

  const lawyerName = office?.lawyerName || "";

  const stats = [
    { label: "Clientes", value: clients?.length ?? 0, icon: Users, href: "/clientes" },
    { label: "Documentos", value: documents?.length ?? 0, icon: FileText, href: "/historico" },
    { label: "Modelos", value: templates?.length ?? 0, icon: LibraryBig, href: "/modelos" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-display font-medium text-navy-900">
            {timeGreeting()}, {lawyerName ? `Dr(a). ${lawyerName}` : "bem-vindo(a)"}
          </h1>
          <p className="mt-1 text-sm text-graphite-500">
            Aqui está um resumo do seu escritório hoje.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/documentos/novo">
            <FilePlus2 className="h-4 w-4" /> Novo documento
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-ice-50"
          >
            <Card className="group transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-hover">
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm font-medium text-graphite-500">{stat.label}</p>
                  <p className="mt-1 text-3xl font-semibold tracking-tight text-navy-900">
                    {stat.value}
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ice-100 text-navy-800 group-hover:bg-navy-900 group-hover:text-white transition-colors">
                  <stat.icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-navy-900">Atividades recentes</h2>
            <Link
              href="/historico"
              className="flex items-center gap-1 text-sm font-medium text-navy-800 hover:underline"
            >
              Ver histórico <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {activity && activity.length > 0 ? (
            <ul className="flex flex-col divide-y divide-mist-100">
              {activity.map((item) => (
                <li key={item.id} className="flex items-center justify-between py-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-graphite-900">{item.message}</span>
                    <span className="text-xs text-graphite-500">
                      {ACTIVITY_ICON_LABEL[item.type] ?? "Atividade"}
                    </span>
                  </div>
                  <span className="text-xs text-graphite-500">
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: ptBR })}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={FileText}
              title="Nenhuma atividade ainda"
              description="Cadastre um cliente ou gere seu primeiro documento para começar."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
