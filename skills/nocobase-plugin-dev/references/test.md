# Test 测试

NocoBase 提供了完整的测试工具，用于验证数据库逻辑 API 接口和插件功能实现。插件开发应优先补最小可维护测试，避免回归。

## 为什么写测试

- 快速验证数据库模型 API 和业务逻辑
- 降低回归风险
- 支持 CI 自动执行
- 不启动完整生产服务也能验证插件行为

## 核心测试工具

| 工具 | 用途 |
|------|------|
| `createMockDatabase` | 测试数据库模型 字段 关系 CRUD 逻辑 |
| `createMockServer` | 测试完整应用实例中的插件 资源 接口和业务流程 |

## createMockDatabase

适合测试：

- collection 定义
- 字段类型
- 模型关系
- repository CRUD

基础示例：

```ts
import { createMockDatabase, Database } from '@nocobase/database';

describe('Database test', () => {
  let db: Database;

  beforeEach(async () => {
    db = await createMockDatabase();
    await db.clean({ drop: true });
  });

  afterEach(async () => {
    await db.close();
  });

  it('should create and query data', async () => {
    const User = db.collection({
      name: 'users',
      fields: [
        { type: 'string', name: 'username' },
        { type: 'integer', name: 'age' },
      ],
    });

    await User.sync();

    await db.getRepository('users').create({
      values: { username: 'testuser', age: 25 },
    });

    const found = await db.getRepository('users').findOne({
      filter: { username: 'testuser' },
    });

    expect(found.get('age')).toBe(25);
  });
});
```

常见场景：

- CRUD 测试
- 关联关系测试
- repository 查询参数测试

## createMockServer

适合测试：

- 插件接口
- 资源动作
- 权限与登录状态
- 多插件联动流程

基础示例：

```ts
import { createMockServer, MockServer } from '@nocobase/test';

describe('User API test', () => {
  let app: MockServer;

  beforeEach(async () => {
    app = await createMockServer({ plugins: ['users', 'auth'] });
  });

  afterEach(async () => {
    await app.destroy();
  });

  it('should create a user', async () => {
    const response = await app.agent()
      .post('/users:create')
      .send({ username: 'test', email: 'a@b.com', password: '123456' });

    expect(response.status).toBe(200);
    expect(response.body.username).toBe('test');
  });
});
```

常见补充：

- 查询列表：`app.agent().get('/users:list')`
- 更新记录：`app.agent().post('/users:update/1')`
- 登录后调用受保护接口：`app.agent().login(userOrId)`

## 权限与登录测试

若启用了 `auth` 插件，可以先登录再访问接口：

```ts
const res = await app
  .agent()
  .post('/auth:signin')
  .send({
    username: 'admin',
    password: 'admin123',
  });

const token = res.body.data.token;

await app
  .agent()
  .set('Authorization', `Bearer ${token}`)
  .get('/protected-endpoint');
```

也可以使用更简洁的方式：

```ts
await app.agent().login(userOrId);
```

## 测试文件组织

服务端测试建议放在：

```text
packages/plugins/@scope/plugin-name/
└─ src
   └─ server
      └─ __tests__
         ├─ db.test.ts
         └─ api.test.ts
```

建议：

- 数据库相关测试和 API 测试分文件组织
- 变更行为时同步更新或新增测试
- 测试命名使用 `*.test.ts`

## 运行测试

```powershell
# 按目录运行
yarn test packages/plugins/@scope/plugin-name/src/server

# 按文件运行
yarn test packages/plugins/@scope/plugin-name/src/server/__tests__/db.test.ts
```

## 实践建议

- 纯数据库逻辑优先用 `createMockDatabase`，比整应用测试更快。
- 涉及资源 API 权限 生命周期联动时优先用 `createMockServer`。
- 每次行为变更至少补一条能覆盖主路径的自动化测试。
