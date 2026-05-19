import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// List of acronyms that MUST always be capitalized
const CORE_ACRONYMS = ['AI', 'SaaS', 'LLM', 'GPU', 'RAM', 'API', 'HN', 'IRL', 'IP', 'VCF', 'Vercel', 'JS', 'HTML', 'CSS'];

// Active Burned Words list from BRAND_GUIDELINES.md
const DEFAULT_BURNED_WORDS = ['jugaad', 'boilerplate', 'fundamentals', 'vibe coding'];

/**
 * Deterministically auto-corrects casing errors for technical acronyms.
 * Example: "ai is cool" -> "AI is cool"
 */
export function autoCorrectAcronyms(text) {
  if (!text || typeof text !== 'string') return '';
  
  let corrected = text;
  
  for (const acronym of CORE_ACRONYMS) {
    // Regex matches the word case-insensitively, keeping boundaries intact
    // Matches e.g. " ai " or " ai," or "ai." but not "air" or "mail"
    const regex = new RegExp(`\\b${acronym}\\b`, 'gi');
    corrected = corrected.replace(regex, acronym);
  }
  
  return corrected;
}

/**
 * Checks if the draft contains any currently active "Burned Words".
 */
export function findBurnedWords(text, customBurnedList = []) {
  if (!text || typeof text !== 'string') return [];
  
  const list = customBurnedList.length > 0 ? customBurnedList : DEFAULT_BURNED_WORDS;
  const found = [];
  
  for (const word of list) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    if (regex.test(text)) {
      found.push(word);
    }
  }
  
  return found;
}

/**
 * Main Linter Entrypoint
 * Validates a draft post and returns corrected text and any warnings.
 */
export function lintDraft(draftText, customBurnedList = []) {
  if (!draftText || typeof draftText !== 'string') {
    return { text: '', warnings: [], passed: true };
  }

  // 1. Run deterministic auto-corrections
  const corrected = autoCorrectAcronyms(draftText);

  // 2. Scan for Burned Words
  const burned = findBurnedWords(corrected, customBurnedList);
  const warnings = [];

  if (burned.length > 0) {
    warnings.push(`Draft contains burned/cooldown words: ${burned.map(w => `'${w}'`).join(', ')}`);
  }

  // 3. Structural checks: Warn if casual reply contains numbered bullet points
  if (corrected.includes('\n1.') && corrected.length < 200) {
    warnings.push('Draft is formatted as a structured list but seems to be a short outbound reply. Short replies should drop structured lists.');
  }

  return {
    text: corrected,
    warnings: warnings,
    passed: warnings.length === 0
  };
}
