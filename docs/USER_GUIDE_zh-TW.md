# Harness Engineering Framework

讓 AI agent 安全、可靠地寫程式碼的工程框架。

> AI 可以寫 code，但不能自己上 production。中間那個「不能」，需要用系統架構來實現，而不是靠人的注意力。
>
> 英文版使用說明：`docs/USER_GUIDE.md`

## 這是什麼

這個 repo 是一套 **Harness Engineering 通用框架**，提供可被 fork 後直接使用的模板、規則與範例。核心理念來自 [Harness Engineering 架構全景](https://ai-coding.wiselychen.com/harness-engineering-architecture-overview-ai-code-production-guardrails/)。

Harness Engineering（駕馭工程）= 在 agent-first 開發中，建構一套控制與放大 agent 交付能力的工程體系。

**核心哲學：Humans steer. Agents execute.**

## 包含什麼

### 源碼檔案（統一）

所有 rules、agents、skills、hooks 都維護在 `src/` 目錄，編譯成 IDE 專屬格式。

| 路徑 | 用途 |
|------|------|
| `src/rules/` | 統一規則定義（編譯成 IDE 專屬格式） |
| `src/agents/` | Agent 提示詞（編譯到兩個 IDE） |
| `src/skills/` | 可重用技能／模板（編譯到兩個 IDE） |
| `src/hooks/` | 事件驅動自動化（YAML 格式，編譯成 IDE 專屬格式） |

### 專案層（放在每個 repo 裡）

| 檔案 | 用途 |
|------|------|
| `AGENTS.md` | AI agent 的工作協議（架構原則、禁止事項、風險分級、測試要求） |
| `risk-tiers.json` | 機器可讀的風險分級契約，依路徑爆炸半徑分 critical / high / medium / low |
| `docs/ANALYSIS_MEM.md` | 長期記憶：穩定的架構決策、不變量、分析日誌 |
| `docs/ANALYSIS_SCRATCH.md` | 短期記憶：當前任務上下文、工作筆記、教訓記錄 |
| `examples/php/` | PHP 架構護欄設定範例（見下方） |
| `examples/github-actions/` | CI/CD workflow 範例（見下方） |
| `tools/` | Harness 編譯器，用於生成 IDE 專屬配置 |

### Cursor 層（編譯產生）

> `.cursor/` 目錄由編譯器生成。請編輯 `src/` 中的源碼檔案。

| 檔案 | 類型 | 用途 |
|------|------|------|
| `.cursor/rules/core-protocol.mdc` | Rule（alwaysApply） | 任務生命週期：讀取 `AGENTS.md` / `.agents.local.md`、兩層記憶 Wake & Sync、委派表、操作上限、任務結尾檢查 |
| `.cursor/rules/php-guardrails.mdc` | Rule | 偵測 PHP 專案時建議設定護欄、寫程式時遵守護欄規則 |
| `.cursor/rules/ci-workflows.mdc` | Rule | 偵測 CI workflow 缺失、建議設定、workflow-aware 行為 |
| `.cursor/skills/*/SKILL.md` | Skills | 可重用模板（agents-md、memory、php-guardrails、ci-workflows、sdd-bootstrap、mcp-setup、blank-project-init） |
| `.cursor/agents/*.md` | Subagents | 專職 agents（coder、tester、reviewer、memory-keeper、observability、project-analyzer、doc-fetcher、sdd-designer） |
| `.cursor/hooks/*.sh` | Hooks | Shell 腳本，用於事件驅動自動化 |
| `.cursor/hooks.json` | Hook 配置 | Cursor 的 hook 註冊檔 |

### Kiro 層（編譯產生）

> `.kiro/` 目錄由編譯器生成。請編輯 `src/` 中的源碼檔案。

| 檔案 | 類型 | 用途 |
|------|------|------|
| `.kiro/steering/core-protocol.md` | Steering（always） | 任務生命週期（與 Cursor core-protocol 相同） |
| `.kiro/steering/php-guardrails.md` | Steering（fileMatch） | PHP 護欄感知 |
| `.kiro/steering/ci-workflows.md` | Steering（fileMatch） | CI workflow 感知 |
| `.kiro/skills/*/SKILL.md` | Skills | 與 Cursor skills 相同 |
| `.kiro/agents/*.md` | Agents | 與 Cursor agents 相同 |
| `.kiro/hooks/*.json` | Hooks | Kiro 的 JSON 宣告式 hooks |

## 架構設計

### 分工原則

```
AGENTS.md（跨工具通用）     定義 WHAT：什麼規則要遵守
Cursor rules（Cursor 專屬） 定義 HOW：怎麼讀取、怎麼執行、怎麼攔截
```

### 指令優先級（低→高）

```
~/.cursor/rules/     → 使用者全局規則（最低）
AGENTS.md            → 專案級約定（團隊共享）
.cursor/rules/       → 專案內 Cursor 規則（團隊共享）
.agents.local.md     → 個人覆寫（不進版控，最高）
```

### 每次對話的執行順序

```
① core-protocol.mdc      → 讀 AGENTS.md + .agents.local.md → 讀 MEM → 讀 SCRATCH
② 開始任務
③ 漸進式摘要 → 每 ~5 次實質操作或重大決策時更新 SCRATCH（防 crash 丟上下文）
④ 任務結束 → 寫 SCRATCH → 穩定結論升級 MEM → 更新 Pending
```

### 記憶分類（參考 Claude Code M-system）

長期記憶（`Core Logic`）分為四類，嚴格區分什麼該存、什麼不該存：

| 類型 | 存什麼 | 不存什麼 |
|------|--------|---------|
| **Project** | 無法從 code 推導的決策與約束 | code patterns、架構分析、檔案路徑 |
| **User** | 使用者偏好、習慣、技術水平 | — |
| **Feedback** | 糾正（做錯了）**和確認（做對了）** | — |
| **Reference** | 外部系統指標（URL、Issue、Slack） | 內容副本（只存指標） |

### 自動化機制

| 機制 | 觸發條件 | 行為 |
|------|---------|------|
| **Circuit Breaker** | 同一操作連續失敗 3 次 / 同一檔案編輯 5+ 次 / 範圍超過 10 個檔案 | 立即停止，回報失敗模式，請求替代方案 |
| **Progressive Summary** | 每 ~5 次實質操作 / 重大決策 / 高風險操作前 | 漸進式更新 SCRATCH，防 crash 丟上下文 |
| **Post-Task Check** | 每次任務結束後自動執行 | 5 項快速檢查，異常時自動升級為完整 observability 審計 |
| **Periodic Audit** | 每 5 個任務自動觸發 | 自動委派 observability subagent 執行完整審計 |
| **Feedback Loop** | Agent 犯錯被糾正 / 做法被確認 | 糾正記 Scratch Lessons；確認記 MEM Feedback（防過度保守） |
| **Freshness Check** | Core Logic 條目超過 30 天未驗證 | 標記 `[Stale?]`，詢問使用者是否驗證 |
| **Write Safety** | memory-keeper 每次寫入前 | 掃描敏感資訊（API key、PAT、密碼），自動 redact |
| **Memory GC** | Analysis Logs 超過 20 則 / Scratch 超過 7 則 | 自動歸檔或摘要 |

## 快速開始

### 1. Clone 並設定

```bash
git clone https://github.com/YOUR_USERNAME/harness.git my-project
cd my-project
cd tools && npm install && cd ..
```

### 2. 編譯到 IDE 格式

```bash
# 編譯到 Cursor 和 Kiro
node tools/harness-compiler.js compile --source

# 或只編譯到特定 IDE
node tools/harness-compiler.js compile --source --target=cursor
node tools/harness-compiler.js compile --source --target=kiro
```

### 3. 在 IDE 中開啟

在 Cursor 或 Kiro 中開啟專案。編譯後的配置會自動載入。

### 4. 客製化源碼檔案

```bash
# 編輯規則
src/rules/core-protocol.md

# 編輯 agents
src/agents/coder.md

# 編輯 hooks
src/hooks/check-forbidden-actions.yaml

# 編輯後重新編譯
node tools/harness-compiler.js compile --source
```

### 5. 客製化專案檔案

```bash
# 編輯專案協議
AGENTS.md

# 編輯風險分級
risk-tiers.json
```

### 6. 開始工作

在 IDE 中開始新對話。Agent 會：
1. 讀取 `AGENTS.md`
2. 讀取 `docs/ANALYSIS_MEM.md` 和 `docs/ANALYSIS_SCRATCH.md`
3. 輸出確認區塊
4. 在定義的約束內開始工作

## 編譯器工具使用

`tools/harness-compiler.js` 工具將統一源碼檔案編譯成 IDE 專屬格式。

### 指令

```bash
# 從 src/ 目錄編譯（推薦）
node tools/harness-compiler.js compile --source [--target=cursor|kiro|all]

# 驗證配置
node tools/harness-compiler.js validate --source

# 顯示幫助
node tools/harness-compiler.js help
```

### 編譯內容

| 源碼 | Cursor 輸出 | Kiro 輸出 |
|------|-------------|-----------|
| `src/rules/*.md` | `.cursor/rules/*.mdc` | `.kiro/steering/*.md` |
| `src/agents/*.md` | `.cursor/agents/*.md` | `.kiro/agents/*.md` |
| `src/skills/*/SKILL.md` | `.cursor/skills/*/SKILL.md` | `.kiro/skills/*/SKILL.md` |
| `src/hooks/*.yaml` | `.cursor/hooks/*.sh` + `hooks.json` | `.kiro/hooks/*.json` |

### 自動轉換

- **Frontmatter**：`inclusion: always` ↔ `alwaysApply: true`
- **Hooks**：YAML → shell 腳本（Cursor）或 JSON（Kiro）
- **路徑**：針對各 IDE 調整
- **元數據**：加入 IDE 專屬功能

詳細文件請見 `README_COMPILER.md`。

## PHP 架構護欄範例

`examples/php/` 提供四個工具的設定範例，對應文章的四層防禦：

| 工具 | 對應防禦層 | 用途 | 安裝 |
|------|----------|------|------|
| **Deptrac** | Layer 3: CI Gate | 分層依賴方向檢查，禁止跨層 import | `composer require --dev qossmic/deptrac-shim` |
| **PHPArkitect** | Layer 3: CI Gate | 架構規則測試（命名規範、結構約束） | `composer require --dev phparkitect/arkitect` |
| **PHPStan** | Layer 2: Type Check | 靜態類型分析（level 0-9） | `composer require --dev phpstan/phpstan` |
| **PHP_CodeSniffer** | Layer 2: Lint | PSR-12 風格檢查 + 禁止 debug 函式 | `composer require --dev squizlabs/php_codesniffer` |

### PHP 分層架構

```
Model（最底層，不依賴任何人）
  ↑
Config
  ↑
Repository
  ↑
Service
  ↑
Controller
  ↑
Infrastructure（最上層，可依賴所有人）
```

每一層只能依賴其下方的層。Deptrac 與 PHPArkitect 會在 CI 裡機械式攔截違反。

## CI/CD Workflow 範例

`examples/github-actions/` 提供三個 workflow，對應文章的三層防禦：

| Workflow | 對應層級 | 功能 |
|----------|---------|------|
| `risk-contract.yml` | L1 分級審查 + L3 Control Plane | 讀取變更路徑 → 判斷風險等級 → 依等級決定檢查強度 → 自動標籤 + 指派 reviewer |
| `php-guardrails.yml` | L2 四層防禦 | 三個 job 平行跑：Lint+Type (L2) / Architecture (L3) / Tests (L1) |
| `doc-freshness.yml` | 失效模式一對策 | 掃描過期文件 / 驗證 AGENTS.md 連結 / 驗證 risk-tiers.json 格式 |

使用方式：將需要的 workflow 複製到你的專案 `.github/workflows/` 目錄。

## Subagent 架構

框架採用 8 個專職 subagent 的分離架構，每個 agent 一個職責：

```
User 下指令
  │
  ▼
Main Agent（指揮官 / Orchestrator）
  │
  ├── project-analyzer   「這個專案長什麼樣？」      （理解）
  ├── doc-fetcher        「官方文件怎麼說？」        （外部知識）
  ├── sdd-designer       「規格／設計怎麼定？」       （SDD 產出）
  ├── coder              「把 code 寫出來」          （執行）
  ├── tester             「幫這段 code 寫測試」       （驗證 L1）
  ├── reviewer           「review 這段變更」          （品質 L4）
  ├── memory-keeper      「記錄發生了什麼」           （記憶）
  └── observability      「整體系統還健康嗎？」        （監控）
```

### Subagent 一覽

| Subagent | Model | 模式 | 對應元件 | 職責 |
|----------|-------|------|---------|------|
| `project-analyzer` | opus | readonly | — | 掃描專案結構、風險、技術債 |
| `coder` | sonnet | read-write | — | 寫 code，回傳結構化變更摘要供下游使用 |
| `tester` | codex | read-write | ③ Eval & Test | 寫測試、驗覆蓋率，獨立於 coder 避免自測偏差 |
| `reviewer` | codex | readonly | ② Guardrails + ⑤ Safety | Code review（四層防禦 Layer 4：LLM Judge） |
| `memory-keeper` | sonnet | read-write | ① Context + ⑦ Feedback | 記憶管理、Gap Loop、Freshness、GC、Audit Trail |
| `observability` | opus | readonly | ⑥ Observability | 系統健康度審計、合規性、架構漂移、Operations Health |
| `doc-fetcher` | （依編排） | readonly | — | 外部文件檢索與摘要，降低幻覺實作 |
| `sdd-designer` | （依編排） | read-write | — | SDD 後的規格書、介面與模組邊界設計 |

### 典型工作流

```
① coder 寫 code       → 產出「變更摘要」
② tester 寫測試        → 產出「測試報告」
③ reviewer 審查        → 產出「審查報告」
④ memory-keeper 記錄   → 更新 SCRATCH / MEM
⑤ observability 巡檢   → 產出「健康度報告」（定期或按需）
```

### 設計原則

- **一個 subagent 一個職責**：coder 不測試、tester 不寫 code、reviewer 不修改。
- **刻意隔離 context**：coder 和 reviewer 分開是為了降低 LLM 自審偏差（文章 Layer 4 設計理由）。
- **單一記憶寫入者**：只有 memory-keeper 寫記憶檔，避免多 agent 競爭導致記憶衝突。
- **observability 只讀**：觀察、報告、建議，但不直接修改。修復委派給對應 subagent。

### 內建防護機制

| 機制 | 適用 Subagent | 說明 |
|------|-------------|------|
| **Self-Verification Checklist** | coder, tester | 產出報告前強制自檢（程式碼品質/測試品質），失敗必須修正或揭露 |
| **Circuit Breaker** | coder, tester | 同檔 5+ 次編輯 / 連續 3 次失敗 / 超過 10 檔案 → 自動停止 |
| **Context Exhaustion Warning** | 全部 8 個 | 控制輸出精簡度，避免 ~70% context 容量後品質急降 |
| **Operations Health Audit** | observability | 審計 Operational Limits、doom loop 跡象、governance 層完備度 |
| **Audit Trail (Decision Log)** | memory-keeper | 記錄重大決策及其背景、替代方案、風險等級，可追溯 |

## 對照 Harness Engineering 七元件

| 元件 | 本框架的實現 | 狀態 |
|------|------------|------|
| ① Context System | AGENTS.md + 兩層記憶 + 知識庫 | ✅ |
| ② Architecture Guardrails | AGENTS.md 架構原則 + risk-tiers.json + PHP guardrail 範例 | ✅ |
| ③ Eval & Test Harness | AGENTS.md 測試要求 + PHPUnit CI pipeline | ✅ 基礎 |
| ④ CI/PR Automation | GitHub Actions 範例（risk-contract / php-guardrails / doc-freshness） | ✅ |
| ⑤ Safety & Policy | 禁止事項 + 風險分級 + 攔截機制 | ✅ |
| ⑥ Observability | Subagent `observability.md`（審計 harness 健康度、合規性、架構漂移、風險曝露） | ✅ |
| ⑦ Feedback Loops | Gap loop + freshness check + memory GC | ✅ |

## 參考資料

- [Harness Engineering 架構全景](https://ai-coding.wiselychen.com/harness-engineering-architecture-overview-ai-code-production-guardrails/) — Wisely Chen
- [OpenAI — Harness Engineering](https://openai.com) — 原始概念
- [Martin Fowler — Harness Engineering](https://martinfowler.com) — Thoughtworks 分析
- [AGENTS.md 開放格式](https://agents.md) — 跨工具標準

## 授權

本專案以 **GNU General Public License v3.0（GPL-3.0）** 授權開源。詳見 `LICENSE`。

