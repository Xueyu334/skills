# 默认语言与标识符分层命名规范

本文件按**业务语义、编程语言、标识符类型**提供命名规范，不绑定具体开发框架；无项目上下文时默认以 **MySQL / PostgreSQL / Oracle / 达梦 (DM) + Java + TypeScript** 为参考。
优先级遵循：`用户当次明确指定 > 项目明确约定及业务词典 > 项目已有的稳定命名习惯 > Skill 行业词库与语言规范 > 通用企业英文惯例`。既有代码中的历史遗留错误命名（如拼音、中式直译、保留字冲突）不无条件继承；无既有稳定风格时采用本规范。

---

## 1. 数据库层（MySQL / PostgreSQL / Oracle / 达梦）

### 1.1 基础格式与跨库长度上限

- 统一使用 `snake_case`（全小写字母、数字、下划线，禁止连续下划线和首尾下划线）。
- **Oracle / 达梦大小写陷阱**：DDL 中不加双引号时，未引用标识符在服务端会按大写处理，但 SQL 脚本与持久层字段映射源码中统一写小写 `snake_case`，禁止使用双引号强制混合大小写列名。
- **标识符长度上限**：不机械一刀切限制 30 字符，需根据目标数据库版本、实例参数及字节/字符限制评估：
  - MySQL：64 字符；PostgreSQL：63 字节（多字节中文或超长 ASCII 需按字节计算）；
  - Oracle：普通表名/列名上限取决于实例 **`COMPATIBLE` 参数**而非仅安装版本——`COMPATIBLE < 12.2` 时为 30 字节，`COMPATIBLE >= 12.2` 时为 128 字节；
  - 达梦 (DM)：默认 128 字节；关于“部分兼容模式下是否受 30 字节限制”，厂商公开资料暂无明确对应参数出处，**待核实**，跨库前须在目标实例实测确认。仅当目标库实例确实受 30 字节约束时按 `<= 30` 字节控制。

### 1.2 表名规范

- **单复数**：以当前项目为准；Java 企业项目默认**单数名词**（如 `sales_order`、`inspection_task`）。
- **常用表前缀（按仓库惯例选用，不硬套）**：
  - `sys_`：系统管理（用户、角色、菜单、字典、配置）
  - `biz_` 或业务域前缀：如 `fin_`（财务）、`scm_`（供应链）、`mfg_`（生产制造）、`bd_`（基础资料）、`wf_`（工作流）
  - `cfg_`：规则/模板/策略配置表
  - `rel_`：多对多关联表（如 `rel_user_role`，按主从或字母序排列）
  - `log_` / `his_`：操作日志、审计轨迹、历史快照表

### 1.3 通用审计与控制字段

若项目已有基类（如 `BaseEntity`），必须完全对齐既有字段名：

| 语义 | 推荐列名（风格 A：国内常见） | 推荐列名（风格 B：通用时间戳） | 类型参考（跨库） |
| :--- | :--- | :--- | :--- |
| 主键 | `id` | `id` | `BIGINT` / `NUMBER(20)` |
| 租户 ID | `tenant_id` | `tenant_id` | `BIGINT` / `VARCHAR(64)` |
| 创建人 | `create_by` | `created_by` | `BIGINT` / `VARCHAR(64)` |
| 创建时间 | `create_time` | `created_at` | `DATETIME` / `TIMESTAMP` |
| 更新人 | `update_by` | `updated_by` | `BIGINT` / `VARCHAR(64)` |
| 更新时间 | `update_time` | `updated_at` | `DATETIME` / `TIMESTAMP` |
| 逻辑删除（标志位） | `is_deleted` / `deleted` | `is_deleted` / `deleted` | MySQL `TINYINT(1)` / PG `BOOLEAN` / Oracle（如 19c）`NUMBER(1)` / 达梦 `BIT` 或 `NUMBER(1)`（`0` 未删 / `1` 已删） |
| 逻辑删除（时间戳） | `—` | `deleted_at` | 可空 `DATETIME` / `TIMESTAMP`（`NULL` 表示尚未删除，非空记录删除时刻） |
| 乐观锁版本 | `version` | `version` | `INT` / `NUMBER(10)` |
| 备注 | `remark` | `remark` | `VARCHAR(500)` |

### 1.4 索引与约束前缀

| 对象 | 前缀 | 格式示例 |
| :--- | :--- | :--- |
| 主键 | `pk_` | `pk_sales_order` |
| 唯一索引 | `uk_` | `uk_sales_order_order_no`（多列：`uk_tenant_user_code`） |
| 普通索引 | `idx_` | `idx_sales_order_customer_id` |
| 外键（若显式建） | `fk_` | `fk_sales_order_item_order_id` |
| 序列（Oracle/达梦） | `seq_` | `seq_sales_order_id` |

### 1.5 跨库兼容避坑

- **布尔列**：按目标数据库分别选型——MySQL 常用 `TINYINT(1)`；PostgreSQL 原生支持 `BOOLEAN`（或 `SMALLINT`）；Oracle（如 19c 数值标志）用 `NUMBER(1)`，**不要为 Oracle 生成 `TINYINT(1)`**；达梦 (DM) 可用 `BIT`、`TINYINT` 或 `NUMBER(1)`（`0` 否 / `1` 是）。DDL 避免使用关键字作列名，详见 `references/abbreviations-and-guards.md`。
- **Oracle 空串等价 NULL**：涉及非空字段（`code`、`name`、`remark`）时提醒空字符串在 Oracle 中会变为 `NULL`，避免将空串作为有业务语义的默认值。

---

## 2. Java 层

### 2.1 基础格式

- **包名**：全小写点分隔，不加下划线（如 `com.company.erp.sales.domain.entity`）。
- **类 / 接口 / 枚举 / 注解 / Record**：`PascalCase`，类名用名词或名词短语，接口不加 `I` 前缀（如 `SalesOrderService`），实现类优先 `SalesOrderServiceImpl` 或按职责具象命名（如 `LocalFileStorageService`）。
- **方法 / 变量 / 参数**：`camelCase`；方法名用**动词或动宾短语**（`createOrder`、`approveOrder`）。
- **常量（`static final`）**：`UPPER_SNAKE_CASE`（如 `MAX_RETRY_COUNT`）。

### 2.2 分层对象后缀（以项目既有后缀为准）

| 层级 / 职责 | 常见后缀 | 示例 |
| :--- | :--- | :--- |
| 数据库持久化实体 | `Entity` / `DO` / `PO` | `SalesOrderEntity`、`SalesOrderDO` |
| 业务内部领域对象 | `BO` / 无后缀领域类 | `SalesOrderBO` |
| 入参请求对象 | `DTO` / `Req` / `Cmd` / `Query` | `SalesOrderCreateReq`、`SalesOrderQuery` |
| 出参视图对象 | `VO` / `Resp` | `SalesOrderVO`、`SalesOrderDetailVO` |
| 控制器 | `Controller` | `SalesOrderController` |
| 应用/业务服务 | `Service` / `ServiceImpl` | `SalesOrderService` |
| 通用编排/防腐层 | `Manager` / `Client` / `Facade` | `InventoryLockManager` |
| 持久层 | `Mapper` / `Repository` | `SalesOrderMapper` |
| 对象转换 | `Converter` / `Assembler` | `SalesOrderConverter` |
| 定时任务 / 监听 | `Job` / `Task` / `Listener` / `Consumer` | `OrderTimeoutCloseJob` |
| 枚举 / 异常 | `Enum` / `Exception` | `OrderStatusEnum`、`OrderNotFoundException` |

### 2.3 Java 布尔字段命名与契约核对

- **通用原则**：遇到布尔字段（如 `isDeleted` / `deleted`）时，**分别确认 Java 字段名、访问器（getter/setter）名、对外 JSON 键和数据库列名**；调整已有命名时先核对既有接口与存储契约。
  - 无历史契约约束时，Java POJO / Entity / DTO / VO 中的布尔字段默认避免 `is` 前缀（如 **`Boolean deleted`**、**`Boolean enabled`**、**`Boolean defaultFlag`**）；数据库列名可保持 `is_deleted` / `is_enabled` / `is_default`。
  - 无副作用的布尔判断方法允许 `is*` / `has*` / `can*`（如 `isEditable()`、`hasStock()`、`canApprove()`）。
- **局部工具行为示例**（以下行为依赖具体工具与配置，**不推广为整门 Java 语言的通则**）：
  - **Lombok + JSON 序列化（仅在启用默认 Lombok 访问器生成且依赖访问器推导 JSON 键名时适用）**：以默认 Lombok 为例，基本类型 `boolean isDeleted` 生成 `isDeleted()`，包装类 `Boolean isDeleted` 生成 `getIsDeleted()`；在 Jackson / Fastjson 等序列化工具默认配置下，对外 JSON 键可能分别推导出 `deleted` 或 `isDeleted`。若项目已有外部 JSON 契约，须结合字段类型、实际序列化配置及 `@JsonProperty` 等显式注解核对，避免静默改键。
  - **MyBatis-Plus 列映射（仅在使用 MyBatis-Plus 且 Java 属性名与数据库列名不同时适用）**：Java 属性 `deleted` 对应既有数据库列 `is_deleted` 时，用 `@TableField("is_deleted")` 指定列名；需要逻辑删除语义时再加 `@TableLogic`（`@TableLogic` 单独负责逻辑删除，不负责列名映射；若仅加 `@TableLogic`，默认映射仍会生成引用 `deleted` 列的 SQL）。

---

## 3. TypeScript 层

- **类型 / Interface / Type / Enum**：`PascalCase`。
  - 默认遵循主流 TypeScript 惯例，Interface 不加 `I` 前缀（用 `SalesOrder`、`SalesOrderQuery`，不用 `ISalesOrder`），除非当前仓库已统一使用 `I*`。
- **变量 / 函数 / 对象属性 / 参数**：`camelCase`；全局常量可按项目惯例使用 `UPPER_SNAKE_CASE` 或 `camelCase`。
- **回调与处理函数**：事件回调属性常用 `on*`（如 `onConfirm`），内部处理函数常用 `handle*`（如 `handleSubmit`）。
- **布尔命名**：局部状态可用 `loading`、`disabled`、`visible` 或 `is*`/`has*`/`can*`；**作为接口入参/出参模型时，字段名必须与后端 JSON 契约一致**（不要擅自把接口返回的 `enabled` 改名成 `isEnabled` 后直接透传提交）。
- **模块文件名**：`kebab-case.ts`、`camelCase.ts` 或 `PascalCase.ts` 与仓库同级文件保持一致。

---

## 4. REST API、枚举与 i18n Key

### 4.1 REST API 路径与参数

- 资源路径使用**复数名词 + `kebab-case`**，避免路径中出现 `get` / `query` / `add`（除非项目采用 RPC 风格如 `/api/order/getList`，此时以项目为准）：
  - `GET /api/v1/sales-orders`（分页列表）
  - `GET /api/v1/sales-orders/{id}`（详情）
  - `POST /api/v1/sales-orders`（新建）
  - `PUT /api/v1/sales-orders/{id}`（全量更新） / `PATCH /api/v1/sales-orders/{id}`（局部更新）
  - `DELETE /api/v1/sales-orders/{id}`（删除）
- 业务状态流转动作作为资源子路径动词：
  - `POST /api/v1/sales-orders/{id}/submit`
  - `POST /api/v1/sales-orders/{id}/approve`
  - `POST /api/v1/sales-orders/{id}/reject`
  - `POST /api/v1/sales-orders/{id}/cancel`
- Query 参数：对齐项目既有接口参数风格（主流 `camelCase`，如 `?pageNum=1&pageSize=20&orderNo=SO001`，或 `snake_case`）。

### 4.2 枚举（Enum）

- **核心约束**：**对外传输值（接口/存储协议编码）保持一致，枚举成员名称与定义方式按编程语言惯例和项目风格决定**，不把 Java 的枚举结构照搬到 TypeScript 等语言。
- **同状态并排示例（以“待审批”及金蝶单据状态码 `B` 为例）**：
  - **Java**：枚举类 `PascalCase`（常带 `Enum` 后缀如 `OrderStatusEnum`），成员用 `UPPER_SNAKE_CASE`（如 `PENDING_APPROVAL`）；若数据库或协议使用数字/单字符编码（如金蝶单据状态 `A`/`B`/`C`/`D`），可由枚举持有 `code` 字段映射外部编码（如 `AUDITING("B")`）。
  - **TypeScript**：类型名用 `PascalCase`（如 `OrderStatus`），按项目风格使用字符串 `enum`（`PendingApproval = "PENDING_APPROVAL"` 或 `PENDING_APPROVAL = "PENDING_APPROVAL"`）、`as const` 对象或字符串联合类型；若外部协议为单字符/数字编码，直接将成员值设为协议编码（如 `Auditing = "B"`），无需照搬 Java 的 `code` 属性结构。
  - **C#**：枚举类型与成员均使用 `PascalCase`（如 `OrderStatus.PendingApproval`），按契约需要映射数值或序列化字符串。

### 4.3 i18n Key

- 统一使用 `camelCase` 或 `snake_case` 点分层级，推荐格式：`<domain>.<module>.<category>.<key>`
  - 字段标签：`sales.order.field.orderNo`、`sales.order.field.customerName`
  - 按钮动作：`sales.order.action.submit`、`common.action.export`
  - 状态文案：`sales.order.status.pendingApproval`
  - 校验/错误提示：`sales.order.message.customerRequired`、`sales.order.error.insufficientStock`
