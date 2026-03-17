# NocoBase Plugin Snippets

## 目录

- [Server plugin skeleton](#server-plugin-skeleton)
- [Client plugin skeleton](#client-plugin-skeleton)
- [Entry export pattern](#entry-export-pattern)
- [Migration skeleton](#migration-skeleton)
- [Server test skeleton](#server-test-skeleton)
- [Custom build config (build.config.ts)](#custom-build-config-buildconfigts)
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
import { Plugin } from '@nocobase/client';

export class PluginHelloClient extends Plugin {
  async load() {
    // register settings routes blocks actions fields
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
  modifyViteConfig: (config) => {
    // vite 用于打包 src/client
    // 按需修改 Vite 配置
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

- `modifyViteConfig`：修改客户端 `src/client` 的打包配置。
- `modifyTsupConfig`：修改服务端 `src/server` 的打包配置。
- `beforeBuild`：构建开始前执行，适合做预检查或生成临时文件。
- `afterBuild`：构建完成后执行，适合做产物整理或构建后校验。

实践约束：

- 仅在默认构建无法满足需求时再添加 `build.config.ts`。
- 优先做最小改动，不要重写整套 Vite 或 tsup 配置。
- 修改前先对照最接近的官方插件，避免引入与仓库现有构建链冲突的配置。

## Dependency audit commands

```powershell
# 1) 查看插件声明依赖
Get-Content packages/plugins/@my-project/plugin-hello/package.json

# 2) 检索是否误引入常见全局依赖
rg -n "\"(react|react-dom|antd|lodash|koa|sequelize|@nocobase/client|@nocobase/server)\"" packages/plugins/@my-project/plugin-hello/package.json

# 3) 检查构建产物中是否出现重复 server 依赖
rg -n "node_modules/(react|antd|lodash|koa|sequelize)" packages/plugins/@my-project/plugin-hello/dist
```
