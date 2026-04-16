# Harness Engineering Compiler

Compile unified source files or harness configuration into IDE-specific implementations for Cursor and Kiro.

## Two Workflows

### Source-Based Workflow (Recommended)

Edit files in `src/` directory and compile to IDE-specific formats.

**Advantages**:
- Single source of truth in `src/`
- Easy to version control
- Clear separation of source and compiled output
- IDE-agnostic source format

### harness.yaml Workflow (Alternative)

Use a single `harness.yaml` file to define all configurations.

**Advantages**:
- All configuration in one file
- Easy to share and review
- Good for simple setups

## Installation

```bash
cd tools
npm install
```

## Usage

### Source-Based Workflow

```bash
# Compile from src/ directory (recommended)
node harness-compiler.js compile --source

# Compile for specific IDE
node harness-compiler.js compile --source --target=cursor
node harness-compiler.js compile --source --target=kiro

# Validate source files
node harness-compiler.js validate --source
```

### harness.yaml Workflow

```bash
# Compile for both IDEs
node harness-compiler.js compile
npm run compile

# Compile for specific IDE
node harness-compiler.js compile --target=cursor
npm run compile:cursor

node harness-compiler.js compile --target=kiro
npm run compile:kiro

# Validate configuration
node harness-compiler.js validate
npm run validate
```

## Source-Based Workflow Details

### Directory Structure

```
src/
├── rules/          # Unified rule definitions
│   ├── core-protocol.md
│   ├── php-guardrails.md
│   └── ci-workflows.md
├── agents/         # Agent prompts
│   ├── coder.md
│   ├── tester.md
│   └── reviewer.md
├── skills/         # Reusable skills/templates
│   ├── agents-md-template/
│   │   └── SKILL.md
│   └── mcp-setup/
│       └── SKILL.md
└── hooks/          # Event automation (YAML format)
    ├── check-forbidden-actions.yaml
    ├── review-write-ops.yaml
    └── format-on-save.yaml
```

### Source File Format

**Rules** (`src/rules/*.md`):
```yaml
---
name: core-protocol
description: Core agent protocol
inclusion: always  # or: fileMatch, manual
fileMatchPattern: "**/*.php"  # optional, for fileMatch
---

# Rule content in markdown
```

**Hooks** (`src/hooks/*.yaml`):
```yaml
name: check-forbidden-actions
description: Block dangerous commands
event: beforeShellExecution
action:
  type: script
  script: |
    #!/bin/bash
    # Shell script
```

**Agents** (`src/agents/*.md`):
```yaml
---
name: coder
model: claude-4.6-sonnet
description: Coding agent
---

Agent prompt content
```

**Skills** (`src/skills/*/SKILL.md`):
```yaml
---
name: agents-md-template
description: Generate AGENTS.md
---

Skill content
```

### Compilation Output

| Source | Cursor Output | Kiro Output |
|--------|---------------|-------------|
| `src/rules/*.md` | `.cursor/rules/*.mdc` | `.kiro/steering/*.md` |
| `src/agents/*.md` | `.cursor/agents/*.md` | `.kiro/agents/*.md` |
| `src/skills/*/SKILL.md` | `.cursor/skills/*/SKILL.md` | `.kiro/skills/*/SKILL.md` |
| `src/hooks/*.yaml` | `.cursor/hooks/*.sh` + `hooks.json` | `.kiro/hooks/*.json` |

## Configuration Format

Edit `harness.yaml` in project root:

```yaml
version: "1.0"

rules:
  - name: core-protocol
    description: Core agent protocol
    inclusion: always  # or: fileMatch, manual
    fileMatchPattern: "**/*.php"  # optional, for fileMatch
    content: |
      # Rule content in markdown

hooks:
  - name: check-forbidden-actions
    description: Block dangerous commands
    event: beforeShellExecution  # or: afterFileEdit, stop, preToolUse, etc.
    toolTypes: ["write"]  # optional, for preToolUse
    patterns: ["*.php"]  # optional, for fileEdited
    action:
      type: script  # or: askAgent, runCommand
      script: |
        #!/bin/bash
        # Shell script for Cursor
      prompt: "Check against AGENTS.md"  # for askAgent (Kiro)
      command: "vendor/bin/phpcs"  # for runCommand (Kiro)
      timeout: 30  # optional, for runCommand

agents:
  - name: coder
    model: claude-4.6-sonnet
    description: Coding agent
    content: |
      Agent prompt content

skills:
  - name: agents-md-template
    description: Generate AGENTS.md
    files:
      - path: SKILL.md
        content: |
          Skill content
```

## Output Structure

### Cursor Output

```
.cursor/
├── rules/
│   ├── core-protocol.mdc
│   ├── php-guardrails.mdc
│   └── ci-workflows.mdc
├── agents/
│   ├── coder.md
│   ├── tester.md
│   └── reviewer.md
├── skills/
│   └── agents-md-template/
│       └── SKILL.md
├── hooks/
│   ├── check-forbidden-actions.sh
│   ├── format-on-save.sh
│   └── task-complete.sh
└── hooks.json
```

### Kiro Output

```
.kiro/
├── steering/
│   ├── core-protocol.md
│   ├── php-guardrails.md
│   └── ci-workflows.md
├── agents/
│   ├── coder.md
│   ├── tester.md
│   └── reviewer.md
├── skills/
│   └── agents-md-template/
│       └── SKILL.md
└── hooks/
    ├── check-forbidden-actions.json
    ├── format-on-save.json
    └── review-write-ops.json
```

## Event Mapping

The compiler automatically maps events between IDEs:

| Unified Event | Cursor | Kiro |
|---------------|--------|------|
| `beforeShellExecution` | `beforeShellExecution` | `preToolUse` |
| `afterFileEdit` | `afterFileEdit` | `fileEdited` |
| `stop` | `stop` | `postTaskExecution` |
| `preToolUse` | `beforeShellExecution` | `preToolUse` |
| `fileEdited` | `afterFileEdit` | `fileEdited` |

## Hook Action Types

### script (Cursor only)

Generates shell script for Cursor, skipped for Kiro:

```yaml
action:
  type: script
  script: |
    #!/bin/bash
    # Shell script
```

### askAgent (Kiro only)

Generates Kiro hook with LLM-based action, skipped for Cursor:

```yaml
action:
  type: askAgent
  prompt: "Check against AGENTS.md"
```

### runCommand (Kiro only)

Generates Kiro hook with shell command, skipped for Cursor:

```yaml
action:
  type: runCommand
  command: "vendor/bin/phpcs"
  timeout: 30
```

## Path Reference Updates

The compiler automatically updates path references in skills:

- `.cursor/rules/` → `.kiro/steering/`
- `.cursor/agents/` → `.kiro/agents/`
- `.mdc` → `.md`

## Validation

The compiler validates:

- Required fields (name, content, event, action)
- Event types
- Action types
- File structure

Run validation before compiling:

```bash
npm run validate
```

## Examples

See `harness.yaml` in project root for complete example configuration.

## Troubleshooting

### "Cannot find module 'js-yaml'"

```bash
cd tools
npm install
```

### "Permission denied" when running hooks

Cursor hooks are automatically made executable (`chmod +x`).

### Hooks not triggering

1. Check IDE output panel (Hooks channel)
2. Validate JSON syntax
3. Ensure event names are correct

## Further Reading

- Main README: `../README.md`
- Cursor hooks guide: `../examples/cursor/hooks-guide.md`
- Kiro examples: `../examples/kiro/README.md`
