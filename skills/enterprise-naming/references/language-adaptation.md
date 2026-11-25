# 多语言命名动态适配规范

当检测到目标项目并非默认的 `Java + TypeScript` 时，必须按目标语言的官方习惯与项目现有规范切换命名规则，**严禁把 Java 的 `camelCase` / `UPPER_SNAKE_CASE` 常量 / 无 `I` 接口 / 默认避免 `is` 布尔属性等规则生搬硬套到其他语言**。

---

## 1. 编程语言探测信号

在仓库中只需快速查看文件扩展名或工程配置即可确定目标编程语言：

| 探测特征 | 目标语言规则集 |
| :--- | :--- |
| `*.csproj` / `*.sln` / `*.cs` | **C#**（含金蝶云星空 C# 原生元数据边界） |
| `pom.xml` / `build.gradle` / `*.java` | **Java**（见 `layer-conventions.md`） |
| `tsconfig.json` / `*.ts` / `*.tsx` | **TypeScript**（见 `layer-conventions.md`） |
| `go.mod` / `*.go` | **Go** |
| `pyproject.toml` / `requirements.txt` / `*.py` | **Python** |
| `*.sql` / 迁移脚本 / 存储过程 | **SQL / 数据库对象** |

---

## 2. 多语言命名风格横向对比表

| 语法元素 | Java | TypeScript | **C#** | Go | Python |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **类 / 结构体 / 记录** | `PascalCase` | `PascalCase` | `PascalCase` | `PascalCase`(导出) / `camelCase`(私有) | `PascalCase` |
| **接口** | `PascalCase` (无 `I`) | `PascalCase` (通常无 `I`) | **`IPascalCase` (必须 `I` 前缀)** | `PascalCase` (常以 `-er` 结尾) | `PascalCase` (Protocol/ABC) |
| **公有方法** | `camelCase` | `camelCase` | **`PascalCase`** | `PascalCase` (导出) | `snake_case` |
| **公有属性 / 字段** | `camelCase` | `camelCase` | **`PascalCase`**（如 `CustomerCode`） | `PascalCase` (导出，如 `OrderID`) | `snake_case` |
| **私有字段** | `camelCase` | `camelCase` / `#camelCase` | **`_camelCase`** | `camelCase` | `_snake_case` |
| **局部变量 / 参数** | `camelCase` | `camelCase` | `camelCase`（如 `customerCode`） | `camelCase` | `snake_case` |
| **常量** | `UPPER_SNAKE_CASE` | `UPPER_SNAKE_CASE` / `camelCase` | **`PascalCase`** (或项目惯例) | `PascalCase` / `camelCase` (非全大写) | `UPPER_SNAKE_CASE` |
| **布尔属性** | **`deleted`** (默认避免 `is`，视序列化契约而定) | `enabled` / `isEnabled` | **`IsDeleted`** (推荐 `Is`/`Has`/`Can`) | `IsDeleted` / `Deleted` | `is_deleted` |
| **异步方法** | `createOrder` | `createOrder` | **`CreateOrderAsync`** | 无 `Async` 后缀 | `async def create_order` |

---

## 3. C# 专项规范（重点）

遵循 C# 官方命名惯例：

1. **PascalCase（大驼峰）覆盖范围广**：
   - Namespace、Class、Struct、Record、Enum、Enum 成员、Delegate、Event、Method、**Property（公有属性）**、**`const` 常量**及**对外可见（`public`/`internal`）的 `static readonly` 字段**使用 `PascalCase`。
   - 示例：`public const int MaxRetryCount = 3;`、`public static readonly TimeSpan DefaultTimeout = ...;`（**不要写成 Java 风格的 `MAX_RETRY_COUNT`**，除非目标仓库明确沿用全大写）。
   - 示例：`public string CustomerCode { get; set; }`、`public decimal TotalAmount { get; set; }`。
2. **接口与泛型**：
   - 接口必须带 `I` 前缀：`ISalesOrderService`、`IInventoryRepository`。
   - 泛型类型参数用 `T` 或 `T*`：`TEntity`、`TResult`。
3. **私有字段与局部变量**：
   - 私有实例字段：`_camelCase`（如 `private readonly ISalesOrderRepository _orderRepository;`）。
   - 方法参数与局部变量：`camelCase`（如 `orderId`、`customerCode`，与公有属性 `CustomerCode` 区分）。
   - 私有静态字段（含 `private static readonly`，如私有静态只读缓存）：按仓库字段惯例用 `s_camelCase` 或 `_camelCase`（如 `s_orderCache` / `_orderCache`），不套用公有 `PascalCase`。
4. **布尔命名（与 Java 相反）**：
   - C# 属性不会因 `Is` 前缀产生访问器与序列化键名歧义，官方与社区均推荐用 `Is*`、`Has*`、`Can*` 表达状态或能力：
     `IsEnabled`、`IsDeleted`、`HasTaxInvoice`、`CanApprove`。
5. **异步方法**：
   - 返回 `Task` / `Task<T>` / `ValueTask<T>` 的异步方法统一以 `Async` 结尾：`GetOrderByIdAsync`、`SubmitApprovalAsync`。
6. **缩写大小写**：
   - 2 字母缩写全大写（如 `IO`、`Id` 特例：C# 官方惯例用 `Id` 而非 `ID`，如 `OrderId`、`CustomerId`；对比 Go 导出字段常用 `OrderID`、Java 常用 `orderId`）。
   - 3 字母及以上缩写采用 PascalCase（`XmlParser`、`HttpClient`、`BomItem`，不用 `XMLParser`）。

### 3.1 金蝶云星空 (K3Cloud) C# 原生元数据边界

当目标项目是**金蝶云星空（K3Cloud）C# 二开或数据对接**时：

- **你自己的 C# 类、服务、局部变量、私有字段、辅助方法**：严格遵守标准 C# 规范（如 `SalesOrderValidator`、`_materialService`、`ValidateCreditLimit`）。
- **BOS 元数据标识与原生 SQL 表/字段**：**严格保持金蝶平台原生标识不变**，不得强行改成普通 C# 属性名：
  - 表名：`T_SAL_ORDER`、`T_SAL_ORDERENTRY`、`T_BD_MATERIAL`、`T_STK_INVENTORY`
  - 字段/标识：`FID`、`FEntryID`、`FBILLNO`、`FDocumentStatus`、`FForbidStatus`、`FOrgId`、`FMaterialId`、`FQty`、`FAmount`
  - 扩展自定义字段：遵循平台约定（如 `F_<Prefix>_<Code>`，以项目实际二开前缀为准）。

---

## 4. Python 规范要点（PEP 8）

- 模块 / 包名：全小写简短名或 `snake_case`（`sales_order.py`）。
- 函数 / 方法 / 变量 / 属性：`snake_case`（`create_sales_order`、`order_no`）。
- 类 / 异常 / TypedDict / 数据模型类：`PascalCase`（`SalesOrderCreateRequest`）。
- 模块级常量：`UPPER_SNAKE_CASE`（`MAX_BATCH_SIZE = 500`）。
- 私有成员：单下划线前缀 `_calculate_tax`。
- 布尔变量/字段/函数：`is_deleted`、`has_permission`、`can_submit`。

---

## 5. Go 规范要点（Effective Go）

- **可见性决定大小写**：首字母大写即导出（`PascalCase`），首字母小写为包内私有（`camelCase`）。
- **包名**：简短全小写单词，不用下划线或驼峰（`order`、`inventory`）。
- **常见缩写全大写**：与 C# 不同，Go 中 `ID`、`URL`、`HTTP`、`SQL`、`JSON`、`API` 保持全大写一致性：
  - 导出字段：`OrderID`、`CustomerID`、`CallbackURL`；非导出：`orderID`、`callbackURL`。
- **Getter 方法**：Go 不使用 `Get` 前缀（用 `OrderNo()` 而非 `GetOrderNo()`），Setter 可用 `SetOrderNo()`。
- **接口**：单方法接口常用 `-er` 后缀（`OrderSaver`、`StockLocker`）。
- **常量**：使用 `CamelCase` 或 `camelCase`（如 `StatusDraft`、`defaultTimeout`），不使用 `UPPER_SNAKE_CASE`。

---

## 6. SQL 过程对象与视图前缀

当任务涉及数据库视图、物化视图、存储过程、函数或触发器时（MySQL / PG / Oracle / 达梦）：

| 对象类型 | 推荐前缀 | 示例 |
| :--- | :--- | :--- |
| 视图 | `v_` | `v_sales_order_summary` |
| 物化视图 | `mv_` | `mv_inventory_daily_balance` |
| 存储过程 | `sp_` / `proc_` | `sp_close_expired_orders` |
| 函数 | `fn_` | `fn_calc_tax_amount` |
| 触发器 | `trg_` | `trg_sales_order_audit` |
