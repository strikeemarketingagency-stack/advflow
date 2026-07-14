import { Badge } from "@/components/ui/badge";
import { DocumentStatus } from "@/lib/repositories/types";

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  if (status === "concluido") return <Badge variant="success">Concluído</Badge>;
  return <Badge variant="warning">Rascunho</Badge>;
}
