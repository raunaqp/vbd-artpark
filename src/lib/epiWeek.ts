// Epi-week helpers — translate ISO dates to W## labels using EPI_WEEKS array.
import { EPI_WEEKS, WEEK_ENDINGS } from "@/data/mock_dataset";

export function getEpiWeekForDate(dateStr: string): string {
  const idx = WEEK_ENDINGS.indexOf(dateStr);
  return idx >= 0 ? EPI_WEEKS[idx] : "";
}

export function formatDateWithEpiWeek(dateStr: string): string {
  const epi = getEpiWeekForDate(dateStr);
  return epi ? `${dateStr} (${epi})` : dateStr;
}

/** Returns "W18-W22" or empty if not found */
export function epiWeekRange(fromDate: string, toDate: string): string {
  const a = getEpiWeekForDate(fromDate);
  const b = getEpiWeekForDate(toDate);
  if (!a && !b) return "";
  if (a && b) return `${a}–${b}`;
  return a || b;
}

/** Latest available epi-week label */
export function latestEpiWeek(): string {
  return EPI_WEEKS[EPI_WEEKS.length - 1];
}

/** Latest week-ending date */
export function latestWeekEnding(): string {
  return WEEK_ENDINGS[WEEK_ENDINGS.length - 1];
}
