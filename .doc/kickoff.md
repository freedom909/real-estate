# Task Kickoff — real-estate Authorization System
【AI 利用に関する補足】

本設計書の作成にあたり、生成系 AI は設計補助（構成整理・論点抽出）の目的でのみ使用している。
設計方針・前提条件・採否判断および最終的な設計責任は、すべて設計者が担う。
AI による要件追加・仕様決定・最終判断は一切行っていない。
## Project
real-estate (Property Management Platform)

## Task
Implement a production-ready authorization system.

The system must support:
- User authentication
- Role-based authorization
- Secure API access

## Context
- Backend: Node.js (javaScript)
- Frontend: React
- Database: MySQL / MongoDB
- Deployment: Docker
- Cloud: GCP
- AI Model: Gemini

## Requirements

### Authentication
- Email + password login
- Password hashing
- JWT-based authentication
- Token expiration & refresh support

### Authorization
- Role-based access control (RBAC)
- Roles:
  - Admin
  - Agent (Real estate staff)
  - Owner
  - Customer
  - Pending_Agent (Unverified staff)
- Permission checks at API layer

### Security Constraints
- No plaintext passwords
- JWT secret must be configurable
- Proper error handling
- Prevent privilege escalation

### Non-Goals (Out of Scope)
- OAuth (Google, Apple, etc.)
- UI design polish
- Multi-factor authentication

## Completion Criteria
- Auth flow clearly documented
- Backend authorization middleware implemented
- Example protected API endpoint
- Frontend login flow example
- Security considerations documented

## Instructions to Agent System

- Follow AGENT_WORKFLOW.md strictly
- Use Planner → Architect → Implementer → Reviewer → Auditor → Archivist
- Apply Node.js preset
- Apply React preset for frontend examples
- Enforce self-critique loop
- Do not skip review or audit

## Output Expectations

- Structured design documents
- Clean, maintainable code snippets
- Clear explanation of role/permission model
- Final Auditor verdict must be PASS
——————————————————————————————————————————————————————————————————————————————————————
如果“正确扔给 AI”，Prompt 应该长这样

（这是关键差异点）

You are an assistant supporting a human system architect.

判断・前提・責任は人が持つ、という切り分けです。

Input: //这些规则必须由人来定。
- This document is a Task Kickoff, not a design.
- Do NOT add assumptions.  
- Do NOT invent requirements.
- Do NOT make final decisions.

Your task: //这些任务也必须由人来确定。
- Extract system components. 
- Propose a candidate system structure.
- List open questions and risks.
- Clearly mark any assumptions.

Output: // 这些规则必须由人来定。
- Draft-level Basic Design (NOT final) ⚠ 本设计尚未承认（未承認）
- Sections requiring human confirmation must be marked.

————————————————————————————————————————————————————————————————————
📌 AI 利用に関する宣言（レビュー突っ込み吸収用）
1. 目的と位置付け

本設計書の作成にあたり、生成系 AI（LLM）を設計補助ツールとして利用している。
ただし、AI はあくまで以下を目的として使用しており、設計上の最終判断や前提条件の決定を行うものではない。

要件・タスク記述の整理

システム構成要素の抽出および構造化

検討事項・リスク・未確定事項の洗い出し

設計方針、前提条件、採用・不採用の判断、および設計内容に対する責任は、すべて人間の設計者が担う。

2. AI に与えた制約条件

AI 利用時には、以下の制約を明示的に設定している。

本タスクは Task Kickoff 文書であり、設計書ではない

要件・前提条件の追加や補完を行わない

明示されていない仕様・要件を推測しない

最終的な設計判断・意思決定を行わない

これにより、AI が設計内容を自動生成・確定することを防止している。

3. AI の出力範囲と扱い

AI の出力は、以下の範囲に限定して利用している。

システム構成要素の候補提示

構造案（Draft レベル）の整理

未確定事項・リスク・検討ポイントの列挙

これらの出力は**あくまで草案（Draft）**であり、
本設計書に記載されている内容については、すべて設計者による確認・判断・修正を経たものである。

4. 人による確認事項の明示

AI 出力をもとに作成した設計項目については、
人による確認・承認が必要な箇所を明示的にマーキングしている。

要確認事項

設計判断待ち項目

リスク・前提条件

これにより、設計の確定範囲と未確定範囲を明確に区別している。

5. レビュー観点への配慮

本設計では、以下の点を前提としている。

AI を最終判断主体としない

セキュリティ・権限制御に関する判断はルールベースを優先する

AI 出力は再現性・説明可能性を前提に人が評価する

以上の方針に基づき、設計品質および説明責任を担保している。

🧠 レビュー現場での効果（裏話）

これがあると reviewer はこうなる：

❌「AI が決めたんですか？」→ 先回りで否定済み

❌「前提どこから来た？」→ 人が決めていると明示

❌「責任は誰？」→ 設計者と明記

つまり
👉 突っ込める場所が一気に減る

「使ったか？」→ はい、でも補助だけ

「誰が決めた？」→ 人です

「勝手に増えてない？」→ 増えてません