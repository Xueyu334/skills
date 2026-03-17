---
name: nocobase-plugin-dev
description: 设计 开发 重构 调试 NocoBase 插件。用于 server client fullstack 插件的目录结构 生命周期 collections migrations 数据源 resource ACL 路由 request workflow trigger instruction node 国际化 日志 测试 package.json build.config.ts，以及 pm create pull enable disable remove 等插件任务。
---

# NocoBase Plugin Development

优先对齐 `packages/plugins/@nocobase/*` 的现有模式，只做完成任务所需的最小改动。

## 1) 目标与边界

目标：

- 交付可运行的 NocoBase 插件变更，而不是只给概念建议。
- 优先复用官方插件模式，保持目录、生命周期、资源、ACL、构建方式一致。
- 在需要时同时补齐 migration、测试、package.json、build.config.ts 与交付说明。

职责边界：

- 处理插件范围内的问题：server plugin、client plugin、fullstack plugin、插件启停、插件构建与依赖。
- 不把仓库 core 改造、通用前端设计、项目私有规范当作默认规则，除非用户明确提供。
- 不凭空增加字段、依赖、生命周期逻辑或构建配置；都要能从源码、报错或官方模式证明。

## 2) 适用任务

在以下场景触发本 skill：

- 新建或补全插件骨架。
- 实现、重构或修复插件功能。
- 排查 `add` `enable` `load` `install` `disable` `remove` 相关问题。
- 定义或扩展 `Collection` `Model` `Repository` `Resource` `ACL` `Route` `Request` i18n 日志与测试。
- 扩展 `plugin-workflow` 的 `Trigger` / `Instruction` / 节点类型，处理 `registerTrigger` `registerInstruction` 基类、运行逻辑与配置界面。
- 调整 `package.json`、依赖策略、`build.config.ts`、插件构建和发布行为。
- 使用官方插件命令 `pm create` `pm pull` `pm enable` `pm disable` `pm remove`。

## 3) 典型使用场景

- 为现有插件增加数据表、资源动作、ACL 与客户端设置页。
- 插件 `enable` 或 `add` 失败，需要定位入口导出、生命周期或依赖问题。
- 将一段散落的插件逻辑重构为更贴近官方模式的 server/client/fullstack 结构。
- 为 `plugin-workflow` 增加新的触发器类型，分别补齐 server 侧事件订阅与 client 侧配置表单。
- 为 `plugin-workflow` 增加新的节点类型，补齐 server 侧 `run` / `resume` 与 client 侧 `title` `group` `fieldset` `useVariables`。
- 收敛 `package.json`、依赖声明和 `build.config.ts`，让构建产物与运行时行为一致。

## 4) 输入与输出约定

先确定这些输入：

- 插件名称、路径与真实加载来源。
- 插件形态：server、client 或 fullstack。
- 当前任务类型：功能、重构、排障、构建、测试或发布。
- 当前报错、生命周期阶段或命令上下文。
- 最接近的官方插件参照物。

如果信息不全，先调查，不要直接写代码。

输出应包含：

- 最小必要的代码或配置改动。
- 需要同步补齐的 migration、测试、i18n、日志、构建或依赖调整。
- 已执行的验证步骤，或未验证的阻塞原因。
- 涉及数据结构、插件启停或兼容性的风险、迁移与回滚说明。

## 5) 先做的判断

1. 先确认实际加载来源：`packages/plugins` 优先于 `storage/plugins`，优先于 `node_modules`。
2. 先找到功能和形态最接近的官方插件，再决定实现方式。
3. 先划清 server 与 client 边界，再决定读哪些 references。
4. 先确认是不是 `plugin-workflow` 扩展，再决定是读普通插件 references、`workflow-trigger.md` 还是 `workflow-node.md`。
5. 先看真实 import、目录结构和报错，再决定 package.json、依赖与 `build.config.ts`。

```powershell
# 默认使用 PowerShell
Get-ChildItem packages/plugins -Recurse -File | Select-String -Pattern "class .*Plugin|@nocobase/server|@nocobase/client|migrations|resource|acl|collections"

# 若本机安装了 rg，可用更快的检索
rg -n "class .*Plugin|@nocobase/server|@nocobase/client|migrations|resource|acl|collections" packages/plugins
```

## 6) 标准实施顺序

1. 明确本次变更涉及哪些能力：collection model repository resource acl route request workflow trigger instruction i18n logger build。
2. 涉及 `plugin-workflow` 扩展时，先区分 `trigger` 与 `instruction`；两者都必须同时补 server client 注册，类型标识保持一致；扩展 `instruction` 时再补 `group` 与变量输出策略。
3. 涉及系统级数据表时，优先在 `src/server/collections` 定义或扩展，并同步准备 `migrations`。
4. 涉及静态注册时放到 `beforeLoad`，涉及运行时绑定时放到 `load`，不要混用生命周期。
5. 涉及数据库、资源或权限时，优先复用 `Database`、`DataSourceManager`、`ResourceManager`、`ACL` 现有能力，不要绕开框架自造层。
6. 涉及工作流触发器服务端实现时，优先把环境订阅放进 `Trigger.on()` / `off()`；在事件回调里调用 `this.workflow.trigger(workflow, context, options)`，需要手动执行或表单校验时再补 `execute()` / `validateContext()`。
7. 涉及工作流节点服务端实现时，先定义 `run()` 的 `JOB_STATUS` 返回；需要供下游使用的数据放进 `result`，需要外部异步回调时用 `PENDING + resume()`，只有控制流节点才谨慎返回 `null` 提前退出。
8. 完成 `install`、`beforeEnable` / `afterEnable`、`beforeDisable` / `afterDisable` 的初始化、绑定、清理与幂等处理；若任务涉及卸载，再单独核对当前版本的 remove hook 链路。
9. 再完成 client 侧注册：settings route block action field model；若是工作流触发器，先补 `title` `description` `fieldset`，复杂场景再补 `useVariables` `components` `scope` `useInitializers`；若是节点类型，至少补 `title` `type` `group` `fieldset`，需要结果变量时补 `useVariables`，需要限制使用场景时补 `isAvailable`。
10. 再处理 `package.json`、依赖位置与 `build.config.ts`，不要先配一堆无法从代码证明的字段。
11. 最后执行测试、构建，以及按需的 `upgrade` 与启停验证，并整理迁移、风险和回滚说明。

## 7) 关键规则

### 目录与入口

- 典型 fullstack 目录包含 `src/index.ts`、`src/server`、`src/client`、`src/locale`。
- `client.js`、`server.js`、`client.d.ts`、`server.d.ts` 要与构建产物一致。
- `src/index.ts` 只导出插件主入口；若插件 `add` 或 `enable` 失败，优先检查是否误导出了 client 内容。常见模式见 `references/troubleshooting.md`。

### 生命周期

- `staticImport`：插件类级别的静态初始化；仅在确实需要启动前准备时使用。
- `afterAdd`：插件加入插件管理器后执行；适合做基础初始化与状态准备。
- `beforeLoad`：注册 collection operator repository action handler ACL snippet 等静态能力。
- `load`：注册 middleware、event、resource、route 等运行时能力。
- `install`：仅首次启用执行，必须幂等。
- `beforeEnable` / `afterEnable`：处理启用前检查与启用后的绑定。
- `beforeDisable` / `afterDisable`：处理禁用前检查与禁用后的清理。
- `handleSyncMessage`：处理多节点同步。
- 当前仓库的 `Plugin` 基类已提供 `beforeRemove()` / `afterRemove()`，但 `plugin-manager.remove()` 默认并不会自动调用这些钩子；仓库内也仍有大量插件保留 `remove()` 旧写法。涉及卸载清理时，必须先核对当前版本源码，不要默认假设某个 remove hook 一定会触发。

### Workflow trigger

- 扩展触发器类型时，服务端继承 `@nocobase/plugin-workflow` 的 `Trigger`，客户端继承 `@nocobase/plugin-workflow/client` 的 `Trigger`。不要照搬旧文档里的 `@nocobase/workflow/client`，先以当前仓库源码为准。
- 触发器类型标识必须全局唯一，且 server client `registerTrigger()` 使用同一字符串。
- 服务端默认在 `on()` 中订阅环境事件，在回调中调用 `this.workflow.trigger(workflow, context, options)`；在 `off()` 中对称取消订阅并清理 listener timer map。
- 一个触发器实例会同时服务多个 workflow；定时器、listener、hook id 默认按 `workflow.id` 建 `Map`，不要只存单个字段后被后续 workflow 覆盖。
- 当前仓库在工作流配置更新时会先对旧配置执行 `off()`；取消订阅逻辑不要依赖 Sequelize Model 实例方法，只依赖 `id` `type` `config` 这类可序列化字段。
- 客户端最小配置是 `title` 与 `fieldset`；复杂触发器再补 `description` `sync` `triggerFieldset` `useVariables` `components` `scope` `useInitializers`。
- 当前仓库的 trigger 配置表单直接读写 `workflow.config`；不要机械照搬旧文档里的 `name: 'config.xxx'`，先参考同版本官方插件的 `fieldset` 写法。
- 注册时机默认放插件 `load()`；插件实例获取方式跟随邻近官方插件，可用 `this.app.pm.get('workflow')` 或 `this.app.pm.get(WorkflowPlugin)`。
- 若环境事件天然是全局 middleware hook，且已能通过 `enabledCache` 过滤启用工作流，可参考 `plugin-workflow-request-interceptor` 在构造器中一次性挂载；否则坚持 per-workflow `on` / `off`。

### Workflow node / instruction

- 扩展节点类型时，服务端继承 `@nocobase/plugin-workflow` 的 `Instruction`；`run(node, input, processor)` 是必实现项。
- 普通节点默认返回带 `status` 的 job 结果，成功场景优先用 `JOB_STATUS.RESOLVED`；可预期异常优先转成 `FAILED` `ERROR` `REJECTED` 等明确状态，不要把业务失败全交给未捕获异常。
- 需要把结果暴露给后续节点时，把数据放进返回值的 `result`；配置中包含变量模板时，优先用 `processor.getParsedValue(node.config, node.id)` 或同等方式先解析。
- 外部异步回调场景返回 `JOB_STATUS.PENDING` 时，必须补 `resume()`；若 client 侧需要抽屉里的测试运行按钮，再补 `test()` 并配合 `testable = true`。
- 只有分支调度或流程控制类节点才考虑返回 `null` 提前退出；这类实现优先对照 `plugin-workflow-parallel` 等官方样例，并补充分支与恢复测试。
- 客户端继承 `@nocobase/plugin-workflow/client` 的 `Instruction`；最小配置是 `title` `type` `group` `fieldset`，常见可选项包括 `description` `icon` `components` `scope` `useVariables` `useInitializers` `getCreateModelMenuItem` `isAvailable` `testable`。
- 当前仓库节点配置抽屉直接读写 `node.config`；不要机械照搬旧文档里的 `name: 'digit'` 之类写法，先参考同版本官方节点的 `fieldset`。
- 节点结果要作为变量供下游使用时，`useVariables()` 第一层必须以当前节点自身为根：`value = node.key`、`label = node.title`；复杂对象再用 `children` 继续展开，数组路径不要写索引。
- 若节点需要放进新的分组，先在 client 插件里 `registerInstructionGroup()`，再 `registerInstruction()`；若已有 `control` `calculation` `collection` `manual` `extended` 或邻近插件自定义分组可复用，就不要重复造组。
- 限制节点可用范围时，再实现 `isAvailable()`；最常见场景是禁止在同步工作流、特定上游节点或某些分支环境中使用。

### package.json 与构建依赖

- 先参考最接近的官方插件 `package.json`，不要凭空补字段。
- 处理插件 `package.json` 时，必须先对照 `packages/core/cli/templates/plugin/package.json.tpl` 确认哪些字段属于模板默认项。
- 对 `exports`、`nocobase`、`files`、`types` 这类非模板默认字段，默认禁止补充；只有在源码、构建产物、发布流程或运行时加载链路能明确证明必需时，才允许添加。
- 不能因为“官方某些插件有”或“现有仓库里常见”就补这类字段；必须给出当前插件的直接证据。
- 构建或整理插件 `package.json` 时，必须先扫描插件源码中实际使用到的外部依赖，不能靠猜测补依赖。
- 扫描出的依赖需要结合 `references/global-dependencies.md` 判断归属：宿主全局提供且要求与框架保持一致的依赖，优先放入 `peerDependencies`；插件自身需要参与构建、打包或随产物分发的依赖，按规则放入 `devDependencies` 或保持最小化 `dependencies`。
- 不能只因为某个包在源码里被 `import` 就机械地加入 `dependencies`；必须先判断它是否属于全局依赖、宿主依赖、构建期依赖或插件私有运行时依赖。
- 依赖管理按整个插件处理，不区分前后端。
- `peerDependencies` 只放宿主运行时必须提供的依赖。
- 插件自身依赖默认优先放 `devDependencies`；`dependencies` 保持最小化。
- 使用全局依赖时，版本必须与框架保持一致；完整名单见 `references/global-dependencies.md`。
- `main` 默认使用 `dist/server/index.js`，除非官方同类插件另有约定。
- 仅在默认构建无法满足需求时，才在插件根目录添加 `build.config.ts`；模板见 `references/snippets.md`。

```powershell
# 默认使用 PowerShell：先看 NocoBase 运行时依赖
Get-ChildItem packages/plugins/<scope>/<plugin-name>/src -Recurse -File | Select-String -Pattern "@nocobase/"

# 再看 import / require 语句，并人工排除相对路径与 @nocobase/*
Get-ChildItem packages/plugins/<scope>/<plugin-name>/src -Recurse -File | Select-String -Pattern "from '|from ""|require\\('|require\\("""

# 若本机安装了 rg，可用更快的检索
rg -n "@nocobase/" packages/plugins/<scope>/<plugin-name>/src
rg -n "from '|from \"|require\\('|require\\(\"" packages/plugins/<scope>/<plugin-name>/src
```

### 验证与交付

在仓库根目录按需使用：

```powershell
yarn pm create @scope/plugin-name
yarn pm pull @scope/plugin-name
yarn pm enable @scope/plugin-name
yarn pm disable @scope/plugin-name
yarn pm remove @scope/plugin-name
```

最小验证步骤按变更类型选择：

```powershell
# 服务端行为或资源动作变更
yarn test packages/plugins/<scope>/<plugin-name>/src/server

# 需要打包发布或验证构建产物
yarn build @scope/plugin-name --tar
```

涉及 `migration`、`collection`、数据库 schema 或升级链路时，再补：

```powershell
yarn nocobase upgrade
```

交付时至少说明：

- 变更点
- 迁移步骤
- 兼容性影响
- 回滚方案
- 手工验收步骤或自动化测试结果

## 8) 按需读取 references

只读取当前任务真正需要的 reference，不要一次性全部加载。

- `Server`：`references/plugin.md` `references/collections.md` `references/database.md` `references/data-source-manager.md` `references/resource-manager.md` `references/acl.md`
- `Client`：`references/client-plugin.md` `references/router.md` `references/request.md` `references/client-i18n.md` `references/client-logger.md`
- `Workflow`：`references/workflow-trigger.md` `references/workflow-node.md`；若从零开始实现 instruction，先按 `client` / `server` 边界分别读 `templates/workflow-node/client/*.template.tsx` 与 `templates/workflow-node/server/*.template.ts`
- `Common`：`references/i18n.md` `references/logger.md` `references/test.md` `references/snippets.md` `references/global-dependencies.md` `references/troubleshooting.md`
- `Review`：`references/checklist.md` `references/patterns-from-nocobase.md` `references/v2-docs-notes.md`
