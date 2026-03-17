# Request 请求

NocoBase 客户端通过基于 Axios 封装的 `APIClient` 发起请求。只要能拿到 `Context`，通常就能访问 `ctx.api`。

常见可获取 `Context` 的位置：

- `app.context`
- `engine.context`
- `plugin.context`
- `model.context`

## ctx.api.request()

最常用的请求方法是 `ctx.api.request()`，其参数和返回值与 `axios.request()` 保持一致。

基础示例：

```ts
await ctx.api.request({
  url: 'users:list',
  method: 'get',
});
```

发送数据：

```ts
await ctx.api.request({
  url: 'users:create',
  method: 'post',
  data: {
    name: 'Tao Tao',
  },
});
```

适用场景：

- 组件内请求
- model / plugin / engine 上下文内请求
- 标准资源接口调用

## ctx.api.axios

`ctx.api.axios` 是 `AxiosInstance`，可用于修改默认配置或添加拦截器。

示例：

```ts
axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
```

## 请求与响应拦截器

请求拦截器常用于：

- 统一请求头
- 统一参数序列化
- 多应用 多语言 多角色 场景透传

```ts
axios.interceptors.request.use((config) => {
  config.paramsSerializer = (params) =>
    qs.stringify(params, {
      strictNullHandling: true,
      arrayFormat: 'brackets',
    });
  return config;
});

axios.interceptors.request.use((config) => {
  config.headers['Authorization'] = `Bearer token123`;
  config.headers['X-Hostname'] = 'localhost';
  config.headers['X-Timezone'] = '+08:00';
  config.headers['X-Locale'] = 'zh-CN';
  config.headers['X-Role'] = 'admin';
  config.headers['X-Authenticator'] = 'basic';
  config.headers['X-App'] = 'sub1';
  return config;
});
```

响应拦截器常用于统一错误提示：

```ts
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    ctx.notification.error({
      message: '请求响应错误',
    });
    return Promise.reject(error);
  },
);
```

## NocoBase 常见自定义请求头

| Header | 说明 |
|------|------|
| `X-App` | 指定当前应用 |
| `X-Locale` | 当前语言 |
| `X-Hostname` | 客户端主机名 |
| `X-Timezone` | 客户端时区 |
| `X-Role` | 当前角色 |
| `X-Authenticator` | 当前认证方式 |

这些请求头通常由拦截器自动注入，只有在测试或特殊场景下才需要手动设置。

## 在组件中使用

在 React 组件中可通过 `useFlowContext()` 获取上下文：

```tsx
import { useFlowContext } from '@nocobase/client';

const MyComponent = () => {
  const ctx = useFlowContext();

  const fetchData = async () => {
    const response = await ctx.api.request({
      url: '/api/posts',
      method: 'get',
    });
    console.log(response.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return <div>加载中...</div>;
};
```

## 搭配 useRequest

组件内请求通常可配合 `ahooks` 的 `useRequest`：

```tsx
import { useFlowContext } from '@nocobase/client';
import { useRequest } from 'ahooks';

const MyComponent = () => {
  const ctx = useFlowContext();

  const { data, loading, error, refresh } = useRequest(() =>
    ctx.api.request({
      url: 'posts:list',
      method: 'get',
    }),
  );

  if (loading) return <div>加载中...</div>;
  if (error) return <div>请求出错: {error.message}</div>;

  return (
    <div>
      <button onClick={refresh}>刷新</button>
      <pre>{JSON.stringify(data?.data, null, 2)}</pre>
    </div>
  );
};
```

## 实践建议

- 标准资源请求优先用 `ctx.api.request()`，不要重复封装一层低价值调用。
- 多语言 多应用 多角色相关请求优先通过拦截器统一注入 header。
- 组件内请求优先配合 `useFlowContext()` 和 `useRequest()`，减少手写状态管理。
- 统一错误提示优先放到响应拦截器，而不是在每个组件重复处理。
