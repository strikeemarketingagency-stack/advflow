export function timeGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export function firstName(fullName: string): string {
  const trimmed = fullName.trim();
  if (!trimmed) return "";
  const parts = trimmed.split(" ");
  return parts[0].replace(/^(Dr\.?|Dra\.?|Sr\.?|Sra\.?)$/i, parts[1] ?? parts[0]);
}
