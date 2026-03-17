# Router 路由

NocoBase 客户端通过路由管理器扩展前端页面，常用入口是 `router.add()` 和 `pluginSettingsRouter.add()`。

## 默认页面路由

常见默认路由：

| 名称 | 路径 | 说明 |
|------|------|------|
| `admin` | `/admin/*` | 后台管理页 |
| `admin.page` | `/admin/:name` | 动态页面 |
| `admin.settings` | `/admin/settings/*` | 插件设置页 |

## 常规页面扩展

通过 `router.add()` 添加普通页面路由：

```tsx
import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Application, Plugin } from '@nocobase/client';

const Home = () => <h1>Home</h1>;
const About = () => <h1>About</h1>;

const Layout = () => (
  <div>
    <div>
      <Link to="/">Home</Link> | <Link to="/about">About</Link>
    </div>
    <Outlet />
  </div>
);

class MyPlugin extends Plugin {
  async load() {
    this.router.add('root', { element: <Layout /> });

    this.router.add('root.home', { path: '/', element: <Home /> });
    this.router.add('root.about', { path: '/about', element: <About /> });
  }
}

const app = new Application({
  router: { type: 'memory', initialEntries: ['/'] },
  plugins: [MyPlugin],
});

export default app.getRootComponent();
```

支持动态参数：

```tsx
this.router.add('root.user', {
  path: '/user/:id',
  element: ({ params }) => <div>User ID: {params.id}</div>,
});
```

## 插件设置页扩展

通过 `pluginSettingsRouter.add()` 添加插件设置页面：

```tsx
import { Plugin } from '@nocobase/client';
import React from 'react';

const HelloSettingPage = () => <div>Hello Setting page</div>;

export class HelloPlugin extends Plugin {
  async load() {
    this.pluginSettingsRouter.add('hello', {
      title: 'Hello',
      icon: 'ApiOutlined',
      Component: HelloSettingPage,
    });
  }
}
```

## 多级设置路由

```tsx
import { Outlet } from 'react-router-dom';

const pluginName = 'hello';

class HelloPlugin extends Plugin {
  async load() {
    this.pluginSettingsRouter.add(pluginName, {
      title: 'HelloWorld',
      icon: '',
      Component: Outlet,
    });

    this.pluginSettingsRouter.add(`${pluginName}.demo1`, {
      title: 'Demo1 Page',
      Component: () => <div>Demo1 Page Content</div>,
    });

    this.pluginSettingsRouter.add(`${pluginName}.demo2`, {
      title: 'Demo2 Page',
      Component: () => <div>Demo2 Page Content</div>,
    });
  }
}
```

## 实践建议

- 普通页面扩展优先使用 `router.add()`。
- 插件配置页优先使用 `pluginSettingsRouter.add()`，保持在后台设置结构中统一出现。
- 多级设置页面使用父级 `Outlet` 承载子路由。
- 路由注册集中放在 client plugin 的 `load()` 中，不要散落到多个入口。
