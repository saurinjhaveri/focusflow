import type { Priority } from "@/types";

export interface ParsedTask {
  title: string;
  dueDate?: Date;
  followUpDate?: Date;
  priority?: Priority;
  personName?: string;
  tags?: string[];
  confidence: number;
}

export interface IParser {
  parse(raw: string): ParsedTask;
}
