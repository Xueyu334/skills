# Workflow Trigger 扩展

在任务涉及 `plugin-workflow` 的新触发器类型、`registerTrigger()`、`Trigger` 基类、工作流配置界面时，读取本文件。

## 当前仓库版本差异

- 客户端基类真实 import 路径是 `@nocobase/plugin-workflow/client`，不要照搬旧文档中的 `@nocobase/workflow/client`。
- 当前客户端 trigger 配置表单直接读写 `workflow.config`；`fieldset` 通常直接以字段键命名，如 `interval` `collection` `global`，不要默认加 `name: 'config.xxx'`。
- `registerTrigger()` 的类型字符串才是生效标识；`static TYPE` 可选，但若声明了，也要与注册值保持一致。

## 服务端实现

- 继承 `@nocobase/plugin-workflow` 的 `Trigger`。
- 默认实现 `on(workflow)` 与 `off(workflow)`，在环境事件回调里调用 `this.workflow.trigger(workflow, context, options)`。
- 一个触发器实例会被 workflow 插件 registry 复用到多个工作流；定时器和 listener 默认按 `workflow.id` 放进 `Map`，不要只存单个实例字段。
- 需要手动触发、测试执行或参数校验时，再补 `execute()` 与 `validateContext()`。
- 触发器天然同步时，显式设置 `sync = true`；否则保持默认或显式设置 `false`。
- 当前引擎在工作流配置更新时会先用旧配置调用一次 `off()`；取消订阅逻辑只依赖 `id` `type` `config` 等可序列化字段，不要依赖 model instance 方法。
- 只有在事件源天然是全局 middleware 或 hook，且能通过 `this.workflow.enabledCache` 安全过滤启用工作流时，才参考 `plugin-workflow-request-interceptor` 在构造器中一次性挂载；否则坚持 per-workflow `on` / `off`。

最小骨架：

```ts
import WorkflowPluginServer, { Trigger } from '@nocobase/plugin-workflow';

export class IntervalTrigger extends Trigger {
  private timers = new Map<number, NodeJS.Timeout>();

  on(workflow) {
    const timer = setInterval(() => {
      this.workflow.trigger(workflow, { date: new Date() });
    }, workflow.config.interval ?? 60000);

    this.timers.set(workflow.id, timer);
  }

  off(workflow) {
    const timer = this.timers.get(workflow.id);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(workflow.id);
    }
  }
}

async load() {
  const workflow = this.app.pm.get('workflow') as WorkflowPluginServer;
  workflow.registerTrigger('interval', IntervalTrigger);
}
```

## 客户端实现

- 继承 `@nocobase/plugin-workflow/client` 的 `Trigger`。
- 最小提供 `title` 与 `fieldset`；复杂触发器再补 `description` `sync` `triggerFieldset` `useVariables` `components` `scope` `useInitializers` `getCreateModelMenuItem()`。
- `fieldset` 用于保存触发器配置，`triggerFieldset` 用于手动触发或测试输入。
- 需要变量面板、数据块初始化器或临时关联数据源时，优先参考现有官方 trigger 的 `useVariables()` `useInitializers()` `useTempAssociationSource()` 实现。
- 若触发器天然同步，客户端类也同步设置 `sync = true`，保证 UI 与执行策略一致。

最小骨架：

```tsx
import WorkflowPluginClient, { Trigger } from '@nocobase/plugin-workflow/client';

export class IntervalTrigger extends Trigger {
  title = 'Interval timer trigger';
  fieldset = {
    interval: {
      type: 'number',
      title: 'Interval',
      'x-decorator': 'FormItem',
      'x-component': 'InputNumber',
      default: 60000,
    },
  };
}

async load() {
  const workflow = this.app.pm.get('workflow') as WorkflowPluginClient;
  workflow.registerTrigger('interval', IntervalTrigger);
}
```

## 样例优先级

- 最小注册样例：`packages/plugins/@nocobase/plugin-ai/src/server/workflow/triggers/ai-employee` 与 `packages/plugins/@nocobase/plugin-ai/src/client/workflow/triggers/ai-employee`
- 完整触发器样例：`packages/plugins/@nocobase/plugin-workflow-request-interceptor`
- 内置服务端实现：`packages/plugins/@nocobase/plugin-workflow/src/server/triggers/CollectionTrigger.ts` 与 `packages/plugins/@nocobase/plugin-workflow/src/server/triggers/ScheduleTrigger`
- 内置客户端配置样例：`packages/plugins/@nocobase/plugin-workflow-action-trigger/src/client/ActionTrigger.tsx`

## 注册与验证

- server client 两侧都在插件 `load()` 中注册，类型标识必须完全一致。
- 插件实例获取方式跟随邻近官方插件；`this.app.pm.get('workflow')` 和 `this.app.pm.get(WorkflowPlugin)` 在当前仓库都能看到样例。
- 至少验证三条链路：启用 workflow 后能订阅、修改配置后旧订阅被清理并重新绑定、禁用 workflow 后订阅被移除。
- 若实现了 `execute()` 或 `triggerFieldset`，补一条手动触发或测试执行验证。
