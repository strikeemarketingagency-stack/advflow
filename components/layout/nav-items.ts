import {
  LayoutDashboard,
  Users,
  LibraryBig,
  FilePlus2,
  History,
  Building2,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/modelos", label: "Modelos", icon: LibraryBig },
  { href: "/documentos/novo", label: "Novo Documento", icon: FilePlus2 },
  { href: "/historico", label: "Histórico", icon: History },
  { href: "/escritorio", label: "Meu Escritório", icon: Building2 },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];
