import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runAgent, saveOutput } from './agent.js';
import { loadMemory, syncMemoryFromBriefings, checkStageProgression } from './memory.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DROP_DIR = path.join(__dirname, '..', 'data_drop');
const QUEUE_FILE = path.join(__dirname, '..', 'QUEUE.md');

// Ensure directories exist
if (!fs.existsSync(DROP_DIR)) {
  fs.mkdirSync(DROP_DIR, { recursive: true });
}

console.log(`\n👁️  Headless Watcher started. Monitoring: /data_drop`);
console.log(`Drop a Markdown export into this folder to trigger autonomous analysis.\n`);

let isProcessing = false;

fs.watch(DROP_DIR, async (eventType, filename) => {
  if (filename && filename.endsWith('.md') && eventType === 'rename') {
    const filePath = path.join(DROP_DIR, filename);
    
    // Check if file exists (rename triggers on both add and delete)
    // Also use a basic lock to prevent double-firing
    if (fs.existsSync(filePath) && !isProcessing) {
      isProcessing = true;
      console.log(`\n📥 Detected new drop: ${filename}`);
      console.log(`⚙️  Initializing autonomous engine...`);
      
      try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        
        // Initialize memory
        const memory = loadMemory();
        syncMemoryFromBriefings(memory);
        checkStageProgression(memory);
        
        const task = `A new Markdown feed export has been dropped into the system. 
Please analyze this timeline data using the FEED_MATRIX (if it is a timeline) or the VIBE_MATRIX (if it is a reply section).
Generate 3 final drafts applying the Self-Critique Loop, Syntactic Entropy, and the Defensibility Check.
Please output ONLY the 3 final drafts cleanly so they can be appended directly to the user's QUEUE.md. Do not output conversational filler.
Here is the raw Markdown data:
---
${fileContent.substring(0, 5000)}
---`;

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
        console.log(`🧹 Cleaned up ${filename}. Watching for next drop...`);
        
      } catch (error) {
        console.error(`❌ Error processing ${filename}:`, error.message);
      } finally {
        isProcessing = false;
      }
    }
  }
});
