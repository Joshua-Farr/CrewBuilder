/** Canonical op-set code for the live competitive meta shown on the homepage. */
export const CURRENT_META_OP_SET = "OP16";

/** Display label for set codes, e.g. OP16 → OP-16. */
export function formatOpSetLabel(opSet: string) {
  const normalized = opSet.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  const match = normalized.match(/^([A-Z]+)(\d+)$/);
  if (!match) return opSet;
  return `${match[1]}-${match[2]}`;
}
