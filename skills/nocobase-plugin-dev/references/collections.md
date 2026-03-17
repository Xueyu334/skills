# Collections 数据表

在 NocoBase 插件开发中，Collection 是插件最核心的系统级元数据之一。代码定义的 Collection 与通过数据源管理界面创建的数据表不同，通常不会出现在数据源管理列表中。

## 放置位置

- Collection 文件放在 `src/server/collections`
- 新建表使用 `defineCollection()`
- 扩展已有表使用 `extendCollection()`

约定式目录中的 Collection 会在所有插件 `load()` 执行前完成加载，因此优先使用该目录，不要在运行时临时注册。

## 定义新表

```ts
import { defineCollection } from '@nocobase/database';

export default defineCollection({
  name: 'articles',
  title: '示例文章',
  fields: [
    { type: 'string', name: 'title', interface: 'input', uiSchema: { title: '标题', required: true } },
    { type: 'text', name: 'content', interface: 'textarea', uiSchema: { title: '正文' } },
    {
      type: 'belongsTo',
      name: 'author',
      target: 'users',
      foreignKey: 'authorId',
      interface: 'recordPicker',
      uiSchema: { title: '作者' },
    },
  ],
});
```

关键字段：

- `name`：表名，数据库中会生成同名表。
- `title`：界面显示名称。
- `fields`：字段集合，每个字段至少包含 `type` `name` 等属性。

## 扩展已有表

```ts
import { extendCollection } from '@nocobase/database';

export default extendCollection({
  name: 'articles',
  fields: [
    {
      type: 'boolean',
      name: 'isPublished',
      defaultValue: false,
    },
  ],
});
```

适用场景：

- 为其他插件已有 Collection 增加字段
- 调整已有 Collection 的部分配置

插件启用后，系统会将新增字段同步到已有表。

## 同步数据库结构

- 插件首次启用时，系统会自动根据 Collection 配置同步数据库结构。
- 插件已安装后，若新增或修改 Collection，需要手动执行：

```powershell
yarn nocobase upgrade
```

- 若同步过程中出现异常或脏数据，需要强制重建时，可执行：

```powershell
yarn nocobase install -f
```

注意：

- 数据结构变更优先结合 `migrations` 处理，不要只依赖运行时自动同步。
- 变更已有系统表时，先检查依赖插件和历史数据兼容性。

## 资源生成

定义 Collection 后，系统会自动生成对应 Resource，可直接通过 API 对该资源进行增删改查。
