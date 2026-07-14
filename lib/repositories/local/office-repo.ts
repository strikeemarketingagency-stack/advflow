import { Office, OfficeInput, OfficeRepository } from "@/lib/repositories/types";
import { readJson, writeJson, nowIso } from "@/lib/repositories/local/json-store";
import { userKey } from "@/lib/repositories/local/storage-keys";
import { getCurrentUserId } from "@/lib/repositories/local/session";

class LocalOfficeRepository implements OfficeRepository {
  async get(): Promise<Office | null> {
    const userId = getCurrentUserId();
    return readJson<Office | null>(userKey(userId, "office"), null);
  }

  async save(input: Partial<OfficeInput> & { onboardingComplete?: boolean }): Promise<Office> {
    const userId = getCurrentUserId();
    const key = userKey(userId, "office");
    const existing = readJson<Office | null>(key, null);
    const merged: Office = {
      userId,
      lawyerName: input.lawyerName ?? existing?.lawyerName ?? "",
      officeName: input.officeName ?? existing?.officeName ?? "",
      oab: input.oab ?? existing?.oab ?? "",
      state: input.state ?? existing?.state ?? "",
      city: input.city ?? existing?.city ?? "",
      specialty: input.specialty ?? existing?.specialty ?? "",
      phone: input.phone ?? existing?.phone ?? "",
      email: input.email ?? existing?.email ?? "",
      address: input.address ?? existing?.address ?? "",
      footerText: input.footerText ?? existing?.footerText ?? "",
      logoFileId: input.logoFileId ?? existing?.logoFileId ?? null,
      signatureFileId: input.signatureFileId ?? existing?.signatureFileId ?? null,
      onboardingComplete: input.onboardingComplete ?? existing?.onboardingComplete ?? false,
      createdAt: existing?.createdAt ?? nowIso(),
      updatedAt: nowIso(),
    };
    writeJson(key, merged);
    return merged;
  }
}

export const localOfficeRepo = new LocalOfficeRepository();
