# Workflow Node 扩展

在任务涉及 `plugin-workflow` 的新节点类型、`registerInstruction()`、`Instruction` 基类、节点变量输出、`isAvailable()`、`testable` 时，读取本文件。

## 当前仓库版本差异

- 客户端基类真实 import 路径是 `@nocobase/plugin-workflow/client`，不要照搬旧文档中的 `@nocobase/workflow/client`。
- 当前节点配置抽屉直接读写 `node.config`；`fieldset` 通常直接以字段键命名，不要默认加 `name: 'digit'` 这类旧写法。
- 当前仓库内置节点分组至少有 `control` `calculation` `collection` `manual` `extended`；若需要自定义分组，先在 client 插件里 `registerInstructionGroup()`。
- 文档里的 `JOB_STATUS.RESOVLED` 是旧拼写；当前仓库常量是 `JOB_STATUS.RESOLVED`。

## 服务端实现

- 继承 `@nocobase/plugin-workflow` 的 `Instruction`。
- `run(node, input, processor)` 是必实现项；普通节点默认返回带 `status` 的对象，成功场景优先用 `JOB_STATUS.RESOLVED`。
- 配置中包含变量模板时，优先先解析再执行副作用，例如 `processor.getParsedValue(node.config, node.id)`。
- 需要供下游节点使用的数据放进返回值的 `result`；需要更细控制时，用 `processor.saveJob()` 保存并返回 job。
- 业务可预期失败优先返回 `FAILED` `ERROR` `REJECTED` 等明确状态；不要把所有异常都留给未捕获异常兜底。
- 外部异步回调场景返回 `JOB_STATUS.PENDING` 时，必须实现 `resume()`；必要时先 `processor.saveJob()`，再由外部事件调用 `this.workflow.resume(job)` 恢复。
- 只有流程控制类节点才考虑返回 `null` 提前退出；这通常意味着分支调度或父子流程切换，必须参考官方样例并补充分支测试。
- 需要支持抽屉里的“Test run”时，再实现 `test(config)`；客户端只有同时声明 `testable = true` 才会展示该入口。

最小骨架：

```ts
import WorkflowPluginServer, { Instruction, JOB_STATUS } from '@nocobase/plugin-workflow';

export class RandomStringInstruction extends Instruction {
  run(node, input, processor) {
    const config = processor.getParsedValue(node.config, node.id) as { digit?: number };
    const digit = config.digit ?? 6;
    const result = `${Math.round(10 ** digit * Math.random())}`.padStart(digit, '0');

    return {
      status: JOB_STATUS.RESOLVED,
      result,
    };
  }
}

async load() {
  const workflow = this.app.pm.get('workflow') as WorkflowPluginServer;
  workflow.registerInstruction('random-string', RandomStringInstruction);
}
```

异步骨架：

```ts
import { Instruction, JOB_STATUS } from '@nocobase/plugin-workflow';

export class AsyncInstruction extends Instruction {
  async run(node, input, processor) {
    const job = await processor.saveJob({
      status: JOB_STATUS.PENDING,
      nodeId: node.id,
      nodeKey: node.key,
    });

    externalService.call(node.config, async (result) => {
      const savedJob = await this.workflow.app.db.getRepository('jobs').findOne({
        filterByTk: job.id,
      });
      savedJob.set({ status: JOB_STATUS.RESOLVED, result });
      await this.workflow.resume(savedJob);
    });

    return job;
  }

  async resume(node, job) {
    return job;
  }
}
```

## 客户端实现

- 继承 `@nocobase/plugin-workflow/client` 的 `Instruction`。
- 最小提供 `title` `type` `group` `fieldset`；常见可选项包括 `description` `icon` `components` `scope` `useVariables` `useInitializers` `getCreateModelMenuItem` `isAvailable` `testable`。
- `type` 应与 `registerInstruction()` 的字符串一致；`group` 优先复用已有分组，只有确有必要时再注册新分组。
- `fieldset` 面向 `node.config`；一般直接写字段键，不要默认加 `name`。
- 需要让节点结果供后续节点选择时，实现 `useVariables()`；第一层必须是节点本身，复杂对象再用 `children` 继续展开。
- 需要在节点配置抽屉里开放测试运行按钮时，设置 `testable = true`，并确保服务端已有 `test(config)`。
- 需要限制节点使用位置时，再实现 `isAvailable()`；例如禁用同步工作流、限制某些上游节点或分支内不可见。
- 需要在 2.0 Flow 模型中直接创建结果卡片或值块时，再实现 `useInitializers()` / `getCreateModelMenuItem()`。

最小骨架：

```tsx
import WorkflowPluginClient, { Instruction } from '@nocobase/plugin-workflow/client';

export class RandomStringInstruction extends Instruction {
  title = 'Random number string';
  type = 'random-string';
  group = 'extended';
  fieldset = {
    digit: {
      type: 'number',
      title: 'Digit',
      'x-decorator': 'FormItem',
      'x-component': 'InputNumber',
      'x-component-props': {
        min: 1,
        max: 10,
      },
      default: 6,
    },
  };

  useVariables({ key, title }) {
    return {
      value: key,
      label: title,
    };
  }
}

async load() {
  const workflow = this.app.pm.get('workflow') as WorkflowPluginClient;
  workflow.registerInstruction('random-string', RandomStringInstruction);
}
```

## 结果变量规则

- `useVariables()` 第一层必须是当前节点自己：`value = node.key`，`label = node.title`。
- 复杂对象结构通过 `children` 继续展开；`children[].value` 只写当前层的相对 key，例如 `data`、`responsePayload`，不要手工拼成 `${key}.data`、`${key}.data.responsePayload`。变量选择器会基于父节点路径自动拼接完整路径。
- `children[].label` 默认不会再走一次 `compile()`；如果要支持多语言，不要直接写 `{{t(...)}}` 模板字符串，改为先在 `useVariables()` 内用 `lang()`、`useLang()` 或 `compile()` 生成最终展示文本后再返回。
- 对象数组可以继续描述子字段，但不要写数组索引；工作流变量系统会在使用时自动扁平化。
- 当前仓库很多官方节点会用 `defaultFieldNames` 兼容字段名映射；如果你的节点也支持可配置字段名，优先沿用这一模式。

示例：

```tsx
useVariables({ key, title }, { fieldNames = defaultFieldNames } = {}) {
  const dataLabel = lang('接口响应信息');
  const payloadLabel = lang('响应结构');

  return {
    [fieldNames.value]: key,
    [fieldNames.label]: title,
    [fieldNames.children]: [
      {
        [fieldNames.value]: 'data',
        [fieldNames.label]: dataLabel,
        [fieldNames.children]: [
          {
            [fieldNames.value]: 'responsePayload',
            [fieldNames.label]: payloadLabel,
          },
        ],
      },
    ],
  };
}
```

## 代码模板

从零开始扩展节点时，先按 `client` / `server` 边界进入对应子目录，再复制最接近的模板并按真实插件改名和删减：

- `templates/workflow-node/server/server-basic.template.ts`：同步节点，适合“解析配置 -> 调服务/算值 -> 返回 result”。
- `templates/workflow-node/server/server-async.template.ts`：异步节点，适合 `PENDING + exit + resume()`。
- `templates/workflow-node/server/server-plugin-register.template.ts`：服务端注册节点。
- `templates/workflow-node/client/client-basic.template.tsx`：最小客户端节点，适合普通表单配置。
- `templates/workflow-node/client/client-result-variables.template.tsx`：带自定义校验、嵌套结果变量、2.0 值块初始化的客户端节点。
- `templates/workflow-node/client/client-plugin-register.template.tsx`：客户端注册节点与可选分组。

这些模板已吸收 `plugin-workflow`、`plugin-workflow-javascript`、`plugin-workflow-request`、`plugin-workflow-delay`、`plugin-workflow-variable` 与 `@yh-project/plugin-k3cloud` 的共性实现，优先把它们当起点，不要从空文件手写。

## 样例优先级

- 最小服务端样例：`packages/plugins/@nocobase/plugin-workflow-variable/src/server/VariableInstruction.ts`
- 最小客户端样例：`packages/plugins/@nocobase/plugin-workflow-variable/src/client/Instruction.tsx`
- 可测试节点样例：`packages/plugins/@nocobase/plugin-workflow-request/src/client/RequestInstruction.tsx` 与 `packages/plugins/@nocobase/plugin-workflow-request/src/server/RequestInstruction.ts`
- 结果块初始化样例：`packages/plugins/@nocobase/plugin-workflow-javascript/src/client/ScriptInstruction.tsx`
- 分支与提前退出样例：`packages/plugins/@nocobase/plugin-workflow-parallel/src/server/ParallelInstruction.ts`

## 注册与验证

- server client 两侧都在插件 `load()` 中注册，类型标识必须完全一致。
- 若需要新分组，先 `registerInstructionGroup()` 再 `registerInstruction()`。
- 至少验证四条链路：节点能被添加、配置能保存、执行后状态符合预期、结果变量能被下游节点引用。
- 若实现了 `resume()`，补外部恢复流程验证；若实现了 `testable = true`，补一次抽屉测试运行验证。
- 若实现了 `isAvailable()`，补同步/异步工作流和分支场景的可用性验证。
