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
