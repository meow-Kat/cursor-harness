# Harness Engineering for Cursor

A practical way to make Cursor-based AI development more reliable, reviewable, and controlled.

> AI can generate code quickly. The hard part is creating a workflow that keeps the output safe, consistent, and maintainable.

> Guides: English `docs/USER_GUIDE.md` | Traditional Chinese `docs/USER_GUIDE_zh-TW.md`

## Overview

This repository packages a **Harness Engineering workflow built around Cursor**.

Instead of relying on prompts alone, it gives Cursor agents a working environment with:

- explicit repo rules
- path-based risk control
- short-term and long-term memory
- reusable skills and specialized subagents
- example CI guardrails

The goal is simple: help AI agents work inside a defined system, not in an unbounded chat.

## Why this exists

Cursor is powerful, but raw agent autonomy can drift quickly:

- architecture gets inconsistent
- risky paths are changed too casually
- context is lost between sessions
- review standards become unclear

This repo is an attempt to solve that by turning the repo itself into a control surface.

## What you get

| Path | Purpose |
|------|---------|
| `AGENTS.md` | Project contract for AI agents |
| `risk-tiers.json` | Risk classification by path |
| `.cursor/rules/` | Cursor rules (see [Cursor rules](#cursor-rules) below) |
| `.cursor/skills/` | Agent skills / setup templates (see [Skills](#skills) below) |
| `.cursor/agents/` | Specialized subagents (see [Subagents](#subagents) below) |
| `examples/php/` | PHP architecture guardrail examples |
| `examples/github-actions/` | CI workflow examples |
| `docs/` | Deeper docs, user guides, and analysis memory |

### Cursor rules

These files live in `.cursor/rules/`:

| File | Role |
|------|------|
| `core-protocol.mdc` | Task start order (`AGENTS.md` → memory → blank check), delegation map, operational limits, post-task checks (`alwaysApply`) |
| `php-guardrails-protocol.mdc` | PHP guardrail awareness when editing PHP (`**/*.php`) |
| `ci-workflows-protocol.mdc` | GitHub Actions workflow awareness under `.github/` |

On first memory init, `memory-templates` can also generate `.cursor/rules/project-framework.mdc` (framework-specific conventions for your app stack).

### Skills

Repo skills under `.cursor/skills/` (each folder contains `SKILL.md`):

| Skill | Use |
|-------|-----|
| `agents-md-template` | Bootstrap or repair root `AGENTS.md` |
| `memory-templates` | Create `docs/ANALYSIS_MEM.md` / `docs/ANALYSIS_SCRATCH.md` and run framework detection |
| `php-guardrails-template` | Generate deptrac / phparkitect / PHPStan / PHPCS configs |
| `ci-workflows-template` | Generate risk-contract / PHP guardrails / doc-freshness workflows |
| `sdd-bootstrap` | Spec-driven bootstrap for empty or skeleton projects |

### Subagents

Specialized prompts under `.cursor/agents/`:

| Subagent | Focus |
|----------|--------|
| `coder.md` | Implementation and structured change summaries |
| `tester.md` | Tests, coverage, quality gates |
| `reviewer.md` | Read-only review / LLM judge style feedback |
| `memory-keeper.md` | Writes and maintains analysis memory tiers |
| `observability.md` | Harness health, drift, and risk exposure audits |
| `project-analyzer.md` | Repo-wide architecture and onboarding summaries |
| `doc-fetcher.md` | External documentation retrieval |
| `sdd-designer.md` | Spec-driven design after SDD requirements |

## How it works in Cursor

The intended flow is:

1. Cursor loads repo rules and `AGENTS.md`.
2. The agent checks memory and current task context.
3. Risky paths are handled more carefully than low-risk paths.
4. Work is done through constrained roles, templates, and checks.
5. Stable outcomes are written back into project memory.

In short: **human intent sets direction, repo rules shape execution, Cursor agents do the work**.

## Quick start

```bash
git clone https://github.com/YOUR_USERNAME/cursor-harness.git
cd cursor-harness
```

Then:

1. Edit `AGENTS.md` to match your team's rules and architecture.
2. Edit `risk-tiers.json` to match your repo structure.
3. Review `.cursor/rules/`, `.cursor/skills/`, and `.cursor/agents/`.
4. Start a new Cursor session and work inside the provided workflow.

## Recommended customization

Start with these files first:

- `AGENTS.md`
- `risk-tiers.json`
- `.cursor/rules/core-protocol.mdc`

Then add the examples you actually need:

- PHP guardrails from `examples/php/`
- CI workflows from `examples/github-actions/`

For day-to-day Cursor behavior, `core-protocol.mdc` covers loading `AGENTS.md`, memory sync, delegation, and post-task checks; use it together with `docs/ANALYSIS_MEM.md` and `docs/ANALYSIS_SCRATCH.md` after memory is initialized.

## Project philosophy

This repo follows a simple idea:

**Do not try to make the agent smarter only through prompting. Make the environment better instead.**

That means:

- clearer constraints
- smaller blast radius
- reusable review logic
- persistent memory
- explicit operational limits

## Further reading

- English user guide: `docs/USER_GUIDE.md`
- Traditional Chinese user guide: `docs/USER_GUIDE_zh-TW.md`
- Analysis memory: `docs/ANALYSIS_MEM.md`
- Working scratchpad: `docs/ANALYSIS_SCRATCH.md`
- Harness Engineering reference: [Wisely Chen — architecture overview](https://ai-coding.wiselychen.com/harness-engineering-architecture-overview-ai-code-production-guardrails/)
- Cross-tool standard: [AGENTS.md](https://agents.md)

## License

This project is licensed under **GNU General Public License v3.0 (GPL-3.0)**. See `LICENSE`.
