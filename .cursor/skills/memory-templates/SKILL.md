---
name: memory-templates
description: >-
  Provide file templates for the two-tier analysis memory system (ANALYSIS_MEM.md
  and ANALYSIS_SCRATCH.md), and auto-detect the project framework to generate a
  framework-aware Cursor rule. Use when creating memory files for the first time,
  when memory files are missing or corrupted, or when bootstrapping the memory
  protocol in a new project.
---

# Memory Templates

## When to Use

- Agent runs Wake & Sync but `docs/ANALYSIS_MEM.md` or `docs/ANALYSIS_SCRATCH.md` does not exist.
- A memory file is corrupted or has unrecognizable structure.
- Bootstrapping the memory protocol in a brand-new repository.
- `.cursor/rules/project-framework.mdc` does not exist and framework detection has not been run yet.
- Framework version changed (detected in composer.json / package.json).

---

## Long-term Memory Template

Create `docs/ANALYSIS_MEM.md`:

```markdown
# Analysis Memory

## Core Logic

> Classified by type. See memory-keeper for what belongs in each category.
> NEVER store: code patterns, file paths, architecture analysis derivable from code, exact version numbers.

### Project (cannot be derived from code)

<!-- Decisions, constraints, design goals. Prefix each with YYYY-MM-DD. -->

### User (preferences and habits)

<!-- User preferences, skill level, communication style. -->

### Feedback (corrections + confirmations)

<!-- Both mistakes AND validated approaches. Prevents overcorrection. -->

### Reference (external pointers)

<!-- Links to external docs, issues, Slack channels, specs. No inline content. -->

## Analysis Logs

<!-- Max 20 entries. Archive older ones to ANALYSIS_MEM_ARCHIVE.md. -->

## Pending

- **Last action**: Initialized — no history yet.
- **Next goal**: Awaiting first analysis task.
```

---

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

<!-- Corrections: - `YYYY-MM-DD` ❌ <what went wrong> → <correct approach> -->

## Decision Log (keep last 15, then archive to MEM)

<!-- Format: - `YYYY-MM-DD` **<decision>** | Context: <why> | Risk: low/medium/high -->

## Recent Tasks (keep last 7)

<!-- Format: ### YYYY-MM-DD Title + bullets -->
```

---

## Archive Template

Create `docs/ANALYSIS_MEM_ARCHIVE.md` when first archiving:

```markdown
# Analysis Memory Archive

<!-- Archived entries from ANALYSIS_MEM.md, oldest first. -->
```

---

## Framework Detection and Rule Generation

### Step 1 — Auto-Scan

Detect language and framework from project files:

| File | Language | Framework Detection |
|------|----------|---------------------|
| `composer.json` | PHP | `laravel/framework` → Laravel; `codeigniter` → CodeIgniter |
| `package.json` | JS/TS | `next` → Next.js; `react` → React; `vue` → Vue; `@angular/core` → Angular |
| `pyproject.toml` / `requirements.txt` | Python | `django` → Django; `fastapi` → FastAPI; `flask` → Flask |
| `go.mod` | Go | — |
| `Cargo.toml` | Rust | — |
| `Gemfile` | Ruby | `rails` → Rails |

### Step 2 — Extract Version

Read exact version from dependency file:

```
composer.json:
  "require": { "codeigniter/framework": "3.1.11" }
  → framework: CodeIgniter, version: 3.1.11

package.json:
  "dependencies": { "next": "^14.0.0" }
  → framework: Next.js, version: 14.x
```

### Step 3 — Check MCP Availability

Consult MCP mapping:

| Framework | MCP Available | MCP Name |
|-----------|---------------|----------|
| React | ✓ | context7 |
| Next.js | ✓ | context7 |
| Vue | ✓ | context7 |
| Laravel | △ | (check current MCPs) |
| CodeIgniter | ✗ | — |
| Django | △ | (check current MCPs) |
| FastAPI | △ | (check current MCPs) |

### Step 4 — Search for Conventions

**If MCP available:**
1. Query MCP for: coding conventions, forbidden patterns, architecture guidelines
2. Extract version-specific rules

**If no MCP:**
1. WebSearch: `"<framework> <version> coding conventions best practices <current_year>"`
2. Prioritize official documentation
3. Filter results matching exact major.minor version

**Search query examples:**
- `"CodeIgniter 3.x coding conventions best practices 2026"`
- `"Next.js 14 project structure guidelines official docs"`

### Step 5 — User Confirmation

Present findings and ask for confirmation:

```
[Framework Rules Found]
- Framework: CodeIgniter 3.1.11
- Source: WebSearch (official docs)
- Found rules:
  • Architecture: MVC with application/controllers, models, views
  • Naming: Controllers extend CI_Controller, Models extend CI_Model
  • Forbidden: exit()/die() in controllers, var_dump in production
  • Docs: https://codeigniter.com/userguide3/

要將這些規則寫入 project-framework.mdc 嗎？
1. 是，寫入
2. 否，使用基本模板
3. 手動調整後再寫入
```

### Step 6 — Generate project-framework.mdc

Write to `.cursor/rules/project-framework.mdc` with version metadata:

```markdown
---
description: "Project framework conventions (auto-detected)"
alwaysApply: true
framework: <framework_name>
version: <exact_version>
version_source: <composer.json | package.json | etc>
last_checked: <YYYY-MM-DD>
documentation_source: <mcp | websearch | static>
---

# Project Framework: <Language> / <Framework>

## Framework Identity

- Language: <language>
- Framework: <framework>
- Version: <version>
- Detected from: <file>

## Architecture Layering

<from search results or static template>

## Naming Conventions

<from search results or static template>

## Forbidden Patterns

<from search results or static template>

## Documentation Links

- Official: <url>
- API Reference: <url>

## Guardrail-Aware Coding

When writing code in this project, you MUST:
1. Follow Architecture Layering
2. Follow Naming Conventions
3. Never use Forbidden Patterns
4. Check Documentation Links when uncertain
```

### Step 7 — Record in Memory

Add to `ANALYSIS_MEM.md > Core Logic > Project`:

```
- `YYYY-MM-DD` **Framework**: <Language>/<Framework> <version>. Rule: `.cursor/rules/project-framework.mdc`.
```

---

## Version Change Detection

During Task Start, compare versions:

### Check Logic

```
1. Read project-framework.mdc metadata:
   - version: 3.1.11
   - version_source: composer.json

2. Read current composer.json/package.json version

3. Compare:
   - Same → proceed normally
   - Different → trigger update prompt
```

### Version Change Prompt

```
[Framework Version Change]
- 記錄版本：CodeIgniter 3.1.11
- 目前版本：CodeIgniter 3.1.13

要如何處理？
1. 查看官方文件更新（若有 MCP）
2. 網路搜尋此版本規範
3. 維持現有規範
```

### Change Severity

| Change Type | Action |
|-------------|--------|
| Major (3.x → 4.x) | 強烈建議更新，API 可能不相容 |
| Minor (3.1 → 3.2) | 建議檢查，可能有新功能/棄用 |
| Patch (3.1.11 → 3.1.13) | 詢問，通常安全 |

---

## Static Fallback Templates

When search fails or user chooses static template:

### PHP / CodeIgniter

```markdown
## Architecture Layering

1. **system/** — framework core (do not modify)
2. **application/config/** — configuration
3. **application/models/** — data access
4. **application/libraries/** — business logic
5. **application/controllers/** — request handling
6. **application/views/** — presentation

## Naming Conventions

- Controllers: PascalCase, extend CI_Controller
- Models: PascalCase + `_model` suffix, extend CI_Model
- Libraries: PascalCase
- Helpers: snake_case + `_helper` suffix
- Views: snake_case

## Forbidden Patterns

- `var_dump()`, `print_r()`, `die()`, `exit()` in production
- Direct DB queries in controllers (use models)
- Modifying `system/` directory
- Hardcoded credentials
```

### PHP / Laravel

```markdown
## Architecture Layering

1. **app/Models/** — Eloquent models
2. **app/Repositories/** — data access (optional)
3. **app/Services/** — business logic
4. **app/Http/Controllers/** — request handling
5. **app/Http/Middleware/** — request filtering

## Naming Conventions

- Controllers: PascalCase + Controller suffix
- Models: singular PascalCase
- Migrations: snake_case with timestamp
- Form Requests: PascalCase + Request suffix

## Forbidden Patterns

- `dd()`, `dump()`, `var_dump()` in production
- `env()` outside config files
- Raw SQL without bindings
- Business logic in controllers
```

### JavaScript / Next.js

```markdown
## Architecture Layering

1. **types/** — TypeScript definitions
2. **lib/** or **utils/** — utilities
3. **hooks/** — custom React hooks
4. **services/** — API clients
5. **components/** — UI components
6. **app/** or **pages/** — routes

## Naming Conventions

- Components: PascalCase (UserCard.tsx)
- Hooks: camelCase with use prefix (useAuth.ts)
- Utilities: camelCase (formatDate.ts)
- Types: PascalCase (UserProfile)

## Forbidden Patterns

- `console.log()` in production
- `any` type
- `@ts-ignore` without comment
- Inline styles (use CSS modules/Tailwind)
```

---

## Recovery

If memory file structure is unrecognizable:

1. Rename broken file to `<filename>.bak`
2. Create fresh file from template
3. Salvage readable content from `.bak`
4. Notify: `[Memory Recovery] <filename> was corrupted and rebuilt.`
