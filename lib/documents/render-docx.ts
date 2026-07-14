import { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType, BorderStyle, HeadingLevel } from "docx";
import { TemplateBlock } from "@/lib/repositories/types";

export interface DocxImageAsset {
  data: ArrayBuffer;
  type: "jpg" | "png" | "gif" | "bmp";
}

export interface RenderDocxContext {
  officeName?: string;
  footerText?: string;
  logo?: DocxImageAsset | null;
  signature?: DocxImageAsset | null;
}

function alignmentFor(align?: string) {
  if (align === "center") return AlignmentType.CENTER;
  if (align === "right") return AlignmentType.RIGHT;
  return AlignmentType.LEFT;
}

export async function renderDocx(blocks: TemplateBlock[], ctx: RenderDocxContext): Promise<Blob> {
  const children: Paragraph[] = [];

  if (ctx.logo) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        children: [
          new ImageRun({
            type: ctx.logo.type,
            data: ctx.logo.data,
            transformation: { width: 130, height: 60 },
          }),
        ],
      })
    );
  } else if (ctx.officeName) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        children: [new TextRun({ text: ctx.officeName.toUpperCase(), size: 18, color: "6B7280" })],
      })
    );
  }

  for (const block of blocks) {
    if (block.type === "image") continue;

    if (block.type === "signatureLine") {
      if (block.imageRef === "signature" && ctx.signature) {
        children.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 400 },
            children: [
              new ImageRun({
                type: ctx.signature.type,
                data: ctx.signature.data,
                transformation: { width: 150, height: 55 },
              }),
            ],
          })
        );
      }
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: ctx.signature && block.imageRef === "signature" ? 0 : 400 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "999999", space: 1 } },
          children: [new TextRun({ text: "                                        " })],
        })
      );
      continue;
    }

    const isHeading = block.type === "heading";
    const isClause = block.type === "clause";

    children.push(
      new Paragraph({
        alignment: alignmentFor(block.align ?? (isHeading ? "center" : "left")),
        heading: isHeading ? HeadingLevel.HEADING_2 : undefined,
        spacing: { after: 200, before: isClause ? 200 : 0 },
        children: [
          new TextRun({
            text: block.type === "list-item" ? `•  ${block.text ?? ""}` : block.text ?? "",
            bold: block.bold || isHeading || isClause,
            size: isHeading ? 26 : 22,
          }),
        ],
      })
    );
  }

  if (ctx.footerText) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 500 },
        children: [new TextRun({ text: ctx.footerText, size: 18, color: "6B7280" })],
      })
    );
  }

  const doc = new Document({
    sections: [{ children }],
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 22 },
        },
      },
    },
  });

  return Packer.toBlob(doc);
}
