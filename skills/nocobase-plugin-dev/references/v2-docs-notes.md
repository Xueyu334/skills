# NocoBase v2 Docs Notes

来源：

- https://docs.nocobase.com/plugin-development
- https://docs.nocobase.com/plugin-development/project-structure
- https://docs.nocobase.com/plugin-development/server/plugin
- https://docs.nocobase.com/plugin-development/client/plugin
- https://docs.nocobase.com/plugin-development/dependency-management
- https://docs.nocobase.com/plugin-development/build
- https://docs.nocobase.com/plugin-development/client/appendix/faq
- https://docs.nocobase.com/workflow/development/migration

## 1) 插件加载优先级

文档给出的插件来源优先级：

1. `packages/plugins`
2. `storage/plugins`
3. `node_modules`

实现和排障时先确认当前实际加载的是哪一份插件代码。

## 2) 服务端插件生命周期

服务端插件常见钩子：

- `afterAdd`
- `beforeLoad`
- `load`
- `install`
- `afterEnable`
- `afterDisable`
- `remove`
- `handleSyncMessage`

执行语义：

- `install` 只在插件首次启用时执行
- `afterEnable` 在每次启用时执行
- 多节点同步场景用 `handleSyncMessage`

## 3) 官方开发与构建流程

创建与启用：

```bash
yarn pm create @my-project/plugin-hello
yarn pm pull @my-project/plugin-hello
yarn pm enable @my-project/plugin-hello
yarn pm disable @my-project/plugin-hello
yarn pm remove @my-project/plugin-hello
```

测试：

```bash
yarn test packages/plugins/@my-project/plugin-hello/src/server
```

构建并安装 tar 包：

```bash
yarn build @my-project/plugin-hello --tar
# 或分两步执行（产物输出到 storage/tar/<package-name>-<version>.tgz）
yarn build @my-project/plugin-hello
yarn nocobase tar @my-project/plugin-hello

yarn nocobase upgrade
```

## 4) 应用到本 skill 的建议

- 新插件先按最小生命周期跑通
- 增量引入 ACL migration tests
- 遇到功能不生效先排查加载优先级和启用状态

补充说明：

- `pull` 仅负责下载插件包
- 首次 `enable` 才触发安装与初始化
- 仅 `pull` 未 `enable` 的插件不会被加载

## 5) 插件依赖管理（dependency-management）

文档要点可归纳为：

1. 依赖分层：
- 全局依赖：由 `@nocobase/server` / `@nocobase/client-v2` 统一提供，插件无需重复打包。
- 插件自身依赖：插件专用依赖，会随插件发布与安装。
2. 构建影响：
- 插件自身 server 依赖会写入插件产物中的 `dist/node_modules`。
3. 实践建议：
- 开发时将所有插件依赖维护在 `devDependencies`，不要写入 `dependencies`（否则可能导致激活失败或重复打包）。
- 尽量复用 NocoBase 已提供的全局依赖，避免版本冲突与体积膨胀。
- 新增依赖前先确认是否已在全局依赖列表内，版本需与宿主一致。

## 6) 自定义打包配置（build.config.ts）

文档与示例要点可归纳为：

1. 在插件根目录创建 `build.config.ts`。
2. 通过 `defineConfig` 暴露构建配置。
3. `modifyRsbuildConfig` 用于修改 v2 客户端 `src/client-v2` 的 Rsbuild 打包配置（旧版 Vite 仓库为 `modifyViteConfig`）。
4. `modifyTsupConfig` 用于修改 `src/server` 的 tsup 打包配置。
5. `beforeBuild` 和 `afterBuild` 可挂构建前后回调逻辑（接收 `log` 参数）。

## 7) v2 客户端与构建关键演进

1. **目录与入口**：`yarn pm create` 默认生成 `src/client-v2/`（主入口 `client-v2.js` / `client-v2.d.ts`）与兼容用的 `src/client/`（`client.js` / `client.d.ts`）。
2. **核心包迁移**：v2 前端基类与引擎能力集中在 `@nocobase/client-v2` 与 `@nocobase/flow-engine`；插件内通过 `this.router`、`this.pluginSettingsManager`、`this.flowEngine` / `this.engine`、`this.context`、`this.t()` 访问，组件内通过 `useFlowContext()` 获取 `ctx.api` / `ctx.t` / `ctx.router` / `ctx.logger`。
3. **设置页 API**：v2 使用 `this.pluginSettingsManager.addMenuItem()` + `addPageTabItem()`（支持 `componentLoader` 懒加载与单页自动隐藏 Tab），替代 v1 的 `pluginSettingsRouter.add()`。
4. **工作流扩展**：v2 导入 `@nocobase/plugin-workflow/client-v2`，使用 `FieldsetLoader = () => import(...)` 懒加载 React 表单组件，移除 `scope` 与 `components` 注入。
5. **前端国际化分工**：`tExpr()`（从本地 `locale.ts` 导入，用于静态定义）、`useT()`（React 组件）、`this.t()`（Plugin `load()`）。
6. **`.npmignore` 避坑**：禁止使用 `!` 否定语法，仅直接列出 `/node_modules`、`/src` 等排除目录，避免 `yarn build --tar` 报 `no paths specified to add to archive`。
