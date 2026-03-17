---
name: nocobase-commit-message
description: 生成符合 NocoBase 仓库检查链的 Conventional Commits 提交信息。用户要求生成 git commit message 提交文案，或提到 commitlint ghooks husky lint-staged Conventional Commits type scope subject body 规则时使用；即使用户只给出 diff 摘要 暂存改动或改动说明，也要用本 skill 直接产出可提交文案。
---

# NocoBase Commit Message

按以下步骤生成提交信息。

## 1) 对齐仓库检查链

先按仓库真实检查链约束输出：

1. `commit-msg` 钩子执行 `commitlint --edit`，提交信息必须符合 Conventional Commits。
2. `pre-commit` 执行 `lint-staged` 与 `addLicense`，必要时在 body 提示关键代码质量改动（如 eslint 自动修复）。
3. 规则来源以 `references/repo-checks.md` 为准。
4. 当前仓库的 `commitlint` 仅扩展 `@commitlint/config-conventional`，不要凭空追加仓库里不存在的硬限制。

## 2) 提取改动点

1. 优先读取已暂存改动的核心行为
2. 若用户已明确给出改动摘要，以用户输入为准，不重复发明需求
3. 统计改动点数量
4. 判断是否涉及规则变化 迁移 风险或测试补充

推荐最小命令：

```powershell
git diff --cached --name-only
git diff --cached --stat
git diff --cached
git diff --name-only
git diff --stat
git diff
```

优先基于已暂存改动（`--cached`）生成提交信息。

## 3) 选择 type

仅允许以下 type：

- `feat`
- `fix`
- `docs`
- `style`
- `refactor`
- `perf`
- `test`
- `build`
- `ci`
- `chore`
- `revert`

禁止使用 `release` 作为 `type`。

若本次是版本发布 发布流程或发布脚本相关改动，不要发明 `release` type，优先在 `chore` `ci` `build` 中选择最贴切者。

## 4) 选择 scope

优先按真实改动范围选择 scope：

- 单个插件或包：用包名或子系统，如 `plugin-k3cloud` `plugin-file-kkfileview-office` `client` `versions`
- 多个文件属于同一子域：用共享模块名
- 改动跨域且难以收敛：可以省略 scope
- 不要为了凑格式臆造 scope

## 5) 生成标题行

使用以下两种格式之一：

- `<type>(<scope>): <subject>`
- `<type>: <subject>`

约束：

- `subject` 默认使用中文祈使句
- 若用户明确要求英文，或当前改动明显需要沿用仓库既有英文表达，可用简短英文短语
- 描述具体行为
- 不写冗长完整句子
- 专有名词可用英文
- 若上下文已给出 issue / pr 号，可保留 `(#1234)` 这类引用
- 非必要不要主动加入 emoji
- 不以句号结尾

## 6) 生成 body

当改动点 `>= 2`，或涉及规则变化 迁移 风险 测试说明时，优先追加 body：

- 每行以 `- ` 开头
- 一行一个改动
- 默认与标题同语言
- 保持纯文本与简洁

可选增强：

- 若改动触发质量链（如 eslint fix prettier）可在 body 增加对应条目。
- 若仅文档或注释调整，优先 `docs` 或 `chore`，避免误用 `feat` `fix`。

## 7) 严格输出

1. 只输出提交信息本体
2. 不输出解释 不输出补充
3. 不输出示例
4. 不加代码块
5. 确保内容可直接用于 `git commit`

## 参考

- 规则详情见 `references/rules.md`
- 仓库检查链见 `references/repo-checks.md`
