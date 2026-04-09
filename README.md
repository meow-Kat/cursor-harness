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
| `.cursor/rules/` | Cursor-specific enforcement rules |
| `.cursor/skills/` | Reusable templates and setup helpers |
| `.cursor/agents/` | Specialized subagents for coding, testing, review, memory, and audits |
| `examples/php/` | PHP architecture guardrail examples |
| `examples/github-actions/` | CI workflow examples |
| `docs/` | Deeper docs and localized documentation |

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
- `.cursor/rules/analysis-memory-protocol.mdc`

Then add the examples you actually need:

- PHP guardrails from `examples/php/`
- CI workflows from `examples/github-actions/`

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
- Traditional Chinese user guide: `docs/README_zh-TW.md`
- Analysis memory: `docs/ANALYSIS_MEM.md`
- Working scratchpad: `docs/ANALYSIS_SCRATCH.md`
- Harness Engineering reference: [Wisely Chen — architecture overview](https://ai-coding.wiselychen.com/harness-engineering-architecture-overview-ai-code-production-guardrails/)
- Cross-tool standard: [AGENTS.md](https://agents.md)

## License

This project is licensed under **GNU General Public License v3.0 (GPL-3.0)**. See `LICENSE`.
