import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LEDGER_PATH = join(__dirname, '..', 'ANALYTICS_LEDGER.md');

/**
 * Parses the ANALYTICS_LEDGER.md file line-by-line using soft regex.
 * Guarantees no crashes even if the Markdown table is malformed.
 */
export function parseAnalyticsLedger() {
  if (!existsSync(LEDGER_PATH)) {
    return { success: false, data: [], message: 'Ledger file does not exist.' };
  }

  try {
    const rawContent = readFileSync(LEDGER_PATH, 'utf-8');
    const lines = rawContent.split('\n');
    const records = [];

    // Line-by-line parsing to avoid rigid split crashes
    for (const line of lines) {
      // Matches standard markdown table rows: | col1 | col2 | ... |
      if (line.trim().startsWith('|') && !line.includes('---|')) {
        const parts = line.split('|').map(p => p.trim());
        
        // Ensure this is an active data row (should have at least 8 parts because of surrounding pipes)
        // Part 0 is empty (before first pipe), Part 1 is Date, Part 2 is Topic, etc.
        if (parts.length >= 9 && parts[1] !== 'Date') {
          const date = parts[1];
          const topic = parts[2];
          const archetype = parts[3];
          const style = parts[4];
          
          // Parse numbers, fallback to 0 if PENDING or empty
          const views = parseInt(parts[5], 10) || 0;
          const replies = parseInt(parts[6], 10) || 0;
          const likes = parseInt(parts[7], 10) || 0;
          const grade = parts[8];

          records.push({
            date,
            topic,
            archetype,
            style,
            views,
            replies,
            likes,
            grade
          });
        }
      }
    }

    return {
      success: true,
      data: records
    };
  } catch (error) {
    // Fail-safe protection: log error to stderr and return clean fallback empty list
    console.error(`⚠️ Analytics Parser Fail-Safe Triggered: ${error.message}`);
    return {
      success: false,
      data: [],
      error: error.message
    };
  }
}

/**
 * Summarizes the high and low performing strategies for prompt reinforcement.
 */
export function getAnalyticsReinforcement() {
  const result = parseAnalyticsLedger();
  if (!result.success || result.data.length === 0) {
    return '';
  }

  // Sort records by Likes + Replies (Engagement score)
  const sorted = [...result.data].sort((a, b) => (b.likes + b.replies) - (a.likes + a.replies));
  
  const highPerformers = sorted.slice(0, 3).filter(r => (r.likes + r.replies) > 0);
  const lowPerformers = sorted.slice(-3).reverse(); // lowest performers

  let reinforcement = `\n## Real-World Analytics Reinforcement (Live Metrics)\n`;
  reinforcement += `The creator's audience has interacted with past posts. Use this data to self-tune your tone:\n\n`;

  if (highPerformers.length > 0) {
    reinforcement += `### 👍 HIGH-PERFORMING ARCHETYPES (Do MORE of this):\n`;
    highPerformers.forEach(r => {
      reinforcement += `- Topic: "${r.topic}" | Archetype: [${r.archetype}] | Style: ${r.style} | Engagement: ${r.likes} likes, ${r.replies} replies | Grade: ${r.grade}\n`;
    });
    reinforcement += `\n`;
  }

  if (lowPerformers.length > 0) {
    reinforcement += `### 👎 LOW-PERFORMING ARCHETYPES (AVOID repeating these styles):\n`;
    lowPerformers.forEach(r => {
      reinforcement += `- Topic: "${r.topic}" | Archetype: [${r.archetype}] | Style: ${r.style} | Grade: ${r.grade}\n`;
    });
    reinforcement += `\n`;
  }

  return reinforcement;
}
