# Patterns From @nocobase Plugins

该文档提炼自你提供的样本仓库：
`nocobase/packages/plugins/@nocobase`（通用路径示意）

## 1) 最小骨架来自 plugin-hello

- 服务端插件类实现完整生命周期钩子
- 客户端在 `load` 中集中注册 block action field model
- `src/index.ts` 统一导出 server 入口

适用场景：

- 新建插件脚手架
- 验证生命周期顺序

## 2) 业务插件模式来自 plugin-users

- `beforeLoad` 中注册 model operator db hook action handler
- `load` 中挂载 resource 中间件与运行时事件
- ACL 使用 `allow` `addFixedParams` `registerSnippet`
- `install` 负责 root 用户等初始化写入
- migration 以类形式定义 `on` 与 `appVersion`
- 测试通过 `createMockServer` 组合依赖插件断言接口行为

适用场景：

- 用户 权限 资源类插件
- 需要审计 ACL 与初始化流程的插件

## 3) 复杂领域插件模式来自 plugin-workflow

- 插件内部维护 registry cache dispatcher processor 等域对象
- 在应用启动与停止阶段接管任务调度与清理
- 使用事件队列与日志分片管理长流程执行
- 通过 repository action trigger instruction 分层隔离复杂逻辑
- 配套大量单测 集成测试 迁移测试与基准测试

适用场景：

- 工作流 编排 调度型插件
- 高复杂度插件的模块化拆分

## 4) 建议优先级

- 第一步 总是先按 `plugin-hello` 搭结构
- 第二步 参考 `plugin-users` 补齐 ACL migration test
- 第三步 若存在调度或状态机 再引入 `plugin-workflow` 的分层模型
