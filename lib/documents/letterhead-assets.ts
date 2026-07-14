import { Office } from "@/lib/repositories/types";
import { storageRepo } from "@/lib/repositories";
import { blobToArrayBuffer, blobToDataUrl, mimeToDocxImageType } from "@/lib/documents/asset-utils";
import type { DocxImageAsset } from "@/lib/documents/render-docx";

export interface ResolvedLetterheadAssets {
  docxLogo: DocxImageAsset | null;
  docxSignature: DocxImageAsset | null;
  pdfLogoDataUrl: string | null;
  pdfSignatureDataUrl: string | null;
}

async function resolveAsset(fileId: string | null): Promise<{ arrayBuffer: ArrayBuffer; dataUrl: string; mimeType: string } | null> {
  if (!fileId) return null;
  const blob = await storageRepo.getBlob(fileId);
  if (!blob) return null;
  const [arrayBuffer, dataUrl] = await Promise.all([blobToArrayBuffer(blob), blobToDataUrl(blob)]);
  return { arrayBuffer, dataUrl, mimeType: blob.type };
}

export async function resolveLetterheadAssets(office: Office | null): Promise<ResolvedLetterheadAssets> {
  const [logo, signature] = await Promise.all([
    resolveAsset(office?.logoFileId ?? null),
    resolveAsset(office?.signatureFileId ?? null),
  ]);

  return {
    docxLogo: logo ? { data: logo.arrayBuffer, type: mimeToDocxImageType(logo.mimeType) } : null,
    docxSignature: signature ? { data: signature.arrayBuffer, type: mimeToDocxImageType(signature.mimeType) } : null,
    pdfLogoDataUrl: logo?.dataUrl ?? null,
    pdfSignatureDataUrl: signature?.dataUrl ?? null,
  };
}
