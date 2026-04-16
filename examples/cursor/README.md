# Cursor Implementation Examples

This directory contains Cursor-specific examples for the Harness Engineering framework.

## Quick Start

1. Copy `.cursor/` directory to your project root
2. Ensure `AGENTS.md` and `risk-tiers.json` exist
3. Open project in Cursor
4. Rules and hooks auto-load

## Directory Structure

```
.cursor/
├── rules/             # Rules (auto-loaded based on frontmatter)
│   ├── core-protocol.mdc          # Always-on (alwaysApply: true)
│   ├── php-guardrails-protocol.mdc # PHP files (globs: **/*.php)
│   └── ci-workflows-protocol.mdc   # .github files (globs: **/.github/**)
├── agents/            # Agent prompts (direct invocation)
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
├── hooks/             # Event-driven automation (shell scripts)
│   ├── check-forbidden-actions.sh  # beforeShellExecution
│   ├── format-on-save.sh           # afterFileEdit
│   └── task-complete.sh            # stop
└── hooks.json         # Hook configuration
```

## Hooks

Cursor hooks are shell scripts that run at specific lifecycle points.

### Configuration

**`.cursor/hooks.json`**:
```json
{
  "version": 1,
  "hooks": {
    "beforeShellExecution": [
      { "command": ".cursor/hooks/check-forbidden-actions.sh" }
    ],
    "afterFileEdit": [
      { "command": ".cursor/hooks/format-on-save.sh" }
    ],
    "stop": [
      { "command": ".cursor/hooks/task-complete.sh" }
    ]
  }
}
```

### Available Hooks

| Hook | When | Can Block? |
|------|------|------------|
| `beforeSubmitPrompt` | Before sending prompt to model | ❌ |
| `beforeShellExecution` | Before running shell command | ✅ |
| `beforeMCPExecution` | Before MCP tool call | ✅ |
| `beforeReadFile` | Before reading file | ✅ |
| `afterFileEdit` | After file modification | ❌ |
| `stop` | Task completion | ❌ |

### Hook Response Format

Blocking hooks can return JSON to control execution:

```json
{
  "permission": "allow|deny|ask",
  "userMessage": "Message shown to user",
  "continue": true|false
}
```

## Examples

### Block Dangerous Commands

```bash
#!/bin/bash
input=$(cat)
command=$(echo "$input" | jq -r '.command')

if echo "$command" | grep -qE 'DROP DATABASE'; then
  echo '{"permission": "deny", "userMessage": "❌ Blocked: Database deletion"}'
  exit 0
fi

echo '{"permission": "allow"}'
exit 0
```

### Auto-format After Edit

```bash
#!/bin/bash
input=$(cat)
file_path=$(echo "$input" | jq -r '.file_path')

if [[ "$file_path" == *.php ]]; then
  vendor/bin/phpcs "$file_path" 2>/dev/null || true
fi

exit 0
```

## Debugging

1. Open Cursor Output panel
2. Select "Hooks" from dropdown
3. View hook execution logs

## Further Reading

- [Cursor Hooks Guide](./hooks-guide.md) — Complete hooks documentation
- [GitButler Hooks Deep Dive](https://blog.gitbutler.com/cursor-hooks-deep-dive)
- Main README: `../../README.md`
