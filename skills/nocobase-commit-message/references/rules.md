# NocoBase Commit Rules

## 仓库检查链

- `commit-msg`: `commitlint --edit`
- `pre-commit`: `yarn lint-staged && node ./scripts/addLicense.js`
- `commitlint`: `@commitlint/config-conventional`

## 输出要求

- 只输出一条提交信息
- 不解释 不补充 不示例
- 可直接用于 `git commit`

## 强制规则

- 严禁输出 `type` 为 `release`
- `release` `publish` 版本号等词可以出现在 `scope` `subject` `body` 中 只要它们真实描述本次改动
- 只能使用合法 `type`

## `@commitlint/config-conventional` 默认规则

- `type-enum`：仅允许 `build`、`chore`、`ci`、`docs`、`feat`、`fix`、`perf`、`refactor`、`revert`、`style`、`test`
- `type-case`：`lower-case`；`type-empty`：`never`（`type` 必须全小写且非空）
- `subject-empty`：`never`；`subject-full-stop`：`never`（禁止以 `.` 结尾）
- `subject-case`：禁用 `sentence-case`、`start-case`、`pascal-case`、`upper-case`（英文 `subject` 须首字母小写）
- `header-max-length`：100 字符
- `body-leading-blank`：warning（标题行与 body 间需保留 1 个空行）；`body-max-line-length`：100 字符
- `footer-leading-blank`：warning（footer 与上方内容间需保留 1 个空行）；`footer-max-line-length`：100 字符

## 格式

- `<type>(<scope>): <subject>`
- `<type>: <subject>`

## 合法 type

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

## scope

- 单个插件 包或模块优先使用对应 scope
- 若改动跨多个子域且无法准确收敛 可以省略 scope
- 不要臆造仓库里不存在的 scope

## 语言

- 默认使用中文祈使句
- 若用户明确要求英文 或当前改动明显应沿用英文表达 可输出简短英文 subject
- 可保留已有 issue / pr 引用 如 `(#8835)`

## subject

- 标题行总长不超过 100 字符
- 默认使用中文祈使句
- 英文 `subject` 首字母必须小写（遵守 `subject-case` 规则）
- 描述具体行为
- 不写冗长完整句子
- 专有名词可用英文
- 不以句号结尾
- 非必要不要主动加入 emoji

## body 规则

当改动点 `>= 2` 或涉及规则变化 迁移 风险 测试说明时 优先考虑追加 body：

- header 与 body 之间保留 1 个空行（若有 footer，同样与上方内容保留 1 个空行）
- body 与 footer 每行不超过 100 字符
- 每行以 `- ` 开头
- 一行一个改动
- 默认与标题同语言
- 保持纯文本与简洁

## lint-staged 相关提示

- `*.ts?(x)` 会执行 `eslint --fix --cache`
- `*.{js,json}` 会执行 `prettier --write`
- 若本次改动主要是自动修复，可在 body 标明 `eslint` 或 `prettier` 处理内容
