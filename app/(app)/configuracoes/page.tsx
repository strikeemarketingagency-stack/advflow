"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut, DownloadCloud, UploadCloud, ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-provider";
import { exportBackup, importBackup } from "@/lib/repositories/local/backup";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ConfiguracoesPage() {
  const router = useRouter();
  const { session, signOut } = useAuth();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [exporting, setExporting] = React.useState(false);
  const [importing, setImporting] = React.useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const json = await exportBackup();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `advflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Backup exportado.");
    } catch {
      toast.error("Não foi possível exportar o backup.");
    } finally {
      setExporting(false);
    }
  };

  const handleImportFile = async (file: File) => {
    setImporting(true);
    try {
      const text = await file.text();
      await importBackup(text);
      toast.success("Backup importado. Recarregando...");
      setTimeout(() => window.location.reload(), 1000);
    } catch {
      toast.error("Não foi possível importar este arquivo de backup.");
    } finally {
      setImporting(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.replace("/login");
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-display text-display font-medium text-navy-900">Configurações</h1>
        <p className="mt-1 text-sm text-graphite-500">Gerencie sua conta e os dados do AdvFlow.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conta</CardTitle>
          <CardDescription>Informações de acesso à sua conta AdvFlow.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-4">
          <div className="flex items-center justify-between rounded-xl bg-ice-100 px-4 py-3">
            <span className="text-sm text-graphite-700">{session?.user.email}</span>
          </div>
          <Button variant="danger" className="w-fit" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Sair da conta
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backup dos dados</CardTitle>
          <CardDescription>
            Seus dados ficam salvos apenas neste navegador. Exporte um backup regularmente para não perder informações.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3 pt-4">
          <Button variant="secondary" onClick={handleExport} loading={exporting}>
            <DownloadCloud className="h-4 w-4" /> Exportar backup
          </Button>
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()} loading={importing}>
            <UploadCloud className="h-4 w-4" /> Importar backup
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImportFile(file);
              e.target.value = "";
            }}
          />
        </CardContent>
      </Card>

      <Card className="border-gold-500/30 bg-gold-100/40">
        <CardContent className="flex gap-3 p-5">
          <ShieldAlert className="h-5 w-5 shrink-0 text-gold-500" />
          <p className="text-sm text-graphite-700">
            Esta versão do AdvFlow armazena os dados localmente neste navegador, sem sincronização entre
            dispositivos. Evite cadastrar dados sensíveis de clientes reais até a integração com um backend
            seguro (Supabase) ser concluída.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
