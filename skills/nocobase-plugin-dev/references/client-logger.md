# Client Logger 前端日志

NocoBase 客户端提供了基于 Pino 的日志系统。在任意拥有 `context` 的地方，都可以通过 `ctx.logger` 获取日志实例。

## 基本用法

```ts
ctx.logger.fatal('应用初始化失败', { error });
ctx.logger.error('数据加载失败', { status, message });
ctx.logger.warn('当前表单包含未保存的更改');
ctx.logger.info('用户资料组件加载完成');
ctx.logger.debug('当前用户状态', { user });
ctx.logger.trace('组件渲染完成', { component: 'UserProfile' });
```

常见级别：

| 级别 | 方法 | 说明 |
|------|------|------|
| `fatal` | `ctx.logger.fatal()` | 致命错误 |
| `error` | `ctx.logger.error()` | 一般错误 |
| `warn` | `ctx.logger.warn()` | 警告信息 |
| `info` | `ctx.logger.info()` | 常规运行信息 |
| `debug` | `ctx.logger.debug()` | 调试信息 |
| `trace` | `ctx.logger.trace()` | 详细跟踪信息 |

## 日志格式

日志默认以结构化 JSON 输出，常见字段包括：

| 字段 | 说明 |
|------|------|
| `level` | 日志级别 |
| `time` | 时间戳 |
| `pid` | 进程 ID |
| `hostname` | 主机名 |
| `msg` | 日志消息 |
| 其他字段 | 自定义上下文数据 |

示例：

```json
{
  "level": 30,
  "time": 1730540153064,
  "pid": 12765,
  "hostname": "nocobase.local",
  "msg": "HelloModel rendered",
  "a": "a"
}
```

## 上下文绑定

`ctx.logger` 会自动带上当前上下文来源信息，适合插件 模型 组件内直接使用：

```ts
plugin.context.logger.info('Plugin initialized');
model.context.logger.error('Model validation failed', { model: 'User' });
```

带上下文的输出示例：

```json
{
  "level": 30,
  "msg": "Plugin initialized",
  "plugin": "plugin-audit-trail"
}
```

## 子 logger

需要追加模块信息时，可创建子 logger：

```ts
const logger = ctx.logger.child({ module: 'MyPlugin' });
logger.info('Submodule started');
```

子 logger 会继承原有配置并附加额外上下文。

## 日志级别数值

| 等级名称 | 数值 | 方法名 |
|------|------|------|
| `fatal` | 60 | `logger.fatal()` |
| `error` | 50 | `logger.error()` |
| `warn` | 40 | `logger.warn()` |
| `info` | 30 | `logger.info()` |
| `debug` | 20 | `logger.debug()` |
| `trace` | 10 | `logger.trace()` |
| `silent` | `-Infinity` | 无输出方法 |

当日志级别为 `info` 时，`debug` 和 `trace` 通常不会输出。

## 实践建议

- 前端日志优先使用上下文里的 `ctx.logger`，自动携带来源信息。
- `error` 记录业务异常，`info` 记录状态变化，`debug` 和 `trace` 只在开发和诊断阶段重点使用。
- 传对象而不是拼接字符串，保持结构化输出，便于过滤和分析。
- 避免在生产环境过量输出 `debug` 与 `trace`。
- 涉及敏感数据时先脱敏，不要直接打印完整 token 凭据或隐私内容。
