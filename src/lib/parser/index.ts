export type { IParser, ParsedTask } from "./types";
export { RuleBasedParser } from "./rule-based";

// Active parser instance — swap this import for AI parser in the future
import { RuleBasedParser } from "./rule-based";
export const parser = new RuleBasedParser();
