# Plugin 插件

在 NocoBase 中，服务端插件通过继承 `@nocobase/server` 的 `Plugin` 类来扩展系统能力。插件可以在不同生命周期阶段注册事件 接口 权限 数据结构和运行时逻辑。

## 基本插件类

```ts
import { Plugin } from '@nocobase/server';

export class PluginHelloServer extends Plugin {
  async afterAdd() {}

  async beforeLoad() {}

  async load() {}

  async install() {}

  async beforeEnable() {}

  async afterEnable() {}

  async beforeDisable() {}

  async afterDisable() {}

  async beforeRemove() {}

  async afterRemove() {}

  async handleSyncMessage(message: Record<string, any>) {}

  static async staticImport() {}
}

export default PluginHelloServer;
```

## 生命周期

| 生命周期方法 | 执行时机 | 常见用途 |
|------|------|------|
| `staticImport()` | 插件加载前 | 不依赖插件实例的静态初始化 |
| `afterAdd()` | 插件加入插件管理器后 | 基础初始化 |
| `beforeLoad()` | 所有插件 `load()` 前 | 注册 model repository operator event ACL snippet 等静态能力 |
| `load()` | 插件加载时 | 注册 resource API service middleware 等运行时逻辑 |
| `install()` | 首次启用时 | 初始化表结构 初始数据 安装逻辑 |
| `beforeEnable()` | 每次启用前 | 启用前检查 准备上下文 预校验 |
| `afterEnable()` | 每次启用后 | 启动任务 建立连接 注册启用后的动作 |
| `beforeDisable()` | 每次禁用前 | 禁用前检查 停止前置流程 |
| `afterDisable()` | 每次禁用后 | 清理资源 停止任务 关闭连接 |
| `beforeRemove()` | 删除前 | 卸载前检查与预清理 |
| `afterRemove()` | 删除后 | 卸载后的收尾逻辑 |
| `handleSyncMessage(message)` | 多节点同步时 | 处理跨节点同步消息 |

## 典型执行顺序

1. 静态初始化：`staticImport()`
2. 应用启动：`afterAdd()` -> `beforeLoad()` -> `load()`
3. 首次启用：`afterAdd()` -> `beforeLoad()` -> `load()` -> `beforeEnable()` -> `install()` -> `afterEnable()`
4. 后续启用：`afterAdd()` -> `beforeLoad()` -> `load()` -> `beforeEnable()` -> `afterEnable()`
5. 禁用插件：`beforeDisable()` -> `afterDisable()`
6. 删除插件：先核对当前版本 `plugin-manager.remove()` 是否触发卸载钩子，不要默认假设 `beforeRemove()` / `afterRemove()` 或旧写法 `remove()` 一定会执行

约束：

- `beforeLoad()` 适合做注册，不适合做数据库读写。
- `load()` 适合挂载运行时逻辑，不适合做初始化写库。
- `install()` 必须幂等。
- 启停前后的资源绑定与释放，优先放在 `beforeEnable()` / `afterEnable()` / `beforeDisable()` / `afterDisable()`。
- 卸载清理逻辑先核对当前版本 `plugin-manager.remove()` 的真实调用链。
- 多节点部署相关逻辑优先放 `handleSyncMessage()`。

## this.app 常用成员

插件内可以通过 `this.app` 访问应用实例能力。

| 成员名称 | 主要用途 |
|------|------|
| `logger` | 日志输出 |
| `db` | 数据库 ORM 模型 事件 事务 |
| `resourceManager` | 注册和管理资源与操作处理器 |
| `acl` | 权限控制 |
| `cacheManager` | 缓存管理 |
| `cronJobManager` | 定时任务管理 |
| `i18n` | 国际化 |
| `cli` | 注册自定义命令 |
| `dataSourceManager` | 多数据源管理 |
| `pm` | 插件管理器 |

## 实践建议

- 新插件先按最小插件类把生命周期骨架补全，再逐步填充逻辑。
- 静态注册与运行时逻辑分开：前者放 `beforeLoad()`，后者放 `load()`。
- 初始化写入和安装动作放 `install()`，不要挪到 `load()`。
- 插件运行日志优先使用 `this.log`，需要单独输出时再看 `logger.md`。
- 涉及数据库 注册时机和可写阶段时，结合 `database.md` 一起看。
- 涉及系统表定义时，结合 `collections.md` 一起看。
- 涉及权限时，结合 `acl.md` 一起看。
