# NocoBase Plugin Checklist

## Scope

- 插件包名与目录是否唯一
- 是否明确 server client fullstack 边界
- 是否明确依赖与版本约束
- 是否确认加载来源优先级 `packages/plugins > storage/plugins > node_modules`

## Structure

- 是否包含 `package.json`
- 是否包含 `client-v2.js` / `client-v2.d.ts`（或兼容 `client.js` / `client.d.ts`）与 `server.js` / `server.d.ts` 产物入口
- 是否包含 `src/client-v2`（或 `src/client`）与 `src/server`
- 是否按需提供 `src/server/migrations` `src/locale`
- `.npmignore` 是否仅列出排除目录（未使用 `!` 否定语法）

## Lifecycle

- 是否把模型与动作注册放在 `beforeLoad`
- 是否把运行时绑定放在 `load`
- 是否把初始化逻辑放在 `install` 且可重复执行
- 是否正确处理 `beforeEnable` `afterEnable` `beforeDisable` `afterDisable`
- 涉及卸载清理时 是否先核对当前版本 remove hook 调用链
- 多节点场景是否处理 `handleSyncMessage`

## Backend

- 是否注册 collections actions hooks
- ACL 是否同步 `allow` `addFixedParams` `registerSnippet`
- migration 是否设置 `on` 与 `appVersion`
- 错误语义是否可定位
- 审计日志是否脱敏敏感字段

## Frontend

- 是否通过 `this.router.add()`、`this.pluginSettingsManager`（`addMenuItem` / `addPageTabItem`）或 `FlowEngine` 注册路由、设置页与模型
- 大模块与设置页是否使用 `componentLoader` / `FieldsetLoader` 懒加载
- 是否正确区分并使用了 `tExpr()`、`useT()`、`this.t()` 与权限可见性
- 是否处理加载态 空态 错误态

## Workflow

- 是否明确客户端属于 v2（`@nocobase/plugin-workflow/client-v2` + `FieldsetLoader`）还是 v1（`@nocobase/plugin-workflow/client` + `fieldset`）
- `registerTrigger()` `registerInstruction()` 的类型标识是否唯一
- 服务端与客户端的 trigger / instruction type 是否完全一致
- 服务端是否实现对称 `on()` `off()`，或已证明全局订阅模式安全
- 环境事件回调中是否调用 `this.workflow.trigger()`
- 多 workflow 并存时 listener timer cache 是否按 `workflow.id` 隔离
- v1 客户端是否补齐 `title` `fieldset`，且没有机械照搬旧文档里的 `name: 'config.xxx'`；v2 客户端是否使用 `FieldsetLoader`
- 服务端节点是否实现 `run()`，并返回明确的 `JOB_STATUS`
- 返回 `PENDING` 的节点是否实现 `resume()`
- 客户端节点是否补齐 `title` `type` `group` 及 `FieldsetLoader` / `fieldset`
- `useVariables()` 第一层是否以当前 node 的 `key` / `title` 作为根
- `testable = true` 时服务端是否实现 `test()`
- 是否验证启用 配置修改 禁用 手动触发 节点执行与结果变量链路

## Commands

- 是否包含 `pm create` `pm pull` `pm enable` `pm disable` `pm remove`
- 是否说明 `pull` 仅下载 首次 `enable` 才安装

## Build

- 如需自定义构建 是否在插件根目录提供 `build.config.ts`
- 是否区分 `modifyRsbuildConfig`（v2 `src/client-v2`；旧版 Vite 为 `modifyViteConfig`）与 `modifyTsupConfig` 职责
- 是否仅在必要时使用 `beforeBuild` `afterBuild`

## Dependencies

- 新增依赖前是否对照 `references/global-dependencies.md`
- 插件依赖是否统一声明在 `devDependencies`，未误写入 `dependencies`
- 全局依赖是否避免重复打包
- 插件自身依赖是否与当前框架版本兼容
- 是否排查 `dist/node_modules` 中的重复依赖

## Quality

- 是否有最小测试
- 服务端测试是否使用 `createMockServer`
- 是否给出迁移步骤
- 是否给出回滚方案
- 是否给出手工验收步骤
