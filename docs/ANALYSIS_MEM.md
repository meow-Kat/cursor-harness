# Analysis Memory

## Core Logic

> Classified by type. See memory-keeper for what belongs in each category.
> NEVER store: code patterns, file paths, architecture analysis derivable from code, exact version numbers.

### Project (cannot be derived from code)

- `2026-04-02` **Harness Engineering 定義**：在 agent-first 軟體開發中，建構一套控制與放大 agent 交付能力的工程學。核心哲學：Humans steer. Agents execute.
- `2026-04-02` **與 Prompt Engineering 的差異**：Prompt Engineering 是對話層一次性技巧；Harness Engineering 是系統層、可版本化、可 CI 驗證的工程體系，沉澱在 repo 裡越用越好。
- `2026-04-02` **人的角色**：從 in the loop（逐行盯）轉為 on the loop（設計規則、回饋機制、監控指標）；人的槓桿 = 設計讓 agent 可靠工作的環境。
- `2026-04-02` **AI 行為傾向（clean state bias）**：AI 面對複雜修復傾向 reset → rebuild → clean state；刪資料庫與刪暫存檔認知成本相同，不理解資料的重量。
- `2026-04-02` **禁令 vs 系統**：亞馬遜依職級擋提交（方向對但 Senior 變瓶頸、切學習管道、未解根因）；Harness Engineering 用系統架構接，不靠人的注意力。
- `2026-04-02` **核心公式**：AI 生成代碼品質 ≈ 80% 測試覆蓋率 + 20% prompt 品質。
- `2026-04-02` **五大失效模式**：① Context Rot ② 架構漂移與反模式複製 ③ 測試 Flake ④ 安全外溢 ⑤ 供應鏈崩壞。

### User (preferences and habits)

- `2026-04-07` 使用者偏好繁體中文回覆。
- `2026-04-07` 使用者重視「求穩」：observability 和 memory-keeper 選用較強 model（opus / sonnet）而非 fast。

### Feedback (corrections + confirmations)

- `2026-04-07` **正向**：六個 subagent 分離架構（coder/tester/reviewer/memory-keeper/observability/project-analyzer）設計被使用者確認為正確方向。
- `2026-04-07` **正向**：Circuit Breaker 機制被使用者認可為 P0 優先級。
- `2026-04-07` **修正**：Model 配置 observability/memory-keeper 原設 fast → 使用者修正為 opus/sonnet（求穩）。

### Reference (external pointers)

- `2026-04-02` **七元件參考架構**：① Context System ② Architecture Guardrails ③ Eval & Test Harness ④ CI/PR Automation ⑤ Safety & Policy ⑥ Observability ⑦ Feedback Loops。
- `2026-04-02` **三層防禦**：L1 分級審查 → L2 四層防禦（Test / Lint+Type / CI Gate / LLM Judge）→ L3 控制平面（八步 PR 閉環）。
- `2026-04-02` **標準化推力**：AGENTS.md（OpenAI Codex，目錄式 ≤32KiB）；Linux Foundation AAIF。
- `2026-04-07` **Claude Code 六維記憶**：指令記憶 / 短期記憶 / 工作記憶 / 長期記憶（M-system）/ 摘要記憶（session_memory.md）/ 休眠重塑記憶（AutoDream）。來源：唐國梁 Tommy 頻道。

## Analysis Logs

### 2026-04-02 初始化兩層記憶

- 依 `memory-templates` 技能建立 `docs/ANALYSIS_MEM.md`（長期）與 `docs/ANALYSIS_SCRATCH.md`（短期）。

### 2026-04-02 內化 Harness Engineering 架構全景文章

- 來源：[Harness Engineering 架構全景](https://ai-coding.wiselychen.com/harness-engineering-architecture-overview-ai-code-production-guardrails/)，作者 Wisely Chen，2026-03。
- **七元件**完整記錄：Context System（AGENTS.md 當目錄指向 docs/）、Architecture Guardrails（lint error 帶修復指引，乘數效應）、Eval & Test（傳統測試 + LLM eval 資產化）、CI/PR Automation（短 PR、最小 gate）、Safety & Policy（sandbox fail-closed、OPA/Policy-as-Code）、Observability（OTel + 給 agent 當動態上下文）、Feedback Loops（失敗即訊號、GC 制度化）。
- **三層防禦**：L1 Risk Tiering（risk-contract.json 依路徑分 critical/high/medium/low）→ L2 Four-Layer（Test→Lint→CI Gate→LLM Judge）→ L3 Control Plane 八步（Risk Contract→Preflight→SHA Discipline→Rerun Dedupe→Remediation Loop→Bot Resolve→Browser Evidence→Harness Gap Loop）。
- **落地工具矩陣**：JS/TS dependency-cruiser / Nx enforce-module-boundaries；Python import-linter；Java ArchUnit；Eval: promptfoo / SWE-bench / OpenAI Evals；可觀測: OTel / Langfuse / Arize Phoenix。
- **導入路線圖**：小型 4-6 月 / 中型 6-9 月 / 企業 9-12 月；12 個月里程碑從基線→知識庫→護欄 v1→Eval v1→Observability v1→GC→平台化。
- **作者坦白**：分級審查 ROI 最高（一份 JSON）；前三層確定性防禦是必須；完整控制平面對小團隊可能過重；Remediation Loop 需 circuit breaker；LLM 審 LLM 有系統性偏差風險。

### 2026-04-02 建立 AGENTS.md 系統（Rule + Skill）

- 決定 AGENTS.md 與 Cursor rules 的分工原則：AGENTS.md 定義「規則是什麼」（跨工具通用），Cursor rules 定義「怎麼執行」（Cursor 專屬行為）。
- 建立 `~/.cursor/skills/agents-md-template/SKILL.md`：通用 AGENTS.md 模板，含架構原則、禁止事項、風險分級、測試要求、程式碼風格、知識庫指向，以及 risk-tiers.json 範例。
- 建立 `~/.cursor/rules/agents-md-protocol.mdc`（alwaysApply）：強制每次任務先讀 AGENTS.md → 不存在則呼叫 skill 建檔 → 執行禁止事項攔截 → 風險路徑感知 → 衝突解決（AGENTS.md 優先於 Cursor rule）。
- 執行順序確認：AGENTS.md → MEM → SCRATCH（專案約定先於工作記憶）。

### 2026-04-02 三項優化：串接順序 + Freshness + Gap Loop

- `analysis-memory-protocol.mdc` Wake & Sync 加入執行順序說明：AGENTS.md → MEM → SCRATCH，並在 proof-of-read 格式加入 `Stale items` 欄位。
- 新增 §4.1 Freshness Check：Core Logic 條目超過 30 天未驗證 → 標記 `[Stale?]` → 詢問使用者是否驗證 → 更新或移除。
- 新增 §2.1 Gap Loop：agent 犯錯被糾正時 → 記錄 Scratch `Lessons / Pitfalls` → 評估是否升級至 AGENTS.md 或 Core Logic。
- `memory-templates/SKILL.md` Scratch 模板新增 `## Lessons / Pitfalls (Gap Loop)` 區塊。

### 2026-04-02 建立 AGENTS.md + risk-tiers.json 實體檔

- 在 repo 根目錄建立 `AGENTS.md`（填好的範例，非空模板），涵蓋架構原則、7 條禁止事項、風險分級指向、測試要求、程式碼風格、知識庫連結。
- 建立 `risk-tiers.json`（v1.0），含 critical / high / medium / low 四級，每級附 paths 與 guidance。
- `.github/workflows/` 與 `.cursor/rules/` 被歸為 critical / high 路徑。

### 2026-04-02 建立 README.md

- 建立框架 README，涵蓋：定義、包含什麼（專案層 + Cursor 層）、架構設計（分工、執行順序、三個自動化機制）、快速開始（fork→安裝→客製化）、七元件對照表、參考資料。

### 2026-04-02 建立 PHP 架構護欄範例

- 建立 `examples/php/` 目錄，含四個工具設定範例。
- `deptrac.yaml`：分層依賴方向（Model→Config→Repository→Service→Controller→Infrastructure），每層只能往下依賴。
- `phparkitect.php`：架構測試（命名規範 + 禁止反向依賴），用可執行 PHP 表達規則。
- `phpstan.neon`：靜態分析 level 6，掃描 src/ 與 app/。
- `phpcs.xml`：PSR-12 + 禁止 debug 函式（var_dump/dd/dump/die/exit）+ 複雜度限制。
- 更新 AGENTS.md 加入 PHP 分層原則與 examples/php/ 指向；更新 README 加入工具矩陣與分層圖。

### 2026-04-02 建立 PHP Guardrails Skill + Rule

- 建立 `~/.cursor/skills/php-guardrails-template/SKILL.md`：agent 可呼叫產生 deptrac.yaml / phparkitect.php / phpstan.neon / phpcs.xml 到專案根目錄，含客製化問題引導、安裝指令、post-generation checklist、Recovery。
- 建立 `~/.cursor/rules/php-guardrails-protocol.mdc`（globs: `**/*.php`）：偵測 PHP 專案 → 檢查護欄是否存在 → 缺少則建議設定 → 存在則遵守規則寫程式。
- 釐清 examples/ vs skill 的定位：examples/ 是給人看的參考文件；skill 是 agent 實際使用的行動模板。兩者並存。

### 2026-04-02 建立 CI workflow 範例

- 建立 `examples/github-actions/` 目錄，含三個 workflow。
- `risk-contract.yml`：讀變更路徑 → 判風險等級 → 決定檢查強度 → 自動標籤 + 指派 reviewer。對應 L1 分級審查 + L3 Control Plane Step 1-2。
- `php-guardrails.yml`：三個 job 平行跑（Lint+Type / Architecture / Tests），對應 L2 四層防禦，PHP 專案可直接使用。
- `doc-freshness.yml`：掃描過期文件（>90 天）/ 驗證 AGENTS.md 連結 / 驗證 risk-tiers.json 格式。對應失效模式一 Context Rot 的對策。含每週一自動排程。
- 更新 README 加入 CI workflow 矩陣，七元件對照表 ③④ 改為 ✅。

### 2026-04-02 建立 CI Workflows Skill + Rule

- 建立 `~/.cursor/skills/ci-workflows-template/SKILL.md`：三個 workflow 模板（risk-contract / php-guardrails / doc-freshness），含客製化問題、post-generation checklist、Recovery。
- 建立 `~/.cursor/rules/ci-workflows-protocol.mdc`（globs: `**/.github/`**）：偵測 .github/ → 檢查 workflow 是否存在 → 缺少則建議設定 → 存在則 workflow-aware 行為。
- 至此四套 Rule+Skill 系統完成：專案約定 / 記憶 / PHP 護欄 / CI Workflows。

### 2026-04-02 建立 Observability Subagent

- 建立 `~/.cursor/agents/observability.md`：唯讀 subagent，使用 fast model，負責 Harness 系統健康度審計。
- 審計五大面向：① Harness 盤點（AGENTS.md / risk-tiers.json / 記憶 / CI / PHP 護欄） ② 記憶健康度（Stale 條目 / 歸檔需求 / Scratch 清理） ③ AGENTS.md 合規性（禁止事項掃描） ④ PHP 架構漂移（分層違規 / 禁止函式） ⑤ 風險曝露（近期 commit vs risk-tiers）。
- 產出結構化報告（六區塊）：健康度總覽表 → 記憶健康度 → 合規性發現 → 架構漂移 → 風險曝露 → 建議行動 Top 3。
- 更新 README：七元件 ⑥ Observability 狀態改為 ✅，新增 Subagent 說明段落，Cursor 層表格加入 subagent 列。
- **七元件全部完成（①②③④⑤⑥⑦ 全 ✅）**。

### 2026-04-02 建立完整 Subagent 架構（6 個專職 agent）

- 從「main agent 做所有事」重構為「6 個 subagent 分離架構」：project-analyzer（已有）/ coder / tester / reviewer / memory-keeper / observability（refocused）。
- 設計原則：一個 subagent 一個職責；coder 與 reviewer 刻意隔離 context（降低 LLM 自審偏差）；memory-keeper 是唯一記憶寫入者。
- `coder.md`：read-write，讀 AGENTS.md 邊界，專注寫 code，產出結構化變更摘要。
- `tester.md`：read-write，獨立於 coder，寫測試 + 驗覆蓋率，對應四層防禦 Layer 1。
- `reviewer.md`：readonly fast，Code Review / LLM Judge，對應四層防禦 Layer 4，產出審查報告。
- `memory-keeper.md`：read-write，唯一記憶寫入者，負責 SCRATCH/MEM 更新 + Gap Loop + Freshness + GC。
- `observability.md`：refocused — 移除記憶管理職責，新增 Phase 6 Subagent 生態檢查，聚焦系統級審計。
- 更新 README：新增「Subagent 架構」段落含流程圖、一覽表、設計原則。

### 2026-04-02 P0 優化：Circuit Breaker / Doom Loop Detection

- AGENTS.md 新增 `## Operational Limits`：step budget 30 / consecutive errors 3 / repeated edits 5 / scope creep 10 files。
- coder.md 新增 `## Loop Awareness (Circuit Breaker)`：file edit count / consecutive errors / scope creep / stuck detection，含 `Circuit Breaker Triggered` 回報格式。
- tester.md 新增同樣的 Loop Awareness 區塊：test rewrite count / consecutive failures / scope creep。
- agents-md-protocol.mdc 新增 `§4. Operational Limits Enforcement`：main agent 層級的 step budget 追蹤、consecutive error 偵測、doom loop 攔截、scope 確認。載入確認格式加入 `Operational limits` 欄位。
- 來源：[harness-engineering.ai governance](https://harness-engineering.ai/blog/harness-engineering-governing-ai-agents-through-architectural-rigor/)、[LangChain deepagents](https://blog.langchain.dev/improving-deep-agents-with-harness-engineering/)。

### 2026-04-02 全自動 Post-Task Observability 機制

- `analysis-memory-protocol.mdc` 新增 `§4. Post-Task Observability (Auto)`，三層遞進：
  - §4.1 Quick Check：每次任務結束自動跑 5 項內聯檢查（circuit breaker / risk paths / memory limits / gap loop / pending），零額外 subagent 呼叫。
  - §4.2 Auto-Escalation：觸發條件時自動委派 observability subagent 全量審計（circuit breaker 觸發 / critical path 修改 / 雙記憶接近上限 / 重大 Gap Loop）。
  - §4.3 Periodic Full Audit：每 5 個任務自動觸發完整審計，SCRATCH 底部追蹤 `<!-- Last full audit: task #N -->`。
- 更新 README 自動化機制表，新增 Post-Task Check + Periodic Audit 兩列。

### 2026-04-02 P1-P2-P3 優化：Self-Verification + Model 指定 + Context Warning + Operations Layer + Audit Trail

- **P1a**: coder.md + tester.md 新增 `Self-Verification` 區塊，產出前強制自檢（6 項 checklist），失敗須修正或揭露。
- **P1b**: 所有 subagent model 統一明確指定。~~observability + memory-keeper 改為 `fast`（結構化低推理任務）~~ → `2026-04-02` 修正：observability 改為 **opus（求穩）**、memory-keeper 改為 **sonnet（求穩）**；project-analyzer 保持 opus；coder 保持 sonnet；tester + reviewer 保持 codex。
- **P2a**: observability.md 新增 Phase 6 → Phase 7（原 Phase 6 Subagent 升為 Phase 7），新增 `Phase 6: Operations Health`：Operational Limits 定義檢查、doom loop 跡象、Circuit Breaker 觸發記錄、governance 成熟度評估。Output Format 加入 `Operations Health` 區塊。
- **P2b**: 全部 6 個 subagent Core Principles 加入 `Context-lean` 原則：控制輸出精簡度，避免 ~70% context 容量後品質急降。
- **P3**: memory-keeper.md 新增 `Task 5: Audit Trail (Decision Log)`：記錄重大決策（架構選擇、風險接受、AGENTS.md 更新、Gap Loop 升級）含 context/alternatives/risk。>15 條自動歸檔。Output Format 加入 `Audit Trail` 區塊。
- 更新 README：Subagent 一覽表加 Model 欄、新增「內建防護機制」表格。

### 2026-04-07 記憶體系重構（參考 Claude Code 六維記憶）

- **P0a**: MEM Core Logic 從單一列表重構為四類分類：Project / User / Feedback / Reference。將既有條目重新歸類。
- **P0b**: memory-keeper 新增 `What NOT to Store`（禁存 code patterns、檔案路徑、架構分析、版本號）+ `Write Safety`（寫入前掃描敏感資訊，自動 redact）。
- **P0c**: Gap Loop 擴充為 Feedback Loop：除記錄「做錯了」，新增「做對了」的正向記錄，寫入 `Core Logic > Feedback`，防止 agent 過度保守。同步更新 memory-keeper + analysis-memory-protocol。
- **P0d**: memory-templates skill 的 MEM 模板更新為四類結構，含禁止儲存說明。
- **P1**: analysis-memory-protocol 新增 §3.0 Progressive Session Summary：漸進式維護 SCRATCH Current Context，每 ~5 次實質操作或重大決策時更新，防 crash 丟上下文（參考 Claude Code session_memory.md）。
- **P2**: AGENTS.md 新增 `Instruction Priority` 段落，定義四層優先級（user-global → AGENTS.md → repo rules → .agents.local.md）。agents-md-protocol 同步支援 `.agents.local.md` 載入與衝突解決。

### 2026-04-09 Framework-Aware Memory Init

- memory-templates skill 新增 Framework Detection：init 記憶後自動掃描專案框架，生成 `.cursor/rules/project-framework.mdc`。
- 內建 4 框架慣例模板（PHP/Laravel、JS/TS+Next.js/React、Python+Django/FastAPI、Go）+ unknown 骨架。
- 取代為每個框架建獨立 skill/agent 的做法，一個偵測機制 + 一個 rule 檔案搞定。
- analysis-memory-protocol、AGENTS.md、php-guardrails-protocol 同步更新。

## Pending

- **Last action**: Framework-Aware Memory Init 完成。memory-templates skill 現在會自動偵測框架並生成 project-framework.mdc。
- **Next goal**: 在實際專案測試 Framework Detection 流程；或擴充更多框架模板（Rust、Ruby/Rails）。

