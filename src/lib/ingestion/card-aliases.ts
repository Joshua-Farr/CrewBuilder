/** Maps alternate card name spellings to canonical card codes. */
export const CARD_ALIASES: Record<string, string> = {
  "monkey.d.luffy": "OP09-061",
  "monkey d luffy": "OP09-061",
};

export const LEADER_ALIASES: Record<string, string> = {
  lucci: "Rob Lucci",
  "black lucci": "Rob Lucci",
  "rob lucci cp": "Rob Lucci",
  "by luffy": "B/Y Luffy",
  "b/y luffy": "B/Y Luffy",
  doffy: "Donquixote Doflamingo",
  "rp law": "R/P Trafalgar Law",
  enel: "Enel",
  blackbeard: "Marshall D. Teach",
};

export function resolveCardCode(codeOrName: string): string {
  const key = codeOrName.toLowerCase().trim();
  if (/^[A-Z]{2,3}\d{2}-\d{3}$/i.test(codeOrName)) return codeOrName.toUpperCase();
  return CARD_ALIASES[key] ?? codeOrName.toUpperCase();
}

export function resolveLeaderName(leader: string): string {
  const key = leader.toLowerCase().trim();
  return LEADER_ALIASES[key] ?? leader.trim();
}
