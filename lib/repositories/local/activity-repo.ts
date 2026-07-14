import { ActivityItem, ActivityRepository, ActivityType } from "@/lib/repositories/types";
import { readJson, writeJson, newId, nowIso } from "@/lib/repositories/local/json-store";
import { userKey } from "@/lib/repositories/local/storage-keys";
import { getCurrentUserId } from "@/lib/repositories/local/session";

function key(userId: string) {
  return userKey(userId, "activity");
}

function getAll(userId: string): ActivityItem[] {
  return readJson<ActivityItem[]>(key(userId), []);
}

function saveAll(userId: string, items: ActivityItem[]) {
  writeJson(key(userId), items);
}

class LocalActivityRepository implements ActivityRepository {
  async list(limit = 10): Promise<ActivityItem[]> {
    const userId = getCurrentUserId();
    return getAll(userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }

  async log(type: ActivityType, message: string, entityId: string | null = null): Promise<ActivityItem> {
    const userId = getCurrentUserId();
    const item: ActivityItem = {
      id: newId(),
      userId,
      type,
      message,
      entityId,
      createdAt: nowIso(),
    };
    const all = getAll(userId);
    saveAll(userId, [item, ...all].slice(0, 200));
    return item;
  }
}

export const localActivityRepo = new LocalActivityRepository();
