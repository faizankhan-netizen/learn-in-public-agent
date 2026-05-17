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
// Gemini Flash provider
// ─────────────────────────────────────────────
async function callGemini(messages, options = {}) {
  const apiKey = ENV.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY not found. Create a .env file with:\nGEMINI_API_KEY=your_key_here\n\nGet a free key at: https://aistudio.google.com/apikey'
    );
  }

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
