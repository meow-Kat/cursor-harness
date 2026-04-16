---
name: memory-templates
description: Two-tier memory system + framework detection
---

# Memory Templates

## When to Use

- Memory files missing
- First run
- Framework detection needed

## Creates

1. `docs/ANALYSIS_MEM.md` (long-term)
2. `docs/ANALYSIS_SCRATCH.md` (short-term)
3. Framework config (IDE-specific path)

## Framework Detection

Auto-detect from:
- `composer.json` → PHP/Laravel
- `package.json` → JS/TS/Next.js
- `pyproject.toml` → Python/Django

## MCP Mapping

| Framework | MCP Server | Purpose |
|-----------|------------|---------|
| React | context7 | React docs |
| Next.js | context7 | Next.js docs |
| Vue | context7 | Vue docs |
| Laravel | (none yet) | Laravel docs |
| Django | (none yet) | Django docs |
