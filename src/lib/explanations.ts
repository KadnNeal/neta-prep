export type OptionKey = "a" | "b" | "c" | "d";
export type OptionExplanations = Record<OptionKey, string>;

export const OPTION_KEYS: readonly OptionKey[] = ["a", "b", "c", "d"];

/** Columns to add to a questions select so `paidOptionExplanations` can run. */
export const OPTION_EXPLANATION_COLUMNS = "option_explanations, answer_key_flag";

/**
 * Per-choice explanations are a paid feature (S43), so they're only sent to the client
 * for active Pro users — never shipped and hidden. Questions whose answer key was flagged
 * by the generator stay hidden until reviewed (answer_key_flag cleared).
 */
export function paidOptionExplanations(
  row: { option_explanations?: unknown; answer_key_flag?: string | null },
  isPro: boolean,
): OptionExplanations | null {
  if (!isPro || row.answer_key_flag) return null;
  const value = row.option_explanations as Partial<Record<OptionKey, unknown>> | null | undefined;
  if (!value || !OPTION_KEYS.every((k) => typeof value[k] === "string" && (value[k] as string).trim())) {
    return null;
  }
  return value as OptionExplanations;
}
