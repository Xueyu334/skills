# Client Plugin 客户端插件

在 NocoBase 中，客户端插件通过继承 `@nocobase/client` 的 `Plugin` 基类扩展前端能力。常用于注册路由 页面组件 菜单 UI 扩展和第三方前端集成。

## 基本插件类

```ts
import { Plugin } from '@nocobase/client';

export class PluginHelloClient extends Plugin {
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

从 NocoBase 2.0 开始，客户端扩展 API 主要集中在 FlowEngine 中。插件内可通过 `this.engine` 访问引擎实例。

```ts
async load() {
  const { app, router, apiClient } = this.engine.context;
  console.log(app, router, apiClient);
}
```

常见用法：

- `this.engine.context.app`
- `this.engine.context.router`
- `this.engine.context.apiClient`

## 实践建议

- 客户端核心注册逻辑放在 `load()`，不要过早写进 `afterAdd()`。
- 依赖其他前端插件时，优先在 `beforeLoad()` 做准备。
- 路由 页面组件 block action field model 注册尽量集中在 client plugin 中完成。
- 路由和设置页扩展优先通过 `router.add()` 与 `pluginSettingsRouter.add()`；详见 `router.md`。
- 组件或模型里的 API 调用优先复用 `ctx.api`；详见 `request.md`。
- 前端运行日志优先使用 `ctx.logger`；详见 `client-logger.md`。
- 前端文案与翻译 hooks 优先看 `client-i18n.md`，不要直接硬编码用户可见文本。
- 大型客户端模块优先 lazy import，避免首屏负担过重。
- 涉及翻译文案时，结合 `i18n.md` 一起处理。
