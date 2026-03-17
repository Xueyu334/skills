# DataSourceManager 数据源管理

NocoBase 通过 `DataSourceManager` 管理多数据源。每个 `DataSource` 都有独立的 `Database`、`ResourceManager` 和 `ACL` 实例。

## 基本概念

每个 `DataSource` 通常包含：

- `dataSource.collectionManager`：管理数据表和字段
- `dataSource.resourceManager`：管理资源与资源操作
- `dataSource.acl`：管理该数据源的权限控制

主数据源提供以下快捷别名：

- `app.db` 等价于主数据源的数据库实例
- `app.acl` 等价于主数据源的 ACL
- `app.resourceManager` 等价于主数据源的资源管理器

当插件只面向主数据源时，优先使用这些别名；涉及多数据源时，显式使用 `dataSourceManager.get()` 获取目标数据源。

## 常用方法

### 获取数据源

```ts
const dataSource = dataSourceManager.get('main');
```

适用场景：

- 明确操作某个指定数据源
- 多数据源插件中区分主库和业务库

### 为所有数据源注册中间件

```ts
dataSourceManager.use(async (ctx, next) => {
  console.log('This middleware applies to all data sources.');
  await next();
});
```

适用场景：

- 对所有数据源统一挂中间件
- 全局资源访问控制或日志埋点

## beforeAddDataSource

在数据源加载前执行，适合做静态类注册：

```ts
dataSourceManager.beforeAddDataSource((dataSource) => {
  const collectionManager = dataSource.collectionManager;
  if (collectionManager instanceof SequelizeCollectionManager) {
    collectionManager.registerFieldTypes({
      belongsToArray: BelongsToArrayField,
    });
  }
});
```

适用场景：

- 注册自定义字段类型
- 注册依赖数据源初始化前完成的静态能力

## afterAddDataSource

在数据源加载后执行，适合注册资源动作和权限：

```ts
dataSourceManager.afterAddDataSource((dataSource) => {
  dataSource.resourceManager.registerActionHandler('downloadXlsxTemplate', downloadXlsxTemplate);
  dataSource.resourceManager.registerActionHandler('importXlsx', importXlsx);
  dataSource.acl.allow('*', 'downloadXlsxTemplate', 'loggedIn');
});
```

适用场景：

- 注册资源操作 handler
- 对数据源级资源设置 ACL
- 基于数据源完成后再挂接运行时能力

## 实践建议

- 单数据源插件优先使用 `app.db` `app.acl` `app.resourceManager`。
- 多数据源插件要显式区分当前逻辑作用于哪个 `dataSource`，不要默认写死主数据源。
- 静态注册放 `beforeAddDataSource()`，依赖数据源实例的运行时能力放 `afterAddDataSource()`。
- 涉及数据表定义和数据库可写阶段时，结合 `database.md` 与 `collections.md` 一起看。
