import './hijack.js';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Now it's safe to import llm.js since hijack.js ran first
import { chat } from './llm.js';
import { sanitizeTimelineInput } from './tools.js';
import { lintDraft } from './linter.js';
import { getAnalyticsReinforcement } from './analytics_parser.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Helper to dynamically read the local brand markdown files
function loadBrandContext() {
  try {
    const guidelines = readFileSync(join(__dirname, '..', 'BRAND_GUIDELINES.md'), 'utf-8');
    const vibe = readFileSync(join(__dirname, '..', 'VIBE_MATRIX.md'), 'utf-8');
    const feed = readFileSync(join(__dirname, '..', 'FEED_MATRIX.md'), 'utf-8');
    return `--- BRAND GUIDELINES ---\n${guidelines}\n\n--- VIBE MATRIX ---\n${vibe}\n\n--- FEED MATRIX ---\n${feed}`;
  } catch (e) {
    return "Error loading brand context files. Please ensure BRAND_GUIDELINES.md exists in the root.";
  }
}

const server = new Server(
  {
    name: "nexus-brand-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register the immutable brain tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_brand_context",
        description: "Returns the full text of BRAND_GUIDELINES.md, VIBE_MATRIX.md, and FEED_MATRIX.md to synchronize the Copilot's memory.",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "draft_brand_compliant_reply",
        description: "Takes a raw social media post or thread, applies the Sovereign Opinion Protocol and Self-Critique loop, and generates 3 perfectly formatted native replies for X.",
        inputSchema: {
          type: "object",
          properties: {
            threadText: {
              type: "string",
              description: "The raw text of the social media thread or post.",
            }
          },
          required: ["threadText"],
        },
      }
    ],
  };
});

// Execute the tools (Fast Single-Shot Generation)
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "get_brand_context") {
    return {
      content: [
        {
          type: "text",
          text: loadBrandContext(),
        },
      ],
    };
  }

  if (request.params.name === "draft_brand_compliant_reply") {
    const { threadText } = request.params.arguments;
    
    // Phase 1: Scrub timeline UI clutter safely
    const scrubbedInput = sanitizeTimelineInput(threadText);
    const brandContext = loadBrandContext();
    const analyticsReinforcement = getAnalyticsReinforcement();
    
    const prompt = `You are the core logic engine for the @BuildWithFaizan social media agent.
Your task is to analyze the provided social media thread, classify the room's vibe based on our VIBE MATRIX, apply our Sovereign Opinion and Self-Critique Protocols, and output exactly 3 outbound replies.

${brandContext}
${analyticsReinforcement}

CRITICAL RULES:
1. SOVEREIGN OPINION PROTOCOL: Decouple observation from sentiment. Do not mirror cynics. Form independent, constructive builder views.
2. NATIVE FORMATTING: Use lowercase-first casing (Phone Post style) for short replies. However, always capitalize technical acronyms (AI, LLM, GPU, RAM, API).
3. JSON ENCODING MANDATE: You MUST output your entire response as a valid, parsable JSON block matching the structure below. Do not wrap your response in any other text.

OUTPUT SCHEMA:
\`\`\`json
{
  "roomVibeAnalysis": "Classify the room vibe based on our VIBE MATRIX (Philosophical Bait, Technical Showcase, or Hype/Milestone) and briefly explain why.",
  "critiqueBlock": {
    "draft1": "Self-critique of Draft 1 (good, bad, defensibility check)",
    "draft2": "Self-critique of Draft 2 (good, bad, defensibility check)",
    "draft3": "Self-critique of Draft 3 (good, bad, defensibility check)"
  },
  "drafts": [
    "Draft 1 text here",
    "Draft 2 text here",
    "Draft 3 text here"
  ]
}
\`\`\`

RAW THREAD INPUT:
${scrubbedInput}`;

    try {
      // Direct call to our existing llm.js engine
      const response = await chat([{ role: "user", content: prompt }], { maxTokens: 8192 });
      
      // Parse structured JSON output
      let parsed;
      try {
        const cleanedJsonText = response
          .replace(/```json/gi, '')
          .replace(/```/gi, '')
          .trim();
        parsed = JSON.parse(cleanedJsonText);
      } catch (err) {
        parsed = {
          roomVibeAnalysis: "Failed to parse structured vibe analysis. Raw LLM response returned.",
          drafts: response.split('---').map(d => d.trim())
        };
      }

      // Phase 2: Programmatic linter pass (Auto-capitalization, burned words audit)
      const rawDrafts = parsed.drafts || [];
      const lintedDrafts = rawDrafts.map(d => lintDraft(d));

      // Build premium markdown breakdown for chat interface
      let outputMarkdown = `### 🎯 Room Vibe Classification\n`;
      outputMarkdown += `* **Classified Archetype:** ${parsed.roomVibeAnalysis || 'Unclassified'}\n\n`;

      outputMarkdown += `### 🤖 Outbound Reply Drafts\n`;
      lintedDrafts.forEach((res, index) => {
        outputMarkdown += `#### Draft ${index + 1}\n`;
        if (res.warnings.length > 0) {
          outputMarkdown += `> ⚠️ **Linter Warnings:**\n`;
          res.warnings.forEach(warn => {
            outputMarkdown += `> - ${warn}\n`;
          });
          outputMarkdown += `\n`;
        }
        outputMarkdown += `\`\`\`text\n${res.text}\n\`\`\`\n\n`;
      });

      return {
        content: [
          {
            type: "text",
            text: outputMarkdown.trim(),
          },
        ],
      };
    } catch (e) {
      return {
        content: [
          {
            type: "text",
            text: `Error generating draft: ${e.message}`,
          },
        ],
        isError: true
      };
    }
  }

  throw new Error("Unknown tool");
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Nexus Brand MCP Server successfully connected via stdio");
}

main().catch(console.error);
