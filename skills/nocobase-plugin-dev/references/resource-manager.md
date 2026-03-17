# ResourceManager 资源管理

NocoBase 会将 `collection` 和 `association` 自动转换为资源，并通过 `ResourceManager` 管理资源操作。与传统 REST API 不同，NocoBase 通过显式的 `:action` 决定执行的操作，而不是仅依赖 HTTP 方法。

## 自动生成资源

当定义了 `collection` 和关联关系后，系统会自动生成对应资源。

```ts
db.defineCollection({
  name: 'posts',
  fields: [
    { type: 'belongsToMany', name: 'tags' },
  ],
});

db.defineCollection({
  name: 'tags',
  fields: [],
});
```

将自动得到：

- `posts`
- `tags`
- `posts.tags`

常见请求形式：

- `GET /api/posts:list`
- `GET /api/posts:get/1`
- `POST /api/posts:create`
- `POST /api/posts:update/1`
- `POST /api/posts:destroy/1`
- `POST /api/posts/1/tags:add`
- `POST /api/posts/1/tags:remove`
- `POST /api/posts/1/tags:set`
- `POST /api/posts/1/tags:toggle`

## 常见内置操作

基础 CRUD：

- `list`
- `get`
- `create`
- `update`
- `destroy`
- `firstOrCreate`
- `updateOrCreate`

关系操作：

- `add`
- `remove`
- `set`
- `toggle`

常见参数：

- `filter`
- `values`
- `fields`
- `appends`
- `except`
- `sort`
- `page`
- `pageSize`
- `paginate`
- `tree`
- `whitelist`
- `blacklist`
- `updateAssociationValues`

## 注册自定义资源操作

### 注册全局 action handler

```ts
resourceManager.registerActionHandlers({
  customAction: async (ctx) => {
    ctx.body = { resource: ctx.action.resourceName };
  },
});
```

### 注册特定资源的 action handler

```ts
resourceManager.registerActionHandlers({
  'posts:publish': async (ctx) => publishPost(ctx),
  'posts.comments:pin': async (ctx) => pinComment(ctx),
});
```

命名规则：

- `resourceName:actionName`
- 关联资源使用点语法，例如 `posts.comments:pin`

## 定义自定义资源

若资源不直接对应数据表，可使用 `resourceManager.define()`：

```ts
resourceManager.define({
  name: 'app',
  actions: {
    getInfo: async (ctx) => {
      ctx.body = { version: 'v1' };
    },
  },
});
```

常见调用形式：

- `GET /api/app:getInfo`
- `POST /api/app:getInfo`

## 注册资源中间件

使用 `resourceManager.use()` 注册全局资源中间件：

```ts
resourceManager.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  console.log(`${ctx.method} ${ctx.path} - ${duration}ms`);
});
```

适用场景：

- 统一日志
- 资源层鉴权补充
- 对请求上下文做统一预处理

## 资源层上下文

进入 `resourceManager` 中间件或 action handler 后，说明目标资源已经存在。

常用上下文：

- `ctx.action.actionName`
- `ctx.action.resourceName`
- `ctx.action.params`
- `ctx.dataSource`
- `ctx.getCurrentRepository()`

## 多数据源中的 ResourceManager

主数据源：

```ts
app.resourceManager.registerActionHandlers();
```

其他数据源：

```ts
const dataSource = dataSourceManager.get('external');
dataSource.resourceManager.registerActionHandlers();
```

若需对所有已添加数据源注册相同行为：

```ts
dataSourceManager.afterAddDataSource((dataSource) => {
  dataSource.resourceManager.registerActionHandlers();
});
```

## 实践建议

- 已有 `collection` 和关联优先复用自动生成资源，不要重复手写同类 CRUD 接口。
- 自定义业务动作优先通过 `registerActionHandlers()` 扩展，而不是绕开资源体系单独写接口。
- 不依赖数据表的能力再考虑使用 `resourceManager.define()` 定义独立资源。
- 需要区分数据源时，不要默认使用 `app.resourceManager`，而应显式选择目标 `dataSource.resourceManager`。
