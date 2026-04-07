---
name: agents-md-template
description: Provide the universal AGENTS.md template for any project. Use when AGENTS.md does not exist, is corrupted, or when bootstrapping Harness Engineering in a new repository.
---

# AGENTS.md Template

## When to Use

- The `agents-md-protocol` rule detects that `AGENTS.md` does not exist in the repo root.
- An existing `AGENTS.md` is corrupted or has unrecognizable structure.
- Bootstrapping Harness Engineering in a brand-new repository.

## Template

Create `AGENTS.md` in the **repo root**:

```markdown
# AGENTS.md

> This file is the single entry point for all AI coding agents working in this repository.
> Keep it under 100 lines. Point to docs/ for details. Treat it as a version-controlled work contract.

## Architecture Principles

<!-- Define layering, dependency direction, module boundaries. -->
<!-- Example: -->
<!-- - Layered architecture: Types → Config → Repo → Service → API → UI -->
<!-- - Each layer may only depend on layers to its left; no reverse imports -->
<!-- - See [docs/architecture/layering.md](docs/architecture/layering.md) -->

## Instruction Priority (lowest → highest)

<!-- When rules conflict, higher priority wins. -->

| Priority | Source | Scope | Version Control |
|----------|--------|-------|----------------|
| 1 (lowest) | `~/.cursor/rules/*.mdc` | User-global (all projects) | No |
| 2 | `AGENTS.md` | Project-wide (team-shared) | Yes |
| 3 | `.cursor/rules/*.mdc` (in repo) | Project-wide (team-shared) | Yes |
| 4 (highest) | `.agents.local.md` (in repo root) | Personal project override | No (`.gitignore`d) |

## Forbidden Actions

- Do NOT delete or recreate databases; repair instead of rebuild.
- Do NOT delete or recreate infrastructure; fix in place.
- Do NOT add external dependencies without explicit user approval.
- Do NOT modify files outside the workspace without explicit user approval.
- Do NOT commit secrets, credentials, or API keys.
- Do NOT remove or overwrite memory files (`docs/ANALYSIS_MEM.md`, `docs/ANALYSIS_SCRATCH.md`) without explicit user approval.

## Risk Tiers

<!-- Point to a machine-readable risk contract. -->
<!-- Example: -->
<!-- - Risk tier definitions: [risk-tiers.json](risk-tiers.json) -->
<!-- - Critical path changes require multi-person sign-off -->

## Operational Limits

- **Step budget**: Max 30 tool calls per task. If approaching limit, summarize progress and ask user before continuing.
- **Consecutive errors**: If the same operation fails 3 times in a row, STOP. Report the failure pattern and ask for guidance.
- **Repeated edits**: If you edit the same file 5+ times in one task, STOP. You are likely in a doom loop. Summarize what's going wrong and ask for a different approach.
- **Scope creep**: If a task grows beyond 10 file changes, pause and confirm scope with the user.

## Testing Requirements

<!-- Define coverage thresholds, test types, and conventions. -->
<!-- Example: -->
<!-- - All API changes must have corresponding integration tests -->
<!-- - Coverage must not drop below the current baseline -->
<!-- - Testing guide: [docs/testing/guide.md](docs/testing/guide.md) -->

## Code Style

<!-- Point to style guides and lint configurations. -->
<!-- Example: -->
<!-- - Follow [docs/style/conventions.md](docs/style/conventions.md) -->
<!-- - Lint rules defined in .eslintrc.js / pyproject.toml -->

## Knowledge Base

<!-- Point to structured documentation that agents should consult. -->
<!-- Memory uses a four-category classification: Project / User / Feedback / Reference -->
- Analysis memory (long-term, four-category): [docs/ANALYSIS_MEM.md](docs/ANALYSIS_MEM.md)
- Working context (short-term): [docs/ANALYSIS_SCRATCH.md](docs/ANALYSIS_SCRATCH.md)
```

## Customization Guide

After creating the template, guide the user through customization:

1. **Architecture Principles**: Ask "What is your project's layering or module structure?" Uncomment and fill the section.
2. **Instruction Priority**: The four-layer hierarchy is pre-filled. Ask "Do you plan to use `.agents.local.md` for personal overrides?"
3. **Forbidden Actions**: The defaults are universal safety rules. Ask "Are there additional destructive operations specific to your project?"
4. **Risk Tiers**: Ask "Do you want to create a `risk-tiers.json`? Which directories are critical (e.g., db/, auth/, infrastructure/)?"
5. **Operational Limits**: The defaults are recommended starting values. Ask "Do you want to adjust the step budget (30), error threshold (3), or scope limit (10 files)?"
6. **Testing Requirements**: Ask "What test framework do you use? What coverage threshold do you want?"
7. **Code Style**: Ask "Do you have existing lint configs or style guides?"
8. **Knowledge Base**: Auto-link `docs/ANALYSIS_MEM.md` and `docs/ANALYSIS_SCRATCH.md` if they exist.

## Companion Files

When creating AGENTS.md, also offer to create these if they don't exist:

### risk-tiers.json (minimal)

```json
{
  "critical": ["db/", "infrastructure/", "auth/"],
  "high": ["api/", "payments/"],
  "medium": ["src/"],
  "low": ["docs/", "tests/", "*.md"]
}
```

### .agents.local.md (personal override, add to .gitignore)

```markdown
# Local Agent Overrides (personal, not version-controlled)

<!-- Override AGENTS.md settings for your local environment. -->
<!-- Example: custom model preferences, local paths, personal API endpoints. -->
```

When creating `.agents.local.md`, also ensure `.gitignore` contains `.agents.local.md`.

## Recovery

If `AGENTS.md` exists but its structure is unrecognizable:

1. Rename to `AGENTS.md.bak`.
2. Create a fresh file using the template above.
3. Salvage any readable content from `.bak` into the correct sections.
4. Notify the user: `[AGENTS.md Recovery] File was corrupted and has been rebuilt.`
