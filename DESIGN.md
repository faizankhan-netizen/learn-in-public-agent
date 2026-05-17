# Design: The Content Engine

Generated on 2026-05-17
Status: APPROVED
Mode: Builder (Open Source + Research + Learning + Fun)

---

## Problem Statement

The builder wants to enter the content creation world with a "Learn in Public" positioning on X (Twitter), documenting their AI learning journey. Content creation is time-consuming — research, ideation, writing, scheduling — and the builder wants AI agents to handle the grunt work so they can focus on authenticity and learning. This also drives traffic to their existing Nexus education platform, creating a flywheel.

## What Makes This Cool

- **Meta-learning**: Building AI agents to help you create content about AI. The project IS the content.
- **The Flywheel**: Learn → Create → Grow → Drive Nexus traffic → Repeat. One effort, two outcomes.
- **Real agent education**: Not theoretical — you learn agents by building one that solves YOUR problem.
- **Compounding returns**: Post #1 you're unknown. Post #200 you're the person who documented the entire journey.

---

## Constraints

### Technical
- **$0 budget** — open-source tools and free tiers only (with one exception noted below)
- **Node.js native** — builder's primary language (Nexus is Node.js)
- **Windows 11** — development environment
- **8GB RAM, no dedicated GPU** — constrains local LLM model size (see Tech Stack)

### Platform Reality (Critical Finding)

> [!WARNING]
> **X API has NO free tier.** As of 2026, X uses pay-per-use pricing:
> - Post creation: ~$0.01–0.015/request
> - Post reads: ~$0.005/request
> - No free access for new developers

**Impact on Premise #5 ($0 cost):** Publishing automation will have a small cost. At 2 posts/day, that's ~$0.60–0.90/month. Negligible, but not $0.

**Alternatives considered:**
| Option | Viability |
|--------|-----------|
| X native scheduler (browser) | ✅ Free, manual, good for Phase 1 |
| Buffer free plan | ✅ Free scheduling, limited features |
| X API pay-per-use | ✅ ~$1/month, full automation |
| Unofficial scraping/GraphQL | ❌ Account ban risk, fragile |

**Recommendation:** Phase 1 uses X's built-in scheduler (free). Phase 2 adds API when automation is proven valuable (~$1/mo is acceptable).

### Time
- First 2 weeks: partially manual (establish voice)
- Daily commitment: 5-10 minute review ritual
- Build timeline: MVP in 1-2 sessions

---

## Premises (All Agreed ✅)

1. X (Twitter) is the primary platform; IG + YouTube Shorts via repurposing later
2. First 2 weeks partially manual to establish voice before automating
3. Daily 5-10 min human review ritual; never full autopilot
4. Content IS the project — building this engine is the first content series
5. Open-source + free tiers (X API ~$1/mo is the only exception)
6. Pipeline lives in workspace, version-controlled, shareable as open-source

---

## Approaches Considered

### Approach A: The Script Pipeline (Minimal Viable)

**Summary:** Simple Node.js scripts — no agent architecture. Cron-scheduled scripts fetch trends from Hacker News + Reddit, call Ollama for draft generation, output markdown files for review.

```
Effort:  S (shippable in 1 session)
Risk:    Low
Pros:    - Ships today
         - Zero complexity, user understands every line
         - Immediately useful output
Cons:    - Not really "agents" — it's automation scripts
         - Doesn't teach agent architecture (the stated learning goal)
         - Hard to extend into multi-agent (no reasoning loop)
Reuses:  Node.js (familiar), Ollama (free)
```

### Approach B: The From-Scratch Agent ⭐ SELECTED

**Summary:** Build the agent loop (Think → Act → Observe) from scratch in Node.js. No framework — raw LLM calls + tool functions. The agent DECIDES which sources to check, what to research, and how to synthesize findings into tweet drafts. ~100-150 lines of core logic.

```
Effort:  M (shippable in 1-2 sessions)
Risk:    Low
Pros:    - Deep understanding of HOW agents work (the real goal)
         - No framework bloat or abstraction leaks
         - Perfect "Learn in Public" content ("I built an AI agent from scratch")
         - Total control, easily extensible
         - Node.js native, Ollama powered (free)
Cons:    - Missing framework conveniences (built-in memory, retry, structured output)
         - You build what frameworks give you for free
Reuses:  Node.js, Ollama, HN API, Reddit JSON
```

### Approach C: The Framework Agent (LangGraph.js)

**Summary:** Use LangGraph.js (the production leader in JS agent frameworks) to build a multi-step agent with proper state management, tool use, and human-in-the-loop checkpoints.

```
Effort:  L (2-3 sessions including framework learning)
Risk:    Medium
Pros:    - Industry-standard patterns
         - Built-in state management, checkpointing, human-in-loop
         - Extensible to multi-agent crew (Phase 2)
         - Resume job credential: "Built with LangGraph"
Cons:    - Framework learning curve before you understand the primitives
         - Dependency overhead
         - Abstracts away the agent loop (you learn the framework, not agents)
Reuses:  LangGraph.js, Ollama, HN API, Reddit JSON
```

---

## Selected Approach: B (From-Scratch Agent)

> **Chosen because the primary goal is LEARNING, and you can't truly learn agents through a framework's abstraction layer.**

### Reasoning

- The user explicitly stated learning is the goal. Building from scratch teaches what frameworks hide.
- "I built an AI agent from scratch in 100 lines of code" is a KILLER first Learn in Public post.
- Approach A ships faster but teaches nothing about agents. Approach C teaches a framework, not agents.
- Once you understand the primitive (Approach B), upgrading to LangGraph (Approach C) later takes an afternoon — you'll know exactly what the framework is doing under the hood.
- Risk is low because the from-scratch loop is simple: it's a while loop with LLM calls and tool dispatch.

### Graduation Path

```
Week 1-2:  Approach B (from-scratch agent, manual posting via X scheduler)
Week 3-4:  Add memory, analytics, scheduling → evolves toward Approach C naturally
Month 2+:  Migrate to LangGraph.js if complexity warrants it (multi-agent crew)
```

---

## Tech Stack

| Component | Tool | Cost | Notes |
|-----------|------|------|-------|
| LLM Engine | Ollama (Phi-4 Mini or Llama 3.2 3B) | Free (local) | 8GB RAM constraint — small models only |
| LLM Fallback | Gemini 2.5 Flash API (free tier) | Free | 1,500 RPD, for when local model quality isn't enough |
| Agent Loop | Custom Node.js (from scratch) | Free | ~100-150 lines core logic |
| Trend Sources | Hacker News API, Reddit JSON | Free | No auth required |
| Content Output | Local markdown files | Free | Daily briefing + tweet drafts |
| Posting (Phase 1) | X native scheduler / Buffer | Free | Manual review + schedule |
| Posting (Phase 2) | X API pay-per-use | ~$1/mo | Automated publishing |
| Version Control | Git (this workspace) | Free | Open-source shareable |

### Hardware-Adjusted Model Strategy

> [!IMPORTANT]
> System has **8GB RAM, no GPU**. This limits Ollama to small models (≤4B parameters).
> Hybrid strategy: local Ollama for fast iteration + Gemini Flash free tier for quality drafts.

| Use Case | Model | Why |
|----------|-------|-----|
| Quick ideation, brainstorming | Ollama: Phi-4 Mini (3.8B) | Fast, runs on 8GB RAM, good for structured tasks |
| High-quality tweet drafts | Gemini 2.5 Flash (API) | Better writing quality, 1,500 free requests/day |
| Reasoning/planning | Ollama: Llama 3.2 3B | Good reasoning for small size |
| Fallback/overflow | Gemini 2.5 Flash-Lite (API) | Lighter, higher rate limits |

---

## Content Strategy

### Positioning: Learn in Public

The builder documents their AI learning journey honestly — sharing experiments, failures, discoveries, and tools. Not claiming expertise, but building it in real-time with the audience.

### X Handle

**Recommendation:** Use a personal-name-based handle (e.g., `@khan_builds` or `@khan_learns`).

**Rationale:**
- Personal name is **portable** — if you pivot topics, the handle still works
- "Builds" or "learns" suffix signals the journey without locking you in
- Project-based handles (e.g., `@AgenticWorkflow`) die when the project pivots
- Concept handles (e.g., `@LearnWithAI`) are generic and forgettable
- The person behind the content IS the brand in Learn in Public

### Posting Frequency

**Recommendation:** 2 posts/day + 1 thread/week

| Format | Frequency | Purpose |
|--------|-----------|---------|
| Single tweets | 2/day | Quick insights, discoveries, tool reactions |
| Threads (3-7 tweets) | 1/week | Deep dives: "How I built X", "What I learned about Y" |
| Quote tweets/replies | Organic | Engage with AI community (non-automated, authentic) |

**Why 2/day, not more:**
- New accounts posting 5+/day look like spam and get suppressed
- Consistency > volume — 2/day for 90 days beats 10/day for 2 weeks
- Quality compounds. One great tweet > five mediocre ones
- This is sustainable alongside Nexus work and learning time

### Content Pillars

| Pillar | Description | Example Tweet |
|--------|-------------|---------------|
| 🔨 **Building in Public** | Documenting what you're building, how, and why | "Day 3: My AI agent just generated its first tweet drafts. Here's the 50-line loop that makes it work →" |
| 🧪 **Agent Experiments** | Testing different AI agents/tools, honest reviews | "I tested 5 AI coding agents on the same task. Only 2 actually worked. Here's what I found:" |
| 💡 **Daily AI Discoveries** | Interesting repos, tools, papers, trends | "Found this open-source agent that monitors your GitHub repos overnight. 2.3k stars, nobody's talking about it." |
| 🎓 **Learn → Teach** | Explaining what you just learned in simple terms | "I finally understand how AI agents actually work. It's just a while loop. Let me explain:" |

**Why these 4:**
- Pillar 1 is your core (the project IS the content)
- Pillar 2 feeds your Agent Lab research goals
- Pillar 3 is the easiest to produce (agents can automate research)
- Pillar 4 connects to Nexus (education flywheel) and builds authority over time

---

## Success Criteria

| Metric | Target | Timeline |
|--------|--------|----------|
| Agent produces daily briefing + 5 tweet drafts | Working pipeline | Week 1 |
| Builder posts 2 tweets/day consistently | Manual discipline | Week 2 |
| Builder understands Think→Act→Observe loop deeply | Can explain it in a tweet thread | Week 1 |
| First "Learn in Public" content series published | 5+ posts about building this engine | Week 2-3 |
| Follower growth begins (non-zero) | Any organic growth signal | Month 1 |

---

## Distribution Plan

- **The agent pipeline itself** → GitHub repo (open source, shareable)
- **The content about building it** → X posts (Learn in Public series)
- **The knowledge gained** → agent.md + KIs (persistent learning)
- **Traffic driven** → Nexus platform (the flywheel)

---

## Next Steps (Build Order)

1. **Foundation (30 min):** Document the universal agent loop — Think → Act → Observe
2. **Ollama setup:** Install Ollama + pull Phi-4 Mini (fits 8GB RAM)
3. **Gemini API key:** Get free API key from Google AI Studio
4. **Tool functions:** Build `fetchHNTrending()`, `fetchRedditAI()`, `generateDrafts()`
5. **Agent loop:** Wire the Think→Act→Observe cycle with tool dispatch
6. **First run:** Generate first daily briefing + tweet drafts
7. **X account setup:** Create dedicated X account with chosen handle
8. **Review ritual:** Establish the 5-minute daily edit→post flow
9. **Content series:** Post about building this engine (meta content)
10. **Iterate:** Add memory, voice training, analytics in subsequent sprints
