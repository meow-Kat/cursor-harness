# Harness Engineering Framework

An engineering framework for helping AI agents ship code safely and reliably.

> AI can write code, but it shouldn't ship to production by itself. That "shouldn't" needs to be enforced by system design, not human vigilance.

> 中文版請見 `docs/README_zh-TW.md`.

## What this is

This repo is a **general-purpose Harness Engineering framework**: templates, rules, and examples you can fork and apply to your own projects. The core ideas are inspired by [Harness Engineering — architecture overview](https://ai-coding.wiselychen.com/harness-engineering-architecture-overview-ai-code-production-guardrails/).

Harness Engineering = building a system that controls and amplifies an agent's ability to deliver in agent-first development.

**Core philosophy: Humans steer. Agents execute.**

## What's included

### Project layer (checked into every repo)

| File | Purpose |
|------|------|
| `AGENTS.md` | Agent work contract (architecture principles, forbidden actions, risk tiers, testing requirements) |
| `risk-tiers.json` | Machine-readable risk contract: classify paths by blast radius (critical/high/medium/low) |
| `docs/ANALYSIS_MEM.md` | Long-term analysis memory (stable decisions, invariants, logs) |
| `docs/ANALYSIS_SCRATCH.md` | Short-term analysis scratchpad (current task context, notes, lessons) |
| `examples/php/` | PHP guardrail config examples (see below) |
| `examples/github-actions/` | CI/CD workflow examples (see below) |

### Cursor layer (in `.cursor/`, ready after forking)

> You can also install these into `~/.cursor/` for cross-project reuse. The repo copy ensures forks work out of the box.

| File | Type | Purpose |
|------|------|------|
| `.cursor/rules/agents-md-protocol.mdc` | Rule | Enforce loading `AGENTS.md`, forbidden actions, risk awareness, instruction priority |
| `.cursor/rules/analysis-memory-protocol.mdc` | Rule | Two-tier analysis memory: wake & sync, taxonomy, feedback loop, freshness, GC |
| `.cursor/rules/php-guardrails-protocol.mdc` | Rule | Recommend / enforce PHP guardrails when applicable |
| `.cursor/rules/ci-workflows-protocol.mdc` | Rule | Recommend / enforce CI workflow setup when applicable |
| `.cursor/skills/agents-md-template/SKILL.md` | Skill | Create `AGENTS.md` when missing (instruction priority + operational limits) |
| `.cursor/skills/memory-templates/SKILL.md` | Skill | Create analysis memory files when missing |
| `.cursor/skills/php-guardrails-template/SKILL.md` | Skill | Create PHP guardrail configs when missing |
| `.cursor/skills/ci-workflows-template/SKILL.md` | Skill | Create CI workflow templates when missing |
| `.cursor/agents/coder.md` | Subagent | Code-writing specialist (self-verification + circuit breaker) |
| `.cursor/agents/tester.md` | Subagent | Test-writing specialist (Layer 1) |
| `.cursor/agents/reviewer.md` | Subagent | Review / LLM judge (Layer 4) |
| `.cursor/agents/memory-keeper.md` | Subagent | Memory management (taxonomy, freshness, GC, write safety) |
| `.cursor/agents/observability.md` | Subagent | System audits (compliance, drift, risk exposure, operations health) |
| `.cursor/agents/project-analyzer.md` | Subagent | Repo scanning, risk assessment, tech-debt inventory |

## Architecture

### Division of responsibilities

```
AGENTS.md (tool-agnostic)    defines WHAT: the rules to follow
Cursor rules (Cursor-specific) define HOW: how to load, enforce, and intercept
```

### Instruction priority (low → high)

```
~/.cursor/rules/     → user-global rules (lowest)
AGENTS.md            → repo-level contract (team-shared)
.cursor/rules/       → repo-level Cursor rules (team-shared)
.agents.local.md     → personal override (not version-controlled, highest)
```

### Execution order (each task)

```
① agents-md-protocol        → load `AGENTS.md` + `.agents.local.md` (if any)
② analysis-memory-protocol  → load MEM (long-term) → load SCRATCH (short-term)
③ execute the task
④ progressive summary       → update SCRATCH periodically to avoid context loss
⑤ wrap up                   → update SCRATCH → promote stable findings to MEM → update Pending
```

### Memory taxonomy (inspired by Claude Code M-system)

Long-term memory (`Core Logic`) is categorized into four types, with strict boundaries on what to store:

| Type | Store | Do not store |
|------|--------|---------|
| **Project** | decisions/constraints not derivable from code | code patterns, file paths, architecture analysis |
| **User** | user preferences, habits, skill level | — |
| **Feedback** | corrections and confirmations | — |
| **Reference** | external pointers (URLs, issues) | copied content |

### Automation

| Mechanism | Trigger | Behavior |
|------|---------|------|
| **Circuit breaker** | same operation fails 3 times / same file edited 5+ times / scope > 10 files | stop and request an alternative approach |
| **Progressive summary** | every ~5 substantive operations / major decisions / before risky changes | keep SCRATCH current to prevent context loss |
| **Post-task check** | after each task | run quick checks; escalate to full audit on anomalies |
| **Periodic audit** | every 5 tasks | full observability audit |
| **Feedback loop** | agent is corrected or explicitly confirmed | record lessons/confirmations to avoid repeating mistakes |
| **Freshness check** | Core Logic items older than threshold | mark as stale and verify against reality |
| **Write safety** | before writing memory | scan for secrets and redact |
| **Memory GC** | logs exceed limits | archive/summarize |

## Quick start

### 1) Fork this repo

```bash
git clone https://github.com/YOUR_USERNAME/harness.git my-project
cd my-project
```

### 2) Install the Cursor layer

This repo includes a complete `.cursor/` folder (rules, skills, subagents). Cursor will load the repo-local `.cursor/` config automatically.

Optionally, to reuse across projects, copy them to your global Cursor config:

```bash
cp -r .cursor/rules/*.mdc ~/.cursor/rules/
cp -r .cursor/skills/* ~/.cursor/skills/
cp -r .cursor/agents/* ~/.cursor/agents/
```

### 3) Customize the project layer

1. Edit `AGENTS.md`: fill in your architecture principles and forbidden actions
2. Edit `risk-tiers.json`: adapt path tiers to your repo layout
3. Start a new Cursor session; the agent will load and acknowledge them

## PHP guardrail examples

`examples/php/` includes configs for four tools aligned with the layered defense approach:

| Tool | Layer | Purpose | Install |
|------|----------|------|------|
| **Deptrac** | Layer 3: CI gate | dependency direction checks across layers | `composer require --dev qossmic/deptrac-shim` |
| **PHPArkitect** | Layer 3: CI gate | architecture rule tests (naming/structure) | `composer require --dev phparkitect/arkitect` |
| **PHPStan** | Layer 2: type check | static analysis (level 0–9) | `composer require --dev phpstan/phpstan` |
| **PHP_CodeSniffer** | Layer 2: lint | PSR-12 lint + forbid debug helpers | `composer require --dev squizlabs/php_codesniffer` |

### PHP layering example

```
Model (bottom; depends on nobody)
  ↑
Config
  ↑
Repository
  ↑
Service
  ↑
Controller
  ↑
Infrastructure (top; can depend on all)
```

Each layer may only depend on layers below it. Deptrac and PHPArkitect can enforce this mechanically in CI.

## CI/CD workflow examples

`examples/github-actions/` includes three workflows aligned with the risk/layered defense model:

| Workflow | Layer | What it does |
|----------|---------|------|
| `risk-contract.yml` | L1 risk tiering + control plane | classify changes by path risk; label; request review |
| `php-guardrails.yml` | L2 layered defenses | parallel jobs: lint+type / architecture / tests |
| `doc-freshness.yml` | anti context-rot | check stale docs; validate links; validate `risk-tiers.json` |

Usage: copy the workflows you need into your repo’s `.github/workflows/`.

## Subagent architecture

This framework uses 6 specialized subagents, each with a single responsibility:

```
User instruction
  │
  ▼
Main Agent (orchestrator)
  │
  ├── project-analyzer   "What does this repo look like?"     (understand)
  ├── coder              "Write the code"                      (execute)
  ├── tester             "Write tests for the change"          (verify L1)
  ├── reviewer           "Review the change"                   (quality L4)
  ├── memory-keeper      "Record what happened"                (memory)
  └── observability      "Is the system healthy?"              (audit)
```

### Subagent overview

| Subagent | Model | Mode | Component | Responsibility |
|----------|-------|------|---------|------|
| `project-analyzer` | opus | readonly | — | scan structure, risks, and tech debt |
| `coder` | sonnet | read-write | — | implement changes and summarize |
| `tester` | codex | read-write | Eval & test | write tests; verify coverage independently |
| `reviewer` | codex | readonly | guardrails & safety | code review (LLM judge; Layer 4) |
| `memory-keeper` | sonnet | read-write | context & feedback | memory taxonomy, freshness, GC, audit trail |
| `observability` | opus | readonly | observability | compliance & drift audits; operations health |

### Typical workflow

```
① coder implements      → produces a change summary
② tester adds tests     → produces a test report
③ reviewer judges       → produces a review report
④ memory-keeper records → updates SCRATCH / MEM
⑤ observability audits  → produces a health report (periodic or on-demand)
```

### Design principles

- **One agent, one job**: coder doesn't test; tester doesn't implement; reviewer doesn't modify.
- **Intentional context separation**: separate coder vs reviewer to reduce self-review bias.
- **Single writer for memory**: only memory-keeper writes memory to avoid conflicts.
- **Observability is read-only**: it audits and recommends; fixes are delegated.

### Built-in safety mechanisms

| Mechanism | Applies to | Notes |
|------|-------------|------|
| **Self-verification** | coder, tester | required checklist before producing output |
| **Circuit breaker** | coder, tester | stop on repeated failure or runaway scope |
| **Context exhaustion warning** | all 6 | keep outputs concise to avoid context rot |
| **Operations health audit** | observability | audit operational limits & governance maturity |
| **Audit trail** | memory-keeper | record major decisions with context & risks |

## Mapping to the 7 Harness Engineering components

| Component | Implementation in this repo | Status |
|------|------------|------|
| ① Context system | `AGENTS.md` + two-tier memory + knowledge base | ✅ |
| ② Architecture guardrails | principles + `risk-tiers.json` + PHP examples | ✅ |
| ③ Eval & test harness | testing requirements + CI examples | ✅ (baseline) |
| ④ CI/PR automation | GitHub Actions examples | ✅ |
| ⑤ Safety & policy | forbidden actions + risk tiers + enforcement | ✅ |
| ⑥ Observability | `observability` subagent audits | ✅ |
| ⑦ Feedback loops | feedback loop + freshness check + memory GC | ✅ |

## References

- [Harness Engineering 架構全景](https://ai-coding.wiselychen.com/harness-engineering-architecture-overview-ai-code-production-guardrails/) — Wisely Chen
- [OpenAI — Harness Engineering](https://openai.com) — concept source
- [Martin Fowler — Harness Engineering](https://martinfowler.com) — analysis
- [AGENTS.md format](https://agents.md) — cross-tool standard

## License

This project is licensed under **GNU General Public License v3.0 (GPL-3.0)**. See `LICENSE`.
