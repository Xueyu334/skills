# Logger 日志

NocoBase 的日志基于 Winston 封装。默认分为接口请求日志 系统运行日志 和 SQL 执行日志，其中插件开发通常只需要关注插件相关的系统运行日志。

## 默认打印方式

优先使用框架提供的默认日志接口，日志会按系统约定字段输出，并写入对应日志文件：

```ts
// 默认打印方法
app.log.info('message');

// 在中间件中使用
async function middleware(ctx, next) {
  ctx.log.info('message');
  await next();
}

// 在插件中使用
class CustomPlugin extends Plugin {
  async load() {
    this.log.info('message');
  }
}
```

支持的常见级别：

- `info`
- `debug`
- `warn`
- `error`

## metadata 用法

默认打印接口都遵循同一约定：第一个参数是日志消息，第二个参数是可选 metadata 对象。

```ts
app.log.info('message', {
  module: 'module',
  submodule: 'submodule',
  method: 'method',
  key1: 'value1',
  key2: 'value2',
});
// => level=info timestamp=... message=message module=module submodule=submodule method=method meta={"key1":"value1","key2":"value2"}
```

约定：

- `module`
- `submodule`
- `method`

这些字段会被提取为独立字段，其余字段通常进入 `meta`。

常见级别也都遵循相同用法：

```ts
app.log.debug('message');
app.log.warn('message');
app.log.error('message');
```

## 输出到其他文件

若希望沿用系统日志格式，但输出到其他文件，可使用 `createSystemLogger()`：

```ts
import { createSystemLogger } from '@nocobase/logger';

const logger = createSystemLogger({
  dirname: '/pathto/',
  filename: 'xxx',
  seperateError: true, // 是否将 error 单独输出到 xxx_error.log
});
```

适用场景：

- 单独输出某类插件日志
- 将 error 日志拆到独立文件

## 自定义 logger

若需要直接使用更底层的 Winston 风格配置，可使用 `createLogger()`：

```ts
import { createLogger } from '@nocobase/logger';

const logger = createLogger({
  // options
});
```

扩展点：

- `transports`：可使用 `'console' | 'file' | 'dailyRotateFile'`
- `format`：可使用 `'logfmt' | 'json' | 'delimiter'`

## app.createLogger

在多应用场景下，若需要输出到当前应用目录下，可使用：

```ts
app.createLogger({
  dirname: '',
  filename: 'custom', // 输出到 /storage/logs/main/custom.log
});
```

## plugin.createLogger

插件内同样可以创建自己的 logger：

```ts
class CustomPlugin extends Plugin {
  async load() {
    const logger = this.createLogger({
      // 输出到 /storage/logs/main/custom-plugin/YYYY-MM-DD.log
      dirname: 'custom-plugin',
      filename: '%DATE%.log',
      transports: ['dailyRotateFile'],
    });
  }
}
```

## 实践建议

- 普通插件日志优先使用 `app.log` `ctx.log` `this.log`，保持与系统日志格式一致。
- 关键业务链路补充 `module` `submodule` `method`，便于检索和排障。
- 涉及敏感数据时先脱敏再打印，不要直接输出完整凭据 密钥 token 或用户隐私数据。
- 仅在确有目录隔离或特殊输出格式需求时，再使用 `createSystemLogger()` `createLogger()` 或 `plugin.createLogger()`。
