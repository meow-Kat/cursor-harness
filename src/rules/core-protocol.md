---
name: core-protocol
description: Core agent protocol - task lifecycle, delegation, memory, constraints
inclusion: always
---

# Core Protocol

**⚠️ CRITICAL: This protocol MUST be executed at the start of EVERY task, including context transfers and conversation continuations. Do NOT skip §1 Task Start even if you have a summary.**

Unified protocol for task start, execution, constraints, and completion.

## §0 Enforcement (READ THIS FIRST)

**BLOCKING REQUIREMENT**: Before responding to ANY user request, you MUST:

1. ✅ Read `AGENTS.md` in full
2. ✅ Read `docs/ANALYSIS_MEM.md` in full
3. ✅ Read `docs/ANALYSIS_SCRATCH.md` in full
4. ✅ Output the confirmation blocks below

**If you skip this, you are violating the protocol.**

### Why This Matters

- Context summaries are NOT a substitute for reading actual memory files
- Memory files contain decisions, lessons, and constraints not in summaries
- Skipping memory sync leads to:
  - Creating redundant documentation
  - Ignoring established patterns
  - Violating project constraints
  - Losing institutional knowledge

## §1 Task Start

Execute in order: AGENTS.md → Memory → Blank Check

### 1.1 Load AGENTS.md

**MANDATORY OUTPUT**: After reading AGENTS.md, output this block:

```
[AGENTS.md Loaded]
- Forbidden actions: <count>
- Risk tiers: <defined | not defined>
- Operational limits: <defined | not defined>
- Architecture: <≤10 words>
- Local overrides: <loaded | not found>
```

**Steps**:
1. Check `AGENTS.md` in repo root → read in full
2. Check `.agents.local.md` (personal override) → read if exists
3. Output acknowledgement block above

### 1.2 Memory Sync

**MANDATORY OUTPUT**: After reading memory files, output this block:

```
[Memory Sync]
- Core Logic: Project <N> | User <N> | Feedback <N> | Reference <N>
- Last Pending goal: "<quoted>"
- Scratch status: "<summary or 'empty'>"
- Stale items: <count or 'none'>
```

**Steps**:
1. Read `docs/ANALYSIS_MEM.md` (long-term) → read in full
2. Read `docs/ANALYSIS_SCRATCH.md` (short-term) → read in full
3. First run: use `memory-templates` skill to create missing files
4. Output sync block above

### 1.3 Blank Project Detection

If ALL true:
- No `AGENTS.md`
- No source dirs (`src/`, `app/`, `application/`, `lib/`)
- Only config skeletons

Then → use `blank-project-init` skill → initialize project

## §2 Execution Rules

Orchestrate only. Delegate specialized work to subagents.

## §3 Constraints

- Forbidden Actions from AGENTS.md
- Risk Awareness from risk-tiers.json
- Operational Limits (Circuit Breaker)

## §4 Task End

### 4.1 Progressive Save (During Task)

Update `SCRATCH > Current Context` on:
- Major decision made
- Risky action suggested
- Multi-step plan confirmed
- Every ~5 substantive exchanges

### 4.2 Persist State (On Completion)

**MANDATORY**: At task completion, update memory files:

**Option A - Direct Update** (for simple tasks):
1. Append to `SCRATCH > Recent Tasks` with date, title, files changed, key decisions
2. Update `SCRATCH > Current Context` with completion status
3. Update `MEM > Pending` with last action + next goal

**Option B - Delegate to memory-keeper** (for complex tasks):
1. Summarize: changes made, decisions, lessons learned
2. Invoke memory-keeper subagent with summary
3. Memory-keeper updates both SCRATCH and MEM

**NEVER**:
- Create new `*_SUMMARY.md` or `*_COMPLETE.md` files
- Leave memory files unchanged after significant work
- Rely on conversation history as memory

### 4.3 Post-Task Check

Before ending, evaluate:
```
[Post-Task Check]
- Circuit breaker triggered: yes/no
- Critical paths touched: yes/no
- Memory updated: yes/no (SCRATCH/MEM)
- Feedback loop: <recorded | no feedback>
- Pending aligned: yes/no
```

## §5 Maintenance

- Memory limits
- Freshness check
- Feedback loop
