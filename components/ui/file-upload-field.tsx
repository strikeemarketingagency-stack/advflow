"use client";

import * as React from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { storageRepo } from "@/lib/repositories";
import { cn } from "@/lib/utils/cn";

interface FileUploadFieldProps {
  label: string;
  fileId: string | null;
  onChange: (fileId: string | null) => void;
  accept?: string;
  hint?: string;
  shape?: "square" | "wide";
}

function FileUploadField({ label, fileId, onChange, accept = "image/*", hint, shape = "square" }: FileUploadFieldProps) {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    let active = true;
    if (!fileId) {
      setPreviewUrl(null);
      return;
    }
    storageRepo.getUrl(fileId).then((url) => {
      if (active) setPreviewUrl(url);
    });
    return () => {
      active = false;
    };
  }, [fileId]);

  const handleFile = async (file: File) => {
    setLoading(true);
    try {
      const stored = await storageRepo.upload(file, file.name, file.type);
      onChange(stored.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-graphite-700">{label}</p>
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-mist-200 bg-ice-100 transition-colors hover:border-navy-800/30",
          shape === "square" ? "h-28 w-28" : "h-24 w-full"
        )}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-navy-800" />
        ) : previewUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt={label} className="h-full w-full object-contain p-2" />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1 text-graphite-700 shadow-soft hover:text-red-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center gap-1.5 text-graphite-500 hover:text-navy-800"
          >
            <ImagePlus className="h-5 w-5" strokeWidth={1.5} />
            <span className="text-xs">Enviar arquivo</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      {!previewUrl && !loading && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-xs font-medium text-navy-800 hover:underline w-fit"
        >
          Escolher arquivo
        </button>
      )}
      {hint && <p className="text-xs text-graphite-500">{hint}</p>}
    </div>
  );
}

export { FileUploadField };
