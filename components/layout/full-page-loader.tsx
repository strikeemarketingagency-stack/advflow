import { Loader2 } from "lucide-react";

export function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ice-50">
      <Loader2 className="h-6 w-6 animate-spin text-navy-800" />
    </div>
  );
}
