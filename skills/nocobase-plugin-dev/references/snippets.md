# NocoBase Plugin Snippets

## 目录

- [Server plugin skeleton](#server-plugin-skeleton)
- [Client plugin skeleton](#client-plugin-skeleton)
- [Entry export pattern](#entry-export-pattern)
- [Migration skeleton](#migration-skeleton)
- [Server test skeleton](#server-test-skeleton)
- [Custom build config (build.config.ts)](#custom-build-config-buildconfigts)
- [.npmignore 安全写法](#npmignore-安全写法)
- [Dependency audit commands](#dependency-audit-commands)

## Server plugin skeleton

```ts
import { Plugin } from '@nocobase/server';

export class PluginHelloServer extends Plugin {
  async afterAdd() {}

  async beforeLoad() {
    // register models operators action handlers
  }

  async load() {
    // register runtime middleware events resources
  }

  async install() {
    // initialize seed data idempotently
  }

  async afterEnable() {}

  async afterDisable() {}

  async remove() {}
}

export default PluginHelloServer;
```

## Client plugin skeleton

```tsx
// src/client-v2/plugin.tsx（v2 默认入口；若兼容 v1 src/client，请从 @nocobase/client 导入）
import { Application, Plugin } from '@nocobase/client-v2';

export class PluginHelloClient extends Plugin<any, Application> {
  async load() {
    // 通过 this.router.add() 注册页面路由
    // 通过 this.pluginSettingsManager.addMenuItem() / addPageTabItem() 注册设置页
    // 通过 this.flowEngine / this.engine 注册 FlowModel
  }
}

export default PluginHelloClient;
```

## Entry export pattern

```ts
// src/index.ts
export * from './server';
export { default } from './server';
```

## Migration skeleton

```ts
import { Migration } from '@nocobase/server';

export default class MyMigration extends Migration {
  // 常见取值为 'beforeLoad' 或 'afterLoad'，按依赖的集合/插件加载时机选择
  on = 'beforeLoad';
  appVersion = '<2.0.0';

  async up() {
    // keep migration idempotent
  }
}
```

## Server test skeleton

```ts
import { createMockServer } from '@nocobase/test';

describe('plugin feature', () => {
  it('works', async () => {
    const app = await createMockServer({
      plugins: ['auth', 'users', 'acl', 'data-source-manager'],
    });

    // assert resources/actions here

    await app.db.clean({ drop: true });
    await app.destroy();
  });
});
```

## Custom build config (build.config.ts)

在需要自定义插件构建行为时，在插件根目录创建 `build.config.ts`。

```text
packages/plugins/@scope/plugin-name
├─ build.config.ts
├─ package.json
└─ src
```

使用 `@nocobase/build` 的 `defineConfig()` 返回配置对象。

```ts
import { defineConfig } from '@nocobase/build';

export default defineConfig({
  modifyRsbuildConfig: (config) => {
    // rsbuild 用于打包 src/client-v2（仅旧版 Vite 仓库使用 modifyViteConfig）
    // 参考：https://rsbuild.rs/guide/configuration/rsbuild
    return config;
  },
  modifyTsupConfig: (config) => {
    // tsup 用于打包 src/server
    // 按需修改 tsup 配置
    return config;
  },
  beforeBuild: (log) => {
    // 构建开始前执行
  },
  afterBuild: (log) => {
    // 构建完成后执行
  },
});
```

使用约定：

- `modifyRsbuildConfig`：修改 v2 客户端 `src/client-v2` 的 Rsbuild 打包配置（旧版 Vite 仓库对应 `modifyViteConfig`）。
- `modifyTsupConfig`：修改服务端 `src/server` 的打包配置。
- `beforeBuild`：构建开始前执行，适合做预检查或生成临时文件。
- `afterBuild`：构建完成后执行，适合做产物整理或构建后校验。

实践约束：

- 仅在默认构建无法满足需求时再添加 `build.config.ts`。
- 优先做最小改动，不要重写整套 Rsbuild/Vite 或 tsup 配置。
- 修改前先对照最接近的官方插件，避免引入与仓库现有构建链冲突的配置。

## .npmignore 安全写法

打包插件时，不要在 `.npmignore` 中使用 `!` 否定语法（如 `*` 配合 `!dist`），否则 `yarn build <plugin> --tar` 会报错 `TypeError: no paths specified to add to archive`。仅直接列出要排除的目录即可：

```text
/node_modules
/src
```

## Dependency audit commands

```powershell
# 1) 查看插件声明依赖
Get-Content packages/plugins/@my-project/plugin-hello/package.json

# 2) 检索是否误引入常见全局依赖
rg -n "\"(react|react-dom|antd|lodash|koa|sequelize|@nocobase/client|@nocobase/server)\"" packages/plugins/@my-project/plugin-hello/package.json

# 3) 检查构建产物中是否出现重复 server 依赖
rg -n "node_modules/(react|antd|lodash|koa|sequelize)" packages/plugins/@my-project/plugin-hello/dist
```
