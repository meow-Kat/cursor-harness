---
name: blank-project-init
description: Initialize blank project with AGENTS.md, memory system, and MCP configuration. Use when project has no AGENTS.md and no source directories.
---

# Blank Project Initialization

## When to Use

- No `AGENTS.md` in repo root
- No source directories (`src/`, `app/`, `application/`, `lib/`)
- Only config skeletons exist

## Creates

1. `AGENTS.md` (using agents-md-template skill)
2. `docs/ANALYSIS_MEM.md` (using memory-templates skill)
3. `docs/ANALYSIS_SCRATCH.md` (using memory-templates skill)
4. MCP config (IDE-specific, using mcp-setup skill if framework detected)
5. `risk-tiers.json`
6. Framework config (IDE-specific, using memory-templates skill)

## Workflow

1. Detect framework from `package.json`, `composer.json`, or `pyproject.toml`
2. Create `AGENTS.md` with framework-specific defaults
3. Create memory files
4. If framework has MCP server → create MCP config
5. Create `risk-tiers.json` with default tiers
6. Create framework config with conventions

## IDE-Specific Paths

| File | Cursor | Kiro |
|------|--------|------|
| MCP config | `.cursor/mcp.json` | `.kiro/settings/mcp.json` |
| Framework config | `.cursor/rules/project-framework.mdc` | `.kiro/steering/project-framework.md` |
