export const USERS_KEY = "advflow:users";
export const SESSION_KEY = "advflow:session";

export function userKey(userId: string, base: string) {
  return `advflow:${userId}:${base}`;
}
