/**
 * Memory — The agent's long-term brain.
 * 
 * Without memory, the agent is a goldfish — every run starts from zero.
 * With memory, it remembers:
 *   - Topics it already covered (avoids repetition)
 *   - Which tweets performed well (future: feedback loop)
 *   - The creator's voice preferences
 * 
 * Implementation: Simple JSON file. No database needed.
 * When MacBook arrives and you move to LangGraph, this becomes
 * a proper checkpoint store. For now, a file is perfect.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MEMORY_DIR = join(__dirname, '..', 'memory');
const MEMORY_FILE = join(MEMORY_DIR, 'agent-memory.json');

// ─────────────────────────────────────────────
// Default memory structure
// ─────────────────────────────────────────────
function createDefaultMemory() {
  return {
    createdAt: new Date().toISOString(),
    lastRunAt: null,
    totalRuns: 0,
    // Topics the agent already covered — prevents repetition
    coveredTopics: [],
    // Tweet drafts that were approved/posted (future: feedback loop)
    postedTweets: [],
    // Topics the user wants to avoid
    blockedTopics: [],
    // Voice preferences learned over time
    voiceNotes: [
      'Curious learner, not expert',
      'Uses lowercase hooks',
      'Asks genuine questions',
      'References personal experience',
    ],
    // Account stage affects content generation
    accountStage: 'launch', // 'launch' | 'ramping' | 'active'
    accountCreatedAt: null,
  };
}

// ─────────────────────────────────────────────
// Load memory from disk
// ─────────────────────────────────────────────
export function loadMemory() {
  if (!existsSync(MEMORY_DIR)) mkdirSync(MEMORY_DIR, { recursive: true });

  if (!existsSync(MEMORY_FILE)) {
    const memory = createDefaultMemory();
    saveMemory(memory);
    return memory;
  }

  try {
    return JSON.parse(readFileSync(MEMORY_FILE, 'utf-8'));
  } catch {
    console.log('⚠️  Memory file corrupted, creating fresh memory.');
    const memory = createDefaultMemory();
    saveMemory(memory);
    return memory;
  }
}

// ─────────────────────────────────────────────
// Save memory to disk
// ─────────────────────────────────────────────
export function saveMemory(memory) {
  if (!existsSync(MEMORY_DIR)) mkdirSync(MEMORY_DIR, { recursive: true });
  writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2), 'utf-8');
}

// ─────────────────────────────────────────────
// Record topics covered in this run
// ─────────────────────────────────────────────
export function recordTopics(memory, topics) {
  const now = new Date().toISOString();
  for (const topic of topics) {
    memory.coveredTopics.push({
      topic,
      date: now,
    });
  }

  // Keep only last 100 topics to prevent unbounded growth
  if (memory.coveredTopics.length > 100) {
    memory.coveredTopics = memory.coveredTopics.slice(-100);
  }

  memory.lastRunAt = now;
  memory.totalRuns++;
  saveMemory(memory);
}

// ─────────────────────────────────────────────
// Get recent topics for the system prompt
// ─────────────────────────────────────────────
export function getRecentTopics(memory, days = 3) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return memory.coveredTopics
    .filter((t) => new Date(t.date) > cutoff)
    .map((t) => t.topic);
}

// ─────────────────────────────────────────────
// Build memory context string for the system prompt
// ─────────────────────────────────────────────
export function getMemoryContext(memory) {
  const recentTopics = getRecentTopics(memory);
  const stage = memory.accountStage || 'launch';

  let context = `\n## Agent Memory\n`;
  context += `- Total runs so far: ${memory.totalRuns}\n`;
  context += `- Account stage: ${stage}\n`;

  if (recentTopics.length > 0) {
    context += `\n### Recently Covered Topics (DO NOT REPEAT these):\n`;
    context += recentTopics.map((t) => `- ${t}`).join('\n');
    context += `\n\nFind FRESH topics that are NOT in the above list.\n`;
  }

  if (memory.blockedTopics.length > 0) {
    context += `\n### Blocked Topics (NEVER cover these):\n`;
    context += memory.blockedTopics.map((t) => `- ${t}`).join('\n');
  }

  if (stage === 'launch') {
    context += `\n### LAUNCH MODE ACTIVE
The X account (@BuildWithFaizan) is BRAND NEW. Faizan just posted his pinned manifesto.

IMPORTANT CONTEXT about Faizan (use this in launch posts):
- He built an AI agent from scratch in ~150 lines of JavaScript
- Zero frameworks, zero dependencies — just a while loop
- Runs on an 8GB RAM laptop with NO GPU
- The agent researches HN/Reddit and writes tweet drafts
- He's genuinely learning — not pretending to be an expert
- His GitHub repo is called "learn-in-public-agent"

Generate an additional "Launch Posts" section with 3 tweets that:
- Reference his ACTUAL project and setup (not generic "hey everyone" intros)
- Each one reveals a specific, interesting detail about what he built
- Feel like natural follow-ups to his pinned manifesto
- NO hashtags, NO "hey everyone", NO "excited to be here"
- Include character counts

Example launch post style:
"day 1 update: i built my content engine in 150 lines of JS. no LangChain, no CrewAI. just a while loop that thinks, acts, and observes. that's literally how all AI agents work under the hood."`;
  }

  if (stage === 'ramping') {
    context += `\n### RAMP MODE ACTIVE
The X account is new but has some origin posts. Content should:
- Mix personal learning observations with curated AI news  
- Reference your own setup/experiments when relevant
- Still include occasional "for context, I'm learning AI from scratch" moments
- Gradually increase technical depth`;
  }

  return context;
}

// ─────────────────────────────────────────────
// Advance account stage based on run count
// ─────────────────────────────────────────────
export function checkStageProgression(memory) {
  const runs = memory.totalRuns;
  const oldStage = memory.accountStage;

  if (runs >= 14) {
    memory.accountStage = 'active';
  } else if (runs >= 4) {
    memory.accountStage = 'ramping';
  } else {
    memory.accountStage = 'launch';
  }

  if (oldStage !== memory.accountStage) {
    console.log(`📈 Account stage upgraded: ${oldStage} → ${memory.accountStage}`);
    saveMemory(memory);
  }
}

// ─────────────────────────────────────────────
// Scan previous briefings to extract covered topics
// ─────────────────────────────────────────────
export function syncMemoryFromBriefings(memory) {
  const outputDir = join(__dirname, '..', 'output');
  if (!existsSync(outputDir)) return;

  const files = readdirSync(outputDir).filter((f) => f.startsWith('briefing-'));
  const knownDates = memory.coveredTopics.map((t) => t.date?.split('T')[0]);

  // Only process files we haven't seen
  for (const file of files) {
    const dateMatch = file.match(/briefing-(\d{4}-\d{2}-\d{2})/);
    if (!dateMatch) continue;

    const fileDate = dateMatch[1];
    if (knownDates.includes(fileDate)) continue;

    try {
      const content = readFileSync(join(outputDir, file), 'utf-8');
      // Extract topic keywords from headers/bold text
      const topics = content.match(/\*\*([^*]+)\*\*/g)?.map((t) => t.replace(/\*/g, '')) || [];
      for (const topic of topics.slice(0, 5)) {
        memory.coveredTopics.push({ topic, date: `${fileDate}T00:00:00Z` });
      }
    } catch {
      // Skip unreadable files
    }
  }

  saveMemory(memory);
}
