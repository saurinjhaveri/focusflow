import type { Priority } from "@/types";

export interface ParsedTask {
  title: string;
  dueDate?: Date;
  followUpDate?: Date;
  priority?: Priority;
  personName?: string;
  personNames?: string[];       // all detected names, capped at MAX_PERSONS
  personLimitWarning?: boolean; // true when input named more than MAX_PERSONS people
  tags?: string[];
  confidence: number;
}

export interface IParser {
  parse(raw: string): ParsedTask;
}
