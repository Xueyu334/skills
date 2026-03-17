# skills

面向工程研发的 AI Skill 仓库，当前聚焦 NocoBase 场景，覆盖提交信息生成、插件开发、工作流扩展与研发流程沉淀。

## 仓库定位

这个仓库的目标不是堆积零散 prompt，而是把可复用的工程经验整理成可执行的 skill。当前内容以 NocoBase 研发链路为核心，强调以下特点：

- 基于真实仓库结构、真实检查链和真实插件模式工作，而不是凭空发明规则。
- 将复杂任务拆成 `SKILL.md`、参考资料、模板和 agent 元数据，方便按需加载。
- 优先解决可直接落地的研发问题，例如 commit message 生成、插件开发、工作流节点扩展和排障。

## 当前收录

| Skill | 作用 | 主要内容 |
| --- | --- | --- |
| `nocobase-commit-message` | 生成符合 NocoBase 仓库检查链的 Conventional Commits 提交信息 | 基于暂存改动或改动摘要生成可直接提交的 commit message，约束 `type`、`scope`、`subject`、`body`，并对齐 `commitlint`、`lint-staged` 等检查链 |
| `nocobase-plugin-dev` | 设计、开发、重构、调试 NocoBase 插件 | 覆盖 server / client / fullstack 插件、collections、resource、ACL、route、request、i18n、logger、测试、构建，以及 `plugin-workflow` 的 trigger / instruction 扩展 |

## 目录结构

```text
.
├─ README.md
└─ skills
   ├─ nocobase-commit-message
   │  ├─ SKILL.md
   │  ├─ agents/
   │  │  └─ openai.yaml
   │  └─ references/
   │     ├─ repo-checks.md
   │     └─ rules.md
   └─ nocobase-plugin-dev
      ├─ SKILL.md
      ├─ agents/
      │  └─ openai.yaml
      ├─ references/
      │  ├─ acl.md
      │  ├─ client-plugin.md
      │  ├─ collections.md
      │  ├─ plugin.md
      │  ├─ workflow-trigger.md
      │  ├─ workflow-node.md
      │  └─ ...
      └─ templates/
         └─ workflow-node/
            ├─ client/
            └─ server/
```

## Skill 组成约定

每个 skill 目录都围绕同一套结构组织：

- `SKILL.md`：skill 的主入口，包含名称、触发描述、工作流程、边界、输出要求和执行顺序。
- `references/`：与 skill 强相关的补充资料，按主题拆分，避免把大量背景知识塞进主说明。
- `templates/`：可直接复用的代码模板或骨架。当前主要用于 `plugin-workflow` 节点扩展。
- `agents/openai.yaml`：面向 agent 的展示名称、简短描述和默认提示词配置。

## 现有 Skill 说明

### `nocobase-commit-message`

适用于需要生成 NocoBase 风格提交信息的场景，重点是“可直接提交”，而不是只给示例。

- 对齐真实检查链：`commit-msg`、`commitlint`、`pre-commit`、`lint-staged`。
- 明确限定 Conventional Commits 可用 `type`，避免自造类型。
- 优先读取已暂存改动，再基于改动点数量判断是否需要 body。
- 输出要求非常严格：只输出提交信息本体，不附带解释和代码块。

### `nocobase-plugin-dev`

适用于 NocoBase 插件从开发到排障的完整链路，覆盖面明显更广。

- 支持 server、client、fullstack 三类插件。
- 覆盖 collections、database、resource、ACL、route、request、i18n、logger、test、build 等主题。
- 对 `plugin-workflow` 提供 trigger / instruction 两类扩展指导。
- 提供 workflow node 的 client / server 模板，便于从零开始搭建节点能力。
- 强调先找最接近的官方插件模式，再做最小必要改动。

## 内容编写风格

从当前仓库已有 skill 可以看出，这个仓库遵循的是工程化而不是“万能提示词”写法：

- 先调查真实上下文，再给出实现或输出。
- 能从源码、报错、仓库规则证明的内容才写进 skill。
- 优先最小改动、最小假设、最少臆造。
- 参考资料按需读取，不一次性加载全部内容。
- 对输出格式有明确约束，方便 agent 直接执行。

## 适用场景

这个仓库目前最适合以下任务：

- 为 NocoBase 仓库生成规范 commit message。
- 开发、重构或修复 NocoBase 插件。
- 扩展 `plugin-workflow` 的触发器或节点类型。
- 沉淀与 NocoBase 工程实践直接相关的 agent 能力。

## 新增 Skill 的建议结构

如果要继续扩展这个仓库，建议沿用当前已经形成的组织方式：

1. 在 `skills/<skill-name>/` 下创建独立目录。
2. 编写 `SKILL.md`，在头部声明 `name` 和 `description`。
3. 将大段背景知识拆到 `references/`，主文件只保留决策流程和关键规则。
4. 有固定代码形态时补充 `templates/`。
5. 在 `agents/openai.yaml` 中补充展示名、简述和默认提示词。

## 当前状态

当前仓库已经具备清晰的 skill 组织方式，内容集中在 NocoBase 研发场景。后续可以继续沿着以下方向扩展：

- 更多 NocoBase 子领域 skill，例如测试、发布、迁移、性能排查。
- 更细分的模板与参考资料。
- 针对不同 agent 平台的元数据配置。
