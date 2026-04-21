import type { Priority } from "@/types";

export interface ParsedTask {
  title: string;
  dueDate?: Date;
  followUpDate?: Date;
  priority?: Priority;
  personName?: string;
  personNames?: string[];  // all detected names (superset of personName)
  tags?: string[];
  confidence: number;
}

export interface IParser {
  parse(raw: string): ParsedTask;
}
