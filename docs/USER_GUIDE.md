# Harness Engineering User Guide

An engineering framework for helping AI agents write code more safely and reliably.

> AI can write code, but it should not ship to production by itself. That gap needs to be handled by system design, not by human attention alone.

## What this repository is

This repo is a **general-purpose Harness Engineering framework**. It provides templates, rules, and examples that can be forked and reused in real projects. The core idea comes from [Harness Engineering — architecture overview](https://ai-coding.wiselychen.com/harness-engineering-architecture-overview-ai-code-production-guardrails/).

Harness Engineering = building a system that controls and amplifies what agents can deliver in agent-first development.

**Core philosophy: Humans steer. Agents execute.**

## What is included

### Project layer

| File | Purpose |
|------|---------|
| `AGENTS.md` | Working contract for AI agents: architecture principles, forbidden actions, risk tiers, and testing requirements |
| `risk-tiers.json` | Machine-readable risk contract that classifies paths as critical / high / medium / low |
| `docs/ANALYSIS_MEM.md` | Long-term memory: stable decisions, invariants, and analysis logs |
| `docs/ANALYSIS_SCRATCH.md` | Short-term memory: current context, notes, and lessons |
| `examples/php/` | PHP architecture guardrail examples |
| `examples/github-actions/` | CI/CD workflow examples |

### Cursor layer

> The repo includes a full `.cursor/` directory so the workflow works immediately after forking. You can also copy the same assets into `~/.cursor/` for global reuse.

| File | Type | Purpose |
|------|------|---------|
| `.cursor/rules/core-protocol.mdc` | Rule (alwaysApply) | Task lifecycle: load `AGENTS.md` / `.agents.local.md`, memory wake-and-sync, delegation map, operational limits, post-task checks |
| `.cursor/rules/php-guardrails-protocol.mdc` | Rule | Detect PHP projects and recommend or enforce PHP guardrails |
| `.cursor/rules/ci-workflows-protocol.mdc` | Rule | Detect missing CI workflows and guide setup |
| `.cursor/skills/agents-md-template/SKILL.md` | Skill | Create `AGENTS.md` when missing |
| `.cursor/skills/memory-templates/SKILL.md` | Skill | Create memory files when missing; framework detection can generate `project-framework.mdc` |
| `.cursor/skills/php-guardrails-template/SKILL.md` | Skill | Create PHP guardrail configs when missing |
| `.cursor/skills/ci-workflows-template/SKILL.md` | Skill | Create CI workflow templates when missing |
| `.cursor/skills/sdd-bootstrap/SKILL.md` | Skill | SDD-style requirements gathering for empty or skeleton projects; hand off to `sdd-designer` |
| `.cursor/agents/coder.md` | Subagent | Focused code-writing agent with self-verification and circuit breaker rules |
| `.cursor/agents/tester.md` | Subagent | Focused testing agent for Layer 1 validation |
| `.cursor/agents/reviewer.md` | Subagent | Read-only review agent for Layer 4 judgment |
| `.cursor/agents/memory-keeper.md` | Subagent | Memory management agent for taxonomy, freshness, garbage collection, and audit trail |
| `.cursor/agents/observability.md` | Subagent | Read-only system auditor for compliance, drift, and operations health |
| `.cursor/agents/project-analyzer.md` | Subagent | Repo structure, risk, and technical-debt scanner |
| `.cursor/agents/doc-fetcher.md` | Subagent | Fetch external documentation for grounded implementation |
| `.cursor/agents/sdd-designer.md` | Subagent | Spec and design output after SDD requirements (pairs with `sdd-bootstrap`) |

## Architecture design

### Responsibility split

```text
AGENTS.md (cross-tool)      defines WHAT rules exist
Cursor rules (Cursor-only)  define HOW those rules are loaded and enforced
```

### Instruction priority

```text
~/.cursor/rules/     -> user-global rules (lowest)
AGENTS.md            -> repo-level contract
.cursor/rules/       -> repo-level Cursor rules
.agents.local.md     -> personal override (highest)
```

### Task execution order

```text
1. core-protocol.mdc loads AGENTS.md, .agents.local.md, MEM, and SCRATCH
2. the task is executed
3. SCRATCH is updated progressively during work
4. stable outcomes are promoted into MEM at the end
```

### Memory taxonomy

Long-term memory (`Core Logic`) is intentionally split into four categories:

| Type | What it stores | What it should not store |
|------|----------------|--------------------------|
| **Project** | Decisions and constraints not derivable from code | code patterns, file paths, architecture analysis |
| **User** | Preferences, habits, and working style | — |
| **Feedback** | Corrections and confirmations | — |
| **Reference** | External references such as URLs or issue IDs | copied content |

### Automation mechanisms

| Mechanism | Trigger | Behavior |
|-----------|---------|----------|
| **Circuit Breaker** | 3 repeated failures / 5+ edits on one file / scope over 10 files | Stop and ask for a new approach |
| **Progressive Summary** | About every 5 meaningful operations or before risky work | Update SCRATCH to reduce context loss |
| **Post-Task Check** | End of every task | Run quick health checks and escalate if needed |
| **Periodic Audit** | Every 5 tasks | Run a full observability audit |
| **Feedback Loop** | Agent is corrected or explicitly validated | Record lessons or confirmations |
| **Freshness Check** | Core Logic items become old | Mark stale items and verify them |
| **Write Safety** | Before memory writes | Scan for sensitive data and redact |
| **Memory GC** | Logs or recent tasks hit limits | Archive or summarize older entries |

## Quick start

### 1. Fork this repository

```bash
git clone https://github.com/YOUR_USERNAME/cursor-harness.git my-project
cd my-project
```

### 2. Use the Cursor layer

The repository already contains `.cursor/` rules, skills, and agents. Cursor can use the repo-local setup directly.

If you also want to share the setup across projects, you can optionally copy it into your global Cursor directory:

```bash
cp -r .cursor/rules/*.mdc ~/.cursor/rules/
cp -r .cursor/skills/* ~/.cursor/skills/
cp -r .cursor/agents/* ~/.cursor/agents/
```

### 3. Customize the project layer

1. Edit `AGENTS.md` to match your architecture principles and forbidden actions.
2. Edit `risk-tiers.json` so the risk tiers fit your repo layout.
3. Start a new Cursor conversation so the agent reloads the project rules.

## PHP guardrail examples

`examples/php/` contains four example tools aligned to the layered defense model:

| Tool | Defense layer | Purpose | Install |
|------|---------------|---------|---------|
| **Deptrac** | Layer 3: CI Gate | Check dependency direction between layers | `composer require --dev qossmic/deptrac-shim` |
| **PHPArkitect** | Layer 3: CI Gate | Architecture rule tests such as naming and structure constraints | `composer require --dev phparkitect/arkitect` |
| **PHPStan** | Layer 2: Type Check | Static type analysis | `composer require --dev phpstan/phpstan` |
| **PHP_CodeSniffer** | Layer 2: Lint | PSR-12 linting plus debug helper bans | `composer require --dev squizlabs/php_codesniffer` |

### Example PHP layering

```text
Model
  ↑
Config
  ↑
Repository
  ↑
Service
  ↑
Controller
  ↑
Infrastructure
```

Each layer may depend only on layers below it. Deptrac and PHPArkitect can enforce this mechanically in CI.

## CI/CD workflow examples

`examples/github-actions/` contains three workflow examples:

| Workflow | Layer | Purpose |
|----------|-------|---------|
| `risk-contract.yml` | L1 risk tiering + control plane | Classify changed paths, determine review intensity, and label risk |
| `php-guardrails.yml` | L2 layered defenses | Run lint/type, architecture checks, and tests in parallel |
| `doc-freshness.yml` | Context-rot prevention | Check stale docs, validate AGENTS links, and validate `risk-tiers.json` |

To use them, copy the workflows you need into your own `.github/workflows/` directory.

## Subagent architecture

The framework uses 8 specialized subagents, each with a single job:

```text
User
  |
  v
Main Agent
  |
  |-- project-analyzer
  |-- doc-fetcher
  |-- sdd-designer
  |-- coder
  |-- tester
  |-- reviewer
  |-- memory-keeper
  `-- observability
```

### Subagent overview

| Subagent | Model | Mode | Responsibility |
|----------|-------|------|----------------|
| `project-analyzer` | opus | readonly | Scan repo structure, risks, and technical debt |
| `coder` | sonnet | read-write | Implement code changes and summarize them |
| `tester` | codex | read-write | Write tests and validate outcomes independently |
| `reviewer` | codex | readonly | Review changes as an LLM judge |
| `memory-keeper` | sonnet | read-write | Maintain memory, freshness, GC, and audit trail |
| `observability` | opus | readonly | Audit compliance, drift, and operations health |
| `doc-fetcher` | (orchestrator-chosen) | readonly | External documentation retrieval |
| `sdd-designer` | (orchestrator-chosen) | read-write | Spec and design after SDD requirements |

### Typical workflow

```text
1. coder implements
2. tester validates
3. reviewer reviews
4. memory-keeper records
5. observability audits
```

### Design principles

- One subagent, one responsibility
- Intentional context separation between coding and review
- A single memory writer to avoid conflicts
- Read-only observability with delegated fixes

### Built-in safety mechanisms

| Mechanism | Applies to | Description |
|-----------|------------|-------------|
| **Self-Verification Checklist** | coder, tester | Output must pass a self-check before being returned |
| **Circuit Breaker** | coder, tester | Stops repeated failure or runaway scope |
| **Context Exhaustion Warning** | all 8 agents | Encourages concise outputs to avoid context degradation |
| **Operations Health Audit** | observability | Audits limits, loop risks, and governance maturity |
| **Audit Trail** | memory-keeper | Records major decisions with context and risk |

## Mapping to the 7 Harness Engineering components

| Component | Implementation in this framework | Status |
|-----------|---------------------------------|--------|
| Context System | `AGENTS.md` + two-tier memory + knowledge base | ✅ |
| Architecture Guardrails | `AGENTS.md` + `risk-tiers.json` + PHP examples | ✅ |
| Eval & Test Harness | Testing requirements + example CI | ✅ |
| CI/PR Automation | GitHub Actions examples | ✅ |
| Safety & Policy | Forbidden actions + risk tiers + enforcement | ✅ |
| Observability | `observability` subagent | ✅ |
| Feedback Loops | Feedback loop + freshness check + memory GC | ✅ |

## References

- [Harness Engineering — architecture overview](https://ai-coding.wiselychen.com/harness-engineering-architecture-overview-ai-code-production-guardrails/) — Wisely Chen
- [OpenAI — Harness Engineering](https://openai.com) — concept source
- [Martin Fowler — Harness Engineering](https://martinfowler.com) — analysis
- [AGENTS.md format](https://agents.md) — cross-tool standard

## License

This project is licensed under **GNU General Public License v3.0 (GPL-3.0)**. See `LICENSE`.
