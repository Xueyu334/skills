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

### plugin.t()

插件内部可直接使用：

```ts
this.plugin.t('Hello');
```

适合：

- 当前插件固定命名空间文案
- 插件类内部的提示和标题

### useT()

适合在 React 组件中封装当前插件命名空间的翻译函数：

```ts
const t = useT();
return <div>{t('Hello')}</div>;
```

### tExpr(text)

适合需要表达式或 schema 字符串场景时生成翻译表达式：

```ts
const title = tExpr('Hello');
```

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
- 当前插件内部的常规文案优先用 `plugin.t()` 或 `useT()`。
- 需要在 schema 或表达式场景中引用翻译时优先用 `tExpr()`。
- 复用 React i18n 生态能力时再用 `useTranslation()` 或 `withTranslation()`。
- 服务端响应文案和 CLI 场景仍以 `i18n.md` 为准，不要把两端用法混为一谈。
