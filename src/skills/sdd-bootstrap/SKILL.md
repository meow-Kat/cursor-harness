---
name: sdd-bootstrap
description: Triggers when entering a blank/empty project. Guides through Spec-Driven Development interactive mode to gather requirements before implementation. Use when project has no AGENTS.md, no src/application directory, or only skeleton config files.
---

# SDD Bootstrap Skill

Guide user through requirements gathering for a new project, then delegate design to subagent.

## Trigger Conditions

Activate this skill when ANY of these are true:
- No `AGENTS.md` in repo root
- No source directories (`src/`, `app/`, `application/`, `lib/`)
- Only config files exist (`.gitignore`, `package.json`, `composer.json` skeleton)
- User explicitly asks to "start a new project" or "bootstrap"

## Phase 1: Requirements Gathering (Main Agent)

Ask these questions **in order**. Wait for answers before proceeding.

### 1.1 Core Questions (Required)

```
1. 專案類型是什麼？
   □ Web 應用  □ REST API  □ CLI 工具  □ Library/SDK  □ 其他

2. 偏好的語言/框架？
   （若無偏好，我會依專案類型建議）

3. 列出 3-5 個核心功能：
   例：用戶註冊、商品管理、訂單處理...

4. 資料儲存需求？
   □ 關聯式 DB  □ NoSQL  □ 檔案系統  □ 無需持久化
```

### 1.2 Conditional Questions

| 條件 | 追問 |
|------|------|
| Web 應用 | 前端需求？（SPA/SSR/靜態） |
| 有用戶系統 | 認證方式？（Session/JWT/OAuth） |
| API | 需要文件嗎？（OpenAPI/GraphQL schema） |
| 有外部整合 | 哪些第三方服務？ |

### 1.3 Optional (Large Projects)

```
- 預期規模/流量？
- 團隊人數？
- 有既有系統要整合嗎？
```

## Phase 2: Validation Checklist

Before delegating, verify completeness:

```
[Requirements Checklist]
- [ ] 專案類型：______
- [ ] 技術棧：______
- [ ] 核心功能（≥3）：______
- [ ] 資料儲存：______
- [ ] 部署環境：______ (optional)
```

If any required item is missing → ask follow-up, do NOT proceed.

## Phase 3: Delegate to Designer

Once requirements are complete, delegate to `sdd-designer` subagent.

## Phase 4: Review & Confirm

1. Present design output to user
2. Ask: "這個設計符合你的需求嗎？需要調整哪些部分？"
3. If changes needed: collect feedback and resume designer
4. If approved: proceed to implementation

## Scale Control

| 功能數量 | 模式 |
|----------|------|
| ≤3 | 精簡：只產 ARCHITECTURE.md + AGENTS.md |
| 4-7 | 標準：全部文件 |
| >7 | 分階段：先 MVP scope，後續迭代 |

## Memory Integration

After SDD completion:

```
SCRATCH:
- Record SDD session summary
- Note user preferences discovered

MEM > Core Logic > Project:
- Add finalized tech stack
- Add architectural decisions
```
