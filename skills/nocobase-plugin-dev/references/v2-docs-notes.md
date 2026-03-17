# NocoBase v2 Docs Notes

来源：

- https://v2.docs.nocobase.com/cn/development/
- https://v2.docs.nocobase.com/cn/development/plugin-development/server
- https://v2.docs.nocobase.com/cn/development/writing-a-plugin
- https://v2.docs.nocobase.com/cn/plugin-development/dependency-management
- https://v2.docs.nocobase.com/cn/plugin-development/build

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
- 全局依赖：由 `@nocobase/server` / `@nocobase/client` 统一提供。
- 插件自身依赖：插件专用依赖，会随插件发布与安装。
2. 构建影响：
- 插件自身 server 依赖会写入插件产物中的 `dist/node_modules`。
3. 实践建议：
- 开发时优先将依赖维护在 `devDependencies`。
- 尽量复用 NocoBase 已提供的全局依赖，避免重复打包与版本冲突。
- 新增依赖前先确认是否已在全局依赖列表内。

## 6) 自定义打包配置（build.config.ts）

文档与示例要点可归纳为：

1. 在插件根目录创建 `build.config.ts`。
2. 通过 `defineConfig` 暴露构建配置。
3. `modifyViteConfig` 用于修改 `src/client` 打包配置。
4. `modifyTsupConfig` 用于修改 `src/server` 打包配置。
5. `beforeBuild` 和 `afterBuild` 可挂构建前后回调逻辑。
