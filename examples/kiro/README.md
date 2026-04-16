# Kiro Implementation Examples

This directory contains Kiro-specific examples for the Harness Engineering framework.

## Quick Start

1. Copy `.kiro/` directory to your project root
2. Ensure `AGENTS.md` and `risk-tiers.json` exist
3. Open project in Kiro
4. Steering files in `.kiro/steering/` auto-load

## Directory Structure

```
.kiro/
├── steering/          # Rules (auto-loaded based on frontmatter)
│   ├── core-protocol.md          # Always-on (inclusion: always)
│   ├── php-guardrails.md         # PHP files (inclusion: fileMatch)
│   ├── ci-workflows.md           # .github files (inclusion: fileMatch)
│   └── kiro-compatibility.md     # Manual reference (inclusion: manual)
├── agents/            # Agent prompts (loaded via contextFiles)
│   ├── coder.md
│   ├── tester.md
│   ├── reviewer.md
│   ├── memory-keeper.md
│   ├── observability.md
│   └── project-analyzer.md
├── skills/            # Automation templates
│   ├── agents-md-template/
│   ├── memory-templates/
│   ├── php-guardrails-template/
│   └── ci-workflows-template/
└── hooks/             # Event-driven automation
    ├── review-write-ops.json     # preToolUse
    ├── test-after-task.json      # postTaskExecution
    └── lint-on-save.json         # fileEdited
```

## Example Workflows

### 1. Code Implementation

```javascript
// Main agent delegates to coder
invokeSubAgent({
  name: "general-task-execution",
  contextFiles: [
    { path: ".kiro/agents/coder.md" }
  ],
  prompt: "Implement UserService.authenticate() method",
  explanation: "Delegate to coder agent"
})
```

### 2. Code Review

```javascript
// Read reviewer prompt and execute
const reviewerPrompt = readFile(".kiro/agents/reviewer.md");
// Execute review based on prompt (readonly)
```

### 3. Codebase Exploration

```javascript
// Use built-in context-gatherer
invokeSubAgent({
  name: "context-gatherer",
  prompt: "Find all authentication-related files and their relationships",
  explanation: "Explore auth module"
})
```

## Hook Examples

### preToolUse: Write Operation Guard

Prevents forbidden actions before execution:

```json
{
  "name": "Review Write Operations",
  "when": {
    "type": "preToolUse",
    "toolTypes": ["write"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "Check against AGENTS.md Forbidden Actions"
  }
}
```

### postTaskExecution: Auto-test

Runs tests after task completion:

```json
{
  "name": "Test After Task",
  "when": {
    "type": "postTaskExecution"
  },
  "then": {
    "type": "askAgent",
    "prompt": "Invoke tester subagent to verify"
  }
}
```

### fileEdited: Lint on Save

Auto-lints PHP files on save:

```json
{
  "name": "Lint PHP on Save",
  "when": {
    "type": "fileEdited",
    "patterns": ["*.php"]
  },
  "then": {
    "type": "runCommand",
    "command": "vendor/bin/phpcs"
  }
}
```

## Skill Usage

Activate skills via `discloseContext`:

```javascript
// Create AGENTS.md if missing
discloseContext({ name: "agents-md-template" })

// Initialize memory system
discloseContext({ name: "memory-templates" })

// Set up PHP guardrails
discloseContext({ name: "php-guardrails-template" })
```

## Tool Mappings

| Cursor | Kiro |
|--------|------|
| `Glob` | `fileSearch` |
| `Grep` | `grepSearch` |
| `Read` | `readFile` / `readMultipleFiles` |
| `Shell` | `executeBash` |

## Key Differences from Cursor

1. **Subagents**: Use `invokeSubAgent` with `contextFiles` instead of direct agent files
2. **Hooks**: Kiro has hooks, Cursor doesn't
3. **Steering**: Kiro uses `inclusion` frontmatter, Cursor uses `alwaysApply`/`globs`
4. **Built-in agents**: Kiro has 3 built-in, Cursor allows custom

## Testing the Setup

1. Open project in Kiro
2. Check steering files loaded: `.kiro/steering/core-protocol.md` should auto-load
3. Test hook: Edit a PHP file, check if lint runs
4. Test subagent: Try delegating to coder agent
5. Test skill: Activate `agents-md-template` skill

## Troubleshooting

### Steering not loading
- Check frontmatter syntax
- Verify `inclusion` field correct
- Check file extension is `.md`

### Hooks not triggering
- Verify JSON syntax
- Check `when.type` matches event
- Ensure hook file in `.kiro/hooks/`

### Subagent fails
- Verify agent file exists in `.kiro/agents/`
- Check `contextFiles` path correct
- Ensure `name` is one of 3 built-in agents

## Further Reading

- Main README: `../../README.md`
- AGENTS.md: `../../AGENTS.md`
- Kiro compatibility guide: `../.kiro/steering/kiro-compatibility.md`
