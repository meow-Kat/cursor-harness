---
name: memory-templates
description: Provide file templates for the two-tier analysis memory system (ANALYSIS_MEM.md and ANALYSIS_SCRATCH.md), and auto-detect the project framework to generate a framework-aware Cursor rule. Use when creating memory files for the first time, when memory files are missing or corrupted, or when bootstrapping the memory protocol in a new project.
---

# Memory Templates

## When to Use

- Agent runs Wake & Sync but `docs/ANALYSIS_MEM.md` or `docs/ANALYSIS_SCRATCH.md` does not exist.
- A memory file is corrupted or has unrecognizable structure.
- Bootstrapping the memory protocol in a brand-new repository.
- `.cursor/rules/project-framework.mdc` does not exist and framework detection has not been run yet.

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

## Framework Detection and Rule Generation

After creating memory files (or during first run in an existing project), detect the project's framework and generate a Cursor rule so all agents know the framework conventions.

### Step 1 — Auto-Scan

Check for the following files in the project root to determine the language and framework:

| File | Language | Sub-framework detection |
|------|----------|------------------------|
| `composer.json` | PHP | Contains `laravel/framework` → Laravel |
| `package.json` | JavaScript/TypeScript | Contains `next` → Next.js; `react` → React; `vue` → Vue; `@angular/core` → Angular |
| `tsconfig.json` | TypeScript | (confirms TS over JS) |
| `pyproject.toml` or `requirements.txt` | Python | Contains `django` → Django; `fastapi` → FastAPI; `flask` → Flask |
| `go.mod` | Go | — |
| `Cargo.toml` | Rust | — |
| `Gemfile` | Ruby | Contains `rails` → Rails |
| None of the above | Unknown | Generate skeleton rule for user to fill |

If multiple language files exist (e.g., `composer.json` + `package.json`), pick the **primary** one (the one with the most source files) and note the secondary in the rule.

### Step 2 — Generate `.cursor/rules/project-framework.mdc`

Based on the detection result, create the rule file from the matching template below. If `.cursor/rules/project-framework.mdc` already exists, **do not overwrite** — notify the user instead.

### Step 3 — Record in Memory

Add to `ANALYSIS_MEM.md > Core Logic > Project`:

```
- `YYYY-MM-DD` **Framework**: [Language] / [Framework]. Detected from [file]. Rule: `.cursor/rules/project-framework.mdc`.
```

### Step 4 — Output Confirmation

```
[Framework Detection]
- Language: <language>
- Framework: <framework or 'none'>
- Detected from: <file>
- Rule generated: .cursor/rules/project-framework.mdc
```

---

## Framework Rule Templates

Each template below is a complete `.cursor/rules/project-framework.mdc` file. Copy the matching one.

### Template: PHP / Laravel

````
---
description: "Project framework conventions — PHP/Laravel (auto-detected)"
alwaysApply: true
---

# Project Framework: PHP / Laravel

> Auto-generated by memory-templates skill. Customize as needed.

## Framework Identity

- Language: PHP
- Framework: Laravel
- Detected from: composer.json

## Architecture Layering

Dependency direction: each layer may only depend on layers below it.

1. **Model** — Eloquent models, value objects
2. **Config** — configuration, constants, enums
3. **Repository** — data access abstraction
4. **Service** — business logic orchestration
5. **Controller** — HTTP request handling
6. **Infrastructure** — middleware, providers, console commands

## Naming Conventions

- Controllers: PascalCase ending with `Controller` (e.g., `UserController`)
- Models: singular PascalCase (e.g., `User`, `OrderItem`)
- Migrations: snake_case with timestamp prefix (Laravel default)
- Form Requests: PascalCase ending with `Request` (e.g., `StoreUserRequest`)
- Events / Listeners / Jobs: PascalCase describing the action (e.g., `OrderPlaced`, `SendWelcomeEmail`)

## Forbidden Patterns

Do NOT use these in production code:

- `var_dump()`, `dd()`, `dump()`, `print_r()` — use logging instead
- `die()`, `exit()` — use exceptions or proper response returns
- Raw SQL without parameter binding — use Eloquent or query builder bindings
- `env()` outside of config files — always access via `config()`

## Recommended Tools

- **Dependency direction**: deptrac (`deptrac.yaml`)
- **Architecture rules**: phparkitect (`phparkitect.php`)
- **Static analysis**: PHPStan level 6+ (`phpstan.neon`)
- **Coding standard**: PHP_CodeSniffer PSR-12 (`phpcs.xml`)

Install: `composer require --dev qossmic/deptrac-shim phparkitect/arkitect phpstan/phpstan squizlabs/php_codesniffer`

## Guardrail-Aware Coding

When writing code in this project, you MUST:

1. Follow the Architecture Layering — do not introduce reverse dependencies
2. Follow Naming Conventions for all new files and symbols
3. Never use Forbidden Patterns
4. If Recommended Tools configs exist in the project root, ensure code passes them
5. Follow PSR-12 coding standard
````

### Template: JavaScript / TypeScript (Next.js / React)

````
---
description: "Project framework conventions — JavaScript/TypeScript (auto-detected)"
alwaysApply: true
---

# Project Framework: JavaScript / TypeScript

> Auto-generated by memory-templates skill. Customize as needed.

## Framework Identity

- Language: TypeScript
- Framework: Next.js (React)
- Detected from: package.json

## Architecture Layering

Dependency direction: each layer may only depend on layers below it.

1. **types** — TypeScript type definitions, interfaces, enums
2. **utils / helpers** — pure utility functions, constants
3. **hooks** — custom React hooks (state + side effects)
4. **services** — API clients, external service integrations
5. **components** — reusable UI components
6. **pages / app** — route-level components, page layouts

## Naming Conventions

- Components: PascalCase files and exports (e.g., `UserCard.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useAuth.ts`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Types/Interfaces: PascalCase with descriptive names (e.g., `UserProfile`, `ApiResponse`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)
- Directories: kebab-case (e.g., `user-profile/`)

## Forbidden Patterns

Do NOT use these in production code:

- `console.log()` — use a structured logger or remove before commit
- `any` type — use `unknown` or define proper types
- `eval()` — security risk, never use
- `@ts-ignore` without an explanation comment
- `!` non-null assertion without justification
- Inline styles in components — use CSS modules, Tailwind, or styled-components

## Recommended Tools

- **Linting**: ESLint with framework-specific config
- **Formatting**: Prettier
- **Dependency direction**: dependency-cruiser (`.dependency-cruiser.cjs`)
- **Type checking**: TypeScript strict mode (`"strict": true` in `tsconfig.json`)

Install: `npm install --save-dev eslint prettier dependency-cruiser typescript`

## Guardrail-Aware Coding

When writing code in this project, you MUST:

1. Follow the Architecture Layering — do not introduce reverse dependencies
2. Follow Naming Conventions for all new files and symbols
3. Never use Forbidden Patterns
4. Ensure `tsc --noEmit` passes (no type errors)
5. If ESLint config exists, ensure code passes `eslint .`
````

### Template: Python (Django / FastAPI)

````
---
description: "Project framework conventions — Python (auto-detected)"
alwaysApply: true
---

# Project Framework: Python

> Auto-generated by memory-templates skill. Customize as needed.

## Framework Identity

- Language: Python
- Framework: Django / FastAPI
- Detected from: pyproject.toml

## Architecture Layering

Dependency direction: each layer may only depend on layers below it.

1. **models** — data models, ORM definitions, dataclasses
2. **schemas** — Pydantic models, serializers, validation
3. **repositories** — data access layer, query abstractions
4. **services** — business logic, use cases
5. **views / routers** — HTTP endpoint handlers
6. **middleware** — request/response processing, auth

## Naming Conventions

- Modules and packages: snake_case (e.g., `user_service.py`)
- Functions and variables: snake_case (e.g., `get_user_by_id`)
- Classes: PascalCase (e.g., `UserService`, `OrderRepository`)
- Constants: UPPER_SNAKE_CASE (e.g., `DEFAULT_PAGE_SIZE`)
- Private members: leading underscore (e.g., `_internal_helper`)
- Type aliases: PascalCase (e.g., `UserId = int`)

## Forbidden Patterns

Do NOT use these in production code:

- `print()` — use `logging` module instead
- Bare `except:` or `except Exception:` without re-raise or specific handling
- `import *` — always use explicit imports
- `type: ignore` without an explanation comment
- Mutable default arguments (e.g., `def foo(items=[])`)
- Global mutable state outside of configuration

## Recommended Tools

- **Linting + formatting**: ruff (`ruff.toml` or `pyproject.toml [tool.ruff]`)
- **Type checking**: mypy strict mode (`mypy.ini` or `pyproject.toml [tool.mypy]`)
- **Import structure**: import-linter (`.importlinter` config)
- **Testing**: pytest with coverage (`pytest.ini` or `pyproject.toml [tool.pytest]`)

Install: `pip install ruff mypy import-linter pytest pytest-cov`

## Guardrail-Aware Coding

When writing code in this project, you MUST:

1. Follow the Architecture Layering — do not introduce reverse dependencies
2. Follow Naming Conventions for all new files and symbols
3. Never use Forbidden Patterns
4. Ensure `mypy .` passes (no type errors)
5. If ruff config exists, ensure code passes `ruff check .`
````

### Template: Go

````
---
description: "Project framework conventions — Go (auto-detected)"
alwaysApply: true
---

# Project Framework: Go

> Auto-generated by memory-templates skill. Customize as needed.

## Framework Identity

- Language: Go
- Framework: (standard library / gin / echo — adjust as needed)
- Detected from: go.mod

## Architecture Layering

Dependency direction: each layer may only depend on layers below it.

1. **model** — domain types, entities, value objects
2. **repository** — data access interfaces and implementations
3. **service** — business logic, use cases
4. **handler** — HTTP/gRPC handlers, request/response mapping
5. **middleware** — cross-cutting concerns (auth, logging, recovery)
6. **cmd** — application entry points

## Naming Conventions

- Exported identifiers: PascalCase (e.g., `UserService`, `GetByID`)
- Unexported identifiers: camelCase (e.g., `userRepo`, `validateInput`)
- Packages: short, lowercase, single word (e.g., `user`, `auth`, `order`)
- Interfaces: describe behavior, often `-er` suffix (e.g., `Reader`, `UserStore`)
- Files: snake_case (e.g., `user_handler.go`, `order_service.go`)
- Test files: `*_test.go` in the same package

## Forbidden Patterns

Do NOT use these in production code:

- `fmt.Println()` / `fmt.Printf()` for logging — use `log/slog` or structured logger
- `panic()` in library/service code — return errors instead
- `interface{}` — use `any` (Go 1.18+)
- Ignoring errors with `_` — handle or wrap every error
- `init()` functions — prefer explicit initialization

## Recommended Tools

- **Linting**: golangci-lint (`.golangci.yml`)
- **Vetting**: `go vet ./...`
- **Testing**: `go test -race -cover ./...`
- **Formatting**: `gofmt` / `goimports` (enforced by editor)

Install: `go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest`

## Guardrail-Aware Coding

When writing code in this project, you MUST:

1. Follow the Architecture Layering — do not introduce reverse dependencies
2. Follow Naming Conventions for all new files and symbols
3. Never use Forbidden Patterns
4. Ensure `go vet ./...` passes
5. If golangci-lint config exists, ensure code passes `golangci-lint run`
````

### Template: Unknown (Skeleton)

````
---
description: "Project framework conventions — please customize"
alwaysApply: true
---

# Project Framework: (Unknown — please fill in)

> Auto-generated skeleton by memory-templates skill. Fill in each section for your project.

## Framework Identity

- Language: <!-- e.g., Ruby, Rust, Java, C# -->
- Framework: <!-- e.g., Rails, Actix, Spring Boot, ASP.NET -->
- Detected from: (auto-detection did not match known frameworks)

## Architecture Layering

<!-- Define your layers from bottom (most stable) to top (most volatile). -->
<!-- Each layer may only depend on layers below it. -->
<!-- Example: -->
<!-- 1. **model** — domain types -->
<!-- 2. **repository** — data access -->
<!-- 3. **service** — business logic -->
<!-- 4. **controller** — HTTP handling -->

## Naming Conventions

<!-- Define naming rules for your project. -->
<!-- Example: -->
<!-- - Files: snake_case -->
<!-- - Classes: PascalCase -->
<!-- - Functions: camelCase -->

## Forbidden Patterns

<!-- List code patterns that should never appear in production. -->
<!-- Example: -->
<!-- - Debug print statements -->
<!-- - Hardcoded credentials -->
<!-- - Suppressed error handling -->

## Recommended Tools

<!-- List lint/analysis tools and their config files. -->
<!-- Example: -->
<!-- - Linting: tool_name (config_file) -->
<!-- - Type checking: tool_name (config_file) -->

## Guardrail-Aware Coding

When writing code in this project, you MUST:

1. Follow the Architecture Layering — do not introduce reverse dependencies
2. Follow Naming Conventions for all new files and symbols
3. Never use Forbidden Patterns
4. If lint/analysis tool configs exist, ensure code passes them
````

---

## Recovery

If a memory file exists but its structure is unrecognizable:

1. Rename the broken file to `<filename>.bak`.
2. Create a fresh file using the template above.
3. Salvage any readable content from the `.bak` file into the correct sections.
4. Notify the user: `[Memory Recovery] <filename> was corrupted and has been rebuilt.`
