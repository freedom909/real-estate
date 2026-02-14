你是日本企业级业务系统的系统架构师，
负责设计「RBAC 权限模型」。

【绝对约束】
- 你不得新增任何角色、权限、动作
- 所有内容只能来自我提供的信息
- 若信息不足，必须显式标记「未定义」
- output must be in Japanese

【业务前提】
- 系统类型：ERP 联动业务系统
- 权限判断责任：系统侧（非人工判断）
- 审计要求：所有拒绝/允许必须可追溯

【我将提供】
1. 业务角色列表
2. 每个角色的职责描述（自然语言）
3. 业务操作清单（画面 / API / 批处理）

【你的任务】
1. 将角色 → 职责 → 可执行权限 进行结构化
2. 输出「权限边界表（草案）」

【输出格式（必须）】
- Role
- Responsibility
- Allowed Actions（仅当可100%确定）
- Forbidden Actions（明确禁止）
- Undefined / Need Decision
__________________________________________________________________
你是企业级 ERP 联动系统的系统架构助手。

【输入契约（极其重要）】
- 以下内容是「唯一的权限事实来源」
- 你不得基于常识、行业经验或推测补充任何权限
- 你不得合并、继承、推断角色之间的关系
- 若信息不足，必须明确标记为「Undefined / Need Decision」

【禁止事项】
- 禁止新增 Role
- 禁止新增 Action
- 禁止将 Allowed 之外的行为默认为可执行
- 禁止将 Undefined 视为 Allowed

【任务】
1. 将输入内容结构化为「RBAC 权限边界表（草案）」
2. 所有判断必须能追溯到输入文本
3. 明确区分：
   - Allowed（明确允许）
   - Forbidden（明确禁止 / MUST NOT）
   - Undefined（文档未定义）

【输出格式（严格遵守）】
表名：Permission Boundary Table (Draft)

字段：
- Role
- Responsibility
- Allowed Actions
- Forbidden Actions
- Undefined / Need Decision

【重要】
- 若某一 Role 的某一 Action 未在输入中明确出现，则不得出现在 Allowed 中
- Forbidden 仅限输入中出现明确禁止或责任排他性的情况
_________________________________________________________________________________________
承知いたしました。提供された「唯一の権限事実来源」である d:\real-estate\.doc\Architect.md に基づき、RBAC 権限境界表（草案）を作成します。

作成方針:

事実の厳守: Architect.md に記述されている内容のみを抽出します。
推測の排除: 一般的な常識（例：「エージェントは物件を検索できるはず」）であっても、文書に明記がない限り「Allowed」には含めません。
未定義の明示: 文書間で整合性が取れていない、または記述が欠落している部分は「Undefined / Need Decision」として可視化します。
Permission Boundary Table (Draft)
Role	Responsibility	Allowed Actions	Forbidden Actions	Undefined / Need Decision
Admin	System Administrator(システム管理者)	・Full access to all resources・User management	(入力に明示的な禁止事項なし)	・監査ログの削除権限・システム設定(Config)の変更権限
Agent	Verified Real Estate Agent(認証済み不動産エージェント)	・Management of listings・Management of contracts・Management of transactions	(入力に明示的な禁止事項なし)	・User management (Adminのみか？)・Viewing of offers (Ownerのみか？)・自身のプロフィール更新
Owner	Property Owner(物件所有者)	・Management of owned properties・Viewing of offers	(入力に明示的な禁止事項なし)	・オファーへの応答（承諾/拒否）・Listings/Contractsの参照権限・自身のプロフィール更新
Customer	End User (Default)(エンドユーザー)	・Read-only access to public listings・Write access to own profile	(入力に明示的な禁止事項なし)	・オファーの作成 (Create Offer)・エージェントへの問い合わせ
Pending_Agent	Unverified Staff(未検証スタッフ)	・Access specific onboarding endpoints (Document Upload, Status Check)・Read their own user profile	・Business-critical write operations (Listings, Contracts)	・Read-only access to public listings (Customer権限を継承するか？)・Write access to own profile (Customerは可だが、こちらはReadのみ明記)
補足：入力文書に基づく判断根拠
Pending_Agent の制約:

Architect.md にて "MUST NOT access business-critical write operations" と明記されているため、これを Forbidden に設定しました。
"Restricted access limited to onboarding" (オンボーディングに限定された制限付きアクセス) と記述がある一方で、デフォルトロールである Customer が持つ "Read-only access to public listings" を継承するかどうかが明記されていないため、Undefined としました。

Customer の権限:
"Existing users ... default to the Customer role" とあるため、このロールの権限がベースラインとなりますが、他ロール（特に Pending_Agent）がこれを継承するかどうかは Architect.md に明記されていません。
オファー機能の未定義:

Owner に "Viewing of offers" が許可されていますが、誰が "Make Offer" (オファー作成) を行うのか記述がありません（通常は Customer ですが、推測禁止ルールにより Undefined としています）。
_______________________________________ ________________________________________________________________

本権限境界表において「Undefined / Need Decision」と
明示された操作は、業務判断が確定するまで
いかなる実装・API・UI においても
Allowed として扱ってはならない。
