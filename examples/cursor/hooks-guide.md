# Cursor Hooks Guide

Cursor supports lifecycle hooks that run at specific points during agent execution. This guide explains the hooks implementation for Harness Engineering.

## Hook Locations

Hooks are defined in `.cursor/hooks.json` and can exist at three levels:

1. **Project**: `.cursor/hooks.json` (version-controlled)
2. **User**: `~/.cursor/hooks.json` (global)
3. **Enterprise**: `/etc/cursor/hooks.json` (organization-wide)

All hooks from all locations will execute.

## Available Lifecycle Hooks

| Hook | When it fires | Can block? | Use case |
|------|---------------|------------|----------|
| `beforeSubmitPrompt` | Before sending prompt to model | ❌ No | Log prompts, add context |
| `beforeShellExecution` | Before running shell command | ✅ Yes | Block dangerous commands |
| `beforeMCPExecution` | Before MCP tool call | ✅ Yes | Control MCP access |
| `beforeReadFile` | Before reading file | ✅ Yes | Redact secrets, block sensitive files |
| `afterFileEdit` | After file modification | ❌ No | Auto-format, lint, commit |
| `stop` | Task completion | ❌ No | Run tests, notify, cleanup |

## Implemented Hooks

### 1. `beforeShellExecution` — Forbidden Actions Guard

**File**: `.cursor/hooks/check-forbidden-actions.sh`

**Purpose**: Block commands that violate AGENTS.md Forbidden Actions

**Blocks**:
- Database deletion: `DROP DATABASE`, `migrate:fresh`, `db:reset`
- Infrastructure deletion: `terraform destroy`, `kubectl delete`
- Critical path deletion: `rm -rf db/`, `rm -rf infrastructure/`

**Response format**:
```json
{
  "permission": "deny|allow|ask",
  "userMessage": "Message shown to user",
  "continue": false
}
```

**Example**:
```bash
# User tries: DROP DATABASE production
# Hook blocks with: ❌ Blocked: Database deletion forbidden (AGENTS.md)
```

### 2. `afterFileEdit` — Auto-format

**File**: `.cursor/hooks/format-on-save.sh`

**Purpose**: Automatically format files after agent edits

**Supports**:
- PHP: `vendor/bin/phpcs`
- TypeScript/JavaScript: `npx prettier`
- Python: `black`

**Input format**:
```json
{
  "file_path": "src/UserService.php",
  "edits": [
    {
      "old_string": "...",
      "new_string": "..."
    }
  ]
}
```

### 3. `stop` — Task Completion

**File**: `.cursor/hooks/task-complete.sh`

**Purpose**: Log task completion and optionally run tests

**Logs to**: `.cursor/hooks/task-log.txt`

**Input format**:
```json
{
  "conversation_id": "uuid",
  "generation_id": "uuid",
  "status": "completed|aborted|error"
}
```

## Hook Configuration

**`.cursor/hooks.json`**:
```json
{
  "version": 1,
  "hooks": {
    "beforeShellExecution": [
      {
        "command": ".cursor/hooks/check-forbidden-actions.sh"
      }
    ],
    "afterFileEdit": [
      {
        "command": ".cursor/hooks/format-on-save.sh"
      }
    ],
    "stop": [
      {
        "command": ".cursor/hooks/task-complete.sh"
      }
    ]
  }
}
```

## Hook Response Format

### Blocking Hooks (beforeShellExecution, beforeMCPExecution, beforeReadFile)

```json
{
  "continue": true|false,
  "permission": "allow|deny|ask",
  "userMessage": "Message shown to user",
  "agentMessage": "Message shown to AI agent"
}
```

**Examples**:

**Allow**:
```json
{
  "permission": "allow",
  "continue": true
}
```

**Deny**:
```json
{
  "permission": "deny",
  "userMessage": "❌ Blocked: Database deletion forbidden",
  "continue": false
}
```

**Ask user**:
```json
{
  "permission": "ask",
  "userMessage": "⚠️  Warning: Modifying critical path. Confirm?",
  "continue": true
}
```

### Informational Hooks (beforeSubmitPrompt, afterFileEdit, stop)

These hooks cannot block execution. They receive data but their output is ignored.

## Debugging Hooks

1. Open Cursor Output panel
2. Select "Hooks" from dropdown
3. View hook execution logs

**Common issues**:
- Hook script not executable: `chmod +x .cursor/hooks/*.sh`
- JSON parse error: Validate JSON with `jq`
- Command not found: Check PATH in hook script

## Advanced Examples

### Block production database access

```bash
#!/bin/bash
input=$(cat)
command=$(echo "$input" | jq -r '.command')

if echo "$command" | grep -qE 'mysql.*production|psql.*production'; then
  echo '{"permission": "deny", "userMessage": "❌ Direct production DB access forbidden"}'
  exit 0
fi

echo '{"permission": "allow"}'
exit 0
```

### Redact secrets before reading

```bash
#!/bin/bash
input=$(cat)
content=$(echo "$input" | jq -r '.content')
file_path=$(echo "$input" | jq -r '.file_path')

# Check for secrets
if echo "$content" | grep -qE '(api_key|password|secret|token)'; then
  echo '{"permission": "deny", "userMessage": "⚠️  File contains secrets, blocked from LLM"}'
  exit 0
fi

echo '{"permission": "allow"}'
exit 0
```

### Auto-commit after task

```bash
#!/bin/bash
input=$(cat)
status=$(echo "$input" | jq -r '.status')

if [ "$status" = "completed" ]; then
  git add .
  git commit -m "Auto: task completed" 2>/dev/null || true
fi

exit 0
```

## Hooks vs Rules

| Feature | Hooks | Rules |
|---------|-------|-------|
| **Execution** | Deterministic scripts | LLM-interpreted |
| **Speed** | Fast, parallel | Slower, serial |
| **Blocking** | Can block operations | Cannot block |
| **Use case** | Automation, security | Guidance, standards |

**When to use hooks**:
- Need to block dangerous operations
- Want deterministic behavior
- Need to run external tools
- Want parallel execution

**When to use rules**:
- Need LLM to interpret context
- Want flexible guidance
- Need to explain "why"
- Want agent to decide

## Harness Engineering Integration

Hooks implement key Harness Engineering mechanisms:

| Mechanism | Hook Implementation |
|-----------|---------------------|
| **Circuit Breaker** | `beforeShellExecution` blocks after N failures |
| **Forbidden Actions** | `beforeShellExecution` checks AGENTS.md |
| **Risk Awareness** | `beforeShellExecution` checks risk-tiers.json |
| **L2 Lint** | `afterFileEdit` runs linters |
| **Feedback Loop** | `stop` logs outcomes |

## Migration from Kiro

Kiro hooks use JSON format, Cursor uses shell scripts:

**Kiro**:
```json
{
  "when": { "type": "preToolUse", "toolTypes": ["write"] },
  "then": { "type": "askAgent", "prompt": "Check..." }
}
```

**Cursor equivalent**:
```json
{
  "beforeShellExecution": [
    { "command": ".cursor/hooks/check-write.sh" }
  ]
}
```

## Best Practices

1. **Keep hooks fast**: Hooks block agent execution
2. **Always exit 0**: Non-zero exit codes may cause issues
3. **Use jq for JSON**: Reliable JSON parsing
4. **Log to files**: Don't rely on stdout for debugging
5. **Test hooks manually**: `echo '{"command":"test"}' | .cursor/hooks/script.sh`
6. **Version control hooks**: Include in `.cursor/hooks/`
7. **Document behavior**: Add comments to hook scripts

## Further Reading

- [Cursor Hooks Documentation](https://docs.cursor.com/hooks)
- [GitButler Cursor Hooks Deep Dive](https://blog.gitbutler.com/cursor-hooks-deep-dive)
- [Cursor Rules, Commands, Skills, Hooks Guide](https://theodoroskokosioulis.com/blog/cursor-rules-commands-skills-hooks-guide/)
