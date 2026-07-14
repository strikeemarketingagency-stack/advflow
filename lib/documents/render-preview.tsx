import { TemplateBlock } from "@/lib/repositories/types";
import { cn } from "@/lib/utils/cn";

export interface DocumentLetterhead {
  officeName?: string;
  logoUrl?: string | null;
  signatureUrl?: string | null;
  footerText?: string;
}

function alignClass(align?: string, fallback: string = "text-left") {
  if (align === "center") return "text-center";
  if (align === "right") return "text-right";
  if (align === "left") return "text-left";
  return fallback;
}

function BlockView({ block, letterhead }: { block: TemplateBlock; letterhead: DocumentLetterhead }) {
  switch (block.type) {
    case "heading":
      return (
        <h2 className={cn("font-display text-lg font-semibold uppercase tracking-wide text-graphite-900", alignClass(block.align, "text-center"))}>
          {block.text}
        </h2>
      );
    case "clause":
      return (
        <p className={cn("font-display mt-4 text-base font-semibold text-graphite-900", alignClass(block.align, "text-left"))}>
          {block.text}
        </p>
      );
    case "list-item":
      return <p className={cn("pl-4 text-sm text-graphite-800 before:mr-2 before:content-['•']", alignClass(block.align, "text-left"))}>{block.text}</p>;
    case "signatureLine":
      return (
        <div className="mt-8 flex flex-col items-center gap-1">
          {block.imageRef === "signature" && letterhead.signatureUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={letterhead.signatureUrl} alt="Assinatura" className="h-14 object-contain" />
          )}
          <div className="h-px w-56 bg-graphite-300" />
        </div>
      );
    case "image":
      return block.imageRef === "logo" && letterhead.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={letterhead.logoUrl} alt="Logo" className="mx-auto h-16 object-contain" />
      ) : null;
    case "paragraph":
    default:
      return (
        <p className={cn("text-sm leading-[1.8] text-graphite-800", alignClass(block.align, "text-justify"))}>
          {block.text}
        </p>
      );
  }
}

export function DocumentPreview({ blocks, letterhead }: { blocks: TemplateBlock[]; letterhead: DocumentLetterhead }) {
  return (
    <div className="mx-auto w-full max-w-[720px] rounded-2xl border border-mist-200 bg-white shadow-[0_2px_8px_rgba(32,31,29,0.05),0_32px_64px_-24px_rgba(32,31,29,0.25)]">
      <div className="aspect-[1/1.414] w-full overflow-y-auto p-10 sm:p-14">
        <div className="flex flex-col gap-3">
          {letterhead.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={letterhead.logoUrl} alt="Logo do escritório" className="mx-auto mb-2 h-14 object-contain" />
          )}
          {letterhead.officeName && !letterhead.logoUrl && (
            <p className="text-center text-xs font-semibold uppercase tracking-widest text-graphite-500">
              {letterhead.officeName}
            </p>
          )}
          {blocks.map((block) => (
            <BlockView key={block.id} block={block} letterhead={letterhead} />
          ))}
          {letterhead.footerText && (
            <p className="mt-10 text-center text-xs text-graphite-500">{letterhead.footerText}</p>
          )}
        </div>
      </div>
    </div>
  );
}
