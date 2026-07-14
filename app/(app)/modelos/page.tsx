"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, LibraryBig, Star } from "lucide-react";
import { templateRepo } from "@/lib/repositories";
import { useCollection } from "@/lib/hooks/use-collection";
import { TEMPLATE_CATEGORIES } from "@/lib/constants/template";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TemplateCard } from "@/components/templates/template-card";

export default function ModelosPage() {
  const router = useRouter();
  const { data: templates, loading, reload } = useCollection(() => templateRepo.list());
  const [category, setCategory] = React.useState("todos");

  const filtered = (templates ?? []).filter((t) => {
    if (category === "favoritos") return t.isFavorite;
    if (category === "todos") return true;
    return t.category === category;
  });

  const handleToggleFavorite = async (id: string) => {
    await templateRepo.toggleFavorite(id);
    reload();
  };

  const handleDuplicate = async (id: string) => {
    const copy = await templateRepo.duplicate(id);
    toast.success(`Modelo duplicado como "${copy.name}".`);
    reload();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este modelo? Esta ação não pode ser desfeita.")) return;
    await templateRepo.remove(id);
    toast.success("Modelo excluído.");
    reload();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-display font-medium text-navy-900">Modelos</h1>
          <p className="mt-1 text-sm text-graphite-500">Sua biblioteca jurídica de modelos.</p>
        </div>
        <Button size="lg" onClick={() => router.push("/modelos/novo")}>
          <Plus className="h-4 w-4" /> Adicionar modelo
        </Button>
      </div>

      <Tabs value={category} onValueChange={setCategory}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="favoritos">
            <Star className="mr-1 h-3.5 w-3.5" /> Favoritos
          </TabsTrigger>
          {TEMPLATE_CATEGORIES.map((c) => (
            <TabsTrigger key={c.value} value={c.value}>
              {c.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {!loading && filtered.length === 0 && (
        <EmptyState
          icon={LibraryBig}
          title="Nenhum modelo encontrado"
          description="Adicione um novo modelo ou ajuste o filtro de categoria."
          action={
            <Button onClick={() => router.push("/modelos/novo")}>
              <Plus className="h-4 w-4" /> Adicionar modelo
            </Button>
          }
        />
      )}

      {filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onToggleFavorite={handleToggleFavorite}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
