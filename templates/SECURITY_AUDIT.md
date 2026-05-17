# Security Audit Template
<!-- 
  Adapted from GStack's /cso (Chief Security Officer) skill.
  OWASP Top 10 + STRIDE threat model.
  Only report findings at 8/10+ confidence.
-->

## Project: [FILL]
## Date: [FILL]
## Auditor: Antigravity Agent

---

## OWASP Top 10 Assessment

### 1. Injection (SQL, NoSQL, OS Command, LDAP)
- **Status:** [ ] Pass  [ ] Fail  [ ] N/A
- **Finding:** [FILL if applicable]
- **Evidence:** [FILL]

### 2. Broken Authentication
- **Status:** [ ] Pass  [ ] Fail  [ ] N/A
- **Finding:** [FILL if applicable]
- **Evidence:** [FILL]

### 3. Sensitive Data Exposure
- **Status:** [ ] Pass  [ ] Fail  [ ] N/A
- **Finding:** [FILL if applicable]
- **Evidence:** [FILL]

### 4. XML External Entities (XXE)
- **Status:** [ ] Pass  [ ] Fail  [ ] N/A
- **Finding:** [FILL if applicable]
- **Evidence:** [FILL]

### 5. Broken Access Control
- **Status:** [ ] Pass  [ ] Fail  [ ] N/A
- **Finding:** [FILL if applicable]
- **Evidence:** [FILL]

### 6. Security Misconfiguration
- **Status:** [ ] Pass  [ ] Fail  [ ] N/A
- **Finding:** [FILL if applicable]
- **Evidence:** [FILL]

### 7. Cross-Site Scripting (XSS)
- **Status:** [ ] Pass  [ ] Fail  [ ] N/A
- **Finding:** [FILL if applicable]
- **Evidence:** [FILL]

### 8. Insecure Deserialization
- **Status:** [ ] Pass  [ ] Fail  [ ] N/A
- **Finding:** [FILL if applicable]
- **Evidence:** [FILL]

### 9. Using Components with Known Vulnerabilities
- **Status:** [ ] Pass  [ ] Fail  [ ] N/A
- **Finding:** [FILL if applicable]
- **Evidence:** [FILL]

### 10. Insufficient Logging & Monitoring
- **Status:** [ ] Pass  [ ] Fail  [ ] N/A
- **Finding:** [FILL if applicable]
- **Evidence:** [FILL]

---

## STRIDE Threat Model

### Spoofing
Can someone impersonate a user or component?
- **Threat:** [FILL]
- **Mitigation:** [FILL]
- **Status:** [ ] Mitigated  [ ] Accepted Risk  [ ] Unmitigated

### Tampering
Can data be modified in transit or at rest?
- **Threat:** [FILL]
- **Mitigation:** [FILL]
- **Status:** [ ] Mitigated  [ ] Accepted Risk  [ ] Unmitigated

### Repudiation
Can actions be denied without evidence?
- **Threat:** [FILL]
- **Mitigation:** [FILL]
- **Status:** [ ] Mitigated  [ ] Accepted Risk  [ ] Unmitigated

### Information Disclosure
Can sensitive data leak?
- **Threat:** [FILL]
- **Mitigation:** [FILL]
- **Status:** [ ] Mitigated  [ ] Accepted Risk  [ ] Unmitigated

### Denial of Service
Can the system be overwhelmed?
- **Threat:** [FILL]
- **Mitigation:** [FILL]
- **Status:** [ ] Mitigated  [ ] Accepted Risk  [ ] Unmitigated

### Elevation of Privilege
Can a user gain unauthorized access?
- **Threat:** [FILL]
- **Mitigation:** [FILL]
- **Status:** [ ] Mitigated  [ ] Accepted Risk  [ ] Unmitigated

---

## Findings Summary

| # | Title | Severity | Confidence | Status |
|---|-------|----------|------------|--------|
| 1 | [FILL] | Critical/High/Med/Low | [8-10]/10 | Open/Fixed |

### Finding Detail Template

```
FINDING: {title}
SEVERITY: Critical/High/Medium/Low
CONFIDENCE: {8-10}/10
EXPLOIT SCENARIO: {step-by-step how an attacker would exploit this}
AFFECTED: {files, endpoints, components}
RECOMMENDATION: {specific fix with code example if applicable}
```

---

## Audit Result

- **Overall Risk Level:** [ ] Low  [ ] Medium  [ ] High  [ ] Critical
- **Blocking Issues:** [count]
- **Recommendations:** [count]
- **Accepted Risks:** [count]
