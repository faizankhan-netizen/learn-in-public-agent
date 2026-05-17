/**
 * LLM — The agent's brain.
 * 
 * Handles communication with the LLM (Gemini Flash free tier).
 * Designed to be swappable — when you get the MacBook,
 * just add an Ollama provider and switch.
 * 
 * Zero dependencies. Uses native fetch().
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─────────────────────────────────────────────
// Load API key from .env file (simple, no dotenv needed)
// ─────────────────────────────────────────────
function loadEnv() {
  const envPath = join(__dirname, '..', '.env');
  if (!existsSync(envPath)) return {};

  const env = {};
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, '');
    env[key] = value;
  }
  return env;
}

const ENV = loadEnv();

// ─────────────────────────────────────────────
// Gemini API Key Pool — automatic rotation
// ─────────────────────────────────────────────
function loadGeminiKeys() {
  const keys = [];

  // Collect all GEMINI_API_KEY* entries from .env
  for (const [envKey, value] of Object.entries(ENV)) {
    if (envKey.startsWith('GEMINI_API_KEY') && value) {
      keys.push(value);
    }
  }

  // Also check process.env as fallback
  if (keys.length === 0 && process.env.GEMINI_API_KEY) {
    keys.push(process.env.GEMINI_API_KEY);
  }

  return keys;
}

const GEMINI_KEYS = loadGeminiKeys();
let currentKeyIndex = 0;

function getNextKey() {
  if (GEMINI_KEYS.length === 0) {
    throw new Error(
      'No GEMINI_API_KEY found. Create a .env file with:\nGEMINI_API_KEY=your_key_here\n\nGet a free key at: https://aistudio.google.com/apikey'
    );
  }

  const key = GEMINI_KEYS[currentKeyIndex];
  return key;
}

function rotateKey() {
  const oldIndex = currentKeyIndex;
  currentKeyIndex = (currentKeyIndex + 1) % GEMINI_KEYS.length;

  // If we've cycled back to the first key, all keys are exhausted
  if (currentKeyIndex === 0 && oldIndex !== 0) {
    console.log('⚠️  All API keys exhausted. Waiting 30s before retrying...');
    return { exhausted: true };
  }

  console.log(`🔄 Rotating to API key ${currentKeyIndex + 1}/${GEMINI_KEYS.length}`);
  return { exhausted: false };
}

console.log(`🔑 Loaded ${GEMINI_KEYS.length} Gemini API key(s)`);

// ─────────────────────────────────────────────
// Gemini Flash provider (with auto-failover)
// ─────────────────────────────────────────────
async function callGemini(messages, options = {}, retryCount = 0) {
  const apiKey = getNextKey();
  const model = options.model || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  // Convert our message format to Gemini's format
  const contents = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  // System instruction goes separately
  const systemMessage = messages.find((m) => m.role === 'system');

  const body = {
    contents,
    generationConfig: {
      temperature: options.temperature || 0.7,
      maxOutputTokens: options.maxTokens || 4096,
    },
  };

  if (systemMessage) {
    body.systemInstruction = { parts: [{ text: systemMessage.content }] };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  // Auto-rotate on rate limit (429) or quota exceeded (403), or retry on server error (500+)
  if (res.status === 429 || res.status === 403 || res.status >= 500) {
    const maxRetries = GEMINI_KEYS.length * 2 + 3; // Allow extra retries for server errors
    if (retryCount >= maxRetries) {
      throw new Error(`Gemini API error (${res.status}). Max retries reached. Try again later.`);
    }

    // If it's a server error (like 503 High Demand), wait and retry without burning a key rotation
    if (res.status >= 500) {
      console.log(`\n⚠️ Gemini API high demand (${res.status}). Waiting 5 seconds before retrying...`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
      return callGemini(messages, options, retryCount + 1);
    }

    const { exhausted } = rotateKey();

    if (exhausted) {
      // All keys tried — wait 30s then try from the start again
      console.log(`\n⚠️ All keys exhausted. Waiting 30s before retrying...`);
      await new Promise((resolve) => setTimeout(resolve, 30000));
    }

    return callGemini(messages, options, retryCount + 1);
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errorText}`);
  }

  const data = await res.json();

  if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
    throw new Error(`Gemini returned no content: ${JSON.stringify(data)}`);
  }

  return data.candidates[0].content.parts[0].text;
}


// ─────────────────────────────────────────────
// Ollama provider (for when MacBook arrives)
// ─────────────────────────────────────────────
async function callOllama(messages, options = {}) {
  const model = options.model || 'phi4-mini';
  const url = 'http://localhost:11434/api/chat';

  const body = {
    model,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    stream: false,
    options: {
      temperature: options.temperature || 0.7,
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Ollama error (${res.status}). Is Ollama running?`);
  }

  const data = await res.json();
  return data.message.content;
}

// ─────────────────────────────────────────────
// Unified LLM interface
// ─────────────────────────────────────────────
export async function chat(messages, options = {}) {
  const provider = options.provider || ENV.LLM_PROVIDER || 'gemini';

  if (provider === 'ollama') {
    return callOllama(messages, options);
  }

  return callGemini(messages, options);
}
