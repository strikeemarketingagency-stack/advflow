"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut, Building2, Settings, ChevronDown, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-provider";
import { officeRepo } from "@/lib/repositories";
import { useCollection } from "@/lib/hooks/use-collection";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/ui/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { storageRepo } from "@/lib/repositories";
import Link from "next/link";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

export function Topbar({ title }: { title?: string }) {
  const router = useRouter();
  const { session, signOut } = useAuth();
  const { data: office } = useCollection(() => officeRepo.get());
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (office?.logoFileId) {
      storageRepo.getUrl(office.logoFileId).then(setLogoUrl);
    } else {
      setLogoUrl(null);
    }
  }, [office?.logoFileId]);

  const displayName = office?.lawyerName || session?.user.email || "";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-mist-100 bg-white/80 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-4">
        <Logo />
        {title && <h1 className="hidden text-base font-semibold text-navy-900 sm:block">{title}</h1>}
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden items-center gap-1.5 rounded-full border border-gold-200 bg-gold-50 px-3 py-1 text-xs font-medium text-gold-600 shadow-[0_0_0_1px_rgba(182,130,53,0.1),0_2px_10px_-2px_rgba(182,130,53,0.35)] sm:flex">
          <Sparkles className="h-3.5 w-3.5" />
          Plano Premium
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-2xl py-1.5 pl-1.5 pr-2.5 transition-colors hover:bg-mist-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/30">
            <Avatar className="h-8 w-8">
              {logoUrl && <AvatarImage src={logoUrl} alt={displayName} />}
              <AvatarFallback>{initials(displayName) || "AF"}</AvatarFallback>
            </Avatar>
            <span className="hidden max-w-[140px] truncate text-sm font-medium text-graphite-700 sm:block">
              {displayName}
            </span>
            <ChevronDown className="hidden h-3.5 w-3.5 text-graphite-500 sm:block" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/escritorio" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Meu Escritório
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/configuracoes" className="flex items-center gap-2">
                <Settings className="h-4 w-4" /> Configurações
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              destructive
              onClick={async () => {
                await signOut();
                router.replace("/login");
              }}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
