import type { StudyCard } from "@/types";

export function toStudyCards(items: any[]): StudyCard[] {
  return items as unknown as StudyCard[];
}
