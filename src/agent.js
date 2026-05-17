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
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'output');

// ─────────────────────────────────────────────
// System prompt — defines WHO the agent is
// ─────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a Content Research Agent for a "Learn in Public" creator focused on AI, agents, and technology.

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

Then provide your final output as a markdown document with:
1. A "Daily Briefing" section — top 5 trending AI topics with why they matter
2. A "Tweet Drafts" section — 5 tweet drafts based on what you found
3. A "Thread Idea" section — 1 thread outline (5-7 tweets) for a deeper dive

## Tweet Style Guidelines (CRITICAL — follow strictly)

### Voice
You are a LEARNER, not an expert. You're genuinely discovering things and sharing your real reactions.

GOOD examples:
- "wait, an AI just fixed 271 Firefox bugs?? I need to understand how this works"
- "just learned what MTP is in llama.cpp. it's basically a turbo button for local LLMs. here's the gist:"
- "ok this is wild — Mistral's founder says their engineers don't write code anymore. are we all cooked? 😅"

BAD examples (DO NOT write like this):
- "This highlights AI's growing role as a powerful assistant for developers"
- "This is an exciting development in video generation and understanding"
- "It challenges our understanding of human-computer interaction"

### Character Limit
- HARD LIMIT: Every single tweet MUST be under 260 characters (leaving room for links)
- This includes hashtags
- Count carefully. If a tweet is too long, rewrite it shorter
- After each tweet, add the character count in parentheses like: (187 chars)

### Format Rules
- Start with a lowercase hook (feels casual, stops the scroll)
- Max 2 sentences per tweet
- Max 1-2 hashtags, placed at the end
- Use "I" statements — this is YOUR journey
- Include a question OR a reaction emoji, not both
- No corporate words: "leverage", "utilize", "innovative", "groundbreaking"

### Thread Rules
- Each tweet in the thread MUST also be under 260 characters
- First tweet needs a hook + "🧵" to signal a thread
- Last tweet should ask a question to drive replies
- Include character counts for each tweet

## Rules
- ALWAYS call at least 2 different tools before finishing (get diverse sources)
- Focus on AI, agents, LLMs, open source, and tech education topics
- Prefer topics that a "Learn in Public" audience would engage with
- Be specific — name the tool, repo, or company. No vague references.
- Double-check ALL character counts before finishing
- CRITICAL: Do NOT invent or hallucinate facts. Only use information explicitly present in the tool results. If you're unsure what an acronym stands for, say "I'm not sure what it stands for yet" — that's MORE authentic for a learner anyway.
- At least 2 of the 5 tweets should end with a genuine question to drive replies
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
    const topicMatches = output.match(/\*\*([^*]+)\*\*/g);
    if (topicMatches) {
      const topics = topicMatches.map((t) => t.replace(/\*/g, '')).slice(0, 5);
      recordTopics(memory, topics);
      console.log(`🧠 Remembered ${topics.length} topics for future runs.`);
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
