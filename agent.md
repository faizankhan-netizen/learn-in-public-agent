# Agent Context — Agentic Workflow

> **Purpose:** This file is the persistent memory layer for this project. Every conversation reads this first. Every session updates it last.
> **Model Continuity:** If the current model's usage limit is reached, another model can pick up seamlessly by reading this file.

---

## Identity

- **Project:** Agentic Workflow
- **Workspace:** `d:\Agentic Workflow`
- **Created:** 2026-05-16
- **Stage:** Inception (Office Hours — COMPLETE ✅)
- **Status:** 🟢 Building — Phase 1 deepening (memory + launch sequence)
- **Mode:** Builder (Open Source + Research + Learning + Fun)

---

## GStack Templates (Auto-Referenced)

| Template | Path | Purpose |
|----------|------|---------|
| Project Guidelines | `/templates/PROJECT_GUIDELINES.md` | Core engineering rules |
| Design System | `/templates/DESIGN_SYSTEM.md` | UI rules (if we build a frontend) |
| Review Checklist | `/templates/REVIEW_CHECKLIST.md` | Quality gate guidelines |
| Security Audit | `/templates/SECURITY_AUDIT.md` | Security and hardening rules |

## Project Files

- [agent.js](file:///d:/Agentic%20Workflow/src/agent.js) — Core agent loop (Think-Act-Observe)
- [tools.js](file:///d:/Agentic%20Workflow/src/tools.js) — API connectors (HN, Reddit)
- [llm.js](file:///d:/Agentic%20Workflow/src/llm.js) — Abstraction layer for Gemini/Ollama
- [memory.js](file:///d:/Agentic%20Workflow/src/memory.js) — JSON persistent brain
- [DESIGN.md](file:///d:/Agentic%20Workflow/DESIGN.md) — Architectural decisions
- [LAUNCH_PLAYBOOK.md](file:///d:/Agentic%20Workflow/LAUNCH_PLAYBOOK.md) — Social launch roadmap
- [QUEUE.md](file:///d:/Agentic%20Workflow/QUEUE.md) — Staging area for approved upcoming posts
- [ARCHIVE.md](file:///d:/Agentic%20Workflow/ARCHIVE.md) — Historical record of published posts
- [X_ALGORITHM_CHEAT_SHEET.md](file:///d:/Agentic%20Workflow/X_ALGORITHM_CHEAT_SHEET.md) — Strategic rules for algorithmic growth
- [README.md](file:///d:/Agentic%20Workflow/README.md) — Public-facing GitHub introduction
- [JOURNEY.md](file:///d:/Agentic%20Workflow/JOURNEY.md) — Living decision log (debates, pivots, conclusions)
### Enforcement Rules

1. **The Journey Mandate**: Whenever you and Faizan debate a topic, pivot from an original plan, or make a strategic decision, you MUST immediately document it in `JOURNEY.md` from a first-person perspective. Do not wait for permission to log a decision.
2. **Every feature** follows the sprint pipeline: Think → Plan → Build → Review → Test → Ship → Reflect
3. **Every code change** is reviewed against `REVIEW_CHECKLIST.md` before ship
4. **Every new UI element** must conform to `DESIGN_SYSTEM.md` tokens (once populated)
5. **Security audit** runs before any deployment or public exposure
5. **Search Before Building** — always check for built-ins, best practices, and official docs first
6. **Boil the Lake** — complete implementation, no 90% shortcuts
7. **User Sovereignty** — present options, never act on architectural decisions unilaterally

---

## Project Definition

> **Status: CRYSTALLIZING — Wedge identified, refining scope**

- **What we're building:** The Content Engine — an AI agent pipeline that automates content research, ideation, and drafting for personal brand building on X (Twitter), with downstream repurposing to Instagram and YouTube Shorts
- **Who it's for:** The builder (personal brand + Nexus growth + learning)
- **Narrowest wedge:** Daily research briefing + 5 draft tweet ideas — the Research→Ideation→Draft pipeline
- **Mode:** Builder (open source / research / learning / fun)
- **Niche/Positioning:** Learn in Public — documenting the AI learning journey honestly, sharing experiments, failures, and discoveries
- **Platform Strategy:** X account `@BuildWithFaizan` (email: buildwithfaizan1@gmail.com) → repurpose winners to IG + YouTube Shorts later

### Vision Roadmap (Decided)

```
Phase 1: Content Engine 🧪 — Research + ideation + drafting agent pipeline (X-first)
Phase 2: Autonomous Crew 🚀 — Add publishing, analytics, and multi-platform repurposing
Phase 3: Agent Forge 🔨 — Build custom agents, deep understanding of agent primitives
```

### Refined Sequencing (Agreed)

1. **Foundation first (30 min):** Understand the universal agent loop (Think → Act → Observe → Repeat)
2. **Lab with a leash:** Anchor research to ONE specific real task — not open-ended exploration
3. **Crew grows from winners:** Extend proven agents into multi-task automation

### Content Engine Pipeline (Decided)

| Stage | Agent | Status |
|-------|-------|--------|
| 1. Research | Scans X, HN, Reddit for trending AI/education topics | 🔴 To Build |
| 2. Ideation | Generates ranked tweet/thread ideas from trends | 🔴 To Build |
| 3. Drafting | Writes first drafts in user's voice | 🔴 To Build |
| 4. Human Filter | User reviews, edits, approves (non-automatable) | — |
| 5. Publishing | Schedules and posts at optimal times | Phase 2 |
| 6. Analytics | Weekly performance reports + recommendations | Phase 2 |
| 7. Repurposing | X winners → Instagram carousels, YouTube Short scripts | Phase 2 |

### The Flywheel

```
Learn (Nexus research) → Create (X posts) → Grow (audience) → Drive (Nexus traffic) → Repeat
```

### Key Strategic Decisions

- **X (Twitter) first** — text-first, tech-native audience, fast feedback, API-friendly
- **One platform, then distribute** — don't create for 3 platforms, create for 1 and repurpose winners
- **Human filter is non-negotiable** — agents handle grunt work, authenticity stays human

### Open Questions (Resolved)

- ~~Niche/positioning~~ → **Learn in Public** — honest learner documenting the AI journey
- ~~X account status~~ → **New dedicated account** (existing personal account stays separate)
- **Handle selection** — user to decide (personal name vs. project name vs. concept name)

### Premises (All Validated ✅)

1. ✅ X is the primary platform; IG + YouTube Shorts come later via repurposing
2. ✅ First 2 weeks partially manual to establish voice before automating
3. ✅ Daily 5-10 min human review ritual; never full autopilot
4. ✅ Content IS the project — posting about building the Content Engine as first series
5. ✅ Open-source + free tiers only; X API ~$1/mo is the only exception (pay-per-use, no free tier exists)
6. ✅ Pipeline lives in this workspace, version-controlled, shareable as open-source content

### Tech Stack (Decided)

| Component | Tool | Cost |
|-----------|------|------|
| LLM Engine | Ollama (Phi-4 Mini 3.8B) | Free (local) |
| LLM Fallback | Gemini 2.5 Flash API (free tier) | Free |
| Agent Loop | Custom Node.js (from scratch) | Free |
| Trend Sources | Hacker News API, Reddit JSON | Free |
| Content Output | Local markdown files | Free |
| Posting (Phase 1) | X native scheduler / Buffer | Free |
| Posting (Phase 2) | X API pay-per-use | ~$1/mo |

> **Hardware: 8GB RAM, no GPU.** Ollama limited to ≤4B models. Hybrid strategy: Ollama for fast iteration + Gemini Flash free tier for quality drafts.
> **Upgrade planned:** MacBook Air expected next month → will unlock Qwen3:30b / Llama 4 Scout locally. Architecture is hardware-agnostic, just swap the model.

### Implementation Approach (Decided)

**Approach B: From-Scratch Agent** — Build the Think → Act → Observe loop manually in Node.js. No frameworks. ~100-150 lines of core logic. Teaches agent primitives deeply.

Graduation path: From-scratch → Add memory/analytics → Migrate to LangGraph.js when complexity warrants it.

### Content Strategy (Decided)

- **X Handle:** `@BuildWithFaizan` ✅ (secured)
- **Display Name:** Faizan Khan 🔨 (or similar)
- **Posting Frequency:** 2 tweets/day + 1 thread/week
- **Content Pillars:**
  1. 🔨 Building in Public — documenting what you’re building
  2. 🧪 Agent Experiments — testing tools, honest reviews
  3. 💡 Daily AI Discoveries — interesting repos, tools, trends
  4. 🎓 Learn → Teach — explaining what you just learned simply

Full design document: [DESIGN.md](file:///d:/Agentic%20Workflow/DESIGN.md)
Launch playbook: [LAUNCH_PLAYBOOK.md](file:///d:/Agentic%20Workflow/LAUNCH_PLAYBOOK.md)

---

## Architecture Decisions

| Date | Decision | Rationale | Status |
|------|----------|-----------|--------|
| 2026-05-16 | GStack templates adopted | Standardized quality gates from inception | ✅ Active |
| 2026-05-16 | Builder Mode selected | Project is research + learning + fun, not startup | ✅ Active |
| 2026-05-16 | Content Engine as wedge | Real task anchor: content creation for personal brand + Nexus | ✅ Active |
| 2026-05-16 | X-first strategy | Text-first, tech audience, fast feedback, agent-friendly API | ✅ Active |
| 2026-05-16 | One-platform-then-distribute | Create for X, repurpose winners to IG + YouTube Shorts | ✅ Active |
| 2026-05-16 | Foundation-first sequencing | 30 min on agent primitives before diving into tools | ✅ Planned |

---

## Current Sprint

- **Sprint:** 0 — Project Inception
- **Goal:** Define the narrowest wedge via Office Hours
- **Status:** In Progress
- **Blockers:** None

### Active Tasks

- [x] Complete Office Hours — Mode detection (Builder Mode ✅)
- [x] Builder Q1 — "What's the coolest version?" → Agent Lab selected
- [x] Builder Q2 — "What's the real task?" → Content Engine for X (personal brand + Nexus)
- [x] Builder Q3 — "Fastest path?" → Daily briefing + 5 draft tweets as MVP
- [x] Builder Q4 — Niche: Learn in Public. Account: New dedicated X handle
- [x] Validate premises (all 6 agreed ✅)
- [x] Generate implementation approaches (A: Scripts, B: From-Scratch Agent, C: LangGraph.js)
- [x] Produce design document → [DESIGN.md](file:///d:/Agentic%20Workflow/DESIGN.md)
- [x] Resolve open questions (hardware, handle, frequency, pillars)
- [x] User approves Approach B + content strategy ✅
- [ ] Populate PROJECT_GUIDELINES.md with project-specific values
- [x] Build the Content Engine MVP (from-scratch agent loop)
- [x] Create .env with Gemini API key
- [x] First agent run → generated briefing-2026-05-16.md ✅
- [x] Output quality review → 3 issues found and fixed in system prompt
- [x] Memory system built (topic tracking, account stage, anti-repetition)
- [x] Launch sequence strategy added (launch → ramping → active account stages)
- [ ] Run agent with memory + launch mode to see launch posts
- [ ] 🔴 Set up X profile (bio, pic, header) — follow LAUNCH_PLAYBOOK.md Phase 0
- [ ] Post pinned manifesto tweet
- [ ] Follow 50 accounts in AI/builder niche
- [ ] Populate PROJECT_GUIDELINES.md with project-specific values

---

## Session Log

| Date | Session | Key Outcomes |
|------|---------|-------------|
| 2026-05-16 23:46 | Inception | Created agent.md, GStack templates loaded, Office Hours initiated |
| 2026-05-16 23:50 | Office Hours Q1 | Builder Mode confirmed. Three-picture vision established (Lab → Crew → Forge) |
| 2026-05-16 23:54 | Office Hours Q2 | Sequencing refined: foundation first, lab with a leash |
| 2026-05-16 23:59 | Office Hours Q3 | Wedge crystallized: Content Engine for X. Pipeline defined (6 stages). Flywheel identified. X-first decided |
| 2026-05-17 00:06 | Office Hours Q4 | Niche locked: Learn in Public. New X account decided. 6 premises presented |
| 2026-05-17 00:10 | Office Hours Final | All premises validated. Three approaches generated. Approach B recommended. Design doc produced |
| 2026-05-17 00:30 | Open Questions Resolved | Hardware: 8GB RAM, no GPU → Phi-4 Mini + Gemini Flash hybrid. Handle: personal-name-based. Frequency: 2/day + 1 thread/week. 4 content pillars defined. DESIGN.md saved permanently |
| 2026-05-17 00:36 | **APPROVED** | Approach B approved. All documentation saved. MacBook Air upgrade planned next month |
| 2026-05-17 00:38 | **MVP BUILT** | Content Engine built: 3 files, ~400 lines, zero deps. agent.js + tools.js + llm.js |
| 2026-05-17 00:46 | **FIRST RUN** | Agent produced briefing. Tweets too long, voice too polished, thread busts char limit. Prompt refined |
| 2026-05-17 00:49 | **RUN 2 REVIEW** | Major improvement in tweets. Hallucination found (MTP acronym). Added anti-hallucination guard + engagement mandate + timestamp filenames |
| 2026-05-17 00:55 | **PHASE 1 DEEP** | Built memory system with topic tracking, account stage progression (launch→ramping→active), launch mode generates origin posts |
| 2026-05-17 00:59 | **LAUNCH PLAYBOOK** | Created LAUNCH_PLAYBOOK.md — complete step-by-step guide for account launch |
| 2026-05-17 01:28 | **HANDLE SECURED** | @BuildWithFaizan reserved on X. Email: buildwithfaizan1@gmail.com |
| 2026-05-17 11:13 | **REPO CREATED** | Created learn-in-public-agent on GitHub. Premium README.md generated |
| 2026-05-17 11:34 | **FIRST TWEET** | Pinned manifesto posted on @BuildWithFaizan with VS Code screenshot |
| 2026-05-17 11:45 | **RUN 4** | Launch mode worked. Tweets present but generic launch posts + hashtags. Fixed: tweets-first output format, banned hashtags, project-specific launch prompts |
| 2026-05-17 11:52 | **MULTI-KEY** | Added API key rotation with auto-failover in llm.js. Supports unlimited GEMINI_API_KEY* entries |
| 2026-05-17 11:58 | **VOICE PIVOT** | Switched from lowercase indie-hacker style to Naval Ravikant style: proper capitalization, plain English, jargon translation table. System prompt updated with simple-word mandates |
| 2026-05-17 12:02 | **JOURNEY FILE** | Created JOURNEY.md — living decision log capturing every debate, pivot, pushback, and conclusion. Rewrote to 1st-person perspective |
| 2026-05-17 12:12 | **X ALGORITHM** | Added fetchXAlgorithmRepo tool to pull updates from open-source X algorithm. Updated system prompt to enforce rules: line breaks for dwell time, questions for reply multiplier, NO external links in main tweet |
| 2026-05-17 12:41 | **REPLY AMMO** | Upgraded system prompt to generate "Reply Ammunition." Agent now generates 3 Naval-style insightful takes on daily trending news so Faizan has ready-made replies for big X accounts |
| 2026-05-17 12:45 | **503 FIX** | Updated llm.js to automatically catch Gemini 503 (High Demand) and 500+ server errors. Agent now applies a 5-second exponential backoff and retries instead of crashing |
| 2026-05-17 12:53 | **PHASE SHIFT** | Updated `agent-memory.json` accountStage to `ramping`. Officially pausing daily agent runs to stop burning API tokens and focus 100% on manual social execution (LAUNCH_PLAYBOOK Phase 1) |
| 2026-05-17 13:45 | **BRAND DECOUPLING** | Created `BRAND_GUIDELINES.md` as the single source of truth for the agent's voice, tone, and native reply strategy. Updated `src/agent.js` to dynamically load this file instead of hardcoding the personality |
| 2026-05-17 14:01 | **HISTORICAL ANALOGIES** | Added a new guideline to `BRAND_GUIDELINES.md` prompting the agent to ground opinions in smart, real-world historical parallels (like Covid, dot-com, early mobile) to sound 100% human and authoritative |
| 2026-05-17 15:38 | **SMART FARMING & ARCHIVE** | Created `ARCHIVE.md` to store successfully published posts. Established the "Smart Farming" protocol to survive the X Premium sandbox by leveraging micro-influencers and external velocity |
| 2026-05-17 18:29 | **POST #3 PUBLISHED** | Faizan successfully published Post #3 ("Writing code is only 10%...") and cleanly quote-chained it as Day 1 (PM) under his Pinned Manifesto |
| 2026-05-17 18:31 | **PREMIUM LIMITS UPGRADE** | Following X Premium verification, updated `src/agent.js` system prompt to transition from a hard 260-character limit to a soft 350-character limit, removing the tedious programmatic `(187 chars)` print rule |

---

## Update Protocol

> **Every session MUST:**
> 1. Read this file at start
> 2. Update `Current Sprint` and `Session Log` at end
> 3. Record any architecture decisions made
> 4. Update `Project Definition` as it crystallizes
> 5. Bump `Status` as the project progresses through stages

### Status Progression

```
🔴 Pre-Build — Defining the Wedge
🟡 Designed — Approach approved, ready to build
🟢 Building — Active development
🔵 Shipped — Live and iterating
```
