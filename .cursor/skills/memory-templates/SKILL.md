---
name: memory-templates
description: Provide file templates for the two-tier analysis memory system (ANALYSIS_MEM.md and ANALYSIS_SCRATCH.md). Use when creating memory files for the first time, when memory files are missing or corrupted, or when bootstrapping the memory protocol in a new project.
---

# Memory Templates

## When to Use

- Agent runs Wake & Sync but `docs/ANALYSIS_MEM.md` or `docs/ANALYSIS_SCRATCH.md` does not exist.
- A memory file is corrupted or has unrecognizable structure.
- Bootstrapping the memory protocol in a brand-new repository.

## Long-term Memory Template

Create `docs/ANALYSIS_MEM.md`:

```markdown
# Analysis Memory

## Core Logic

> Classified by type. See memory-keeper for what belongs in each category.
> NEVER store: code patterns, file paths, architecture analysis derivable from code, exact version numbers.

### Project (cannot be derived from code)

<!-- Decisions, constraints, design goals. Prefix each with YYYY-MM-DD. -->
<!-- Example: - `2026-01-15` We chose PostgreSQL because the team has DBA expertise. -->

### User (preferences and habits)

<!-- User preferences, skill level, communication style. -->
<!-- Example: - `2026-01-15` User prefers Traditional Chinese responses. -->

### Feedback (corrections + confirmations)

<!-- Both mistakes AND validated approaches. Prevents overcorrection. -->
<!-- Example: - `2026-01-15` **正向**：Six-subagent architecture confirmed as correct direction. -->
<!-- Example: - `2026-01-15` **修正**：Model config should use opus for stability, not fast. -->

### Reference (external pointers)

<!-- Links to external docs, issues, Slack channels, specs. No inline content. -->
<!-- Example: - `2026-01-15` Design spec: https://... -->

## Analysis Logs

<!-- Max 20 entries. Archive older ones to ANALYSIS_MEM_ARCHIVE.md. -->
<!-- Format per entry: -->
<!-- ### YYYY-MM-DD Short Title -->
<!-- - Key finding (max 5 bullets per entry) -->

## Pending

- **Last action**: Initialized — no history yet.
- **Next goal**: Awaiting first analysis task.
```

## Short-term Memory (Scratch) Template

Create `docs/ANALYSIS_SCRATCH.md`:

```markdown
# Analysis Scratch (Short-term)

## Current Context

- Task: (none)
- Scope: (none)
- Status: (none)
- Key decisions: (none)

## Working Notes

<!-- High-churn notes. Prefer file paths, symbols, commands over prose. -->

## Lessons / Pitfalls (Feedback Loop)

<!-- Corrections: - `YYYY-MM-DD` ❌ <what went wrong> → <what should be done instead> -->
<!-- Confirmations go to MEM > Core Logic > Feedback (not here). -->
<!-- Review periodically; promote recurring patterns to AGENTS.md Forbidden Actions or Core Logic > Project. -->

## Decision Log (keep last 15, then archive to MEM)

<!-- Significant decisions with rationale. Managed by memory-keeper Task 5. -->
<!-- Format: - `YYYY-MM-DD` **<decision>** | Context: <why> | Alternatives: <what else> | Risk: low/medium/high -->

## Recent Tasks (keep last 7)

<!-- Format per entry: -->
<!-- ### YYYY-MM-DD Short Title -->
<!-- - What was tried -->
<!-- - What worked / failed -->
<!-- - Next action (exact command or file to touch) -->
```

## Archive Template

Create `docs/ANALYSIS_MEM_ARCHIVE.md` when first archiving old log entries:

```markdown
# Analysis Memory Archive

<!-- Archived entries from ANALYSIS_MEM.md, oldest first. -->
```

## Recovery

If a memory file exists but its structure is unrecognizable:

1. Rename the broken file to `<filename>.bak`.
2. Create a fresh file using the template above.
3. Salvage any readable content from the `.bak` file into the correct sections.
4. Notify the user: `[Memory Recovery] <filename> was corrupted and has been rebuilt.`
