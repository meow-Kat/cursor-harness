# Sample Kiro Task Walkthrough

This document demonstrates a complete task flow in Kiro using the Harness Engineering framework.

## Scenario

Implement a new `UserService.authenticate()` method in a PHP Laravel project.

## Step 1: Task Start

Main agent executes core protocol:

### 1.1 Load AGENTS.md
```
[AGENTS.md Loaded]
- Forbidden actions: 7
- Risk tiers: defined
- Operational limits: defined
- Architecture: Laravel MVC + Service Layer
- Local overrides: not found
```

### 1.2 Memory Sync
```
[Memory Sync]
- Core Logic: Project 5 | User 2 | Feedback 3 | Reference 2
- Last Pending goal: "Implement authentication flow"
- Scratch status: "Working on UserService"
- Stale items: none
```

### 1.3 Framework Check
```
[Framework Version]
- Recorded: Laravel 10.x
- Current: Laravel 10.x
- Status: OK
```

## Step 2: Delegation to Coder

Main agent delegates to coder subagent:

```javascript
invokeSubAgent({
  name: "general-task-execution",
  contextFiles: [
    { path: ".kiro/agents/coder.md" }
  ],
  prompt: `
Goal: Implement UserService.authenticate() method
Scope: app/Services/UserService.php
Known: 
- Uses Laravel's Hash facade
- Returns JWT token on success
- Throws AuthenticationException on failure
Return: Change Summary with files modified and risk assessment
  `,
  explanation: "Delegate implementation to coder agent"
})
```

## Step 3: preToolUse Hook Triggers

Before coder writes file, hook checks:

```json
{
  "name": "Review Write Operations",
  "when": { "type": "preToolUse", "toolTypes": ["write"] }
}
```

Hook prompt executed:
```
Check this write operation:
- File: app/Services/UserService.php
- Risk tier: medium (src/)
- Forbidden actions: None violated
- Operational limits: Within budget (5/30 tool calls)
✓ Proceed
```

## Step 4: Coder Executes

Coder agent:
1. Reads `AGENTS.md` architecture principles
2. Reads `.kiro/steering/project-framework.md` for Laravel conventions
3. Reads existing `UserService.php`
4. Implements method
5. Runs self-verification checklist
6. Produces Change Summary

### Change Summary Output
```markdown
## Change Summary

### Files Changed
| File | Action | Risk | Description |
|------|--------|------|-------------|
| app/Services/UserService.php | modify | medium | Added authenticate() method |

### Risk Assessment
- Highest risk: medium
- Critical paths touched: no
- Extra review needed: no

### Test Suggestions
- Scenarios: valid credentials, invalid password, non-existent user
- Business logic: password hashing, JWT generation, exception handling
```

## Step 5: Code Review

Main agent reads reviewer prompt and executes:

```javascript
const reviewerPrompt = readFile(".kiro/agents/reviewer.md");
// Execute review based on prompt
```

### Review Report Output
```markdown
## Review Report

### Overview
- Scope: app/Services/UserService.php
- Risk: medium
- Verdict: PASS

### Findings
| # | Severity | Type | File:Line | Issue | Fix |
|---|----------|------|-----------|-------|-----|
| - | - | - | - | No issues found | - |

### Strengths
- Proper exception handling
- Follows Laravel service pattern
- Type hints present

### Summary
Implementation follows AGENTS.md architecture principles. Ready for testing.
```

## Step 6: Testing

Main agent delegates to tester:

```javascript
invokeSubAgent({
  name: "general-task-execution",
  contextFiles: [
    { path: ".kiro/agents/tester.md" }
  ],
  prompt: `
Goal: Write tests for UserService.authenticate()
Scope: tests/Unit/Services/UserServiceTest.php
Known: Change Summary from coder
Return: Test Report with coverage analysis
  `,
  explanation: "Delegate testing to tester agent"
})
```

### Test Report Output
```markdown
## Test Report

### Tests Added/Modified
| Test File | Count | Covers | Type |
|-----------|-------|--------|------|
| tests/Unit/Services/UserServiceTest.php | 3 | UserService.php | Unit |

### Coverage Analysis
- Scenarios covered: valid auth, invalid password, user not found
- Known uncovered risks: none
- Suggested follow-up tests: rate limiting, account lockout

### Results
- Pass: 3 | Fail: 0 | Skip: 0
```

## Step 7: postTaskExecution Hook

After task completes, hook triggers:

```json
{
  "name": "Test After Task",
  "when": { "type": "postTaskExecution" }
}
```

Hook verifies tests ran successfully.

## Step 8: Memory Update

Main agent reads memory-keeper prompt and executes:

```javascript
const memoryPrompt = readFile(".kiro/agents/memory-keeper.md");
// Execute memory update
```

### Memory Update Report
```markdown
## Memory Update Report

### Files Updated
| File | Section | Action | Detail |
|------|---------|--------|--------|
| SCRATCH | Current Context | updated | Task: UserService.authenticate() |
| SCRATCH | Recent Tasks | added | 2026-04-16 Implement auth method |
| MEM | Pending | updated | Next: Implement password reset |

### GC Status
- SCRATCH Recent Tasks: 5 / 7
- MEM Analysis Logs: 18 / 20
- Cleaned/archived: no action needed

### Gap Loop
- New lesson: none
- Recommend promoting to AGENTS.md: no
```

## Step 9: Post-Task Check

Main agent evaluates:

```
[Post-Task Check]
- Circuit breaker triggered: no
- Critical paths touched: no
- Memory limits: SCRATCH 5/7, MEM Logs 18/20
- Feedback loop: no feedback
- Pending aligned: yes
```

## Summary

Task completed successfully:
- ✓ Code implemented following AGENTS.md
- ✓ Review passed
- ✓ Tests written and passing
- ✓ Memory updated
- ✓ No operational limits hit
- ✓ Hooks executed correctly

Total tool calls: 12/30 (within budget)
