"use client";

import Link from "next/link";
import { Star, MoreVertical, Copy, Trash2, Eye, Pencil, Lock } from "lucide-react";
import { Template } from "@/lib/repositories/types";
import { categoryLabel } from "@/lib/constants/template";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TemplateCardProps {
  template: Template;
  onToggleFavorite: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TemplateCard({ template, onToggleFavorite, onDuplicate, onDelete }: TemplateCardProps) {
  return (
    <Card className="group flex flex-col transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-hover">
      <CardContent className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="navy">{categoryLabel(template.category)}</Badge>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleFavorite(template.id)}
              className="rounded-lg p-1.5 text-graphite-400 hover:bg-gold-100 hover:text-gold-500"
            >
              <Star className={template.isFavorite ? "h-4 w-4 fill-gold-500 text-gold-500" : "h-4 w-4"} />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger className="rounded-lg p-1.5 text-graphite-400 hover:bg-mist-100 hover:text-navy-900">
                <MoreVertical className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/modelos/${template.id}`} className="flex items-center gap-2">
                    <Eye className="h-4 w-4" /> Visualizar
                  </Link>
                </DropdownMenuItem>
                {!template.isBuiltin && (
                  <DropdownMenuItem asChild>
                    <Link href={`/modelos/${template.id}?edit=1`} className="flex items-center gap-2">
                      <Pencil className="h-4 w-4" /> Editar
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onDuplicate(template.id)} className="flex items-center gap-2">
                  <Copy className="h-4 w-4" /> Duplicar
                </DropdownMenuItem>
                {!template.isBuiltin && (
                  <DropdownMenuItem destructive onClick={() => onDelete(template.id)} className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" /> Excluir
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Link
          href={`/modelos/${template.id}`}
          className="flex flex-1 flex-col gap-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/40 focus-visible:ring-offset-2"
        >
          <h3 className="text-sm font-semibold text-navy-900">{template.name}</h3>
          <p className="text-xs text-graphite-500">{template.variables.length} campos inteligentes</p>
        </Link>

        <div className="flex items-center gap-1.5 text-xs text-graphite-400">
          {template.isBuiltin && (
            <span className="flex items-center gap-1">
              <Lock className="h-3 w-3" /> Modelo AdvFlow
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
