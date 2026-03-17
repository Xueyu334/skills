# Database 数据库

`Database` 是数据库类型 `DataSource` 的核心组成。每个数据库型数据源都有对应的 `Database` 实例，可通过 `dataSource.db` 访问；主数据源还可通过 `app.db` 访问。

熟悉 `db` 的注册时机、可操作阶段和常用访问方式，是编写服务端插件的基础。

## 组成部分

一个典型的 `Database` 包含：

- `Collection`：定义数据表结构。
- `Model`：ORM 模型，通常由 Sequelize 管理。
- `Repository`：仓库层，封装更高层的数据访问逻辑。
- `FieldType`：字段类型。
- `FilterOperator`：筛选操作符。
- `Event`：生命周期事件与数据库事件。

## beforeLoad 适合做什么

`beforeLoad` 阶段不要执行数据库读写，适合做静态注册和事件监听：

- `db.registerFieldTypes()`
- `db.registerModels()`
- `db.registerRepositories()`
- `db.registerOperators()`
- `db.on()`

## load 适合做什么

`load` 阶段也不要执行数据库读写；此时更适合补齐数据表定义，确保前置类与事件已经加载完成：

- `db.defineCollection()`
- `db.extendCollection()`

若是插件的内置系统表，更推荐放到 `src/server/collections` 目录，而不是在 `load()` 中临时定义。详见 `collections.md`。

## 数据访问方式

### 通过 Repository

```ts
const repo = db.getRepository('users');
const user = await repo.findOne({ filter: { id: 1 } });
```

适用场景：

- 封装业务逻辑
- 分页 过滤 权限检查
- 面向资源与仓库层的标准数据访问

### 通过 Model

```ts
const UserModel = db.getModel('users');
const user = await UserModel.findByPk(1);
```

适用场景：

- 直接操作 ORM 模型
- 较底层的数据访问或特殊查询

## 哪些阶段可以进行数据库操作

### Plugin 生命周期

| 阶段 | 可进行数据库操作 |
|------|----------------|
| `staticImport` | No |
| `afterAdd` | No |
| `beforeLoad` | No |
| `load` | No |
| `install` | Yes |
| `beforeEnable` | Yes |
| `afterEnable` | Yes |
| `beforeDisable` | Yes |
| `afterDisable` | Yes |
| `remove` | Yes |
| `handleSyncMessage` | Yes |

结论：

- 插件初始化写入放 `install`
- 启停相关的数据调整放 `beforeEnable` `afterEnable` `beforeDisable` `afterDisable`
- 卸载清理放 `remove`

### App 事件

| 阶段 | 可进行数据库操作 |
|------|----------------|
| `beforeLoad` | No |
| `afterLoad` | No |
| `beforeStart` | Yes |
| `afterStart` | Yes |
| `beforeInstall` | No |
| `afterInstall` | Yes |
| `beforeStop` | Yes |
| `afterStop` | No |
| `beforeDestroy` | Yes |
| `afterDestroy` | No |
| `beforeLoadPlugin` | No |
| `afterLoadPlugin` | No |
| `beforeEnablePlugin` | Yes |
| `afterEnablePlugin` | Yes |
| `beforeDisablePlugin` | Yes |
| `afterDisablePlugin` | Yes |
| `afterUpgrade` | Yes |

### Database 事件 / 钩子

| 阶段 | 可进行数据库操作 |
|------|----------------|
| `beforeSync` | No |
| `afterSync` | Yes |
| `beforeValidate` | Yes |
| `afterValidate` | Yes |
| `beforeCreate` | Yes |
| `afterCreate` | Yes |
| `beforeUpdate` | Yes |
| `afterUpdate` | Yes |
| `beforeSave` | Yes |
| `afterSave` | Yes |
| `beforeDestroy` | Yes |
| `afterDestroy` | Yes |
| `afterCreateWithAssociations` | Yes |
| `afterUpdateWithAssociations` | Yes |
| `afterSaveWithAssociations` | Yes |
| `beforeDefineCollection` | No |
| `afterDefineCollection` | No |
| `beforeRemoveCollection` | No |
| `afterRemoveCollection` | No |

## 实践约束

- `beforeLoad` 和 `load` 不做数据库读写。
- 注册类能力与定义表结构分开处理：前者放 `beforeLoad`，后者放 `load` 或约定式 `src/server/collections`。
- 涉及系统表的新增或扩展时，优先结合 `collections.md` 和 `migrations` 一起设计。
