# AGENTS.md

> This file is the single entry point for all AI coding agents working in this repository.
> Keep it under 100 lines. Point to docs/ for details. Treat it as a version-controlled work contract.

## Architecture Principles

- This repo is a **Harness Engineering framework**: templates, rules, and examples for safe AI-assisted development.
- Directory structure:
  - `docs/` — structured knowledge base (analysis memory, architecture decisions, guides)
  - `examples/php/` — PHP guardrail configs (deptrac, phparkitect, phpstan, phpcs)
  - `examples/github-actions/` — CI/CD workflow examples (risk contract enforcer, php guardrails, doc freshness)
  - `.cursor/rules/` — Cursor behavioral protocols (4 rules: agents-md, memory, php-guardrails, ci-workflows)
  - `.cursor/skills/` — reusable template providers (4 skills: agents-md, memory, php-guardrails, ci-workflows)
  - `.cursor/agents/` — specialized subagents (6: coder, tester, reviewer, memory-keeper, observability, project-analyzer)
- AGENTS.md defines WHAT (cross-tool constraints); Cursor rules define HOW (Cursor-specific behavior).
- Execution order on task start: AGENTS.md → ANALYSIS_MEM.md → ANALYSIS_SCRATCH.md.
- PHP layering: Model → Config → Repository → Service → Controller → Infrastructure. Each layer may only depend on layers below it.

## Instruction Priority (lowest → highest)

Inspired by Claude Code's four-layer instruction hierarchy. When rules conflict, higher priority wins.

| Priority | Source | Scope | Version Control |
|----------|--------|-------|----------------|
| 1 (lowest) | `~/.cursor/rules/*.mdc` | User-global (all projects) | No (user-level) |
| 2 | `AGENTS.md` | Project-wide (team-shared) | Yes |`
| 3 | `.cursor/rules/*.mdc` (in repo) | Project-wide (team-shared) | Yes |
| 4 (highest) | `.agents.local.md` (in repo root) | Personal project override | No (`.gitignore`d) |

- Loading order: files closer to the working directory load later and override earlier ones.
- If `.agents.local.md` exists, read it AFTER `AGENTS.md` and apply overrides silently.

## Forbidden Actions

- Do NOT delete or recreate databases; repair instead of rebuild.
- Do NOT delete or recreate infrastructure; fix in place.
- Do NOT add external dependencies without explicit user approval.
- Do NOT modify files outside the workspace without explicit user approval.
- Do NOT commit secrets, credentials, or API keys.
- Do NOT remove or overwrite memory files (`docs/ANALYSIS_MEM.md`, `docs/ANALYSIS_SCRATCH.md`) without explicit user approval.
- Do NOT bypass the Risk Tiers defined below; always check path risk before modifying critical files.

## Risk Tiers

- Risk tier definitions: [risk-tiers.json](risk-tiers.json)
- `critical` path changes require explicit user confirmation before proceeding.
- `high` path changes should note the risk level in the response.
- `low` path changes (docs, tests, markdown) can proceed without extra confirmation.

## Operational Limits

- **Step budget**: Max 30 tool calls per task. If approaching limit, summarize progress and ask user before continuing.
- **Consecutive errors**: If the same operation fails 3 times in a row, STOP. Report the failure pattern and ask for guidance.
- **Repeated edits**: If you edit the same file 5+ times in one task, STOP. You are likely in a doom loop. Summarize what's going wrong and ask for a different approach.
- **Scope creep**: If a task grows beyond 10 file changes, pause and confirm scope with the user.

## Testing Requirements

- All CI workflow examples must be syntactically valid YAML.
- Template files (skills) must include a `## Recovery` section for corrupted file handling.
- Rule files (.mdc) must stay under 500 lines and include concrete examples where applicable.

## Code Style

- PHP: follow PSR-12; lint with phpcs (`examples/php/phpcs.xml`); static analysis with PHPStan level 6+ (`examples/php/phpstan.neon`).
- Markdown files: use ATX-style headers (`#`), keep lines readable.
- JSON config files: use 2-space indentation, include a top-level `version` field.
- Shell scripts: use `set -e`, quote variables, include inline comments for non-obvious logic.

## Knowledge Base

- Analysis memory (long-term stable facts): [docs/ANALYSIS_MEM.md](docs/ANALYSIS_MEM.md)
- Working context (short-term notes): [docs/ANALYSIS_SCRATCH.md](docs/ANALYSIS_SCRATCH.md)
- PHP guardrail examples: [examples/php/](examples/php/) (deptrac, phparkitect, phpstan, phpcs)
- Harness Engineering reference article: [Wisely Chen — 架構全景](https://ai-coding.wiselychen.com/harness-engineering-architecture-overview-ai-code-production-guardrails/)
