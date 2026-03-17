# NocoBase Repo Checks (Extracted)

来源项目：

- `nocobase` 仓库根目录（通用）

## commitlint

文件：`commitlint.config.js`

```js
module.exports = { extends: ['@commitlint/config-conventional'] };
```

结论：

- 提交标题必须符合 Conventional Commits。
- `type(scope): subject` 与 `type: subject` 都可用。
- 当前仓库没有自定义 `scope` 枚举 `subject` 语言 或 “必须带 body” 的 commitlint 规则。
- 不要因为仓库里存在 `release` 相关脚本或提交 就误判单词 `release` 本身非法；真正非法的是把 `release` 当成 `type`。

## hooks

文件：`package.json > config.ghooks`

```json
{
  "pre-commit": "yarn lint-staged && node ./scripts/addLicense.js",
  "commit-msg": "commitlint --edit"
}
```

结论：

- 生成提交信息时必须以 `commit-msg` 可通过为前提。
- 变更说明可适度体现 pre-commit 质量修复动作。

## lint-staged

文件：`package.json > lint-staged`

```json
{
  "*.{js,json}": ["prettier --write"],
  "*.ts?(x)": ["eslint --fix --cache --cache-location node_modules/.cache/eslint/"]
}
```

结论：

- TS/TSX 改动通常会伴随 eslint 自动修复。
- JS/JSON 改动通常会伴随 prettier 格式化。

## 历史样式观察

- 当前仓库同时存在中文与英文 subject
- 同时存在带 scope 与不带 scope 的提交
- 提交标题中可出现 issue / pr 引用 如 `(#1234)`
- 版本发布与发布流程相关改动会在 subject 或 scope 中出现 `publish` `release` 或版本号

## 通用定位命令

以下命令用于在任意仓库快速定位提交检查链：

```powershell
# 1) commitlint 配置
Get-ChildItem -File -Name commitlint.config.js,commitlint.config.cjs,.commitlintrc,.commitlintrc.js,.commitlintrc.cjs -ErrorAction SilentlyContinue

# 2) hooks 配置（ghooks/husky）
if (Test-Path package.json) { Get-Content package.json }
Get-ChildItem -Force .husky -ErrorAction SilentlyContinue

# 3) lint-staged 配置
if (Test-Path package.json) { Get-Content package.json | Select-String -Pattern 'lint-staged' -Context 0,20 }
Get-ChildItem -File -Name .lintstagedrc,.lintstagedrc.js,.lintstagedrc.cjs -ErrorAction SilentlyContinue
```
