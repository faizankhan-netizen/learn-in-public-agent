/**
 * Agent — The Think → Act → Observe loop.
 * 
 * THIS IS THE CORE. ~120 lines that do what LangGraph, CrewAI, and AutoGen 
 * do with thousands. Understanding this loop is understanding agents.
 * 
 * The loop:
 *   1. THINK: LLM receives context + available tools → decides what to do
 *   2. ACT:   We execute the tool the LLM chose
 *   3. OBSERVE: Results go back to the LLM as new context
 *   4. REPEAT: Until the LLM says "I have enough info, here's the output"
 * 
 * That's it. Every agent framework in the world is just this loop
 * with extra features bolted on (memory, retry, parallelism, etc.)
 */

import { chat } from './llm.js';
import { TOOLS, getToolDescriptions } from './tools.js';
import { loadMemory, saveMemory, getMemoryContext, recordTopics, checkStageProgression, syncMemoryFromBriefings } from './memory.js';
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'output');

// Load Brand Guidelines dynamically
const brandGuidelinesPath = join(__dirname, '..', 'BRAND_GUIDELINES.md');
const brandGuidelines = existsSync(brandGuidelinesPath) 
  ? readFileSync(brandGuidelinesPath, 'utf8') 
  : "Error loading brand guidelines.";

// ─────────────────────────────────────────────
// System prompt — defines WHO the agent is
// ─────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a Content Research Agent for a "Learn in Public" creator named Faizan (@BuildWithFaizan) focused on AI, agents, and technology.

Your job: Research trending AI topics and generate tweet drafts.

## Your Available Tools

You can call these tools to gather information:
${getToolDescriptions()}

## How to Use Tools

To call a tool, respond with EXACTLY this format (one tool per response):
TOOL_CALL: toolName
TOOL_ARGS: {"key": "value"}

Example:
TOOL_CALL: fetchHNTrending
TOOL_ARGS: {"count": 10}

## How to Finish

When you have gathered enough information, respond with:
DONE

Then provide your final output following this EXACT structure (tweets FIRST, briefing LAST):

---

## Tweet Drafts

1. [tweet text] (X chars)
2. [tweet text] (X chars)
3. [tweet text] (X chars)
4. [tweet text] (X chars)
5. [tweet text] (X chars)

## Thread Idea

**Topic:** [one-liner]

1/5 [tweet] (X chars) 🧵
2/5 [tweet] (X chars)
3/5 [tweet] (X chars)
4/5 [tweet] (X chars)
5/5 [tweet ending with a question] (X chars)

## Reply Ammunition

*(If you see big accounts talking about these trending topics today, here is a thoughtful, Naval-style reply you can drop in their comments to drive profile visits):*

1. **Topic:** [Topic 1]
   **Thoughtful Reply:** "[1-2 sentence insightful take or question]"
2. **Topic:** [Topic 2]
   **Thoughtful Reply:** "[1-2 sentence insightful take or question]"
3. **Topic:** [Topic 3]
   **Thoughtful Reply:** "[1-2 sentence insightful take or question]"

## Daily Briefing

| # | Topic | Source | Why it matters (1 sentence) |
|---|-------|--------|---------------------------|
| 1 | ... | HN/Reddit | ... |
| 2 | ... | HN/Reddit | ... |
| 3 | ... | HN/Reddit | ... |
| 4 | ... | HN/Reddit | ... |
| 5 | ... | HN/Reddit | ... |

---

## Tweet Style Guidelines (CRITICAL — follow strictly)

### Voice, Tone & Engagement Strategy
${brandGuidelines}

### Character Limit (Premium Optimized)
- SOFT LIMIT: Aim to keep every single tweet under 350 characters. While Premium allows longer posts, shorter posts are consumed faster, increasing dwell time and completions.
- Do NOT print character counts in parentheses (like '(187 chars)') at the end of drafts. Keep the drafts completely clean and copy-paste ready.

### Format Rules (X Algorithm Optimized)
- Use proper capitalization and punctuation (write like Naval, not like a teenager texting)
- Use line breaks between thoughts. White space increases reading time, which the X algorithm rewards.
- NO EXTERNAL LINKS. The X algorithm penalizes outbound links. If a topic has a link, write "[link in reply]" and do not include the URL in the draft.
- NO HASHTAGS. Zero. They look corporate on a new personal account.
- Use "I" statements — this is YOUR journey
- Include a question OR a reaction emoji, not both. (Questions are preferred to drive reply multipliers).
- No corporate words: "leverage", "utilize", "innovative", "groundbreaking", "exciting"
- Reference your actual setup when relevant (8GB laptop, no graphics card, from-scratch agent)

### Thread Rules
- Each tweet in the thread should be kept punchy and readable (ideally under 350 characters).
- First tweet needs a hook + "🧵" to signal a thread
- Last tweet should ask a question to drive replies

## Rules
- ALWAYS call at least 2 different tools before finishing (get diverse sources)
- Focus on AI, agents, LLMs, open source, and tech education topics
- Prefer topics that a "Learn in Public" audience would engage with
- Be specific — name the tool, repo, or company. No vague references.
- CRITICAL: Do NOT invent or hallucinate facts. Only use information explicitly present in the tool results. If you're unsure what an acronym stands for, say "I'm not sure what it stands for yet" — that's MORE authentic for a learner anyway.
- At least 2 of the 5 tweets should end with a genuine question to drive replies
- Keep the Daily Briefing section COMPACT — one sentence per topic in a table. All the detail goes into the tweets.
`;

// ─────────────────────────────────────────────
// Parse the LLM's response for tool calls
// ─────────────────────────────────────────────
function parseAgentResponse(response) {
  if (response.includes('DONE')) {
    // Extract everything after DONE
    const doneIndex = response.indexOf('DONE');
    const output = response.slice(doneIndex + 4).trim();
    return { type: 'done', output };
  }

  if (response.includes('TOOL_CALL:')) {
    const toolMatch = response.match(/TOOL_CALL:\s*(\w+)/);
    const argsMatch = response.match(/TOOL_ARGS:\s*(\{.*\})/s);

    if (toolMatch) {
      const toolName = toolMatch[1].trim();
      let toolArgs = {};
      try {
        if (argsMatch) toolArgs = JSON.parse(argsMatch[1]);
      } catch {
        // If args parsing fails, use defaults
      }
      return { type: 'tool_call', toolName, toolArgs };
    }
  }

  // If we can't parse, treat as thinking/reasoning — ask to continue
  return { type: 'continue', content: response };
}

// ─────────────────────────────────────────────
// THE AGENT LOOP — Think → Act → Observe
// ─────────────────────────────────────────────
export async function runAgent(task, memory = null) {
  const MAX_ITERATIONS = 8;
  let iteration = 0;

  // Inject memory context into the system prompt
  const memoryContext = memory ? getMemoryContext(memory) : '';
  const fullPrompt = SYSTEM_PROMPT + memoryContext;

  // Conversation history — this IS the agent's short-term "memory"
  const messages = [
    { role: 'system', content: fullPrompt },
    { role: 'user', content: task },
  ];

  console.log('\n🤖 Agent starting...');
  console.log(`📋 Task: ${task}\n`);

  while (iteration < MAX_ITERATIONS) {
    iteration++;
    console.log(`── Iteration ${iteration}/${MAX_ITERATIONS} ──`);

    // ── THINK: Ask the LLM what to do next ──
    console.log('💭 Thinking...');
    const response = await chat(messages);

    // Add the assistant's response to history
    messages.push({ role: 'assistant', content: response });

    // ── Parse the decision ──
    const decision = parseAgentResponse(response);

    if (decision.type === 'done') {
      // ── FINISH: Agent decided it has enough info ──
      console.log('✅ Agent finished!\n');
      return decision.output;
    }

    if (decision.type === 'tool_call') {
      // ── ACT: Execute the chosen tool ──
      const { toolName, toolArgs } = decision;

      if (!TOOLS[toolName]) {
        console.log(`❌ Unknown tool: ${toolName}`);
        messages.push({
          role: 'user',
          content: `Error: Tool "${toolName}" does not exist. Available tools: ${Object.keys(TOOLS).join(', ')}`,
        });
        continue;
      }

      console.log(`🔧 Calling tool: ${toolName}(${JSON.stringify(toolArgs)})`);
      const result = await TOOLS[toolName].fn(toolArgs);

      // ── OBSERVE: Feed results back to the LLM ──
      console.log(`📊 Got ${result.success ? 'results' : 'error'} from ${toolName}`);
      messages.push({
        role: 'user',
        content: `Tool "${toolName}" returned:\n${JSON.stringify(result, null, 2)}`,
      });
      continue;
    }

    // ── CONTINUE: LLM is reasoning, nudge it ──
    console.log('💭 Agent is reasoning, nudging to take action...');
    messages.push({
      role: 'user',
      content: 'Please call a tool or respond with DONE followed by your final output.',
    });
  }

  console.log('⚠️  Max iterations reached. Returning last output.');
  return messages[messages.length - 1].content;
}

// ─────────────────────────────────────────────
// Save output to markdown file
// ─────────────────────────────────────────────
export function saveOutput(content) {
  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().slice(0, 5).replace(':', '');
  const filename = `briefing-${date}-${time}.md`;
  const filepath = join(OUTPUT_DIR, filename);

  const header = `# Daily Briefing — ${date}\n\n> Generated by Content Engine Agent at ${now.toLocaleTimeString()}\n> Review, edit, and post the best ones!\n\n---\n\n`;
  writeFileSync(filepath, header + content, 'utf-8');

  console.log(`📝 Saved to: output/${filename}`);
  return filepath;
}

// ─────────────────────────────────────────────
// CLI entry point
// ─────────────────────────────────────────────
async function main() {
  // ── Load memory (long-term brain) ──
  const memory = loadMemory();
  syncMemoryFromBriefings(memory);
  checkStageProgression(memory);

  console.log(`\n📊 Agent memory: ${memory.totalRuns} previous runs | Stage: ${memory.accountStage}`);

  const task = `Research today's trending AI and technology topics. 
Gather information from multiple sources (Hacker News and Reddit).
Then generate a daily briefing with tweet drafts for a "Learn in Public" creator 
who is documenting their AI learning journey.
Focus on: AI agents, open source LLMs, developer tools, and tech education.`;

  try {
    const output = await runAgent(task, memory);
    const filepath = saveOutput(output);

    // ── Record what we covered (prevents repetition next run) ──
    const briefingLines = output.split('\n');
    const topics = [];
    for (const line of briefingLines) {
      const match = line.match(/^\|\s*\d+\s*\|\s*([^|]+?)\s*\|/);
      if (match) {
        topics.push(match[1].trim());
      }
    }

    if (topics.length > 0) {
      recordTopics(memory, topics.slice(0, 5));
      console.log(`🧠 Remembered ${Math.min(topics.length, 5)} topics for future runs.`);
    }

    console.log('\n🎉 Done! Review your briefing and pick the tweets to post.\n');
  } catch (error) {
    console.error('\n❌ Agent failed:', error.message);
    if (error.message.includes('GEMINI_API_KEY')) {
      console.log('\n📖 Setup guide:');
      console.log('1. Go to https://aistudio.google.com/apikey');
      console.log('2. Create a free API key');
      console.log('3. Create a .env file in the project root:');
      console.log('   GEMINI_API_KEY=your_key_here\n');
    }
    process.exit(1);
  }
}

main();
