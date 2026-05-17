# Project Guidelines
<!-- 
  GStack-powered project guidelines template.
  Drop this into any new project workspace.
  Customize the [FILL] sections for your specific project.
-->

## Development Philosophy

These principles apply to every decision in this project:

1. **Boil the Lake** — AI makes completeness near-free. Always do the complete implementation. No "ship the 90% shortcut." No "defer tests to follow-up."

2. **Search Before Building** — Before implementing anything non-trivial:
   - Check if the runtime/framework has a built-in
   - Search for best practices (current year)
   - Check official docs
   - Question conventional wisdom with first-principles reasoning

3. **User Sovereignty** — AI recommends, human decides. Present options with rationale. Never act on architectural decisions without confirmation.

---

## Sprint Process

Every feature follows this pipeline:

```
Think → Plan → Build → Review → Test → Ship → Reflect
```

### Think
- [ ] Problem defined in user's words
- [ ] Premises challenged and agreed upon

### Plan
- [ ] 2-3 alternative approaches generated
- [ ] Architecture decisions documented with rationale
- [ ] Approach chosen with user approval

### Build
- [ ] Complete implementation (no placeholder TODOs for core logic)
- [ ] Error messages are actionable
- [ ] Tests written alongside code
- [ ] Edge cases handled (empty, null, boundary)

### Review
- [ ] Correctness — logic produces correct results for all inputs
- [ ] Completeness — full requirement addressed, not just happy path
- [ ] Security — no secrets in code, inputs validated
- [ ] Performance — no N+1 queries, expensive ops cached

### Test
- [ ] Happy path end-to-end
- [ ] Error states (wrong input, empty, timeout)
- [ ] Edge cases specific to the feature
- [ ] Each bug fix has a regression test

### Ship
- [ ] All tests pass
- [ ] No TODO/FIXME unaddressed
- [ ] Documentation matches implementation
- [ ] Breaking changes documented

### Reflect
- [ ] What worked? (patterns to reuse)
- [ ] What didn't? (approaches to avoid)
- [ ] What was surprising? (new learnings)

---

## Code Standards

<!-- [FILL] Customize for your project -->

- **Framework:** [FILL — e.g., Next.js 16, Django 5.x, vanilla JS]
- **Language:** [FILL — e.g., TypeScript strict mode, Python 3.12]
- **Linter:** [FILL — e.g., ESLint + Prettier, Ruff]
- **Test Framework:** [FILL — e.g., Vitest, pytest, Jest]

### Universal Standards
- Every new feature includes tests
- Error messages tell the user what went wrong AND what to do next
- Comments explain WHY, not what — code is self-documenting for the "what"
- No console.log/print debugging in committed code
- No commented-out code blocks

---

## Design System

<!-- [FILL] if this is a UI project, define or reference your design system -->

- **Design doc:** [FILL — path to DESIGN.md if exists]
- **Color palette:** [FILL]
- **Typography:** [FILL]
- **Spacing base unit:** [FILL — recommend 4px or 8px]

---

## AI Effort Compression Reference

| Task | Human Team | AI-Assisted | Compression |
|------|-----------|-------------|-------------|
| Boilerplate/scaffolding | 2 days | 15 min | ~100x |
| Test writing | 1 day | 15 min | ~50x |
| Feature implementation | 1 week | 30 min | ~30x |
| Bug fix + regression | 4 hours | 15 min | ~20x |
| Architecture/design | 2 days | 4 hours | ~5x |
| Research/exploration | 1 day | 3 hours | ~3x |

**Rule:** Don't recommend shortcuts when the complete implementation is a "lake" (achievable in one session).
