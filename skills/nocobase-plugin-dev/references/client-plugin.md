# Client Plugin 客户端插件

在 NocoBase 中，客户端插件通过继承 `@nocobase/client-v2`（v1 兼容版本为 `@nocobase/client`）的 `Plugin` 基类扩展前端能力。常用于注册路由、页面组件、设置页、FlowModel、菜单 UI 扩展和第三方前端集成。

## 基本插件类

### v2 写法（`src/client-v2/plugin.tsx`）

```ts
import { Plugin, Application } from '@nocobase/client-v2';

export class PluginHelloClient extends Plugin<any, Application> {
  async afterAdd() {
    console.log('Plugin added');
  }

  async beforeLoad() {
    console.log('Before plugin load');
  }

  async load() {
    console.log('Plugin loaded');
  }
}

export default PluginHelloClient;
```

> 兼容说明：若目标插件仍在维护 v1 `src/client/` 目录，基类从 `@nocobase/client` 导入。

## 常用插件属性

在插件类内部可通过 `this` 直接访问以下属性：

| 属性 | 说明 |
|------|------|
| `this.router` | 路由管理器（`RouterManager`），用于注册页面路由（等价于 `this.engine.context.router`） |
| `this.pluginSettingsManager` | 插件设置页管理器，提供 `addMenuItem()` 与 `addPageTabItem()` |
| `this.flowEngine` | `FlowEngine` 实例，用于注册 `FlowModel` |
| `this.engine` | `this.flowEngine` 别名 |
| `this.context` | 上下文对象（等价于 `this.engine.context`，与组件内 `useFlowContext()` 返回同一对象） |
| `this.t()` | 自动注入当前插件包名作为命名空间的国际化翻译方法 |
| `this.app` | 应用实例 |
| `this.app.eventBus` | 应用级事件总线（`EventTarget`），用于监听生命周期事件 |

## 生命周期

| 生命周期方法 | 执行时机 | 常见用途 |
|------|------|------|
| `afterAdd()` | 插件加入插件管理器后 | 轻量初始化 读取配置 绑定基础事件 |
| `beforeLoad()` | 所有插件 `load()` 前 | 依赖其他插件的准备逻辑 可通过 `this.app.pm.get()` 访问已启用插件 |
| `load()` | 插件加载时 | 注册路由 UI 组件 settings block action field 等核心逻辑 |

典型执行顺序：

1. `afterAdd()`
2. `beforeLoad()`
3. `load()`

浏览器每次刷新或前端应用初始化时都会重新执行这套顺序。

补充说明：

- `afterAdd()` 时插件实例已创建，但并非所有插件都已初始化完成。
- `beforeLoad()` 适合放依赖其他插件的准备逻辑。
- `load()` 适合放前端扩展的核心注册逻辑。

## 插件上下文与 FlowEngine

从 NocoBase 2.0 开始，客户端扩展 API 主要集中在 FlowEngine 中。插件内可通过 `this.engine`（或快捷别名 `this.context`）访问引擎上下文能力。

```ts
async load() {
  const { app, router, api, i18n, logger } = this.engine.context;
  // 或直接使用 this.context / this.router / this.t('Hello')
  logger.info('Plugin context ready', { hasApp: Boolean(app), hasRouter: Boolean(router), hasApi: Boolean(api), hasI18n: Boolean(i18n) });
}
```

常见用法：

- `this.engine.context.router`（别名 `this.router`）
- `this.engine.context.api.request(...)`
- `this.engine.context.i18n` 与 `this.engine.context.t(...)`
- `this.engine.context.logger`

## 实践建议

- 客户端核心注册逻辑放在 `load()`，不要过早写进 `afterAdd()`。
- 依赖其他前端插件时，优先在 `beforeLoad()` 做准备。
- 路由 页面组件 block action field model 注册尽量集中在 client plugin 中完成。
- 路由和设置页扩展优先通过 `this.router.add()` 与 `this.pluginSettingsManager.addMenuItem()` / `addPageTabItem()`；详见 `router.md`。
- 组件或模型里的 API 调用优先复用 `ctx.api`；详见 `request.md`。
- 前端运行日志优先使用 `ctx.logger`；详见 `client-logger.md`。
- 前端文案与翻译方法优先看 `client-i18n.md`，不要直接硬编码用户可见文本。
- 大型客户端模块优先 lazy import（如 `componentLoader`），避免首屏负担过重。
- 涉及翻译文案时，结合 `i18n.md` 一起处理。
