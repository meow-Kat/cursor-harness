# Analysis Scratch (Short-term)

## Current Context

- Task: 記憶體系重構（參考 Claude Code 六維記憶）
- Scope: ANALYSIS_MEM 結構 / memory-keeper / analysis-memory-protocol / memory-templates skill / AGENTS.md / agents-md-protocol / README
- Status: 完成（P0-P2）
- Key decisions: Core Logic 四類分類 / 正向 Feedback 機制 / 漸進式摘要 / 指令優先級階層 / .agents.local.md 支援 / Write Safety

## Working Notes

### 文章結構地圖（快速索引用）

1. **問題**：AI clean state bias → reset/rebuild/clean state（三起事故）
2. **兩條路**：禁令（職級擋）vs Harness Engineering（系統接）
3. **定義**：agent-first 開發的控制+放大工程學；Prompt Eng 是對話層，Harness Eng 是系統層
4. **人的角色**：in the loop → on the loop
5. **七元件**：Context / Guardrails / Eval&Test / CI-PR / Safety / Observability / Feedback
6. **三層防禦**：
  - L1 Risk Tiering：依路徑爆炸半徑 → risk-contract.json
  - L2 Four-Layer：Test → Lint+Type → CI Gate → LLM Judge（前三確定性）
  - L3 Control Plane 八步：Risk Contract → Preflight → SHA → Dedupe → Remediation → Bot Resolve → Browser Evidence → Harness Gap
7. **五大失效**：Context Rot / 架構漂移 / Flake / 安全外溢 / 供應鏈
8. **工具矩陣**：dependency-cruiser, import-linter, ArchUnit, promptfoo, SWE-bench, OTel, Langfuse
9. **路線圖**：小型 4-6m / 中型 6-9m / 企業 9-12m；12 月里程碑
10. **明天就能做的三件事**：① risk-tiers.json ② CI 高風險路徑攔截 ③ 每事故一 test case

### 關鍵引述備忘

- "AI 可以寫 code，但不能自己上 production。中間那個『不能』，需要用系統架構來實現。"
- "AI 生成代碼品質 ≈ 80% 測試覆蓋率 + 20% prompt"
- "lint error message 裡直接嵌入修復指令 → 一條規則寫一次，乘數效應"
- "八步裡 7 步確定性，只有 Remediation Loop 有 LLM"
- OpenAI：巨型 AGENTS.md 失敗 → 改目錄式（~100 行）指向 docs/
- OpenAI：每週五 20% 清 AI slop 不可擴展 → 改 golden principles + 背景 GC 任務

### 作者不確定區（值得追蹤）

- 完整控制平面對 2-3 人 startup 是否過度工程
- Remediation Loop 收斂性（無 max retry / circuit breaker）
- LLM 審 LLM 系統性偏差（同模型家族）
- 12 月路線圖 = 理想值；多數團隊光穩定 CI 就 2-3 月

## Lessons / Pitfalls (Feedback Loop)







## Decision Log (keep last 15, then archive to MEM)





## Recent Tasks (keep last 7)

### 2026-04-02 框架基礎建立（合併：文章內化 → 護欄 → CI → Observability）

- 內化文章 → Core Logic 10 條；建 4 套 Rule+Skill；建 `examples/php/` + `examples/github-actions/`
- 建 observability subagent；七元件全部 ✅

### 2026-04-02 建立完整 Subagent 分離架構

- 新建 4 個 subagent：coder（寫 code）/ tester（寫測試 L1）/ reviewer（LLM Judge L4）/ memory-keeper（記憶管理）
- Refocus observability：移除記憶管理，新增 Phase 6 Subagent 生態檢查
- 設計原則：一 agent 一職責、coder/reviewer 隔離 context、memory-keeper 唯一寫入者
- 更新 README：新增 Subagent 架構段落（流程圖 + 一覽表 + 設計原則）

### 2026-04-02 P1+P2+P3 優化

- P1a: coder + tester 新增 Self-Verification Checklist（6 項自檢）
- P1b: 統一指定 model（observability → opus；memory-keeper → sonnet）
- P2a: observability 新增 Phase 6 Operations Health（Operational Limits / doom loop / governance）
- P2b: 全 6 subagent 加入 Context-lean 原則
- P3: memory-keeper 新增 Task 5 Audit Trail（Decision Log，含 context/alternatives/risk）
- 更新 README（Model 欄 + 內建防護機制表）

### 2026-04-07 記憶體系重構（參考 Claude Code 六維記憶）

- P0: MEM Core Logic 拆為 4 類（Project/User/Feedback/Reference）+ 禁止儲存規則 + Write Safety
- P0: Feedback Loop 擴充正向記錄（防 agent 過度保守）
- P0: memory-templates skill 更新為四類結構
- P1: analysis-memory-protocol 新增漸進式會話摘要（§3.0 Progressive Session Summary）
- P2: AGENTS.md 新增指令優先級階層 + .agents.local.md 支援；agents-md-protocol 同步

