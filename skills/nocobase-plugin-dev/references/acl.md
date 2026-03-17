# ACL 权限控制

ACL（Access Control List）用于控制资源操作权限。ACL 对象归属于数据源，可通过 `dataSource.acl` 访问；主数据源可通过 `app.acl` 快捷访问。

适用场景：

- 给角色批量分配权限
- 让部分接口跳过角色限制
- 为敏感操作增加固定数据保护
- 为界面上的自定义操作开放权限配置

## 注册权限片段

`registerSnippet()` 用于注册可复用的权限组合。角色绑定 snippet 后，即获得该组权限。

```ts
acl.registerSnippet({
  name: 'ui.customRequests',
  actions: ['customRequests:*'],
});
```

约定：

- `ui.*` 前缀通常表示允许在界面中配置的权限片段
- `actions` 支持通配符

## 跳过角色约束

`allow()` 用于允许某些操作绕过角色限制，适用于公开接口、登录后可访问接口或基于上下文动态判断的场景。

```ts
// 公开访问
acl.allow('app', 'getLang', 'public');

// 已登录用户可访问
acl.allow('app', 'getInfo', 'loggedIn');

// 自定义条件
acl.allow('orders', ['create', 'update'], (ctx) => {
  return ctx.auth.user?.isAdmin ?? false;
});
```

`condition` 常见取值：

- `'public'`：无需登录即可访问
- `'loggedIn'`：仅登录用户可访问
- `(ctx) => boolean | Promise<boolean>`：基于请求上下文动态判断

## 注册 ACL 中间件

`use()` 用于插入自定义权限中间件，通常结合 `ctx.permission` 使用，适合非常规权限规则。

典型场景：

- 公开表单没有用户角色，但需要密码校验
- 基于 IP 请求参数 Header 等条件决定是否放行
- 临时跳过默认 ACL 检查

```ts
acl.use(async (ctx, next) => {
  const { resourceName, actionName } = ctx.action;

  if (resourceName === 'publicForms' && actionName === 'submit') {
    const password = ctx.request.body?.password;
    if (password === 'your-secret-password') {
      ctx.permission = {
        skip: true,
      };
    } else {
      ctx.throw(403, 'Invalid password');
    }
  }

  await next();
});
```

`ctx.permission` 常见用法：

- `skip: true`：跳过后续 ACL 权限检查

## 添加固定数据约束

`addFixedParams()` 可以为某些资源操作添加固定 filter 或参数约束，并绕过角色限制直接生效，适合保护系统关键数据。

```ts
acl.addFixedParams('roles', 'destroy', () => {
  return {
    filter: {
      $and: [
        { 'name.$ne': 'root' },
        { 'name.$ne': 'admin' },
        { 'name.$ne': 'member' },
      ],
    },
  };
});
```

适用场景：

- 禁止删除系统角色
- 禁止修改管理员账户
- 限制特定资源只能操作安全范围内的数据

## 判断权限

`can()` 用于在业务逻辑中判断角色是否拥有某个操作权限，返回权限结果或 `null`。

```ts
const result = acl.can({
  roles: ['admin', 'manager'],
  resource: 'orders',
  action: 'delete',
});

if (result) {
  console.log(result.role);
  console.log(result.params);
}
```

返回结果中通常包含：

- `role`
- `resource`
- `action`
- `params`：若配置了 `addFixedParams()`，会带上固定参数

若传入多个角色，会按角色集合依次检查并返回命中的权限结果。

## 注册可配置操作

若希望自定义操作能出现在角色管理界面的权限配置中，需要使用 `setAvailableAction()` 注册。

```ts
acl.setAvailableAction('importXlsx', {
  displayName: '{{t("Import")}}',
  type: 'new-data',
  onNewRecord: true,
});
```

常用参数：

- `displayName`：界面显示名称，支持国际化
- `type`：
  - `new-data`
  - `existing-data`
- `onNewRecord`：是否对新建数据场景生效

## 实践建议

- 通用权限组合优先抽成 snippet，不要在角色上重复散配。
- 公开接口优先用 `allow()` 或 ACL 中间件明确表达，不要绕开框架权限系统自行判断。
- 涉及系统内置数据保护时，优先用 `addFixedParams()` 做兜底。
- 自定义操作若需要在界面配置权限，记得同步注册 `setAvailableAction()`。
