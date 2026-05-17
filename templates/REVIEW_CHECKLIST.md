# Code Review Checklist
<!-- 
  Adapted from GStack's /review (Staff Engineer) skill.
  Approach every review as finding the bugs that pass CI but blow up in production.
-->

## Review: [FILL — PR/feature name]
## Date: [FILL]
## Reviewer: Antigravity Agent

---

## Severity Guide

| Tier | Description | Action |
|------|------------|--------|
| **P0 — Critical** | Security hole, data loss, crash in happy path | Block. Fix immediately. |
| **P1 — High** | Logic error, race condition, wrong output | Block. Fix before ship. |
| **P2 — Medium** | Missing edge case, poor error message, no test | Fix or explicitly accept risk. |
| **P3 — Low** | Style, naming, minor optimization | Note for future. Don't block. |

---

## Correctness

- [ ] Logic produces correct results for all inputs
- [ ] No off-by-one errors or boundary condition bugs
- [ ] Type coercions are intentional, not accidental
- [ ] Async operations handle race conditions
- [ ] Error states caught and handled (not swallowed silently)
- [ ] No infinite loops or unbounded recursion possible

**Findings:**
| # | Description | Severity | Auto-fix? |
|---|-------------|----------|-----------|
| | | | |

---

## Completeness

- [ ] Diff addresses the FULL requirement, not just happy path
- [ ] All user-facing error messages are actionable
- [ ] Test coverage exists for new code paths
- [ ] Documentation updated for changed behavior
- [ ] No TODO/FIXME left unaddressed for shipped features
- [ ] All new functions/endpoints have at least one test

**Findings:**
| # | Description | Severity | Auto-fix? |
|---|-------------|----------|-----------|
| | | | |

---

## Security

- [ ] No secrets, API keys, or credentials in code
- [ ] User inputs are validated and sanitized
- [ ] SQL queries are parameterized (no string concatenation)
- [ ] Auth checks on all protected endpoints
- [ ] No directory traversal or path injection vectors
- [ ] Sensitive data not logged or exposed in error messages
- [ ] CORS configuration appropriate

**Findings:**
| # | Description | Severity | Auto-fix? |
|---|-------------|----------|-----------|
| | | | |

---

## Performance

- [ ] No N+1 queries or unnecessary database calls
- [ ] Large datasets paginated or streamed
- [ ] Expensive operations cached where appropriate
- [ ] No blocking operations in async contexts
- [ ] No memory leaks (event listeners cleaned up, intervals cleared)
- [ ] Images/assets optimized

**Findings:**
| # | Description | Severity | Auto-fix? |
|---|-------------|----------|-----------|
| | | | |

---

## Auto-Fix Rules

| Category | Action |
|----------|--------|
| Typos, missing null checks, unused imports | ✅ Auto-fix |
| Missing error handling on known patterns | ✅ Auto-fix |
| API design, naming, architecture trade-offs | ❌ Ask the user |
| Anything that changes intended behavior | ❌ Ask the user |
| Removing or renaming public interfaces | ❌ Ask the user |

---

## Summary

- **P0 (Critical):** [count]
- **P1 (High):** [count]
- **P2 (Medium):** [count]
- **P3 (Low):** [count]
- **Auto-fixed:** [count]
- **Verdict:** [ ] Ship  [ ] Ship after fixes  [ ] Block — needs rework
