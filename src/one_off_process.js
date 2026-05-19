import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runAgent, saveOutput } from './agent.js';
import { loadMemory, syncMemoryFromBriefings, checkStageProgression } from './memory.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DROP_DIR = path.join(__dirname, '..', 'data_drop');
const QUEUE_FILE = path.join(__dirname, '..', 'QUEUE.md');

function detectFeedType(content) {
  const cleanContent = content.toLowerCase();
  
  // Heuristics for replies section
  const hasReplyingTo = cleanContent.includes("replying to") || cleanContent.includes("replying to @");
  const hasRepliesHeader = cleanContent.includes("## replies") || cleanContent.includes("### replies") || cleanContent.includes("\nreplies\n");
  const hasCommentSignals = cleanContent.includes("commented") || cleanContent.includes("replied") || cleanContent.includes("post your reply") || cleanContent.includes("# conversation");
  
  if (hasReplyingTo || hasRepliesHeader || hasCommentSignals) {
    return 'replies';
  }
  
  return 'timeline';
}

async function main() {
  const filename = 'timeline.md';
  const filePath = path.join(DROP_DIR, filename);
  
  if (!fs.existsSync(filePath)) {
    console.error(`File ${filePath} not found.`);
    process.exit(1);
  }

  console.log(`\n📥 Processing drop: ${filename}`);
  console.log(`⚙️  Initializing autonomous engine...`);
  
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Initialize memory
    const memory = loadMemory();
    syncMemoryFromBriefings(memory);
    checkStageProgression(memory);
    
    const feedType = detectFeedType(fileContent);
    console.log(`🔍 Detected feed type: ${feedType === 'replies' ? 'Tweet Replies Section' : 'Home / For You Timeline Feed'}`);
    
    let task = '';
    if (feedType === 'replies') {
      task = `ANALYZED TYPE: Tweet Replies Section
The system has automatically detected that this is a comment/replies section under a specific post.

Analyze the room's temperature and consensus using the VIBE_MATRIX.md rules. Apply the Critique Protocol (External Anti-Sycophancy) to formulate a contrarian take or a supportive Builder Nod, depending on the vibe.

Generate 3 different, high-converting outbound reply drafts to drop on this viral thread to siphon traffic.

CRITICAL REQUIREMENT (Native Reply Ranking & Brand Voice):
- Align the replies strictly with the X Reply Ranking Blueprint:
  1. Draft 1: The Sarcastic Mic-Drop / Contrarian Critique. Phone Post casing (lowercase-first, no trailing period), single paragraph, highly intelligent logic-reversal, with capitalized acronyms (e.g., AI, LLM, GPU).
  2. Draft 2: The Structured Value-Add. Pristine 1. / 2. list structure, professional casing, asking a deep architectural question to trigger replies.
  3. Draft 3: The Sniper Post / Builder Nod. A single sharp phrase or short line of supportive native slang.
- Do NOT output long-form tweets here; replies must remain highly native to comment sections to ensure maximum ranking potential.

Please output ONLY the 3 final reply drafts cleanly so they can be appended directly to the user's QUEUE.md. Do not output conversational filler.
Here is the raw replies data:
---
${fileContent.substring(0, 5000)}
---`;
    } else {
      task = `ANALYZED TYPE: Home / For You Timeline Feed
The system has automatically detected that this is a timeline feed drop.

Analyze the trending developer debates, tools, and visual layouts in this feed using the FEED_MATRIX.md rules.
Apply the Self-Critique Loop, Syntactic Entropy, and the Defensibility Check.

Generate 3 high-quality original drafts for our own timeline to post from @BuildWithFaizan. 

CRITICAL REQUIREMENT (X Premium Mix & Brand Voice):
We have an X Premium account, which gives us long-form posting capabilities. You must generate a diverse mix of lengths:
- Draft 1: A Premium Long-Form mini-essay (500–1000 characters). Format this with clean double line breaks, bold headers, and structured bullet points. Anchor it in an "IRL Bleed" (like loud laptop fans, cold coffee, or 2 AM debugging) or a smart historical analogy. Keep the language Naval-style (simple words, proper capitalization).
- Draft 2: A Medium-length thought (250–350 characters). Standard casing, opinionated, ending with a strong, reply-driving question.
- Draft 3: A Phone Post / Sniper take (100–200 characters). Rushed, lowercase-first, conversational casing, but with fully capitalized tech acronyms (e.g., AI, LLM, GPU). Perfect for a low-energy "Catastrophic L" or spiky, high-status one-liner.

Please output ONLY the 3 final drafts cleanly so they can be appended directly to the user's QUEUE.md. Do not include conversational filler.
Here is the raw feed data:
---
${fileContent.substring(0, 5000)}
---`;
    }

    console.log(`🧠 Processing data through the intelligence matrices...`);
    const output = await runAgent(task, memory);
    
    // Save the raw output to output/ for historical records
    saveOutput(output);
    
    // Append finalized drafts to QUEUE.md
    const queueHeader = `\n\n## 🤖 Autonomous Drop (${new Date().toISOString()})\n`;
    fs.appendFileSync(QUEUE_FILE, queueHeader + output, 'utf-8');
    console.log(`✅ Success! Drafts appended to QUEUE.md`);
    
    // Clean up the drop file
    fs.unlinkSync(filePath);
    console.log(`🧹 Cleaned up ${filename}.`);
    
  } catch (error) {
    console.error(`❌ Error processing ${filename}:`, error.message);
  }
}

main();
