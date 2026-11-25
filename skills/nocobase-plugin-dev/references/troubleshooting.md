# NocoBase Plugin Troubleshooting

## 插件代码不生效

- 先检查加载来源是否来自 `packages/plugins`
- 再检查插件是否已 `enable`
- 仅 `pull` 未 `enable` 不会加载

## 首次启用失败

- 检查 `install` 是否包含非幂等写入
- 检查 migration 是否依赖不存在字段
- 检查依赖插件是否已启用

## 插件 add 或 enable 失败

- 检查 `src/index.ts` 是否错误导出了 client 侧内容
- 官方插件的 `src/index.ts` 通常只导出 server 入口 不应混入 `./client`
- 若这里多导出了 client 相关内容 可能导致插件 `add` 或 `enable` 失败
- 常规写法如下：

```typescript
export * from './server';
export { default } from './server';
```

## 权限异常 401 403

- 检查 ACL 是否配置 `allow`
- 检查 `addFixedParams` 是否限制过严
- 检查 `registerSnippet` 是否绑定到正确菜单或动作

## 数据结构异常

- 检查 migration 的 `on` 时机
- 检查 `appVersion` 范围是否命中
- 检查是否遗漏回滚或兼容逻辑

## 前端入口不可见

- 检查 client plugin `load` 是否注册成功
- 检查当前角色权限与可见性条件
- 检查 i18n key 是否存在

## 多节点行为不一致

- 检查是否实现 `handleSyncMessage`
- 检查事件总线消息是否正确发布
- 检查缓存刷新逻辑

## `yarn build --tar` 报错 `TypeError: no paths specified to add to archive`

- 检查插件根目录 `.npmignore` 是否使用了 `!` 否定语法（例如 `*` 配合 `!dist`、`!package.json`）
- 打包器会给每行自动加 `!` 转换为 `fast-glob` 排除规则，已有 `!` 会变成无效的 `!!` 导致匹配结果为空
- 修正为仅列出要排除的目录即可：

```text
/node_modules
/src
```

## 插件激活失败或依赖冲突

- 检查插件 `package.json` 是否误将依赖写入 `dependencies`
- 应将插件依赖统一移入 `devDependencies`，由构建系统决定打包进 `dist/node_modules/` 或由宿主提供全局依赖
- 确认全局依赖版本与 `@nocobase/server`、`@nocobase/client-v2`（或 v1 `@nocobase/client`）一致

## 前端国际化不生效或报错

- 检查是否混用了三种翻译方法：`tExpr()`（静态定义 `define()` / `registerFlow()`）、`useT()`（React 组件内）、`this.t()`（Plugin `load()` 内）
- 检查 `tExpr` 是否从本插件 `src/client-v2/locale.ts`（或 `src/client/locale.ts`）导入，而不是直接从 `@nocobase/flow-engine` 导入（否则缺少当前插件 namespace）
