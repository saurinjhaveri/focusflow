import type { IParser, ParsedTask } from "./types";
import type { Priority } from "@/types";
import { resolveRelativeDate } from "./date-resolver";

const DATE_PATTERN =
  "(?:today|tomorrow|yesterday|eod|end of day|next week|next month|" +
  "in \\d+ (?:day|days|week|weeks|month|months)|" +
  "(?:this|next) (?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)|" +
  "(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)|" +
  "(?:\\d{1,2}\\s*(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*)|" +
  "(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\\s*\\d{1,2})" +
  ")";

const DUE_REGEX = new RegExp(
  `\\b(?:by|due|on|before|deadline)\\s+(${DATE_PATTERN})`,
  "i"
);

const FOLLOWUP_REGEX = new RegExp(
  `\\b(?:follow[- ]?up|followup|f\\/u|check[- ]?in|remind me)\\s+(?:on\\s+|by\\s+|in\\s+)?(${DATE_PATTERN})`,
  "i"
);

const PRIORITY_PATTERNS: [RegExp, Priority][] = [
  [/\b(?:urgent|asap|critical|immediately|right away)\b/i, "URGENT"],
  [/\b(?:high[- ]?priority|important|high)\b/i, "HIGH"],
  [/\b(?:low[- ]?priority|whenever|low|not urgent)\b/i, "LOW"],
];

// Match verb + single name word (any case). Single word avoids capturing
// trailing prepositions like "on", "for", "about" as part of the name.
const PERSON_REGEX =
  /\b(?:call|email|ping|message|msg|meet(?:ing)? with|talk to|speak(?:ing)? to|contact|update|remind|ask|notify|with)\s+([A-Za-z]{2,})\b/i;

// Specifically handles "follow up to/with/for Name" at the start of input
const FOLLOWUP_PERSON_REGEX =
  /^\s*(?:follow[- ]?up|followup|f\/u)\s+(?:with|to|for)\s+([A-Za-z]{2,})\b/i;

const TAG_REGEX = /#([a-zA-Z][a-zA-Z0-9_-]*)/g;

// Phrases to strip from the title after extraction
const STRIP_PATTERNS = [
  DUE_REGEX,
  FOLLOWUP_REGEX,
  /\b(?:urgent|asap|critical|immediately|right away)\b/gi,
  /\b(?:high[- ]?priority|low[- ]?priority)\b/gi,
  /#[a-zA-Z][a-zA-Z0-9_-]*/g,
];

export class RuleBasedParser implements IParser {
  parse(raw: string): ParsedTask {
    const input = raw.trim();
    let confidence = 0.4; // baseline

    // ── Extract due date ──────────────────────────────────────────────────
    let dueDate: Date | undefined;
    const dueMatch = input.match(DUE_REGEX);
    if (dueMatch) {
      dueDate = resolveRelativeDate(dueMatch[1]);
      if (dueDate) confidence += 0.15;
    }

    // ── Extract follow-up date ────────────────────────────────────────────
    let followUpDate: Date | undefined;
    const followUpMatch = input.match(FOLLOWUP_REGEX);
    if (followUpMatch) {
      followUpDate = resolveRelativeDate(followUpMatch[1]);
      if (followUpDate) confidence += 0.1;
    }

    // When input starts with "follow up", the date is both the follow-up date
    // and the task due date so it shows in Today/Weekly/Monthly views too
    if (/^\s*(?:follow[- ]?up|followup|f\/u)\b/i.test(input)) {
      if (!followUpDate && dueDate) {
        followUpDate = dueDate;
      } else if (!followUpDate) {
        followUpDate = new Date();
        followUpDate.setHours(9, 0, 0, 0);
      }
      // Always keep dueDate in sync with followUpDate
      dueDate = followUpDate;
    }

    // ── Extract priority ──────────────────────────────────────────────────
    let priority: Priority | undefined;
    for (const [pattern, p] of PRIORITY_PATTERNS) {
      if (pattern.test(input)) {
        priority = p;
        confidence += 0.1;
        break;
      }
    }

    // ── Extract person names (supports multiple: "Mitul and Jay") ─────────
    let personName: string | undefined;
    let personNames: string[] = [];

    const firstMatch = input.match(PERSON_REGEX) ?? input.match(FOLLOWUP_PERSON_REGEX);
    if (firstMatch) {
      // From the match position, look for "Name and Name" or "Name, Name" pattern
      const afterVerb = input.slice(firstMatch.index! + firstMatch[0].length - firstMatch[1].length);
      const multiRe = /([A-Za-z]{2,})(?:\s*(?:,|and)\s*([A-Za-z]{2,}))*\b/gi;
      const multiMatch = afterVerb.match(/^([A-Za-z]{2,})(?:\s*(?:,|and)\s+([A-Za-z]{2,}))*/i);
      if (multiMatch) {
        // Extract all individual names from "Name, Name and Name"
        const nameStr = multiMatch[0];
        const extracted = nameStr.split(/\s*(?:,|and)\s*/i).map(n => n.trim()).filter(n => n.length >= 2);
        personNames = extracted;
        personName = extracted[0];
      } else {
        personName = firstMatch[1];
        personNames = [firstMatch[1]];
      }
      confidence += 0.1;
    }

    // ── Extract tags ──────────────────────────────────────────────────────
    const tags: string[] = [];
    let tagMatch: RegExpExecArray | null;
    const tagRe = new RegExp(TAG_REGEX.source, "g");
    while ((tagMatch = tagRe.exec(input)) !== null) {
      tags.push(tagMatch[1].toLowerCase());
      confidence += 0.05;
    }

    // ── Build clean title ─────────────────────────────────────────────────
    let title = input;
    for (const pattern of STRIP_PATTERNS) {
      title = title.replace(pattern, " ");
    }
    // Clean up double spaces and trim
    title = title.replace(/\s{2,}/g, " ").trim();
    // Remove trailing punctuation artifacts
    title = title.replace(/[,;:.]+$/, "").trim();

    if (title.length > 0) confidence += 0.1;

    return {
      title: title || input,
      dueDate,
      followUpDate,
      priority,
      personName,
      personNames: personNames.length > 0 ? personNames : undefined,
      tags: tags.length > 0 ? tags : undefined,
      confidence: Math.min(confidence, 1),
    };
  }
}
