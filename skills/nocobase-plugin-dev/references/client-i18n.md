# Client I18n 前端国际化

NocoBase 客户端同样使用插件级 `src/locale` 目录管理多语言文案。前端组件 模型 插件设置页和页面文案应优先通过 i18n API 获取，而不是直接硬编码。

## 语言文件目录

插件语言文件统一放在 `src/locale`：

```text
plugin-name/
└─ src
   └─ locale
      ├─ en-US.json
      └─ zh-CN.json
```

示例：

```json
{
  "Hello": "你好",
  "World": "世界",
  "Enter your name": "请输入你的名字",
  "Your name is {{name}}": "你的名字是 {{name}}"
}
```

约定：

- 文件按语言命名，例如 `zh-CN.json` `en-US.json`
- 初次新增语言文件后通常需要重启应用
- 组件和插件使用统一 key，不要复制相近但不同的文案 key

可通过接口检查词条是否生效：

```text
http://localhost:13000/api/app:getLang?locale=zh-CN
```

## 常见前端 API

### ctx.i18n

上下文中的 i18n 实例，适合在能拿到 `context` 的模型或插件逻辑里使用。

### ctx.t(text, options)

在上下文中直接翻译文本：

```ts
ctx.t('Hello', { ns: '@my-project/plugin-hello' });
```

适合：

- model / plugin / engine context 内
- 需要显式指定 namespace 的调用

### this.t()

在 `Plugin` 类方法（如 `load()` 注册设置页标题）中直接使用 `this.t()`，会自动注入当前插件包名作为 namespace：

```ts
this.t('Hello');
```

适合：

- 当前插件固定命名空间文案
- 插件类内部的提示和菜单/Tab 标题

### src/client-v2/locale.ts（v2 脚手架 helper）

v2 插件通常在 `src/client-v2/locale.ts` 中定义绑定当前插件命名空间（`[pkg.name, 'client']`）的 `useT()` 与 `tExpr()`：

```ts
// src/client-v2/locale.ts
import { tExpr as _tExpr, useFlowEngine } from '@nocobase/flow-engine';
// @ts-ignore
import pkg from '../../package.json';

export function useT() {
  const engine = useFlowEngine();
  return (str: string, options?: Record<string, any>) =>
    engine.context.t(str, { ns: [pkg.name, 'client'], ...options });
}

export function tExpr(key: string) {
  return _tExpr(key, { ns: [pkg.name, 'client'] });
}
```

### useT()

适合在 React 组件中直接使用已绑定当前插件命名空间的翻译函数（支持插值参数）：

```tsx
import { useT } from '../locale';

export default function MySettingsPage() {
  const t = useT();
  return (
    <div>
      <h2>{t('Hello')}</h2>
      <p>{t('Your name is {{name}}', { name: 'NocoBase' })}</p>
    </div>
  );
}
```

### tExpr()

适合在模块加载阶段执行的静态定义（如 `FlowModel.define()`、`registerFlow()`），生成延迟翻译表达式（如 `'{{t("My block")}}'`）。务必从插件本地 `../locale` 导入 `tExpr`，不要直接从 `@nocobase/flow-engine` 导入，否则无法匹配插件语言文件命名空间：

```ts
import { tExpr } from '../locale';

const title = tExpr('My block');
```

### `tExpr()`、`useT()` 与 `this.t()` 适用场景对照

| 方法 | 使用位置 | 说明 |
|------|------|------|
| `tExpr()` | 静态定义（`define()`、`registerFlow()` 等） | 模块加载时 i18n 尚未初始化，生成延迟翻译表达式 |
| `useT()` | React 组件内部 | 返回绑定当前插件命名空间的翻译函数 |
| `this.t()` | `Plugin` 类方法（如 `load()`） | 自动注入当前插件包名作为命名空间 |

### useTranslation(ns)

适合组件中直接使用标准翻译 hook：

```ts
const { t } = useTranslation('@my-project/plugin-hello');
return <div>{t('Hello')}</div>;
```

### withTranslation(ns)

适合 class component 或 HOC 方式注入翻译能力：

```ts
export default withTranslation('@my-project/plugin-hello')(MyComponent);
```

## 实践建议

- 用户可见文本统一进入 `src/locale`，不要把中文或英文直接写死在组件里。
- 严格区分 `this.t()`（Plugin `load()`）、`useT()`（React 组件）和 `tExpr()`（静态定义）的使用边界，混用会导致报错或翻译失效。
- 在 `FlowModel.define()` 或 `registerFlow()` 中使用 `tExpr()` 时，必须从插件本地 `locale.ts` 导入。
- 复用 React i18n 生态能力时再用 `useTranslation()` 或 `withTranslation()`。
- 服务端响应文案和 CLI 场景仍以 `i18n.md` 为准，不要把两端用法混为一谈。
