# Router 路由

NocoBase 2.0 客户端通过 `this.router.add()` 注册普通页面路由，通过 `this.pluginSettingsManager`（`addMenuItem()` + `addPageTabItem()`）注册插件设置页。

注意区分两类 `router`：
- `this.router`（`RouterManager`）：在插件 `load()` 中通过 `.add()` 注册路由。
- `ctx.router`：在组件或动作中执行路由导航，如 `ctx.router.navigate('/some-page')`（v2 自动解析为 `/v/some-page`）。

## 默认页面路由

常见默认路由：

| 名称 | 路径 | 说明 |
|------|------|------|
| `admin` | `/admin/*` | 后台管理页 |
| `admin.page` | `/admin/:name` | 动态页面 |
| `admin.settings` | `/admin/settings/*` | 插件设置页 |

## 常规页面扩展

在插件 `load()` 中通过 `this.router.add()` 添加页面路由，推荐使用 `componentLoader` 懒加载：

```tsx
import { Plugin, Application } from '@nocobase/client-v2';

export class HelloPlugin extends Plugin<any, Application> {
  async load() {
    this.router.add('hello', {
      path: '/hello',
      componentLoader: () => import('./pages/HelloPage'),
    });
  }
}
```

在组件内进行路由跳转：

```tsx
import { useFlowContext } from '@nocobase/flow-engine';

const MyButton = () => {
  const ctx = useFlowContext();
  return <button onClick={() => ctx.router.navigate('/hello')}>Go</button>;
};
```

## 插件设置页扩展（v2 `pluginSettingsManager`）

### 单个设置页

先调用 `addMenuItem()` 注册设置菜单项，再调用 `addPageTabItem()` 注册页面（`key: 'index'` 映射到菜单根路径 `/admin/settings/<menuKey>` 或 `/v/admin/settings/<menuKey>`）。当菜单下只有一个页面时，顶部 Tab 栏会自动隐藏：

```tsx
import { Plugin, Application } from '@nocobase/client-v2';

export class HelloPlugin extends Plugin<any, Application> {
  async load() {
    this.pluginSettingsManager.addMenuItem({
      key: 'hello',
      title: this.t('Hello Settings'),
      icon: 'ApiOutlined', // Ant Design 图标名
    });

    this.pluginSettingsManager.addPageTabItem({
      menuKey: 'hello',
      key: 'index',
      title: this.t('Hello Settings'),
      componentLoader: () => import('./settings/HelloSettingPage'),
    });
  }
}
```

### 多 Tab 设置页

当同一个设置菜单下注册多个 `addPageTabItem()` 时会自动展示顶部 Tab 栏，可通过 `sort` 调整顺序（值越小越靠前）：

```tsx
import { Plugin, Application } from '@nocobase/client-v2';

export class PluginSettingsPageClient extends Plugin<any, Application> {
  async load() {
    this.pluginSettingsManager.addMenuItem({
      key: 'external-api',
      title: this.t('External API Settings'),
      icon: 'ApiOutlined',
    });

    // Tab 1: key 为 'index'，映射菜单根路径 /admin/settings/external-api
    this.pluginSettingsManager.addPageTabItem({
      menuKey: 'external-api',
      key: 'index',
      title: this.t('API Configuration'),
      componentLoader: () => import('./pages/ExternalApiSettingsPage'),
      sort: -1,
    });

    // Tab 2: 映射到 /admin/settings/external-api/about
    this.pluginSettingsManager.addPageTabItem({
      menuKey: 'external-api',
      key: 'about',
      title: this.t('About'),
      componentLoader: () => import('./pages/AboutPage'),
    });
  }
}
```

### `addPageTabItem` 常用参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `menuKey` | `string` | 是 | 父菜单 `key`，对应 `addMenuItem` 的 `key` |
| `key` | `string` | 是 | 页面唯一标识；`'index'` 表示默认页，映射到菜单根路径 |
| `title` | `ReactNode` | 否 | Tab 显示标题（推荐用 `this.t(...)`） |
| `componentLoader` | `Function` | 否 | 懒加载页面组件（推荐），与 `Component` 二选一 |
| `Component` | `Component` | 否 | 直接传入 React 组件 |
| `sort` | `number` | 否 | 排序值，越小越靠前 |
| `hidden` | `boolean` | 否 | 是否在 Tab 栏隐藏 |
| `link` | `string` | 否 | 外部链接；设置后点击 Tab 跳转至外部 URL |

## v1 兼容说明

若维护的是旧版 `src/client`（`@nocobase/client`）插件，设置页仍使用旧 API `this.pluginSettingsRouter.add()`（配合 `Outlet` 承载多级子路由）。

## 实践建议

- 普通页面扩展优先使用 `this.router.add()` + `componentLoader` 懒加载。
- 插件配置页优先使用 `this.pluginSettingsManager.addMenuItem()` + `addPageTabItem()`，保持在后台设置结构中统一出现。
- 路由注册集中放在 client plugin 的 `load()` 中，不要散落到多个入口。
- 菜单与 Tab 标题在 `load()` 内统一使用 `this.t()` 翻译。
