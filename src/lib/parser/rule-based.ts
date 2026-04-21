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

const MAX_PERSONS = 4;

// Match verb + first name. Broad verb list; false-positive names are filtered
// in the server action when matched against real persons in the DB.
const PERSON_REGEX = new RegExp(
  "\\b(?:" +
    "call|email|ping|message|msg|text|" +
    "tell|inform|notify|brief|" +
    "meet(?:ing)?(?:\\s+with)?|" +
    "talk(?:ing)?(?:\\s+to)?|" +
    "speak(?:ing)?(?:\\s+to)?|" +
    "contact|update|remind|ask|" +
    "sync(?:\\s+with)?|" +
    "send(?:\\s+to)?|" +
    "discuss(?:\\s+with)?|" +
    "check(?:\\s+in)?(?:\\s+with)?|" +
    "work\\s+with|coordinate\\s+with|align\\s+with|" +
    "loop\\s+in|cc|invite|include|with" +
  ")\\s+([A-Za-z]{2,})\\b",
  "i"
);

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

    // ── Extract person names (up to MAX_PERSONS) ─────────────────────────
    let personName: string | undefined;
    let personNames: string[] = [];
    let personLimitWarning = false;

    const firstMatch = input.match(PERSON_REGEX) ?? input.match(FOLLOWUP_PERSON_REGEX);
    if (firstMatch) {
      // Slice to the start of the first captured name, then greedily match
      // "Name [, Name]* [and Name]" — use \band\b so names like "Amanda"
      // aren't split mid-word.
      const afterVerb = input.slice(firstMatch.index! + firstMatch[0].length - firstMatch[1].length);
      const multiMatch = afterVerb.match(
        /^([A-Za-z]{2,})(?:\s*(?:,|\band\b)\s+[A-Za-z]{2,})*/i
      );
      if (multiMatch) {
        const extracted = multiMatch[0]
          .split(/\s*(?:,|\band\b)\s*/i)
          .map(n => n.trim())
          .filter(n => n.length >= 2);
        if (extracted.length > MAX_PERSONS) {
          personLimitWarning = true;
          personNames = extracted.slice(0, MAX_PERSONS);
        } else {
          personNames = extracted;
        }
        personName = personNames[0];
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
      personLimitWarning: personLimitWarning || undefined,
      tags: tags.length > 0 ? tags : undefined,
      confidence: Math.min(confidence, 1),
    };
  }
}
